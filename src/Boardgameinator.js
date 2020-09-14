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
            activeGameList: [],
            allGameData: [],
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
            filterTitles: false,
            filterPlayercount: true,
            filterWeight: true,
            sortOrder: 'maxtitlevotes',
            windowWidth: 0,
            windowHeight: 0
        }
        this.totalTitleVotes = this.totalTitleVotes.bind(this)
        this.totalAttributeVotes = this.totalAttributeVotes.bind(this)
        this.getCachedGameTitles = this.getCachedGameTitles.bind(this)
        this.gameHasBeenAdded = this.gameHasBeenAdded.bind(this)
        this.gameSupportsPlayercount = this.gameSupportsPlayercount.bind(this)
        this.addGameById = this.addGameById.bind(this)
        this.onAddCachedTitle = this.onAddCachedTitle.bind(this)
        this.onAddNewTitle = this.onAddNewTitle.bind(this)
        this.onCacheNewTitle = this.onCacheNewTitle.bind(this)
        this.onNewVote = this.onNewVote.bind(this)
        this.onDeleteTitle = this.onDeleteTitle.bind(this)
        this.onDeleteAllTitles = this.onDeleteAllTitles.bind(this)
        this.onClearSectionVotes = this.onClearSectionVotes.bind(this)
        this.onViewPoll = this.onViewPoll.bind(this)
        this.handleSortChange = this.handleSortChange.bind(this)
        this.handleFilterChange = this.handleFilterChange.bind(this)
        this.extractYearFromTitle = this.extractYearFromTitle.bind(this)
        this.updateDimensions = this.updateDimensions.bind(this)
        this.onHamburger = this.onHamburger.bind(this)
    }

    gamedataVersion = 1

    componentDidMount() {

        let allGameData = []

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

        const stored_activeGameList = JSON.parse(localStorage.getItem("activeGameList"))
        if (stored_activeGameList !== null) {
            this.setState({ activeGameList: stored_activeGameList })
        }

        let self = this
        if (new_list.length === 0) {
            const stored_gamedataVersion = JSON.parse(localStorage.getItem("gamedataVersion"))
            if (stored_gamedataVersion === this.gamedataVersion) {
                allGameData = JSON.parse(localStorage.getItem("allGameData"))
            } else {
                localStorage.setItem('gamedataVersion', JSON.stringify(this.gamedataVersion))
                localStorage.setItem('allGameData', JSON.stringify(allGameData))
            }
            addto_list.forEach( function(game_id) {
                if (!self.gameHasBeenAdded(game_id, allGameData)) {
                    self.addGameById(game_id)
                }
            })
            this.setState({ allGameData })
        } else {
            new_list.forEach( function(game_id) {
                if (!self.gameHasBeenAdded(game_id, allGameData)) {
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

        const stored_filtertitles = JSON.parse(localStorage.getItem("filterTitles"))
        if (stored_filtertitles !== null) {
            this.setState({ filterTitles: stored_filtertitles })
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

    // for disambiguation of titles, the game ID will be put in parentheses when the API does not provide yearpublished info
    extractYearFromTitle(title) {
        if (typeof title === 'string' && title.length) {
            let matchesDate = title.match(/(( +)\((-?)\d{1,4}\))$/)
            if (matchesDate !== null) {
                return matchesDate[0].replace(/[^0-9-]/g, "")
            } else {
                let matchesId = title.match(/(( +)\(#\d{1,6}\))$/)
                if (matchesId !== null) {
                    return matchesId[0].replace(/[^#0-9-]/g, "")
                } else {
                    return null
                }
            }
        }
    }

    getCachedGameTitles() {
        let titles = {}, self = this
        this.state.allGameData.forEach(function(gamedata) {
            if (gamedata.hasOwnProperty('unambiguous_name')) {
                let new_cache_info = {
                    id: gamedata.id,
                    name: gamedata.name,
                    year_published: gamedata.year_published,
                    active: (self.state.activeGameList.includes(gamedata.id)) ? true : false,
                }
                titles[gamedata.unambiguous_name] = new_cache_info
            }
        })
        return titles
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
                    this.onAddNewTitle(json)
                }})
    }

    onAddCachedTitle(title) {

        this.setState(prevState => {

            let activeGameList = prevState.activeGameList.slice()
            activeGameList.push(prevState.allGameData.filter( game_data => game_data.unambiguous_name === title )[0].id)
            localStorage.setItem('activeGameList', JSON.stringify(activeGameList))

            return { activeGameList }
        })
    }

    onAddNewTitle(newGameData) {

        let now = new Date()
        newGameData["updated_at"] = now.getTime()

        this.setState(prevState => {

            let activeGameList = prevState.activeGameList.slice()
            activeGameList.push(newGameData.id)
            localStorage.setItem('activeGameList', JSON.stringify(activeGameList))

            let allGameData = JSON.parse(JSON.stringify(prevState.allGameData))
            allGameData.push(newGameData)
            localStorage.setItem('allGameData', JSON.stringify(allGameData))

            return { activeGameList, allGameData }
        })

    }

    onCacheNewTitle(newGameData) {

        let now = new Date()
        newGameData["updated_at"] = now.getTime()

        this.setState(prevState => {

            let allGameData = JSON.parse(JSON.stringify(prevState.allGameData))
            allGameData.push(newGameData)
            localStorage.setItem('allGameData', JSON.stringify(allGameData))

            return { allGameData }
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

            // remove the game from the active game list (but still keep its game data cached)
            let activeGameList = prevState.activeGameList.slice()
            activeGameList = activeGameList.filter(game_id => game_id !== parseInt(id))

            // remove the game from the game list
            let allGameData = JSON.parse(JSON.stringify(prevState.allGameData))
            allGameData = allGameData.filter(game => game.id !== parseInt(id))

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
                        for (let game of allGameData) {
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
                        for (let game of allGameData) {
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
                        for (let game of allGameData) {
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
                        for (let game of allGameData) {
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

            // NOTE: Update the active game list, but leave allGameData unchanged. It will serve as 
            // the cache of API data. Most downstream components only need to operate on game data 
            // for titles that are on the active list.

            localStorage.setItem('activeGameList', JSON.stringify(activeGameList))
            localStorage.setItem('allThumbs', JSON.stringify(allThumbs))

            return { 
                activeGameList: activeGameList,
                allThumbs:allThumbs 
            }
        })
    }

    onDeleteAllTitles(event) {
        this.setState(prevState => {
            let activeGameList = []
            let allThumbs = {
                'attributes': {
                    'players': {}, 
                    'weight': {}, 
                    'category': {}, 
                    'mechanic': {}
                },
                'titles': {},
                total_title_votes: 0,
                total_attribute_votes: 0,
            }
            localStorage.setItem('activeGameList', JSON.stringify(activeGameList))
            localStorage.setItem('allThumbs', JSON.stringify(allThumbs))
            return { 
                activeGameList: activeGameList,
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

    onViewPoll(poll) {

        console.log('poll:',poll)
        this.setState(prevState => {

            let new_activeGameList = Object.keys(poll.pollThumbs.titles).map( title => parseInt(title) )
            localStorage.setItem('activeGameList', JSON.stringify(new_activeGameList))

            return { activeGameList: new_activeGameList }
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
            case 'titles':
                this.setState(prevState => {
                    let filterTitles = !prevState.filterTitles
                    localStorage.setItem('filterTitles', JSON.stringify(filterTitles))
                    return { 
                        filterTitles: !this.state.filterTitles,
                    }
                })
                break
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
        const activeGameData = this.state.allGameData.filter( gameData => this.state.activeGameList.includes(gameData.id) )
        const cachedGameTitles = this.getCachedGameTitles()
        return (
            <React.Fragment>
            <div id="page-header">
                <button className="fa fa-button" onClick={ (e) => this.onHamburger(e) }><FontAwesomeIcon icon={faBars}/>
                    <img src={purpleMeeple} alt="Boardgameinator logo" />
                    <h1>Boardgameinator</h1>
                </button>
                <ViewControls 
                sortby={this.state.sortOrder}
                onsortchange={this.handleSortChange}
                filtertitles={this.state.filterTitles}
                filterplayercount={this.state.filterPlayercount}
                filterweight={this.state.filterWeight}
                onfilterchange={this.handleFilterChange} />
            </div>
            <div id="content-wrapper">
                <GameList
                    activegamedata={activeGameData} 
                    cachedgametitles={cachedGameTitles}
                    onaddcachedtitle={this.onAddCachedTitle}
                    onaddnewtitle={this.onAddNewTitle}
                    oncachenewtitle={this.onCacheNewTitle}
                    allthumbs={this.state.allThumbs} 
                    sortby={this.state.sortOrder}
                    filtertitles={this.state.filterTitles}
                    filterplayercount={this.state.filterPlayercount}
                    filterweight={this.state.filterWeight}
                    ondelete={this.onDeleteTitle}
                    ondeleteall={this.onDeleteAllTitles}
                    onnewvote={this.onNewVote}
                    onclearsectionvotes={this.onClearSectionVotes}
                    onviewpoll={this.onViewPoll}
                    reallynarrow={styles.reallyNarrow} />
            </div>
            </React.Fragment>
        )
    }
}

Boardgameinator.propTypes = {
    location: PropTypes.object.isRequired,
}