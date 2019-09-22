import React from 'react'
import PropTypes from 'prop-types'

export class VotableElement extends React.Component {

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
        let elementStyle = (this.state.hover) ? "voteable hovering" : "voteable nothovering"
        elementStyle += this.props.preferences.hasOwnProperty(this.props.attrname) 
            ? ' thumbsup' //FIXME, derive from props: this.props.preferences['attrVote']
            : ' novote'
        return (
            <li 
                key={this.props.attrname} 
                className={elementStyle} 
                onMouseEnter={this.toggleHover} 
                onMouseLeave={this.toggleHover}
                data-attrtype={this.props.attrtype}
                data-attrname={this.props.attrname}
                data-newvote='thumbsup'
                onClick={this.props.onnewvote}
            >
                {this.props.attrname} ({this.props.attrcount})
            </li>
        )
    }
}

VotableElement.propTypes = {
    attrcount: PropTypes.number.isRequired,
    attrname: PropTypes.string.isRequired,
    attrtype: PropTypes.string.isRequired,
    counts: PropTypes.array.isRequired,
    onnewvote: PropTypes.func.isRequired,
    preferences: PropTypes.object.isRequired,
}