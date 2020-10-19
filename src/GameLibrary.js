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

// This is a helper function for the data collection needed to add games to the library/cache, given 
// the numerous formats accepted for the user to add a game and potentially incomplete user input.
//
// LIBRARY UPDATE: All unique games that match each user-supplied title are added to the library.
// This minimizes the input processing complexity and the future API calls that are needed just for
// disambiguation.
//
// ACTIVE GAMES LIST UPDATE: The active games list is only updated if every user-supplied game exists,
// was unambiguous, and was not already active. If not, disambiguation information will be returned 
// that the calling function can use to re-form the titles for a subsequent call to this function.
// In this way, this helper function is checking active status for the caller in the same "pass" 
// that it is checking APIs for title validity. 
export const makeGamesActive = async (cachedgametitles, game_titles) => {

    let status = {
        not_found: [],
        already_active: [],
        readytoadd_cachedtitle: [],      // just activate the game from already-cached data
        readytoadd_newtitle: [],         // add this new game data to cache and activate the game
        readytoadd_newcachedtitle: [],   // add this new game data to cache
        made_active: [],
        disambiguation_info: {},
    }
    let titles_to_api_lookup = []

    // CACHE LOOKUP, for all user titles
    let all_cached_disambiguous_titles = Object.keys(cachedgametitles)
    let all_cached_ids = Object.entries(cachedgametitles).map( cachedgame => parseInt(cachedgame[1].id) )
    game_titles.forEach(function(user_title) {

        // user_title was found verbatim in the cache
        if (all_cached_disambiguous_titles.includes(user_title)) {
            if (cachedgametitles[user_title].active) {
                status.already_active.push(user_title)
            } else { 
                status.readytoadd_cachedtitle.push(user_title)
            }

        // user_title without the year disambiguation was found in the cache
        } else if (all_cached_disambiguous_titles.includes(withoutYear(user_title))) {
            if (cachedgametitles[withoutYear(user_title)].active) {
                status.already_active.push(withoutYear(user_title))
            } else { 
                status.readytoadd_cachedtitle.push(withoutYear(user_title))
            }

        // user_title is actually an ID that was found in the cache 
        } else if (all_cached_ids.includes(parseInt(user_title))) {
            if (Object.entries(cachedgametitles).filter( cachedgame => cachedgame[1].id === parseInt(user_title) )[0][1].active) {
                status.already_active.push(user_title)
            } else { 
                status.readytoadd_cachedtitle.push(user_title)
            }

        // user_title is not immediately known, collect title info via API
        } else {
            titles_to_api_lookup.push(user_title)
        }
    })

    // API LOOKUP FOR TITLE INFO, for user titles that were not found in the cache
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
    //   (not_found, already_active, readytoadd_cachedtitle, made_active, disambiguation_info)
    titles_to_api_lookup.forEach(function (user_title, idx) {

        // title exists
        if (all_potential_titles[idx].length > 0) {

            // multiple titles exists, so prepare disambiguation to return to the user
            if (all_potential_titles[idx].length > 1) {
                let new_disambiguation = JSON.parse(JSON.stringify(all_potential_titles[idx]))
                status.disambiguation_info[user_title] = new_disambiguation
            }

            // convert to IDs for the game data API
            all_potential_titles[idx].forEach(function (one_title_version) {
                let game_id = parseInt(one_title_version.id)
                if (all_cached_ids.includes(game_id)) {
                    status.readytoadd_newtitle.push(game_id)
                } else {
                    status.readytoadd_newcachedtitle.push(game_id)
                }
            })

        // title does not exist
        } else {
            status.not_found.push(user_title)
        }

    })

    // API RETRIEVAL OF GAME DATA, for all uncached user titles
    let ids_for_gamedata_api = [ ...status.readytoadd_newtitle, ...status.readytoadd_newcachedtitle ]
    let all_new_gamedata = await getGamedataResults(ids_for_gamedata_api)
    status['new_gamedata'] = all_new_gamedata

    return status

}