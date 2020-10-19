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

// All versions of each user-supplied title are added alltogether. This minimizes the input processing
// complexity and future API calls needed, both caused by the numerous ways that a user can add a game.
//
// This function updates the library with all versions of each title supplied. However, if any 
// user-supplied title is ambiguous, it will not update the active game list at all. In that case it 
// will return disambiguation information that the calling function can use to re-form the titles for a 
// subsequent call to this function.
export const makeAllGamesActive = async (cachedgametitles, game_titles) => {

    let status = {
        already_active: [],
        ready_to_make_active: [],
        made_active: [],
        ambiguous: [],
    }

    let titles_to_api_lookup = []

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

    // STEP 1 API: Use BGG API to collect disambiguation info for the user-supplied titles that need it.
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
    console.log('all_potential_titles:',all_potential_titles)

    // [ [{id: 2411, name:'Mount Everest', year_published: 1980},
    // {id: 147624, name:'Mount Everest', year_published: 2013}] ]

    return status

}