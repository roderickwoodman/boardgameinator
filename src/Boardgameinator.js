import React from 'react'
import PropTypes from 'prop-types'
import purpleMeeple from './img/purple-meeple-64.png'
import { GameList } from './GameList'
import { gamedataApi } from './Api.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'


export class Boardgameinator extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            allGames: [],
            thumbs: {
                'attributes': {
                    'players': {}, 
                    'weight': {}, 
                    'category': {}, 
                    'mechanic': {}
                },
                'titles': {
                }
            },
            windowWidth: 0,
            windowHeight: 0
        }
        this.totalTitleVotes = this.totalTitleVotes.bind(this)
        this.totalAttributeVotes = this.totalAttributeVotes.bind(this)
        this.gameHasBeenAdded = this.gameHasBeenAdded.bind(this)
        this.gameSupportsPlayercount = this.gameSupportsPlayercount.bind(this)
        this.addGameById = this.addGameById.bind(this)
        this.onNewTitle = this.onNewTitle.bind(this)
        this.onNewVote = this.onNewVote.bind(this)
        this.onDeleteTitle = this.onDeleteTitle.bind(this)
        this.onDeleteAllTitles = this.onDeleteAllTitles.bind(this)
        this.onClearSectionVotes = this.onClearSectionVotes.bind(this)
        this.updateDimensions = this.updateDimensions.bind(this)
        this.onHamburger = this.onHamburger.bind(this)
    }

    gamedataVersion = 1

    componentDidMount() {

        let allGames = []

        let query_strings, new_list = [], addto_list = []
        let path = this.props.location.search.slice(1).split('?')
        if (path.length === 1) {
            query_strings = path[0]
        } else {
            query_strings = path[1]
        }
        query_strings.split('&').forEach( function(query_string) {
            let qs = query_string.split('=')
            if (qs[0] === 'newlist') {
                qs[1].split('+').forEach( game_id => new_list.push(parseInt(game_id)) )
            } else if (qs[0] === 'addtolist') {
                qs[1].split('+').forEach( game_id => addto_list.push(parseInt(game_id)) )
            }
        })

        let self = this
        if (new_list.length === 0) {
            const stored_gamedataVersion = JSON.parse(localStorage.getItem("gamedataVersion"))
            if (stored_gamedataVersion === this.gamedataVersion) {
                allGames = JSON.parse(localStorage.getItem("allGames"))
            } else {
                localStorage.setItem('gamedataVersion', JSON.stringify(this.gamedataVersion))
                localStorage.setItem('allGames', JSON.stringify(allGames))
            }
            addto_list.forEach( function(game_id) {
                if (!self.gameHasBeenAdded(game_id, allGames)) {
                    self.addGameById(game_id)
                }
            })
            this.setState({ allGames })
        } else {
            new_list.forEach( function(game_id) {
                if (!self.gameHasBeenAdded(game_id, allGames)) {
                    self.addGameById(game_id)
                }
            })
            localStorage.setItem('gamedataVersion', JSON.stringify(this.gamedataVersion))
        }

        const stored_thumbs = JSON.parse(localStorage.getItem("thumbs"))
        if (stored_thumbs !== null) {
            this.setState({ thumbs: stored_thumbs })
        }

        this.updateDimensions()
        window.addEventListener('resize', this.updateDimensions)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions)
    }

    updateDimensions() {
        let windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0
        let windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0
        this.setState({ windowWidth, windowHeight })
    }

    gameHasBeenAdded(gameId, gameSet) {
        for (let game of gameSet) {
            if (game.id === parseInt(gameId)) {
                return true
            }
        }
        return false
    }

    async addGameById(game_id) {
        gamedataApi(game_id)
            .then(json => {
                if (json.hasOwnProperty('id')) {
                    json["name_is_unique"] = true
                    this.onNewTitle(json)
                }})
    }

    onNewTitle(newGame) {

        if (newGame.hasOwnProperty("name_is_unique") && newGame["name_is_unique"] !== true) {
            let disambiguation = (newGame.year_published !== null)
                ? " ("+ newGame.year_published + ")"
                : " (#" + newGame.id + ")"
            newGame["disambiguation"] = disambiguation
        }

        let now = new Date()
        newGame["updated_at"] = now.getTime()

        this.setState(prevState => {
            let allGames = prevState.allGames.slice()
            allGames.push(newGame)
            localStorage.setItem('allGames', JSON.stringify(allGames))
            return { allGames }
        })

    }

    gameSupportsPlayercount(game, playercount) {
        let number = playercount.slice(0, -1)
        if (number <= game.attributes.max_players && number >= game.min_players) {
            return true
        } else {
            return false
        }
    }

    onDeleteTitle(event, id) {
        this.setState(prevState => {

            // remove the game from the game list
            let allGames = prevState.allGames.slice()
            allGames = allGames.filter(game => game.id !== parseInt(id))

            let thumbs = JSON.parse(JSON.stringify(prevState.thumbs))

            // remove any title upvotes
            if (thumbs.titles.hasOwnProperty(id)) {
                delete thumbs.titles[id]
            }

            // remove any attribute upvotes for attributes no longer occurring in any other game
            for (let attrName in thumbs.attributes) {
                if (attrName === 'players') {
                    for (let votedplayercount in thumbs.attributes[attrName]) {
                        let attributeStillOccurs = false
                        for (let game of allGames) {
                            if (this.gameSupportsPlayercount(game, votedplayercount)) {
                                attributeStillOccurs = true
                                break
                            }
                        }
                        if (!attributeStillOccurs) {
                            delete thumbs.attributes[attrName][votedplayercount]
                        }
                    }
                } else if (attrName === 'weight') {
                    for (let votedweight in thumbs.attributes[attrName]) {
                        let attributeStillOccurs = false
                        for (let game of allGames) {
                            if (game.weight === votedweight) {
                                attributeStillOccurs = true
                                break
                            }
                        }
                        if (!attributeStillOccurs) {
                            delete thumbs.attributes[attrName][votedweight]
                        }
                    }
                } else if (attrName === 'category') {
                    for (let votedcategory in thumbs.attributes[attrName]) {
                        let attributeStillOccurs = false
                        for (let game of allGames) {
                            for (let category of game.attributes.categories) {
                                if (category === votedcategory) {
                                    attributeStillOccurs = true
                                    break
                                }
                            }
                        }
                        if (!attributeStillOccurs) {
                            delete thumbs.attributes[attrName][votedcategory]
                        }
                    }
                } else if (attrName === 'mechanic') {
                    for (let votedmechanic in thumbs.attributes[attrName]) {
                        let attributeStillOccurs = false
                        for (let game of allGames) {
                            for (let mechanic of game.attributes.mechanics) {
                                if (mechanic === votedmechanic) {
                                    attributeStillOccurs = true
                                    break
                                }
                            }
                        }
                        if (!attributeStillOccurs) {
                            delete thumbs.attributes[attrName][votedmechanic]
                        }
                    }
                }
            }

            localStorage.setItem('allGames', JSON.stringify(allGames))
            localStorage.setItem('thumbs', JSON.stringify(thumbs))

            // push these changes into 2 state variables
            return { 
                allGames: allGames,
                thumbs:thumbs 
            }
        })
    }

    onDeleteAllTitles(event) {
        this.setState(prevState => {
            let allGames = []
            let thumbs = {
                'attributes': {
                    'players': {}, 
                    'weight': {}, 
                    'category': {}, 
                    'mechanic': {}
                },
                'titles': {}
            }
            localStorage.setItem('allGames', JSON.stringify(allGames))
            localStorage.setItem('thumbs', JSON.stringify(thumbs))
            return { 
                allGames: allGames, 
                thumbs:thumbs 
            }
        })
    }

    totalTitleVotes() {
        let count = 0
        Object.entries(this.state.titleThumbs)
            .forEach( function(title) {
                count += Object.values(title[1]).filter( vote => vote === 'thumbsup').length
            })
        return  count
    }

    totalAttributeVotes() {
        let count = 0
        Object.entries(this.state.thumbs.attributes)
            .forEach( function(category) {
                count += Object.values(category[1]).filter( vote => vote === 'thumbsup').length
            })
        return  count
    }

    onNewVote(event) {
        const { attrtype, attrname, newvote } = Object.assign({}, event.target.dataset)
        this.setState(prevState => {
            let updated_thumbs = JSON.parse(JSON.stringify(prevState.thumbs))
            // record a new title vote
            if ( attrtype === 'title') {
                let oldvote = updated_thumbs.titles[attrname]
                if (newvote !== oldvote) {
                    updated_thumbs.titles[attrname] = newvote
                } else {
                    delete(updated_thumbs.titles[attrname])
                }
            // record a new attribute vote
            } else {
                let oldvote = updated_thumbs.attributes[attrtype][attrname]
                if (newvote !== oldvote) {
                    updated_thumbs.attributes[attrtype][attrname] = newvote
                } else {
                    delete(updated_thumbs.attributes[attrtype][attrname])
                }
            }
            localStorage.setItem('thumbs', JSON.stringify(updated_thumbs))
            return { thumbs: updated_thumbs }
        })
    }

    onClearSectionVotes(event) {
        const { attrtype } = Object.assign({}, event.target.dataset)
        const clearVotes = {}
        this.setState(prevState => {
            if (attrtype === 'all_titles') {
                let updated_titleThumbs = clearVotes
                localStorage.setItem('titleThumbs', JSON.stringify(updated_titleThumbs))
                return { titleThumbs: updated_titleThumbs }
            } else {
                let updated_thumbs = JSON.parse(JSON.stringify(prevState.thumbs))
                if (attrtype === 'all_attributes') {
                    updated_thumbs.attributes['players'] = clearVotes
                    updated_thumbs.attributes['weight'] = clearVotes
                    updated_thumbs.attributes['category'] = clearVotes
                    updated_thumbs.attributes['mechanic'] = clearVotes
                } else {
                    updated_thumbs.attributes[attrtype] = clearVotes
                }
                localStorage.setItem('thumbs', JSON.stringify(updated_thumbs))
                return { thumbs: updated_thumbs }
            }
        })
    }

    onHamburger(event) {
        // FIXME: (WIP) add nav functionality
        alert('(FIXME/WIP) Add nav functionality here.')
    }

    render() {
        let totalattributevotes = this.totalAttributeVotes()

        const { windowWidth } = this.state
        const styles = {
            reallyNarrow: windowWidth < 650
        }

        return (
            <React.Fragment>
            <div id="page-header">
                <button className="fa fa-button" onClick={ (e) => this.onHamburger(e) }><FontAwesomeIcon icon={faBars}/></button>
                <img src={purpleMeeple} alt="Boardgameinator logo" />
                <h1>Boardgameinator</h1>
            </div>
            <div id="content-wrapper">
                <GameList
                    allgames={this.state.allGames} 
                    onnewtitle={this.onNewTitle}
                    thumbs={this.state.thumbs} 
                    ondelete={this.onDeleteTitle}
                    ondeleteall={this.onDeleteAllTitles}
                    onnewvote={this.onNewVote}
                    onclearsectionvotes={this.onClearSectionVotes}
                    totalattributevotes={totalattributevotes}
                    reallynarrow={styles.reallyNarrow} />
            </div>
            </React.Fragment>
        )
    }
}

Boardgameinator.propTypes = {
    location: PropTypes.object.isRequired,
}