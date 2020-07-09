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

    const updateFinalResults = function (old_final_results, new_results, original_title_set) {
        let updated_results = JSON.parse(JSON.stringify(old_final_results))
        original_title_set.forEach(function(title) {
            let disambiguation_year = extractYearFromTitle(title.toString())
            new_results.forEach(function(result_array) {
                let results_for_title = result_array.filter(result => result.name === withoutYear(title) || result.id === parseInt(title))
                results_for_title.forEach(function(result) {
                    if ( (disambiguation_year === null && results_for_title.length === 1 && (result.name === withoutYear(title) || parseInt(result.id) === parseInt(title)))
                        || (disambiguation_year !== null && results_for_title.length > 1 && result.name === withoutYear(title) && result.year_published === parseInt(disambiguation_year))) {
                        let newResult = {
                            id: result.id,
                            name: result.name,
                            year_published: result.year_published
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
    
    const validateUserTitlesV3 = async function (user_titles) { 

        let final_results = []
        let remaining_titles = [...user_titles]

        // STEP 1: Do BGG exact search API, using user-supplied name string.
        const exactSearchResults = await getExactSearchResults(user_titles)
        final_results = updateFinalResults(final_results, exactSearchResults, user_titles)
        remaining_titles = getRemainingTitles(user_titles, final_results)

        // OPTIONAL STEP 2 (If unresolved titles remain): Do BGG non-exact search API, using user-supplied name string.
        const nonexactSearchResults = await getNonexactSearchResults(remaining_titles)
        final_results = updateFinalResults(final_results, nonexactSearchResults, user_titles)
        remaining_titles = getRemainingTitles(user_titles, final_results)

        // At this point the user-supplied titles should all have a BGG ID associated with each of them. If not, exit.
        if (remaining_titles.length) {
            remaining_titles.forEach(function(title) {
                addMessages([ { message_str: 'ERROR: "' + withoutYear(title) + '" was not found in the BGG database'} ])
            })
            return
        }

        // STEP 3: do BGG game data API, using BGG-API-supplied game ID
        // TBI
    }


    const validateUserTitlesV2 = async (userTitles) => {
        const titleData = await Promise.all(
            userTitles.map( function(gameTitle) {
                return (
                    // STEP 1: do BGG exact search API, using user-supplied name string
                    exactSearchApi(gameTitle)

                    // OPTIONAL STEP 2 (if no matches were found): do BGG non-exact search API, using user-supplied name string
                    .then( function(exactSearchData, idx) {
                        if (Object.entries(exactSearchData.length !==0)) {
                            return (exactSearchData)
                        } else {
                            return searchApi(userTitles[idx])
                        }})

                    // (EVENTUAL) STEP 3: do BGG game data API, using BGG-API-supplied game ID
                    .then( function(nonexactSearchData, idx2) {

                        // if an ID was searched for and not a title name, no disambiguation will be needed
                        let idMatches = nonexactSearchData.filter( titleMatch => titleMatch.id === parseInt(userTitles[idx2]))

                        // no BGG titles were found
                        if (nonexactSearchData.length === 0) {
                            addMessages([ { message_str: 'ERROR: "' + withoutYear(userTitles[idx2]) + '" was not found in the BGG database'} ])

                        // multiple BGG titles were found (without an exact ID match), so do disambiguation by year published
                        } else if (nonexactSearchData.length > 1 && idMatches.length !== 1) {
                            let desiredYear = extractYearFromTitle(userTitles[idx2])
                            let yearMatches = nonexactSearchData
                                .filter(ambiguousTitle => 
                                    desiredYear != null
                                    && ( (desiredYear.startsWith('#') && ambiguousTitle.id === parseInt(desiredYear.substr(1)))
                                        || ambiguousTitle.year_published === parseInt(desiredYear) ))
                            // the user's search submission did provide a publishing year that matches that of a BGG title
                            if (yearMatches.length) {
                                if (ifGameHasBeenAdded(yearMatches[0].id)) {
                                    addMessages([ { message_str: '"' + withYear(userTitles[idx2], yearMatches[0].year_published, yearMatches[0].id) + '" was previously added'} ])
                                } else {
                                    gamedataApi(yearMatches[0].id)
                                        .then(json => {
                                            if (json.hasOwnProperty('id')) {
                                                if (desiredYear !== null) {
                                                    addMessages([ { message_str: '"' + withYear(yearMatches[0].name, yearMatches[0].year_published, yearMatches[0].id) + '" has now been added'} ])
                                                } else {
                                                    addMessages([ { message_str: '"' + withoutYear(yearMatches[0].name) + '" has now been added'} ])
                                                }
                                                json["name_is_unique"] = false
                                                setTimeout(function() {
                                                    props.onnewtitle(json)
                                                }, 1000)
                                            } else {
                                                addMessages([ { message_str: 'ERROR: "' + withoutYear(yearMatches[0].name) + '" was not found in the BGG database'} ])
                                            }
                                        })
                                }
                            // re-populate the user's input input with titles that have disambiguation applied (so they can re-submit immediately)
                            } else {
                                let newMessages = []
                                for (let ambiguousTitle of nonexactSearchData) {
                                    let unambiguousTitle = ambiguousTitle.name + ' (' + ambiguousTitle.year_published + ')'
                                    newMessages.push({ 
                                        add_button: true,
                                        message_str: unambiguousTitle
                                    })
                                }
                                addMessages(newMessages)
                            }
                        // exactly 1 BGG title was found
                        } else {
                            if (ifGameHasBeenAdded(nonexactSearchData[0].id)) {
                                addMessages([ { message_str: '"' + withYear(nonexactSearchData[0].name) + '" was previously added'} ])
                            } else {
                                gamedataApi(nonexactSearchData[0].id)
                                    .then(json => {
                                        if (json.hasOwnProperty('id')) {
                                            addMessages([ { message_str: '"' + withoutYear(nonexactSearchData[0].name) + '" has now been added'} ])
                                            json["name_is_unique"] = true
                                            setTimeout(function() {
                                                props.onnewtitle(json)
                                            }, 1000)
                                            } else {
                                                addMessages([ { message_str: 'ERROR: "' + withoutYear(nonexactSearchData[0].name) + '" was not found in the BGG database'} ])
                                            }
                                        })
                                }
                            }
                        })
                    )
            })
        )
    }

    const validateUserTitles = async (userTitles) => {

        let messages = []
        let newTextareaValue = ""

        // search for an exact title match (BGG API)
        const exactSearchApiResults = await Promise.all(
            userTitles.map( gameTitle => exactSearchApi(withoutYear(gameTitle)) )
        )

        // if there was no response to the exact title search, do a non-exact one (BGG API)
        const searchApiResults = await Promise.all(
            exactSearchApiResults.map(
                (exactSearchApiResult, idx) => {
                    if (Object.entries(exactSearchApiResult).length !== 0) {
                        return exactSearchApiResult
                    } else {
                        return (
                            searchApi(userTitles[idx])
                        )
                    }
                }
            ))

        // the search result for each user-supplied title may have returned multiple possible BGG titles
        searchApiResults.forEach( (titleMatches, titleMatchesIdx) => {

            // if an ID was searched for and not a title name, no disambiguation will be needed
            let idMatches = titleMatches.filter( titleMatch => titleMatch.id === parseInt(userTitles[titleMatchesIdx]))

            // no BGG titles were found
            if (titleMatches.length === 0) {
                messages.push('ERROR: "' + withoutYear(userTitles[titleMatchesIdx]) + '" was not found in the BGG database')
                newTextareaValue += userTitles[titleMatchesIdx] + '\n'

            // multiple BGG titles were found (without an exact ID match), so do disambiguation by year published
            } else if (titleMatches.length > 1 && idMatches.length !== 1) {
                let desiredYear = extractYearFromTitle(userTitles[titleMatchesIdx])
                let yearMatches = titleMatches
                    .filter(ambiguousTitle => 
                        desiredYear != null
                        && ( (desiredYear.startsWith('#') && ambiguousTitle.id === parseInt(desiredYear.substr(1)))
                            || ambiguousTitle.year_published === parseInt(desiredYear) ))
                // the user's search submission did provide a publishing year that matches that of a BGG title
                if (yearMatches.length) {
                    if (ifGameHasBeenAdded(yearMatches[0].id)) {
                        messages.push('"' + withYear(userTitles[titleMatchesIdx], yearMatches[0].year_published, yearMatches[0].id) + '" was previously added')
                    } else {
                        gamedataApi(yearMatches[0].id)
                            .then(json => {
                                if (json.hasOwnProperty('id')) {
                                    if (desiredYear !== null) {
                                        messages.push('"' + withYear(yearMatches[0].name, yearMatches[0].year_published, yearMatches[0].id) + '" has now been added')
                                    } else {
                                        messages.push('"' + withoutYear(yearMatches[0].name) + '" has now been added')
                                    }
                                    json["name_is_unique"] = false
                                    setTimeout(function() {
                                        props.onnewtitle(json)
                                    }, 1000)
                                } else {
                                    messages.push('ERROR: "' + withoutYear(yearMatches[0].name) + '" is not producing data from the BGG API, so deleting it from your input')
                                }
                            })
                    }
                // re-populate the user's input input with titles that have disambiguation applied (so they can re-submit immediately)
                } else {
                    messages.push('ERROR: "' + withoutYear(userTitles[titleMatchesIdx]) + '" has multiple matches in the BGG database')
                    for (let ambiguousTitle of titleMatches) {
                        let disambiguousTitle = withYear(ambiguousTitle.name, ambiguousTitle.year_published, ambiguousTitle.id)
                        newTextareaValue += disambiguousTitle + '\n'
                    }
                }
            // exactly 1 BGG title was found
            } else {
                if (ifGameHasBeenAdded(titleMatches[0].id)) {
                    messages.push('"' + withYear(titleMatches[0].name) + '" was previously added')
                } else {
                    gamedataApi(titleMatches[0].id)
                        .then(json => {
                            if (json.hasOwnProperty('id')) {
                                messages.push('"' + withoutYear(titleMatches[0].name) + '" has now been added')
                                json["name_is_unique"] = true
                                setTimeout(function() {
                                    props.onnewtitle(json)
                                }, 1000)
                            } else {
                                messages.push('ERROR: "' + withoutYear(titleMatches[0].name) + '" is not producing data from the BGG API, so deleting it from your input')
                                newTextareaValue += ''
                            }
                        })
                }
            }
        })
        setStatusMessages(messages)
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
        validateUserTitlesV3(Array.from(new Set(userTitles)))
    }

    const addButton = (message) => {
        if (message.hasOwnProperty('add_button') && message.add_button) {
            return (
                <button className="default-primary-styles" onClick={ (e) => validateUserTitlesV3([message.message_str]) }>Add</button>
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