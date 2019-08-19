import React from 'react'
import { AddedElement } from './AddedElement';


export class AddedList extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            statusMessages: []
        }
    }

    render() {
        return (
            <ul id="games-added">
                <button onClick={this.props.ondeleteall}>REMOVE ALL GAMES</button>
                { this.props.allgames.length >= 0 && (
                    this.props.allgames
                        .sort( (a, b) => (a.name > b.name) ? 1 : -1 )
                        .map(
                            (game, i) =>
                                <AddedElement
                                    key={i}
                                    id={game.id}
                                    name={game.name}
                                    yearpublished={game.yearpublished}
                                    ondelete={this.props.ondelete} />)
                )}
                { this.props.allgames.length === 0 && (
                    <span className="message warning">
                    <li>Please add game titles using the forms in this section.</li>
                    </span>
                )}
            </ul>
        )
    }
}