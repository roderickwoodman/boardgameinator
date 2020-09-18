import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { faUserFriends } from '@fortawesome/free-solid-svg-icons'
import { Thumbnail } from './Thumbnail'

export const GameCardFront = (props) => {

    const getClasses = (section, attrName) => {
        let classes = 'attribute'
        if (section === 'weight') {
            let weight_vote = getWeightVote(attrName)
            classes += ' weight ' + weight_vote
        } else if (section === 'supported-playercount') {
            let supported_players_vote = getPlayersVote(props.attributes.min_players, props.attributes.max_players)
            classes += ' supported-playercount ' + supported_players_vote
        } else {
            classes += (props.activethumbs.attributes[section].hasOwnProperty(attrName) 
                        && props.activethumbs.attributes[section][attrName] === 'thumbsup')
                ? ' thumbsup' //FIXME, derive from props: props.preferences['attrVote']
                : ' novote'
        }
        return classes
    }

    const getUpvotedCategories = () => {
        return Object.entries(props.activethumbs.attributes['category']).filter( entry => entry[1] === 'thumbsup' && props.attributes.categories.includes(entry[0]) ).map( entry => entry[0] )
    }

    const getUpvotedMechanics = () => {
        return Object.entries(props.activethumbs.attributes['mechanic']).filter( entry => entry[1] === 'thumbsup' && props.attributes.mechanics.includes(entry[0]) ).map( entry => entry[0] )
    }

    // player count section gets only one, aggregated vote; only one <li> (ex: "2-6 players") 
    const getPlayersVote = (myminplayers, mymaxplayers) => {
        let vote = "novote"
        Object.keys(props.activethumbs.attributes.players).forEach( (votedPlayercount) => {
            let voted = parseInt(votedPlayercount.slice(0, -1))
            if (voted >= myminplayers
                && voted <= mymaxplayers
                && props.activethumbs.attributes.players[votedPlayercount] === 'thumbsup')
            {
                vote = "thumbsup"
            }
        })
        return vote
    }

    // vote section gets only one, aggregated vote; only one <li> (ex: "medium heavy") 
    const getWeightVote = (myweight) => {
        let vote = "novote"
        Object.keys(props.activethumbs.attributes.weight).forEach( (votedWeight) => {
            if (myweight === votedWeight
                && props.activethumbs.attributes.weight[votedWeight] === 'thumbsup')
            {
                vote = "thumbsup"
            }
        })
        return vote
    }

    const getWeightName = (myweight) => {
        if (props.reallynarrow) {
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

    const { id, thumbnail, name, yearpublished, attributes, activethumbs, thumbcounts, ontoggleinspection, onnewvote, ondelete, reallynarrow } = props
    let upvoted_attributes = [ ...getUpvotedCategories(), ...getUpvotedMechanics() ].sort()
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
        <section
            className="gamecard-visual"
            data-votingtype="title"
            data-votingon={id}
            data-newvote="thumbsup"
            onClick={onnewvote}
            >
            <Thumbnail name={name} url={thumbnail} activethumbs={activethumbs} thumbcounts={thumbcounts} reallynarrow={reallynarrow} />
            <div className="overlay">
                {(attributes.min_players !== attributes.max_players)
                    ? <div className={getClasses('supported-playercount', null)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.min_players}-{attributes.max_players}</div>
                    : <div className={getClasses('supported-playercount', null)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.min_players}</div>
                }
                {(attributes.min_playtime !== attributes.max_playtime)
                    ? <div><FontAwesomeIcon icon={faClock}/> {attributes.min_playtime}-{attributes.max_playtime}'</div>
                    : <div><FontAwesomeIcon icon={faClock}/> {attributes.min_playtime}'</div>
                }
            </div>
        </section>
        <div className="gamecard-weight">
            <div className="halfsized">
                {(attributes.min_players !== attributes.max_players)
                    ? <div className={getClasses('supported-playercount', null)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.min_players}-{attributes.max_players}</div>
                    : <div className={getClasses('supported-playercount', null)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.min_players}</div>
                }
                {(attributes.min_playtime !== attributes.max_playtime)
                    ? <div className="estimated-playtime"><FontAwesomeIcon icon={faClock}/> {attributes.min_playtime}-{attributes.max_playtime}'</div>
                    : <div className="estimated-playtime"><FontAwesomeIcon icon={faClock}/> {attributes.min_playtime}'</div>
                }
            </div>
            <div className={getClasses('weight', attributes.average_weight_name)}>{getWeightName(attributes.average_weight_name)}</div>
        </div>
        <div className="gamecard-upvoted-attributes">
            { upvoted_attributes.map( (value) =>
                <div key={value} className="attribute thumbsup">{value}</div>
            )}
        </div>
        <ul className="gamecard-categories">
            {(attributes.categories.length)
                ? attributes.categories.map(value => <li key={value} className={getClasses('category', value)}>{value}</li>)
                : <li>(no categories)</li>
            }
        </ul>
        <ul className="gamecard-mechanics">
            {(attributes.mechanics.length)
                ? attributes.mechanics.map(value => <li key={value} className={getClasses('mechanic', value)}>{value}</li>)
                : <li>(no mechanics)</li>
            }
        </ul>
        </React.Fragment>
    )
}

GameCardFront.propTypes = {
    id: PropTypes.number.isRequired,
    attributes: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    onnewvote: PropTypes.func.isRequired,
    ondelete: PropTypes.func.isRequired,
    ontoggleinspection: PropTypes.func.isRequired,
    thumbcounts: PropTypes.object,
    thumbnail: PropTypes.string,
    activethumbs: PropTypes.object.isRequired,
    yearpublished: PropTypes.number,
    reallynarrow: PropTypes.bool.isRequired,
}