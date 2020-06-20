import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { faUserFriends } from '@fortawesome/free-solid-svg-icons'
import { Thumbnail } from './Thumbnail'
import { GameFooter } from './GameFooter'


export class GameCardFront extends React.Component {

    constructor(props) {
        super(props)
        this.getMyVote = this.getMyVote.bind(this)
        this.getUpvotedCategories = this.getUpvotedCategories.bind(this)
        this.getUpvotedMechanics = this.getUpvotedMechanics.bind(this)
    }

    getMyVote(section, attrName) {
        let myVote = this.props.allthumbs.attributes[section].hasOwnProperty(attrName) 
            ? 'thumbsup' //FIXME, derive from props: this.props.preferences['attrVote']
            : 'novote'
        return myVote
    }

    getUpvotedCategories() {
        return Object.entries(this.props.allthumbs.attributes['category']).filter( entry => entry[1] === 'thumbsup' && this.props.attributes.categories.includes(entry[0]) ).map( entry => entry[0] )
    }

    getUpvotedMechanics() {
        return Object.entries(this.props.allthumbs.attributes['mechanic']).filter( entry => entry[1] === 'thumbsup' && this.props.attributes.mechanics.includes(entry[0]) ).map( entry => entry[0] )
    }

    // player count section gets only one, aggregated vote; only one <li> (ex: "2-6 players") 
    getPlayersVote(myminplayers, mymaxplayers) {
        let vote = "novote"
        Object.keys(this.props.allthumbs.attributes.players).forEach( (votedPlayercount) => {
            let voted = parseInt(votedPlayercount.slice(0, -1))
            if (voted >= myminplayers
                && voted <= mymaxplayers
                && this.props.allthumbs.attributes.players[votedPlayercount] === 'thumbsup')
            {
                vote = "thumbsup"
            }
        })
        return 'supported-playercount ' + vote
    }

    // vote section gets only one, aggregated vote; only one <li> (ex: "medium heavy") 
    getWeightVote(myweight) {
        let vote = "novote"
        Object.keys(this.props.allthumbs.attributes.weight).forEach( (votedWeight) => {
            if (myweight === votedWeight
                && this.props.allthumbs.attributes.weight[votedWeight] === 'thumbsup')
            {
                vote = "thumbsup"
            }
        })
        return 'name ' + vote
    }

    getWeightName(myweight) {
        if (this.props.reallynarrow) {
            switch (myweight) {
                case 'medium light':
                    return 'm. light'
                case 'medium heavy':
                    return 'm. heavy'
                default:
                    return myweight
            }
        } else {
            return myweight
        }
    }

    render() {
        const { id, thumbnail, name, yearpublished, attributes, allthumbs, thumbcount, ontoggleinspection, ondelete } = this.props
        let upvoted_attributes = [ ...this.getUpvotedCategories(), ...this.getUpvotedMechanics() ].sort()
        return (
            <React.Fragment>
            <section className="gamecard-header">
                <button className="fa fa-button" onClick={ (e) => ondelete(e, id) }><FontAwesomeIcon icon={faTrash}/></button>
                <button className="fa fa-button inspect" onClick={ (e) => ontoggleinspection(e, id) }><FontAwesomeIcon icon={faInfoCircle}/></button>
            </section>
            <section className="gamecard-title">
                <h5 className="game-name">{name}</h5>
                {(yearpublished !== null) 
                    ? <h6 className="game-yearpublished">({yearpublished})</h6>
                    : <h6 className="game-yearpublished">(#{id})</h6>
                }
            </section>
            <section className="gamecard-visual">
                <Thumbnail url={thumbnail} allthumbs={allthumbs} thumbcount={thumbcount} />
                <div className="overlay">
                    {(attributes.min_players !== attributes.max_players)
                        ? <div className={this.getPlayersVote(attributes.min_players, attributes.max_players)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.min_players}-{attributes.max_players}</div>
                        : <div className={this.getPlayersVote(attributes.min_players, attributes.max_players)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.min_players}</div>
                    }
                    {(attributes.min_playtime !== attributes.max_playtime)
                        ? <div><FontAwesomeIcon icon={faClock}/> {attributes.min_playtime}-{attributes.max_playtime}'</div>
                        : <div><FontAwesomeIcon icon={faClock}/> {attributes.min_playtime}'</div>
                    }
                </div>
            </section>
            <div className="gamecard-weight">
                {(attributes.min_players !== attributes.max_players)
                    ? <div className={this.getPlayersVote(attributes.min_players, attributes.max_players)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.min_players}-{attributes.max_players}</div>
                    : <div className={this.getPlayersVote(attributes.min_players, attributes.max_players)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.min_players}</div>
                }
                {(attributes.min_playtime !== attributes.max_playtime)
                    ? <div className="estimated-playtime"><FontAwesomeIcon icon={faClock}/> {attributes.min_playtime}-{attributes.max_playtime}'</div>
                    : <div className="estimated-playtime"><FontAwesomeIcon icon={faClock}/> {attributes.min_playtime}'</div>
                }
                <div className={this.getWeightVote(attributes.average_weight_name)}>{this.getWeightName(attributes.average_weight_name)}</div>
            </div>
            <div className="gamecard-upvoted-attributes">
                { upvoted_attributes.map( (value) =>
                    <div key={value} className="thumbsup">{value}</div>
                )}
            </div>
            <ul className="gamecard-categories">
                {(attributes.categories.length)
                    ? attributes.categories.map(value => <li key={value} className={this.getMyVote('category', value)}>{value}</li>)
                    : <li>(no categories)</li>
                }
            </ul>
            <ul className="gamecard-mechanics">
                {(attributes.mechanics.length)
                    ? attributes.mechanics.map(value => <li key={value} className={this.getMyVote('mechanic', value)}>{value}</li>)
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
    id: PropTypes.number.isRequired,
    attributes: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    ondelete: PropTypes.func.isRequired,
    ontoggleinspection: PropTypes.func.isRequired,
    thumbcount: PropTypes.number.isRequired,
    thumbnail: PropTypes.string,
    allthumbs: PropTypes.object.isRequired,
    yearpublished: PropTypes.number,
    reallynarrow: PropTypes.bool.isRequired,
}