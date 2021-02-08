import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { AddGames } from './AddGames'
import { VoteAttributes } from './VoteAttributes'
import { VoteTitles } from './VoteTitles'
import { ImportPoll } from './ImportPoll'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboard } from '@fortawesome/free-solid-svg-icons'


export const MainControls = (props) => {

    const [addIsOpen, setAddIsOpen] = useState(false)
    const [voteAttributesIsOpen, setVoteAttributesIsOpen] = useState(false)
    const [voteAttributesErrorIsOpen, setVoteAttributesErrorIsOpen] = useState(false)
    const [voteTitlesIsOpen, setVoteTitlesIsOpen] = useState(false)
    const [importPollIsOpen, setImportPollIsOpen] = useState(false)

    const showAddModal = () => {
        setVoteAttributesIsOpen(false)
        setVoteAttributesErrorIsOpen(false)
        setVoteTitlesIsOpen(false)
        setImportPollIsOpen(false)
        setAddIsOpen(true)
    }

    const hideAddModal = () => {
        setAddIsOpen(false)
    }

    const showVoteAttributesModal = () => {
        setAddIsOpen(false)
        setVoteTitlesIsOpen(false)
        setImportPollIsOpen(false)
        setVoteAttributesErrorIsOpen(false)
        setVoteAttributesIsOpen(true)
    }

    const hideVoteAttributesModal = () => {
        setVoteAttributesIsOpen(false)
    }

    const showVoteAttributesErrorModal = () => {
        setAddIsOpen(false)
        setVoteTitlesIsOpen(false)
        setImportPollIsOpen(false)
        setVoteAttributesIsOpen(false)
        setVoteAttributesErrorIsOpen(true)
    }

    const hideVoteAttributesErrorModal = () => {
        setVoteAttributesErrorIsOpen(false)
    }

    const showVoteTitlesModal = () => {
        setAddIsOpen(false)
        setVoteAttributesIsOpen(false)
        setVoteAttributesErrorIsOpen(false)
        setImportPollIsOpen(false)
        setVoteTitlesIsOpen(true)
    }

    const hideVoteTitlesModal = () => {
        setVoteTitlesIsOpen(false)
    }

    const showImportPollModal = () => {
        setAddIsOpen(false)
        setVoteAttributesIsOpen(false)
        setVoteAttributesErrorIsOpen(false)
        setVoteTitlesIsOpen(false)
        setImportPollIsOpen(true)
    }

    const hideImportPollModal = () => {
        setImportPollIsOpen(false)
    }

    const updateGameValidations = (validatedGameAdditions) => {
        hideAddModal()
        props.addValidatedGames(validatedGameAdditions)
    }

    useEffect( () => {
        if (props.activeGameData.length === 0) {
            showAddModal()
        } else {
            hideAddModal()
        }
    }, [props])

    let numTitleVotes = 0
    for (const gameId in props.activeThumbs.titles) {
        for (const vote of Object.keys(props.activeThumbs.titles[gameId])) {
            numTitleVotes += props.activeThumbs.titles[gameId][vote].length
        }
    }

    const numAttrVotes = Object.keys(props.activeThumbs.attributes.players).length
    + Object.keys(props.activeThumbs.attributes.weight).length
    + Object.keys(props.activeThumbs.attributes.category).length
    + Object.keys(props.activeThumbs.attributes.mechanic).length

    const handleCopyToClipboard = () => {
        let games = "?newlist="
        if (props.activeGameData.length) {
            props.activeGameData.forEach((game) => {
                if (games === "?newlist=") {
                    games += game.id
                } else {
                    games = games + "+" + game.id
                }
            })
        } else {
            games = ""
        }
        games = window.location.href + games
        let clipboardElement = document.getElementById("games-clipboard")
        clipboardElement.value = games
        clipboardElement.select()
        document.execCommand("copy")
    }

    const clipboardValue = ""
    const inlineStyle = {
        position: "absolute",
        left: "-1000px",
        top: "-1000px"
    }

    const AddModal = () => {
        return (
            <React.Fragment>
            <button className="default-primary-styles" onClick={showAddModal}>Add Games</button>
            <Modal size="md" backdrop="static" show={addIsOpen} onHide={hideAddModal}>
                <ModalBody>
                    <div id="gameinput-controls">
                        <AddGames
                            activePoll={props.activePoll}
                            onViewPoll={props.onViewPoll}
                            routedGames={props.routedGames}
                            updateGameValidations={updateGameValidations}
                            cachedGameTitles={props.cachedGameTitles} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-primary-styles" onClick={hideAddModal}>Close</button>
                </ModalFooter>
            </Modal>
            </React.Fragment>
        )
    }

    const VoteTitlesModal = () => {
        return (
            <React.Fragment>
            <button className="default-primary-styles" onClick={showVoteTitlesModal}>Vote Games</button>
            <Modal size="md" show={voteTitlesIsOpen} onHide={hideVoteTitlesModal}>
                <ModalBody>
                    <div id="title-voting-controls">
                        { (props.activePoll.id !== 'local') &&
                        <p className="warning">INFO: Voting on titles in a poll is not yet supported.</p>
                        }
                        <VoteTitles
                            user={props.user}
                            activeGameData={props.activeGameData} 
                            titlethumbs={props.activeThumbs.titles} 
                            onNewVote={props.onNewVote}
                            onDeleteAll={props.onDeleteAll} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    { props.activePoll.id === 'local' && 
                        <React.Fragment>
                            <button className="default-danger-styles" onClick={props.onDeleteAll} disabled={props.activeGameData.length===0}>Remove All Games</button>
                            <button className="default-danger-styles" data-votingtype="allTitles" onClick={props.onClearSectionVotes} disabled={numTitleVotes===0}>Remove All Title Votes</button>
                        </React.Fragment>
                    }
                    { props.activePoll.id !== 'local' && 
                        <React.Fragment>
                            <button className="default-danger-styles" data-votingtype="allTitles" onClick={props.onClearSectionVotes}>Remove All Title Votes</button>
                        </React.Fragment>
                    }
                    <button className="default-primary-styles" onClick={hideVoteTitlesModal}>Close</button>
                </ModalFooter>
            </Modal>
            </React.Fragment>
        )
    }

    const VoteAttributesModal = () => {
        if (props.activePoll.id === 'local') {
            return (
                <React.Fragment>
                <button className="default-primary-styles" onClick={showVoteAttributesModal}>Vote Attributes</button>
                <Modal size="md" show={voteAttributesIsOpen} onHide={hideVoteAttributesModal}>
                    <ModalBody>
                        <div id="attribute-voting-controls">
                            <VoteAttributes 
                                user={props.user}
                                activeGameData={props.activeGameData}
                                attrthumbs={props.activeThumbs.attributes} 
                                onNewVote={props.onNewVote} />
                        </div>
                    </ModalBody>
                    <ModalFooter> 
                        <button className="default-danger-styles" data-votingtype="allAttributes" onClick={props.onClearSectionVotes} disabled={numAttrVotes===0}>Remove All Attribute Votes</button>
                        <button className="default-primary-styles" onClick={hideVoteAttributesModal}>Close</button>
                    </ModalFooter>
                </Modal>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                <button className="default-primary-styles" onClick={showVoteAttributesErrorModal}>Vote Attributes</button>
                <Modal size="md" show={voteAttributesErrorIsOpen} onHide={hideVoteAttributesErrorModal}>
                    <ModalBody>
                        <div id="attribute-voting-controls">
                            <p className="warning">INFO: Voting on attributes is for personal use only. Only title votes will be counted for games in a poll.</p>
                            <VoteAttributes 
                                user={props.user}
                                activeGameData={props.activeGameData}
                                attrthumbs={props.activeThumbs.attributes} 
                                onNewVote={props.onNewVote} />
                        </div>
                    </ModalBody>
                    <ModalFooter> 
                        <button className="default-danger-styles" data-votingtype="allAttributes" onClick={props.onClearSectionVotes} disabled={numAttrVotes===0}>Remove All Attribute Votes</button>
                        <button className="default-primary-styles" onClick={hideVoteAttributesErrorModal}>Close</button>
                    </ModalFooter>
                </Modal>
                </React.Fragment>
            )
        }
    }

    const ImportPollModal = () => {

        const onViewPoll = (poll) => {
            hideImportPollModal()
            props.onViewPoll(poll)
        }

        return (
            <React.Fragment>
            <button className="default-primary-styles" onClick={showImportPollModal}>Import Poll</button>
            <Modal size="md" show={importPollIsOpen} onHide={hideImportPollModal}>
                <ModalBody>
                    <div id="poll-import-controls">
                        <ImportPoll
                            activePoll={props.activePoll}
                            onViewPoll={onViewPoll} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-primary-styles" onClick={hideImportPollModal}>Close</button>
                </ModalFooter>
            </Modal>
            </React.Fragment>
        )
    }

    const CopyToClipboard = () => {
        return (
            <React.Fragment>
            <button className="default-primary-styles" onClick={handleCopyToClipboard} >Copy List <FontAwesomeIcon icon={faClipboard} /></button>
            <section>
                <form>
                    <textarea id="games-clipboard" style={inlineStyle} defaultValue={clipboardValue}></textarea>
                </form>
            </section>
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
        <div id="main-controls">

            <AddModal />

            <VoteTitlesModal />

            <VoteAttributesModal />

            <ImportPollModal />

            <CopyToClipboard />

        </div>
        </React.Fragment>
    )
}

MainControls.propTypes = {
    user: PropTypes.string,
    routedGames: PropTypes.object.isRequired,
    activeGameData: PropTypes.array.isRequired,
    activeThumbs: PropTypes.object.isRequired,
    cachedGameTitles: PropTypes.object.isRequired,
    addValidatedGames: PropTypes.func.isRequired,
    onDeleteAll: PropTypes.func.isRequired,
    onNewVote: PropTypes.func.isRequired,
    onClearSectionVotes: PropTypes.func.isRequired,
    activePoll: PropTypes.object.isRequired,
    onViewPoll: PropTypes.func.isRequired,
}