import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

export const Thumbnail = (props) => {

    const getAttributeCountLabel = (attributecount) => {
        let label
        if (props.reallynarrow) {
            label = 'attr.'
        } else if (attributecount !== 1) {
            label = 'attributes'
        } else {
            label = 'attribute'
        }
        return label
    }

    const getClasses = () => {
        let classes = 'vote-count'
        if (props.activethumbs.total_title_votes === 0 && props.activethumbs.total_attribute_votes === 0) {
            classes += ' no-votes-to-show'
        }
        if (props.activethumbs.total_title_votes !== 0) {
            classes += ' deemphasize-notvoted-games'
        }
        return classes
    }

    const printAttributeTally = () => {
        if (props.activethumbs.total_attribute_votes && props.thumbcounts.attributes) {
            return (
                <span className="vote-count-label">& {props.thumbcounts.attributes} {getAttributeCountLabel(props.thumbcounts.attributes)}</span>
            )
        } else {
            return null
        }
    }

    return (
        <div className="thumbnail">
            <img src={props.url} alt="game box cover" />
            <div className={getClasses()}>
                <FontAwesomeIcon icon={faThumbsUp} /> {props.thumbcounts.titles} 
                { printAttributeTally() }
            </div>
        </div>
    )
}

Thumbnail.propTypes = {
    activethumbs: PropTypes.object.isRequired,
    thumbcounts: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    reallynarrow: PropTypes.bool.isRequired,
    url: PropTypes.string,
}