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

    const closeMyModal = () => {
        setAddIsOpen(false)
        setAddErrorIsOpen(false)
        setVoteAttributesIsOpen(false)
        setVoteAttributesErrorIsOpen(false)
        setVoteTitlesIsOpen(false)
        setImportPollIsOpen(false)
    }

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

    const updateAddingGames = (updated_addingGames) => {

        hideAddModal()

        // add all newly-retrieved game data
        let new_gamedata_to_activate = [ ...Object.values(updated_addingGames.gamedata_to_activate) ]
        let new_gamedata_to_cache = []
        Object.values(updated_addingGames.ambiguous_gamedata).forEach(possibilities => {
            possibilities.forEach(possible_gamedata => {
                if (updated_addingGames.selected_games_to_activate.includes(possible_gamedata.unambiguous_name)) {
                    new_gamedata_to_activate.push(JSON.parse(JSON.stringify(possible_gamedata)))
                } else {
                    new_gamedata_to_cache.push(JSON.parse(JSON.stringify(possible_gamedata)))
                }
            })
        })
        props.onaddnewtitles(new_gamedata_to_activate)
        props.oncachenewtitles(new_gamedata_to_cache)

        // activate titles that were already in the cache
        let cached_games_to_activate = [ ...updated_addingGames.games_to_activate ]
        Object.values(updated_addingGames.ambiguous_cached).forEach(possibilities => {
            possibilities.forEach(possible_game => {
                if (updated_addingGames.selected_games_to_activate.includes(possible_game.unambiguous_name)) {
                    cached_games_to_activate.push(possible_game.unambiguous_name)
                }
            })
        })
        props.onaddcachedtitles(cached_games_to_activate)
        
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
                <Modal size="md" backdrop="static" show={addIsOpen} onHide={hideAddModal}>
                    <ModalBody>
                        <div id="gameinput-controls">
                            <AddGames
                                closemymodal={closeMyModal}
                                activepoll={props.activepoll} 
                                updateaddinggames={updateAddingGames}
                                cachedgametitles={props.cachedgametitles}
                                onaddcachedtitles={props.onaddcachedtitles}
                                onaddnewtitles={props.onaddnewtitles}
                                oncachenewtitles={props.oncachenewtitles} />
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
                    { props.activepoll === 'local' && 
                        <React.Fragment>
                            <button className="default-danger-styles" onClick={props.ondeleteall} disabled={props.activegamedata.length===0}>Remove All Games</button>
                            <button className="default-danger-styles" data-votingtype="all_titles" onClick={props.onclearsectionvotes} disabled={num_title_votes===0}>Remove All Title Votes</button>
                        </React.Fragment>
                    }
                    { props.activepoll !== 'local' && 
                        <React.Fragment>
                            <button className="default-danger-styles" data-votingtype="all_titles" onClick={props.onclearsectionvotes}>Remove All Title Votes</button>
                        </React.Fragment>
                    }
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
                        <button className="default-danger-styles" data-votingtype="all_attributes" onClick={props.onclearsectionvotes} disabled={num_attr_votes===0}>Remove All Attribute Votes</button>
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
                            <p>INFO: Voting on attributes is for personal use only. Votes will not be not saved to "{props.activepoll}".</p>
                            <VoteAttributes 
                                activegamedata={props.activegamedata}
                                attrthumbs={props.activethumbs.attributes} 
                                onnewvote={props.onnewvote} />
                        </div>
                    </ModalBody>
                    <ModalFooter> 
                        <button className="default-danger-styles" data-votingtype="all_attributes" onClick={props.onclearsectionvotes} disabled={num_attr_votes===0}>Remove All Attribute Votes</button>
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

    const CopyToClipboard = () => {
        return (
            <React.Fragment>
            <button className="default-primary-styles"><FontAwesomeIcon icon={faClipboard} onClick={handleCopyToClipboard} disabled={!props.activegamedata.length} /></button>
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
    activegamedata: PropTypes.array.isRequired,
    activethumbs: PropTypes.object.isRequired,
    cachedgametitles: PropTypes.object.isRequired,
    onaddcachedtitles: PropTypes.func.isRequired,
    onaddnewtitles: PropTypes.func.isRequired,
    oncachenewtitles: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
    onnewvote: PropTypes.func.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
    activepoll: PropTypes.string.isRequired,
    onviewpoll: PropTypes.func.isRequired,
}