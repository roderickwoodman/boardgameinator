import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp as ThumbsUpSolid } from '@fortawesome/free-solid-svg-icons'
import { faThumbsUp as ThumbsUpRegular } from '@fortawesome/free-regular-svg-icons'

export const Thumbnail = (props) => {

    const getAttributeCountLabel = (attributecount) => {
        let label
        if (props.reallynarrow) {
            label = 'attr.'
        } else if (attributecount !== 1) {
            label = 'attrs. match'
        } else {
            label = 'attr. matches'
        }
        return label
    }

    const printAttributeTally = () => {
        // display attribute votes with title votes
        if (props.mythumbcounts.attributes && props.mythumbcounts.titles) {
            return (
                <span>& {props.mythumbcounts.attributes} {getAttributeCountLabel(props.mythumbcounts.attributes)}</span>
            )
        // display attribute votes without title votes
        } else if (props.mythumbcounts.attributes && !props.mythumbcounts.titles) {
            return (
                <span>{props.mythumbcounts.attributes} {getAttributeCountLabel(props.mythumbcounts.attributes)}</span>
            )
        // no attribute votes to display
        } else {
            return null
        }
    }

    const printTitleTally = () => {
        if (props.activepoll !== 'local'
          && props.activethumbs.total_title_votes 
          && typeof props.mythumbcounts !== 'undefined'
          && props.mythumbcounts.hasOwnProperty('titles') ) {
            let extra_text = null
            if (props.mythumbcounts.my_rank > 0 && props.mythumbcounts.titles > props.mythumbcounts.my_rank) {
                extra_text = 'incl. You'
                return (
                    <React.Fragment>
                        <div>&nbsp;{props.mythumbcounts.titles}</div>
                        <div className="extra-text">{extra_text}</div>
                    </React.Fragment>
                )
            } else {
                return (
                    <div>&nbsp;{props.mythumbcounts.titles}</div>
                )
            }
        } else {
            return null
        }
    }

    const printVoteCount = () => {
        return (
            <div className="vote-count">
                <div className="vote-count-heading">
                    <FontAwesomeIcon icon={ThumbsUpSolid} />
                    { printTitleTally() }
                </div>
                <div className="vote-count-subheading">
                    { printAttributeTally() }
                </div>
            </div>
            )
    }

    const printThumbnailOverlay = () => {

        if (props.mythumbcounts.titles) {
            return (
                <React.Fragment>
                { printVoteCount() }
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                <div className="voting-affordance">
                    <div className="vote-count-heading">
                        <FontAwesomeIcon icon={ThumbsUpRegular} />
                    </div>
                </div>
                { printVoteCount() }
                </React.Fragment>
            )
        }

    }

    return (
        <div className="thumbnail">
            <img src={props.url} alt="game box cover" />
            { printThumbnailOverlay() }
        </div>
    )
}

Thumbnail.propTypes = {
    activethumbs: PropTypes.object.isRequired,
    activepoll: PropTypes.string.isRequired,
    mythumbcounts: PropTypes.object,
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    reallynarrow: PropTypes.bool.isRequired,
    url: PropTypes.string,
}