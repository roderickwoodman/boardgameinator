import React from 'react';
import { render } from 'react-dom';
import './index.css';
import bggLogo from './bgg-logo-50.png'

// let gameListStatic = [
//     {"id": 148228, "name":"Splendor", "minplayers":2, "maxplayers":4, "minplaytime":30, "maxplaytime":30},
//     {"id": 199478, "name":"Flamme Rouge", "minplayers":2, "maxplayers":4, "minplaytime":30, "maxplaytime":45},
//     {"id": 169786, "name":"Scythe", "minplayers":1, "maxplayers":5, "minplaytime":90, "maxplaytime":115},
//     {"id": 37904, "name":"Formula D", "minplayers":2, "maxplayers":10, "minplaytime":60, "maxplaytime":60},
//     {"id": 180263, "name":"The 7th Continent", "minplayers":1, "maxplayers":4, "minplaytime":5, "maxplaytime":1000}
// ]

let gameListApi = [
    {"id": 0, "name":"(no API data)", "minplayers":0, "maxplayers":0, "minplaytime":0, "maxplaytime":0, "categories":null, "mechanics":null}
]

class GameFooter extends React.Component {

    state = { 
        gameid: -1
    }

    componentDidMount() {
        this.setState({ gameid: this.props.gameid})
    }

    render() {
        return (
            <a href={'https://boardgamegeek.com/boardgame/' + this.state.gameid } target="_blank" rel="noopener noreferrer">
                <img src={bggLogo} alt="BoardGameGeek website logo" />
            </a>
        )
    }
}

const Game = ({id=-1, name="No Name Provided", minplayers=-1, maxplayers=-1, minplaytime=-1, maxplaytime=-1, categories=null, mechanics=null}) => {
    return (
        <section className="game">
            <h2>{name}</h2>
            <hr />
            <section className="majordetails">
                <p>{minplayers}-{maxplayers} players</p>
                {minplaytime === maxplaytime 
                    ? <p>{minplaytime} minutes</p>
                    : <p>{minplaytime}-{maxplaytime} minutes</p>
                }
            </section>
            <hr />
            <section className="minordetails">
                {categories.map( (value, index) => <p>{value}</p>)}
            </section>
            <hr />
            <section className="minordetails">
                {mechanics.map( (value, index) => <p>{value}</p>)}
            </section>
            <section>
                {/* <a href="https://boardgamegeek.com/boardgame/{ id }"><img alt="BoardGameGeek website logo" src="/bgg-icon.png" /></a> */}
                {/* <img alt="BoardGameGeek website logo" src="/bgg-logo.png" /> */}
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
                if (node.tagName === "yearpublished") {
                    game['yearpublished'] = node.getAttribute("value")
                }
                if (node.tagName === "minplayers") {
                    game['minplayers'] = node.getAttribute("value")
                }
                if (node.tagName === "maxplayers") {
                    game['maxplayers'] = node.getAttribute("value")
                }
                if (node.tagName === "minplaytime") {
                    game['minplaytime'] = node.getAttribute("value")
                }
                if (node.tagName === "maxplaytime") {
                    game['maxplaytime'] = node.getAttribute("value")
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

let urls = [
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=31260',
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=5',
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=205637'

    // 'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=148228',
    // 'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=199478',
    // 'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=169786',
    // 'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=37904',
    // 'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=180263'
]

class GameShelf extends React.Component {

    state = { 
        gameInfo: [],
        loading: true
    }

    async componentDidMount() {
        const gameInfoJsonArray = await Promise.all(
            urls.map(
                url =>
                    fetch(url)
                        .then(response => response.text())
                        .then(text => extractFromXml(text))
                    ))
        this.setState({ gameInfo: gameInfoJsonArray, loading: false })
    }

    componentDidUpdate() {
        //console.log("The component just updated")
    }

    render() {
        return (
            <div className="gamebag">
                {this.state.gameInfo.map(
                    (game, i) => 
                        <Game
                            key={i}
                            id={game.id} 
                            name={game.name} 
                            minplayers={game.minplayers} 
                            maxplayers={game.maxplayers} 
                            minplaytime={game.minplaytime} 
                            maxplaytime={game.maxplaytime}
                            categories={game.categories}
                            mechanics={game.mechanics} />
                )}
            </div>
        )
    }
}

render(
    <GameShelf games={gameListApi}/>,
    document.getElementById('root')
)
