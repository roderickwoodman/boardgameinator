import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'
import { searchApi, exactSearchApi, gamedataApi } from './Api.js'

export const AddGames = (props) => {

    const [ inputValue, setTextareaValue ] = useState('')
    const [ statusMessages, setStatusMessages ] = useState([])

    const unambiguousTitle = (name) => {
        const data = props.activegamedata.filter(function(gamedata) {
            if (gamedata.id === parseInt(name)) {
                return true
            } else if (gamedata.unambiguous_name === name) {
                return true
            } else {
                return false
            } 
        })
        if (data.length) {
            return data[0].unambiguous_name
        } else {
            return name
        }
    }

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

    const addMessages = (new_messages) => {
        const newStatusMessages = [...statusMessages, ...new_messages]
        setStatusMessages(newStatusMessages)
    }

    const updateValidatedGameList = function (old_final_results, new_results, original_title_set) {
        let updated_results = JSON.parse(JSON.stringify(old_final_results))
        original_title_set.forEach(function(title) {
            let disambiguation_year = extractYearFromTitle(title.toString())
            new_results.forEach(function(result_array) {
                let results_for_title = result_array.filter(result => result.name.toLowerCase() === withoutYear(title.toLowerCase()) || result.id === parseInt(title))
                results_for_title.forEach(function(result) {
                    if ( (disambiguation_year === null  && (result.name.toLowerCase() === withoutYear(title.toLowerCase()) || parseInt(result.id) === parseInt(title)))
                        || (disambiguation_year !== null && result.name.toLowerCase() === withoutYear(title.toLowerCase()) && result.year_published === parseInt(disambiguation_year))) {
                        let newResult = {
                            id: result.id,
                            name: result.name,
                            year_published: result.year_published
                        }
                        if (result.year_published !== parseInt(disambiguation_year) && results_for_title.length > 1) {
                            newResult['ambiguous'] = true
                        }
                        updated_results.push(newResult)
                    }

                })
                
            })
        })
        return updated_results
    }

    const getRemainingTitles = function (old_remaining_titles, final_results) {
        let remaining_titles = old_remaining_titles.filter(function(title) {
            return (final_results.filter( result => result.name.toLowerCase() === withoutYear(title.toLowerCase()) || result.id === parseInt(title)).length) ? false : true
        })
        return remaining_titles
    }

    const getExactSearchResults = async function (titles) {
        const titleData = await Promise.all(
            titles.map( function(gameTitle) {
                return (
                    exactSearchApi(withoutYear(gameTitle)) // query the API without the disambiguation
        )}))
        return titleData
    }

    const getNonexactSearchResults = async function (titles) {
        const titleData = await Promise.all(
            titles.map( function(gameTitle) {
                return (
                    searchApi(withoutYear(gameTitle)) // query the API without the disambiguation
        )}))
        return titleData
    }

    const getGamedataResults = async function (games) {
        const gamedata = await Promise.all(
            games.map( function(game) {
                return (
                    gamedataApi(game.id) // query the API with the BGG game ID
        )}))
        return gamedata
    }

    const validateAmbiguousTitles = function (unambiguous_titles) { 
        validateUserTitles(unambiguous_titles, true)
    }

    const validateUserTitles_old = async function (user_titles, second_pass) { 

        let all_validated_games = []
        let remaining_titles = [...user_titles]
        let new_messages = []

        // STEP 0: Look up the title in the cache
        let cached_search_results = [], cached_gamedata_results = []
        let already_active = []
        user_titles.forEach(function(title) {
            if (gameIsActive(title)) {
                new_messages.push({ message_str: '"' + unambiguousTitle(title) + '" was previously added'})
                already_active.push(title)
            } else {
                let cache_entry = props.getcachedgamedata(title)[0]
                if (cache_entry.length === 1) {
                    let cached_result = {
                        name: cache_entry[0].name,
                        id: cache_entry[0].id,
                        year_published: cache_entry[0].year_published
                    }
                    cached_search_results.push([cached_result])
                    cached_gamedata_results.push(JSON.parse(JSON.stringify(cache_entry[0])))
                }
            }
        })
        remaining_titles = remaining_titles.filter( title => !already_active.includes(title) )

        all_validated_games = updateValidatedGameList(all_validated_games, cached_search_results, remaining_titles)
        remaining_titles = getRemainingTitles(remaining_titles, all_validated_games)

        // STEP 1 API: Do BGG exact search API, using user-supplied name string.
        const exact_search_results = await getExactSearchResults(remaining_titles)
        all_validated_games = updateValidatedGameList(all_validated_games, exact_search_results, remaining_titles)
        remaining_titles = getRemainingTitles(remaining_titles, all_validated_games)

        // STEP 2 OPTIONAL FOLLOW-UP API (If unresolved titles remain): Do BGG non-exact search API, using user-supplied name string.
        const non_exact_search_results = await getNonexactSearchResults(remaining_titles)
        all_validated_games = updateValidatedGameList(all_validated_games, non_exact_search_results, remaining_titles)
        remaining_titles = getRemainingTitles(remaining_titles, all_validated_games)

        // ERROR if any title does not have a BGG ID associated with it.
        if (remaining_titles.length) {
            remaining_titles.forEach(function(title) {
                new_messages.push({ message_str: 'ERROR: "' + withoutYear(title) + '" was not found in the BGG database'})
            })
            addMessages(new_messages)
            return
        }

        // Prompt for disambiguation if one title yielded mutiple search results.
        let ambiguous_matches = all_validated_games.filter( game => game.hasOwnProperty('ambiguous') )
        let ambiguous_titles = {}
        ambiguous_matches.forEach(function(title) {
            let new_disambiguation = {
                name: title.name,
                id: title.id,
                year_published: title.year_published
            }
            if (ambiguous_titles.hasOwnProperty(title.name)) {
                ambiguous_titles[title.name].push(new_disambiguation)
                ambiguous_titles[title.name] = ambiguous_titles[title.name].sort(function(a,b) {
                    if (a.year_published < b.year_published) {
                        return -1
                    } else if (a.year_published > b.year_published) {
                        return 1
                    } else {
                        return 0
                    }
                })
            } else {
                ambiguous_titles[title.name] = [new_disambiguation]
            }
        })
        if (Object.keys(ambiguous_titles).length) {
            Object.entries(ambiguous_titles).forEach(function(entry) {
                let ambiguous_arr = JSON.parse(JSON.stringify(entry[1]))
                new_messages.push({ message_str: 'Which version of "'+ entry[0] + '": ', ambiguous: ambiguous_arr })
            })
            addMessages(new_messages)
            return
        }

        // STEP 3 API: Do BGG game data API, using BGG-API-supplied game ID
        let cached_game_ids = cached_gamedata_results.map( result => result.id )
        let all_uncached_validated_games = all_validated_games.filter( game => !cached_game_ids.includes(game.id) )
        const gamedata_results = await getGamedataResults(all_uncached_validated_games)
        remaining_titles = gamedata_results.map( gamedata => gamedata.name ).filter( gamedata_name => !user_titles.includes(gamedata_name) )

        // All APIs are done. Now integrate the game data with this app.
        if (user_titles.length - already_active.length === 0) {
            if (already_active.length > 1) {
                new_messages = [ { message_str: 'All ' + already_active.length + ' games were previously added'} ]
            }
        } else if (already_active.length === 0) {
            new_messages.push({ message_str: (user_titles.length - already_active.length) + ' additional games have been added'})
        } else {
            new_messages.push({ message_str: (user_titles.length - already_active.length) + ' additional games have been added (' + already_active.length + ' were previously added)' })
        }
        addMessages(new_messages)
        cached_gamedata_results.forEach(function(cached_game_data) {
            if (cached_game_data.hasOwnProperty('id')) {
                props.onaddcachedtitle(cached_game_data.id)
            }
        })
        gamedata_results.forEach(function(game_data) {
            if (game_data.hasOwnProperty('id')) {
                if (second_pass) {
                    game_data["name_is_unique"] = false
                }
                let disambiguous_title = game_data.name
                if (game_data.hasOwnProperty('name_is_unique') && game_data.name_is_unique) {
                    disambiguous_title += ' (' + game_data.year_published + ')'
                }
                if (!gameIsActive(disambiguous_title)) {
                    if (game_data.hasOwnProperty("name_is_unique") && game_data["name_is_unique"] === false) {
                        let disambiguation = (game_data.year_published !== null)
                            ? " ("+ game_data.year_published + ")"
                            : " (#" + game_data.id + ")"
                        game_data["unambiguous_name"] = game_data.name + disambiguation
                    }
                    props.onaddnewtitle(game_data)
                }
            }
        })
    }

    // The param 'second_pass' flags the second pass through this function, which is triggered by
    // a button press. Using two passes of this function is a hack to keep the modal open for the 
    // user while content inside of it dynamically changes.
    const validateUserTitles = async function (user_titles, second_pass) { 

        console.log('=== VALIDATING === ', user_titles)
        console.log('Already cached titles:', props.cachedgametitles)

        let new_messages = []

        let uncached_titles = []
        let uncached_ids = []
        let potential_cached_titles = []
        let to_add_cached = []
        let ambiguous_titles = []

        let to_lookup_data = []

        // STEP 0: Look up the title in the cache
        let all_cached_titles = Object.keys(props.cachedgametitles)
        user_titles.forEach(function(title) {
            let title_to_lookup = title

            // if title is an ID, use cache to convert it to an unambiguous title
            let title_is_id_cache = Object.entries(props.cachedgametitles).filter( cached => cached[1].id === parseInt(title) )
            if (title_is_id_cache.length) {
                title_to_lookup = title_is_id_cache[0][0]
            }

            // note that cache is keyed by unambiguous title, which may or may not need to include a year for disambiguation
            if ( props.cachedgametitles.hasOwnProperty(title)
                || props.cachedgametitles.hasOwnProperty(withoutYear(title))
                || title_is_id_cache.length ) {
                if (props.cachedgametitles.hasOwnProperty(withoutYear(title))) {
                    title_to_lookup = withoutYear(title)
                } 
                if (props.cachedgametitles[title_to_lookup].active) {
                    new_messages.push({ message_str: '"' + title_to_lookup + '" was previously added'})
                } else {
                    to_add_cached.push(title_to_lookup)
                }
            } else if (all_cached_titles.filter(cached_title => cached_title.includes(title)).length) {
                potential_cached_titles.push(title)
            } else if (all_cached_titles.filter(cached_title => cached_title.includes(withoutYear(title))).length) {
                potential_cached_titles.push(withoutYear(title))
            } else {
                if (isNaN(title)) {
                    uncached_titles.push(title_to_lookup)
                } else {
                    uncached_ids.push(title_to_lookup)
                }
            }
        })
        console.log('Uncached IDs:', uncached_ids)

        // STEP 0.5: If cache-matching is uncertain, prompt the user for more information.

        if (potential_cached_titles.length === 1) {
            let potential_cached_titles_info = {}
            console.log('Potential cached titles:', potential_cached_titles)
            potential_cached_titles.forEach(function(potential_cached_title) {

                Object.entries(props.cachedgametitles).forEach(function(cached_title) {
                    if (cached_title[0].includes(potential_cached_title)) {
                        // collect the ambiguous references for this game name
                        let new_disambiguation = {
                            name: cached_title[1].name,
                            unambiguous_name: cached_title[1].name + ' (' + cached_title[1].year_published + ')',
                            id: cached_title[1].id,
                            year_published: cached_title[1].year_published
                        }
                        if (potential_cached_titles_info.hasOwnProperty(cached_title[1].name)) {
                            potential_cached_titles_info[cached_title[1].name].push(new_disambiguation)
                            potential_cached_titles_info[cached_title[1].name] = potential_cached_titles_info[cached_title[1].name].sort(function(a,b) {
                                if (a.year_published < b.year_published) {
                                    return -1
                                } else if (a.year_published > b.year_published) {
                                    return 1
                                } else {
                                    return 0
                                }
                            })
                        } else {
                            potential_cached_titles_info[cached_title[1].name] = [new_disambiguation]
                        }
                    }
                })
            })
            if (Object.keys(potential_cached_titles_info).length) {
                Object.entries(potential_cached_titles_info).forEach(function(entry) {
                    let ambiguous_arr = JSON.parse(JSON.stringify(entry[1]))
                    new_messages.push({ message_str: 'Which version of "'+ entry[0] + '": ', ambiguous: ambiguous_arr })
                })
                addMessages(new_messages)
                return
            }
        }

        // STEP 1 API: If uncached IDs were submitted instead of titles, use BGG non-exact search API to convert IDs into titles.
        const searchresults_for_ids = await getNonexactSearchResults(uncached_ids)
        console.log('searchresults_for_ids:',searchresults_for_ids)
        if (searchresults_for_ids.length === 1) {
            searchresults_for_ids[0].forEach(function(possible_match) {
                if (uncached_ids.includes(possible_match.id.toString())) {
                    uncached_titles.push(possible_match.name)
                }
            })
        }
        console.log('Uncached titles:', uncached_titles)

        // STEP 2 API: Use BGG exact search API to determine the unique titles.
        const searchresults_for_uncached = await getExactSearchResults(uncached_titles)
        console.log('searchresults_for_uncached:',searchresults_for_uncached)
        searchresults_for_uncached.forEach(function(result,idx) {
            if (result.length === 1) {
                let new_game_to_lookup = {
                    id: result[0].id,
                    is_ambiguous: false
                }
                to_lookup_data.push(new_game_to_lookup)
            } else if (result.length > 1) {
                let years_published = result.map( ambiguous_result => ambiguous_result.year_published )
                let disambiguation_year = extractYearFromTitle(uncached_titles[idx])
                console.log('years_published:', years_published, ' disambiguation_year:', disambiguation_year, ' uncached_titles:', uncached_titles[idx])
                if (years_published.includes(parseInt(disambiguation_year))) {
                    ambiguous_titles.push(uncached_titles[idx])
                } else {
                    ambiguous_titles.push(withoutYear(uncached_titles[idx])) // the given year was wrong, so strike the yeear input
                }
            } else if (!result.length) {
                new_messages.push({ message_str: 'ERROR: "' + uncached_titles[idx] + '" was not found in the BGG database'})
                addMessages(new_messages)
                return
            }
        })
        console.log('Ambiguous titles:', ambiguous_titles)

        // STEP 3 API: If unresolved titles remain, use BGG non-exact search API to determine the potential (ambiguous) titles.
        const searchresults_for_ambiguous = await getNonexactSearchResults(ambiguous_titles)
        let ambiguous_titles_info = {}
        console.log('searchresults_for_ambiguous:', searchresults_for_ambiguous)
        if (searchresults_for_ambiguous.length === 1) {
            let titles_given_with_disambiguation = ambiguous_titles.filter( title => title !== withoutYear(title) ).map( title => withoutYear(title) )
            let disambiguation_was_given = {}

            // identify any titles where disambiguation was given by the user
            searchresults_for_ambiguous[0].forEach(function(possible_match) {
                if (titles_given_with_disambiguation.includes(possible_match.name)) {
                    const unambiguous_name_from_results = possible_match.name + ' (' + possible_match.year_published + ')'
                    if (ambiguous_titles.includes(unambiguous_name_from_results)) {
                        disambiguation_was_given[possible_match.name] = true
                    }
                }
            })
            console.log('disambiguation_was_given:', disambiguation_was_given)

            searchresults_for_ambiguous[0].forEach(function(possible_match) {

                if (disambiguation_was_given.hasOwnProperty(possible_match.name)) {
                    // look up data for this game ID
                    let new_game_to_lookup = {
                        id: possible_match.id,
                        is_ambiguous: true
                    }
                    to_lookup_data.push(new_game_to_lookup)
                    console.log(' ==> added to lookup:', new_game_to_lookup)
                }
                // If no user-specified disambiguation, prompt the user for disambiguation
                else if (!second_pass && ambiguous_titles.includes(possible_match.name)) {

                    // collect the ambiguous references for this game name
                    let new_disambiguation = {
                        name: possible_match.name,
                        unambiguous_name: possible_match.name + ' (' + possible_match.year_published + ')',
                        id: possible_match.id,
                        year_published: possible_match.year_published
                    }
                    if (ambiguous_titles_info.hasOwnProperty(possible_match.name)) {
                        ambiguous_titles_info[possible_match.name].push(new_disambiguation)
                        ambiguous_titles_info[possible_match.name] = ambiguous_titles_info[possible_match.name].sort(function(a,b) {
                            if (a.year_published < b.year_published) {
                                return -1
                            } else if (a.year_published > b.year_published) {
                                return 1
                            } else {
                                return 0
                            }
                        })
                    } else {
                        ambiguous_titles_info[possible_match.name] = [new_disambiguation]
                    }
                    if (!ambiguous_titles_info.hasOwnProperty(possible_match.name)) {
                        let new_disambiguation = {
                            name: possible_match.name,
                            unambiguous_name: possible_match.name + ' (' + possible_match.year_published + ')',
                            id: possible_match.id,
                            year_published: possible_match.year_published
                        }
                        ambiguous_titles_info[possible_match.name].push(new_disambiguation)
                    }
                    console.log('ambiguous_titles_info:', ambiguous_titles_info)

                    // look up data for this game ID
                    let new_game_to_lookup = {
                        id: possible_match.id,
                        is_ambiguous: true
                    }
                    to_lookup_data.push(new_game_to_lookup)
                    console.log(' ==> added to lookup:', new_game_to_lookup)
                }
            })
            if (Object.keys(ambiguous_titles_info).length) {
                Object.entries(ambiguous_titles_info).forEach(function(entry) {
                    let ambiguous_arr = JSON.parse(JSON.stringify(entry[1]))
                    new_messages.push({ message_str: 'Which version of "'+ entry[0] + '": ', ambiguous: ambiguous_arr })
                })
                addMessages(new_messages)
                return
            }
        }

        console.log(' ==> looking up data for:', to_lookup_data)

        // STEP 4 API: For each ID collected from previous API results, use BGG game data API to get all of the game-specific details.
        const gamedata_results = await getGamedataResults(to_lookup_data)

        // All APIs are done. Now integrate the game data with this app.

        to_add_cached.forEach(function(title) {
            props.onaddcachedtitle(title)
        })

        console.log('gamedata_results:',gamedata_results)
        console.log('ambiguous_titles:',ambiguous_titles)
        let ambiguous_titles_without_year = ambiguous_titles.map( title => withoutYear(title) )
        console.log('ambiguous_titles_without_year:',ambiguous_titles_without_year)
        gamedata_results.forEach(function(game_data) {

            // assign a unique game name
            let disambiguation = ""
            if (ambiguous_titles_without_year.includes(game_data.name)) {
                disambiguation = (game_data.year_published !== null)
                    ? " ("+ game_data.year_published + ")"
                    : " (#" + game_data.id + ")"
            }
            let unambiguous_title = game_data.name + disambiguation
            game_data["unambiguous_name"] = unambiguous_title

            // determine the proper handler for the API data
            console.log('unambiguous_title:',unambiguous_title)
            if (ambiguous_titles.includes(unambiguous_title)) {
                props.onaddnewtitle(game_data)
            } else if (ambiguous_titles_without_year.includes(game_data.name)) {
                props.oncachenewtitle(game_data)
            } else if (ambiguous_titles.includes(game_data.name)){
                if (user_titles.includes(game_data.unambiguous_name)) {
                    props.onaddnewtitle(game_data)
                } else {
                    props.oncachenewtitle(game_data)
                }
            } else {
                props.onaddnewtitle(game_data)
            }
        })
    }

    const gameIsActive = (name) => {
        for (let game of props.activegamedata) {
            if (game.id === parseInt(name)) {
                return true
            } else if (game.name === withoutYear(name)) {
                if (game.hasOwnProperty('name_is_unique') && game.name_is_unique) {
                    return true
                } else {
                    let disambiguation_year = extractYearFromTitle(name.toString())
                    if (game.year_published === parseInt(disambiguation_year)) {
                        return true
                    }
                }
            } 
        }
        return false
    }

    const handleChange = (event) => {
        setTextareaValue(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        let delimiter, num_nonblank_lines = inputValue.split(/\r\n|\r|\n/).filter(line => line !== '').length
        if (num_nonblank_lines > 1) {
            delimiter = '\n'
        } else {
            delimiter = ','
        }
        let userTitles = inputValue
            .split(delimiter)
            .map(str => str.trim())
            .map(str => str.replace(/[^0-9a-zA-Z:()&!–#' ]/g, ""))
            .filter( function(e){return e} )
        validateUserTitles(Array.from(new Set(userTitles)), false)
    }

    const addButton = (message) => {
        if (message.hasOwnProperty('ambiguous')) {
            return (
                message.ambiguous.map( disambiguation => 
                    <button key={disambiguation.id} className="default-primary-styles" onClick={ (e) => validateAmbiguousTitles([disambiguation.unambiguous_name]) }>{disambiguation.year_published}</button>
                )
            )
        } else {
            return null
        }
    }

    return (
        <React.Fragment>

        <h4>Add board game by title:</h4>

        <div id="input-section">

            <section id="input-by-title">
                    <section className="buttonrow">
                        <input size="30" value={inputValue} onChange={handleChange} placeholder="(exact game title or BGG ID)" required/>
                        <button onClick={handleSubmit} className="default-primary-styles">Add</button>
                    </section>
                <div className="status-messages">
                    { statusMessages
                        .map(
                            (message, i) => {
                                return (message.message_str.toLowerCase().startsWith("error"))
                                ? <p key={i} className="message error">{message.message_str} {addButton(message)}</p>
                                : <p key={i} className="message"><FontAwesomeIcon icon={faLongArrowAltRight} /> {message.message_str} {addButton(message)}</p>
                            }
                        )
                    }
                </div>
            </section>

        </div>
        </React.Fragment>
    )
}

AddGames.propTypes = {
    activegamedata: PropTypes.array.isRequired,   // FIXME: delete?
    getcachedgamedata: PropTypes.func.isRequired, // FIXME: delete?
    cachedgametitles: PropTypes.object.isRequired,
    onaddcachedtitle: PropTypes.func.isRequired,
    onaddnewtitle: PropTypes.func.isRequired,
    oncachenewtitle: PropTypes.func.isRequired,   // FIXME: send unambiguous title INSIDE OF new game data
}