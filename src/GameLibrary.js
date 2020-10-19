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

export const makeAllGamesActive = async (cachedgametitles, game_titles) => {

    let status = {
        already_active: [],
        ready_to_make_active: [],
        made_active: [],
        ambiguous: [],
    }

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

        // user_title is ambiguous; may still be in the cache
        } else {
            status.ambiguous.push(user_title)
        }
    })

    // STEP 1 API: Use BGG API to collect disambiguation info for each AMBIGUOUS user-supplied title.
    let nonexact_search_results = await getNonexactSearchResults(status.ambiguous)
    nonexact_search_results.forEach(function (all_results_for_title, idx) {
        console.log('all_results_for_title:',all_results_for_title)
        let all_disambiguation_for_title = []
        all_results_for_title.forEach(function (one_similar_result) {
            let new_disambiguation
            if (one_similar_result.name === status.ambiguous[idx]) {
                // console.log('['+idx+']: '+one_similar_result.name+' MATCHES!')
                new_disambiguation = JSON.parse(JSON.stringify(one_similar_result))
                all_disambiguation_for_title.push(new_disambiguation)
            }
        })
        nonexact_search_results[idx] = all_disambiguation_for_title
    })
    console.log('nonexact_search_results:',nonexact_search_results)

    // [ [{id: 2411, name:'Mount Everest', year_published: 1980},
    // {id: 147624, name:'Mount Everest', year_published: 2013}] ]

    return status

}