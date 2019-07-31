import React from 'react';
import { render } from 'react-dom';
import './index.css';
import bggLogo from './bgg-logo-50.png'


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

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            viewingCardBack: false
        }
    }

    render() {
        const { id, name, minplayers, maxplayers, minplaytime, maxplaytime, categories, mechanics } = this.props

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
                    <GameFooter gameid={id}/>
                </section>
            </section>
        )
    }
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

// let gameIds = [148228, 199478, 169786, 37904, 180263]
let urls = [
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=31260',
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=5',
    'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=205637'
]

class GameBag extends React.Component {

    constructor(props) {
        super(props);
        this.state = { 
            gameInfo: [],
        }
    }

    async componentDidMount() {
        const gameInfoJsonArray = await Promise.all(
            urls.map(
                url =>
                    fetch(url)
                        .then(response => response.text())
                        .then(text => extractFromXml(text))
                    ))
        this.setState({ gameInfo: gameInfoJsonArray })
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
    <GameBag games={gameListApi}/>,
    document.getElementById('root')
)
