import React from 'react'
import { GameList } from './GameList'
import { InputBox } from './InputBox'
import { VotingBox } from './VotingBox'


export class Boardgameinator extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            allGames: [],
            thumbs: {'players': {}, 'weight': {}, 'category': {}, 'mechanic': {}},
            playerCounts: [],
            weightCounts: [],
            categoryCounts: [],
            mechanicCounts: [],
            sortOrder: 'maxvotes'
        }
        this.updateCounts = this.updateCounts.bind(this)
        this.updatePlayerCounts = this.updatePlayerCounts.bind(this)
        this.updateWeightCounts = this.updateWeightCounts.bind(this)
        this.updateCategoryCounts = this.updateCategoryCounts.bind(this)
        this.updateMechanicCounts = this.updateMechanicCounts.bind(this)
        this.onNewTitle = this.onNewTitle.bind(this)
        this.onNewVote = this.onNewVote.bind(this)
        this.onDeleteTitle = this.onDeleteTitle.bind(this)
        this.onDeleteAllTitles = this.onDeleteAllTitles.bind(this)
        this.onClearSectionVotes = this.onClearSectionVotes.bind(this)
    }

    updateCounts() {
        this.updatePlayerCounts()
        this.updateWeightCounts()
        this.updateCategoryCounts()
        this.updateMechanicCounts()
    }

    onNewTitle(newGame) {
        this.setState(prevState => {
            let allGames = prevState.allGames.slice()
            allGames.push(newGame)
            return { allGames }
        })
        this.updateCounts()
    }

    onDeleteTitle(event, id) {
        this.setState(prevState => {
            let allGames = prevState.allGames.slice()
            allGames = allGames.filter(game => game.id !== parseInt(id))
            return { allGames }
        })
        this.updateCounts()
    }

    onDeleteAllTitles(event) {
        this.setState(prevState => {
            let allGames = []
            return { allGames }
        })
        this.updateCounts()
    }

    updatePlayerCounts() {
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
        this.setState({ playerCounts: countsArray })
    }

    updateWeightCounts() {
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
        this.setState({ weightCounts: countsArray })
    }

    updateCategoryCounts() {
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
        this.setState({ categoryCounts: countsArray })
    }

    updateMechanicCounts() {
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
        this.setState({ mechanicCounts: countsArray })
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
            return { thumbs }
        })
    }

    onClearSectionVotes(event) {
        const { attrtype } = Object.assign({}, event.target.dataset)
        const clearVotes = {}
        let sections = []
        if (attrtype === 'all') {
            sections = ['players', 'weight', 'category', 'mechanic']
        } else {
            sections.push(attrtype)
        }
        sections.forEach((section) => {
            this.setState(prevState => {
                let thumbs = Object.assign({}, prevState.thumbs)
                thumbs[section] = clearVotes
                return { thumbs }
            })
        })
    }

    render() {
        return (
            <React.Fragment>
            <div id="page-wrapper">
                <div id="leftsidebar-wrapper">
                    <div id="page-logo">
                        <h1>Boardgameinator</h1>
                        <p className="subtitle">now comparing <span className="callout">{this.state.allGames.length}</span> boardgame titles</p>
                    </div>
                    <div id="main-controls">
                        <div id="gameinput-controls">
                            <InputBox
                                allgames={this.state.allGames}
                                onnewtitle={this.onNewTitle} 
                                ondelete={this.onDeleteTitle}
                                ondeleteall={this.onDeleteAllTitles} />
                        </div>
                        <div id="gamevoting-controls">
                            <VotingBox 
                                thumbs={this.state.thumbs} 
                                playercounts={this.state.playerCounts} 
                                weightcounts={this.state.weightCounts} 
                                categorycounts={this.state.categoryCounts} 
                                mechaniccounts={this.state.mechanicCounts}
                                onnewvote={this.onNewVote}
                                onclearsectionvotes={this.onClearSectionVotes} />
                        </div>
                    </div>
                </div>
                <div id="content-wrapper">
                    <GameList
                        allgames={this.state.allGames} 
                        thumbs={this.state.thumbs} 
                        ondelete={this.onDeleteTitle} />
                </div>
            </div>
            </React.Fragment>
        )
    }
}