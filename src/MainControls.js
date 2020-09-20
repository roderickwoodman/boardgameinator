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
    const [addErrorIsOpen, setAddErrorIsOpen] = useState(false)
    const [voteAttributesIsOpen, setVoteAttributesIsOpen] = useState(false)
    const [voteAttributesErrorIsOpen, setVoteAttributesErrorIsOpen] = useState(false)
    const [voteTitlesIsOpen, setVoteTitlesIsOpen] = useState(false)
    const [importPollIsOpen, setImportPollIsOpen] = useState(false)

    const showAddModal = () => {
        setVoteAttributesIsOpen(false)
        setVoteAttributesErrorIsOpen(false)
        setVoteTitlesIsOpen(false)
        setImportPollIsOpen(false)
        setAddErrorIsOpen(false)
        setAddIsOpen(true)
    }

    const hideAddModal = () => {
        setAddIsOpen(false)
    }

    const showAddErrorModal = () => {
        setVoteAttributesIsOpen(false)
        setVoteAttributesErrorIsOpen(false)
        setVoteTitlesIsOpen(false)
        setImportPollIsOpen(false)
        setAddIsOpen(false)
        setAddErrorIsOpen(true)
    }

    const hideAddErrorModal = () => {
        setAddErrorIsOpen(false)
    }

    const showVoteAttributesModal = () => {
        setAddIsOpen(false)
        setAddErrorIsOpen(false)
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
        setAddErrorIsOpen(false)
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
        setAddErrorIsOpen(false)
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
        setAddErrorIsOpen(false)
        setVoteAttributesIsOpen(false)
        setVoteAttributesErrorIsOpen(false)
        setVoteTitlesIsOpen(false)
        setImportPollIsOpen(true)
    }

    const hideImportPollModal = () => {
        setImportPollIsOpen(false)
    }

    useEffect( () => {
        if (props.activegamedata.length === 0) {
            showAddModal()
        } else {
            hideAddModal()
        }
    }, [props])

    let num_title_votes = 0
    for (let gameId in props.activethumbs.titles) {
        for (let vote of Object.keys(props.activethumbs.titles[gameId])) {
            num_title_votes += props.activethumbs.titles[gameId][vote].length
        }
    }

    let num_attr_votes = Object.keys(props.activethumbs.attributes.players).length
    + Object.keys(props.activethumbs.attributes.weight).length
    + Object.keys(props.activethumbs.attributes.category).length
    + Object.keys(props.activethumbs.attributes.mechanic).length

    const handleCopyToClipboard = () => {
        let games = ""
        props.activegamedata.forEach((game) => {
            if (games === "") {
                games += game.id
            } else {
                games = games + "+" + game.id
            }
        })
        games = window.location.href + "?newlist=" + games
        let clipboardElement = document.getElementById("games-clipboard")
        clipboardElement.value = games
        clipboardElement.select()
        document.execCommand("copy")
    }
    let clipboardValue = ""
    let inlineStyle = {
        position: "absolute",
        left: "-1000px",
        top: "-1000px"
    }
    const AddModal = () => {
        if (props.activepoll === 'local') {
            return (
                <React.Fragment>
                <button className="default-primary-styles" onClick={showAddModal}>Add Games</button>
                <Modal size="md" show={addIsOpen} onHide={hideAddModal}>
                    <ModalBody>
                        <div id="gameinput-controls">
                            <AddGames
                                activepoll={props.activepoll} 
                                cachedgametitles={props.cachedgametitles}
                                onaddcachedtitle={props.onaddcachedtitle}
                                onaddnewtitle={props.onaddnewtitle}
                                oncachenewtitle={props.oncachenewtitle} />
                        </div>
                    </ModalBody>
                    <ModalFooter> 
                        <button className="default-primary-styles" onClick={hideAddModal}>Close</button>
                    </ModalFooter>
                </Modal>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                <button className="default-primary-styles" onClick={showAddErrorModal}>Add Games</button>
                <Modal size="md" show={addErrorIsOpen} onHide={hideAddErrorModal}>
                    <ModalBody>
                        <div id="gameinput-controls">
                            <p>INFO: Adding of games is disabled while "{props.activepoll}" is selected.</p>
                        </div>
                    </ModalBody>
                    <ModalFooter> 
                        <button className="default-primary-styles" onClick={hideAddErrorModal}>Close</button>
                    </ModalFooter>
                </Modal>
                </React.Fragment>
            )
        }
    }

    const VoteTitlesModal = () => {
        return (
            <React.Fragment>
            <button className="default-primary-styles" onClick={showVoteTitlesModal}>Vote Games</button>
            <Modal size="md" show={voteTitlesIsOpen} onHide={hideVoteTitlesModal}>
                <ModalBody>
                    <div id="title-voting-controls">
                        <VoteTitles
                            activegamedata={props.activegamedata} 
                            titlethumbs={props.activethumbs.titles} 
                            onnewvote={props.onnewvote}
                            ondeleteall={props.ondeleteall} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-danger-styles" onClick={props.ondeleteall} disabled={props.activegamedata.length===0}>Remove All Games</button>
                    <button className="default-danger-styles" data-votingtype="all_titles" onClick={props.onclearsectionvotes} disabled={num_title_votes===0}>Remove All Votes</button>
                    <button className="default-primary-styles" onClick={hideVoteTitlesModal}>Close</button>
                </ModalFooter>
            </Modal>
            </React.Fragment>
        )
    }

    const VoteAttributesModal = () => {
        if (props.activepoll === 'local') {
            return (
                <React.Fragment>
                <button className="default-primary-styles" onClick={showVoteAttributesModal}>Vote Attributes</button>
                <Modal size="md" show={voteAttributesIsOpen} onHide={hideVoteAttributesModal}>
                    <ModalBody>
                        <div id="attribute-voting-controls">
                            <VoteAttributes 
                                activegamedata={props.activegamedata}
                                attrthumbs={props.activethumbs.attributes} 
                                onnewvote={props.onnewvote} />
                        </div>
                    </ModalBody>
                    <ModalFooter> 
                        <button className="default-danger-styles" data-votingtype="all_attributes" onClick={props.onclearsectionvotes} disabled={num_attr_votes===0}>Remove All Votes</button>
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
                            <p>INFO: Voting on attributes is disabled while "{props.activepoll}" is selected.</p>
                        </div>
                    </ModalBody>
                    <ModalFooter> 
                        <button className="default-primary-styles" onClick={hideVoteAttributesErrorModal}>Close</button>
                    </ModalFooter>
                </Modal>
                </React.Fragment>
            )
        }
    }

    const ImportPollModal = () => {
        return (
            <React.Fragment>
            <button className="default-primary-styles" onClick={showImportPollModal}>Import Poll</button>
            <Modal size="md" show={importPollIsOpen} onHide={hideImportPollModal}>
                <ModalBody>
                    <div id="poll-import-controls">
                        <ImportPoll
                            activepoll={props.activepoll}
                            onviewpoll={props.onviewpoll} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-primary-styles" onClick={hideImportPollModal}>Close</button>
                </ModalFooter>
            </Modal>
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

            <button className="default-primary-styles"><FontAwesomeIcon icon={faClipboard} onClick={handleCopyToClipboard} disabled={!props.activegamedata.length} /></button>
            <section>
                <form>
                    <textarea id="games-clipboard" style={inlineStyle} defaultValue={clipboardValue}></textarea>
                </form>
            </section>

        </div>
        </React.Fragment>
    )
}

MainControls.propTypes = {
    activegamedata: PropTypes.array.isRequired,
    activethumbs: PropTypes.object.isRequired,
    cachedgametitles: PropTypes.object.isRequired,
    onaddcachedtitle: PropTypes.func.isRequired,
    onaddnewtitle: PropTypes.func.isRequired,
    oncachenewtitle: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
    onnewvote: PropTypes.func.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
    activepoll: PropTypes.string.isRequired,
    onviewpoll: PropTypes.func.isRequired,
}