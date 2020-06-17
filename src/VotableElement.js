import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'


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
        //FIXME, extract vote value from props: this.props.preferences['attrVote']
        let vote = (this.props.preferences.hasOwnProperty(this.props.attrname)) ? 'thumbsup' : 'novote'
        elementStyle += ' ' + vote
        let votable_text = this.props.attrname
        if (this.props.attrcount > 1 || !this.props.suppresslowcounts) {
            votable_text += ' ('+this.props.attrcount+')'
        }
        return (
            <li 
                key={this.props.attrname} 
                className={elementStyle} 
                onMouseEnter={this.toggleHover} 
                onMouseLeave={this.toggleHover}
            > 
                <div className="vote">
                    { vote === 'thumbsup' &&
                    <FontAwesomeIcon icon={faThumbsUp} />
                    }
                </div>
                <div
                    className="clickable"
                    data-attrtype={this.props.attrtype}
                    data-attrname={this.props.attrname}
                    data-newvote='thumbsup'
                    onClick={this.props.onnewvote}
                >
                    {votable_text}
                </div>
            </li>
        )
    }
}

VotableElement.propTypes = {
    attrcount: PropTypes.number.isRequired,
    attrname: PropTypes.string.isRequired,
    attrtype: PropTypes.string.isRequired,
    onnewvote: PropTypes.func.isRequired,
    preferences: PropTypes.object.isRequired,
    suppresslowcounts: PropTypes.bool.isRequired,
}