import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'
import { searchApi, exactSearchApi, gamedataApi } from './Api.js'

export const AddGames = (props) => {

    const [ inputValue, setTextareaValue ] = useState('')
    const [ statusMessages, setStatusMessages ] = useState([])

    const titleWithYear = (name) => {
        const data = props.activegamedata.filter(function(gamedata) {
            if (gamedata.id === parseInt(name)) {
                return true
            } else if (gamedata.name === name) {
                if (gamedata.hasOwnProperty('name_is_unique') && gamedata.name_is_unique) {
                    return true
                } else {
                    let disambiguation_year = extractYearFromTitle(name.toString())
                    if (gamedata.year_published === disambiguation_year) {
                        return true
                    }
                }
            } 
            return false
        })
        let printedYear = (data[0].year_published === null) ? '#'+data[0].id : data[0].year_published
        return data[0].name.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '').concat(' ('+printedYear+')')
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
                let results_for_title = result_array.filter(result => result.name === withoutYear(title) || result.id === parseInt(title))
                results_for_title.forEach(function(result) {
                    if ( (disambiguation_year === null  && (result.name === withoutYear(title) || parseInt(result.id) === parseInt(title)))
                        || (disambiguation_year !== null && result.name === withoutYear(title) && result.year_published === parseInt(disambiguation_year))) {
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
            return (final_results.filter( result => result.name === withoutYear(title) || result.id === parseInt(title)).length) ? false : true
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

    const validateAmbiguousTitles = function (ambiguous_titles) { 
        validateUserTitles(ambiguous_titles, true)
    }

    const validateUserTitles = async function (user_titles, all_ambiguous) { 

        let all_validated_games = []
        let remaining_titles = [...user_titles]
        let new_messages = []

        // STEP 0: Look up the title in the cache
        let cached_search_results = [], cached_gamedata_results = []
        let already_active = []
        user_titles.forEach(function(title) {
            if (gameIsActive(title)) {
                new_messages.push({ message_str: '"' + titleWithYear(title) + '" was previously added'})
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
                props.oncachedtitle(cached_game_data.id)
            }
        })
        gamedata_results.forEach(function(game_data) {
            if (game_data.hasOwnProperty('id')) {
                if (all_ambiguous) {
                    game_data["name_is_unique"] = false
                } else {
                    game_data["name_is_unique"] = true
                }
                props.onnewtitle(game_data)
            }
        })
    }

    const gameIsActive = (name) => {
        for (let game of props.activegamedata) {
            if (game.id === parseInt(name)) {
                return true
            } else if (game.name === name) {
                if (game.hasOwnProperty('name_is_unique') && game.name_is_unique) {
                    return true
                } else {
                    let disambiguation_year = extractYearFromTitle(name.toString())
                    if (game.year_published === disambiguation_year) {
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
                    <button key={disambiguation.id} className="default-primary-styles" onClick={ (e) => validateAmbiguousTitles([disambiguation.id.toString()]) }>{disambiguation.year_published}</button>
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
                        <input size="30" value={inputValue} onChange={handleChange} placeholder="(exact game title)" required/>
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
    activegamedata: PropTypes.array.isRequired,
    getcachedgamedata: PropTypes.func.isRequired,
    oncachedtitle: PropTypes.func.isRequired,
    onnewtitle: PropTypes.func.isRequired,
}