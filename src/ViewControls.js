import React from 'react'
import PropTypes from 'prop-types'
import { VotingBox } from './VotingBox'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalTitle from 'react-bootstrap/ModalTitle'
import ModalFooter from 'react-bootstrap/ModalFooter'
import 'bootstrap/dist/css/bootstrap.min.css'

export const ViewControls = (props) => {

    const [sortIsOpen, setSortIsOpen] = React.useState(false)
    const [filterIsOpen, setFilterIsOpen] = React.useState(false)
    const [votingIsOpen, setVotingIsOpen] = React.useState(false)

    const showSortModal = () => {
        setFilterIsOpen(false)
        setSortIsOpen(true)
    }

    const hideSortModal = () => {
        setSortIsOpen(false)
    }

    const showFilterModal = () => {
        setSortIsOpen(false)
        setFilterIsOpen(true)
    }

    const hideFilterModal = () => {
        setFilterIsOpen(false)
    }

    const showVotingModal = () => {
        setSortIsOpen(false)
        setFilterIsOpen(false)
        setVotingIsOpen(true)
    }

    const hideVotingModal = () => {
        setVotingIsOpen(false)
    }

    return (
        <React.Fragment>
        <div id="view-controls">

            <button className="default-primary-styles" onClick={showSortModal}>Sort</button>
            <Modal size="md" show={sortIsOpen} onHide={hideSortModal}>
                <ModalHeader>
                    <ModalTitle>Sort Options</ModalTitle>
                </ModalHeader>
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
                <ModalHeader>
                    <ModalTitle>Filter Options</ModalTitle>
                </ModalHeader>
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

            <button className="default-primary-styles" onClick={showVotingModal}>Vote</button>
            <Modal size="md" show={votingIsOpen} onHide={hideVotingModal}>
                <ModalHeader>
                    <ModalTitle>Vote Options</ModalTitle>
                </ModalHeader>
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

        </div>
        </React.Fragment>
    )
}

ViewControls.propTypes = {
    thumbs: PropTypes.object.isRequired,
    filtermessage: PropTypes.string.isRequired,
    filterplayercount: PropTypes.bool.isRequired,
    filterweight: PropTypes.bool.isRequired,
    onfilterchange: PropTypes.func.isRequired,
    onsortchange: PropTypes.func.isRequired,
    sortby: PropTypes.string.isRequired,
    onnewvotes: PropTypes.func.isRequired,
    onclearselectionvotes: PropTypes.func.isRequired,
    playercounts: PropTypes.number.isRequired,
    weightcounts: PropTypes.number.isRequired,
    categorycounts: PropTypes.number.isRequired,
    mechaniccounts: PropTypes.number.isRequired,
}