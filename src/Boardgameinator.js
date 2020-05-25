import React from 'react'
import PropTypes from 'prop-types'
import { GameList } from './GameList'


export class Boardgameinator extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            allGames: [],
            thumbs: {'players': {}, 'weight': {}, 'category': {}, 'mechanic': {}},
            sortOrder: 'maxvotes'
        }
        this.tallyPlayerCounts = this.tallyPlayerCounts.bind(this)
        this.tallyWeightCounts = this.tallyWeightCounts.bind(this)
        this.tallyCategoryCounts = this.tallyCategoryCounts.bind(this)
        this.tallyMechanicCounts = this.tallyMechanicCounts.bind(this)
        this.gameSupportsPlayercount = this.gameSupportsPlayercount.bind(this)
        this.onNewTitle = this.onNewTitle.bind(this)
        this.onNewVote = this.onNewVote.bind(this)
        this.onDeleteTitle = this.onDeleteTitle.bind(this)
        this.onDeleteAllTitles = this.onDeleteAllTitles.bind(this)
        this.onClearSectionVotes = this.onClearSectionVotes.bind(this)
    }

    gamedataVersion = 1

    componentDidMount() {

        const stored_gamedataVersion = JSON.parse(localStorage.getItem("gamedataVersion"))
        let allGames = []
        if (stored_gamedataVersion === this.gamedataVersion) {
            allGames = JSON.parse(localStorage.getItem("allGames"))
            this.setState({ allGames })
        } else {
            localStorage.setItem('gamedataVersion', JSON.stringify(this.gamedataVersion))
            localStorage.setItem('allGames', JSON.stringify(allGames))
        }

        const stored_thumbs = JSON.parse(localStorage.getItem("thumbs"))
        if (stored_thumbs !== null) {
            this.setState({ thumbs: stored_thumbs })
        }

    }

    onNewTitle(newGame) {
        if (newGame.hasOwnProperty("nameisunique") && newGame["nameisunique"] !== true) {
            let disambiguation = (newGame.yearpublished !== null)
                ? " ("+ newGame.yearpublished + ")"
                : " (#" + newGame.id + ")"
            newGame["disambiguation"] = disambiguation
        }
        this.setState(prevState => {
            let allGames = prevState.allGames.slice()
            allGames.push(newGame)
            localStorage.setItem('allGames', JSON.stringify(allGames))
            return { allGames }
        })
    }

    gameSupportsPlayercount(game, playercount) {
        let number = playercount.slice(0, -1)
        if (number <= game.maxplayers && number >= game.minplayers) {
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
            for (let playercount=game.minplayers; playercount<=game.maxplayers; playercount++) {
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
            if (countsObj.hasOwnProperty(game.averageweightname)) {
                countsObj[game.averageweightname] = countsObj[game.averageweightname] + 1
            } else {
                countsObj[game.averageweightname] = 1
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
        return (
            <React.Fragment>
            <div id="page-wrapper">
                <div id="leftsidebar-wrapper">
                    <div id="page-logo">
                        <h1>Boardgameinator</h1>
                        <p className="subtitle">now ranking <span className="callout">{this.state.allGames.length}</span> board game titles</p>
                    </div>
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
                        playercounts={playercounts} 
                        weightcounts={weightcounts}
                        categorycounts={categorycounts} 
                        mechaniccounts={mechaniccounts} />
                </div>
            </div>
            </React.Fragment>
        )
    }
}

Boardgameinator.propTypes = {
    location: PropTypes.object.isRequired,
}