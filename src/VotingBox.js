import React from 'react'
import PropTypes from 'prop-types'
import { VotingSection } from './VotingSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltUp } from '@fortawesome/free-solid-svg-icons'
import { TransitionGroup, CSSTransition } from 'react-transition-group';

export class VotingBox extends React.Component {

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
        let numvotes = Object.keys(this.props.thumbs.players).length
            + Object.keys(this.props.thumbs.weight).length
            + Object.keys(this.props.thumbs.category).length
            + Object.keys(this.props.thumbs.mechanic).length
        return (
            <React.Fragment>

            <span className="instructions">
                <span className="leftGroup">Vote.</span>
                <button className="rightGroup default-styles" data-attrtype="all" onClick={this.props.onclearsectionvotes} disabled={numvotes===0}>Reset</button>
            </span>

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
                            counts={this.props.playercounts}
                            thumbs={this.props.thumbs['players']}
                            onnewvote={this.props.onnewvote}
                            onclearsectionvotes={this.props.onclearsectionvotes} 
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
                            counts={this.props.weightcounts}
                            thumbs={this.props.thumbs['weight']}
                            onnewvote={this.props.onnewvote}
                            onclearsectionvotes={this.props.onclearsectionvotes} 
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
                            counts={this.props.categorycounts}
                            thumbs={this.props.thumbs['category']}
                            onnewvote={this.props.onnewvote}
                            onclearsectionvotes={this.props.onclearsectionvotes} 
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
                            counts={this.props.mechaniccounts}
                            thumbs={this.props.thumbs['mechanic']}
                            onnewvote={this.props.onnewvote}
                            onclearsectionvotes={this.props.onclearsectionvotes} 
                        />
                    </CSSTransition>
                }
                </TransitionGroup>
                {this.props.playercounts.length === 0 
                && this.props.weightcounts.length === 0 
                && this.props.categorycounts.length === 0
                && this.props.mechaniccounts.length === 0
                &&
                    this.emptyMessage()
                }
            </div>

            </React.Fragment>
        )
    }
}

VotingBox.propTypes = {
    categorycounts: PropTypes.array.isRequired,
    mechaniccounts: PropTypes.array.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
    onnewvote: PropTypes.func.isRequired,
    playercounts: PropTypes.array.isRequired,
    thumbs: PropTypes.object.isRequired,
    weightcounts: PropTypes.array.isRequired,
}