import React from 'react'
import PropTypes from 'prop-types'
import { AddedElement } from './AddedElement';


export class AddedList extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            statusMessages: []
        }
        this.handleCopyToClipboard = this.handleCopyToClipboard.bind(this)
    }

    handleCopyToClipboard(event) {
        document.getElementById("games-clipboard").select()
        document.execCommand("copy")
    }

    render() {
        let clipboardValue = ""
        this.props.allgames.forEach((game) => {
            clipboardValue += game.name.concat((game.hasOwnProperty("nameisunique") && game["nameisunique"] === false) ? game["disambiguation"] : "").concat("\n")
        })
        let inlineStyle = {
            // display: 'none'
            position: "absolute",
            left: "-1000px",
            top: "-1000px"
        }
        return (
            <React.Fragment>
            <ul id="games-added">
            <li><b>ADDED GAMES:</b><button onClick={this.handleCopyToClipboard}>copy to clipboard</button></li>
                { this.props.allgames.length >= 0 && (
                    this.props.allgames
                        .sort( (a, b) => (a.name > b.name) ? 1 : -1 )
                        .map(
                            (game, i) =>
                                <AddedElement
                                    key={i}
                                    id={game.id}
                                    name={game.name.concat((game.hasOwnProperty("nameisunique") && game["nameisunique"] === false) ? game["disambiguation"] : "")}
                                    yearpublished={game.yearpublished}
                                    ondelete={this.props.ondelete} />)
                )}
                { this.props.allgames.length === 0 && (
                    <span className="message warning">
                    <li>Please add game titles using the forms in this section.</li>
                    </span>
                )}
            </ul>
            <section>
                <form>
                    <textarea id="games-clipboard" style={inlineStyle} defaultValue={clipboardValue}></textarea>
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