import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'
import { faClipboard } from '@fortawesome/free-solid-svg-icons'


export class VoteTitles extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            statusMessages: []
        }
        this.handleCopyToClipboard = this.handleCopyToClipboard.bind(this)
    }

    handleCopyToClipboard(event) {
        let games = ""
        this.props.allgames.forEach((game) => {
            games += game.name.concat((game.hasOwnProperty("name_is_unique") && game["name_is_unique"] === false) ? game["disambiguation"] : "").concat("\n")
        })
        let messages = []
        let clipboardElement = document.getElementById("games-clipboard")
        clipboardElement.value = games
        clipboardElement.select()
        document.execCommand("copy")
        let numgames = document.getElementById("games-clipboard").value.split("\n").length - 1
        messages.push("Copied " + numgames + " games to clipboard")
        this.setState({ statusMessages: messages })
    }

    render() {
        let clipboardValue = ""
        let inlineStyle = {
            position: "absolute",
            left: "-1000px",
            top: "-1000px"
        }
        return (
            <React.Fragment>
            <h4>Upvote board game titles:</h4>
            <ul id="games-added">
            <li><button className="fa fa-button default-secondary-styles"><FontAwesomeIcon icon={faClipboard} onClick={this.handleCopyToClipboard} disabled={!this.props.allgames.length} /></button></li>
                { this.props.allgames.length >= 0 && (
                    this.props.allgames
                        .sort( (a, b) => (a.name + a.disambiguation > b.name + b.disambiguation) ? 1 : -1 )
                        .map(
                            (game, i) =>
                                <li key={i}>
                                    {game.name.concat((game.hasOwnProperty("name_is_unique") && game["name_is_unique"] === false) ? game["disambiguation"] : "")}
                                </li>
                ))}
                { this.props.allgames.length === 0 && (
                    <span className="message warning">
                    <li>No games have been added yet. Please close this window and then click the "Add" button.</li>
                    </span>
                )}
            </ul>
            <section>
                <form>
                    <textarea id="games-clipboard" style={inlineStyle} defaultValue={clipboardValue}></textarea>
                </form>
            </section>
            <div className="status-messages">
                { this.state.statusMessages
                    .map(
                        (message, i) => {
                            return (message.toLowerCase().startsWith("error"))
                            ? <p key={i} className="message error">{message}</p>
                            : <p key={i} className="message"><FontAwesomeIcon icon={faLongArrowAltRight} /> {message}</p>
                        }
                    )
                }
            </div>
            </React.Fragment>
        )
    }
}

VoteTitles.propTypes = {
    allgames: PropTypes.array.isRequired,
    ondelete: PropTypes.func.isRequired,
}