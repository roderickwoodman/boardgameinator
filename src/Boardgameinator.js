import React from 'react'
import PropTypes from 'prop-types'
import purpleMeeple from './img/purple-meeple-64.png'
import { ViewControls } from './ViewControls'
import { GameList } from './GameList'
import { gamedataApi, voteinpollApi, clearmyvotesApi, deletetitleinpollApi } from './Api.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'


export class Boardgameinator extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            activeGameList: [],
            activePoll: 'local',
            allGameData: [],
            activeThumbs: {
                attributes: {
                    players: {}, 
                    weight: {}, 
                    category: {}, 
                    mechanic: {}
                },
                total_attribute_votes: 0,
                titles: {},
                total_title_votes: 0,
            },
            allThumbs:  {
                local: {
                    attributes: {
                        players: {}, 
                        weight: {}, 
                        category: {}, 
                        mechanic: {}
                    },
                    total_attribute_votes: 0,
                    titles: {},
                    total_title_votes: 0,
                }
            },
            filterTitles: false,
            filterPlayercount: true,
            filterWeight: true,
            localGameList: [],
            sortOrder: 'maxtitlevotes',
            user: '_me_', // FIXME: implement user auths
            windowWidth: 0,
            windowHeight: 0
        }
        this.totalTitleVotes = this.totalTitleVotes.bind(this)
        this.totalAttributeVotes = this.totalAttributeVotes.bind(this)
        this.getCachedGameTitles = this.getCachedGameTitles.bind(this)
        this.gameHasBeenAdded = this.gameHasBeenAdded.bind(this)
        this.gameSupportsPlayercount = this.gameSupportsPlayercount.bind(this)
        this.voteTitleInPoll = this.voteTitleInPoll.bind(this)
        this.clearMyTitleVotesInPoll = this.clearMyTitleVotesInPoll.bind(this)
        this.deleteTitleInPoll = this.deleteTitleInPoll.bind(this)
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

        const stored_localGameList = JSON.parse(localStorage.getItem("localGameList"))
        if (stored_localGameList !== null) {
            this.setState({ localGameList: stored_localGameList })
        }

        const stored_activeGameList = JSON.parse(localStorage.getItem("activeGameList"))
        if (stored_activeGameList !== null) {
            this.setState({ activeGameList: stored_activeGameList })
        }

        const stored_activePoll = JSON.parse(localStorage.getItem("activePoll"))
        if (stored_activePoll !== null) {
            this.setState({ activePoll: stored_activePoll })
        } else {
            this.setState({ activePoll: 'local' })
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

        const stored_activeThumbs = JSON.parse(localStorage.getItem("activeThumbs"))
        if (stored_activeThumbs !== null) {
            this.setState({ activeThumbs: stored_activeThumbs })
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

            // FIXME: Implement poll editing. May not want to update active list here if we are currently looking at a poll.
            let activeGameList = prevState.activeGameList.slice()
            activeGameList.push(prevState.allGameData.filter( game_data => game_data.unambiguous_name === title )[0].id)
            localStorage.setItem('activeGameList', JSON.stringify(activeGameList))

            let localGameList = prevState.localGameList.slice()
            localGameList.push(prevState.allGameData.filter( game_data => game_data.unambiguous_name === title )[0].id)
            localStorage.setItem('localGameList', JSON.stringify(localGameList))

            return { activeGameList, localGameList }
        })
    }

    onAddNewTitle(newGameData) {

        let now = new Date()
        newGameData["updated_at"] = now.getTime()

        this.setState(prevState => {

            // FIXME: Implement poll editing. May not want to update active list here if we are currently looking at a poll.
            let activeGameList = prevState.activeGameList.slice()
            activeGameList.push(newGameData.id)
            localStorage.setItem('activeGameList', JSON.stringify(activeGameList))

            let localGameList = prevState.localGameList.slice()
            localGameList.push(newGameData.id)
            localStorage.setItem('localGameList', JSON.stringify(localGameList))

            let allGameData = JSON.parse(JSON.stringify(prevState.allGameData))
            allGameData.push(newGameData)
            localStorage.setItem('allGameData', JSON.stringify(allGameData))

            return { activeGameList, localGameList, allGameData }
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

        // title removals for polls are managed by the server
        if (this.state.activePoll !== 'local') {

            this.deleteTitleInPoll(this.state.activePoll, id, this.state.user)

        // title removals for non-polls are kept on the client (state & local storage)
        } else {

            this.setState(prevState => {

                // FIXME: Implement poll editing. May not want to update active list here if we are currently looking at a poll.
                // remove the game from the active game list (but still keep its game data cached)
                let activeGameList = prevState.activeGameList.slice()
                activeGameList = activeGameList.filter(game_id => game_id !== parseInt(id))

                // remove the game from the local game list (but still keep its game data cached)
                let localGameList = prevState.localGameList.slice()
                localGameList = localGameList.filter(game_id => game_id !== parseInt(id))

                // remove the game from the game list
                let allGameData = JSON.parse(JSON.stringify(prevState.allGameData))
                allGameData = allGameData.filter(game => game.id !== parseInt(id))

                let activeThumbs = JSON.parse(JSON.stringify(prevState.activeThumbs))

                // remove any title upvotes
                if (activeThumbs.titles.hasOwnProperty(id)) {
                    delete activeThumbs.titles[id]
                }

                // remove any attribute upvotes for attributes no longer occurring in any other game
                for (let attrName in activeThumbs.attributes) {
                    if (attrName === 'players') {
                        for (let votedplayercount in activeThumbs.attributes[attrName]) {
                            let attributeStillOccurs = false
                            for (let game of allGameData) {
                                if (this.gameSupportsPlayercount(game, votedplayercount)) {
                                    attributeStillOccurs = true
                                    break
                                }
                            }
                            if (!attributeStillOccurs) {
                                delete activeThumbs.attributes[attrName][votedplayercount]
                            }
                        }
                    } else if (attrName === 'weight') {
                        for (let votedweight in activeThumbs.attributes[attrName]) {
                            let attributeStillOccurs = false
                            for (let game of allGameData) {
                                if (game.weight === votedweight) {
                                    attributeStillOccurs = true
                                    break
                                }
                            }
                            if (!attributeStillOccurs) {
                                delete activeThumbs.attributes[attrName][votedweight]
                            }
                        }
                    } else if (attrName === 'category') {
                        for (let votedcategory in activeThumbs.attributes[attrName]) {
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
                                delete activeThumbs.attributes[attrName][votedcategory]
                            }
                        }
                    } else if (attrName === 'mechanic') {
                        for (let votedmechanic in activeThumbs.attributes[attrName]) {
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
                                delete activeThumbs.attributes[attrName][votedmechanic]
                            }
                        }
                    }
                }

                // NOTE: Update the active game list, but leave allGameData unchanged. It will serve as 
                // the cache of API data. Most downstream components only need to operate on game data 
                // for titles that are on the active list.

                localStorage.setItem('activeGameList', JSON.stringify(activeGameList))
                localStorage.setItem('localGameList', JSON.stringify(localGameList))
                localStorage.setItem('activeThumbs', JSON.stringify(activeThumbs))

                // update the master list of all preferences
                let new_allThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))
                let new_pollThumbs = JSON.parse(JSON.stringify(activeThumbs))
                new_allThumbs[prevState.activePoll] = new_pollThumbs
                localStorage.setItem('allThumbs', JSON.stringify(new_allThumbs))

                return { 
                    activeGameList: activeGameList,
                    localGameList: localGameList,
                    allThumbs: new_allThumbs,
                    activeThumbs: activeThumbs,
                }
            })
        }
    }

    async clearMyTitleVotesInPoll(poll_id, user) {
        clearmyvotesApi(poll_id, user)
            // .then(json => {
            //     if (json.hasOwnProperty('id') === poll_id) {
            //         this.onViewPoll(json)
            //     }})
    }

    onDeleteAllTitles(event) {
        this.setState(prevState => {
            // FIXME: Implement poll editing. May not want to update active list here if we are currently looking at a poll.
            let activeGameList = []
            let localGameList = []
            let activeThumbs = {
                'attributes': {
                    'players': {}, 
                    'weight': {}, 
                    'category': {}, 
                    'mechanic': {}
                },
                'titles': {
                },
                total_title_votes: 0,
                total_attribute_votes: 0,
            }
            localStorage.setItem('activeGameList', JSON.stringify(activeGameList))
            localStorage.setItem('localGameList', JSON.stringify(localGameList))
            localStorage.setItem('activeThumbs', JSON.stringify(activeThumbs))

            // update the master list of all preferences
            let new_allThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))
            let new_pollThumbs = JSON.parse(JSON.stringify(activeThumbs))
            new_allThumbs[prevState.activePoll] = new_pollThumbs
            localStorage.setItem('allThumbs', JSON.stringify(new_allThumbs))

            return { 
                activeGameList: activeGameList,
                localGameList: localGameList,
                allThumbs: new_allThumbs,
                activeThumbs: activeThumbs,
            }
        })
    }

    totalTitleVotes(all_title_thumbs) {
        let count = 0
        Object.entries(all_title_thumbs)
            .forEach( function(title) {
                if (Object.keys(title[1]).includes('thumbsup')) {
                    count += title[1]['thumbsup'].length
                }
            })
        return  count
    }

    totalAttributeVotes(all_attribute_thumbs) {
        let count = 0
        Object.entries(all_attribute_thumbs)
            .forEach( function(category) {
                count += Object.values(category[1]).filter( vote => vote.hasOwnProperty('thumbsup') && vote.thumbsup.length ).length
            })
        return  count
    }

    async voteTitleInPoll(poll_id, title, newvote, user) {
        voteinpollApi(poll_id, title, newvote, user)
            // .then(json => {
            //     if (json.hasOwnProperty('id') === poll_id) {
            //         this.onViewPoll(json)
            //     }})
    }

    async deleteTitleInPoll(poll_id, title_id, user) {
        deletetitleinpollApi(poll_id, title_id, user)
            // .then(json => {
            //     if (json.hasOwnProperty('id') === poll_id) {
            //         this.onViewPoll(json)
            //     }})
    }

    onNewVote(event) {
        const { votingtype, votingon, newvote } = Object.assign({}, event.currentTarget.dataset)

        // title votes for polls are managed by the server
        if (votingtype === 'title' && this.state.activePoll !== 'local') {

            this.voteTitleInPoll(this.state.activePoll, votingon, newvote, this.state.user)

        // attribute votes and all non-poll votes are kept on the client (state & local storage)
        } else {

            this.setState(prevState => {
                let updated_activeThumbs = JSON.parse(JSON.stringify(prevState.activeThumbs))
                // record a new title vote
                if (votingtype === 'title') {
                    if (updated_activeThumbs.titles.hasOwnProperty(votingon.toString())) {
                        let updated_thistitle = JSON.parse(JSON.stringify(updated_activeThumbs.titles[votingon.toString()]))
                        if (updated_thistitle.hasOwnProperty(newvote)
                            && updated_thistitle[newvote].includes(prevState.user)) {
                            updated_thistitle[newvote] = updated_thistitle[newvote].filter( user => user !== prevState.user )
                        } else {
                            let updated_vote = [prevState.user]
                            updated_thistitle[newvote] = updated_vote
                        }
                        updated_activeThumbs.titles[votingon.toString()] = updated_thistitle
                    } else {
                        let updated_vote = {}
                        updated_vote[newvote] = [prevState.user]
                        updated_activeThumbs.titles[votingon] = updated_vote
                    }
                // record a new attribute vote
                } else {
                    if (updated_activeThumbs.attributes[votingtype].hasOwnProperty(votingon)) {
                        let updated_thisattribute = JSON.parse(JSON.stringify(updated_activeThumbs.attributes[votingtype][votingon]))
                        if (updated_thisattribute.hasOwnProperty(newvote)
                            && updated_thisattribute[newvote].includes(prevState.user)) {
                            updated_thisattribute[newvote] = updated_thisattribute[newvote].filter( user => user !== prevState.user )
                        } else {
                            let updated_vote = [prevState.user]
                            updated_thisattribute[newvote] = updated_vote
                        }
                        updated_activeThumbs.attributes[votingtype][votingon] = updated_thisattribute
                    } else {
                        let updated_vote = {}
                        updated_vote[newvote] = [prevState.user]
                        updated_activeThumbs.attributes[votingtype][votingon] = updated_vote
                    }
                }
                updated_activeThumbs.total_title_votes = this.totalTitleVotes(updated_activeThumbs.titles)
                updated_activeThumbs.total_attribute_votes = this.totalAttributeVotes(updated_activeThumbs.attributes)
                localStorage.setItem('activeThumbs', JSON.stringify(updated_activeThumbs))

                // update the master list of all preferences
                let new_allThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))
                let new_pollThumbs = JSON.parse(JSON.stringify(updated_activeThumbs))
                new_allThumbs['local'] = new_pollThumbs
                localStorage.setItem('allThumbs', JSON.stringify(new_allThumbs))

                return { 
                    activeThumbs: updated_activeThumbs,
                    allThumbs: new_allThumbs,
                }
            })

        }
    }

    onViewPoll(poll) {

        this.setState(prevState => {

            let new_pollName = poll.name
            localStorage.setItem('activePoll', JSON.stringify(new_pollName))

            let new_activeGameList = [], new_activeThumbs = {}
            if (poll.name === 'local') {
                // disable poll: 
                //   1) replace the active game list with the pre-existing list of local titles
                //   2) replace all active votes with the saved local title and attribute votes
                new_activeGameList = [...prevState.localGameList]
                new_activeThumbs = JSON.parse(JSON.stringify(prevState.allThumbs.local))
            } else {
                // enable poll: 
                //   1) replace the active game list with all of the titles from this poll
                //   2) replace the active title votes with all of the title votes from this poll
                //   3) refresh the active attribute votes with the saved local attribute votes
                new_activeGameList = Object.keys(poll.pollThumbs.titles).map( title => parseInt(title) )
                new_activeThumbs = JSON.parse(JSON.stringify(poll.pollThumbs))
                new_activeThumbs.total_title_votes = poll.pollThumbs.total_title_votes
                new_activeThumbs.attributes = JSON.parse(JSON.stringify(prevState.allThumbs.local.attributes))
                new_activeThumbs.total_attribute_votes = prevState.allThumbs.local.total_attribute_votes
            }
            localStorage.setItem('activeGameList', JSON.stringify(new_activeGameList))
            localStorage.setItem('activeThumbs', JSON.stringify(new_activeThumbs))

            return { 
                activePoll: new_pollName,
                activeGameList: new_activeGameList,
                activeThumbs: new_activeThumbs,
            }
        })
    }

    onClearSectionVotes(event) {
        const { votingtype } = Object.assign({}, event.target.dataset)

        // title votes for polls are managed by the server
        if (votingtype === 'all_titles' && this.state.activePoll !== 'local') {

            this.clearMyTitleVotesInPoll(this.state.activePoll, this.state.user)

        // attribute votes and all non-poll votes are kept on the client (state & local storage)
        } else {

            const clearVotes = {}
            this.setState(prevState => {
                let updated_activeThumbs = JSON.parse(JSON.stringify(prevState.activeThumbs))
                if (votingtype === 'all_titles') {
                    updated_activeThumbs.titles = clearVotes
                    updated_activeThumbs.total_title_votes = this.totalTitleVotes(updated_activeThumbs.titles)
                } else {
                    if (votingtype === 'all_attributes') {
                        updated_activeThumbs.attributes['players'] = clearVotes
                        updated_activeThumbs.attributes['weight'] = clearVotes
                        updated_activeThumbs.attributes['category'] = clearVotes
                        updated_activeThumbs.attributes['mechanic'] = clearVotes
                    } else {
                        updated_activeThumbs.attributes[votingtype] = clearVotes
                    }
                    updated_activeThumbs.total_attribute_votes = this.totalAttributeVotes(updated_activeThumbs.attributes)
                }
                localStorage.setItem('activeThumbs', JSON.stringify(updated_activeThumbs))

                // update the master list of all preferences
                let new_allThumbs = JSON.parse(JSON.stringify(updated_activeThumbs))
                let new_pollThumbs = JSON.parse(JSON.stringify(updated_activeThumbs))
                new_allThumbs[prevState.activePoll] = new_pollThumbs
                localStorage.setItem('allThumbs', JSON.stringify(new_allThumbs))

                return { 
                    activeThumbs: updated_activeThumbs,
                    allThumbs: new_allThumbs,
                }
            })

        }
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
                    <h1>{(this.state.activePoll === 'local') ? 'Boardgameinator' : this.state.activePoll}</h1>
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
                    activethumbs={this.state.activeThumbs} 
                    sortby={this.state.sortOrder}
                    filtertitles={this.state.filterTitles}
                    filterplayercount={this.state.filterPlayercount}
                    filterweight={this.state.filterWeight}
                    ondelete={this.onDeleteTitle}
                    ondeleteall={this.onDeleteAllTitles}
                    onnewvote={this.onNewVote}
                    onclearsectionvotes={this.onClearSectionVotes}
                    activepoll={this.state.activePoll}
                    onviewpoll={this.onViewPoll}
                    reallynarrow={styles.reallyNarrow} 
                    user={this.state.user} />
            </div>
            </React.Fragment>
        )
    }
}

Boardgameinator.propTypes = {
    location: PropTypes.object.isRequired,
}