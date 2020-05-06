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
            <Modal show={isOpen} onHide={hideModal}>
                <ModalHeader>
                    <ModalTitle>Settings</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <div id="gamesorting-controls">
                        <span className="instructions">
                            <span className="leftGroup">Sort the results.</span>
                        </span>
                        <label>
                            <input type="radio" key="maxvotes" id="maxvotes" name="sortorder" checked={props.sortby==="maxvotes"} value="maxvotes" onChange={props.onsortchange} /> 
                            sort by thumbsup votes</label>
                        <label>
                            <input type="radio" key="maxplaytime" id="maxplaytime" name="sortorder" checked={props.sortby==="maxplaytime"} value="maxplaytime" onChange={props.onsortchange} /> 
                            sort by playtime</label>
                        <label>
                            <input type="radio" key="maxplayers" id="maxplayers" name="sortorder" checked={props.sortby==="maxplayers"} value="maxplayers" onChange={props.onsortchange} /> 
                            sort by player count</label>
                    </div>
                    <div id="gamefiltering-controls">
                        <span className="instructions">
                            <span className="leftGroup">Filter the results.</span>
                        </span>
                        <label>
                            <input type="checkbox" id="filterplayercount" checked={props.filterplayercount} onChange={props.onfilterchange} />
                            show only games supporting the voted playercounts</label>
                        <label>
                            <input type="checkbox" id="filterweight" checked={props.filterweight} onChange={props.onfilterchange} />
                            show only games matching the voted weights</label>
                    </div>
                </ModalBody>
                <ModalFooter> 
                    <button onClick={hideModal}>Close</button>
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