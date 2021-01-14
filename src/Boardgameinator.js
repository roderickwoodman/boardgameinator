import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import purpleMeeple from './img/purple-meeple-64.png'
import { ViewControls } from './ViewControls'
import { GameList } from './GameList'
import { validateUserTitles } from './GameLibrary'
import { voteinpollApi, clearmyvotesApi, deletetitleinpollApi } from './Api.js'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faInfoCircle } from '@fortawesome/free-solid-svg-icons'


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

const PollInfo = (props) => {

    const [pollInfoIsOpen, setPollInfoIsOpen] = useState(false)

    const showPollInfoModal = () => {
        setPollInfoIsOpen(true)
    }

    const hidePollInfoModal = () => {
        setPollInfoIsOpen(false)
    }

    const epochToLocal = (epoch) => {
        let d = new Date(epoch)
        const dayName = d.toString().split(' ')[0]
        return dayName + ' ' + d.toLocaleDateString('en-US', { 
            day: '2-digit',
            month: '2-digit',
            year:'numeric'
        })
    }

    if (props.poll.id === 'local') {
        return (
            <p></p>
        )
    }  else {

        // tally the votes
        let voteTally = {}
        Object.entries(props.poll.pollThumbs.titles).forEach( entry => {
            let name = props.gamedata.filter( gamedata => gamedata.id === parseInt(entry[0]) )[0].unambiguous_name
            if (entry[1].hasOwnProperty('thumbsup')) {
                let thumbsupVotes = JSON.parse(JSON.stringify(entry[1].thumbsup)).map( vote => vote.user )
                voteTally[name] = thumbsupVotes 
            }
        })

        // sort the tallied votes
        let sortedVoteTally = Object.entries(voteTally).sort( (a,b) => {
            if (a[1].length > b[1].length) {
                return -1
            } else if (a[1].length < b[1].length) {
                return 1
            } else {
                return 0
            }
        })

        // tag each game with a ranking string
        for (let [idx,votes] of sortedVoteTally.entries()) {
            let rankStr = ''
            if (idx === 0) {
                rankStr = '1'
            } else {
                // if the previous vote count equals this one, use the previous rankStr
                if (sortedVoteTally[idx][1].length === sortedVoteTally[idx-1][1].length) {
                    if (!sortedVoteTally[idx-1][2].endsWith('T')) {
                        sortedVoteTally[idx-1][2] += 'T'
                    }
                    rankStr = sortedVoteTally[idx-1][2]
                } else {
                    rankStr = (idx + 1).toString()
                }
            }
            sortedVoteTally[idx].push(rankStr)
        }

        return (
            <div id="poll-info">
                <button className={(props.poll.id !== 'local') ? "fa fa-button poll-info" : null} onClick={showPollInfoModal}><FontAwesomeIcon icon={faInfoCircle}/></button>
                <Modal size="md" show={pollInfoIsOpen} onHide={hidePollInfoModal}>
                    <ModalBody>
                        <h4>{props.poll.name}</h4>
                        <table id="poll-metadata">
                            <tbody>
                                <tr>
                                    <th>ID:</th><td>{props.poll.id}</td>
                                </tr>
                                <tr>
                                    <th>created:</th><td>{epochToLocal(props.poll.id)}</td>
                                </tr>
                                <tr>
                                    <th>updated:</th><td>{epochToLocal(props.poll.updatedAt)}</td>
                                </tr>
                                <tr>
                                    <th>closes:</th><td>{epochToLocal(props.poll.closesAt)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table>
                            <tbody>
                                { sortedVoteTally.map( (game, i) =>
                                    <tr key={i}>
                                        <td>{game[2]}</td>
                                        <td>{game[0]}</td>
                                        <td>
                                            { game[1].map( (vote, j) =>
                                                <span key={j}>{vote}, </span>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </ModalBody>
                    <ModalFooter> 
                        <button className="default-primary-styles" onClick={hidePollInfoModal}>Close</button>
                    </ModalFooter>
                </Modal>
            </div>
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

        let allGameData = [], routed_new_list = [], routed_addto_list = [], routed_pollid = null
        let path = this.props.location.search.slice(1).split('?')

        const stored_user = JSON.parse(localStorage.getItem("user"))
        if (stored_user !== null) {
            this.setState({ user: stored_user })
        }

        const query_strings = (path.length === 1) ? path[0] : path[1] 
        query_strings.split('&').forEach( function(query_string) {
            const qs = query_string.split('=')
            if (qs[0] === 'newlist') {
                qs[1].split('+').forEach( function(game_id) {
                  if (!routed_new_list.includes(parseInt(game_id))) {
                    routed_new_list.push(parseInt(game_id))
                  }
                })
            } else if (qs[0] === 'addtolist') {
                qs[1].split('+').forEach( function(game_id) {
                  if (!routed_addto_list.includes(parseInt(game_id))) {
                    routed_addto_list.push(parseInt(game_id))
                  }
                })
            } else if (qs[0] === 'poll' && !isNaN(parseInt(qs[1]))) {
                routed_pollid = parseInt(qs[1])
            }
        })
        if (routed_pollid !== null) {
            routed_addto_list = [] // ignore addto_list and new_list if poll ID exists
            routed_new_list = []
        } else if (routed_new_list.length && routed_addto_list.length) {
            routed_addto_list = [] // ignore addto_list if new_list exists
        }
        let updated_routedGames = {}
        updated_routedGames['new_list'] = [...routed_new_list]
        updated_routedGames['addto_list'] = [...routed_addto_list]
        updated_routedGames['pollid'] = routed_pollid
        this.setState({ routedGames: updated_routedGames })

        const stored_localGameList = JSON.parse(localStorage.getItem("localGameList"))
        if (stored_localGameList !== null) {
            this.setState({ localGameList: stored_localGameList })
        }

        const stored_activeGameList = JSON.parse(localStorage.getItem("activeGameList"))
        if (stored_activeGameList !== null && routed_new_list.length === 0 && routed_pollid === null) {
            this.setState({ activeGameList: stored_activeGameList })
        } else {
            this.setState({ activeGameList: [] })
        }

        const stored_activePoll = JSON.parse(localStorage.getItem("activePoll"))
        if (stored_activePoll !== null) {
            this.setState({ activePoll: stored_activePoll })
        } else {
            const default_poll = {
                id: 'local',
                name: 'local',
            }
            this.setState({ activePoll: default_poll })
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
        const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0
        const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0
        this.setState({ windowWidth, windowHeight })
    }

    // for disambiguation of titles, the game ID will be put in parentheses when the API does not provide yearpublished info
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
            if (gamedata.hasOwnProperty('unambiguous_name')) {
                const new_cache_info = {
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
        const number = playercount.slice(0, -1)
        if (number <= game.attributes.max_players && number >= game.min_players) {
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
                updated_allThumbs[prevState.activePoll.id] = updated_pollThumbs
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
            updated_allThumbs[prevState.activePoll.id] = updated_pollThumbs
            localStorage.setItem('allThumbs', JSON.stringify(updated_allThumbs))

            return { 
                activeGameList: activeGameList,
                localGameList: localGameList,
                allThumbs: updated_allThumbs,
                activeThumbs: activeThumbs,
            }
        })
    }

    totalTitleVotes(all_title_thumbs, mineOnly, whoAmI) {
        let count = 0
        Object.entries(all_title_thumbs)
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
        if (votingtype === 'title' && this.state.activePoll.id !== 'local') {

            this.voteTitleInPoll(this.state.activePoll.id, votingon, newvote, this.state.user)

        // attribute votes and all non-poll votes are kept on the client (state & local storage)
        } else {

            this.setState(prevState => {
                let updated_activeThumbs = JSON.parse(JSON.stringify(prevState.activeThumbs))
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
                                updated_activeThumbs.titles[votingon.toString()][newvote] = updatedMyTitleVote
                            // toggle the vote on
                            } else {
                                let newUserVote = {
                                    user: prevState.user,
                                    rank: null,
                                }
                                let updatedMyTitleVote = JSON.parse(JSON.stringify(prevState.activeThumbs.titles[votingon.toString()][newvote]))
                                updatedMyTitleVote.push(newUserVote)
                                updated_activeThumbs.titles[votingon.toString()][newvote] = updatedMyTitleVote
                            }
                        // add the first vote as on
                        } else {
                            let newUserVote = {
                                user: prevState.user,
                                rank: null,
                            }
                            updated_activeThumbs.titles[votingon.toString()][newvote] = [newUserVote]
                        }
                    // no voting exists for this title, create it
                    } else {
                        let newVotingOn = {}
                        let newUserVote = {
                            user: prevState.user,
                            rank: 1,
                        }
                        newVotingOn[newvote] = [newUserVote]
                        updated_activeThumbs.titles[votingon.toString()] = newVotingOn
                    }
                // record an attribute vote
                //   ex: votingtype:category votingon:Card Game newvote:thumbsup
                } else {
                    if (updated_activeThumbs.attributes[votingtype].hasOwnProperty(votingon)) {
                        let updated_thisattribute = JSON.parse(JSON.stringify(updated_activeThumbs.attributes[votingtype][votingon]))
                        // clear this user's previous vote on this attribute
                        if (updated_thisattribute.hasOwnProperty(newvote)
                            && updated_thisattribute[newvote].includes(prevState.user)) {
                            let updated_vote = updated_thisattribute[newvote].filter( user => user !== prevState.user )
                            updated_thisattribute[newvote] = updated_vote
                        // add this user's new vote to this attribute
                        } else {
                            let updated_vote = [prevState.user]
                            updated_thisattribute[newvote] = updated_vote
                        }
                        updated_activeThumbs.attributes[votingtype][votingon] = updated_thisattribute
                    } else {
                        // add this user's new vote to this attribute
                        let updated_vote = {}
                        updated_vote[newvote] = [prevState.user]
                        updated_activeThumbs.attributes[votingtype][votingon] = updated_vote
                    }
                }
                const myCountsOnly = (this.state.activePoll.id === 'local') ? true : false;
                updated_activeThumbs.total_title_votes = this.totalTitleVotes(updated_activeThumbs.titles, myCountsOnly, this.state.user)
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

        let wasRouted = false
        if (poll.id === 'local') {
            this.addValidatedGamesWithPollContext(null, poll, null, wasRouted)
        } else {
            let poll_game_ids = Object.keys(poll.pollThumbs.titles).map( title => parseInt(title) )
            let cachedGameTitles = this.getCachedGameTitles()
            let validation_result = await validateUserTitles(cachedGameTitles, poll_game_ids, )
            if ( (this.state.routedGames.hasOwnProperty('new_list') && this.state.routedGames.new_list.length)
              || (this.state.routedGames.hasOwnProperty('pollid') && this.state.routedGames.pollid !== null) ) {
                wasRouted = true
                validation_result['routed_games_treatment'] = 'replace'
            } else if (this.state.routedGames.hasOwnProperty('addto_list') && this.state.routedGames.addto_list.length) {
                wasRouted = true
                validation_result['routed_games_treatment'] = 'append'
            }
            let poll_thumbs = JSON.parse(JSON.stringify(poll.pollThumbs))
            this.addValidatedGamesWithPollContext(validation_result.gameValidations, poll, poll_thumbs, wasRouted)
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
                let updated_activeThumbs = JSON.parse(JSON.stringify(prevState.activeThumbs))
                if (votingtype === 'all_titles') {
                    const myCountsOnly = (this.state.activePoll.id === 'local') ? true : false;
                    updated_activeThumbs.titles = clearVotes
                    updated_activeThumbs.total_title_votes = this.totalTitleVotes(updated_activeThumbs.titles, myCountsOnly, this.state.user)
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
                updated_allThumbs[prevState.activePoll.id] = updated_pollThumbs
                localStorage.setItem('allThumbs', JSON.stringify(updated_allThumbs))

                return { 
                    activeThumbs: updated_activeThumbs,
                    allThumbs: updated_allThumbs,
                }
            })

        }
    }

    addValidatedGames(validation_result) {
        this.addValidatedGamesWithPollContext(validation_result, this.state.activePoll, this.state.allThumbs[this.state.activePoll.id], false)
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
    addValidatedGamesWithPollContext(validation_result, active_poll, poll_thumbs, wasRouted) {

        this.setState(prevState => {

            let updated_activeGameList = [], updated_activeThumbs = {}, updated_localGameList = [...prevState.localGameList]
            let updated_routedGames = { new_list: [], addto_list: [], pollid: null }
            let updated_allGameData = JSON.parse(JSON.stringify(prevState.allGameData))
            let routed_games_treatment = (validation_result !== null) ? validation_result.routed_games_treatment : 'none'
            let updated_active_poll = JSON.parse(JSON.stringify(active_poll))
            let poll_is_changing = (prevState.activePoll.id !== active_poll.id) ? true : false

            // for routed and switching to local, set the poll and active game list to local before the adds happen
            if (routed_games_treatment === 'replace'
              || routed_games_treatment === 'append'
              || (poll_is_changing && active_poll.id === 'local') ) {
                updated_active_poll.id = 'local'
                if (routed_games_treatment === 'replace') {
                    updated_activeGameList = []
                } else {
                    updated_activeGameList = [...prevState.localGameList]
                }
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
                const myCountsOnly = (active_poll === 'local') ? true : false;
                let updatedTitleCount = this.totalTitleVotes(prevState.allThumbs.local, myCountsOnly, this.state.user)
                updated_activeThumbs.total_title_votes = updatedTitleCount
            }

            // now, add the new games
            if (validation_result !== null && (validation_result.new_gamedata_to_activate.length || validation_result.new_gamedata_to_cache)) {

                let now = new Date()

                Object.values(validation_result.new_gamedata_to_activate).forEach(each_newGameData => {
                    let new_gamedata = JSON.parse(JSON.stringify(each_newGameData))
                    new_gamedata["updated_at"] = now.getTime()
                    updated_activeGameList.push(new_gamedata.id)
                    if (active_poll.id === 'local') {
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
                    if (active_poll.id === 'local') {
                        updated_localGameList.push(id_to_activate)
                    }
                })

            }

            // handle the disabling of filtering while a poll is active
            let updated_filterPlayercount, updated_filterTitles, updated_filterWeight
            if (poll_is_changing && active_poll.id !== 'local') {
                updated_filterPlayercount = false
                updated_filterTitles = false
                updated_filterWeight = false
            } else {
                updated_filterPlayercount = JSON.parse(localStorage.getItem("filterPlayercount"))
                updated_filterTitles = JSON.parse(localStorage.getItem("filterTitles"))
                updated_filterWeight = JSON.parse(localStorage.getItem("filterWeight"))
            }

            localStorage.setItem('activeGameList', JSON.stringify(updated_activeGameList))
            localStorage.setItem('localGameList', JSON.stringify(updated_localGameList))
            localStorage.setItem('allGameData', JSON.stringify(updated_allGameData))
            localStorage.setItem('activePoll', JSON.stringify(updated_active_poll))
            localStorage.setItem('activeThumbs', JSON.stringify(updated_activeThumbs))

            return { 
                activePoll: updated_active_poll,
                activeGameList: updated_activeGameList,
                activeThumbs: updated_activeThumbs,
                localGameList: updated_localGameList,
                allGameData: updated_allGameData,
                routedGames: updated_routedGames,
                filterPlayercount: updated_filterPlayercount,
                filterTitles: updated_filterTitles,
                filterWeight: updated_filterWeight,
            }
        })

        if (validation_result !== null && wasRouted) {
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

    handleUserChange(new_username) {
        this.setState(prevState => {
            const myCountsOnly = (this.state.activePoll.id === 'local') ? true : false;
            let updated_activeThumbs = JSON.parse(JSON.stringify(prevState.activeThumbs))
            let updatedTitleCount = this.totalTitleVotes(prevState.activeThumbs.titles, myCountsOnly, new_username)
            updated_activeThumbs.total_title_votes = updatedTitleCount
            localStorage.setItem('user', JSON.stringify(new_username))
            return {
                user: new_username,
                activeThumbs: updated_activeThumbs,
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
                    <PollInfo poll={this.state.activePoll} gamedata={this.state.allGameData} />
                    <Clock poll={this.state.activePoll} />
                </div>
                <ViewControls 
                user={this.state.user}
                activepoll={this.state.activePoll}
                sortby={this.state.sortOrder}
                onsortchange={this.handleSortChange}
                filtertitles={filterTitles}
                filterplayercount={filterPlayercount}
                filterweight={filterWeight}
                onfilterchange={this.handleFilterChange}
                onuserchange={this.handleUserChange} />
            </div>
            <div id="content-wrapper">
                <GameList
                    routedgames={this.state.routedGames}
                    activegamedata={activeGameData} 
                    cachedgametitles={cachedGameTitles}
                    addvalidatedgames={this.addValidatedGames}
                    activethumbs={this.state.activeThumbs} 
                    sortby={this.state.sortOrder}
                    filtertitles={filterTitles}
                    filterplayercount={filterPlayercount}
                    filterweight={filterWeight}
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