import React from 'react';
import { render } from 'react-dom';
import './index.css';
import bggLogo from './bgg-logo-50.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'


let gameListDefault = [{
    "id": 0, 
    "name":"(no name info)",
    "description":"(no description)",
    "yearpublished":0,
    "minplayers":0,
    "maxplayers":0,
    "minplaytime":0,
    "maxplaytime":0,
    "categories":null,
    "mechanics":null}
]

function GameFooter(props) {
    return (
        <a href={'https://boardgamegeek.com/boardgame/' + props.gameid } target="_blank" rel="noopener noreferrer">
            <img src={bggLogo} alt="BoardGameGeek website logo" />
        </a>
    )
}

class VotableElement extends React.Component {

    render() {
        let myVote = this.props.preferences.hasOwnProperty(this.props.attrname) 
            ? 'thumbsup' //FIXME, derive from props: this.props.preferences['attrVote']
            : 'novote'
        return (
            <li 
                key={this.props.attrname} 
                className={myVote} 
                data-attrtype={this.props.attrtype}
                data-attrname={this.props.attrname}
                data-newvote='thumbsup'
                onClick={this.props.onnewvote}
            >
                {this.props.attrname} ({this.props.attrcount})
            </li>
        )
    }
}

class VotingBox extends React.Component {

    render() {
        return (
            <React.Fragment>
            <button data-attrtype="all" onClick={this.props.onclearsectionvotes}>CLEAR ALL</button>
            <ul id="supported-players">
                <li><b>PLAYERS:</b><button data-attrtype="players" onClick={this.props.onclearsectionvotes}>clear all</button></li>
                {this.props.playercounts.map((key, index) => {
                    return <VotableElement 
                        key={key.attrName}
                        preferences={this.props.thumbs['players']}
                        attrtype="players" 
                        attrname={key.attrName} 
                        attrcount={key.attrCount} 
                        onnewvote={this.props.onnewvote}/>
                })}
            </ul>
            <ul id="category-counts">
                <li><b>CATEGORY:</b><button data-attrtype="category" onClick={this.props.onclearsectionvotes}>clear all</button></li>
                {this.props.categorycounts.map((key, index) => {
                    return <VotableElement 
                        key={key.attrName}
                        preferences={this.props.thumbs['category']}
                        attrtype="category" 
                        attrname={key.attrName} 
                        attrcount={key.attrCount}
                        onnewvote={this.props.onnewvote}/>
                })}
            </ul>
            <ul id="mechanic-counts">
                <li><b>MECHANIC:</b><button data-attrtype="mechanic" onClick={this.props.onclearsectionvotes}>clear all</button></li>
                {this.props.mechaniccounts.map((key, index) => {
                    return <VotableElement 
                        key={key.attrName}
                        preferences={this.props.thumbs['mechanic']}
                        attrtype="mechanic" 
                        attrname={key.attrName} 
                        attrcount={key.attrCount}
                        onnewvote={this.props.onnewvote}/>
                })}
            </ul>
            </React.Fragment>
        )
    }
}

class GameList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            sortOrder: 'maxvotes',
        }
        this.handleSortChange = this.handleSortChange.bind(this)
        this.getThumbCounts = this.getThumbCounts.bind(this)
    }

    getThumbCounts() {
        // tally all votes for each game
        let counts = {}
        for (const game of this.props.allgames) {
            let defaultCount = 0
            counts[game.name] = defaultCount
            // playercount section of a game gets ONE TOTAL thumbsup if any of its supported playercounts gets a thumbsup
            for (let playercount=game.minplayers; playercount<=game.maxplayers; playercount++) {
                if (this.props.thumbs.players.hasOwnProperty(playercount + 'P')) {
                    counts[game.name]++
                    break
                }
            }
            // categories section of a game gets one thumbsup for each thumbed-up category
            for (const category of game.categories) {
                if (this.props.thumbs.category.hasOwnProperty(category)) {
                    counts[game.name]++
                }
            }
            // mechanics section of a game gets one thumbsup for each thumbed-up mechanic
            for (const mechanic of game.mechanics) {
                if (this.props.thumbs.mechanic.hasOwnProperty(mechanic)) {
                    counts[game.name]++
                }
            }
        }
        return counts
    } 

    handleSortChange(event) {
        this.setState({
            sortOrder: event.target.value
        })
    }

    render() {
        let thumbcounts = this.getThumbCounts()
        return (
            <React.Fragment>
            <div id="view-controls">
            <ViewControls 
                sortby={this.state.sortOrder}
                onChange={this.handleSortChange}/>
            </div>

            <div id="resulting-games">
                {this.props.allgames
                // sort by maxvotes...     FIRST: most votes,        SECOND: shortest playtime
                // sort by maxplaytime...  FIRST: shortest playtime, SECOND: most votes
                // sort by maxplayers...   FIRST: most players,      SECOND: most votes
                .sort((this.state.sortOrder === 'maxvotes') 
                    ? ( (a, b) => (thumbcounts[a.name] < thumbcounts[b.name]) ? 1 : (thumbcounts[a.name] === thumbcounts[b.name]) && (a.maxplaytime > b.maxplaytime) ? 1 : -1 )
                    : ( (this.state.sortOrder === 'maxplaytime') 
                        ? ( (a, b) => (a.maxplaytime > b.maxplaytime) ? 1 : (a.maxplaytime === b.maxplaytime) && (thumbcounts[a.name] < thumbcounts[b.name]) ? 1 : -1 )
                        : ( (a, b) => (a.maxplayers < b.maxplayers) ? 1 : (a.maxplayers === b.maxplayers) && (thumbcounts[a.name] < thumbcounts[b.name]) ? 1 : -1 ) ) )
                .map(
                    (game, i) => 
                        <Game
                            key={i}
                            id={game.id} 
                            name={game.name} 
                            description={game.description} 
                            yearpublished={game.yearpublished} 
                            minplayers={game.minplayers} 
                            maxplayers={game.maxplayers} 
                            minplaytime={game.minplaytime} 
                            maxplaytime={game.maxplaytime}
                            categories={game.categories}
                            mechanics={game.mechanics} 
                            thumbs={this.props.thumbs} 
                            thumbcount={thumbcounts[game.name]}/>
                )}
            </div>
            </React.Fragment>
        )
    }
}

function ViewControls(props) {
    return (
        <div id="sort-controls">
            <div>
                <label>
                    <input type='radio' key='maxplayers' id='maxplayers' name='sortorder' checked={props.sortby==='maxplayers'} value='maxplayers' onChange={props.onChange} /> 
                    sort by player count</label>
                <label>
                    <input type='radio' key='maxplaytime' id='maxplaytime' name='sortorder' checked={props.sortby==='maxplaytime'} value='maxplaytime' onChange={props.onChange} /> 
                    sort by playtime</label>
                <label>
                    <input type='radio' key='maxvotes' id='maxvotes' name='sortorder' checked={props.sortby==='maxvotes'} value='maxvotes' onChange={props.onChange} /> 
                    sort by thumbsup votes</label>
            </div>
        </div>
    )
}

class Game extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            viewingGameCardFront: true
        }
        this.toggleFrontBack = this.toggleFrontBack.bind(this)
    }

    toggleFrontBack() {
        this.setState(prevState => ({
            viewingGameCardFront: !prevState.viewingGameCardFront
        }))
    }

    render() {
        const { id, name, description, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, categories, mechanics, thumbs, thumbcount } = this.props

        return (
            <section className="game">
                <section className="details">
                    <button onClick={this.toggleFrontBack}>more...</button>
                </section>
                { this.state.viewingGameCardFront 
                    ? <GameCardFront 
                        id={id}
                        name={name}
                        yearpublished={yearpublished}
                        minplayers={minplayers}
                        maxplayers={maxplayers}
                        minplaytime={minplaytime}
                        maxplaytime={maxplaytime}
                        categories={categories}
                        mechanics={mechanics}
                        thumbs={thumbs} 
                        thumbcount={thumbcount} />
                    : <GameCardBack 
                        id={id}
                        name={name}
                        yearpublished={yearpublished}
                        description={description}/>
                }
            </section>
        )
    }
}

class GameCardFront extends React.Component {

    constructor(props) {
        super(props)
        this.getMyVote = this.getMyVote.bind(this)
    }

    getMyVote(section, attrName) {
        let myVote = this.props.thumbs[section].hasOwnProperty(attrName) 
            ? 'thumbsup' //FIXME, derive from props: this.props.preferences['attrVote']
            : 'novote'
        return myVote
    }

    // player count section gets only one, aggregated vote; only one <li> (ex: "2-6 players") 
    getAggregatedPlayersVote(minplayers, maxplayers) {
        let yesVotes = 0
        Object.keys(this.props.thumbs.players).forEach( (attrName) => {
            let myplayercount = parseInt(attrName.slice(0, -1))
            if (myplayercount >= minplayers
                && myplayercount <= maxplayers
                && this.props.thumbs.players[attrName] === 'thumbsup')
            {
                yesVotes++
            }
        })
        return (yesVotes > 0) ? "thumbsup" : "novote"
    }

    render() {
        const { id, name, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, categories, mechanics, thumbcount } = this.props
        return (
            <section className="cardFront">
                <section className="details major">
                    <h2 className="game-name">{name}</h2>
                    <h4 className="game-yearpublished">({yearpublished})</h4>
                </section>
                <ul className="summary major">
                    <li><FontAwesomeIcon icon={faThumbsUp} /> : {thumbcount}</li>
                </ul>
                <hr />
                <ul className="details major">
                    <li className={this.getAggregatedPlayersVote(minplayers, maxplayers)}>{minplayers}-{maxplayers} players</li>
                    <li>{minplaytime}-{maxplaytime} minutes</li>
                </ul>
                <hr />
                <ul className="details minor">
                    {categories.map(value => <li key={value} className={this.getMyVote('category', value)}>{value}</li>)}
                </ul>
                <hr />
                <ul className="details minor">
                    {mechanics.map(value => <li key={value} className={this.getMyVote('mechanic', value)}>{value}</li>)}
                </ul>
                <section>
                    <GameFooter gameid={id}/>
                </section>
            </section>
        )
    }
}

function GameCardBack(props) {
    const { id, name, yearpublished, description } = props
    return (
        <section className="cardBack">
            <section className="details major">
                <h2 className="game-name">{name}</h2>
                <h4 className="game-yearpublished">({yearpublished})</h4>
            </section>
            <section className="details minor">
                <p>{description}</p>
            </section>
            <section>
                <GameFooter gameid={id}/>
            </section>
        </section>
    )
}

function extractFromXml(str) {

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

class Boardgameinator extends React.Component {

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
                        .then(text => extractFromXml(text))
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
            thumbs[attrtype][attrname] = newvote
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

render(
    <Boardgameinator games={gameListDefault}/>,
    document.getElementById('root')
)
