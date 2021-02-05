import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import purpleMeeple from './img/purple-meeple-64.png'
import { ViewControls } from './ViewControls'
import { GameList } from './GameList'
import { PollInfo } from './PollInfo'
import { validateUserTitles } from './GameLibrary'
import { voteinpollApi, clearmyvotesApi, deletetitleinpollApi } from './Api.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'


const TitleString = (props) => {
    if (props.poll.id === 'local') {
        return (
            <h1 className="big">Boardgameinator</h1>
        )
    }  else {
        return (
            <h1>{props.poll.name}</h1>
        )
    }
}

const Clock = (props) => {

    const [delta, setDelta] = useState(0);
    const [deltaDays, setDeltaDays] = useState('-');
    const [deltaHours, setDeltaHours] = useState('-');
    const [deltaMins, setDeltaMins] = useState('-');
    const [deltaSecs, setDeltaSecs] = useState('-');

    useEffect( () => {

        if (props.poll.id !== 'local') {

            // Begin the countdown timer for the current poll
            const timerId = setInterval( () => {

                const now = new Date().getTime();
                let deltaDays = 0, deltaHours = 0, deltaMins = 0
                let delta = parseInt(props.poll.closesAt) - now
                let deltaSecs = Math.floor(delta / 1000)
                if (delta > 0) {
                    if (deltaSecs > 59) {
                        deltaMins = Math.floor(deltaSecs / 60)
                        deltaSecs -= deltaMins * 60
                        if (deltaMins > 59) {
                            deltaHours = Math.floor(deltaMins / 60)
                            deltaMins -= deltaHours * 60
                            if (deltaHours > 23) {
                                deltaDays = Math.floor(deltaHours / 24)
                                deltaHours -= deltaDays * 24
                            }
                        }
                    }
                }
                setDelta(delta)
                setDeltaDays(deltaDays)
                setDeltaHours(deltaHours)
                setDeltaMins(deltaMins)
                setDeltaSecs(deltaSecs)
            }, 1000);

            return () => clearInterval(timerId);
        }

    }, [props.poll.closesAt, props.poll.id]);

    if (props.poll.id === 'local') {
        return (
            <p></p>
        )
    } else if (delta < 0) {
        return (
            <p id="countdown">results final</p>
        )
    } else {
        return (
            <div id="clock">
                <p id="countdown-label">
                    voting closes:
                </p>
                <div id="countdown">
                    <div className="delta">
                        <div className="value">{deltaDays}</div>
                        <div className="units">days</div>
                    </div>
                    <div className="delta">
                        <div className="value">{deltaHours}</div>
                        <div className="units">hours</div>
                    </div>
                    <div className="delta">
                        <div className="value">{deltaMins}</div>
                        <div className="units">mins</div>
                    </div>
                    <div className="delta">
                        <div className="value">{deltaSecs}</div>
                        <div className="units">secs</div>
                    </div>
                </div>
            </div>
        )
    }
}

export class Boardgameinator extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            activeGameList: [],
            activePoll: { 
                id: 'local',
                name: 'local',
            },
            allGameData: [],
            activeThumbs: {
                attributes: {
                    players: {}, 
                    weight: {}, 
                    category: {}, 
                    mechanic: {}
                },
                totalAttributeVotes: 0,
                titles: {},
                totalTitleVotes: 0,
            },
            allThumbs:  {
                local: {
                    attributes: {
                        players: {}, 
                        weight: {}, 
                        category: {}, 
                        mechanic: {}
                    },
                    totalAttributeVotes: 0,
                    titles: {},
                    totalTitleVotes: 0,
                }
            },
            filterTitles: false,
            filterPlayercount: true,
            filterWeight: true,
            localGameList: [],
            routedGames: {},
            sortOrder: 'alphabetical',
            user: null,
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
        this.handleUserChange = this.handleUserChange.bind(this)
        this.updateDimensions = this.updateDimensions.bind(this)
    }

    gamedataVersion = 1

    componentDidMount() {

        let allGameData = [], routedNewList = [], routedAddtoList = [], routedPollId = null
        let path = this.props.location.search.slice(1).split('?')

        const storedUser = JSON.parse(localStorage.getItem("user"))
        if (storedUser !== null) {
            this.setState({ user: storedUser })
        }

        const queryStrings = (path.length === 1) ? path[0] : path[1] 
        queryStrings.split('&').forEach( function(queryString) {
            const qs = queryString.split('=')
            if (qs[0] === 'newlist') {
                qs[1].split('+').forEach( function(gameId) {
                  if (!routedNewList.includes(parseInt(gameId))) {
                    routedNewList.push(parseInt(gameId))
                  }
                })
            } else if (qs[0] === 'addtolist') {
                qs[1].split('+').forEach( function(gameId) {
                  if (!routedAddtoList.includes(parseInt(gameId))) {
                    routedAddtoList.push(parseInt(gameId))
                  }
                })
            } else if (qs[0] === 'poll' && !isNaN(parseInt(qs[1]))) {
                routedPollId = parseInt(qs[1])
            }
        })
        if (routedPollId !== null) {
            routedAddtoList = [] // ignore addtoList and newList if poll ID exists
            routedNewList = []
        } else if (routedNewList.length && routedAddtoList.length) {
            routedAddtoList = [] // ignore addtoList if newList exists
        }
        let updatedRoutedGames = {}
        updatedRoutedGames['newList'] = [...routedNewList]
        updatedRoutedGames['addtoList'] = [...routedAddtoList]
        updatedRoutedGames['pollId'] = routedPollId
        this.setState({ routedGames: updatedRoutedGames })

        const storedLocalGameList = JSON.parse(localStorage.getItem("localGameList"))
        if (storedLocalGameList !== null) {
            this.setState({ localGameList: storedLocalGameList })
        }

        const storedActiveGameList = JSON.parse(localStorage.getItem("activeGameList"))
        if (storedActiveGameList !== null && routedNewList.length === 0 && routedPollId === null) {
            this.setState({ activeGameList: storedActiveGameList })
        } else {
            this.setState({ activeGameList: [] })
        }

        const storedActivePoll = JSON.parse(localStorage.getItem("activePoll"))
        if (storedActivePoll !== null) {
            this.setState({ activePoll: storedActivePoll })
        } else {
            const defaultPoll = {
                id: 'local',
                name: 'local',
            }
            this.setState({ activePoll: defaultPoll })
        }

        const storedGamedataVersion = JSON.parse(localStorage.getItem("gamedataVersion"))
        if (storedGamedataVersion === this.gamedataVersion) {
            allGameData = JSON.parse(localStorage.getItem("allGameData"))
        } else {
            localStorage.setItem('gamedataVersion', JSON.stringify(this.gamedataVersion))
            localStorage.setItem('allGameData', JSON.stringify(allGameData))
        }
        this.setState({ allGameData })

        const storedAllThumbs = JSON.parse(localStorage.getItem("allThumbs"))
        if (storedAllThumbs !== null) {
            this.setState({ allThumbs: storedAllThumbs })
        }

        const storedActiveThumbs = JSON.parse(localStorage.getItem("activeThumbs"))
        if (storedActiveThumbs !== null) {
            this.setState({ activeThumbs: storedActiveThumbs })
        }

        const storedSortOrder = JSON.parse(localStorage.getItem("sortOrder"))
        if (storedSortOrder !== null) {
            this.setState({ sortOrder: storedSortOrder })
        }

        const storedFilterTitles = JSON.parse(localStorage.getItem("filterTitles"))
        if (storedFilterTitles !== null) {
            this.setState({ filterTitles: storedFilterTitles })
        }

        const storedFilterPlayercount = JSON.parse(localStorage.getItem("filterPlayercount"))
        if (storedFilterPlayercount !== null) {
            this.setState({ filterPlayercount: storedFilterPlayercount })
        }

        const storedFilterWeight = JSON.parse(localStorage.getItem("filterWeight"))
        if (storedFilterWeight !== null) {
            this.setState({ filterWeight: storedFilterWeight })
        }

        this.updateDimensions()
        window.addEventListener('resize', this.updateDimensions)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions)
    }

    updateDimensions() {
        const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0
        const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0
        this.setState({ windowWidth, windowHeight })
    }

    // for disambiguation of titles, the game ID will be put in parentheses when the API does not provide yearPublished info
    extractYearFromTitle(title) {
        if (typeof title === 'string' && title.length) {
            const matchesDate = title.match(/(( +)\((-?)\d{1,4}\))$/)
            if (matchesDate !== null) {
                return matchesDate[0].replace(/[^0-9-]/g, "")
            } else {
                const matchesId = title.match(/(( +)\(#\d{1,6}\))$/)
                if (matchesId !== null) {
                    return matchesId[0].replace(/[^#0-9-]/g, "")
                } else {
                    return null
                }
            }
        }
    }

    getCachedGameTitles() {
        const titles = {}, self = this
        this.state.allGameData.forEach(function(gamedata) {
            if (gamedata.hasOwnProperty('unambiguousName')) {
                const new_cache_info = {
                    id: gamedata.id,
                    name: gamedata.name,
                    unambiguousName: gamedata.unambiguousName,
                    yearPublished: gamedata.yearPublished,
                    active: (self.state.activeGameList.includes(gamedata.id)) ? true : false,
                }
                titles[gamedata.unambiguousName] = new_cache_info
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
        const number = playercount.slice(0, -1)
        if (number <= game.attributes.maxPlayers && number >= game.minPlayers) {
            return true
        } else {
            return false
        }
    }

    onDeleteTitle(event, id) {

        // title removals for polls are managed by the server
        if (this.state.activePoll.id !== 'local') {

            this.deleteTitleInPoll(this.state.activePoll.id, id, this.state.user)

        // title removals for non-polls are kept on the client (state & local storage)
        } else {

            this.setState(prevState => {

                // FIXME: Implement poll editing. May not want to update active list here if we are currently looking at a poll.
                // remove the game from the active game list (but still keep its game data cached)
                let activeGameList = prevState.activeGameList.slice()
                activeGameList = activeGameList.filter(gameId => gameId !== parseInt(id))

                // remove the game from the local game list (but still keep its game data cached)
                let localGameList = prevState.localGameList.slice()
                localGameList = localGameList.filter(gameId => gameId !== parseInt(id))

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
                        for (let votedPlayercount in activeThumbs.attributes[attrName]) {
                            let attributeStillOccurs = false
                            for (let game of allGameData) {
                                if (this.gameSupportsPlayercount(game, votedPlayercount)) {
                                    attributeStillOccurs = true
                                    break
                                }
                            }
                            if (!attributeStillOccurs) {
                                delete activeThumbs.attributes[attrName][votedPlayercount]
                            }
                        }
                    } else if (attrName === 'weight') {
                        for (let votedWeight in activeThumbs.attributes[attrName]) {
                            let attributeStillOccurs = false
                            for (let game of allGameData) {
                                if (game.weight === votedWeight) {
                                    attributeStillOccurs = true
                                    break
                                }
                            }
                            if (!attributeStillOccurs) {
                                delete activeThumbs.attributes[attrName][votedWeight]
                            }
                        }
                    } else if (attrName === 'category') {
                        for (let votedCategory in activeThumbs.attributes[attrName]) {
                            let attributeStillOccurs = false
                            for (let game of allGameData) {
                                if (typeof game.attributes !== 'undefined') {
                                    for (let category of game.attributes.categories) {
                                        if (votedCategory.hasOwnProperty(category)
                                          && votedCategory[category].hasOwnProperty('thumbsup')
                                          && votedCategory[category].thumbsup.length) {
                                            attributeStillOccurs = true
                                            break
                                        }
                                    }
                                }
                            }
                            if (!attributeStillOccurs) {
                                delete activeThumbs.attributes[attrName][votedCategory]
                            }
                        }
                    } else if (attrName === 'mechanic') {
                        for (let votedMechanic in activeThumbs.attributes[attrName]) {
                            let attributeStillOccurs = false
                            for (let game of allGameData) {
                                if (typeof game.attributes !== 'undefined') {
                                    for (let mechanic of game.attributes.mechanics) {
                                        if (votedMechanic.hasOwnProperty(mechanic)
                                          && votedMechanic[mechanic].hasOwnProperty('thumbsup')
                                          && votedMechanic[mechanic].thumbsup.length) {
                                            attributeStillOccurs = true
                                            break
                                        }
                                    }
                                }
                            }
                            if (!attributeStillOccurs) {
                                delete activeThumbs.attributes[attrName][votedMechanic]
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
                let updatedAllThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))
                let updatedPollThumbs = JSON.parse(JSON.stringify(activeThumbs))
                updatedAllThumbs[prevState.activePoll.id] = updatedPollThumbs
                localStorage.setItem('allThumbs', JSON.stringify(updatedAllThumbs))

                return { 
                    activeGameList: activeGameList,
                    localGameList: localGameList,
                    allThumbs: updatedAllThumbs,
                    activeThumbs: activeThumbs,
                }
            })
        }
    }

    async clearMyTitleVotesInPoll(pollId, user) {
        clearmyvotesApi(pollId, user)
            // .then(json => {
            //     if (json.hasOwnProperty('id') === pollId) {
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
                totalTitleVotes: 0,
                totalAttributeVotes: 0,
            }
            localStorage.setItem('activeGameList', JSON.stringify(activeGameList))
            localStorage.setItem('localGameList', JSON.stringify(localGameList))
            localStorage.setItem('activeThumbs', JSON.stringify(activeThumbs))

            // update the master list of all preferences
            let updatedAllThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))
            let updatedPollThumbs = JSON.parse(JSON.stringify(activeThumbs))
            updatedAllThumbs[prevState.activePoll.id] = updatedPollThumbs
            localStorage.setItem('allThumbs', JSON.stringify(updatedAllThumbs))

            return { 
                activeGameList: activeGameList,
                localGameList: localGameList,
                allThumbs: updatedAllThumbs,
                activeThumbs: activeThumbs,
            }
        })
    }

    totalTitleVotes(allTitleThumbs, mineOnly, whoAmI) {
        let count = 0
        Object.entries(allTitleThumbs)
            .forEach( function(title) {
                // title[0]: 27588
                // title[1]: {thumbsup:[{rank:null, user:Bob}]}
                if (title[1].hasOwnProperty('thumbsup')) {
                    if (mineOnly) {
                        let myVote = title[1].thumbsup.filter( vote => vote.user === whoAmI )
                        if (myVote.length) {
                            count += 1
                        }
                    } else {
                        count += title[1]['thumbsup'].length
                    }
                }
            })
        return  count
    }

    totalAttributeVotes(allAttributeThumbs) {
        let count = 0
        Object.entries(allAttributeThumbs)
            .forEach( function(category) {
                count += Object.values(category[1]).filter( vote => vote.hasOwnProperty('thumbsup') && vote.thumbsup.length ).length
            })
        return  count
    }

    async voteTitleInPoll(pollId, title, newVote, user) {
        voteinpollApi(pollId, title, newVote, user)
            // .then(json => {
            //     if (json.hasOwnProperty('id') === pollId) {
            //         this.onViewPoll(json)
            //     }})
    }

    async deleteTitleInPoll(pollId, titleId, user) {
        deletetitleinpollApi(pollId, titleId, user)
            // .then(json => {
            //     if (json.hasOwnProperty('id') === pollId) {
            //         this.onViewPoll(json)
            //     }})
    }

    onNewVote(event) {
        const { votingtype, votingon, newvote } = Object.assign({}, event.currentTarget.dataset)

        // title votes for polls are managed by the server
        if (votingtype === 'title' && this.state.activePoll.id !== 'local') {

            this.voteTitleInPoll(this.state.activePoll.id, votingon, newvote, this.state.user)

        // attribute votes and all non-poll votes are kept on the client (state & local storage)
        } else {

            this.setState(prevState => {
                let updatedActiveThumbs = JSON.parse(JSON.stringify(prevState.activeThumbs))
                // record a title vote
                //   ex: votingtype:title votingon:63888 newvote:thumbsup
                if (votingtype === 'title') {
                    // update voting info for this title (...behaves as a toggle: incoming newvote cancels out a previously recorded newvote)
                    if (prevState.activeThumbs.titles.hasOwnProperty(votingon.toString())) {
                        if (prevState.activeThumbs.titles[votingon.toString()].hasOwnProperty(newvote)) {
                            let prevMyTitleVote = JSON.parse(JSON.stringify(prevState.activeThumbs.titles[votingon.toString()][newvote])).filter( vote => vote.user === prevState.user )
                            // toggle the vote off
                            if (prevMyTitleVote.length > 0) {
                                let updatedMyTitleVote = JSON.parse(JSON.stringify(prevState.activeThumbs.titles[votingon.toString()][newvote])).filter( vote => vote.user !== prevState.user )
                                updatedActiveThumbs.titles[votingon.toString()][newvote] = updatedMyTitleVote
                            // toggle the vote on
                            } else {
                                let newUserVote = {
                                    user: prevState.user,
                                    rank: null,
                                }
                                let updatedMyTitleVote = JSON.parse(JSON.stringify(prevState.activeThumbs.titles[votingon.toString()][newvote]))
                                updatedMyTitleVote.push(newUserVote)
                                updatedActiveThumbs.titles[votingon.toString()][newvote] = updatedMyTitleVote
                            }
                        // add the first vote as on
                        } else {
                            let newUserVote = {
                                user: prevState.user,
                                rank: null,
                            }
                            updatedActiveThumbs.titles[votingon.toString()][newvote] = [newUserVote]
                        }
                    // no voting exists for this title, create it
                    } else {
                        let newVotingOn = {}
                        let newUserVote = {
                            user: prevState.user,
                            rank: 1,
                        }
                        newVotingOn[newvote] = [newUserVote]
                        updatedActiveThumbs.titles[votingon.toString()] = newVotingOn
                    }
                // record an attribute vote
                //   ex: votingtype:category votingon:Card Game newvote:thumbsup
                } else {
                    if (updatedActiveThumbs.attributes[votingtype].hasOwnProperty(votingon)) {
                        let updatedThisAttribute = JSON.parse(JSON.stringify(updatedActiveThumbs.attributes[votingtype][votingon]))
                        // clear this user's previous vote on this attribute
                        if (updatedThisAttribute.hasOwnProperty(newvote)
                            && updatedThisAttribute[newvote].includes(prevState.user)) {
                            let updatedVote = updatedThisAttribute[newvote].filter( user => user !== prevState.user )
                            updatedThisAttribute[newvote] = updatedVote
                        // add this user's new vote to this attribute
                        } else {
                            let updatedVote = [prevState.user]
                            updatedThisAttribute[newvote] = updatedVote
                        }
                        updatedActiveThumbs.attributes[votingtype][votingon] = updatedThisAttribute
                    } else {
                        // add this user's new vote to this attribute
                        let updatedVote = {}
                        updatedVote[newvote] = [prevState.user]
                        updatedActiveThumbs.attributes[votingtype][votingon] = updatedVote
                    }
                }
                const myCountsOnly = (this.state.activePoll.id === 'local') ? true : false;
                updatedActiveThumbs.totalTitleVotes = this.totalTitleVotes(updatedActiveThumbs.titles, myCountsOnly, this.state.user)
                updatedActiveThumbs.totalAttributeVotes = this.totalAttributeVotes(updatedActiveThumbs.attributes)
                localStorage.setItem('activeThumbs', JSON.stringify(updatedActiveThumbs))

                // update the master list of all preferences
                let updatedAllThumbs = JSON.parse(JSON.stringify(prevState.allThumbs))
                let updatedPollThumbs = JSON.parse(JSON.stringify(updatedActiveThumbs))
                updatedAllThumbs['local'] = updatedPollThumbs
                localStorage.setItem('allThumbs', JSON.stringify(updatedAllThumbs))

                return { 
                    activeThumbs: updatedActiveThumbs,
                    allThumbs: updatedAllThumbs,
                }
            })

        }
    }

    async onViewPoll(poll) {

        let wasRouted = false
        if (poll.id === 'local') {
            this.addValidatedGamesWithPollContext(null, poll, null, wasRouted)
        } else {
            let pollGameIds = Object.keys(poll.pollThumbs.titles).map( title => parseInt(title) )
            let cachedGameTitles = this.getCachedGameTitles()
            let validationResult = await validateUserTitles(cachedGameTitles, pollGameIds, )
            if ( (this.state.routedGames.hasOwnProperty('newList') && this.state.routedGames.newList.length)
              || (this.state.routedGames.hasOwnProperty('pollId') && this.state.routedGames.pollId !== null) ) {
                wasRouted = true
                validationResult['routedGamesTreatment'] = 'replace'
            } else if (this.state.routedGames.hasOwnProperty('addtoList') && this.state.routedGames.addtoList.length) {
                wasRouted = true
                validationResult['routedGamesTreatment'] = 'append'
            }
            let pollThumbs = JSON.parse(JSON.stringify(poll.pollThumbs))
            this.addValidatedGamesWithPollContext(validationResult.gameValidations, poll, pollThumbs, wasRouted)
        }

    }

    onClearSectionVotes(event) {
        const { votingtype } = Object.assign({}, event.target.dataset)

        // title votes for polls are managed by the server
        if (votingtype === 'all_titles' && this.state.activePoll.id !== 'local') {

            this.clearMyTitleVotesInPoll(this.state.activePoll.id, this.state.user)

        // attribute votes and all non-poll votes are kept on the client (state & local storage)
        } else {

            const clearVotes = {}
            this.setState(prevState => {
                let updatedActiveThumbs = JSON.parse(JSON.stringify(prevState.activeThumbs))
                if (votingtype === 'all_titles') {
                    const myCountsOnly = (this.state.activePoll.id === 'local') ? true : false;
                    updatedActiveThumbs.titles = clearVotes
                    updatedActiveThumbs.totalTitleVotes = this.totalTitleVotes(updatedActiveThumbs.titles, myCountsOnly, this.state.user)
                } else {
                    if (votingtype === 'all_attributes') {
                        updatedActiveThumbs.attributes['players'] = clearVotes
                        updatedActiveThumbs.attributes['weight'] = clearVotes
                        updatedActiveThumbs.attributes['category'] = clearVotes
                        updatedActiveThumbs.attributes['mechanic'] = clearVotes
                    } else {
                        updatedActiveThumbs.attributes[votingtype] = clearVotes
                    }
                    updatedActiveThumbs.totalAttributeVotes = this.totalAttributeVotes(updatedActiveThumbs.attributes)
                }
                localStorage.setItem('activeThumbs', JSON.stringify(updatedActiveThumbs))

                // update the master list of all preferences
                let updatedAllThumbs = JSON.parse(JSON.stringify(updatedActiveThumbs))
                let updatedPollThumbs = JSON.parse(JSON.stringify(updatedActiveThumbs))
                updatedAllThumbs[prevState.activePoll.id] = updatedPollThumbs
                localStorage.setItem('allThumbs', JSON.stringify(updatedAllThumbs))

                return { 
                    activeThumbs: updatedActiveThumbs,
                    allThumbs: updatedAllThumbs,
                }
            })

        }
    }

    addValidatedGames(validationResult) {
        this.addValidatedGamesWithPollContext(validationResult, this.state.activePoll, this.state.allThumbs[this.state.activePoll.id], false)
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
    addValidatedGamesWithPollContext(validationResult, activePoll, pollThumbs, wasRouted) {

        this.setState(prevState => {

            let updatedActiveGameList = [], updatedActiveThumbs = {}, updatedLocalGameList = [...prevState.localGameList]
            let updatedRoutedGames = { newList: [], addtoList: [], pollId: null }
            let updatedAllGameData = JSON.parse(JSON.stringify(prevState.allGameData))
            let routedGamesTreatment = (validationResult !== null) ? validationResult.routedGamesTreatment : 'none'
            let updatedActivePoll = JSON.parse(JSON.stringify(activePoll))
            let pollIsChanging = (prevState.activePoll.id !== activePoll.id) ? true : false

            // for routed and switching to local, set the poll and active game list to local before the adds happen
            if (routedGamesTreatment === 'replace'
              || routedGamesTreatment === 'append'
              || (pollIsChanging && activePoll.id === 'local') ) {
                updatedActivePoll.id = 'local'
                if (routedGamesTreatment === 'replace') {
                    updatedActiveGameList = []
                } else {
                    updatedActiveGameList = [...prevState.localGameList]
                }
                updatedActiveThumbs = JSON.parse(JSON.stringify(prevState.allThumbs.local))

            // for other poll switching, the active game list is cleared before the adds happen
            } else if (pollIsChanging) {
                updatedActiveGameList = []
                updatedActiveThumbs = JSON.parse(JSON.stringify(pollThumbs))
                updatedActiveThumbs.totalTitleVotes = pollThumbs.totalTitleVotes

            // else, the poll remains the same and adds can happen
            } else {
                updatedActiveGameList = [...prevState.localGameList]
                updatedActiveThumbs = JSON.parse(JSON.stringify(prevState.allThumbs.local))
                const myCountsOnly = (activePoll === 'local') ? true : false;
                let updatedTitleCount = this.totalTitleVotes(prevState.allThumbs.local, myCountsOnly, this.state.user)
                updatedActiveThumbs.totalTitleVotes = updatedTitleCount
            }

            // now, add the new games
            if (validationResult !== null && (validationResult.newGamedataToActivate.length || validationResult.newGamedataToCache)) {

                let now = new Date()

                Object.values(validationResult.newGamedataToActivate).forEach(eachNewGameData => {
                    let newGamedata = JSON.parse(JSON.stringify(eachNewGameData))
                    newGamedata["updatedAt"] = now.getTime()
                    updatedActiveGameList.push(newGamedata.id)
                    if (activePoll.id === 'local') {
                        updatedLocalGameList.push(newGamedata.id)
                    }
                    updatedAllGameData.push(newGamedata)
                })

                Object.values(validationResult.newGamedataToCache).forEach(eachNewGameData => {
                    let newGamedata = JSON.parse(JSON.stringify(eachNewGameData))
                    newGamedata["updatedAt"] = now.getTime()
                    updatedAllGameData.push(newGamedata)
                })

            }

            // for all polls, attribute votes are always kept locally
            updatedActiveThumbs.attributes = JSON.parse(JSON.stringify(prevState.allThumbs.local.attributes))
            updatedActiveThumbs.totalAttributeVotes = prevState.allThumbs.local.totalAttributeVotes

            // now, add the cached games
            if (validationResult !== null && validationResult.cachedGamesToActivate.length) {

                validationResult.cachedGamesToActivate.forEach(cachedGameName => {
                    let idToActivate = prevState.allGameData.filter( game_data => game_data.unambiguousName === cachedGameName )[0].id
                    updatedActiveGameList.push(idToActivate)
                    if (activePoll.id === 'local') {
                        updatedLocalGameList.push(idToActivate)
                    }
                })

            }

            // handle the disabling of filtering while a poll is active
            let updatedFilterPlayercount, updatedFilterTitles, updatedFilterWeight
            if (pollIsChanging && activePoll.id !== 'local') {
                updatedFilterPlayercount = false
                updatedFilterTitles = false
                updatedFilterWeight = false
            } else {
                updatedFilterPlayercount = JSON.parse(localStorage.getItem("filterPlayercount"))
                updatedFilterTitles = JSON.parse(localStorage.getItem("filterTitles"))
                updatedFilterWeight = JSON.parse(localStorage.getItem("filterWeight"))
            }

            localStorage.setItem('activeGameList', JSON.stringify(updatedActiveGameList))
            localStorage.setItem('localGameList', JSON.stringify(updatedLocalGameList))
            localStorage.setItem('allGameData', JSON.stringify(updatedAllGameData))
            localStorage.setItem('activePoll', JSON.stringify(updatedActivePoll))
            localStorage.setItem('activeThumbs', JSON.stringify(updatedActiveThumbs))

            return { 
                activePoll: updatedActivePoll,
                activeGameList: updatedActiveGameList,
                activeThumbs: updatedActiveThumbs,
                localGameList: updatedLocalGameList,
                allGameData: updatedAllGameData,
                routedGames: updatedRoutedGames,
                filterPlayercount: updatedFilterPlayercount,
                filterTitles: updatedFilterTitles,
                filterWeight: updatedFilterWeight,
            }
        })

        if (validationResult !== null && wasRouted) {
            this.props.history.push('/boardgameinator')
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
        if (this.state.activePoll.id === 'local') {
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
    }

    handleUserChange(newUsername) {
        this.setState(prevState => {
            const myCountsOnly = (this.state.activePoll.id === 'local') ? true : false;
            let updatedActiveThumbs = JSON.parse(JSON.stringify(prevState.activeThumbs))
            let updatedTitleCount = this.totalTitleVotes(prevState.activeThumbs.titles, myCountsOnly, newUsername)
            updatedActiveThumbs.totalTitleVotes = updatedTitleCount
            localStorage.setItem('user', JSON.stringify(newUsername))
            return {
                user: newUsername,
                activeThumbs: updatedActiveThumbs,
            }
        })
    }

    onHamburger(event) {
        // FIXME: (WIP) add modal functionality
        // alert('(FIXME/WIP) Make this a slide out menu of what are now buttons.')
    }

    render() {
        const { windowWidth } = this.state
        const styles = {
            reallyNarrow: windowWidth < 650
        }
        const activeGameData = this.state.allGameData.filter( gameData => this.state.activeGameList.includes(gameData.id) )
        const cachedGameTitles = this.getCachedGameTitles()
        let filterTitles = (this.state.filterTitles !== null && this.state.activePoll.id === 'local') ? this.state.filterTitles : false
        let filterPlayercount = (this.state.filterPlayercount !== null && this.state.activePoll.id === 'local') ? this.state.filterPlayercount : false
        let filterWeight = (this.state.filterWeight !== null && this.state.activePoll.id === 'local') ? this.state.filterWeight : false

        return (
            <React.Fragment>
            <div id="page-header">
                <div id="buttonrow-left">
                    <button className="fa fa-button"><FontAwesomeIcon icon={faBars}/></button>
                    <img src={purpleMeeple} alt="Boardgameinator logo" />
                    <TitleString poll={this.state.activePoll} />
                    <PollInfo poll={this.state.activePoll} gamedata={this.state.allGameData} user={this.state.user} />
                    <Clock poll={this.state.activePoll} />
                </div>
                <ViewControls 
                user={this.state.user}
                activePoll={this.state.activePoll}
                sortBy={this.state.sortOrder}
                onSortChange={this.handleSortChange}
                filterTitles={filterTitles}
                filterPlayercount={filterPlayercount}
                filterWeight={filterWeight}
                onFilterChange={this.handleFilterChange}
                onUserChange={this.handleUserChange} />
            </div>
            <div id="content-wrapper">
                <GameList
                    routedGames={this.state.routedGames}
                    activeGameData={activeGameData} 
                    cachedGameTitles={cachedGameTitles}
                    addValidatedGames={this.addValidatedGames}
                    activeThumbs={this.state.activeThumbs} 
                    sortBy={this.state.sortOrder}
                    filterTitles={filterTitles}
                    filterPlayercount={filterPlayercount}
                    filterWeight={filterWeight}
                    onDelete={this.onDeleteTitle}
                    onDeleteAll={this.onDeleteAllTitles}
                    onNewVote={this.onNewVote}
                    onClearSectionVotes={this.onClearSectionVotes}
                    activePoll={this.state.activePoll}
                    onViewPoll={this.onViewPoll}
                    reallyNarrow={styles.reallyNarrow} 
                    user={this.state.user} />
            </div>
            </React.Fragment>
        )
    }
}

Boardgameinator.propTypes = {
    location: PropTypes.object.isRequired,
}