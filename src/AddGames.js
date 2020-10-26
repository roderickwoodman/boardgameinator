import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'
import { makeGamesActive } from './GameLibrary.js'


const withoutYear = (title) => {
    if (typeof title === 'string' && title.length) {
        return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '')
    } else {
        return title
    }
}

const validateUserTitles = async function (cached_titles, user_titles) { 

    const displayNameForMessages = function (title) {
        let all_cached_ids = Object.entries(cached_titles).map( cachedgame => parseInt(cachedgame[1].id) )
        if (all_cached_ids.includes(parseInt(title))) {
            let unambiguous_name = Object.values(cached_titles).filter( cachedgame => cachedgame.id === parseInt(title) )[0].unambiguous_name
            return '[#' + title + '] ' + unambiguous_name
        } else {
            return title
        }
    }

    let validation_result = {}, keep_modal_open = false

    // Collect cache information and new game data if necessary
    let result = await makeGamesActive(cached_titles, user_titles)

    // store the user input results in state
    let new_addingGames = {
        games_to_activate: JSON.parse(JSON.stringify(result.cached_inactive)),
        gamedata_to_activate: JSON.parse(JSON.stringify(result.unambiguous_gamedata)),
        ambiguous_cached: JSON.parse(JSON.stringify(result.ambiguous_cached)),
        ambiguous_gamedata: JSON.parse(JSON.stringify(result.ambiguous_gamedata)),
        ambiguous_title_count: Object.keys(result.ambiguous_cached).length + Object.keys(result.ambiguous_gamedata).length,
        selected_games_to_activate: [],
    }

    // Prompt the user for disambiguation
    let new_messages = []
    Object.entries(result.ambiguous_cached).forEach(function(ambiguous_cached_title_info) {
        let ambiguous_cachedids_arr = JSON.parse(JSON.stringify(ambiguous_cached_title_info[1]))
        new_messages.push({ message_str: 'Which version of "'+ ambiguous_cached_title_info[0] + '"? ', ambiguous: ambiguous_cachedids_arr })
    })
    Object.entries(result.ambiguous_gamedata).forEach(function(ambiguous_title_info) {
        // it was tagged as "ambiguous", but really this was the title corresponding to the user-supplied ID
        if (result.given_game_ids.hasOwnProperty(ambiguous_title_info[0])) {
            if (result.given_game_ids[ambiguous_title_info[0]] === ambiguous_title_info[1].id) {
                new_addingGames.selected_games_to_activate.push(ambiguous_title_info[1].unambiguous_name)
            }
        // this title was a user-supplied name string and still requires user disambiguation
        } else {
            let ambiguous_gamedata_arr = JSON.parse(JSON.stringify(ambiguous_title_info[1]))
            new_messages.push({ message_str: 'Which version of "'+ ambiguous_title_info[0] + '"? ', ambiguous: ambiguous_gamedata_arr })
            keep_modal_open = true
        }
    })
    validation_result['addingGames'] = new_addingGames

    // Prepend the game title with the game ID, when the ID was supplied by the user
    let game_id_txt = ''

    // Inform the user of all other games that could not be added
    let title_count_already_active = 0, title_names_already_active = ''
    for (let active_title of result.cached_active) {
        title_count_already_active += 1
        if (result.given_game_ids.hasOwnProperty(active_title)) {
            game_id_txt = '[#' + result.given_game_ids[active_title] + '] '
        } else {
            game_id_txt = ''
        }
        if (title_names_already_active !== '') {
            title_names_already_active += ', ' + game_id_txt + displayNameForMessages(active_title)
        } else {
            title_names_already_active += game_id_txt + displayNameForMessages(active_title)
        }
        keep_modal_open = true
    }
    if (title_count_already_active > 0) {
        let plural_txt = (title_count_already_active > 1) ? 's are' : ' is'
        new_messages.push({ message_str: 'ERROR: ' + title_count_already_active + ' title' + plural_txt + ' already active - ' + title_names_already_active })
        keep_modal_open = true
    }
    let title_count_does_not_exist = 0, title_names_does_not_exist = ''
    for (let nonexistent_title of result.does_not_exist) {
        title_count_does_not_exist += 1
        if (title_names_does_not_exist !== '') {
            title_names_does_not_exist += ', ' + nonexistent_title
        } else {
            title_names_does_not_exist += nonexistent_title
        }
        keep_modal_open = true
    }
    if (title_count_does_not_exist > 0) {
        let plural_txt = (title_count_does_not_exist > 1) ? 's do' : ' does'
        new_messages.push({ message_str: 'ERROR: ' + title_count_does_not_exist + ' title' + plural_txt + ' not exist - ' + title_names_does_not_exist })
    }

    // Inform the user of all other games that will be added
    let title_count_to_add = 0, title_names_to_add = ''
    for (let inactive_title of result.cached_inactive) {
        title_count_to_add += 1
        if (result.given_game_ids.hasOwnProperty(inactive_title)) {
            game_id_txt = '[#' + result.given_game_ids[inactive_title] + '] '
        } else {
            game_id_txt = ''
        }
        if (title_names_to_add !== '') {
            title_names_to_add += ', ' + game_id_txt + displayNameForMessages(inactive_title)
        } else {
            title_names_to_add += game_id_txt + displayNameForMessages(inactive_title)
        }
    }
    for (let unambiguous_new_title of Object.keys(result.unambiguous_gamedata)) {
        title_count_to_add += 1
        if (result.given_game_ids.hasOwnProperty(unambiguous_new_title)) {
            game_id_txt = '[#' + result.given_game_ids[unambiguous_new_title] + '] '
        } else {
            game_id_txt = ''
        }
        if (title_names_to_add !== '') {
            title_names_to_add += ', ' + game_id_txt + displayNameForMessages(unambiguous_new_title)
        } else {
            title_names_to_add += game_id_txt + displayNameForMessages(unambiguous_new_title)
        }
    }
    if (title_count_to_add > 0) {
        let other_txt = ( (Object.keys(result.ambiguous_cached).length > 0) 
                            || (Object.keys(result.ambiguous_gamedata).length > 0) 
                            || (result.does_not_exist.length > 0)
                            || (result.cached_active.length > 0) )
                            ? ' other' : ''
        let plural_txt = (title_count_to_add > 1) ? 's' : ''
        new_messages.push({ message_str: 'Adding ' + title_count_to_add + other_txt + ' title' + plural_txt + ' - ' + title_names_to_add })
    }
    validation_result['messages'] = new_messages
    validation_result['keep_modal_open'] = keep_modal_open

    return validation_result
}

const doAddGames = (games, add_fn) => {
    add_fn(games)
    return null
}

export const AddGames = (props) => {

    const [ userTitlesInput, setUserTitlesInput ] = useState('')
    const [ statusMessages, setStatusMessages ] = useState([])
    const [ addingGames, setAddingGames ] = useState({})
    const [ selectedGamesToActivate, setSelectedGamesToActivate ] = useState([])

    useEffect( () => {
        async function addRoutedGames() {
            if (props.routedgames.length > 0) {
                let validation_result = await validateUserTitles(props.cachedgametitles, props.routedgames)
                console.log('ROUTED validation_result:',validation_result)
                setAddingGames(validation_result.addingGames)
                newMessages(validation_result.messages)
                if (!validation_result.keep_modal_open) {
                    doAddGames(validation_result.addingGames, props.updateaddinggames)
                }
            }
        }
        addRoutedGames()
    }, [props])

    const newMessages = (new_messages) => {
        const newStatusMessages = [...new_messages]
        setStatusMessages(newStatusMessages)
    }

    const selectUnambiguousTitle = function (title_to_select) { 

        // only one title with the same base name can be selected
        let base_name_to_select = withoutYear(title_to_select)
        let updated_selectedGamesToActivate = selectedGamesToActivate.filter( selected_title => withoutYear(selected_title) !== base_name_to_select )
        updated_selectedGamesToActivate.push(title_to_select)
        setSelectedGamesToActivate(updated_selectedGamesToActivate)

        // merge the updated title selections in with the rest of the game data
        let updated_addingGames = addingGames
        updated_addingGames.selected_games_to_activate = JSON.parse(JSON.stringify(updated_selectedGamesToActivate))
        setAddingGames(updated_addingGames)

    }

    const handleChange = (event) => {
        setUserTitlesInput(event.target.value)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        let delimiter, num_nonblank_lines = userTitlesInput.split(/\r\n|\r|\n/).filter(line => line !== '').length
        if (num_nonblank_lines > 1) {
            delimiter = '\n'
        } else {
            delimiter = ','
        }
        let userTitles = userTitlesInput
            .split(delimiter)
            .map(str => str.trim())
            .map(str => str.replace(/[^0-9a-zA-Z:()&!–#' ]/g, ""))
            .filter( function(e){return e} )
        let validation_result = await validateUserTitles(props.cachedgametitles, Array.from(new Set(userTitles)))
        setAddingGames(validation_result.addingGames)
        newMessages(validation_result.messages)
        if (!validation_result.keep_modal_open) {
            doAddGames(validation_result.addingGames, props.updateaddinggames)
        }
    }

    const addButton = (message) => {
        if (message.hasOwnProperty('ambiguous')) {
            let classes = {}
            message.ambiguous.forEach(function(game) {
                let new_classes = 'default-secondary-styles'
                if (selectedGamesToActivate.includes(game.unambiguous_name)) {
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

    // console.log('state addingGames:',addingGames)
    let apply_button = ( (addingGames.hasOwnProperty('ambiguous_title_count') && addingGames.ambiguous_title_count > 0)
                       || (addingGames.hasOwnProperty('games_to_activate') && addingGames.games_to_activate.length > 0)
                       || (addingGames.hasOwnProperty('gamedata_to_activate') && Object.keys(addingGames.gamedata_to_activate).length > 0) )
    return (
        <React.Fragment>

        <h4>Add board game by title:</h4>

        <div id="input-section">
                <section id="input-by-title">
                    <section className="buttonrow">
                        <input size="30" value={userTitlesInput} onChange={handleChange} placeholder="(exact game title or BGG ID)" required/>
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
                { apply_button &&
                    <button className="default-primary-styles" onClick={doAddGames}>Apply</button>
                }
        </div>

        </React.Fragment>
    )
}

AddGames.propTypes = {
    closemymodal: PropTypes.func.isRequired,
    activepoll: PropTypes.string.isRequired,
    routedgames: PropTypes.array.isRequired,
    updateaddinggames: PropTypes.func.isRequired,
    cachedgametitles: PropTypes.object.isRequired,
    onaddcachedtitles: PropTypes.func.isRequired,
    onaddnewtitles: PropTypes.func.isRequired,
    oncachenewtitles: PropTypes.func.isRequired,
}