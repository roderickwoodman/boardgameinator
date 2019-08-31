import React from 'react'
import PropTypes from 'prop-types'

export class VotableElement extends React.Component {

    render() {
        let myVote = this.props.preferences.hasOwnProperty(this.props.attrname) 
            ? 'thumbsup' //FIXME, derive from props: this.props.preferences['attrVote']
            : 'novote'
        return (
            <li 
                key={this.props.attrname} 
                className={myVote} 
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