import { searchApi, gamedataApi } from './Api.js'

const withoutYear = (title) => {
    if (typeof title === 'string' && title.length) {
        return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '')
    } else {
        return title
    }
}

const getNonexactSearchResults = async function (titles) {
    const titleData = await Promise.all(
        titles.map( function(gameTitle) {
            return (
                searchApi(withoutYear(gameTitle)) // query the API without the disambiguation
    )}))
    return titleData
}

const getGamedataResults = async function (game_ids) {
    const gamedata = await Promise.all(
        game_ids.map( function(game_id) {
            return (
                gamedataApi(game_id) // query the API with the BGG game ID
    )}))
    return gamedata
}

// This is a helper function for the data collection needed to check and to add games to the 
// library/cache. It will do the following:
//
//   - VERIFY TITLE EXISTENCE (API)
//   - VERIFY TITLE PRESENCE IN CACHE
//   - VERIFY TITLE ACTIVE STATUS
//   - COLLECT GAME DATA FOR UNCACHED TITLES (API)
//
// This function does not update either the library/cache or the active games list, so that these
// operations can be coordinated by the calling function instead. This is necessary since many of
// the titles in this function's input list may not be ready to be added because the numerous
// accepted user input formats and multiple games having the same title can lead to ambiguity in
// which games the user really wants to make active. 
export const makeGamesActive = async (cachedgametitles, game_titles) => {

    let status = {
        does_not_exist: [],         // INPUT ERROR: bad title string
        cached_active: [],          // INPUT ERROR: title is already active
        cached_inactive: [],        // activate this game from already-cached data
        ambiguous_cached: {},       // cannot activate the game yet
        unambiguous_gamedata: {},   // add this new game data to cache and activate the game
        ambiguous_gamedata: {},     // add this new game data to cache, but cannot activate the game yet
    }
    let titles_to_api_lookup = []
    let unambiguous_ids = []
    let ambiguous_ids = []

    // CACHE LOOKUP (for all user titles)
    let all_cached_disambiguous_titles = Object.keys(cachedgametitles)
    let all_cached_ambiguous_titles_entries = Object.entries(cachedgametitles).filter(cached_title => cached_title[0] !== cached_title[1].name)
    let all_cached_ambiguous_titles = {}
    all_cached_ambiguous_titles_entries.forEach(function(entry) {
        let ambiguous_name = withoutYear(entry[0])
        let title_info = JSON.parse(JSON.stringify(entry[1]))
        if (all_cached_ambiguous_titles.hasOwnProperty(ambiguous_name)) {
            all_cached_ambiguous_titles[ambiguous_name].push(title_info)
        } else {
            all_cached_ambiguous_titles[ambiguous_name] = [ title_info ]
        }
    })
    let all_cached_ids = Object.entries(cachedgametitles).map( cachedgame => parseInt(cachedgame[1].id) )
    game_titles.forEach(function(user_title) {

        // user_title was found verbatim in the cache
        if (all_cached_disambiguous_titles.includes(user_title)) {
            if (cachedgametitles[user_title].active) {
                status.cached_active.push(user_title)
            } else { 
                status.cached_inactive.push(user_title)
            }

        // user_title with year disambiguation added was found in the cache
        } else if (all_cached_ambiguous_titles.hasOwnProperty(user_title)) {
            let disambiguation = JSON.parse(JSON.stringify(all_cached_ambiguous_titles[user_title]))
            status.ambiguous_cached[user_title] = disambiguation

        // user_title with year disambiguation removed was found in the cache
        } else if (all_cached_disambiguous_titles.includes(withoutYear(user_title))) {
            if (cachedgametitles[withoutYear(user_title)].active) {
                status.cached_active.push(withoutYear(user_title))
            } else { 
                status.cached_inactive.push(withoutYear(user_title))
            }

        // user_title is actually an ID that was found in the cache 
        } else if (all_cached_ids.includes(parseInt(user_title))) {
            console.log('cachedgametitles:',cachedgametitles)
            let gamedata = Object.values(cachedgametitles).filter( cachedgame => cachedgame.id === parseInt(user_title) )[0]
            let unambiguous_name = gamedata.unambiguous_name
            if (gamedata.active) {
                status.cached_active.push(unambiguous_name)
            } else { 
                status.cached_inactive.push(unambiguous_name)
            }

        // user_title is not immediately known, collect title info via API
        } else {
            titles_to_api_lookup.push(user_title)
        }
    })
    // sort ambiguous cached titles by year published, for their eventual displaying
    Object.entries(status.ambiguous_cached).forEach(function(ambiguous_entry) {
        status.ambiguous_cached[ambiguous_entry[0]] = ambiguous_entry[1].sort( (a,b) => (a.year_published < b.year_published) ? -1 : 1 )
    })

    // API LOOKUP FOR TITLE INFO (for user titles that were not found in the cache)
    //   example disambiguation generated in "all_potential_titles" variable:
    //     [ [{id: 2411, name:'Mount Everest', year_published: 1980},
    //     {id: 147624, name:'Mount Everest', year_published: 2013}] ]
    let all_potential_titles = await getNonexactSearchResults(titles_to_api_lookup)
    all_potential_titles.forEach(function (all_results_for_title, idx) {
        let all_versions_of_this_title = []
        all_results_for_title.forEach(function (one_similar_result) {
            let new_disambiguation
            if (one_similar_result.name === titles_to_api_lookup[idx]) {
                new_disambiguation = JSON.parse(JSON.stringify(one_similar_result))
                all_versions_of_this_title.push(new_disambiguation)
            }
        })
        all_potential_titles[idx] = all_versions_of_this_title
    })

    // BUNDLE EACH TITLE INTO ONE AND ONLY ONE STATUS BUCKET 
    titles_to_api_lookup.forEach(function (user_title, idx) {

        // title exists
        if (all_potential_titles[idx].length > 0) {

            // convert to IDs for the game data API
            all_potential_titles[idx].forEach(function (this_title_version) {
                let game_id = parseInt(this_title_version.id)
                if (all_potential_titles[idx].length === 1) {
                    unambiguous_ids.push(game_id)
                } else {
                    ambiguous_ids.push(game_id)
                }
            })

        // title does not exist
        } else {
            status.does_not_exist.push(user_title)
        }

    })

    // API RETRIEVAL OF GAME DATA (for all uncached user titles)
    let ids_for_gamedata_api = [ ...unambiguous_ids, ...ambiguous_ids ]
    let all_new_gamedata = await getGamedataResults(ids_for_gamedata_api)
    all_new_gamedata.forEach(function (this_gamedata) {
        let new_gamedata = JSON.parse(JSON.stringify(this_gamedata))

        // collect game data for unambiguous titles separately
        if (unambiguous_ids.includes(this_gamedata.id)) {
            new_gamedata['unambiguous_name'] = this_gamedata.name
            status.unambiguous_gamedata[this_gamedata.name] = new_gamedata

        // collect game data for ambiguous titles separately
        } else if (ambiguous_ids.includes(this_gamedata.id)) {
            new_gamedata['unambiguous_name'] = this_gamedata.name + ' (' + this_gamedata.year_published + ')'
            if (status.ambiguous_gamedata.hasOwnProperty(this_gamedata.name)) {
                status.ambiguous_gamedata[this_gamedata.name].push(new_gamedata)
            } else {
                let new_ambiguous_gamedata_bundle = []
                new_ambiguous_gamedata_bundle.push(new_gamedata) 
                status.ambiguous_gamedata[this_gamedata.name] = new_ambiguous_gamedata_bundle
            }
        }

    })
    // sort ambiguous titles by year published, for their eventual displaying
    Object.entries(status.ambiguous_gamedata).forEach(function(ambiguous_entry) {
        status.ambiguous_gamedata[ambiguous_entry[0]] = ambiguous_entry[1].sort( (a,b) => (a.year_published < b.year_published) ? -1 : 1 )
    })

    return status

}