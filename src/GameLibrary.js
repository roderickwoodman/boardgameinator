import { searchApi } from './Api.js'

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
        ready_to_make_active: [],
        made_active: [],
        disambiguation_info: {},
    }
    let titles_to_api_lookup = []

    // CACHE LOOKUP, for all titles
    let all_cached_disambiguous_titles = Object.keys(cachedgametitles)
    let all_cached_ids = Object.entries(cachedgametitles).map( cachedgame => parseInt(cachedgame[1].id) )
    game_titles.forEach(function(user_title) {

        // user_title was found verbatim in the cache
        if (all_cached_disambiguous_titles.includes(user_title)) {
            if (cachedgametitles[user_title].active) {
                status.already_active.push(user_title)
            } else { 
                status.ready_to_make_active.push(user_title)
            }

        // user_title without the year disambiguation was found in the cache
        } else if (all_cached_disambiguous_titles.includes(withoutYear(user_title))) {
            if (cachedgametitles[withoutYear(user_title)].active) {
                status.already_active.push(withoutYear(user_title))
            } else { 
                status.ready_to_make_active.push(withoutYear(user_title))
            }

        // user_title is actually an ID that was found in the cache 
        } else if (all_cached_ids.includes(parseInt(user_title))) {
            if (Object.entries(cachedgametitles).filter( cachedgame => cachedgame[1].id === parseInt(user_title) )[0][1].active) {
                status.already_active.push(user_title)
            } else { 
                status.ready_to_make_active.push(user_title)
            }

        // user_title is not immediately known, collect title info via API
        } else {
            titles_to_api_lookup.push(user_title)
        }
    })

    // API LOOKUP, for titles that were not found in the cache
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
    //   (not_found, already_active, ready_to_make_active, made_active, disambiguation_info)
    titles_to_api_lookup.forEach(function (user_title, idx) {

        // title was not found
        if (all_potential_titles[idx].length === 0) {
            status.not_found.push(user_title)

        // exact title match, add to the active list
        } else if (all_potential_titles[idx].length === 1) {
            status.ready_to_make_active.push(user_title)

        // title requires disambiguation by the user
        } else {
            let new_disambiguation = JSON.parse(JSON.stringify(all_potential_titles[idx]))
            status.disambiguation_info[user_title] = new_disambiguation
        }

    })

    return status

}