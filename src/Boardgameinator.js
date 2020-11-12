import React from 'react'
import PropTypes from 'prop-types'
import purpleMeeple from './img/purple-meeple-64.png'
import { ViewControls } from './ViewControls'
import { GameList } from './GameList'
import { validateUserTitles } from './GameLibrary'
import { voteinpollApi, clearmyvotesApi, deletetitleinpollApi } from './Api.js'
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
            routedGames: {},
            sortOrder: 'maxtitlevotes',
            user: '_me_', // FIXME: implement user auths
            windowWidth: 0,
            windowHeight: 0
        }
        this.getCachedGameTitles = this.getCachedGameTitles.bind(this)
        this.addValidatedGamesWithPollContext = this.addValidatedGamesWithPollContext.bind(this)
        this.addValidatedGames = this.addValidatedGames.bind(this)
        this.deleteTitleInPoll = this.deleteTitleInPoll.bind(this)
        this.onNewVote = this.onNewVote.bind(this)
        this.onDeleteTitle = this.onDeleteTitle.bind(this)
        this.onDeleteAllTitles = this.onDeleteAllTitles.bind(this)
        this.onClearSectionVotes = this.onClearSectionVotes.bind(this)
        this.onViewPoll = this.onViewPoll.bind(this)
        this.handleSortChange = this.handleSortChange.bind(this)
        this.handleFilterChange = this.handleFilterChange.bind(this)
        this.updateDimensions = this.updateDimensions.bind(this)
    }

    gamedataVersion = 1

    componentDidMount() {

        let allGameData = []

        let query_strings, routed_new_list = [], routed_addto_list = []
        let path = this.props.location.search.slice(1).split('?')
        if (path.length === 1) {
            query_strings = path[0]
        } else {
            query_strings = path[1]
        }
        query_strings.split('&').forEach( function(query_string) {
            let qs = query_string.split('=')
            if (qs[0] === 'newlist') {
                qs[1].split('+').forEach( game_id => routed_new_list.push(parseInt(game_id)) )
            } else if (qs[0] === 'addtolist') {
                qs[1].split('+').forEach( game_id => routed_addto_list.push(parseInt(game_id)) )
            }
        })
        if (routed_new_list.length && routed_addto_list.length) {
            routed_addto_list = [] // ignore addto_list if new_list exists
        }
        let updated_routedGames = {}
        updated_routedGames['new_list'] = [...routed_new_list]
        updated_routedGames['addto_list'] = [...routed_addto_list]
        this.setState({ routedGames: updated_routedGames })

        const stored_localGameList = JSON.parse(localStorage.getItem("localGameList"))
        if (stored_localGameList !== null) {
            this.setState({ localGameList: stored_localGameList })
        }

        const stored_activeGameList = JSON.parse(localStorage.getItem("activeGameList"))
        if (stored_activeGameList !== null && routed_new_list.length === 0) {
            this.setState({ activeGameList: stored_activeGameList })
        } else {
            this.setState({ activeGameList: [] })
        }

        const stored_activePoll = JSON.parse(localStorage.getItem("activePoll"))
        if (stored_activePoll !== null) {
            this.setState({ activePoll: stored_activePoll })
        } else {
            this.setState({ activePoll: 'local' })
        }

        const stored_gamedataVersion = JSON.parse(localStorage.getItem("gamedataVersion"))
        if (stored_gamedataVersion === this.gamedataVersion) {
            allGameData = JSON.parse(localStorage.getItem("allGameData"))
        } else {
            localStorage.setItem('gamedataVersion', JSON.stringify(this.gamedataVersion))
            localStorage.setItem('allGameData', JSON.stringify(allGameData))
        }
        this.setState({ allGameData })

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
                    unambiguous_name: gamedata.unambiguous_name,
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
                                if (typeof game.attributes !== 'undefined') {
                                    for (let category of game.attributes.categories) {
                                        if (votedcategory.hasOwnProperty(category)
                                          && votedcategory[category].hasOwnProperty('thumbsup')
                                          && votedcategory[category].thumbsup.length) {
                                            attributeStillOccurs = true
                                            break
                                        }
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
                                if (typeof game.attributes !== 'undefined') {
                                    for (let mechanic of game.attributes.mechanics) {
                                        if (votedmechanic.hasOwnProperty(mechanic)
                                          && votedmechanic[mechanic].hasOwnProperty('thumbsup')
                                          && votedmechanic[mechanic].thumbsup.length) {
                                            attributeStillOccurs = true
                                            break
                                        }
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
                let updated_allThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))
                let updated_pollThumbs = JSON.parse(JSON.stringify(activeThumbs))
                updated_allThumbs[prevState.activePoll] = updated_pollThumbs
                localStorage.setItem('allThumbs', JSON.stringify(updated_allThumbs))

                return { 
                    activeGameList: activeGameList,
                    localGameList: localGameList,
                    allThumbs: updated_allThumbs,
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
            let updated_allThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))
            let updated_pollThumbs = JSON.parse(JSON.stringify(activeThumbs))
            updated_allThumbs[prevState.activePoll] = updated_pollThumbs
            localStorage.setItem('allThumbs', JSON.stringify(updated_allThumbs))

            return { 
                activeGameList: activeGameList,
                localGameList: localGameList,
                allThumbs: updated_allThumbs,
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
                let updated_allThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))
                let updated_pollThumbs = JSON.parse(JSON.stringify(updated_activeThumbs))
                updated_allThumbs['local'] = updated_pollThumbs
                localStorage.setItem('allThumbs', JSON.stringify(updated_allThumbs))

                return { 
                    activeThumbs: updated_activeThumbs,
                    allThumbs: updated_allThumbs,
                }
            })

        }
    }

    async onViewPoll(poll) {

        if (poll.name === 'local') {
            this.addValidatedGamesWithPollContext(null, poll.name, null)
        } else {
            let poll_game_ids = Object.keys(poll.pollThumbs.titles).map( title => parseInt(title) )
            let cachedGameTitles = this.getCachedGameTitles()
            let validation_result = await validateUserTitles(cachedGameTitles, poll_game_ids)
            let poll_thumbs = JSON.parse(JSON.stringify(poll.pollThumbs))
            this.addValidatedGamesWithPollContext(validation_result.gameValidations, poll.name, poll_thumbs)
        }

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
                let updated_allThumbs = JSON.parse(JSON.stringify(updated_activeThumbs))
                let updated_pollThumbs = JSON.parse(JSON.stringify(updated_activeThumbs))
                updated_allThumbs[prevState.activePoll] = updated_pollThumbs
                localStorage.setItem('allThumbs', JSON.stringify(updated_allThumbs))

                return { 
                    activeThumbs: updated_activeThumbs,
                    allThumbs: updated_allThumbs,
                }
            })

        }
    }

    addValidatedGames(validation_result) {
        this.addValidatedGamesWithPollContext(validation_result, this.state.activePoll, this.state.allThumbs[this.state.activePoll])
    }

    // when the poll is "local"...
    //   1) the incoming set of games to add will be combined with the local active list
    //   2) any subsequent title votes will be recorded to the local set of title votes
    //   3) any subsequent attribute votes will be recorded to the local set of attribute votes
    //
    // when the poll is not "local"...
    //   1) the incoming set of games to add will replace the local active list
    //   2) any subsequent title votes will be recorded to the remote/poll set of title votes
    //   3) any subsequent attribute votes will be recorded to the local set of attribute votes
    //
    // when games are routed...
    //   1) the incoming set of games to add will either replace or be combined with the local active list
    //   2) the current active list will switch to the local set of games
    //
    addValidatedGamesWithPollContext(validation_result, poll_name, poll_thumbs) {

        this.setState(prevState => {

            let updated_activeGameList = [], updated_activeThumbs = {}, updated_localGameList = [...prevState.localGameList]
            let updated_allGameData = JSON.parse(JSON.stringify(prevState.allGameData))
            let routed_games_treatment = (validation_result !== null) ? validation_result.routed_games_treatment : 'none'
            let updated_poll_name = poll_name
            let poll_is_changing = (prevState.activePoll !== updated_poll_name) ? 1 : 0

            // for routed and switching to local, set the poll and active game list to local before the adds happen
            if (routed_games_treatment === 'replace'
                || (poll_is_changing && updated_poll_name === 'local') ) {
                updated_poll_name = 'local'
                updated_activeGameList = (routed_games_treatment === 'replace') ? [] : [...prevState.localGameList]
                updated_activeThumbs = JSON.parse(JSON.stringify(prevState.allThumbs.local))

            // for other poll switching, the active game list is cleared before the adds happen
            } else if (poll_is_changing) {
                updated_activeGameList = []
                updated_activeThumbs = JSON.parse(JSON.stringify(poll_thumbs))
                updated_activeThumbs.total_title_votes = poll_thumbs.total_title_votes

            // else, the poll remains the same and adds can happen
            } else {
                updated_activeGameList = [...prevState.localGameList]
                updated_activeThumbs = JSON.parse(JSON.stringify(prevState.allThumbs.local))
                updated_activeThumbs.total_title_votes = poll_thumbs.total_title_votes
            }

            // now, add the new games
            if (validation_result !== null && (validation_result.new_gamedata_to_activate.length || validation_result.new_gamedata_to_cache)) {

                let now = new Date()

                Object.values(validation_result.new_gamedata_to_activate).forEach(each_newGameData => {
                    let new_gamedata = JSON.parse(JSON.stringify(each_newGameData))
                    new_gamedata["updated_at"] = now.getTime()
                    updated_activeGameList.push(new_gamedata.id)
                    if (updated_poll_name === 'local') {
                        updated_localGameList.push(new_gamedata.id)
                    }
                    updated_allGameData.push(new_gamedata)
                })

                Object.values(validation_result.new_gamedata_to_cache).forEach(each_newGameData => {
                    let new_gamedata = JSON.parse(JSON.stringify(each_newGameData))
                    new_gamedata["updated_at"] = now.getTime()
                    updated_allGameData.push(new_gamedata)
                })

            }

            // for all polls, attribute votes are always kept locally
            updated_activeThumbs.attributes = JSON.parse(JSON.stringify(prevState.allThumbs.local.attributes))
            updated_activeThumbs.total_attribute_votes = prevState.allThumbs.local.total_attribute_votes

            // now, add the cached games
            if (validation_result !== null && validation_result.cached_games_to_activate.length) {

                validation_result.cached_games_to_activate.forEach(cached_game_name => {
                    let id_to_activate = prevState.allGameData.filter( game_data => game_data.unambiguous_name === cached_game_name )[0].id
                    updated_activeGameList.push(id_to_activate)
                    if (updated_poll_name === 'local') {
                        updated_localGameList.push(id_to_activate)
                    }
                })

            }

            localStorage.setItem('activeGameList', JSON.stringify(updated_activeGameList))
            localStorage.setItem('localGameList', JSON.stringify(updated_localGameList))
            localStorage.setItem('allGameData', JSON.stringify(updated_allGameData))
            localStorage.setItem('activePoll', JSON.stringify(updated_poll_name))
            localStorage.setItem('activeThumbs', JSON.stringify(updated_activeThumbs))

            return { 
                activePoll: poll_name,
                activeGameList: updated_activeGameList,
                activeThumbs: updated_activeThumbs,
                localGameList: updated_localGameList,
                allGameData: updated_allGameData,
            }
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
                    routedgames={this.state.routedGames}
                    activegamedata={activeGameData} 
                    cachedgametitles={cachedGameTitles}
                    addvalidatedgames={this.addValidatedGames}
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