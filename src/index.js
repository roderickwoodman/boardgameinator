import React from 'react';
import { render } from 'react-dom';
import './index.css';
import bggLogo from './bgg-logo-50.png'


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

class MainControls extends React.Component {
    render() {
        return (
            <p>(main controls)</p>
        )
    }
}

class ViewControls extends React.Component {
    render() {
        return (
            <p>(view controls)</p>
        )
    }
}

class Game extends React.Component {

    constructor(props) {
        super(props);
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
        const { id, name, description, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, categories, mechanics } = this.props

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
                        mechanics={mechanics}/>
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

function GameCardFront(props) {
    const { id, name, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, categories, mechanics } = props
    return (
        <section className="cardFront">
            <section className="details major">
                <h2 className="game-name">{name}</h2>
                <h4 className="game-yearpublished">({yearpublished})</h4>
            </section>
            <hr />
            <ul className="details major">
                <li>{minplayers}-{maxplayers} players</li>
                {minplaytime === maxplaytime 
                    ? <li>{minplaytime} minutes</li>
                    : <li>{minplaytime}-{maxplaytime} minutes</li>
                }
            </ul>
            <hr />
            <ul className="details minor">
                {categories.map(value => <li key={value}>{value}</li>)}
            </ul>
            <hr />
            <ul className="details minor">
                {mechanics.map(value => <li key={value}>{value}</li>)}
            </ul>
            <section>
                <GameFooter gameid={id}/>
            </section>

        </section>
    )
}

function GameCardBack(props) {
    const { id, name, yearpublished, description } = props
    return (
        <section className="cardBack">
            <section className="details major">
                <h2 className="game-name">{name}</h2>
                <h4 className="game-yearpublished">({yearpublished})</h4>
            </section>
            <hr />
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

class Boardgameinator extends React.Component {

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
            <React.Fragment>

            <div className="page-wrapper">

                <div className="main-controls">
                    <MainControls />
                </div>

                <div className="result-wrapper">

                    <div className="view-controls">
                        <ViewControls />
                    </div>

                    <div className="resulting-games">
                        {this.state.gameInfo.map(
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
                                    mechanics={game.mechanics} />
                        )}
                    </div>

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
