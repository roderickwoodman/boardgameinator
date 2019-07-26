import React from 'react';
import { render } from 'react-dom';

let gameList = [
    {"id": 148228, "name":"Splendor", "minplayers":2, "maxplayers":4, "minplaytime":30, "maxplaytime":30},
    {"id": 199478, "name":"Flamme Rouge", "minplayers":2, "maxplayers":4, "minplaytime":30, "maxplaytime":45},
    {"id": 169786, "name":"Scythe", "minplayers":1, "maxplayers":5, "minplaytime":90, "maxplaytime":115},
    {"id": 37904, "name":"Formula D", "minplayers":2, "maxplayers":10, "minplaytime":60, "maxplaytime":60},
    {"id": 180263, "name":"The 7th Continent", "minplayers":1, "maxplayers":4, "minplaytime":5, "maxplaytime":1000}
]

const Game = ({id=-1, name="No Name Provided", minplayers=-1, maxplayers=-1, minplaytime=-1, maxplaytime=-1}) => {
    return (
        <section>
            <h2>{name}</h2>
            <p>players: {minplayers} to {maxplayers}</p>
            <p>time: {minplaytime} to {maxplaytime}</p>
        </section>
    )
}

// conditional rendering
class GameBag extends React.Component {

    static defaultProps = {
        games: [
            {"id": -1, "name": "<DEFAULT>", "minplayers": -1, "maxplayers": -1, "minplaytime": -1, "maxplaytime": -1}
        ]
    }

    state = { 
        open: true,
        data: []
    }

    toggleOpenClosed = () => {
        this.setState(prevState => ({
            open: !prevState.open
        }))
    }

    render() {
        const { games } = this.props
        return (
            <div>
                {games.map(
                    (game, i) => 
                        <Game 
                            key={i}
                            id={game.title} 
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
    <GameBag games={gameList}/>,
    document.getElementById('root')
)
