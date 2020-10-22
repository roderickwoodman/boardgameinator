import React, { useState } from 'react'
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

export const AddGames = (props) => {

    const [ userTitlesInput, setUserTitlesInput ] = useState('')
    const [ statusMessages, setStatusMessages ] = useState([])
    const [ addingGames, setAddingGames ] = useState({})
    const [ selectedGamesToActivate, setSelectedGamesToActivate ] = useState([])

    const addMessages = (new_messages) => {
        const newStatusMessages = [...statusMessages, ...new_messages]
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

    const validateUserTitles = async function (user_titles) { 

        // Collect cache information and new game data if necessary
        let result = await makeGamesActive(props.cachedgametitles, user_titles)

        // store the user input results in state
        let new_addingGames = {
            games_to_activate: JSON.parse(JSON.stringify(result.cached_inactive)),
            gamedata_to_activate: JSON.parse(JSON.stringify(result.unambiguous_gamedata)),
            ambiguous_cached: JSON.parse(JSON.stringify(result.ambiguous_cached)),
            ambiguous_gamedata: JSON.parse(JSON.stringify(result.ambiguous_gamedata)),
            ambiguous_title_count: Object.keys(result.ambiguous_cached).length + Object.keys(result.ambiguous_gamedata).length,
            selected_games_to_activate: [],
        }
        setAddingGames(new_addingGames)

        // Prompt the user for disambiguation
        let new_messages = []
        Object.entries(result.ambiguous_cached).forEach(function(ambiguous_cached_title_info) {
            let ambiguous_cachedids_arr = JSON.parse(JSON.stringify(ambiguous_cached_title_info[1]))
            new_messages.push({ message_str: 'Which version of "'+ ambiguous_cached_title_info[0] + '": ', ambiguous: ambiguous_cachedids_arr })
        })
        Object.entries(result.ambiguous_gamedata).forEach(function(ambiguous_title_info) {
            let ambiguous_gamedata_arr = JSON.parse(JSON.stringify(ambiguous_title_info[1]))
            new_messages.push({ message_str: 'Which version of "'+ ambiguous_title_info[0] + '": ', ambiguous: ambiguous_gamedata_arr })
        })

        // Inform the user of all other games that will be added
        let title_count_to_add = 0, title_names_to_add = ''
        for (let inactive_title of result.cached_inactive) {
            title_count_to_add += 1
            if (title_names_to_add !== '') {
                title_names_to_add += ', ' + inactive_title
            } else {
                title_names_to_add += inactive_title
            }
        }
        for (let unambiguous_new_title of Object.keys(result.unambiguous_gamedata)) {
            title_count_to_add += 1
            if (title_names_to_add !== '') {
                title_names_to_add += ', ' + unambiguous_new_title
            } else {
                title_names_to_add += unambiguous_new_title
            }
        }
        new_messages.push({ message_str: 'Adding ' + title_count_to_add + ' other titles: ' + title_names_to_add })

        // Inform the user of all other games that could not be added
        let title_count_already_active = 0, title_names_already_active = ''
        for (let active_title of result.cached_active) {
            title_count_already_active += 1
            if (title_names_already_active !== '') {
                title_names_already_active += ', ' + active_title
            } else {
                title_names_already_active += active_title
            }
        }
        new_messages.push({ message_str: 'ERROR: ' + title_count_already_active + ' titles are already active: ' + title_names_already_active })
        let title_count_does_not_exist = 0, title_names_does_not_exist = ''
        for (let nonexistent_title of result.does_not_exist) {
            title_count_does_not_exist += 1
            if (title_names_does_not_exist !== '') {
                title_names_does_not_exist += ', ' + nonexistent_title
            } else {
                title_names_does_not_exist += nonexistent_title
            }
        }
        new_messages.push({ message_str: 'ERROR: ' + title_count_does_not_exist + ' titles do not exist: ' + title_names_does_not_exist })

        // Update the view
        addMessages(new_messages)

    }

    const handleChange = (event) => {
        setUserTitlesInput(event.target.value)
    }

    const handleSubmit = (event) => {
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
        validateUserTitles(Array.from(new Set(userTitles)))
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

    const doAddGames = () => {
        props.updateaddinggames(addingGames)
        return null
    }

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
                { addingGames.hasOwnProperty('ambiguous_title_count') && addingGames.ambiguous_title_count > 0 &&
                    <button className="default-primary-styles" onClick={doAddGames}>Apply</button>
                }
        </div>

        </React.Fragment>
    )
}

AddGames.propTypes = {
    closemymodal: PropTypes.func.isRequired,
    activepoll: PropTypes.string.isRequired,
    updateaddinggames: PropTypes.func.isRequired,
    cachedgametitles: PropTypes.object.isRequired,
    onaddcachedtitles: PropTypes.func.isRequired,
    onaddnewtitles: PropTypes.func.isRequired,
    oncachenewtitles: PropTypes.func.isRequired,
}