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

    // apply selected games to the data to be cached
    let validated_games = JSON.parse(JSON.stringify(raw_validated_games))
    validated_games.new_gamedata_to_activate = []
    validated_games.new_gamedata_to_cache = []
    raw_validated_games.new_gamedata_to_cache.forEach(function(gamedata) {
        if (raw_validated_games.selected_games_to_activate.includes(gamedata.unambiguous_name)) {
            validated_games.new_gamedata_to_activate.push(gamedata)
        } else {
            validated_games.new_gamedata_to_cache.push(gamedata)
        }
    })
    add_fn(validated_games)
    return null
}

export const AddGames = (props) => {

    const [ userTitlesInput, setUserTitlesInput ] = useState('')
    const [ statusMessages, setStatusMessages ] = useState([])
    const [ gameValidations, setGameValidations ] = useState({})
    const [ selectedGamesToActivate, setSelectedGamesToActivate ] = useState([])

    useEffect( () => {
        async function addRoutedGames() {
            if (props.routedgames.length > 0) {
                let validation_result = await validateUserTitles(props.cachedgametitles, props.routedgames)
                console.log('ROUTED validation_result:',validation_result)
                setGameValidations(validation_result.gameValidations)
                newMessages(validation_result.messages)
                if (!validation_result.keep_modal_open) {
                    doAddGames(validation_result.gameValidations, props.updategamevalidations)
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

        let selected_gameValidations = JSON.parse(JSON.stringify(gameValidations))

        // // apply selections to determine whether to cache or make active each set of game data
        // let new_gamedata_to_activate = JSON.parse(JSON.stringify(gameValidations.unambiguous_gamedata))
        // let new_gamedata_to_cache = []
        // Object.values(selected_gameValidations.ambiguous_gamedata).forEach(possibilities => {
        //     possibilities.forEach(possible_gamedata => {
        //         let new_gamedata = JSON.parse(JSON.stringify(possible_gamedata))
        //         if (selected_gameValidations.selected_games_to_activate.includes(possible_gamedata.unambiguous_name)) {
        //             new_gamedata_to_activate.push(new_gamedata)
        //         } else {
        //             new_gamedata_to_cache.push(new_gamedata)
        //         }
        //     })
        // })
        // selected_gameValidations['new_gamedata_to_activate'] = new_gamedata_to_activate
        // selected_gameValidations['new_gamedata_to_cache'] = new_gamedata_to_cache

        // // apply selections to determine which cached games to make active
        // let cached_games_to_activate = [ ...gameValidations.games_to_activate ]
        // Object.values(selected_gameValidations.ambiguous_cached).forEach(possibilities => {
        //     possibilities.forEach(possible_game => {
        //         if (selected_gameValidations.selected_games_to_activate.includes(possible_game.unambiguous_name)) {
        //             cached_games_to_activate.push(possible_game.unambiguous_name)
        //         }
        //     })
        // })
        // selected_gameValidations['cached_games_to_activate'] = cached_games_to_activate

        // new_gamedata_to_cache
        // new_gamedata_to_activate
        // cached_games_to_activate

        doAddGames(selected_gameValidations, props.updategamevalidations)
        return null
    }

    let apply_button = ( (gameValidations.hasOwnProperty('ambiguous_title_count') && gameValidations.ambiguous_title_count > 0)
                       || (gameValidations.hasOwnProperty('games_to_activate') && gameValidations.games_to_activate.length > 0)
                       || (gameValidations.hasOwnProperty('gamedata_to_activate') && Object.keys(gameValidations.gamedata_to_activate).length > 0) )
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
    routedgames: PropTypes.array.isRequired,
    updategamevalidations: PropTypes.func.isRequired,
    cachedgametitles: PropTypes.object.isRequired,
}