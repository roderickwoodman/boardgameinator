import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortAmountDown } from '@fortawesome/free-solid-svg-icons'
import { faFilter } from '@fortawesome/free-solid-svg-icons'

export const ViewControls = (props) => {

    const [sortIsOpen, setSortIsOpen] = useState(false)
    const [filterIsOpen, setFilterIsOpen] = useState(false)

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

    return (
        <React.Fragment>
        <div id="view-controls">

            <button className="fa fa-button" onClick={showSortModal}><FontAwesomeIcon icon={faSortAmountDown}/></button>
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

            <button className="fa fa-button" onClick={showFilterModal}><FontAwesomeIcon icon={faFilter}/></button>
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

        </div>
        </React.Fragment>
    )
}

ViewControls.propTypes = {
    sortby: PropTypes.string.isRequired,
    onsortchange: PropTypes.func.isRequired,
    filterplayercount: PropTypes.bool.isRequired,
    filterweight: PropTypes.bool.isRequired,
    onfilterchange: PropTypes.func.isRequired,
}