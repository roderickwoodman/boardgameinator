import React from 'react'
import PropTypes from 'prop-types'
import { AddGamesBox } from './AddGamesBox'
import { VotingBox } from './VotingBox'
import { AddedList } from './AddedList'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import 'bootstrap/dist/css/bootstrap.min.css'

export const ViewControls = (props) => {

    const [addIsOpen, setAddIsOpen] = React.useState(false)
    const [votingIsOpen, setVotingIsOpen] = React.useState(false)
    const [listIsOpen, setListIsOpen] = React.useState(false)
    const [sortIsOpen, setSortIsOpen] = React.useState(false)
    const [filterIsOpen, setFilterIsOpen] = React.useState(false)

    const showAddModal = () => {
        setVotingIsOpen(false)
        setListIsOpen(false)
        setSortIsOpen(false)
        setFilterIsOpen(false)
        setAddIsOpen(true)
    }

    const hideAddModal = () => {
        setAddIsOpen(false)
    }

    const showVotingModal = () => {
        setAddIsOpen(false)
        setListIsOpen(false)
        setSortIsOpen(false)
        setFilterIsOpen(false)
        setVotingIsOpen(true)
    }

    const hideVotingModal = () => {
        setVotingIsOpen(false)
    }

    const showListModal = () => {
        setAddIsOpen(false)
        setVotingIsOpen(false)
        setSortIsOpen(false)
        setFilterIsOpen(false)
        setListIsOpen(true)
    }

    const hideListModal = () => {
        setListIsOpen(false)
    }

    const showSortModal = () => {
        setAddIsOpen(false)
        setVotingIsOpen(false)
        setListIsOpen(false)
        setFilterIsOpen(false)
        setSortIsOpen(true)
    }

    const hideSortModal = () => {
        setSortIsOpen(false)
    }

    const showFilterModal = () => {
        setAddIsOpen(false)
        setVotingIsOpen(false)
        setListIsOpen(false)
        setSortIsOpen(false)
        setFilterIsOpen(true)
    }

    const hideFilterModal = () => {
        setFilterIsOpen(false)
    }

    return (
        <React.Fragment>
        <div id="view-controls">

            <button className="default-primary-styles" onClick={showAddModal}>Add</button>
            <Modal size="md" show={addIsOpen} onHide={hideAddModal}>
                <ModalBody>
                    <div id="gameinput-controls">
                        <AddGamesBox
                            allgames={props.allgames}
                            onnewtitle={props.onnewtitle} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-primary-styles" onClick={hideAddModal}>Close</button>
                </ModalFooter>
            </Modal>

            <button className="default-primary-styles" onClick={showVotingModal}>Vote</button>
            <Modal size="md" show={votingIsOpen} onHide={hideVotingModal}>
                <ModalBody>
                    <div id="gamevoting-controls">
                        <VotingBox 
                            thumbs={props.thumbs} 
                            playercounts={props.playercounts} 
                            weightcounts={props.weightcounts}
                            categorycounts={props.categorycounts} 
                            mechaniccounts={props.mechaniccounts}
                            onnewvote={props.onnewvote}
                            onclearsectionvotes={props.onclearsectionvotes} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-primary-styles" onClick={hideVotingModal}>Close</button>
                </ModalFooter>
            </Modal>

            <button className="default-primary-styles" onClick={showListModal}>List</button>
            <Modal size="md" show={listIsOpen} onHide={hideListModal}>
                <ModalBody>
                    <div id="gamelisting-controls">
                        <AddedList
                            allgames={props.allgames} 
                            ondelete={props.ondelete}
                            ondeleteall={props.ondeleteall} />
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-primary-styles" onClick={hideListModal}>Close</button>
                </ModalFooter>
            </Modal>

            <button className="default-primary-styles" onClick={showSortModal}>Sort</button>
            <Modal size="md" show={sortIsOpen} onHide={hideSortModal}>
                <ModalBody>
                    <div id="gamesorting-controls">
                        <h4>Sort the games by...</h4>
                        <button className={`default-secondary-styles ${(props.sortby === 'maxvotes') ? 'active-button' : ''}`} onClick={ (e) => props.onsortchange(e, "maxvotes") }>votes</button>
                        <button className={`default-secondary-styles ${(props.sortby === 'maxplaytime') ? 'active-button' : ''}`} onClick={ (e) => props.onsortchange(e, "maxplaytime") }>playtime</button>
                        <button className={`default-secondary-styles ${(props.sortby === 'maxplayers') ? 'active-button' : ''}`} onClick={ (e) => props.onsortchange(e, "maxplayers") }>players</button>
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
                        <h4>Show only games that support...</h4>
                        <button className={`default-secondary-styles ${(props.filterplayercount) ? 'active-button' : ''}`} onClick={ (e) => props.onfilterchange(e, "playercount") }>upvoted player counts</button>
                        <button className={`default-secondary-styles ${(props.filterweight) ? 'active-button' : ''}`} onClick={ (e) => props.onfilterchange(e, "weight") }>upvoted weights</button>
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
    allgames: PropTypes.array.isRequired,
    thumbs: PropTypes.object.isRequired,
    onnewtitle: PropTypes.func.isRequired,
    filtermessage: PropTypes.string.isRequired,
    filterplayercount: PropTypes.bool.isRequired,
    filterweight: PropTypes.bool.isRequired,
    onfilterchange: PropTypes.func.isRequired,
    onsortchange: PropTypes.func.isRequired,
    sortby: PropTypes.string.isRequired,
    onnewvote: PropTypes.func.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
    playercounts: PropTypes.array.isRequired,
    weightcounts: PropTypes.array.isRequired,
    categorycounts: PropTypes.array.isRequired,
    mechaniccounts: PropTypes.array.isRequired,
}