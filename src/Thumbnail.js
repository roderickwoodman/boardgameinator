import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp as ThumbsUpSolid } from '@fortawesome/free-solid-svg-icons'
import { faThumbsUp as ThumbsUpRegular } from '@fortawesome/free-regular-svg-icons'

export const Thumbnail = (props) => {

    const getAttributeCountLabel = (attributecount) => {
        let label
        if (props.reallyNarrow) {
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
        if (props.myThumbCounts.attributes && props.myThumbCounts.titles) {
            return (
                <span>& {props.myThumbCounts.attributes} {getAttributeCountLabel(props.myThumbCounts.attributes)}</span>
            )
        // display attribute votes without title votes
        } else if (props.myThumbCounts.attributes && !props.myThumbCounts.titles) {
            return (
                <span>{props.myThumbCounts.attributes} {getAttributeCountLabel(props.myThumbCounts.attributes)}</span>
            )
        // no attribute votes to display
        } else {
            return null
        }
    }

    const printTitleTally = () => {
        if (props.activePoll.id !== 'local'
          && props.activeThumbs.totalTitleVotes 
          && typeof props.myThumbCounts !== 'undefined'
          && props.myThumbCounts.hasOwnProperty('titles') ) {
            let extra_text = null
            if (props.myThumbCounts.my_rank > 0 && props.myThumbCounts.titles >= props.myThumbCounts.my_rank) {
                extra_text = 'incl. You'
                return (
                    <React.Fragment>
                        <div>&nbsp;{props.myThumbCounts.titles}</div>
                        <div className="extra-text">{extra_text}</div>
                    </React.Fragment>
                )
            } else {
                return (
                    <div>&nbsp;{props.myThumbCounts.titles}</div>
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

        if (props.myThumbCounts.titles) {
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
    activeThumbs: PropTypes.object.isRequired,
    activePoll: PropTypes.object.isRequired,
    myThumbCounts: PropTypes.object,
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    reallyNarrow: PropTypes.bool.isRequired,
    url: PropTypes.string,
}