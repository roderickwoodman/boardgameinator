import React from 'react'
import PropTypes from 'prop-types'
import purpleMeeple from './purple-meeple-64.png'
import { GameList } from './GameList'
import { gamedataApi } from './Api.js'


export class Boardgameinator extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            allGames: [],
            thumbs: {'players': {}, 'weight': {}, 'category': {}, 'mechanic': {}},
            sortOrder: 'maxvotes',
            windowWidth: 0,
            windowHeight: 0
        }
        this.tallyPlayerCounts = this.tallyPlayerCounts.bind(this)
        this.tallyWeightCounts = this.tallyWeightCounts.bind(this)
        this.tallyCategoryCounts = this.tallyCategoryCounts.bind(this)
        this.tallyMechanicCounts = this.tallyMechanicCounts.bind(this)
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
    }

    gamedataVersion = 1

    componentDidMount() {

        let allGames = []

        let query_strings, new_list = [], addto_list = []
        let path = this.props.location.pathname.slice(1).split('?')
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
        if (number <= game.max_players && number >= game.min_players) {
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

            // remove any votable attributes no longer occurring (in any games) from the preferences list
            let thumbs = Object.assign({}, prevState.thumbs)
            for (let attrName in thumbs) {
                if (attrName === 'players') {
                    for (let votedplayercount in thumbs[attrName]) {
                        let attributeStillOccurs = false
                        for (let game of allGames) {
                            if (this.gameSupportsPlayercount(game, votedplayercount)) {
                                attributeStillOccurs = true
                                break
                            }
                        }
                        if (!attributeStillOccurs) {
                            delete thumbs[attrName][votedplayercount]
                        }
                    }
                } else if (attrName === 'weight') {
                    for (let votedweight in thumbs[attrName]) {
                        let attributeStillOccurs = false
                        for (let game of allGames) {
                            if (game.weight === votedweight) {
                                attributeStillOccurs = true
                                break
                            }
                        }
                        if (!attributeStillOccurs) {
                            delete thumbs[attrName][votedweight]
                        }
                    }
                } else if (attrName === 'category') {
                    for (let votedcategory in thumbs[attrName]) {
                        let attributeStillOccurs = false
                        for (let game of allGames) {
                            for (let category of game.categories) {
                                if (category === votedcategory) {
                                    attributeStillOccurs = true
                                    break
                                }
                            }
                        }
                        if (!attributeStillOccurs) {
                            delete thumbs[attrName][votedcategory]
                        }
                    }
                } else if (attrName === 'mechanic') {
                    for (let votedmechanic in thumbs[attrName]) {
                        let attributeStillOccurs = false
                        for (let game of allGames) {
                            for (let mechanic of game.mechanics) {
                                if (mechanic === votedmechanic) {
                                    attributeStillOccurs = true
                                    break
                                }
                            }
                        }
                        if (!attributeStillOccurs) {
                            delete thumbs[attrName][votedmechanic]
                        }
                    }
                }
            }

            localStorage.setItem('allGames', JSON.stringify(allGames))
            localStorage.setItem('thumbs', JSON.stringify(thumbs))

            // push these changes into 2 state variables
            return { allGames: allGames, thumbs:thumbs }
        })
    }

    onDeleteAllTitles(event) {
        this.setState(prevState => {
            let allGames = []
            let thumbs = {'players': {}, 'weight': {}, 'category': {}, 'mechanic': {}}
            localStorage.setItem('allGames', JSON.stringify(allGames))
            localStorage.setItem('thumbs', JSON.stringify(thumbs))
            return { allGames: allGames, thumbs:thumbs }
        })
    }

    tallyPlayerCounts() {
        // tally each allowable player count occurrence across all games
        let countsObj = {}
        for (const game of this.state.allGames) {
            for (let playercount=game.min_players; playercount<=game.max_players; playercount++) {
                let playerCountAttr = playercount + 'P'
                if (countsObj.hasOwnProperty(playerCountAttr)) {
                    countsObj[playerCountAttr] = countsObj[playerCountAttr] + 1
                } else {
                    countsObj[playerCountAttr] = 1
                }
            }
        }
        // sort each attribute according to total occurrences
        let countsArray = []
        Object.keys(countsObj).forEach((elementTag) => {
            let newCount = {'attrName': elementTag, 'attrCount': countsObj[elementTag]}
            countsArray.push(newCount)
        })
        countsArray.sort((a, b) => (parseInt(a.attrName.slice(0, -1)) < parseInt(b.attrName.slice(0, -1))) ? 1 : -1)
        return countsArray
    }

    tallyWeightCounts() {
        // tally each weight occurrence across all games
        let countsObj = {}
        for (const game of this.state.allGames) {
            if (countsObj.hasOwnProperty(game.average_weight_name)) {
                countsObj[game.average_weight_name] = countsObj[game.average_weight_name] + 1
            } else {
                countsObj[game.average_weight_name] = 1
            }
        }
        // sort weights into a predefined order
        let weights = ["light", "medium light", "medium", "medium heavy", "heavy"]
        let countsArray = []
        for (let weight of weights) {
            if (countsObj.hasOwnProperty(weight)) {
                countsArray.push({'attrName': weight, 'attrCount': countsObj[weight]})
            } else {
                countsArray.push({'attrName': weight, 'attrCount': 0})
            }
        }
        return countsArray
    }

    tallyCategoryCounts() {
        // tally each attribute's occurrence across all games
        let countsObj = {}
        for (const game of this.state.allGames) {
            for (const category of game.categories) {
                if (countsObj.hasOwnProperty(category)) {
                    countsObj[category] = countsObj[category] + 1
                } else {
                    countsObj[category] = 1
                }
            }
        }
        // sort each attribute according to total occurrences
        let countsArray = []
        Object.keys(countsObj).forEach((elementTag) => {
            countsArray.push({'attrName': elementTag, 'attrCount': countsObj[elementTag]})
        })
        countsArray.sort((a, b) => (a.attrCount < b.attrCount) ? 1 : (a.attrCount === b.attrCount) && (a.attrName > b.attrName) ? 1 : -1)
        return countsArray
    }

    tallyMechanicCounts() {
        // tally each attribute's occurrence across all games
        let countsObj = {}
        for (const game of this.state.allGames) {
            for (const mechanic of game.mechanics) {
                if (countsObj.hasOwnProperty(mechanic)) {
                    countsObj[mechanic] = countsObj[mechanic] + 1
                } else {
                    countsObj[mechanic] = 1
                }
            }
        }
        // sort each attribute according to total occurrences
        let countsArray = []
        Object.keys(countsObj).forEach((elementTag) => {
            countsArray.push({'attrName': elementTag, 'attrCount': countsObj[elementTag]})
        })
        countsArray.sort((a, b) => (a.attrCount < b.attrCount) ? 1 : (a.attrCount === b.attrCount) && (a.attrName > b.attrName) ? 1 : -1)
        return countsArray
    }

    totalAttributeVotes() {
        let count = 0
        Object.entries(this.state.thumbs)
            .forEach( function(category) {
                count += Object.values(category[1]).filter( attr => attr === 'thumbsup').length
            })
        return  count
    }

    onNewVote(event) {
        const { attrtype, attrname, newvote } = Object.assign({}, event.target.dataset)
        this.setState(prevState => {
            let thumbs = Object.assign({}, prevState.thumbs)
            let oldvote = prevState.thumbs[attrtype][attrname]
            if (newvote !== oldvote) {
                thumbs[attrtype][attrname] = newvote
            } else {
                delete(thumbs[attrtype][attrname])
            }
            localStorage.setItem('thumbs', JSON.stringify(thumbs))
            return { thumbs }
        })
    }

    onClearSectionVotes(event) {
        const { attrtype } = Object.assign({}, event.target.dataset)
        const clearVotes = {}
        this.setState(prevState => {
            let thumbs = Object.assign({}, prevState.thumbs)
            if (attrtype === 'all') {
                thumbs['players'] = clearVotes
                thumbs['weight'] = clearVotes
                thumbs['category'] = clearVotes
                thumbs['mechanic'] = clearVotes
            } else {
                thumbs[attrtype] = clearVotes
            }
            localStorage.setItem('thumbs', JSON.stringify(thumbs))
            return { thumbs: thumbs }
        })
    }

    render() {
        let playercounts = this.tallyPlayerCounts()
        let weightcounts = this.tallyWeightCounts()
        let categorycounts = this.tallyCategoryCounts()
        let mechaniccounts = this.tallyMechanicCounts()
        let totalattributevotes = this.totalAttributeVotes()

        const { windowWidth } = this.state
        const styles = {
            reallyNarrow: windowWidth < 650
        }

        return (
            <React.Fragment>
            <div id="page-wrapper">
                <div id="content-wrapper">
                    <div id="page-logo">
                        <img src={purpleMeeple} alt="Boardgameinator logo" />
                        <h1>Boardgameinator</h1>
                        {/* <p className="subtitle">now ranking <span className="callout">{this.state.allGames.length}</span> board game titles</p> */}
                    </div>
                    <GameList
                        allgames={this.state.allGames} 
                        onnewtitle={this.onNewTitle}
                        thumbs={this.state.thumbs} 
                        ondelete={this.onDeleteTitle}
                        ondeleteall={this.onDeleteAllTitles}
                        onnewvote={this.onNewVote}
                        onclearsectionvotes={this.onClearSectionVotes}
                        playercounts={playercounts} 
                        weightcounts={weightcounts}
                        categorycounts={categorycounts} 
                        mechaniccounts={mechaniccounts}
                        totalattributevotes={totalattributevotes}
                        reallynarrow={styles.reallyNarrow} />
                </div>
            </div>
            </React.Fragment>
        )
    }
}

Boardgameinator.propTypes = {
    location: PropTypes.object.isRequired,
}