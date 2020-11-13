import { searchApi, gamedataApi } from './Api.js'

const withoutYear = (title) => {
    if (typeof title === 'string' && title.length) {
        return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '')
    } else {
        return title
    }
}

// for disambiguation of titles, the game ID will be put in parentheses when the API does not provide yearpublished info
const extractYearFromTitle = (title) => {
    if (typeof title === 'string' && title.length) {
        let matchesDate = title.match(/(( +)\((-?)\d{1,4}\))$/)
        if (matchesDate !== null) {
            return matchesDate[0].replace(/[^0-9-]/g, "")
        } else {
            let matchesId = title.match(/(( +)\(#\d{1,6}\))$/)
            if (matchesId !== null) {
                return matchesId[0].replace(/[^#0-9-]/g, "")
            } else {
                return null
            }
        }
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

// for gamedata requests by ID, get gamedata for all games with the same title
const getGamedataForIds = async function (game_ids) {
    return await getGamedataResults(game_ids)
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
export const collectGamedataForTitles = async (cachedgametitles, game_titles) => {

    let status = {

        // intermediate data
        does_not_exist: [],               // INPUT ERROR: bad title string
        already_active: [],               // INPUT ERROR: title is already active
        games_byid_not_in_cache: {},      // input title string is actually an ID
        games_withdisambig_not_in_cache: {},  // input title string includes year disambiguation
        ambiguous_cached_games: {},       // cannot activate the game yet
        ambiguous_new_gamedata: {},       // add this new game data to cache, but cannot activate the game yet

        // final data needed
        new_gamedata_to_activate: [],     // add this new game data to cache and activate the game
        new_gamedata_to_cache: [],        // add this new game data to cache
        cached_games_to_activate: [],     // activate this game from already-cached data

    }
    let titles_to_api_lookup = []
    let get_gamedata_and_activate = []
    let get_gamedata_still_ambiguous = []


    // CHECK CACHE FOR TITLES THAT ARE IDS (for all user title strings)

    let all_cached_ids = Object.entries(cachedgametitles).map( cachedgame => parseInt(cachedgame[1].id) )
    let uncached_game_titles_that_are_numbers = [], game_titles_that_are_strings = []
    game_titles.forEach(function(title) {

        if (!isNaN(parseInt(title))) {

            // user title is actually an ID that was found in the cache 
            if (all_cached_ids.includes(parseInt(title))) {
                let cache_entry = Object.entries(cachedgametitles).filter( game =>  game[1].id===parseInt(title))[0][1]
                if (cache_entry.active) {
                    status.already_active.push(cache_entry.unambiguous_name)
                } else { 
                    status.cached_games_to_activate.push(cache_entry.unambiguous_name)
                }
            }

            // user title is an unknown number, need to convert it to a title string
            else  {
                uncached_game_titles_that_are_numbers.push(title)
            }

        } else {
            game_titles_that_are_strings.push(title)
        }

    })


    // API LOOKUP TO CONVERT ALL REMAINING IDS TO TITLES

    let uncached_game_titles_that_are_strings = []
    let gamedata_for_uncached_titles_that_are_numbers = await getGamedataForIds(uncached_game_titles_that_are_numbers)
    gamedata_for_uncached_titles_that_are_numbers.forEach(function(gamedata, idx) {
        if (gamedata.hasOwnProperty('name')) {
            let game_id = parseInt(gamedata.id)
            status.games_byid_not_in_cache[gamedata.name] = game_id
            uncached_game_titles_that_are_strings.push(gamedata.name)
        } else {
            let game_title = uncached_game_titles_that_are_numbers[idx]
            status.does_not_exist.push(game_title)
        }
    })
    game_titles_that_are_strings = [ ...game_titles_that_are_strings, ...uncached_game_titles_that_are_strings]


    // CACHE LOOKUP FOR ALL TITLES

    // build the hashmap of cached base names
    let cached_basetitle_hashmap = {}
    let cached_basetitle_hashmap_entries = Object.entries(cachedgametitles).filter(cached_title => cached_title[0] !== cached_title[1].name)
    cached_basetitle_hashmap_entries.forEach(function(entry) {
        let ambiguous_name = withoutYear(entry[0])
        let title_info = JSON.parse(JSON.stringify(entry[1]))
        if (cached_basetitle_hashmap.hasOwnProperty(ambiguous_name)) {
            cached_basetitle_hashmap[ambiguous_name].push(title_info)
        } else {
            cached_basetitle_hashmap[ambiguous_name] = [ title_info ]
        }
    })

    // lookup in the hashmap for each input name
    let all_cached_disambiguous_titles = Object.keys(cachedgametitles)
    game_titles_that_are_strings.forEach(function(user_title) {

        // user_title was found verbatim in the cache
        if (all_cached_disambiguous_titles.includes(user_title)) {
            if (cachedgametitles[user_title].active) {
                status.already_active.push(user_title)
            } else { 
                status.cached_games_to_activate.push(user_title)
            }

        // user_title with its year disambiguation removed was found in the cache
        } else if (all_cached_disambiguous_titles.includes(withoutYear(user_title))) {
            if (cachedgametitles[withoutYear(user_title)].active) {
                status.already_active.push(withoutYear(user_title))
            } else { 
                status.cached_games_to_activate.push(withoutYear(user_title))
            }

        // user_title base name is in cache, may have incorrect disambiguation
        } else if (Object.keys(cached_basetitle_hashmap).includes(withoutYear(user_title))) {
            let disambiguation = JSON.parse(JSON.stringify(cached_basetitle_hashmap[withoutYear(user_title)]))
            status.ambiguous_cached_games[withoutYear(user_title)] = disambiguation

        // user_title is not immediately known, collect title info via API
        } else {

            // disambiguation was supplied, but cannot validate it yet for uncached titles
            if (withoutYear(user_title) !== user_title) {
                status.games_withdisambig_not_in_cache[withoutYear(user_title)] = parseInt(extractYearFromTitle(user_title))
            }

            titles_to_api_lookup.push(withoutYear(user_title))
        }
    })
    // sort ambiguous cached titles by year published, for their eventual displaying
    Object.entries(status.ambiguous_cached_games).forEach(function(ambiguous_entry) {
        status.ambiguous_cached_games[ambiguous_entry[0]] = ambiguous_entry[1].sort( (a,b) => (a.year_published < b.year_published) ? -1 : 1 )
    })


    // API LOOKUP FOR VERSIONS OF ALL UNCACHED TITLES
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
    // bundle each title into one and only one status bucket 
    titles_to_api_lookup.forEach(function (user_title, idx) {

        // title exists
        if (all_potential_titles[idx].length > 0) {

            // convert to IDs for the upcoming game data API call
            all_potential_titles[idx].forEach(function (this_title_version) {
                let game_id = parseInt(this_title_version.id)
                if (all_potential_titles[idx].length === 1) {
                    get_gamedata_and_activate.push(game_id)
                } else {
                    get_gamedata_still_ambiguous.push(game_id)
                }
            })

        // title does not exist
        } else {
            status.does_not_exist.push(user_title)
        }

    })


    // API RETRIEVAL OF GAME DATA FOR ALL TITLE VERSIONS

    let ids_for_gamedata_api = [ ...get_gamedata_and_activate, ...get_gamedata_still_ambiguous ]
    let all_new_gamedata = await getGamedataResults(ids_for_gamedata_api)
    all_new_gamedata.forEach(function (this_gamedata) {
        let new_gamedata = JSON.parse(JSON.stringify(this_gamedata))

        // collect game data for titles to activate
        if (get_gamedata_and_activate.includes(this_gamedata.id)) {
            new_gamedata['unambiguous_name'] = this_gamedata.name
            status.new_gamedata_to_activate[this_gamedata.name] = new_gamedata

        // collect game data for other titles
        } else if (get_gamedata_still_ambiguous.includes(this_gamedata.id)) {
            new_gamedata['unambiguous_name'] = this_gamedata.name + ' (' + this_gamedata.year_published + ')'

            // if user supplied a game ID originally, but its title was ambiguous, apply that disambiguation
            if (status.games_byid_not_in_cache.hasOwnProperty(this_gamedata.name)) {
                if (status.games_byid_not_in_cache[this_gamedata.name] === this_gamedata.id) {
                    status.new_gamedata_to_activate.push(new_gamedata)
                } else {
                    status.new_gamedata_to_cache.push(new_gamedata)
                }

            // if user supplied year disambiguation originally, but its title was ambiguous, apply that disambiguation
            } else if (status.games_withdisambig_not_in_cache.hasOwnProperty(this_gamedata.name)) {
                let target_year = status.games_withdisambig_not_in_cache[this_gamedata.name]
                let gamedata_for_target_year = all_new_gamedata.filter( my_title_gamedata => my_title_gamedata.year_published === target_year )
                // the given year does exist in the gamedata
                if (gamedata_for_target_year.length === 1) {
                    if (status.games_withdisambig_not_in_cache[this_gamedata.name] === this_gamedata.year_published) {
                        status.new_gamedata_to_activate.push(new_gamedata)
                    } else {
                        status.new_gamedata_to_cache.push(new_gamedata)
                    }
                // the given year is bogus 
                } else {
                    if (status.ambiguous_new_gamedata.hasOwnProperty(this_gamedata.name)) {
                        status.ambiguous_new_gamedata[this_gamedata.name].push(new_gamedata)
                    } else {
                        let ambiguous_new_gamedata_bundle = []
                        ambiguous_new_gamedata_bundle.push(new_gamedata) 
                        status.ambiguous_new_gamedata[this_gamedata.name] = ambiguous_new_gamedata_bundle
                    }
                }

            // if user supplied an ambiguous title originally, game data remains ambiguous for now
            } else {
                if (status.ambiguous_new_gamedata.hasOwnProperty(this_gamedata.name)) {
                    status.ambiguous_new_gamedata[this_gamedata.name].push(new_gamedata)
                } else {
                    let ambiguous_new_gamedata_bundle = []
                    ambiguous_new_gamedata_bundle.push(new_gamedata) 
                    status.ambiguous_new_gamedata[this_gamedata.name] = ambiguous_new_gamedata_bundle
                }
            }
        }

    })
    Object.entries(status.ambiguous_new_gamedata).forEach(function(ambiguous_entry) {
        status.ambiguous_new_gamedata[ambiguous_entry[0]] = ambiguous_entry[1].sort( (a,b) => (a.year_published < b.year_published) ? -1 : 1 )
    })

    return status

}

export const validateUserTitles = async (cached_titles, user_titles) => { 

    const displayNameForMessages = function (title) {
        let all_cached_ids = Object.entries(cached_titles).map( cachedgame => parseInt(cachedgame[1].id) )
        if (all_cached_ids.includes(parseInt(title))) {
            let unambiguous_name = Object.values(cached_titles).filter( cachedgame => cachedgame.id === parseInt(title) )[0].unambiguous_name
            return '[#' + title + '] ' + unambiguous_name
        } else {
            return title
        }
    }

    let validation_result = {}, keep_modal_open = false
    let collection_result = await collectGamedataForTitles(cached_titles, user_titles)

    collection_result['selected_games_to_activate'] = []
    collection_result['ambiguous_title_count'] = Object.keys(collection_result.ambiguous_cached_games).length + Object.keys(collection_result.ambiguous_new_gamedata).length

    // Prompt the user for disambiguation
    let new_messages = []
    Object.entries(collection_result.ambiguous_cached_games).forEach(function(ambiguous_cached_title_info) {
        let ambiguous_cachedids_arr = JSON.parse(JSON.stringify(ambiguous_cached_title_info[1]))
        new_messages.push({ message_str: 'Which version of "'+ ambiguous_cached_title_info[0] + '"? ', ambiguous: ambiguous_cachedids_arr })
        keep_modal_open = true
    })
    Object.entries(collection_result.ambiguous_new_gamedata).forEach(function(ambiguous_title_info) {
        // it was tagged as "ambiguous", but this title has user-supplied ID for disambiguation
        if (collection_result.games_byid_not_in_cache.hasOwnProperty(ambiguous_title_info[0])) {
            if (collection_result.games_byid_not_in_cache[ambiguous_title_info[0]] === ambiguous_title_info[1].id) {
                collection_result.selected_games_to_activate.push(ambiguous_title_info[1].unambiguous_name)
            }
        // this title was a user-supplied name string and still requires user disambiguation
        } else {
            let ambiguous_gamedata_arr = JSON.parse(JSON.stringify(ambiguous_title_info[1]))
            new_messages.push({ message_str: 'Which version of "'+ ambiguous_title_info[0] + '"? ', ambiguous: ambiguous_gamedata_arr })
            keep_modal_open = true
        }
    })

    collection_result['routed_games_treatment'] = 'none'
    validation_result['gameValidations'] = collection_result

    // Prepend the game title with the game ID, when the ID was supplied by the user
    let game_id_txt = ''

    // Inform the user of all other games that could not be added
    let title_count_already_active = 0, title_names_already_active = '', append_titles_alreadyactive = []
    for (let active_title of collection_result.already_active) {
        title_count_already_active += 1
        if (collection_result.games_byid_not_in_cache.hasOwnProperty(active_title)) {
            game_id_txt = '[#' + collection_result.games_byid_not_in_cache[active_title] + '] '
        } else {
            game_id_txt = ''
        }
        append_titles_alreadyactive.push(game_id_txt + displayNameForMessages(active_title))
        if (title_names_already_active !== '') {
            title_names_already_active += ', ' + game_id_txt + displayNameForMessages(active_title)
        } else {
            title_names_already_active += game_id_txt + displayNameForMessages(active_title)
        }
        keep_modal_open = true
    }
    if (title_count_already_active > 0) {
        let message_txt, prepend_titles_alreadyactive
        if (title_count_already_active === 1) {
            prepend_titles_alreadyactive = [...append_titles_alreadyactive]
            append_titles_alreadyactive = []
            message_txt = 'ERROR: ' + title_count_already_active + ' title is already active'
        } else {
            prepend_titles_alreadyactive = []
            message_txt = 'ERROR: ' + title_count_already_active + ' titles are already active'
        }
        new_messages.push({ 
          message_str: message_txt,
          prepend_titles: prepend_titles_alreadyactive,
          append_titles: append_titles_alreadyactive
        })
        keep_modal_open = true
    }
    let title_count_does_not_exist = 0, title_names_does_not_exist = '', append_titles_doesnotexist = []
    for (let nonexistent_title of collection_result.does_not_exist) {
        title_count_does_not_exist += 1
        append_titles_doesnotexist.push(nonexistent_title)
        if (title_names_does_not_exist !== '') {
            title_names_does_not_exist += ', ' + nonexistent_title
        } else {
            title_names_does_not_exist += nonexistent_title
        }
        keep_modal_open = true
    }
    if (title_count_does_not_exist > 0) {
        let message_txt, prepend_titles_doesnotexist
        if (title_count_does_not_exist === 1) {
            prepend_titles_doesnotexist = [...append_titles_doesnotexist]
            append_titles_doesnotexist = []
            message_txt = 'ERROR: ' + title_count_does_not_exist + ' title does not exist'
        } else {
            prepend_titles_doesnotexist = []
            message_txt = 'ERROR: ' + title_count_does_not_exist + ' titles do not exist'
        }
        new_messages.push({ 
          message_str: message_txt,
          prepend_titles: prepend_titles_doesnotexist,
          append_titles: append_titles_doesnotexist
        })
    }

    // Inform the user of all other games that will be added
    let title_count_to_add = 0, title_names_to_add = '', append_titles_toadd = []
    for (let inactive_title of collection_result.cached_games_to_activate) {
        title_count_to_add += 1
        if (collection_result.games_byid_not_in_cache.hasOwnProperty(inactive_title)) {
            game_id_txt = '[#' + collection_result.games_byid_not_in_cache[inactive_title] + '] '
        } else {
            game_id_txt = ''
        }
        append_titles_toadd.push(game_id_txt + displayNameForMessages(inactive_title))
        if (title_names_to_add !== '') {
            title_names_to_add += ', ' + game_id_txt + displayNameForMessages(inactive_title)
        } else {
            title_names_to_add += game_id_txt + displayNameForMessages(inactive_title)
        }
    }
    for (let unambiguous_new_title of Object.keys(collection_result.new_gamedata_to_activate)) {
        title_count_to_add += 1
        if (collection_result.games_byid_not_in_cache.hasOwnProperty(unambiguous_new_title)) {
            game_id_txt = '[#' + collection_result.games_byid_not_in_cache[unambiguous_new_title] + '] '
        } else {
            game_id_txt = ''
        }
        append_titles_toadd.push(game_id_txt + displayNameForMessages(unambiguous_new_title))
        if (title_names_to_add !== '') {
            title_names_to_add += ', ' + game_id_txt + displayNameForMessages(unambiguous_new_title)
        } else {
            title_names_to_add += game_id_txt + displayNameForMessages(unambiguous_new_title)
        }
    }
    if (title_count_to_add > 0) {
        let message_txt, prepend_titles_toadd
        let other_txt = ( (Object.keys(collection_result.ambiguous_cached_games).length > 0) 
                            || (Object.keys(collection_result.ambiguous_new_gamedata).length > 0) 
                            || (collection_result.does_not_exist.length > 0)
                            || (collection_result.already_active.length > 0) )
                            ? ' other' : ''
        if (title_count_to_add === 1) {
            prepend_titles_toadd = [...append_titles_toadd]
            append_titles_toadd = []
            message_txt = 'ERROR: ' + title_count_to_add + other_txt + ' title does not exist'

        } else {
            prepend_titles_toadd = []
            message_txt = 'ERROR: ' + title_count_to_add + other_txt + ' titles do not exist'
        }
        new_messages.push({ 
          message_str: message_txt,
          prepend_titles: prepend_titles_toadd,
          append_titles: append_titles_toadd
        })
    }
    validation_result['messages'] = new_messages
    validation_result['keep_modal_open'] = keep_modal_open

    return validation_result
}
