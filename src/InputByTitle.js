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

    searchApi(title) {
        return 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&exact=1&query=' + this.withoutYear(title).replace(' ', '+')
    }

    withYear(title, year) {
        let printedYear = (year === null) ? "unknown" : year
        return title.replace(/(( +)\((-?)\d{1,4}\))$/, '').concat(' ('+printedYear+')')
    }

    withoutYear(title) {
        return title.replace(/(( +)\((-?)\d{1,4}\))$/, '')
    }

    extractYearFromTitle(title) {
        let date = title.match(/(( +)\((-?)\d{1,4}\))$/)
        if (date !== null) {
            return parseInt(date[0].replace(/[^0-9-]/g, ""))
        } else {
            return null
        }
    }

    async validateUserTitles(userTitles) {
        let messages = []
        let newTextareaValue = ""
        const gamesApiResults = await Promise.all(
            userTitles.map(
                gameTitle =>
                    fetch(this.searchApi(gameTitle))
                        .then(searchResponse => searchResponse.text())
                        .then(searchText => this.extractFromSearchApiXml(searchText))
            ))
        gamesApiResults.forEach( (titleMatches, titleMatchesIdx) => {
            if (titleMatches.length === 0) {
                messages.push('ERROR: "' + this.withoutYear(userTitles[titleMatchesIdx]) + '" was not found in the BGG database')
                newTextareaValue += userTitles[titleMatchesIdx] + '\n'
            } else if (titleMatches.length > 1) {
                let desiredYear = this.extractYearFromTitle(userTitles[titleMatchesIdx])
                let matchedTitleAndYear = titleMatches.filter(ambiguousTitle => ambiguousTitle.yearpublished === desiredYear && desiredYear != null)
                if (matchedTitleAndYear.length) {
                    if (this.ifGameHasBeenAdded(matchedTitleAndYear[0].id)) {
                        messages.push('"' + this.withYear(userTitles[titleMatchesIdx], matchedTitleAndYear[0].yearpublished) + '" was previously added')
                    } else {
                        messages.push('"' + this.withYear(userTitles[titleMatchesIdx], matchedTitleAndYear[0].yearpublished) + '" has now been added')
                        this.props.onnewtitle(matchedTitleAndYear[0].id)
                    }
                } else {
                    messages.push('ERROR: "' + this.withoutYear(userTitles[titleMatchesIdx]) + '" has multiple matches in the BGG database')
                    for (let ambiguousTitle of titleMatches) {
                        let disambiguousTitle = this.withYear(ambiguousTitle.name, ambiguousTitle.yearpublished)
                        newTextareaValue += disambiguousTitle + '\n'
                    }
                }
            } else {
                titleMatches.forEach( (thisVersion) => {
                    if (this.ifGameHasBeenAdded(thisVersion.id)) {
                        messages.push('"' + this.withoutYear(userTitles[titleMatchesIdx]) + '" was previously added')
                    } else {
                        messages.push('"' + this.withoutYear(userTitles[titleMatchesIdx]) + '" has now been added')
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
            if ("name" in game) {
                games.push(game)
            }
            if (!("yearpublished" in game)) {
                game["yearpublished"] = null
            }
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
        let userTitles = this.state.value
            .split("\n")
            .map(str => str.trim())
            .map(str => str.replace(/[^0-9a-zA-Z:()&!–' ]/g, ""))
            .filter( function(e){return e} )
        this.validateUserTitles(Array.from(new Set(userTitles)))
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