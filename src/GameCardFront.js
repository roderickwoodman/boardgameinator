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
        let myVote = this.props.attrthumbs[section].hasOwnProperty(attrName) 
            ? 'thumbsup' //FIXME, derive from props: this.props.preferences['attrVote']
            : 'novote'
        return myVote
    }

    getUpvotedCategories() {
        return Object.entries(this.props.attrthumbs['category']).filter( entry => entry[1] === 'thumbsup' && this.props.categories.includes(entry[0]) ).map( entry => entry[0] )
    }

    getUpvotedMechanics() {
        return Object.entries(this.props.attrthumbs['mechanic']).filter( entry => entry[1] === 'thumbsup' && this.props.mechanics.includes(entry[0]) ).map( entry => entry[0] )
    }

    // player count section gets only one, aggregated vote; only one <li> (ex: "2-6 players") 
    getPlayersVote(myminplayers, mymaxplayers) {
        let vote = "novote"
        Object.keys(this.props.attrthumbs.players).forEach( (votedPlayercount) => {
            let voted = parseInt(votedPlayercount.slice(0, -1))
            if (voted >= myminplayers
                && voted <= mymaxplayers
                && this.props.attrthumbs.players[votedPlayercount] === 'thumbsup')
            {
                vote = "thumbsup"
            }
        })
        return 'supported-playercount ' + vote
    }

    // vote section gets only one, aggregated vote; only one <li> (ex: "medium heavy") 
    getWeightVote(myweight) {
        let vote = "novote"
        Object.keys(this.props.attrthumbs.weight).forEach( (votedWeight) => {
            if (myweight === votedWeight
                && this.props.attrthumbs.weight[votedWeight] === 'thumbsup')
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
        const { id, thumbnail, name, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, averageweightname, categories, mechanics, totalattributevotes, thumbcount, ontoggleinspection, ondelete } = this.props
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
                <Thumbnail url={thumbnail} thumbcount={thumbcount} totalattributevotes={totalattributevotes} />
                <div className="overlay">
                    {(minplayers !== maxplayers)
                        ? <div className={this.getPlayersVote(minplayers, maxplayers)}><FontAwesomeIcon icon={faUserFriends}/> {minplayers}-{maxplayers}</div>
                        : <div className={this.getPlayersVote(minplayers, maxplayers)}><FontAwesomeIcon icon={faUserFriends}/> {minplayers}</div>
                    }
                    {(minplaytime !== maxplaytime)
                        ? <div><FontAwesomeIcon icon={faClock}/> {minplaytime}-{maxplaytime}'</div>
                        : <div><FontAwesomeIcon icon={faClock}/> {minplaytime}'</div>
                    }
                </div>
            </section>
            <div className="gamecard-weight">
                {(minplayers !== maxplayers)
                    ? <div className={this.getPlayersVote(minplayers, maxplayers)}><FontAwesomeIcon icon={faUserFriends}/> {minplayers}-{maxplayers}</div>
                    : <div className={this.getPlayersVote(minplayers, maxplayers)}><FontAwesomeIcon icon={faUserFriends}/> {minplayers}</div>
                }
                {(minplaytime !== maxplaytime)
                    ? <div className="estimated-playtime"><FontAwesomeIcon icon={faClock}/> {minplaytime}-{maxplaytime}'</div>
                    : <div className="estimated-playtime"><FontAwesomeIcon icon={faClock}/> {minplaytime}'</div>
                }
                <div className={this.getWeightVote(averageweightname)}>{this.getWeightName(averageweightname)}</div>
            </div>
            <div className="gamecard-upvoted-attributes">
                { upvoted_attributes.map( (value) =>
                    <div key={value} className="thumbsup">{value}</div>
                )}
            </div>
            <ul className="gamecard-categories">
                {(categories.length)
                    ? categories.map(value => <li key={value} className={this.getMyVote('category', value)}>{value}</li>)
                    : <li>(no categories)</li>
                }
            </ul>
            <ul className="gamecard-mechanics">
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
    totalattributevotes: PropTypes.number.isRequired,
    thumbcount: PropTypes.number.isRequired,
    thumbnail: PropTypes.string,
    attrthumbs: PropTypes.object.isRequired,
    yearpublished: PropTypes.number,
    reallynarrow: PropTypes.bool.isRequired,
}