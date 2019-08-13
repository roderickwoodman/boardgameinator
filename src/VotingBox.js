import React from 'react'
import { VotingSection } from './VotingSection';

export class VotingBox extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            votingOn: 'players',
        }
        this.handleSectionChange = this.handleSectionChange.bind(this)
    }

    handleSectionChange(event) {
        this.setState({
            votingOn: event.target.value
        })
    }

    renderSection() {
        if (this.state.votingOn === 'players') {
            return(
                <VotingSection 
                    type='players'
                    id='supported-players'
                    title='PLAYERS:'
                    counts={this.props.playercounts}
                    thumbs={this.props.thumbs['players']}
                    onnewvote={this.props.onnewvote}
                    onclearsectionvotes={this.props.onclearsectionvotes} />
            )
        }
        if (this.state.votingOn === 'categories') {
            return(
                <VotingSection 
                    type='category'
                    id='category-counts'
                    title='CATEGORY:'
                    counts={this.props.categorycounts}
                    thumbs={this.props.thumbs['category']}
                    onnewvote={this.props.onnewvote}
                    onclearsectionvotes={this.props.onclearsectionvotes} />
            )
        }
        if (this.state.votingOn === 'mechanics') {
            return(
                <VotingSection 
                    type='mechanic'
                    id='mechanic-counts'
                    title='MECHANIC:'
                    counts={this.props.mechaniccounts}
                    thumbs={this.props.thumbs['mechanic']}
                    onnewvote={this.props.onnewvote}
                    onclearsectionvotes={this.props.onclearsectionvotes} />
            )
        }
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
                { this.renderSection() }
            </div>

            </React.Fragment>
        )
    }
}