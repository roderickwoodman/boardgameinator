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
        let classes = 'clickable attribute'
        if (section === 'weight') {
            let weightVote = getWeightVote(attrName)
            classes += ` weight ${weightVote}`
        } else if (section === 'supported-playercount') {
            const supportedPlayersVote = getPlayersVote(props.attributes.minPlayers, props.attributes.maxPlayers)
            classes += ` supported-playercount ${supportedPlayersVote}`
        } else {
            classes += (props.activeThumbs.attributes[section].hasOwnProperty(attrName) 
                        && props.activeThumbs.attributes[section][attrName].hasOwnProperty('thumbsup')
                        && props.activeThumbs.attributes[section][attrName].thumbsup.length)
                ? ' thumbsup'
                : ' novote'
        }
        return classes
    }

    const getUpvotedCategories = () => {
        return Object.entries(props.activeThumbs.attributes['category'])
          .filter( entry => entry[1].hasOwnProperty('thumbsup') && entry[1].thumbsup.length )
          .map( entry => entry[0] )
          .filter( category => props.attributes.categories.includes(category) )
    }

    const getUpvotedMechanics = () => {
        return Object.entries(props.activeThumbs.attributes['mechanic'])
          .filter( entry => entry[1].hasOwnProperty('thumbsup') && entry[1].thumbsup.length )
          .map( entry => entry[0] )
          .filter( mechanic => props.attributes.mechanics.includes(mechanic) )
    }

    // player count section gets only one, aggregated vote; only one <li> (ex: "2-6 players") 
    const getPlayersVote = (myMinPlayers, myMaxPlayers) => {
        let vote = "novote"
        Object.entries(props.activeThumbs.attributes.players).forEach( (votedPlayercount) => {
            const voted = parseInt(votedPlayercount[0].slice(0, -1))
            if (voted >= myMinPlayers
                && voted <= myMaxPlayers
                && votedPlayercount[1].hasOwnProperty('thumbsup')
                && votedPlayercount[1].thumbsup.length) {
                vote = "thumbsup"
            }
        })
        return vote
    }

    // vote section gets only one, aggregated vote; only one <li> (ex: "medium heavy") 
    const getWeightVote = (myWeight) => {
        let vote = "novote"
        Object.entries(props.activeThumbs.attributes.weight).forEach( (votedWeight) => {
            if (myWeight === votedWeight[0]
              && votedWeight[1].hasOwnProperty('thumbsup') 
              && votedWeight[1].thumbsup.length) {
                vote = "thumbsup"
            }
        })
        return vote
    }

    const getWeightName = (myWeight) => {
        if (props.reallyNarrow) {
            switch (myWeight) {
                case 'medium light':
                    return 'm. light'
                case 'medium heavy':
                    return 'm. heavy'
                default:
                    return myWeight
            }
        } else {
            return myWeight
        }
    }

    const { id, thumbnail, activePoll, name, yearPublished, attributes, activeThumbs, myThumbCounts, onToggleInspection, onNewVote, onDelete, reallyNarrow } = props
    const upvotedCategories = getUpvotedCategories()
    const upvotedMechanics = getUpvotedMechanics()
    let upvotedAttributes = [ ...upvotedCategories, ...upvotedMechanics ].sort()
    return (
        <React.Fragment>
        <section className="gamecard-header">
            <button className="fa fa-button" onClick={ (e) => onDelete(e, id) }><FontAwesomeIcon icon={faTrash}/></button>
            <button className="fa fa-button inspect" onClick={ (e) => onToggleInspection(e, id) }><FontAwesomeIcon icon={faInfoCircle}/></button>
        </section>
        <section className="gamecard-title">
            <h5 className="game-name">{name}</h5>
            {(yearPublished !== null) 
                ? <h6 className="game-year-published">({yearPublished})</h6>
                : <h6 className="game-year-published">(#{id})</h6>
            }
        </section>
        <section
            className="gamecard-visual"
            data-votingtype="title"
            data-votingon={id}
            data-newvote="thumbsup"
            onClick={onNewVote}
            >
            <Thumbnail 
              id={id} 
              name={name} 
              url={thumbnail} 
              activePoll={activePoll} 
              activeThumbs={activeThumbs} 
              myThumbCounts={myThumbCounts} 
              reallyNarrow={reallyNarrow} />
            <div className="gamecardvisual-overlay">
                {(attributes.minPlayers !== attributes.maxPlayers)
                    ? <div className={getClasses('supported-playercount', null)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.minPlayers}-{attributes.maxPlayers}</div>
                    : <div className={getClasses('supported-playercount', null)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.minPlayers}</div>
                }
                {(attributes.minPlaytime !== attributes.maxPlaytime)
                    ? <div><FontAwesomeIcon icon={faClock}/> {attributes.minPlaytime}-{attributes.maxPlaytime}'</div>
                    : <div><FontAwesomeIcon icon={faClock}/> {attributes.minPlaytime}'</div>
                }
            </div>
        </section>
        <div className="gamecard-weight">
            <div className="halfsized">
                {(attributes.minPlayers !== attributes.maxPlayers)
                    ? <div className={getClasses('supported-playercount', null)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.minPlayers}-{attributes.maxPlayers}</div>
                    : <div className={getClasses('supported-playercount', null)}><FontAwesomeIcon icon={faUserFriends}/> {attributes.minPlayers}</div>
                }
                {(attributes.minPlaytime !== attributes.maxPlaytime)
                    ? <div className="estimated-playtime"><FontAwesomeIcon icon={faClock}/> {attributes.minPlaytime}-{attributes.maxPlaytime}'</div>
                    : <div className="estimated-playtime"><FontAwesomeIcon icon={faClock}/> {attributes.minPlaytime}'</div>
                }
            </div>
            <div 
              data-votingtype='weight'
              data-votingon={attributes.averageWeightName}
              data-newvote='thumbsup'
              onClick={props.onNewVote}
              className={getClasses('weight', attributes.averageWeightName)}>
                  {getWeightName(attributes.averageWeightName)}
              </div>
        </div>
        <div className="gamecard-upvoted-attributes">
            { upvotedAttributes.map( (value) =>
                <div 
                  key={value} 
                  data-votingtype={ upvotedCategories.includes(value) ? 'category' : 'mechanic' }
                  data-votingon={value}
                  data-newvote='thumbsup'
                  onClick={props.onNewVote}
                  className="clickable attribute thumbsup">
                      {value.toLowerCase()}
                  </div>
            )}
        </div>
        <ul className="gamecard-categories">
            <li className="attribute-section-title">Categories</li>
            {(attributes.categories.length)
                ? attributes.categories
                  .map(value => 
                    <li 
                      key={value} 
                      data-votingtype='category'
                      data-votingon={value}
                      data-newvote='thumbsup'
                      onClick={props.onNewVote}
                      className={getClasses('category', value)}>
                          {value.toLowerCase()}
                      </li>)
                : <li>(no categories)</li>
            }
        </ul>
        <ul className="gamecard-mechanics">
            <li className="attribute-section-title">Mechanics</li>
            {(attributes.mechanics.length)
                ? attributes.mechanics
                  .map(value => 
                    <li 
                      key={value} 
                      data-votingtype='mechanic'
                      data-votingon={value}
                      data-newvote='thumbsup'
                      onClick={props.onNewVote}
                      className={getClasses('mechanic', value)}>
                          {value.toLowerCase()}
                      </li>)
                : <li>(no mechanics)</li>
            }
        </ul>
        </React.Fragment>
    )
}

GameCardFront.propTypes = {
    id: PropTypes.number.isRequired,
    attributes: PropTypes.object.isRequired,
    activePoll: PropTypes.object.isRequired,
    activeThumbs: PropTypes.object.isRequired,
    myThumbCounts: PropTypes.object,
    name: PropTypes.string.isRequired,
    onNewVote: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onToggleInspection: PropTypes.func.isRequired,
    thumbnail: PropTypes.string,
    yearPublished: PropTypes.number,
    reallyNarrow: PropTypes.bool.isRequired,
}