import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'


export class InputByTitle extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            value: '',
            statusMessages: []
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleReset = this.handleReset.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.searchApi = this.searchApi.bind(this)
        this.validateUserTitles = this.validateUserTitles.bind(this)
    }

    searchApi(gameTitle) {
        return 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&exact=1&query=' + gameTitle.replace(' ', '+')
    }

    async validateUserTitles(gameTitles) {
        let messages = []
        let newTextareaValue = ""
        const gamesApiResults = await Promise.all(
            gameTitles.map(
                gameTitle =>
                    fetch(this.searchApi(gameTitle))
                        .then(searchResponse => searchResponse.text())
                        .then(searchText => this.extractFromSearchApiXml(searchText))
            ))
        gamesApiResults.forEach( (titleMatches, titleMatchesIdx) => {
            if (titleMatches.length === 0) {
                messages.push('ERROR: "' + gameTitles[titleMatchesIdx] + '" was not found in the BGG database')
                newTextareaValue += gameTitles[titleMatchesIdx] + '\n'
            } else if (titleMatches.length > 1) {
                messages.push('ERROR: "' + gameTitles[titleMatchesIdx] + '" has multiple matches in the BGG database')
                newTextareaValue += gameTitles[titleMatchesIdx] + '\n'
            } else {
                titleMatches.forEach( (thisVersion) => {
                    if (this.ifGameHasBeenAdded(thisVersion.id)) {
                        messages.push('"' + gameTitles[titleMatchesIdx] + '" was previously added')
                    } else {
                        messages.push('"' + gameTitles[titleMatchesIdx] + '" has now been added')
                        this.props.onnewtitle(thisVersion.id)
                    }
                })
            }
        })
        this.setState({ value: newTextareaValue })
        this.setState({ statusMessages: messages })
    }

    extractFromSearchApiXml(str) {
        let games = []
        let responseDoc = new DOMParser().parseFromString(str, 'application/xml')
        let gamesHtmlCollection = responseDoc.getElementsByTagName("item")
        for (let matchedGame of gamesHtmlCollection) {
            let game = {}
            game['id'] = parseInt(matchedGame.id)
            matchedGame.childNodes.forEach(
                function (node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ( (node.tagName === "name") && (node.getAttribute("type") === "primary") ) {
                            game['name'] = node.getAttribute("value")
                        }
                        if (node.tagName === "yearpublished") {
                            game['yearpublished'] = parseInt(node.getAttribute("value"))
                        }
                    }
                }
            )
            games.push(game)
        }
        return games
    }

    ifGameHasBeenAdded(gameId) {
        for (let game of this.props.allgames) {
            if (game.id === parseInt(gameId)) {
                return true
            }
        }
        return false
    }

    handleChange(event) {
        this.setState({value: event.target.value})
    }

    handleReset(event) {
        this.setState({value: ""})
    }

    handleSubmit(event) {
        event.preventDefault()
        let gameTitlesArray = this.state.value
            .split("\n")
            .map(str => str.trim())
            .map(str => str.replace(/[^a-zA-Z:()&!–' ]/g, ""))
            .filter( function(e){return e} )
        this.validateUserTitles(gameTitlesArray)
    }

    render() {
        return (
            <section id="input-by-title">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label htmlFor="titles-input">Game Title(s):</label>
                    <textarea rows="8" cols="40" value={this.state.value} onChange={this.handleChange} placeholder="(exact match only)" required/>
                    <input type="reset" value="Reset" />
                    <input type="submit" value="Submit" />
                </form>
                <div className="status-messages">
                    { this.state.statusMessages
                        .map(
                            (message, i) => {
                                return (message.toLowerCase().startsWith('error'))
                                ? <p key={i} className="message error">{message}</p>
                                : <p key={i} className="message"><FontAwesomeIcon icon={faLongArrowAltRight} /> {message}</p>
                            }
                        )
                    }
                </div>
            </section>
        )
    }
}