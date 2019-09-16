import React from 'react'
import PropTypes from 'prop-types'
import { AddedElement } from './AddedElement';


export class AddedList extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            statusMessages: []
        }
    }

    render() {
        let clipboardValue = "" // FIXME: hardcoded for now, but will derive from allGames
        clipboardValue += "Belfort\n"
        clipboardValue += "Cuba Libre\n"
        clipboardValue += "El Grande\n"
        return (
            <React.Fragment>
            <ul id="games-added">
                { this.props.allgames.length >= 0 && (
                    this.props.allgames
                        .sort( (a, b) => (a.name > b.name) ? 1 : -1 )
                        .map(
                            (game, i) =>
                                <AddedElement
                                    key={i}
                                    id={game.id}
                                    name={game.name}
                                    nameisunique={game.nameisunique}
                                    yearpublished={game.yearpublished}
                                    ondelete={this.props.ondelete} />)
                )}
                { this.props.allgames.length === 0 && (
                    <span className="message warning">
                    <li>Please add game titles using the forms in this section.</li>
                    </span>
                )}
            </ul>
            <section id="games-clipboard">
                <form>
                    <textarea rows="8" cols="40" value={clipboardValue} onChange={this.handleChange} placeholder="(exact match only)" required/>
                </form>
            </section>
            </React.Fragment>
        )
    }
}

AddedList.propTypes = {
    allgames: PropTypes.array.isRequired,
    ondelete: PropTypes.func.isRequired,
}