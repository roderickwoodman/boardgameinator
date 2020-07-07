import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'


export const VotableElement = (props) => {

    let elementStyle = "voteable"
    let vote = (props.preferences.hasOwnProperty(props.attrname)) ? 'thumbsup' : 'novote'
    elementStyle += ' ' + vote
    let votable_text = props.attrname
    if (props.attrcount > 1 || !props.suppresslowcounts) {
        votable_text += ' ('+props.attrcount+')'
    }
    return (
        <li 
            key={props.attrname} 
            className={elementStyle} 
        > 
            <div className="vote">
                { vote === 'thumbsup' &&
                <FontAwesomeIcon icon={faThumbsUp} />
                }
            </div>
            <div
                className="clickable"
                data-attrtype={props.attrtype}
                data-attrname={props.attrname}
                data-newvote='thumbsup'
                onClick={props.onnewvote}
            >
                {votable_text}
            </div>
        </li>
    )
}

VotableElement.propTypes = {
    attrcount: PropTypes.number.isRequired,
    attrname: PropTypes.string.isRequired,
    attrtype: PropTypes.string.isRequired,
    onnewvote: PropTypes.func.isRequired,
    preferences: PropTypes.object.isRequired,
    suppresslowcounts: PropTypes.bool.isRequired,
}