import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

const VotableElement = (props) => {

    let elementStyle = "voteable"
    const vote = (props.preferences.hasOwnProperty(props.votingon)
      && props.preferences[props.votingon].hasOwnProperty('thumbsup')
      && props.preferences[props.votingon].thumbsup.includes('_me_')) ? 'thumbsup' : 'novote'
    elementStyle += ` ${vote}`
    let votable_text = props.votingonlabel
    if (props.attrcount > 1 || !props.suppresslowcounts) {
        votable_text += ` (${props.attrcount})`
    }
    if (props.votingtype === 'category' || props.votingtype === 'mechanic') {
        votable_text = votable_text.toLowerCase()
    }
    return (
        <li 
            key={props.votingon} 
            className={elementStyle} 
        > 
            <div className="vote">
                { vote === 'thumbsup' &&
                <FontAwesomeIcon icon={faThumbsUp} />
                }
            </div>
            <div
                className="clickable"
                data-votingtype={props.votingtype}
                data-votingon={props.votingon}
                data-newvote='thumbsup'
                onClick={props.onnewvote}
            >
                {votable_text}
            </div>
        </li>
    )
}

export const VotingSection = (props) => {

    const origVotables = JSON.parse(JSON.stringify(props.counts))
    let orderedVotables = JSON.parse(JSON.stringify(props.counts))
    // alphabetization is a 2nd-level sort, after the 1st sorting is by count 
    if (props.alphabetize) {

        orderedVotables = origVotables
            .sort(function(a,b) {

                // 1st sort is by counts, 
                // and here the counts are different
                if (a.attrCount < b.attrCount) {
                    return 1
                } else if (a.attrCount > b.attrCount) {
                    return -1

                // 2nd sort is by names
                } else if (a.attrName < b.attrName) {
                    return -1
                } else if (a.attrName > b.attrName) {
                    return 1

                // both count and names are equal
                } else {
                    return 0
                }

            })
    }
    return (
        <ul id={props.elementid}>
            <li><b>{props.title}</b></li>
            {orderedVotables.map((key, index) => {
                return <VotableElement 
                    key={key.attrName}
                    preferences={props.sectionthumbs}
                    votingtype={props.type}
                    votingon={key.attrId} 
                    votingonlabel={key.attrName} 
                    attrcount={key.attrCount} 
                    suppresslowcounts={props.suppresslowcounts}
                    onnewvote={props.onnewvote}/>
                })}
        </ul>
    )
}

VotingSection.propTypes = {
    counts: PropTypes.array.isRequired,
    elementid: PropTypes.string.isRequired,
    onnewvote: PropTypes.func.isRequired,
    sectionthumbs: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    alphabetize: PropTypes.bool.isRequired,
    suppresslowcounts: PropTypes.bool.isRequired,
}