import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortAmountDown } from '@fortawesome/free-solid-svg-icons'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { faUser, faUserSlash } from '@fortawesome/free-solid-svg-icons'

export const ViewControls = (props) => {

    const [sortIsOpen, setSortIsOpen] = useState(false)
    const [filterIsOpen, setFilterIsOpen] = useState(false)
    const [userIsOpen, setUserIsOpen] = useState(false)
    const [usernameInput, setUsernameInput] = useState('')
    const [validatedUsername, setValidatedUsername] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')

    const inputEl = useRef(null)

    useEffect(() => {
        if (userIsOpen) {
            inputEl.current.focus()
        }
    })

    const showSortModal = () => {
        setFilterIsOpen(false)
        setUserIsOpen(false)
        setSortIsOpen(true)
    }

    const hideSortModal = () => {
        setSortIsOpen(false)
    }

    const showFilterModal = () => {
        setSortIsOpen(false)
        setUserIsOpen(false)
        setFilterIsOpen(true)
    }

    const hideFilterModal = () => {
        setFilterIsOpen(false)
    }

    const showUserModal = () => {
        setSortIsOpen(false)
        setFilterIsOpen(false)
        setUserIsOpen(true)
    }

    const hideUserModal = () => {
        setUserIsOpen(false)
    }

    const handleChange = (event) => {
        event.preventDefault()
        const userInput = event.target.value
        setUsernameInput(userInput)
        const sanitizedInput = userInput.replace(/[^A-Za-z.-]/g," ")
        let validated = null
        if (userInput.length < 3 && userInput.length > 0) {
            setErrorMessage('ERROR: username must be at least 3 characters')
        } else if (sanitizedInput !== userInput) {
            setErrorMessage('ERROR: invalid characters were detected')
        } else if (userInput.length > 16) {
            setErrorMessage('ERROR: username cannot be more than 16 characters')
        } else if (userInput.length !== 0) {
            setErrorMessage('')
            validated = userInput
        }
        setValidatedUsername(validated)
    }

    const handleSubmit = (event) => {
        if (validatedUsername !== null) {
            props.onuserchange(usernameInput)
        }
    }

    const userIcon = (user) => {
        if (user === null) {
            return (
                <span>
                    <FontAwesomeIcon icon={faUserSlash} />
                </span>
            )
        } else {
            return (
                <span>
                    {props.user} <FontAwesomeIcon icon={faUser} />
                </span>
            )
        }
    }

    const handleUserClick = (event) => {
        if (props.user === null) {
            showUserModal()
        } else {
            setUsernameInput('')
            props.onuserchange(null)
        }
    }

    return (
        <React.Fragment>
        <div id="view-controls">

            <button className={(props.user === null) ? "fa fa-button user loggedout" : "fa fa-button user"} onClick={handleUserClick}>{userIcon(props.user)}</button>
            <Modal size="md" show={userIsOpen} onHide={hideUserModal}>
                <ModalBody>
                    <h4>Enter a username for yourself:</h4>
                    <section id="input-username">
                        <section className="buttonrow">
                            <input ref={inputEl} size="30" value={usernameInput} onChange={handleChange} placeholder="(your username)" required/>
                            <button onClick={handleSubmit} className="default-primary-styles">OK</button>
                        </section>
                        <p className="error">{errorMessage}</p>
                    </section>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-primary-styles" onClick={hideUserModal}>Close</button>
                </ModalFooter>
            </Modal>

            <button className="fa fa-button" onClick={showSortModal}><FontAwesomeIcon icon={faSortAmountDown}/></button>
            <Modal size="md" show={sortIsOpen} onHide={hideSortModal}>
                <ModalBody>
                    <div id="gamesorting-controls">
                        <h4>Order the board games by the...</h4>
                        <button className={`default-secondary-styles ${(props.sortby === 'alphabetical') ? 'active-button' : ''}`} onClick={ (e) => props.onsortchange(e, "alphabetical") }>alphabetical order</button>
                        <button className={`default-secondary-styles ${(props.sortby === 'maxtitlevotes') ? 'active-button' : ''}`} onClick={ (e) => props.onsortchange(e, "maxtitlevotes") }>most title votes</button>
                        <button className={`default-secondary-styles ${(props.sortby === 'maxattrvotes') ? 'active-button' : ''}`} onClick={ (e) => props.onsortchange(e, "maxattrvotes") }>most attribute votes</button>
                        <button className={`default-secondary-styles ${(props.sortby === 'minplaytime') ? 'active-button' : ''}`} onClick={ (e) => props.onsortchange(e, "minplaytime") }>shortest playtime</button>
                        <button className={`default-secondary-styles ${(props.sortby === 'maxplayers') ? 'active-button' : ''}`} onClick={ (e) => props.onsortchange(e, "maxplayers") }>most players</button>
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-primary-styles" onClick={hideSortModal}>Close</button>
                </ModalFooter>
            </Modal>

            <button className="fa fa-button" onClick={showFilterModal}><FontAwesomeIcon icon={faFilter}/></button>
            <Modal size="md" show={filterIsOpen} onHide={hideFilterModal}>
                <ModalBody>
                    <div id="gamefiltering-controls">
                        { props.activepoll.id !== 'local' &&
                        <p className="warning">INFO: Filtering is disabled while a poll is selected.</p>
                        }
                        <h4>Show me only the board games matching an...</h4>
                        <button className={`default-secondary-styles ${(props.filtertitles) ? 'active-button' : ''}`} onClick={ (e) => props.onfilterchange(e, "titles") }>upvoted title</button>
                        <button className={`default-secondary-styles ${(props.filterplayercount) ? 'active-button' : ''}`} onClick={ (e) => props.onfilterchange(e, "playercount") }>upvoted player count</button>
                        <button className={`default-secondary-styles ${(props.filterweight) ? 'active-button' : ''}`} onClick={ (e) => props.onfilterchange(e, "weight") }>upvoted weight</button>
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-primary-styles" onClick={hideFilterModal}>Close</button>
                </ModalFooter>
            </Modal>

        </div>
        </React.Fragment>
    )
}

ViewControls.propTypes = {
    user: PropTypes.string,
    activepoll: PropTypes.object.isRequired,
    sortby: PropTypes.string.isRequired,
    onsortchange: PropTypes.func.isRequired,
    filtertitles: PropTypes.bool.isRequired,
    filterplayercount: PropTypes.bool.isRequired,
    filterweight: PropTypes.bool.isRequired,
    onfilterchange: PropTypes.func.isRequired,
    onuserchange: PropTypes.func.isRequired,
}