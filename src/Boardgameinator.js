import React from 'react'
import { GameList } from './GameList'
import { VotingBox } from './VotingBox'

// let gameIds = [148228, 199478, 169786, 37904, 180263]
let defaultUrls = [
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=221194',
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=167791',
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=124361',
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=193738',
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=50750',
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=158899',
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=11',
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=192291',
]

export class Boardgameinator extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            allGames: [],
            thumbs: {'players': {}, 'category': {}, 'mechanic': {}},
            playerCounts: [],
            categoryCounts: [],
            mechanicCounts: [],
            sortOrder: 'maxplayers'
        }
        this.extractFromXml = this.extractFromXml.bind(this)
        this.updatePlayerCounts = this.updatePlayerCounts.bind(this)
        this.updateCategoryCounts = this.updateCategoryCounts.bind(this)
        this.updateMechanicCounts = this.updateMechanicCounts.bind(this)
        this.onNewVote = this.onNewVote.bind(this)
        this.onClearSectionVotes = this.onClearSectionVotes.bind(this)
    }

    async componentDidMount() {
        const gameInfoJsonArray = await Promise.all(
            defaultUrls.map(
                url =>
                    fetch(url)
                        .then(response => response.text())
                        .then(text => this.extractFromXml(text))
                    ))
        this.setState({ allGames: gameInfoJsonArray })
        this.updatePlayerCounts()
        this.updateCategoryCounts()
        this.updateMechanicCounts()
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
            sections = ['players', 'category', 'mechanic']
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

    extractFromXml(str) {

        let game = {}
        let responseDoc = new DOMParser().parseFromString(str, 'application/xml')
        let gamesHtmlCollection = responseDoc.getElementsByTagName("item")
        game['id'] = gamesHtmlCollection[0].id
    
        gamesHtmlCollection[0].childNodes.forEach(
            function (node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if ( (node.tagName === "name") && (node.getAttribute("type") === "primary") ) {
                        game['name'] = node.getAttribute("value")
                    }
                    if (node.tagName === "description") {
                        game['description'] = node.innerHTML
                    }
                    if (node.tagName === "yearpublished") {
                        game['yearpublished'] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "minplayers") {
                        game['minplayers'] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "maxplayers") {
                        game['maxplayers'] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "minplaytime") {
                        game['minplaytime'] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "maxplaytime") {
                        game['maxplaytime'] = parseInt(node.getAttribute("value"))
                    }
                    if ( (node.tagName === "link")
                        && (node.getAttribute("type") === "boardgamecategory") ) {
                        if (game.hasOwnProperty('categories')) {
                            game['categories'].push(node.getAttribute("value"))
                        } else {
                            game['categories'] = new Array(node.getAttribute("value"))
                        }
                    }
                    if ( (node.tagName === "link")
                        && (node.getAttribute("type") === "boardgamemechanic") ) {
                        if (game.hasOwnProperty('mechanics')) {
                            game['mechanics'].push(node.getAttribute("value"))
                        } else {
                            game['mechanics'] = new Array(node.getAttribute("value"))
                        }
                    }
                }
            }
        )
        return game
    }

    render() {
        return (
            <React.Fragment>
            <div id="page-wrapper">

                <div id="leftsidebar-wrapper">
                    <div id="page-logo">
                        <h1>Boardgameinator</h1>
                    </div>
                    <div id="main-controls">
                        <VotingBox 
                            thumbs={this.state.thumbs} 
                            playercounts={this.state.playerCounts} 
                            categorycounts={this.state.categoryCounts} 
                            mechaniccounts={this.state.mechanicCounts}
                            onnewvote={this.onNewVote}
                            onclearsectionvotes={this.onClearSectionVotes} />
                    </div>
                </div>

                <div id="content-wrapper">
                    <GameList
                        allgames={this.state.allGames} 
                        thumbs={this.state.thumbs} />
                </div>

            </div>
            </React.Fragment>
        )
    }
}