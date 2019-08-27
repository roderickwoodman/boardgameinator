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
            sortOrder: 'maxvotes'
        }
        this.tallyPlayerCounts = this.tallyPlayerCounts.bind(this)
        this.tallyWeightCounts = this.tallyWeightCounts.bind(this)
        this.tallyCategoryCounts = this.tallyCategoryCounts.bind(this)
        this.tallyMechanicCounts = this.tallyMechanicCounts.bind(this)
        this.onNewTitle = this.onNewTitle.bind(this)
        this.onNewVote = this.onNewVote.bind(this)
        this.onDeleteTitle = this.onDeleteTitle.bind(this)
        this.onDeleteAllTitles = this.onDeleteAllTitles.bind(this)
        this.onClearSectionVotes = this.onClearSectionVotes.bind(this)
    }

    onNewTitle(newGame) {
        this.setState(prevState => {
            let allGames = prevState.allGames.slice()
            allGames.push(newGame)
            return { allGames }
        })
    }

    onDeleteTitle(event, id) {
        this.setState(prevState => {
            let allGames = prevState.allGames.slice()
            allGames = allGames.filter(game => game.id !== parseInt(id))
            return { allGames }
        })
    }

    onDeleteAllTitles(event) {
        this.setState(prevState => {
            let allGames = []
            return { allGames }
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
                                playercounts={playercounts} 
                                weightcounts={weightcounts}
                                categorycounts={categorycounts} 
                                mechaniccounts={mechaniccounts}
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