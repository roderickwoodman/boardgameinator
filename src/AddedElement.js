import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

export class AddedElement extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            hover: false
        }        
        this.toggleHover = this.toggleHover.bind(this)
    }

    toggleHover() {
        this.setState({hover: !this.state.hover})
    }

    render() {
        let elementStyle = (this.state.hover) ? "listing hovering" : "listing nothovering"
        return (
            <li 
                className={elementStyle}
                onMouseEnter={this.toggleHover} 
                onMouseLeave={this.toggleHover}
            >
                {this.state.hover && (
                    <button 
                        onClick={ (e) => this.props.ondelete(e, this.props.id) }
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                )}
                &nbsp;{this.props.name}
            </li>
        )
    }
}

AddedElement.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    ondelete: PropTypes.func.isRequired,
    yearpublished: PropTypes.number.isRequired,
}