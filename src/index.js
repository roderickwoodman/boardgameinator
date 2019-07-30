import React from 'react';
import { render } from 'react-dom';
import './index.css';

// let gameListStatic = [
//     {"id": 148228, "name":"Splendor", "minplayers":2, "maxplayers":4, "minplaytime":30, "maxplaytime":30},
//     {"id": 199478, "name":"Flamme Rouge", "minplayers":2, "maxplayers":4, "minplaytime":30, "maxplaytime":45},
//     {"id": 169786, "name":"Scythe", "minplayers":1, "maxplayers":5, "minplaytime":90, "maxplaytime":115},
//     {"id": 37904, "name":"Formula D", "minplayers":2, "maxplayers":10, "minplaytime":60, "maxplaytime":60},
//     {"id": 180263, "name":"The 7th Continent", "minplayers":1, "maxplayers":4, "minplaytime":5, "maxplaytime":1000}
// ]

let gameListApi = [
    {"id": 0, "name":"(no API data)", "minplayers":0, "maxplayers":0, "minplaytime":0, "maxplaytime":0}
]

const Game = ({id=-1, name="No Name Provided", minplayers=-1, maxplayers=-1, minplaytime=-1, maxplaytime=-1}) => {
    return (
        <section className="game">
            <h2>{name}</h2>
            <p>{minplayers}-{maxplayers} players</p>
            {minplaytime === maxplaytime 
            ? <p>{minplaytime} minutes</p>
            : <p>{minplaytime}-{maxplaytime} minutes</p>
            }
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
                if (node.tagName === "minplaytime") {
                    game['minplaytime'] = node.getAttribute("value")
                }
                if (node.tagName === "maxplaytime") {
                    game['maxplaytime'] = node.getAttribute("value")
                }
                if ( (node.tagName === "link")
                    && (node.getAttribute("type") === "boardgamecategory") ) {
                    if (game.hasOwnProperty('boardgamecategory')) {
                        game['boardgamecategory'].push(node.getAttribute("value"))
                    } else {
                        game['boardgamecategory'] = new Array(node.getAttribute("value"))
                    }
                }
            }
        }
    )
    //console.log('game: ', game)
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
        //console.log("The component is now mounted")

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
        const { games } = this.props
        return (
            <div className="gamebag">
                {games.map(
                    (game, i) => 
                        <Game
                            key={i}
                            id={game.id} 
                            name={game.name} 
                            minplayers={game.minplayers} 
                            maxplayers={game.maxplayers} 
                            minplaytime={game.minplaytime} 
                            maxplaytime={game.maxplaytime} />
                )}
            </div>
        )
    }
}

render(
    <GameShelf games={gameListApi}/>,
    document.getElementById('root')
)
