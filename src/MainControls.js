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
    const [voteTitlesIsOpen, setVoteTitlesIsOpen] = useState(false)
    const [importPollIsOpen, setImportPollIsOpen] = useState(false)

    const showAddModal = () => {
        setVoteAttributesIsOpen(false)
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
        setVoteAttributesIsOpen(true)
    }

    const hideVoteAttributesModal = () => {
        setVoteAttributesIsOpen(false)
    }

    const showVoteTitlesModal = () => {
        setAddIsOpen(false)
        setVoteAttributesIsOpen(false)
        setImportPollIsOpen(false)
        setVoteTitlesIsOpen(true)
    }

    const hideVoteTitlesModal = () => {
        setVoteTitlesIsOpen(false)
    }

    const showImportPollModal = () => {
        setAddIsOpen(false)
        setVoteAttributesIsOpen(false)
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

    let num_title_votes = Object.keys(props.allthumbs.titles).length

    let num_attr_votes = Object.keys(props.allthumbs.attributes.players).length
    + Object.keys(props.allthumbs.attributes.weight).length
    + Object.keys(props.allthumbs.attributes.category).length
    + Object.keys(props.allthumbs.attributes.mechanic).length

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
    return (
        <React.Fragment>
        <div id="main-controls">

            <button className="default-primary-styles" onClick={showAddModal}>Add Games</button>
            <Modal size="md" show={addIsOpen} onHide={hideAddModal}>
                <ModalBody>
                    <div id="gameinput-controls">
                        <AddGames
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

            <button className="default-primary-styles" onClick={showVoteTitlesModal}>Vote Games</button>
            <Modal size="md" show={voteTitlesIsOpen} onHide={hideVoteTitlesModal}>
                <ModalBody>
                    <div id="title-voting-controls">
                        <VoteTitles
                            activegamedata={props.activegamedata} 
                            titlethumbs={props.allthumbs.titles} 
                            onnewvote={props.onnewvote}
                            ondeleteall={props.ondeleteall} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-danger-styles" onClick={props.ondeleteall} disabled={props.activegamedata.length===0}>Remove All Games</button>
                    <button className="default-danger-styles" data-attrtype="all_titles" onClick={props.onclearsectionvotes} disabled={num_title_votes===0}>Remove All Votes</button>
                    <button className="default-primary-styles" onClick={hideVoteTitlesModal}>Close</button>
                </ModalFooter>
            </Modal>

            <button className="default-primary-styles" onClick={showVoteAttributesModal}>Vote Attributes</button>
            <Modal size="md" show={voteAttributesIsOpen} onHide={hideVoteAttributesModal}>
                <ModalBody>
                    <div id="attribute-voting-controls">
                        <VoteAttributes 
                            activegamedata={props.activegamedata}
                            attrthumbs={props.allthumbs.attributes} 
                            onnewvote={props.onnewvote} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-danger-styles" data-attrtype="all_attributes" onClick={props.onclearsectionvotes} disabled={num_attr_votes===0}>Remove All Votes</button>
                    <button className="default-primary-styles" onClick={hideVoteAttributesModal}>Close</button>
                </ModalFooter>
            </Modal>

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
    allthumbs: PropTypes.object.isRequired,
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