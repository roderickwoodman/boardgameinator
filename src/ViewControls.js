import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { AddByTitle } from './AddByTitle'
import { VoteAttributes } from './VoteAttributes'
import { VoteTitles } from './VoteTitles'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboard } from '@fortawesome/free-solid-svg-icons'


export const ViewControls = (props) => {

    const [addIsOpen, setAddIsOpen] = useState(false)
    const [voteAttributesIsOpen, setVoteAttributesIsOpen] = useState(false)
    const [listIsOpen, setListIsOpen] = useState(false)
    const [sortIsOpen, setSortIsOpen] = useState(false)
    const [filterIsOpen, setFilterIsOpen] = useState(false)

    const showAddModal = () => {
        setVoteAttributesIsOpen(false)
        setListIsOpen(false)
        setSortIsOpen(false)
        setFilterIsOpen(false)
        setAddIsOpen(true)
    }

    const hideAddModal = () => {
        setAddIsOpen(false)
    }

    const showVoteAttributesModal = () => {
        setAddIsOpen(false)
        setListIsOpen(false)
        setSortIsOpen(false)
        setFilterIsOpen(false)
        setVoteAttributesIsOpen(true)
    }

    const hideVoteAttributesModal = () => {
        setVoteAttributesIsOpen(false)
    }

    const showListModal = () => {
        setAddIsOpen(false)
        setVoteAttributesIsOpen(false)
        setSortIsOpen(false)
        setFilterIsOpen(false)
        setListIsOpen(true)
    }

    const hideListModal = () => {
        setListIsOpen(false)
    }

    const showSortModal = () => {
        setAddIsOpen(false)
        setVoteAttributesIsOpen(false)
        setListIsOpen(false)
        setFilterIsOpen(false)
        setSortIsOpen(true)
    }

    const hideSortModal = () => {
        setSortIsOpen(false)
    }

    const showFilterModal = () => {
        setAddIsOpen(false)
        setVoteAttributesIsOpen(false)
        setListIsOpen(false)
        setSortIsOpen(false)
        setFilterIsOpen(true)
    }

    const hideFilterModal = () => {
        setFilterIsOpen(false)
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
        <div id="view-controls">

            <button className="default-primary-styles" onClick={showAddModal}>Add</button>
            <Modal size="md" show={addIsOpen} onHide={hideAddModal}>
                <ModalBody>
                    <div id="gameinput-controls">
                        <AddByTitle
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

            <button className="default-primary-styles" onClick={showSortModal}>Order</button>
            <Modal size="md" show={sortIsOpen} onHide={hideSortModal}>
                <ModalBody>
                    <div id="gamesorting-controls">
                        <h4>Order the board games by the...</h4>
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

            <button className="default-primary-styles" onClick={showFilterModal}>Filter</button>
            <Modal size="md" show={filterIsOpen} onHide={hideFilterModal}>
                <ModalBody>
                    <div id="gamefiltering-controls">
                        <h4>Show only the board games that support...</h4>
                        <button className={`default-secondary-styles ${(props.filterplayercount) ? 'active-button' : ''}`} onClick={ (e) => props.onfilterchange(e, "playercount") }>upvoted player counts</button>
                        <button className={`default-secondary-styles ${(props.filterweight) ? 'active-button' : ''}`} onClick={ (e) => props.onfilterchange(e, "weight") }>upvoted weights</button>
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-primary-styles" onClick={hideFilterModal}>Close</button>
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

ViewControls.propTypes = {
    allgames: PropTypes.array.isRequired,
    allthumbs: PropTypes.object.isRequired,
    onnewtitle: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
    filtermessage: PropTypes.string.isRequired,
    filterplayercount: PropTypes.bool.isRequired,
    filterweight: PropTypes.bool.isRequired,
    onfilterchange: PropTypes.func.isRequired,
    onsortchange: PropTypes.func.isRequired,
    sortby: PropTypes.string.isRequired,
    onnewvote: PropTypes.func.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
}