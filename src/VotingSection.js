import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

const VotableElement = (props) => {

    // props.votingtype === title : votingon:63888, votinglabel:Innovation, preferences: {63888: {thumbsup: [{rank:1, user:Nobody}]}}
    // props.votingtype !== title : votingon:Card Game, votinglabel:Card Game, preferences: {Nobody}

    let vote
    if (props.votingtype === 'title') {
        vote = (props.preferences.hasOwnProperty(props.votingon)
        && props.preferences[props.votingon].hasOwnProperty('thumbsup')
        && props.preferences[props.votingon].thumbsup.filter( vote => vote.user === props.user ).length) ? 'thumbsup' : 'novote'
    } else {
        vote = (props.preferences.hasOwnProperty(props.votingon)
        && props.preferences[props.votingon].hasOwnProperty('thumbsup')
        && props.preferences[props.votingon].thumbsup.includes(props.user)) ? 'thumbsup' : 'novote'

    }
    let elementStyle = "voteable"
    elementStyle += ` ${vote}`
    let votableText = props.votingonlabel
    if (props.attrcount > 1 || !props.suppresslowcounts) {
        votableText += ` (${props.attrcount})`
    }
    if (props.votingtype === 'category' || props.votingtype === 'mechanic') {
        votableText = votableText.toLowerCase()
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
                onClick={props.onNewVote}
            >
                {votableText}
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
                    user={props.user}
                    preferences={props.sectionthumbs}
                    votingtype={props.type}
                    votingon={key.attrId} 
                    votingonlabel={key.attrName} 
                    attrcount={key.attrCount} 
                    suppresslowcounts={props.suppresslowcounts}
                    onNewVote={props.onNewVote}/>
                })}
        </ul>
    )
}

VotingSection.propTypes = {
    user: PropTypes.string,
    counts: PropTypes.array.isRequired,
    elementid: PropTypes.string.isRequired,
    onNewVote: PropTypes.func.isRequired,
    sectionthumbs: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    alphabetize: PropTypes.bool.isRequired,
    suppresslowcounts: PropTypes.bool.isRequired,
}