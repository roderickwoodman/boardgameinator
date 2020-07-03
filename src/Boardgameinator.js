import React from 'react'
import PropTypes from 'prop-types'
import purpleMeeple from './img/purple-meeple-64.png'
import { ViewControls } from './ViewControls'
import { GameList } from './GameList'
import { gamedataApi } from './Api.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'


export class Boardgameinator extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            allGames: [],
            allThumbs: {
                attributes: {
                    players: {}, 
                    weight: {}, 
                    category: {}, 
                    mechanic: {}
                },
                total_attribute_votes: 0,
                titles: {
                },
                total_title_votes: 0,
            },
            filterPlayercount: true,
            filterWeight: true,
            sortOrder: 'maxattrvotes',
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
        this.handleSortChange = this.handleSortChange.bind(this)
        this.handleFilterChange = this.handleFilterChange.bind(this)
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

        const stored_allThumbs = JSON.parse(localStorage.getItem("allThumbs"))
        if (stored_allThumbs !== null) {
            this.setState({ allThumbs: stored_allThumbs })
        }

        const stored_sortorder = JSON.parse(localStorage.getItem("sortOrder"))
        if (stored_sortorder !== null) {
            this.setState({ sortOrder: stored_sortorder })
        }

        const stored_filterplayercount = JSON.parse(localStorage.getItem("filterPlayercount"))
        if (stored_filterplayercount !== null) {
            this.setState({ filterPlayercount: stored_filterplayercount })
        }

        const stored_filterweight = JSON.parse(localStorage.getItem("filterWeight"))
        if (stored_filterweight !== null) {
            this.setState({ filterWeight: stored_filterweight })
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

            let allThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))

            // remove any title upvotes
            if (allThumbs.titles.hasOwnProperty(id)) {
                delete allThumbs.titles[id]
            }

            // remove any attribute upvotes for attributes no longer occurring in any other game
            for (let attrName in allThumbs.attributes) {
                if (attrName === 'players') {
                    for (let votedplayercount in allThumbs.attributes[attrName]) {
                        let attributeStillOccurs = false
                        for (let game of allGames) {
                            if (this.gameSupportsPlayercount(game, votedplayercount)) {
                                attributeStillOccurs = true
                                break
                            }
                        }
                        if (!attributeStillOccurs) {
                            delete allThumbs.attributes[attrName][votedplayercount]
                        }
                    }
                } else if (attrName === 'weight') {
                    for (let votedweight in allThumbs.attributes[attrName]) {
                        let attributeStillOccurs = false
                        for (let game of allGames) {
                            if (game.weight === votedweight) {
                                attributeStillOccurs = true
                                break
                            }
                        }
                        if (!attributeStillOccurs) {
                            delete allThumbs.attributes[attrName][votedweight]
                        }
                    }
                } else if (attrName === 'category') {
                    for (let votedcategory in allThumbs.attributes[attrName]) {
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
                            delete allThumbs.attributes[attrName][votedcategory]
                        }
                    }
                } else if (attrName === 'mechanic') {
                    for (let votedmechanic in allThumbs.attributes[attrName]) {
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
                            delete allThumbs.attributes[attrName][votedmechanic]
                        }
                    }
                }
            }

            localStorage.setItem('allGames', JSON.stringify(allGames))
            localStorage.setItem('allThumbs', JSON.stringify(allThumbs))

            // push these changes into 2 state variables
            return { 
                allGames: allGames,
                allThumbs:allThumbs 
            }
        })
    }

    onDeleteAllTitles(event) {
        this.setState(prevState => {
            let allGames = []
            let allThumbs = {
                'attributes': {
                    'players': {}, 
                    'weight': {}, 
                    'category': {}, 
                    'mechanic': {}
                },
                'titles': {}
            }
            localStorage.setItem('allGames', JSON.stringify(allGames))
            localStorage.setItem('allThumbs', JSON.stringify(allThumbs))
            return { 
                allGames: allGames, 
                allThumbs:allThumbs 
            }
        })
    }

    totalTitleVotes(all_title_thumbs) {
        let count = 0
        Object.entries(all_title_thumbs)
            .forEach( function(title) {
                if (title[1] === 'thumbsup') {
                    count += 1
                }
            })
        return  count
    }

    totalAttributeVotes(all_attribute_thumbs) {
        let count = 0
        Object.entries(all_attribute_thumbs)
            .forEach( function(category) {
                count += Object.values(category[1]).filter( vote => vote === 'thumbsup').length
            })
        return  count
    }

    onNewVote(event) {
        const { attrtype, attrname, newvote } = Object.assign({}, event.currentTarget.dataset)
        this.setState(prevState => {
            let updated_allThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))
            // record a new title vote
            if ( attrtype === 'title') {
                let oldvote = updated_allThumbs.titles[attrname]
                if (newvote !== oldvote) {
                    updated_allThumbs.titles[attrname] = newvote
                } else {
                    delete(updated_allThumbs.titles[attrname])
                }
            // record a new attribute vote
            } else {
                let oldvote = updated_allThumbs.attributes[attrtype][attrname]
                if (newvote !== oldvote) {
                    updated_allThumbs.attributes[attrtype][attrname] = newvote
                } else {
                    delete(updated_allThumbs.attributes[attrtype][attrname])
                }
            }
            updated_allThumbs.total_title_votes = this.totalTitleVotes(updated_allThumbs.titles)
            updated_allThumbs.total_attribute_votes = this.totalAttributeVotes(updated_allThumbs.attributes)
            localStorage.setItem('allThumbs', JSON.stringify(updated_allThumbs))
            return { allThumbs: updated_allThumbs }
        })
    }

    onClearSectionVotes(event) {
        const { attrtype } = Object.assign({}, event.target.dataset)
        const clearVotes = {}
        this.setState(prevState => {
            let updated_allThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))
            if (attrtype === 'all_titles') {
                updated_allThumbs.titles = clearVotes
                updated_allThumbs.total_title_votes = this.totalTitleVotes(updated_allThumbs.titles)
            } else {
                if (attrtype === 'all_attributes') {
                    updated_allThumbs.attributes['players'] = clearVotes
                    updated_allThumbs.attributes['weight'] = clearVotes
                    updated_allThumbs.attributes['category'] = clearVotes
                    updated_allThumbs.attributes['mechanic'] = clearVotes
                } else {
                    updated_allThumbs.attributes[attrtype] = clearVotes
                }
                updated_allThumbs.total_attribute_votes = this.totalAttributeVotes(updated_allThumbs.attributes)
            }
            localStorage.setItem('allThumbs', JSON.stringify(updated_allThumbs))
            return { allThumbs: updated_allThumbs }
        })
    }

    handleSortChange(event, value) {
        this.setState(prevState => {
            localStorage.setItem('sortOrder', JSON.stringify(value))
            return {
                sortOrder: value,
            }
        })
    }

    handleFilterChange(event, value) {
        switch (value) {
            case 'playercount':
                this.setState(prevState => {
                    let filterPlayercount = !prevState.filterPlayercount
                    localStorage.setItem('filterPlayercount', JSON.stringify(filterPlayercount))
                    return { 
                        filterPlayercount: !this.state.filterPlayercount,
                    }
                })
                break
            case 'weight':
                this.setState(prevState => {
                    let filterWeight = !prevState.filterWeight
                    localStorage.setItem('filterWeight', JSON.stringify(filterWeight))
                    return { 
                        filterWeight: !this.state.filterWeight,
                    }
                })
                break
            default:
                break
        }
    }

    onHamburger(event) {
        // FIXME: (WIP) add nav functionality
        alert('(FIXME/WIP) Add nav functionality here.')
    }

    render() {
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
                <ViewControls 
                sortby={this.state.sortOrder}
                onsortchange={this.handleSortChange}
                filterplayercount={this.state.filterPlayercount}
                filterweight={this.state.filterWeight}
                onfilterchange={this.handleFilterChange} />
            </div>
            <div id="content-wrapper">
                <GameList
                    allgames={this.state.allGames} 
                    onnewtitle={this.onNewTitle}
                    allthumbs={this.state.allThumbs} 
                    sortby={this.state.sortOrder}
                    filterplayercount={this.state.filterPlayercount}
                    filterweight={this.state.filterWeight}
                    ondelete={this.onDeleteTitle}
                    ondeleteall={this.onDeleteAllTitles}
                    onnewvote={this.onNewVote}
                    onclearsectionvotes={this.onClearSectionVotes}
                    reallynarrow={styles.reallyNarrow} />
            </div>
            </React.Fragment>
        )
    }
}

Boardgameinator.propTypes = {
    location: PropTypes.object.isRequired,
}