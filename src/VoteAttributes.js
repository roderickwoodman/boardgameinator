import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { VotingSection } from './VotingSection';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

export const VoteAttributes = (props) => {

    const [ votingOn, setVotingOn ] = useState('players')
    const [ updatedAttrthumbs, setUpdatedAttrthumbs ] = useState(props.attrthumbs)

    const handleSectionChange = (event) => {
        const newSelection = event.target.id.replace(/select-/g, '')
        setVotingOn(newSelection)
    }

    const emptyMessage = () => {
        return (
            <span className="message warning">
                <p>No board games to compare yet</p>
                <p>Please add game titles by clicking on "Add Games".</p>
            </span>
        )
    }

    const onNewVote = (event) => {

        const { votingtype, votingon, newvote } = Object.assign({}, event.currentTarget.dataset)

        let newThumbs = JSON.parse(JSON.stringify(updatedAttrthumbs));
        let initNewvote = ['_me_'], initVotingon = {}, initVotingtype = {}
        initVotingon[newvote] = initNewvote
        initVotingtype[votingon] = initVotingon

        // no votes have been recorded for this type
        if ( !updatedAttrthumbs.hasOwnProperty(votingtype) ) {
            newThumbs[votingtype] = initVotingtype

        // no votes have been recorded for this attribute
        } else if ( !updatedAttrthumbs[votingtype].hasOwnProperty(votingon) ) {
            newThumbs[votingtype][votingon] = initVotingon

        // no votes have been recorded for this vote value
        } else if ( !updatedAttrthumbs[votingtype][votingon].hasOwnProperty(newvote) ) {
            newThumbs[votingtype][votingon][newvote] = initNewvote

        // this vote value for this attribute has been recorded previously, so update it
        } else {
            if (updatedAttrthumbs[votingtype][votingon][newvote].includes('_me_')) { 
                newThumbs[votingtype][votingon][newvote] = updatedAttrthumbs[votingtype][votingon][newvote].filter( user => user !== '_me_' )
            } else {
                newThumbs[votingtype][votingon][newvote].push('_me_')
            }
        }

        setUpdatedAttrthumbs(newThumbs)
    }

    const tallyPlayerCounts = (props) => {
        // tally each allowable player count occurrence across all games
        let countsObj = {}
        for (const game of props.activegamedata) {
            for (let playercount=game.attributes.min_players; playercount<=game.attributes.max_players; playercount++) {
                if (playercount <= 10) {
                    const playerCountAttr = (playercount === 10) ? '10P+' : playercount + 'P'
                    if (countsObj.hasOwnProperty(playerCountAttr)) {
                        countsObj[playerCountAttr] = countsObj[playerCountAttr] + 1
                    } else {
                        countsObj[playerCountAttr] = 1
                    }
                }
            }
        }
        // sort each attribute according to total occurrences
        let countsArray = []
        Object.keys(countsObj).forEach((elementTag) => {
            const newCount = {'attrId': elementTag, 'attrName': elementTag, 'attrCount': countsObj[elementTag]}
            countsArray.push(newCount)
        })
        countsArray.sort((a, b) => (parseInt(a.attrName.slice(0, -1)) < parseInt(b.attrName.slice(0, -1))) ? 1 : -1)
        return countsArray
    }

    const tallyWeightCounts = (props) => {
        // tally each weight occurrence across all games
        let countsObj = {}
        for (const game of props.activegamedata) {
            if (countsObj.hasOwnProperty(game.attributes.average_weight_name)) {
                countsObj[game.attributes.average_weight_name] = countsObj[game.attributes.average_weight_name] + 1
            } else {
                countsObj[game.attributes.average_weight_name] = 1
            }
        }
        // sort weights into a predefined order
        const weights = ["light", "medium light", "medium", "medium heavy", "heavy"]
        let countsArray = []
        for (const weight of weights) {
            if (countsObj.hasOwnProperty(weight)) {
                countsArray.push({'attrId': weight, 'attrName': weight, 'attrCount': countsObj[weight]})
            } else {
                countsArray.push({'attrId': weight, 'attrName': weight, 'attrCount': 0})
            }
        }
        return countsArray
    }

    const tallyCategoryCounts = (props) => {
        // tally each attribute's occurrence across all games
        let countsObj = {}
        for (const game of props.activegamedata) {
            for (const category of game.attributes.categories) {
                if (countsObj.hasOwnProperty(category)) {
                    countsObj[category] = countsObj[category] + 1
                } else {
                    countsObj[category] = 1
                }
            }
        }
        // sort each attribute according to total occurrences
        let countsArray = []
        Object.keys(countsObj).forEach((elementTag) => {
            countsArray.push({'attrId': elementTag, 'attrName': elementTag, 'attrCount': countsObj[elementTag]})
        })
        countsArray.sort((a, b) => (a.attrCount < b.attrCount) ? 1 : (a.attrCount === b.attrCount) && (a.attrName > b.attrName) ? 1 : -1)
        return countsArray
    }

    const tallyMechanicCounts = (props) => {
        // tally each attribute's occurrence across all games
        let countsObj = {}
        for (const game of props.activegamedata) {
            for (const mechanic of game.attributes.mechanics) {
                if (countsObj.hasOwnProperty(mechanic)) {
                    countsObj[mechanic] = countsObj[mechanic] + 1
                } else {
                    countsObj[mechanic] = 1
                }
            }
        }
        // sort each attribute according to total occurrences
        let countsArray = []
        Object.keys(countsObj).forEach((elementTag) => {
            countsArray.push({'attrId': elementTag, 'attrName': elementTag, 'attrCount': countsObj[elementTag]})
        })
        countsArray.sort((a, b) => (a.attrCount < b.attrCount) ? 1 : (a.attrCount === b.attrCount) && (a.attrName > b.attrName) ? 1 : -1)
        return countsArray
    }

    const attributestally = {
        playercounts: tallyPlayerCounts(props),
        weightcounts: tallyWeightCounts(props),
        categorycounts: tallyCategoryCounts(props),
        mechaniccounts: tallyMechanicCounts(props),
    }

    return (
        <React.Fragment>

        <h4>Upvote board game attributes:</h4>

        <ul id="votingsection-selector">
            <li id="select-players" className={"segmentedcontrol lightbg" + ({ votingOn } === "players" ? " selected" : "")} onClick={handleSectionChange}>Players</li>
            <li id="select-weights" className={"segmentedcontrol lightbg" + ({ votingOn } === "weights" ? " selected" : "")} onClick={handleSectionChange}>Weights</li>
            <li id="select-categories" className={"segmentedcontrol lightbg" + ({ votingOn } === "categories" ? " selected" : "")} onClick={handleSectionChange}>Categories</li>
            <li id="select-mechanics" className={"segmentedcontrol lightbg" + ({ votingOn } === "mechanics" ? " selected" : "")} onClick={handleSectionChange}>Mechanics</li>
        </ul>

        <div id="voting-section">
            <TransitionGroup>
            {votingOn === 'players' &&
                <CSSTransition
                    key={0}
                    in={true}
                    appear={false}
                    timeout={2000}
                    classNames={"showsegment"}
                >
                    <VotingSection 
                        type='players'
                        elementid='supported-players'
                        title='PLAYERS:'
                        counts={attributestally.playercounts}
                        sectionthumbs={updatedAttrthumbs['players']}
                        onnewvote={onNewVote}
                        alphabetize={false}
                        suppresslowcounts={false}
                    />
                </CSSTransition>
            }
            {votingOn === 'weights' &&
                <CSSTransition
                    key={1}
                    in={true}
                    appear={false}
                    timeout={2000}
                    classNames={"showsegment"}
                >
                    <VotingSection 
                        type='weight'
                        elementid='weight-counts'
                        title='WEIGHT:'
                        counts={attributestally.weightcounts}
                        sectionthumbs={updatedAttrthumbs['weight']}
                        onnewvote={onNewVote}
                        alphabetize={false}
                        suppresslowcounts={false}
                    />
                </CSSTransition>
            }
            {votingOn === 'categories' &&
                <CSSTransition
                    key={2}
                    in={true}
                    appear={false}
                    timeout={2000}
                    classNames={"showsegment"}
                >
                    <VotingSection 
                        type='category'
                        elementid='category-counts'
                        title='CATEGORY:'
                        counts={attributestally.categorycounts}
                        sectionthumbs={updatedAttrthumbs['category']}
                        onnewvote={onNewVote}
                        alphabetize={true}
                        suppresslowcounts={true}
                    />
                </CSSTransition>
            }
            {votingOn === 'mechanics' &&
                <CSSTransition
                    key={3}
                    in={true}
                    appear={false}
                    timeout={2000}
                    classNames={"showsegment"}
                >
                    <VotingSection 
                        type='mechanic'
                        elementid='mechanic-counts'
                        title='MECHANIC:'
                        counts={attributestally.mechaniccounts}
                        sectionthumbs={updatedAttrthumbs['mechanic']}
                        onnewvote={onNewVote}
                        alphabetize={true}
                        suppresslowcounts={true}
                    />
                </CSSTransition>
            }
            </TransitionGroup>
            {attributestally.playercounts.length === 0 
            && attributestally.weightcounts.length === 0 
            && attributestally.categorycounts.length === 0
            && attributestally.mechaniccounts.length === 0
            &&
                emptyMessage()
            }
        </div>

        </React.Fragment>
    )
}

VoteAttributes.propTypes = {
    activegamedata: PropTypes.array.isRequired,
    attrthumbs: PropTypes.object.isRequired,
    onnewvote: PropTypes.func.isRequired,
}