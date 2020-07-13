import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'
import { searchApi, exactSearchApi, gamedataApi } from './Api.js'

export const AddGames = (props) => {

    const [ inputValue, setTextareaValue ] = useState('')
    const [ statusMessages, setStatusMessages ] = useState([])

    const withYear = (title, year, id) => {
        let printedYear = (year === null) ? '#'+id : year
        return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '').concat(' ('+printedYear+')')
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

    const getRemainingTitles = function (user_titles, final_results) {
        let remaining_titles = user_titles.filter(function(title) {
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
        const gameData = await Promise.all(
            games.map( function(game) {
                return (
                    gamedataApi(game.id) // query the API with the BGG game ID
        )}))
        return gameData
    }

    const validateUserTitles = async function (user_titles) { 

        let all_validated_games = []
        let remaining_titles = [...user_titles]
        let new_messages = []

        // STEP 1 API: Do BGG exact search API, using user-supplied name string.
        const exactSearchResults = await getExactSearchResults(user_titles)
        all_validated_games = updateValidatedGameList(all_validated_games, exactSearchResults, user_titles)
        remaining_titles = getRemainingTitles(user_titles, all_validated_games)

        // FOLLOW-UP STEP 2 API (If unresolved titles remain): Do BGG non-exact search API, using user-supplied name string.
        const nonexactSearchResults = await getNonexactSearchResults(remaining_titles)
        all_validated_games = updateValidatedGameList(all_validated_games, nonexactSearchResults, user_titles)
        remaining_titles = getRemainingTitles(user_titles, all_validated_games)

        // Throw an error message if any title does not have a BGG ID associated with it.
        if (remaining_titles.length) {
            remaining_titles.forEach(function(title) {
                new_messages.push({ message_str: 'ERROR: "' + withoutYear(title) + '" was not found in the BGG database'})
            })
            addMessages(new_messages)
            return
        }

        // If any of the results were ambiguous (ie, one title yielded mutiple search results), prompt the user for disambiguation
        let ambiguous_matches = all_validated_games.filter( game => game.hasOwnProperty('ambiguous') )
        let ambiguous_titles = {}
        ambiguous_matches.forEach(function(title) {
            let new_disambiguation = {
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

        // Print a message if any title has already been added to this app.
        new_messages = []
        let duplicates = []
        all_validated_games.forEach(function(game) {
            if (ifGameHasBeenAdded(game.id)) {
                new_messages.push({ message_str: '"' + withYear(game.name, game.year_published, game.id) + '" was previously added'})
                duplicates.push(game.id)
            }
        })
        all_validated_games = all_validated_games.filter( game => !duplicates.includes(game.id) )

        // STEP 3 API: Do BGG game data API, using BGG-API-supplied game ID
        const gamedataResults = await getGamedataResults(all_validated_games)
        remaining_titles = gamedataResults.map( gamedata => gamedata.name ).filter( gamedata_name => !user_titles.includes(gamedata_name) )

        // All APIs are done. Now integrate the game data with this app.
        if (user_titles.length - duplicates.length === 0) {
            if (duplicates.length > 1) {
                new_messages = [ { message_str: 'All ' + duplicates.length + ' games were previously added'} ]
            }
        } else if (duplicates.length === 0) {
            new_messages.push({ message_str: (user_titles.length - duplicates.length) + ' additional games have been added'})
        } else {
            let dup_str = ''
            if (duplicates.length === 1) {
                dup_str = ' was a duplicate)'
            } else {
                dup_str = ' were duplicates)'
            }
            new_messages.push({ message_str: (user_titles.length - duplicates.length) + ' additional games have been added (' + duplicates.length + dup_str })
        }
        addMessages(new_messages)
        gamedataResults.forEach(function(game_data) {
            if (game_data.hasOwnProperty('id')) {
                game_data["name_is_unique"] = false
                props.onnewtitle(game_data)
            }
        })

    }

    const ifGameHasBeenAdded = (gameId) => {
        for (let game of props.allgames) {
            if (game.id === parseInt(gameId)) {
                return true
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
        validateUserTitles(Array.from(new Set(userTitles)))
    }

    const addButton = (message) => {
        if (message.hasOwnProperty('ambiguous')) {
            return (
                message.ambiguous.map( disambiguation => 
                    <button key={disambiguation.id} className="default-primary-styles" onClick={ (e) => validateUserTitles([disambiguation.id.toString()]) }>{disambiguation.year_published}</button>
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
    allgames: PropTypes.array.isRequired,
    onnewtitle: PropTypes.func.isRequired,
}