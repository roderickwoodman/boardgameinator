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

    const printAttributeTally = () => {
        if (props.activethumbs.total_attribute_votes && props.thumbcounts.attributes) {
            return (
                <span>& {props.thumbcounts.attributes} {getAttributeCountLabel(props.thumbcounts.attributes)}</span>
            )
        } else {
            return null
        }
    }

    const printTitleTally = () => {
        if (props.activepoll !== 'local'
          && props.activethumbs.total_title_votes 
          && typeof props.thumbcounts !== 'undefined'
          && props.thumbcounts.hasOwnProperty('titles') ) {
            let extra_text = null
            if (props.thumbcounts.my_rank > 0 && props.thumbcounts.titles > props.thumbcounts.my_rank) {
                extra_text = 'incl. You'
                return (
                    <React.Fragment>
                        <div>&nbsp;{props.thumbcounts.titles}</div>
                        <div className="extra-text">{extra_text}</div>
                    </React.Fragment>
                )
            } else {
                return (
                    <div>&nbsp;{props.thumbcounts.titles}</div>
                )
            }
        } else {
            return null
        }
    }

    return (
        <div className="thumbnail">
            <img src={props.url} alt="game box cover" />
            <div className="vote-count">
                <div className="vote-count-heading">
                    <FontAwesomeIcon icon={faThumbsUp} />
                    { printTitleTally() }
                </div>
                <div className="vote-count-subheading">
                    { printAttributeTally() }
                </div>
            </div>
        </div>
    )
}

Thumbnail.propTypes = {
    activethumbs: PropTypes.object.isRequired,
    activepoll: PropTypes.string.isRequired,
    thumbcounts: PropTypes.object,
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    reallynarrow: PropTypes.bool.isRequired,
    url: PropTypes.string,
}