import React from 'react'
import { ViewControls } from './ViewControls'
import { Game } from './Game'

export class GameList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            sortOrder: 'maxvotes',
        }
        this.handleSortChange = this.handleSortChange.bind(this)
        this.getThumbCounts = this.getThumbCounts.bind(this)
    }

    getThumbCounts() {
        // tally all votes for each game
        let counts = {}
        for (const game of this.props.allgames) {
            let defaultCount = 0
            counts[game.name] = defaultCount
            // playercount section of a game gets ONE TOTAL thumbsup if any of its supported playercounts gets a thumbsup
            for (let playercount=game.minplayers; playercount<=game.maxplayers; playercount++) {
                if (this.props.thumbs.players.hasOwnProperty(playercount + 'P')) {
                    counts[game.name]++
                    break
                }
            }
            // categories section of a game gets one thumbsup for each thumbed-up category
            for (const category of game.categories) {
                if (this.props.thumbs.category.hasOwnProperty(category)) {
                    counts[game.name]++
                }
            }
            // mechanics section of a game gets one thumbsup for each thumbed-up mechanic
            for (const mechanic of game.mechanics) {
                if (this.props.thumbs.mechanic.hasOwnProperty(mechanic)) {
                    counts[game.name]++
                }
            }
        }
        return counts
    } 

    handleSortChange(event) {
        this.setState({
            sortOrder: event.target.value
        })
    }

    render() {
        let thumbcounts = this.getThumbCounts()
        return (
            <React.Fragment>
            <div id="view-controls">
            <ViewControls 
                sortby={this.state.sortOrder}
                onChange={this.handleSortChange}/>
            </div>

            <div id="resulting-games">
                {this.props.allgames
                // sort by maxvotes...     FIRST: most votes,        SECOND: shortest playtime
                // sort by maxplaytime...  FIRST: shortest playtime, SECOND: most votes
                // sort by maxplayers...   FIRST: most players,      SECOND: most votes
                .sort((this.state.sortOrder === 'maxvotes') 
                    ? ( (a, b) => (thumbcounts[a.name] < thumbcounts[b.name]) ? 1 : (thumbcounts[a.name] === thumbcounts[b.name]) && (a.maxplaytime > b.maxplaytime) ? 1 : -1 )
                    : ( (this.state.sortOrder === 'maxplaytime') 
                        ? ( (a, b) => (a.maxplaytime > b.maxplaytime) ? 1 : (a.maxplaytime === b.maxplaytime) && (thumbcounts[a.name] < thumbcounts[b.name]) ? 1 : -1 )
                        : ( (a, b) => (a.maxplayers < b.maxplayers) ? 1 : (a.maxplayers === b.maxplayers) && (thumbcounts[a.name] < thumbcounts[b.name]) ? 1 : -1 ) ) )
                .map(
                    (game, i) => 
                        <Game
                            key={i}
                            id={game.id} 
                            name={game.name} 
                            description={game.description} 
                            yearpublished={game.yearpublished} 
                            minplayers={game.minplayers} 
                            maxplayers={game.maxplayers} 
                            minplaytime={game.minplaytime} 
                            maxplaytime={game.maxplaytime}
                            categories={game.categories}
                            mechanics={game.mechanics} 
                            thumbs={this.props.thumbs} 
                            thumbcount={thumbcounts[game.name]}/>
                )}
            </div>
            </React.Fragment>
        )
    }
}