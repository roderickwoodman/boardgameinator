import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'
import { searchApi, exactSearchApi, gamedataApi } from './Api.js'

export const AddGames = (props) => {

    const [ inputValue, setTextareaValue ] = useState('')
    const [ statusMessages, setStatusMessages ] = useState([])
    const [ disambiguousTitleIsSelected, setDisambiguousTitleIsSelected ] = useState({}) 
    const [ ambiguityRemains, setAmbiguityRemains ] = useState(true)

    function doesAmbiguityRemain(disambiguation) {
        let num_still_ambiguous = Object.values(disambiguation).filter(function(duplicates) {
            if (Object.values(duplicates).includes(true)) {
                return 0
            } else {
                return 1
            }
        }).length
        return (num_still_ambiguous) ? true : false
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

    const updateAmbiguityRemains = (disambiguation) => {
        if (doesAmbiguityRemain(disambiguation)) {
            setAmbiguityRemains(true)
        } else {
            setAmbiguityRemains(false)
        }
    }

    const addUnselectedAmbiguousTitles = function (unambiguous_titles) { 
        let new_disambiguous_title_is_selected = JSON.parse(JSON.stringify(disambiguousTitleIsSelected))
        unambiguous_titles.forEach(function(unambiguous_title) {
            let base_name = withoutYear(unambiguous_title)
            if (new_disambiguous_title_is_selected.hasOwnProperty(base_name)) {
                new_disambiguous_title_is_selected[base_name][unambiguous_title] = false
            } else {
                let new_base_name = {}
                new_base_name[unambiguous_title] = false
                new_disambiguous_title_is_selected[base_name] = new_base_name
            }
        })
        updateAmbiguityRemains(new_disambiguous_title_is_selected)
        setDisambiguousTitleIsSelected(new_disambiguous_title_is_selected)
    }

    const selectUnambiguousTitle = function (unambiguous_title) { 
        let new_disambiguous_title_is_selected = JSON.parse(JSON.stringify(disambiguousTitleIsSelected))
        let base_name = withoutYear(unambiguous_title)
        if (new_disambiguous_title_is_selected.hasOwnProperty(base_name)) {
            if (new_disambiguous_title_is_selected[base_name].hasOwnProperty(unambiguous_title)) {
                let originally_selected_title = Object.entries(new_disambiguous_title_is_selected[base_name]).filter( game => game[1] === true )
                if (originally_selected_title[0] !== unambiguous_title) {
                    Object.keys(new_disambiguous_title_is_selected[base_name]).forEach(function(game) {
                        if (game === unambiguous_title) {
                            new_disambiguous_title_is_selected[base_name][game] = true
                        } else {
                            new_disambiguous_title_is_selected[base_name][game] = false
                        }
                    })
                    updateAmbiguityRemains(new_disambiguous_title_is_selected)
                    setDisambiguousTitleIsSelected(new_disambiguous_title_is_selected)
                    validateAmbiguousTitles([unambiguous_title])
                }
            }
        }
        validateAmbiguousTitles([unambiguous_title])
    }

    const getDisambiguousTitle = function (title) {
        if (disambiguousTitleIsSelected.hasOwnProperty(withoutYear(title))) {
            let disambiguation = Object.entries(disambiguousTitleIsSelected[withoutYear(title)]).filter( entry => entry[1] )
            if (disambiguation.length) {
                return disambiguation[0]
            } else {
                return title
            }
        } else {
            return title
        }
    }

    const validateAmbiguousTitles = function (unambiguous_titles) { 
        validateUserTitles(unambiguous_titles, true)
    }

    // The param 'second_pass' indicates the second pass through this function. It is only
    // necessary when the title given on the first pass was ambiguous, and the second pass
    // is accompanied by a title with disambiguation so that it can be resolved uniquely.
    const validateUserTitles = async function (user_titles, second_pass) { 

        let new_messages = []
        let uncached_titles = []
        let uncached_ids = []
        let potential_cached_titles = []
        let cached_titles = []
        let ambiguous_titles = []
        let titles_for_api = []

        // console.log('[',second_pass,'] user_titles:',user_titles)
        let disambiguous_user_titles = user_titles.map( title => getDisambiguousTitle(title) )
        // console.log('[',second_pass,'] disambiguous_user_titles:',disambiguous_user_titles)

        // STEP 0: Look up the title in the cache
        let all_cached_titles = Object.keys(props.cachedgametitles)
        disambiguous_user_titles.forEach(function(title) {
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
                    // console.log('[',second_pass,']  ==> IS CACHED:',title_to_lookup)
                    cached_titles.push(title_to_lookup)
                }
            } else if (all_cached_titles.filter(cached_title => cached_title.includes(title)).length) {
                // console.log('[',second_pass,']  ==> marking',title,'as ambiguous')
                potential_cached_titles.push(title)
            } else if (all_cached_titles.filter(cached_title => cached_title.includes(withoutYear(title))).length) {
                // console.log('[',second_pass,']  ==> marking',title,'as ambiguous')
                potential_cached_titles.push(withoutYear(title))
            } else {
                if (isNaN(title)) {
                    uncached_titles.push(title_to_lookup)
                } else {
                    uncached_ids.push(title_to_lookup)
                }
            }
        })

        // console.log('[',second_pass,'] potential_cached_titles:',potential_cached_titles)

        // STEP 0.5: If cache-matching is uncertain, prompt the user for more information.
        if (potential_cached_titles.length === 1) {
            let potential_cached_titles_disambiguation = {}
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
                        if (potential_cached_titles_disambiguation.hasOwnProperty(cached_title[1].name)) {
                            potential_cached_titles_disambiguation[cached_title[1].name].push(new_disambiguation)
                            potential_cached_titles_disambiguation[cached_title[1].name] = potential_cached_titles_disambiguation[cached_title[1].name].sort(function(a,b) {
                                if (a.year_published < b.year_published) {
                                    return -1
                                } else if (a.year_published > b.year_published) {
                                    return 1
                                } else {
                                    return 0
                                }
                            })
                        } else {
                            potential_cached_titles_disambiguation[cached_title[1].name] = [new_disambiguation]
                        }
                    }
                })
            })
            // console.log('[',second_pass,'] potential_cached_titles_disambiguation:',potential_cached_titles_disambiguation)
            if (Object.keys(potential_cached_titles_disambiguation).length) {
                Object.entries(potential_cached_titles_disambiguation).forEach(function(entry) {
                    let ambiguous_arr = JSON.parse(JSON.stringify(entry[1]))
                    let ambiguous_titles = []
                    // console.log('[',second_pass,']  ==> IS AMBIGUOUS:',entry[0])
                    ambiguous_arr.forEach(function(game) {
                        // console.log('[',second_pass,']  ==> adding',game.unambiguous_name,'as unselected ambiguous title')
                        ambiguous_titles.push(game.unambiguous_name)
                    })
                    addUnselectedAmbiguousTitles(ambiguous_titles) 
                    new_messages.push({ message_str: 'A Which version of "'+ entry[0] + '": ', ambiguous: ambiguous_arr })
                })
                addMessages(new_messages)
                return
            }
        }

        // console.log('[',second_pass,'] uncached_ids:',uncached_ids)
        // STEP 1 API: If uncached IDs were submitted instead of titles, use BGG non-exact search API to convert IDs into titles.
        const searchresults_for_ids = await getNonexactSearchResults(uncached_ids)
        if (searchresults_for_ids.length === 1) {
            searchresults_for_ids[0].forEach(function(possible_match) {
                if (uncached_ids.includes(possible_match.id.toString())) {
                    uncached_titles.push(possible_match.name)
                }
            })
        }

        // console.log('[',second_pass,'] uncached_titles:',uncached_titles)
        // STEP 2 API: Use BGG exact search API to determine the unique titles.
        const searchresults_for_uncached = await getExactSearchResults(uncached_titles)
        searchresults_for_uncached.forEach(function(result,idx) {
            if (result.length === 1) {
                let new_game_to_lookup = {
                    id: result[0].id,
                    is_ambiguous: false
                }
                titles_for_api.push(new_game_to_lookup)
                // console.log('[',second_pass,']  ==> FOR API:',result[0].id, result[0].name)
            } else if (result.length > 1) {
                let years_published = result.map( ambiguous_result => ambiguous_result.year_published )
                let disambiguation_year = extractYearFromTitle(uncached_titles[idx])
                if (years_published.includes(parseInt(disambiguation_year))) {
                    ambiguous_titles.push(uncached_titles[idx])
                    // console.log('[',second_pass,']  ==> IS AMBIGUOUS:',uncached_titles[idx])
                } else {
                    ambiguous_titles.push(withoutYear(uncached_titles[idx])) // the given year was wrong, so strike the yeear input
                    // console.log('[',second_pass,']  ==> IS AMBIGUOUS:',withoutYear(uncached_titles[idx]))
                }
            } else if (!result.length) {
                new_messages.push({ message_str: 'ERROR: "' + uncached_titles[idx] + '" was not found in the BGG database'})
                addMessages(new_messages)
                return
            }
        })

        // console.log('[',second_pass,'] ambiguous_titles:',ambiguous_titles)
        // STEP 3 API: If unresolved titles remain, use BGG non-exact search API to determine the potential (ambiguous) titles.
        const searchresults_for_ambiguous = await getNonexactSearchResults(ambiguous_titles)
        let ambiguous_titles_info = {}
        // console.log('searchresults_for_ambiguous:', searchresults_for_ambiguous)
        if (searchresults_for_ambiguous.length) {
            searchresults_for_ambiguous.forEach(function(per_title_results) {
                let titles_given_with_disambiguation = ambiguous_titles.filter( title => title !== withoutYear(title) ).map( title => withoutYear(title) )
                let disambiguation_was_given = {}

                // identify any titles where disambiguation was given by the user
                per_title_results.forEach(function(possible_match) {
                    if (titles_given_with_disambiguation.includes(possible_match.name)) {
                        const unambiguous_name_from_results = possible_match.name + ' (' + possible_match.year_published + ')'
                        if (ambiguous_titles.includes(unambiguous_name_from_results)) {
                            disambiguation_was_given[possible_match.name] = true
                        }
                    }
                })

                per_title_results.forEach(function(possible_match) {

                    if (disambiguation_was_given.hasOwnProperty(possible_match.name)) {
                        // look up data for this game ID
                        let new_game_to_lookup = {
                            id: possible_match.id,
                            is_ambiguous: true
                        }
                        titles_for_api.push(new_game_to_lookup)
                        // console.log('[',second_pass,']  ==> FOR API:',possible_match.id,'Name:',possible_match.name)
                    }
                    // If no user-specified disambiguation, prompt the user for disambiguation
                    else if (!second_pass && ambiguityRemains && ambiguous_titles.includes(possible_match.name))  {

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

                        // look up data for this game ID
                        let new_game_to_lookup = {
                            id: possible_match.id,
                            is_ambiguous: true
                        }
                        titles_for_api.push(new_game_to_lookup)
                        // console.log('[',second_pass,']  ==> FOR API:',possible_match.id,'Name:',possible_match.name)
                    }
                })
                // console.log('ambiguous_titles_info:',ambiguous_titles_info)
                let title_disambiguation = Object.entries(ambiguous_titles_info)
                if (title_disambiguation.length) {
                    // console.log('ambiguous_titles_info does have some keys')
                    Object.entries(ambiguous_titles_info).forEach(function(entry) {
                        let ambiguous_arr = JSON.parse(JSON.stringify(entry[1]))
                        new_messages.push({ message_str: 'B Which version of "'+ entry[0] + '": ', ambiguous: ambiguous_arr })
                    })
                    addMessages(new_messages)
                    return
                }
            })
        }

        // console.log('[',second_pass,'] cached_titles:',cached_titles)
        // console.log('[',second_pass,'] titles_for_api:',titles_for_api)
        // STEP 4 API: For each ID collected from previous API results, use BGG game data API to get all of the game-specific details.
        const gamedata_results = await getGamedataResults(titles_for_api)

        // All APIs are done. Now integrate the game data with this app.

        cached_titles.forEach(function(title) {
            props.onaddcachedtitle(title)
        })

        let ambiguous_titles_without_year = ambiguous_titles.map( title => withoutYear(title) )
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
            let classes = {}
            message.ambiguous.forEach(function(game) {
                let new_classes = 'default-secondary-styles'
                let base_name = withoutYear(game.unambiguous_name)
                if (disambiguousTitleIsSelected.hasOwnProperty(base_name)
                    && disambiguousTitleIsSelected[base_name].hasOwnProperty(game.unambiguous_name)
                    && disambiguousTitleIsSelected[base_name][game.unambiguous_name]) {
                    new_classes += ' active-button'
                }
                classes[game.unambiguous_name] = new_classes
            })
            return (
                message.ambiguous.map( disambiguation => 
                    <button key={disambiguation.id} className={classes[disambiguation.unambiguous_name]} onClick={ (e) => selectUnambiguousTitle(disambiguation.unambiguous_name) }>{disambiguation.year_published}</button>
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
    activepoll: PropTypes.string.isRequired,
    cachedgametitles: PropTypes.object.isRequired,
    onaddcachedtitle: PropTypes.func.isRequired,
    onaddnewtitle: PropTypes.func.isRequired,
    oncachenewtitle: PropTypes.func.isRequired,
}