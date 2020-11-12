import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'
import { validateUserTitles } from './GameLibrary'


const withoutYear = (title) => {
    if (typeof title === 'string' && title.length) {
        return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '')
    } else {
        return title
    }
}

const doAddGames = (raw_validated_games, add_fn) => {

    // apply selected games to the ambiguous gamedata
    if (raw_validated_games.ambiguous_title_count !== 0) {

        let selected_base_names = raw_validated_games.selected_games_to_activate.map( unambiguous_name => withoutYear(unambiguous_name) )
        let updated_new_gamedata_to_activate = []
        let updated_new_gamedata_to_cache = []
        Object.entries(raw_validated_games.ambiguous_new_gamedata).forEach(function(possible_versions) {
            possible_versions[1].forEach(function(game_version) {
                let new_gamedata = JSON.parse(JSON.stringify(game_version))
                if (selected_base_names.includes(game_version.name)) {
                    if (raw_validated_games.selected_games_to_activate.includes(game_version.unambiguous_name)) {
                        updated_new_gamedata_to_activate.push(new_gamedata)
                    } else {
                        updated_new_gamedata_to_cache.push(new_gamedata)
                    }
                    delete raw_validated_games.ambiguous_new_gamedata[possible_versions[0]]
                    raw_validated_games.selected_games_to_activate = raw_validated_games.selected_games_to_activate.filter( game => game.name !== possible_versions[0] )
                }
            })
        })
        raw_validated_games.new_gamedata_to_activate = updated_new_gamedata_to_activate
        raw_validated_games.new_gamedata_to_cache = updated_new_gamedata_to_cache

        // apply selected games to the ambiguous cached games
        Object.entries(raw_validated_games.ambiguous_cached_games).forEach(function(possible_versions) {
            possible_versions[1].forEach(function(game_version) {
                if (raw_validated_games.selected_games_to_activate.includes(game_version.unambiguous_name)) {
                    raw_validated_games.cached_games_to_activate.push(game_version.unambiguous_name)
                    delete raw_validated_games.ambiguous_cached_games[possible_versions[0]]
                }
            })
        })

        raw_validated_games.ambiguous_title_count -= selected_base_names.length
        raw_validated_games.selected_games_to_activate = []

        add_fn(raw_validated_games)

    } else {
        add_fn(raw_validated_games)
    }
}

export const AddGames = (props) => {

    const [ userTitlesInput, setUserTitlesInput ] = useState('')
    const [ statusMessages, setStatusMessages ] = useState([])
    const [ gameValidations, setGameValidations ] = useState({})
    const [ selectedGamesToActivate, setSelectedGamesToActivate ] = useState([])

    useEffect( () => {
        async function addRoutedGames() {
            if (props.routedgames.new_list.length > 0) {
                let validation_result = await validateUserTitles(props.cachedgametitles, props.routedgames.new_list)
                validation_result.gameValidations['routed_games_treatment'] = 'replace'
                console.log('ROUTED validation_result:',validation_result)
                setGameValidations(validation_result.gameValidations)
                newMessages(validation_result.messages)
                if (!validation_result.keep_modal_open) {
                    doAddGames(validation_result.gameValidations, props.updategamevalidations)
                    return null
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
        let updated_selectedGamesToActivate = [...selectedGamesToActivate]
        updated_selectedGamesToActivate = updated_selectedGamesToActivate.filter( selected_title => withoutYear(selected_title) !== base_name_to_select )
        updated_selectedGamesToActivate.push(title_to_select)
        setSelectedGamesToActivate(updated_selectedGamesToActivate)

        // merge the updated title selections in with the rest of the game data
        let updated_gameValidations = JSON.parse(JSON.stringify(gameValidations))
        updated_gameValidations['selected_games_to_activate'] = JSON.parse(JSON.stringify(updated_selectedGamesToActivate))

        setGameValidations(updated_gameValidations)

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
        setGameValidations(validation_result.gameValidations)
        newMessages(validation_result.messages)
        if (!validation_result.keep_modal_open) {
            doAddGames(validation_result.gameValidations, props.updategamevalidations)
            return null
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

    const clickApply = () => {
        doAddGames(gameValidations, props.updategamevalidations)
        return null
    }

    let apply_button = ( (gameValidations.hasOwnProperty('ambiguous_title_count') && gameValidations.ambiguous_title_count > 0)
                       || (gameValidations.hasOwnProperty('cached_games_to_activate') && gameValidations.cached_games_to_activate.length > 0)
                       || (gameValidations.hasOwnProperty('new_gamedata_to_activate') && Object.keys(gameValidations.new_gamedata_to_activate).length > 0) )
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
                    <button className="default-primary-styles" onClick={clickApply}>Apply</button>
                }
        </div>

        </React.Fragment>
    )
}

AddGames.propTypes = {
    routedgames: PropTypes.object.isRequired,
    updategamevalidations: PropTypes.func.isRequired,
    cachedgametitles: PropTypes.object.isRequired,
}