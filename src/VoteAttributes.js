import React from 'react'
import PropTypes from 'prop-types'
import { VotingSection } from './VotingSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltUp } from '@fortawesome/free-solid-svg-icons'
import { TransitionGroup, CSSTransition } from 'react-transition-group';

export class VoteAttributes extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            votingOn: 'players',
        }
        this.handleSectionChange = this.handleSectionChange.bind(this)
        this.emptyMessage = this.emptyMessage.bind(this)
        this.tallyPlayerCounts = this.tallyPlayerCounts.bind(this)
        this.tallyWeightCounts = this.tallyWeightCounts.bind(this)
        this.tallyCategoryCounts = this.tallyCategoryCounts.bind(this)
        this.tallyMechanicCounts = this.tallyMechanicCounts.bind(this)
    }

    handleSectionChange(event) {
        let newSelection = event.target.id.replace(/select-/g, '')
        this.setState({
            votingOn: newSelection
        })
    }

    emptyMessage() {
        return (
            <span className="message warning">
                <p>START COMPARING BOARDGAMES!</p>
                <p>Please add game titles using the form in the left sidebar.</p>
                <p>
                    <FontAwesomeIcon icon={faLongArrowAltUp} />&nbsp;
                    <FontAwesomeIcon icon={faLongArrowAltUp} />&nbsp;
                    <FontAwesomeIcon icon={faLongArrowAltUp} />&nbsp;
                </p>
            </span>
        )
    }

    tallyPlayerCounts() {
        // tally each allowable player count occurrence across all games
        let countsObj = {}
        for (const game of this.props.allgames) {
            for (let playercount=game.attributes.min_players; playercount<=game.attributes.max_players; playercount++) {
                let playerCountAttr = playercount + 'P'
                if (countsObj.hasOwnProperty(playerCountAttr)) {
                    countsObj[playerCountAttr] = countsObj[playerCountAttr] + 1
                } else {
                    countsObj[playerCountAttr] = 1
                }
            }
        }
        // sort each attribute according to total occurrences
        let countsArray = []
        Object.keys(countsObj).forEach((elementTag) => {
            let newCount = {'attrName': elementTag, 'attrCount': countsObj[elementTag]}
            countsArray.push(newCount)
        })
        countsArray.sort((a, b) => (parseInt(a.attrName.slice(0, -1)) < parseInt(b.attrName.slice(0, -1))) ? 1 : -1)
        return countsArray
    }

    tallyWeightCounts() {
        // tally each weight occurrence across all games
        let countsObj = {}
        for (const game of this.props.allgames) {
            if (countsObj.hasOwnProperty(game.attributes.average_weight_name)) {
                countsObj[game.attributes.average_weight_name] = countsObj[game.attributes.average_weight_name] + 1
            } else {
                countsObj[game.attributes.average_weight_name] = 1
            }
        }
        // sort weights into a predefined order
        let weights = ["light", "medium light", "medium", "medium heavy", "heavy"]
        let countsArray = []
        for (let weight of weights) {
            if (countsObj.hasOwnProperty(weight)) {
                countsArray.push({'attrName': weight, 'attrCount': countsObj[weight]})
            } else {
                countsArray.push({'attrName': weight, 'attrCount': 0})
            }
        }
        return countsArray
    }

    tallyCategoryCounts() {
        // tally each attribute's occurrence across all games
        let countsObj = {}
        for (const game of this.props.allgames) {
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
            countsArray.push({'attrName': elementTag, 'attrCount': countsObj[elementTag]})
        })
        countsArray.sort((a, b) => (a.attrCount < b.attrCount) ? 1 : (a.attrCount === b.attrCount) && (a.attrName > b.attrName) ? 1 : -1)
        return countsArray
    }

    tallyMechanicCounts() {
        // tally each attribute's occurrence across all games
        let countsObj = {}
        for (const game of this.props.allgames) {
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
            countsArray.push({'attrName': elementTag, 'attrCount': countsObj[elementTag]})
        })
        countsArray.sort((a, b) => (a.attrCount < b.attrCount) ? 1 : (a.attrCount === b.attrCount) && (a.attrName > b.attrName) ? 1 : -1)
        return countsArray
    }

    render() {

        let attributestally = {
            playercounts: this.tallyPlayerCounts(),
            weightcounts: this.tallyWeightCounts(),
            categorycounts: this.tallyCategoryCounts(),
            mechaniccounts: this.tallyMechanicCounts(),
        }

        return (
            <React.Fragment>

            <h4>Upvote board game attributes:</h4>

            <ul id="votingsection-selector">
                <li id="select-players" className={"selector" + (this.state.votingOn === "players" ? " selected" : "")} onClick={this.handleSectionChange}>Players</li>
                <li id="select-weights" className={"selector" + (this.state.votingOn === "weights" ? " selected" : "")} onClick={this.handleSectionChange}>Weights</li>
                <li id="select-categories" className={"selector" + (this.state.votingOn === "categories" ? " selected" : "")} onClick={this.handleSectionChange}>Categories</li>
                <li id="select-mechanics" className={"selector" + (this.state.votingOn === "mechanics" ? " selected" : "")} onClick={this.handleSectionChange}>Mechanics</li>
            </ul>

            <div id="voting-section">
                <TransitionGroup>
                {this.state.votingOn === 'players' &&
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
                            sectionthumbs={this.props.attrthumbs['players']}
                            onnewvote={this.props.onnewvote}
                            alphabetize={false}
                            suppresslowcounts={false}
                        />
                    </CSSTransition>
                }
                {this.state.votingOn === 'weights' &&
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
                            sectionthumbs={this.props.attrthumbs['weight']}
                            onnewvote={this.props.onnewvote}
                            alphabetize={false}
                            suppresslowcounts={false}
                        />
                    </CSSTransition>
                }
                {this.state.votingOn === 'categories' &&
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
                            sectionthumbs={this.props.attrthumbs['category']}
                            onnewvote={this.props.onnewvote}
                            alphabetize={true}
                            suppresslowcounts={true}
                        />
                    </CSSTransition>
                }
                {this.state.votingOn === 'mechanics' &&
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
                            sectionthumbs={this.props.attrthumbs['mechanic']}
                            onnewvote={this.props.onnewvote}
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
                    this.emptyMessage()
                }
            </div>

            </React.Fragment>
        )
    }
}

VoteAttributes.propTypes = {
    allgames: PropTypes.object.isRequired,
    attrthumbs: PropTypes.object.isRequired,
    onnewvote: PropTypes.func.isRequired,
}