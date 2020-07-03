import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { AddGames } from './AddGames'
import { VoteAttributes } from './VoteAttributes'
import { VoteTitles } from './VoteTitles'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboard } from '@fortawesome/free-solid-svg-icons'


export const MainControls = (props) => {

    const [addIsOpen, setAddIsOpen] = useState(false)
    const [voteAttributesIsOpen, setVoteAttributesIsOpen] = useState(false)
    const [listIsOpen, setListIsOpen] = useState(false)

    const showAddModal = () => {
        setVoteAttributesIsOpen(false)
        setListIsOpen(false)
        setAddIsOpen(true)
    }

    const hideAddModal = () => {
        setAddIsOpen(false)
    }

    const showVoteAttributesModal = () => {
        setAddIsOpen(false)
        setListIsOpen(false)
        setVoteAttributesIsOpen(true)
    }

    const hideVoteAttributesModal = () => {
        setVoteAttributesIsOpen(false)
    }

    const showListModal = () => {
        setAddIsOpen(false)
        setVoteAttributesIsOpen(false)
        setListIsOpen(true)
    }

    const hideListModal = () => {
        setListIsOpen(false)
    }

    useEffect( () => {
        if (props.allgames.length === 0) {
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
        props.allgames.forEach((game) => {
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

            <button className="default-primary-styles" onClick={showAddModal}>Add</button>
            <Modal size="md" show={addIsOpen} onHide={hideAddModal}>
                <ModalBody>
                    <div id="gameinput-controls">
                        <AddGames
                            allgames={props.allgames}
                            onnewtitle={props.onnewtitle} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-primary-styles" onClick={hideAddModal}>Close</button>
                </ModalFooter>
            </Modal>

            <button className="default-primary-styles" onClick={showVoteAttributesModal}>Vote Attributes</button>
            <Modal size="md" show={voteAttributesIsOpen} onHide={hideVoteAttributesModal}>
                <ModalBody>
                    <div id="gamevoting-controls">
                        <VoteAttributes 
                            allgames={props.allgames}
                            attrthumbs={props.allthumbs.attributes} 
                            onnewvote={props.onnewvote} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-danger-styles" data-attrtype="all_attributes" onClick={props.onclearsectionvotes} disabled={num_attr_votes===0}>Remove All Votes</button>
                    <button className="default-primary-styles" onClick={hideVoteAttributesModal}>Close</button>
                </ModalFooter>
            </Modal>

            <button className="default-primary-styles" onClick={showListModal}>Vote Games</button>
            <Modal size="md" show={listIsOpen} onHide={hideListModal}>
                <ModalBody>
                    <div id="gamelisting-controls">
                        <VoteTitles
                            allgames={props.allgames} 
                            titlethumbs={props.allthumbs.titles} 
                            onnewvote={props.onnewvote}
                            ondeleteall={props.ondeleteall} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-danger-styles" onClick={props.ondeleteall} disabled={props.allgames.length===0}>Remove All Games</button>
                    <button className="default-danger-styles" data-attrtype="all_titles" onClick={props.onclearsectionvotes} disabled={num_title_votes===0}>Remove All Votes</button>
                    <button className="default-primary-styles" onClick={hideListModal}>Close</button>
                </ModalFooter>
            </Modal>

            <button className="default-primary-styles"><FontAwesomeIcon icon={faClipboard} onClick={handleCopyToClipboard} disabled={!props.allgames.length} /></button>
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
    allgames: PropTypes.array.isRequired,
    allthumbs: PropTypes.object.isRequired,
    onnewtitle: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
    onnewvote: PropTypes.func.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
}