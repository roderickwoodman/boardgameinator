import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { GameFooter } from './GameFooter'

export class GameCardFront extends React.Component {

    constructor(props) {
        super(props)
        this.getMyVote = this.getMyVote.bind(this)
    }

    getMyVote(section, attrName) {
        let myVote = this.props.thumbs[section].hasOwnProperty(attrName) 
            ? 'thumbsup' //FIXME, derive from props: this.props.preferences['attrVote']
            : 'novote'
        return myVote
    }

    // player count section gets only one, aggregated vote; only one <li> (ex: "2-6 players") 
    getAggregatedPlayersVote(minplayers, maxplayers) {
        let yesVotes = 0
        Object.keys(this.props.thumbs.players).forEach( (attrName) => {
            let myplayercount = parseInt(attrName.slice(0, -1))
            if (myplayercount >= minplayers
                && myplayercount <= maxplayers
                && this.props.thumbs.players[attrName] === 'thumbsup')
            {
                yesVotes++
            }
        })
        return (yesVotes > 0) ? "thumbsup" : "novote"
    }

    render() {
        const { id, name, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, categories, mechanics, thumbcount } = this.props
        return (
            <section className="cardFront">
                <section className="details major">
                    <h2 className="game-name">{name}</h2>
                    <h4 className="game-yearpublished">({yearpublished})</h4>
                </section>
                <ul className="summary major">
                    <li><FontAwesomeIcon icon={faThumbsUp} /> : {thumbcount}</li>
                </ul>
                <hr />
                <ul className="details major">
                    {(minplayers !== maxplayers)
                        ? <li className={this.getAggregatedPlayersVote(minplayers, maxplayers)}>{minplayers}-{maxplayers} players</li>
                        : <li className={this.getAggregatedPlayersVote(minplayers, maxplayers)}>{minplayers} players</li>
                    }
                    {(minplaytime !== maxplaytime)
                        ? <li>{minplaytime}-{maxplaytime} minutes</li>
                        : <li>{minplaytime} minutes</li>
                    }
                </ul>
                <hr />
                <ul className="details minor">
                    {(categories.length)
                        ? categories.map(value => <li key={value} className={this.getMyVote('category', value)}>{value}</li>)
                        : <li>(no categories)</li>
                    }
                </ul>
                <hr />
                <ul className="details minor">
                    {(mechanics.length)
                        ? mechanics.map(value => <li key={value} className={this.getMyVote('mechanic', value)}>{value}</li>)
                        : <li>(no mechanics)</li>
                    }
                </ul>
                <section>
                    <GameFooter gameid={id}/>
                </section>
            </section>
        )
    }
}