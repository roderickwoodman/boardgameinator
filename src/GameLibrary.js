export const makeAllGamesActive = (cachedgametitles, game_titles) => {

    let status = {
        already_active: [],
        ready_to_make_active: [],
        made_active: [],
        ambiguous: [],
    }

    let all_cached_disambiguous_titles = Object.keys(cachedgametitles)
    let all_cached_ids = Object.entries(cachedgametitles).map( cachedgame => parseInt(cachedgame[1].id) )
    game_titles.forEach(function(user_title) {

        // user_title was found in the cache
        if (all_cached_disambiguous_titles.includes(user_title)) {
            if (cachedgametitles[user_title].active) {
                status.already_active.push(user_title)
            } else { 
                status.ready_to_make_active.push(user_title)
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

    return status

}