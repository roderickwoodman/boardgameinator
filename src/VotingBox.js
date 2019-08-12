import React from 'react'
import { VotingSection } from './VotingSection';

export class VotingBox extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            voteSection: 'players',
        }
        this.handleSortChange = this.handleSortChange.bind(this)
    }

    handleSortChange(event) {
        this.setState({
            voteSection: event.target.value
        })
        console.log('(FIXME, sidebar should only display the ', event.target.value, 'content)')
    }

    render() {
        return (
            <React.Fragment>

            <div id="vote-sections">
                <div>
                    <label>
                        <input type='radio' key='players' id='players' name='votesection' checked={this.state.voteSection==='players'} value='players' onChange={this.handleSortChange} /> 
                        Players</label>
                    <label>
                        <input type='radio' key='categories' id='categories' name='votesection' checked={this.state.voteSection==='categories'} value='categories' onChange={this.handleSortChange} /> 
                        Categories</label>
                    <label>
                        <input type='radio' key='mechanics' id='mechanics' name='votesection' checked={this.state.voteSection==='mechanics'} value='mechanics' onChange={this.handleSortChange} /> 
                        Mechanics</label>
                </div>
            </div>
            <button data-attrtype="all" onClick={this.props.onclearsectionvotes}>CLEAR ALL</button>
            <VotingSection
                type='players'
                id='supported-players'
                title='PLAYERS:' 
                counts={this.props.playercounts}
                thumbs={this.props.thumbs['players']} 
                onnewvote={this.props.onnewvote}
                onclearsectionvotes={this.props.onclearsectionvotes}/>
            <VotingSection
                type='category'
                id='category-counts'
                title='CATEGORY:' 
                counts={this.props.categorycounts}
                thumbs={this.props.thumbs['category']} 
                onnewvote={this.props.onnewvote}
                onclearsectionvotes={this.props.onclearsectionvotes}/>
            <VotingSection
                type='mechanic'
                id='mechanic-counts'
                title='MECHANIC:' 
                counts={this.props.mechaniccounts}
                thumbs={this.props.thumbs['mechanic']} 
                onnewvote={this.props.onnewvote}
                onclearsectionvotes={this.props.onclearsectionvotes}/>
            </React.Fragment>
        )
    }
}