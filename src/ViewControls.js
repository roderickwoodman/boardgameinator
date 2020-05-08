import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalTitle from 'react-bootstrap/ModalTitle'
import ModalFooter from 'react-bootstrap/ModalFooter'
import 'bootstrap/dist/css/bootstrap.min.css'

export const ViewControls = (props) => {

    const [isOpen, setIsOpen] = React.useState(false)

    const showModal = () => {
        setIsOpen(true)
    }

    const hideModal = () => {
        setIsOpen(false)
    }

    return (
        <React.Fragment>
        <div id="view-controls">
            <button className="default-styles" onClick={showModal}>Settings</button>{props.filtermessage}
            <Modal size="md" show={isOpen} onHide={hideModal}>
                <ModalHeader>
                    <ModalTitle>Settings</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <div id="gamesorting-controls">
                        <h4>Sort the games by...</h4>
                        <button className="default-styles" onClick={ (e) => props.onsortchange(e, "maxvotes") }>votes</button>
                        <button className="default-styles" onClick={ (e) => props.onsortchange(e, "maxplaytime") }>playtime</button>
                        <button className="default-styles" onClick={ (e) => props.onsortchange(e, "maxplayers") }>players</button>
                    </div>
                    <div id="gamefiltering-controls">
                        <h4>Show only games that support...</h4>
                        <button className="default-styles" onClick={ (e) => props.onfilterchange(e, "playercount") }>upvoted player counts</button>
                        <button className="default-styles" onClick={ (e) => props.onfilterchange(e, "weight") }>upvoted weights</button>
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button className="default-styles" onClick={hideModal}>Close</button>
                </ModalFooter>
            </Modal>
        </div>
        </React.Fragment>
    )
}

ViewControls.propTypes = {
    filtermessage: PropTypes.string.isRequired,
    filterplayercount: PropTypes.bool.isRequired,
    filterweight: PropTypes.bool.isRequired,
    onfilterchange: PropTypes.func.isRequired,
    onsortchange: PropTypes.func.isRequired,
    sortby: PropTypes.string.isRequired,
}