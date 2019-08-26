import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
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
    getPlayersVote(myminplayers, mymaxplayers) {
        let vote = "novote"
        Object.keys(this.props.thumbs.players).forEach( (votedPlayercount) => {
            let voted = parseInt(votedPlayercount.slice(0, -1))
            if (voted >= myminplayers
                && voted <= mymaxplayers
                && this.props.thumbs.players[votedPlayercount] === 'thumbsup')
            {
                vote = "thumbsup"
            }
        })
        return vote
    }

    // vote section gets only one, aggregated vote; only one <li> (ex: "medium heavy") 
    getWeightVote(myweight) {
        let vote = "novote"
        Object.keys(this.props.thumbs.weight).forEach( (votedWeight) => {
            if (myweight === votedWeight
                && this.props.thumbs.weight[votedWeight] === 'thumbsup')
            {
                vote = "thumbsup"
            }
        })
        return vote
    }

    render() {
        const { id, name, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, averageweightname, categories, mechanics, thumbcount, ontoggleinspection, ondelete } = this.props
        return (
            <section className="game">
                <section className="details">
                    <button id={id} onClick={ontoggleinspection}>more...</button>
                    <button onClick={ (e) => ondelete(e, id) }>
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </section>
                <section className="details major">
                    <h2 className="game-name">{name}</h2>
                    {(yearpublished !== null) 
                        ? <h4 className="game-yearpublished">({yearpublished})</h4>
                        : <h4 className="game-yearpublished">(#{id})</h4>
                    }
                </section>
                <ul className="summary major">
                    <li><FontAwesomeIcon icon={faThumbsUp} /> : {thumbcount}</li>
                </ul>
                <hr />
                <ul className="details major">
                    {(minplayers !== maxplayers)
                        ? <li className={this.getPlayersVote(minplayers, maxplayers)}>{minplayers}-{maxplayers} players</li>
                        : <li className={this.getPlayersVote(minplayers, maxplayers)}>{minplayers} players</li>
                    }
                    {(minplaytime !== maxplaytime)
                        ? <li>{minplaytime}-{maxplaytime} minutes</li>
                        : <li>{minplaytime} minutes</li>
                    }
                    <li className={this.getWeightVote(averageweightname)}>{averageweightname}</li>
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