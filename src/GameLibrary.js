export const makeAllGamesActive = (cachedgametitles, game_titles) => {

    let status = {
        made_active: [],
        ready_to_make_active: [],
        ambiguous: [],
    }

    let all_cached_disambiguous_titles = Object.keys(cachedgametitles)
    let all_cached_ids = Object.entries(cachedgametitles).map( cachedgame => cachedgame.id )
    game_titles.forEach(function(user_title) {

        // user_title was found in the cache
        if (all_cached_disambiguous_titles.includes(user_title)) {
            status.ready_to_make_active.push(user_title)

        // user_title is actually an ID that was found in the cache 
        } else if (all_cached_ids.includes(parseInt(user_title))) {
            status.ready_to_make_active.push(user_title)

        // user_title is ambiguous; may still be in the cache
        } else {
            status.ambiguous.push(user_title)
        }
    })

    return status

}