import { searchApi, gamedataApi } from './Api.js'

const withoutYear = (title) => {
    if (typeof title === 'string' && title.length) {
        return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '')
    } else {
        return title
    }
}

// for disambiguation of titles, the game ID will be put in parentheses when the API does not provide yearPublished info
const extractYearFromTitle = (title) => {
    if (typeof title === 'string' && title.length) {
        const matchesDate = title.match(/(( +)\((-?)\d{1,4}\))$/)
        if (matchesDate !== null) {
            return matchesDate[0].replace(/[^0-9-]/g, "")
        } else {
            const matchesId = title.match(/(( +)\(#\d{1,6}\))$/)
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
        game_ids.map( function(gameId) {
            return (
                gamedataApi(gameId) // query the API with the BGG game ID
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
export const collectGamedataForTitles = async (cachedGameTitles, game_titles) => {

    const status = {

        // intermediate data
        does_not_exist: [],               // INPUT ERROR: bad title string
        already_active: [],               // INPUT ERROR: title is already active
        games_byid_not_in_cache: {},      // input title string is actually an ID
        games_byid_dict: {},              // mapping of all input IDs to titles
        games_withdisambig_not_in_cache: {},  // input title string includes year disambiguation
        ambiguous_cached_games: {},       // cannot activate the game yet
        ambiguousNewGamedata: {},       // add this new game data to cache, but cannot activate the game yet

        // final data needed
        newGamedataToActivate: [],     // add this new game data to cache and activate the game
        newGamedataToCache: [],        // add this new game data to cache
        cachedGamesToActivate: [],     // activate this game from already-cached data

    }
    let titles_to_api_lookup = []
    let get_gamedata_and_activate = []
    let get_gamedata_still_ambiguous = []


    // CHECK CACHE FOR TITLES THAT ARE IDS (for all user title strings)

    const all_cached_ids = Object.entries(cachedGameTitles).map( cachedgame => parseInt(cachedgame[1].id) )
    let uncached_game_titles_that_are_numbers = [], game_titles_that_are_strings = []
    game_titles.forEach(function(title) {

        if (!isNaN(Number(title))) {

            // user title is actually an ID that was found in the cache 
            if (all_cached_ids.includes(parseInt(title))) {
                let cache_entry = Object.entries(cachedGameTitles).filter( game =>  game[1].id===parseInt(title))[0][1]
                status.games_byid_dict[cache_entry.unambiguousName] = cache_entry.id
                if (cache_entry.active) {
                    status.already_active.push(cache_entry.unambiguousName)
                } else { 
                    status.cachedGamesToActivate.push(cache_entry.unambiguousName)
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
            const gameId = parseInt(gamedata.id)
            status.games_byid_not_in_cache[gamedata.name] = gameId
            uncached_game_titles_that_are_strings.push(gamedata.name)
        } else {
            const game_title = uncached_game_titles_that_are_numbers[idx]
            status.does_not_exist.push(game_title)
        }
    })
    game_titles_that_are_strings = [ ...game_titles_that_are_strings, ...uncached_game_titles_that_are_strings]


    // CACHE LOOKUP FOR ALL TITLES

    // build the hashmap of cached base names
    let cached_basetitle_hashmap = {}
    let cached_basetitle_hashmap_entries = Object.entries(cachedGameTitles).filter(cached_title => cached_title[0] !== cached_title[1].name)
    cached_basetitle_hashmap_entries.forEach(function(entry) {
        const ambiguous_name = withoutYear(entry[0])
        const title_info = JSON.parse(JSON.stringify(entry[1]))
        if (cached_basetitle_hashmap.hasOwnProperty(ambiguous_name)) {
            cached_basetitle_hashmap[ambiguous_name].push(title_info)
        } else {
            cached_basetitle_hashmap[ambiguous_name] = [ title_info ]
        }
    })

    // lookup in the hashmap for each input name
    const all_cached_disambiguous_titles = Object.keys(cachedGameTitles)
    game_titles_that_are_strings.forEach(function(user_title) {

        // user_title was found verbatim in the cache
        if (all_cached_disambiguous_titles.includes(user_title)) {
            if (cachedGameTitles[user_title].active) {
                status.already_active.push(user_title)
            } else { 
                status.cachedGamesToActivate.push(user_title)
            }

        // user_title with its year disambiguation removed was found in the cache
        } else if (all_cached_disambiguous_titles.includes(withoutYear(user_title))) {
            if (cachedGameTitles[withoutYear(user_title)].active) {
                status.already_active.push(withoutYear(user_title))
            } else { 
                status.cachedGamesToActivate.push(withoutYear(user_title))
            }

        // user_title base name is in cache, may have incorrect disambiguation
        } else if (Object.keys(cached_basetitle_hashmap).includes(withoutYear(user_title))) {
            const disambiguation = JSON.parse(JSON.stringify(cached_basetitle_hashmap[withoutYear(user_title)]))
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
        status.ambiguous_cached_games[ambiguous_entry[0]] = ambiguous_entry[1].sort( (a,b) => (a.yearPublished < b.yearPublished) ? -1 : 1 )
    })


    // API LOOKUP FOR VERSIONS OF ALL UNCACHED TITLES
    //   example disambiguation generated in "all_potential_titles" variable:
    //     [ [{id: 2411, name:'Mount Everest', yearPublished: 1980},
    //     {id: 147624, name:'Mount Everest', yearPublished: 2013}] ]
    const all_potential_titles = await getNonexactSearchResults(titles_to_api_lookup)
    all_potential_titles.forEach(function (all_results_for_title, idx) {
        let all_versions_of_this_title = []
        all_results_for_title.forEach(function (one_similar_result) {
            let new_disambiguation
            if (one_similar_result.name.toLowerCase() === titles_to_api_lookup[idx].toLowerCase()) {
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
                const gameId = parseInt(this_title_version.id)
                if (all_potential_titles[idx].length === 1) {
                    get_gamedata_and_activate.push(gameId)
                } else {
                    get_gamedata_still_ambiguous.push(gameId)
                }
            })

        // title does not exist
        } else {
            status.does_not_exist.push(user_title)
        }

    })


    // API RETRIEVAL OF GAME DATA FOR ALL TITLE VERSIONS

    const ids_for_gamedata_api = [ ...get_gamedata_and_activate, ...get_gamedata_still_ambiguous ]
    const all_new_gamedata = await getGamedataResults(ids_for_gamedata_api)
    all_new_gamedata.forEach(function (this_gamedata) {
        let newGamedata = JSON.parse(JSON.stringify(this_gamedata))

        // collect game data for titles to activate
        if (get_gamedata_and_activate.includes(this_gamedata.id)) {
            newGamedata['unambiguousName'] = this_gamedata.name
            status.newGamedataToActivate[this_gamedata.name] = newGamedata

        // collect game data for other titles
        } else if (get_gamedata_still_ambiguous.includes(this_gamedata.id)) {
            const unambiguousName = `${this_gamedata.name} (${this_gamedata.yearPublished})`
            newGamedata['unambiguousName'] = unambiguousName

            // if user supplied a game ID originally, but its title was ambiguous, apply that disambiguation
            if (status.games_byid_not_in_cache.hasOwnProperty(this_gamedata.name)) {
                if (status.games_byid_not_in_cache[this_gamedata.name] === this_gamedata.id) {
                    status.games_byid_dict[unambiguousName] = this_gamedata.id
                    status.newGamedataToActivate.push(newGamedata)
                } else {
                    status.newGamedataToCache.push(newGamedata)
                }

            // if user supplied year disambiguation originally, but its title was ambiguous, apply that disambiguation
            } else if (status.games_withdisambig_not_in_cache.hasOwnProperty(this_gamedata.name)) {
                const target_year = status.games_withdisambig_not_in_cache[this_gamedata.name]
                const gamedata_for_target_year = all_new_gamedata.filter( my_title_gamedata => my_title_gamedata.yearPublished === target_year )
                // the given year does exist in the gamedata
                if (gamedata_for_target_year.length === 1) {
                    if (status.games_withdisambig_not_in_cache[this_gamedata.name] === this_gamedata.yearPublished) {
                        status.newGamedataToActivate.push(newGamedata)
                    } else {
                        status.newGamedataToCache.push(newGamedata)
                    }
                // the given year is bogus 
                } else {
                    if (status.ambiguousNewGamedata.hasOwnProperty(this_gamedata.name)) {
                        status.ambiguousNewGamedata[this_gamedata.name].push(newGamedata)
                    } else {
                        let ambiguous_new_gamedata_bundle = []
                        ambiguous_new_gamedata_bundle.push(newGamedata) 
                        status.ambiguousNewGamedata[this_gamedata.name] = ambiguous_new_gamedata_bundle
                    }
                }

            // if user supplied an ambiguous title originally, game data remains ambiguous for now
            } else {
                if (status.ambiguousNewGamedata.hasOwnProperty(this_gamedata.name)) {
                    status.ambiguousNewGamedata[this_gamedata.name].push(newGamedata)
                } else {
                    let ambiguous_new_gamedata_bundle = []
                    ambiguous_new_gamedata_bundle.push(newGamedata) 
                    status.ambiguousNewGamedata[this_gamedata.name] = ambiguous_new_gamedata_bundle
                }
            }
        }

    })
    Object.entries(status.ambiguousNewGamedata).forEach(function(ambiguous_entry) {
        status.ambiguousNewGamedata[ambiguous_entry[0]] = ambiguous_entry[1].sort( (a,b) => (a.yearPublished < b.yearPublished) ? -1 : 1 )
    })

    return status

}

export const validateUserTitles = async (cached_titles, user_titles) => { 

    const displayNameForMessages = function (title) {
        const all_cached_ids = Object.entries(cached_titles).map( cachedgame => parseInt(cachedgame[1].id) )
        if (all_cached_ids.includes(parseInt(title))) {
            const unambiguousName = Object.values(cached_titles).filter( cachedgame => cachedgame.id === parseInt(title) )[0].unambiguousName
            return `[#${title}] ${unambiguousName}`
        } else {
            return title
        }
    }

    let validationResult = {}, keepModalOpen = false
    let collection_result = await collectGamedataForTitles(cached_titles, user_titles)

    collection_result['selectedGamesToActivate'] = []
    collection_result['ambiguousTitleCount'] = Object.keys(collection_result.ambiguous_cached_games).length + Object.keys(collection_result.ambiguousNewGamedata).length

    // Prompt the user for disambiguation
    let newMessages = []
    Object.entries(collection_result.ambiguous_cached_games).forEach(function(ambiguous_cached_title_info) {
        let ambiguous_cachedids_arr = JSON.parse(JSON.stringify(ambiguous_cached_title_info[1]))
        newMessages.push({ message_str: `Which version of "${ambiguous_cached_title_info[0]}"? `, ambiguous: ambiguous_cachedids_arr, error_flag: false })
        keepModalOpen = true
    })
    Object.entries(collection_result.ambiguousNewGamedata).forEach(function(ambiguous_title_info) {
        // it was tagged as "ambiguous", but this title has user-supplied ID for disambiguation
        if (collection_result.games_byid_not_in_cache.hasOwnProperty(ambiguous_title_info[0])) {
            if (collection_result.games_byid_not_in_cache[ambiguous_title_info[0]] === ambiguous_title_info[1].id) {
                collection_result.selectedGamesToActivate.push(ambiguous_title_info[1].unambiguousName)
            }
        // this title was a user-supplied name string and still requires user disambiguation
        } else {
            let ambiguous_gamedata_arr = JSON.parse(JSON.stringify(ambiguous_title_info[1]))
            newMessages.push({ message_str: `Which version of "${ambiguous_title_info[0]}"? `, ambiguous: ambiguous_gamedata_arr, error_flag: false })
            keepModalOpen = true
        }
    })

    collection_result['routedGamesTreatment'] = 'none'
    validationResult['gameValidations'] = collection_result

    // Prepend the game title with the game ID, when the ID was supplied by the user
    let game_id_txt = ''

    // Inform the user of all other games that could not be added
    let title_count_already_active = 0, append_titles_alreadyactive = []
    for (let active_title of collection_result.already_active) {
        title_count_already_active += 1
        if (collection_result.games_byid_dict.hasOwnProperty(active_title)) {
            game_id_txt = `[#${collection_result.games_byid_dict[active_title]}] `
        } else {
            game_id_txt = ''
        }
        append_titles_alreadyactive.push(game_id_txt + active_title)
        keepModalOpen = true
    }
    if (title_count_already_active > 0) {
        let message_txt, prepend_titles_alreadyactive
        if (title_count_already_active === 1) {
            prepend_titles_alreadyactive = [...append_titles_alreadyactive]
            append_titles_alreadyactive = []
            message_txt = 'is already active'
        } else {
            prepend_titles_alreadyactive = []
            message_txt = `${title_count_already_active} titles are already active`
        }
        newMessages.push({ 
          error_flag: true,
          message_str: message_txt,
          prependTitles: prepend_titles_alreadyactive,
          appendTitles: append_titles_alreadyactive
        })
        keepModalOpen = true
    }
    let title_count_does_not_exist = 0, append_titles_doesnotexist = []
    for (let nonexistent_title of collection_result.does_not_exist) {
        title_count_does_not_exist += 1
        append_titles_doesnotexist.push(nonexistent_title)
        keepModalOpen = true
    }
    if (title_count_does_not_exist > 0) {
        let message_txt, prepend_titles_doesnotexist
        if (title_count_does_not_exist === 1) {
            prepend_titles_doesnotexist = [...append_titles_doesnotexist]
            append_titles_doesnotexist = []
            message_txt = 'does not exist'
        } else {
            prepend_titles_doesnotexist = []
            message_txt = `${title_count_does_not_exist} titles do not exist`
        }
        newMessages.push({ 
          error_flag: true,
          message_str: message_txt,
          prependTitles: prepend_titles_doesnotexist,
          appendTitles: append_titles_doesnotexist
        })
    }

    // Inform the user of all other games that will be added
    let title_count_to_add = 0, append_titles_toadd = []
    for (let inactive_title of collection_result.cachedGamesToActivate) {
        title_count_to_add += 1
        if (collection_result.games_byid_not_in_cache.hasOwnProperty(inactive_title)) {
            game_id_txt = `[#${collection_result.games_byid_not_in_cache[inactive_title]}] `
        } else {
            game_id_txt = ''
        }
        append_titles_toadd.push(game_id_txt + displayNameForMessages(inactive_title))
    }
    for (let unambiguous_new_title of Object.keys(collection_result.newGamedataToActivate)) {
        title_count_to_add += 1
        if (collection_result.games_byid_not_in_cache.hasOwnProperty(unambiguous_new_title)) {
            game_id_txt = `[#${collection_result.games_byid_not_in_cache[unambiguous_new_title]}] `
        } else {
            game_id_txt = ''
        }
        append_titles_toadd.push(game_id_txt + displayNameForMessages(unambiguous_new_title))
    }
    if (title_count_to_add > 0) {
        let message_txt, prepend_titles_toadd
        let other_txt = ( (Object.keys(collection_result.ambiguous_cached_games).length > 0) 
                            || (Object.keys(collection_result.ambiguousNewGamedata).length > 0) 
                            || (collection_result.does_not_exist.length > 0)
                            || (collection_result.already_active.length > 0) )
                            ? ' other' : ''
        if (title_count_to_add === 1) {
            prepend_titles_toadd = [...append_titles_toadd]
            append_titles_toadd = []
            message_txt = 'Adding'

        } else {
            prepend_titles_toadd = []
            message_txt = `Adding ${title_count_to_add}${other_txt} titles`
        }
        newMessages.push({ 
          error_flag: false,
          message_str: message_txt,
          prependTitles: prepend_titles_toadd,
          appendTitles: append_titles_toadd
        })
    }
    validationResult['messages'] = newMessages
    validationResult['keepModalOpen'] = keepModalOpen

    return validationResult
}
