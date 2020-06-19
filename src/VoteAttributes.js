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

    render() {

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
                            counts={this.props.attributestally.playercounts}
                            thumbs={this.props.attrthumbs['players']}
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
                            counts={this.props.attributestally.weightcounts}
                            thumbs={this.props.attrthumbs['weight']}
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
                            counts={this.props.attributestally.categorycounts}
                            thumbs={this.props.attrthumbs['category']}
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
                            counts={this.props.attributestally.mechaniccounts}
                            thumbs={this.props.attrthumbs['mechanic']}
                            onnewvote={this.props.onnewvote}
                            alphabetize={true}
                            suppresslowcounts={true}
                        />
                    </CSSTransition>
                }
                </TransitionGroup>
                {this.props.attributestally.playercounts.length === 0 
                && this.props.attributestally.weightcounts.length === 0 
                && this.props.attributestally.categorycounts.length === 0
                && this.props.attributestally.mechaniccounts.length === 0
                &&
                    this.emptyMessage()
                }
            </div>

            </React.Fragment>
        )
    }
}

VoteAttributes.propTypes = {
    attributestally: PropTypes.object.isRequired,
    attrthumbs: PropTypes.object.isRequired,
    onnewvote: PropTypes.func.isRequired,
}