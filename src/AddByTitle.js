import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'


export class AddByTitle extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            value: '',
            statusMessages: []
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleReset = this.handleReset.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.exactSearchApi = this.exactSearchApi.bind(this)
        this.searchApi = this.searchApi.bind(this)
        this.validateUserTitles = this.validateUserTitles.bind(this)
    }

    exactSearchApi(title) {
        return 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&exact=1&query=' + this.withoutYear(title).replace(' ', '+')
    }

    searchApi(title) {
        return 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&query=' + this.withoutYear(title).replace(' ', '+')
    }

    withYear(title, year, id) {
        let printedYear = (year === null) ? '#'+id : year
        return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '').concat(' ('+printedYear+')')
    }

    withoutYear(title) {
        return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '')
    }

    // for disambiguation of titles, the game ID will be put in parentheses when the API does not provide yearpublished info
    extractYearFromTitle(title) {
        let matchesDate = title.match(/(( +)\((-?)\d{1,4}\))$/)
        if (matchesDate !== null) {
            return matchesDate[0].replace(/[^0-9-]/g, "")
        } else {
            let matchesId = title.match(/(( +)\(#\d{1,6}\))$/)
            if (matchesId !== null) {
                return matchesId[0].replace(/[^#0-9-]/g, "")
            } else {
                return null
            }
        }
    }

    async validateUserTitles(userTitles) {
        let messages = []
        let newTextareaValue = ""
        // search for an exact title match (BGG API)
        const exactSearchApiResults = await Promise.all(
            userTitles.map(
                gameTitle =>
                    fetch(this.exactSearchApi(gameTitle))
                        .then(exactSearchResponse => exactSearchResponse.text())
                        .then(exactSearchText => this.parseSearchApiXml(exactSearchText))
            ))
        // if necessary, do a non-exact title match (BGG API)
        const searchApiResults = await Promise.all(
            exactSearchApiResults.map(
                (exactSearchApiResult, idx) => {
                    if (Object.entries(exactSearchApiResult).length !== 0) {
                        return exactSearchApiResult
                    } else {
                        return (
                            fetch(this.searchApi(userTitles[idx]))
                                .then(searchResponse => searchResponse.text())
                                .then(searchText => this.parseSearchApiXml(searchText))
                        )
                    }
                }
            ))
        // for each title match result returned, tag with release date if needed to remove ambiguity OR pull game data (BGG API)
        searchApiResults.forEach( (titleMatches, titleMatchesIdx) => {
            if (titleMatches.length === 0) {
                messages.push('ERROR: "' + this.withoutYear(userTitles[titleMatchesIdx]) + '" was not found in the BGG database')
                newTextareaValue += userTitles[titleMatchesIdx] + '\n'
            } else if (titleMatches.length > 1) {
                let desiredYear = this.extractYearFromTitle(userTitles[titleMatchesIdx])
                let yearMatches = titleMatches
                    .filter(ambiguousTitle => 
                        desiredYear != null
                        && ( (desiredYear.startsWith('#') && ambiguousTitle.id === parseInt(desiredYear.substr(1)))
                            || ambiguousTitle.yearpublished === parseInt(desiredYear) ))
                if (yearMatches.length) {
                    if (this.ifGameHasBeenAdded(yearMatches[0].id)) {
                        messages.push('"' + this.withYear(userTitles[titleMatchesIdx], yearMatches[0].yearpublished, yearMatches[0].id) + '" was previously added')
                    } else {
                        this.props.dogamedataapi(yearMatches[0].id)
                            .then(response => response.text())
                            .then(text => this.props.parsegamedataxml(text))
                            .then(json => {
                                if (json.hasOwnProperty('id')) {
                                    if (desiredYear !== null) {
                                        messages.push('"' + this.withYear(yearMatches[0].name, yearMatches[0].yearpublished, yearMatches[0].id) + '" has now been added')
                                    } else {
                                        messages.push('"' + this.withoutYear(yearMatches[0].name) + '" has now been added')
                                    }
                                    json["nameisunique"] = false
                                    this.props.onnewtitle(json)
                                } else {
                                    messages.push('ERROR: "' + this.withoutYear(yearMatches[0].name) + '" is not producing data from the BGG API, so deleting it from your input')
                                }
                            })
                    }
                } else {
                    messages.push('ERROR: "' + this.withoutYear(userTitles[titleMatchesIdx]) + '" has multiple matches in the BGG database')
                    for (let ambiguousTitle of titleMatches) {
                        let disambiguousTitle = this.withYear(ambiguousTitle.name, ambiguousTitle.yearpublished, ambiguousTitle.id)
                        newTextareaValue += disambiguousTitle + '\n'
                    }
                }
            } else {
                if (this.ifGameHasBeenAdded(titleMatches[0].id)) {
                    messages.push('"' + this.withYear(titleMatches[0].name) + '" was previously added')
                } else {
                    this.props.dogamedataapi(titleMatches[0].id)
                        .then(response => response.text())
                        .then(text => this.props.parsegamedataxml(text))
                        .then(json => {
                            if (json.hasOwnProperty('id')) {
                                messages.push('"' + this.withoutYear(titleMatches[0].name) + '" has now been added')
                                json["nameisunique"] = true
                                this.props.onnewtitle(json)
                            } else {
                                messages.push('ERROR: "' + this.withoutYear(titleMatches[0].name) + '" is not producing data from the BGG API, so deleting it from your input')
                                newTextareaValue += ''
                            }
                        })
                }
            }
        })
        this.setState({ value: newTextareaValue })
        this.setState({ statusMessages: messages })
    }

    parseSearchApiXml(str) {
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
                            game["name"] = node.getAttribute("value")
                        }
                        if (node.tagName === "yearpublished") {
                            game["yearpublished"] = parseInt(node.getAttribute("value"))
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
        let delimiter, num_nonblank_lines = this.state.value.split(/\r\n|\r|\n/).filter(line => line !== '').length
        if (num_nonblank_lines > 1) {
            delimiter = '\n'
        } else {
            delimiter = ','
        }
        let userTitles = this.state.value
            .split(delimiter)
            .map(str => str.trim())
            .map(str => str.replace(/[^0-9a-zA-Z:()&!–#' ]/g, ""))
            .filter( function(e){return e} )
        this.validateUserTitles(Array.from(new Set(userTitles)))
    }

    render() {
        return (
            <section id="input-by-title">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label htmlFor="titles-input">Game Title(s):</label>
                    <textarea rows="8" cols="40" value={this.state.value} onChange={this.handleChange} placeholder="(exact match only)" required/>
                    <section className="buttonrow">
                        <button type="reset" class="default-styles">Reset</button>
                        <button type="submit" class="default-styles">Submit</button>
                    </section>
                </form>
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
            </section>
        )
    }
}

AddByTitle.propTypes = {
    allgames: PropTypes.array.isRequired,
    onnewtitle: PropTypes.func.isRequired,
    dogamedataapi: PropTypes.func.isRequired,
}