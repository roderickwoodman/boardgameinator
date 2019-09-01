import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { faUserFriends } from '@fortawesome/free-solid-svg-icons'
import { GameFooter } from './GameFooter'

function Thumbnail(props) {
    return (
        <React.Fragment>
        <img src={props.url} alt="game box cover" />
        </React.Fragment>
    )
}

Thumbnail.propTypes = {
    thumbcount: PropTypes.number.isRequired,
    url: PropTypes.string.isRequired,
}

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
        const { id, thumbnail, name, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, averageweightname, categories, mechanics, thumbcount, ontoggleinspection, ondelete } = this.props
        return (
            <React.Fragment>
            <section className="gamecard-header">
                <button id={id} onClick={ontoggleinspection}>more...</button>
                <button onClick={ (e) => ondelete(e, id) }>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </section>
            <section className="gamecard-title">
                <h2 className="game-name">{name}</h2>
                {(yearpublished !== null) 
                    ? <h4 className="game-yearpublished">({yearpublished})</h4>
                    : <h4 className="game-yearpublished">(#{id})</h4>
                }
            </section>
            <ul className="gamecard-details thumbnail">
                <Thumbnail url={thumbnail} thumbcount={thumbcount} />
            </ul>
            <ul className="gamecard-details major">
                <div><FontAwesomeIcon icon={faThumbsUp} /> : {thumbcount}</div>
                {(minplayers !== maxplayers)
                    ? <li className={this.getPlayersVote(minplayers, maxplayers)}><FontAwesomeIcon icon={faUserFriends}/> {minplayers}-{maxplayers}</li>
                    : <li className={this.getPlayersVote(minplayers, maxplayers)}><FontAwesomeIcon icon={faUserFriends}/> {minplayers}</li>
                }
                {(minplaytime !== maxplaytime)
                    ? <li><FontAwesomeIcon icon={faClock}/> {minplaytime}-{maxplaytime}'</li>
                    : <li><FontAwesomeIcon icon={faClock}/> {minplaytime}'</li>
                }
                <li className={this.getWeightVote(averageweightname)}>{averageweightname}</li>
            </ul>
            <hr />
            <ul className="gamecard-details minor">
                {(categories.length)
                    ? categories.map(value => <li key={value} className={this.getMyVote('category', value)}>{value}</li>)
                    : <li>(no categories)</li>
                }
            </ul>
            <hr />
            <ul className="gamecard-details minor">
                {(mechanics.length)
                    ? mechanics.map(value => <li key={value} className={this.getMyVote('mechanic', value)}>{value}</li>)
                    : <li>(no mechanics)</li>
                }
            </ul>
            <section className="gamecard-footer">
                <GameFooter gameid={id}/>
            </section>
            </React.Fragment>
        )
    }
}

GameCardFront.propTypes = {
    averageweightname: PropTypes.string.isRequired,
    categories: PropTypes.array.isRequired,
    id: PropTypes.number.isRequired,
    maxplayers: PropTypes.number.isRequired,
    maxplaytime: PropTypes.number.isRequired,
    mechanics: PropTypes.array.isRequired,
    minplayers: PropTypes.number.isRequired,
    minplaytime: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    ondelete: PropTypes.func.isRequired,
    ontoggleinspection: PropTypes.func.isRequired,
    thumbcount: PropTypes.number.isRequired,
    thumbnail: PropTypes.string.isRequired,
    thumbs: PropTypes.object.isRequired,
    yearpublished: PropTypes.number,
}