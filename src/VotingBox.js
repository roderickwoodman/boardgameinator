import React from 'react'
import { VotingSection } from './VotingSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltUp } from '@fortawesome/free-solid-svg-icons'

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
        this.setState({
            votingOn: event.target.value
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

            <span className='instructions'>
                <span className='circledNumber'>&#9313;</span>Vote on parts.
            </span>

            <div id="votesection-selector">
                <div>
                    <label>
                        <input type='radio' key='players' id='players' name='votesection' checked={this.state.votingOn==='players'} value='players' onChange={this.handleSectionChange} /> 
                        Players</label>
                    <label>
                        <input type='radio' key='categories' id='categories' name='votesection' checked={this.state.votingOn==='categories'} value='categories' onChange={this.handleSectionChange} /> 
                        Categories</label>
                    <label>
                        <input type='radio' key='mechanics' id='mechanics' name='votesection' checked={this.state.votingOn==='mechanics'} value='mechanics' onChange={this.handleSectionChange} /> 
                        Mechanics</label>
                </div>
            </div>

            <button data-attrtype="all" onClick={this.props.onclearsectionvotes}>CLEAR ALL VOTES</button>

            <div id="voting-section">
                {this.state.votingOn === 'players' && (
                    <VotingSection 
                        type='players'
                        id='supported-players'
                        title='PLAYERS:'
                        counts={this.props.playercounts}
                        thumbs={this.props.thumbs['players']}
                        onnewvote={this.props.onnewvote}
                        onclearsectionvotes={this.props.onclearsectionvotes} />
                )}
                {this.state.votingOn === 'categories' && (
                    <VotingSection 
                        type='category'
                        id='category-counts'
                        title='CATEGORY:'
                        counts={this.props.categorycounts}
                        thumbs={this.props.thumbs['category']}
                        onnewvote={this.props.onnewvote}
                        onclearsectionvotes={this.props.onclearsectionvotes} />
                )}
                {this.state.votingOn === 'mechanics' && (
                    <VotingSection 
                        type='mechanic'
                        id='mechanic-counts'
                        title='MECHANIC:'
                        counts={this.props.mechaniccounts}
                        thumbs={this.props.thumbs['mechanic']}
                        onnewvote={this.props.onnewvote}
                        onclearsectionvotes={this.props.onclearsectionvotes} />
                )}
                {this.props.playercounts.length === 0 
                && this.props.categorycounts.length === 0
                && this.props.mechaniccounts.length === 0
                && (
                    this.emptyMessage()
                )}
            </div>

            </React.Fragment>
        )
    }
}