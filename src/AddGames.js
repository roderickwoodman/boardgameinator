import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'
import { importpollApi } from './Api.js'
import { validateUserTitles } from './GameLibrary'
import Spinner from 'react-bootstrap/Spinner'


const withoutYear = (title) => {
    if (typeof title === 'string' && title.length) {
        return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '')
    } else {
        return title
    }
}

const doAddGames = (rawValidatedGames, add_fn) => {

    // apply selected games to the ambiguous gamedata
    if (rawValidatedGames.ambiguousTitleCount !== 0) {

        const selectedBaseNames = rawValidatedGames.selectedGamesToActivate.map( unambiguousName => withoutYear(unambiguousName) )
        let updatedNewGamedataToActivate = []
        let updatedNewGamedataToCache = []
        Object.entries(rawValidatedGames.ambiguousNewGamedata).forEach(function(possibleVersions) {
            possibleVersions[1].forEach(function(gameVersion) {
                const newGamedata = JSON.parse(JSON.stringify(gameVersion))
                if (selectedBaseNames.includes(gameVersion.name)) {
                    if (rawValidatedGames.selectedGamesToActivate.includes(gameVersion.unambiguousName)) {
                        updatedNewGamedataToActivate.push(newGamedata)
                    } else {
                        updatedNewGamedataToCache.push(newGamedata)
                    }
                    delete rawValidatedGames.ambiguousNewGamedata[possibleVersions[0]]
                    rawValidatedGames.selectedGamesToActivate = rawValidatedGames.selectedGamesToActivate.filter( game => game.name !== possibleVersions[0] )
                }
            })
        })
        rawValidatedGames.newGamedataToActivate = updatedNewGamedataToActivate
        rawValidatedGames.newGamedataToCache = updatedNewGamedataToCache

        // apply selected games to the ambiguous cached games
        Object.entries(rawValidatedGames.ambiguous_cached_games).forEach(function(possibleVersions) {
            possibleVersions[1].forEach(function(gameVersion) {
                if (rawValidatedGames.selectedGamesToActivate.includes(gameVersion.unambiguousName)) {
                    rawValidatedGames.cachedGamesToActivate.push(gameVersion.unambiguousName)
                    delete rawValidatedGames.ambiguous_cached_games[possibleVersions[0]]
                }
            })
        })

        rawValidatedGames.ambiguousTitleCount -= selectedBaseNames.length
        rawValidatedGames.selectedGamesToActivate = []

        add_fn(rawValidatedGames)

    } else {
        add_fn(rawValidatedGames)
    }
}

export const AddGames = (props) => {

    const [ userTitlesInput, setUserTitlesInput ] = useState('')
    const [ statusMessages, setStatusMessages ] = useState([])
    const [ gameValidations, setGameValidations ] = useState({})
    const [ selectedGamesToActivate, setSelectedGamesToActivate ] = useState([])
    const [ loading, setLoading ] = useState(false)

    const inputEl = useRef(null)

    useEffect( () => {

        if (inputEl.current !== null) {
            inputEl.current.focus()
        }

        async function addRoutedGames() {

            // routing by poll ID
            if (props.routedGames.hasOwnProperty('pollId') && props.routedGames.pollId !== null) {
                const importedPoll = importpollApi(props.routedGames.pollId)
                if (importedPoll !== null) {
                    props.onViewPoll(importedPoll)
                }

            // routing by game ID(s)
            } else {
                let validationList = [], routingTreatment = 'none'
                if (props.routedGames.hasOwnProperty('newList') && props.routedGames.newList.length > 0) {
                    validationList = [...props.routedGames.newList]
                    routingTreatment = 'replace'
                } else if (props.routedGames.hasOwnProperty('addtoList') && props.routedGames.addtoList.length > 0) {
                    validationList = [...props.routedGames.addtoList]
                    routingTreatment = 'append'
                }
                if (validationList.length > 0) {
                    setLoading(true)
                    let validationResult = await validateUserTitles(props.cachedGameTitles, validationList)
                    validationResult.gameValidations['routedGamesTreatment'] = routingTreatment
                    setGameValidations(validationResult.gameValidations)
                    newMessages(validationResult.messages)
                    if (!validationResult.keepModalOpen) {
                        doAddGames(validationResult.gameValidations, props.updateGameValidations)
                        return null
                    } else {
                        setLoading(false)
                    }
                }
            }
        }
        addRoutedGames()
    }, [props])

    const newMessages = (newMessages) => {
        const newStatusMessages = [...newMessages]
        setStatusMessages(newStatusMessages)
    }

    const selectUnambiguousTitle = function (titleToSelect) { 

        // only one title with the same base name can be selected
        let baseNameToSelect = withoutYear(titleToSelect)
        let updatedSelectedGamesToActivate = [...selectedGamesToActivate]
        updatedSelectedGamesToActivate = updatedSelectedGamesToActivate.filter( selectedTitle => withoutYear(selectedTitle) !== baseNameToSelect )
        updatedSelectedGamesToActivate.push(titleToSelect)
        setSelectedGamesToActivate(updatedSelectedGamesToActivate)

        // merge the updated title selections in with the rest of the game data
        let updatedGameValidations = JSON.parse(JSON.stringify(gameValidations))
        updatedGameValidations['selectedGamesToActivate'] = JSON.parse(JSON.stringify(updatedSelectedGamesToActivate))

        setGameValidations(updatedGameValidations)

    }

    const handleChange = (event) => {
        event.preventDefault()
        setUserTitlesInput(event.target.value)
    }

    const handleGetMeStarted = async (event) => {
        event.preventDefault()
        processAddGamesRequest('148228, 199478, 172081, 175914, 126163, 178900, 251678, 6830, 93, 73439, 132531, 194655')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        processAddGamesRequest(userTitlesInput)
    }

    const processAddGamesRequest = async (requestedGames) => {
        let delimiter, numNonblankLines = requestedGames.split(/\r\n|\r|\n/).filter(line => line !== '').length
        if (numNonblankLines > 1) {
            delimiter = '\n'
        } else {
            delimiter = ','
        }
        const userTitles = requestedGames
            .split(delimiter)
            .map(str => str.trim())
            .map(str => str.replace(/[^0-9a-zA-Z:.()&!–#' ]/g, ""))
            .filter( function(e){return e} )
        setLoading(true)
        const validationResult = await validateUserTitles(props.cachedGameTitles, Array.from(new Set(userTitles)))
        setGameValidations(validationResult.gameValidations)
        newMessages(validationResult.messages)
        if (!validationResult.keepModalOpen) {
            doAddGames(validationResult.gameValidations, props.updateGameValidations)
            return null
        } else {
            setLoading(true)
        }
    }

    const prependTitles = (message) => {
        if (message.hasOwnProperty('prependTitles') && message.prependTitles.length) {
            return (
                message.prependTitles.map( (title, idx) => 
                    (idx === 0)
                    ? <span key={idx} className="title">{title}</span>
                    : <span>, <span key={idx} className="title">{title}</span></span>
                )
            )
        } else {
            return null
        }
    }

    const appendTitles = (message) => {
        if (message.hasOwnProperty('appendTitles') && message.appendTitles.length) {
            return (
                message.appendTitles.map( (title, idx) => 
                    (idx === 0)
                    ? <span key={idx}> - <span className="title">{title}</span></span>
                    : <span key={idx}>, <span className="title">{title}</span></span>
                )
            )
        } else {
            return null
        }
    }

    const addButton = (message) => {
        if (message.hasOwnProperty('ambiguous')) {
            let classes = {}
            message.ambiguous.forEach(function(game) {
                let new_classes = 'default-secondary-styles'
                if (selectedGamesToActivate.includes(game.unambiguousName)) {
                    new_classes += ' active-button'
                }
                classes[game.unambiguousName] = new_classes
            })
            return (
                message.ambiguous.map( disambiguation => 
                    <button key={disambiguation.id} className={classes[disambiguation.unambiguousName]} onClick={ (e) => selectUnambiguousTitle(disambiguation.unambiguousName) }>{disambiguation.yearPublished}</button>
                )
            )
        } else {
            return null
        }
    }

    const clickApply = () => {
        doAddGames(gameValidations, props.updateGameValidations)
        return null
    }

    const applyButton = ( (gameValidations.hasOwnProperty('ambiguousTitleCount') && gameValidations.ambiguousTitleCount > 0)
                       || (gameValidations.hasOwnProperty('cachedGamesToActivate') && gameValidations.cachedGamesToActivate.length > 0)
                       || (gameValidations.hasOwnProperty('newGamedataToActivate') && Object.keys(gameValidations.newGamedataToActivate).length > 0) )

    const activeTitleCount = Object.values(props.cachedGameTitles).filter( cachedata => cachedata.active ).length

    const show_error = props.activePoll.id !== 'local'

    if (show_error) {
        return (
            <div id="input-section">
                <p className="warning">INFO: Adding of games is disabled while a poll is selected. Use "Import Poll" button to deselect it.</p>
            </div>
        )
    } else {
        return (
            <React.Fragment>
            <h4>Add board game by title:</h4>

            <div id="input-section">
                    <section id="input-by-title">
                        <section className="buttonrow">
                            <input ref={inputEl} size="30" value={userTitlesInput} onChange={handleChange} placeholder="(exact game titles or BGG IDs)" required/>
                            <button onClick={handleSubmit} className="default-primary-styles">Add</button>
                            { loading && !statusMessages.length &&
                                <Spinner animation="border" size="sm" />
                            }
                        </section>
                        { !statusMessages.length && !activeTitleCount ?
                        <div>
                            <section>
                                OR
                            </section>
                            <section className="buttonrow">
                                <button onClick={handleGetMeStarted} className="default-primary-styles">Show me some games!</button>
                            </section>
                        </div>
                        : null
                        }
                        <div className="status-messages">
                            { statusMessages
                                .map(
                                    (message, i) => {
                                        return (message.hasOwnProperty('error_flag') && message.error_flag)
                                        ? <p key={i} className="message error">ERROR: {prependTitles(message)} {message.message_str}{appendTitles(message)} {addButton(message)}</p>
                                        : <p key={i} className="message"><FontAwesomeIcon icon={faLongArrowAltRight} /> {prependTitles(message)} {message.message_str}{appendTitles(message)} {addButton(message)}</p>
                                    }
                                )
                            }
                        </div>
                    </section>
                    { applyButton &&
                        <button className="default-primary-styles" onClick={clickApply}>Apply</button>
                    }
            </div>
            </React.Fragment>
        )
    }

}

AddGames.propTypes = {
    activePoll: PropTypes.object.isRequired,
    onViewPoll: PropTypes.func.isRequired,
    routedGames: PropTypes.object.isRequired,
    updateGameValidations: PropTypes.func.isRequired,
    cachedGameTitles: PropTypes.object.isRequired,
}