import React from 'react'
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
        this.parseIntoParagraphs = this.parseIntoParagraphs.bind(this)
        this.parseGamedataApiXml = this.parseGamedataApiXml.bind(this)
    }

    exactSearchApi(title) {
        return 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&exact=1&query=' + this.withoutYear(title).replace(' ', '+')
    }

    searchApi(title) {
        return 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&query=' + this.withoutYear(title).replace(' ', '+')
    }

    gamedataApi(gameId) {
        return 'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&stats=1&ratingcomments=1&id=' + gameId
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
                        messages.push('"' + this.withYear(userTitles[titleMatchesIdx], yearMatches[0].yearpublished, yearMatches[0].id) + '" has now been added')
                        fetch(this.gamedataApi(yearMatches[0].id))
                            .then(response => response.text())
                            .then(text => this.parseGamedataApiXml(text))
                            .then(json => {
                                if (json.hasOwnProperty('id')) {
                                    messages.push('"' + this.withoutYear(yearMatches[0].name) + '" has now been added')
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
                    messages.push('"' + this.withoutYear(titleMatches[0].name) + '" was previously added')
                } else {
                    fetch(this.gamedataApi(titleMatches[0].id))
                        .then(response => response.text())
                        .then(text => this.parseGamedataApiXml(text))
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

    parseIntoParagraphs(str) {
      let paragraphs = str
        .replace(/&amp;/g, '&')
        .replace(/&rsquo;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&ndash;/g, '–')
        .split('&#10;');
      return paragraphs;
    }

    parseGamedataApiXml(str) {
        let game = {"categories": [], "mechanics": []}
        let responseDoc = new DOMParser().parseFromString(str, "application/xml")
        let gamesHtmlCollection = responseDoc.getElementsByTagName("item")
        let makeReadable = this.parseIntoParagraphs
        if (gamesHtmlCollection.length) {
            game["id"] = parseInt(gamesHtmlCollection[0].id)
            gamesHtmlCollection[0].childNodes.forEach(
                function (node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ( (node.tagName === "name") && (node.getAttribute("type") === "primary") ) {
                            game["name"] = node.getAttribute("value")
                        }
                        if (node.tagName === "description") {
                            game["description"] = makeReadable(node.innerHTML)
                        }
                        if (node.tagName === "yearpublished") {
                            game["yearpublished"] = parseInt(node.getAttribute("value"))
                        }
                        if (node.tagName === "minplayers") {
                            game["minplayers"] = parseInt(node.getAttribute("value"))
                        }
                        if (node.tagName === "maxplayers") {
                            game["maxplayers"] = parseInt(node.getAttribute("value"))
                        }
                        if (node.tagName === "minplaytime") {
                            game["minplaytime"] = parseInt(node.getAttribute("value"))
                        }
                        if (node.tagName === "maxplaytime") {
                            game["maxplaytime"] = parseInt(node.getAttribute("value"))
                        }
                        if ( (node.tagName === "link")
                            && (node.getAttribute("type") === "boardgamecategory") ) {
                            if (game.hasOwnProperty("categories")) {
                                game["categories"].push(node.getAttribute("value"))
                            } else {
                                game["categories"] = [node.getAttribute("value")]
                            }
                        }
                        if ( (node.tagName === "link")
                            && (node.getAttribute("type") === "boardgamemechanic") ) {
                            if (game.hasOwnProperty("mechanics")) {
                                game["mechanics"].push(node.getAttribute("value"))
                            } else {
                                game["mechanics"] = [node.getAttribute("value")]
                            }
                        }
                        if ( node.tagName === "statistics") {
                            node.childNodes.forEach(
                                function (childNode) {
                                    if (childNode.tagName === "ratings") {
                                        childNode.childNodes.forEach(
                                            function (grandchildNode) {
                                                if (grandchildNode.tagName === "numweights") {
                                                    game["numweights"] = grandchildNode.getAttribute("value")
                                                }
                                                if (grandchildNode.tagName === "averageweight") {
                                                    game["averageweight"] = grandchildNode.getAttribute("value")
                                                    let weight = parseFloat(game.averageweight)
                                                    let weightname = null
                                                    if (weight < 1.5) {
                                                        weightname = "light"
                                                    } else if (weight < 2.5) {
                                                        weightname = "medium light"
                                                    } else if (weight < 3.5) {
                                                        weightname = "medium"
                                                    } else if (weight < 4.5) {
                                                        weightname = "medium heavy"
                                                    } else {
                                                        weightname = "heavy"
                                                    }
                                                    game["averageweightname"] = weightname
                                                }
                                            }
                                        )
                                    }
                                }
                            )
                        }
                        if ( node.tagName === "comments") {
                            node.childNodes.forEach(
                                function (childNode) {
                                    if (childNode.tagName === "comment") {
                                        let comment = childNode.getAttribute("value")
                                        if (comment.length > 30 && comment.length < 800) {
                                            if (game.hasOwnProperty("comments")) {
                                                game["comments"].push(comment)
                                            } else {
                                                game["comments"] = [comment]
                                            }
                                        }
                                    }
                        })}
                    }
                }
            )
        }
        if ( Object.keys(game) && (!game.hasOwnProperty("yearpublished") || game["yearpublished"] === 0) ) {
            game["yearpublished"] = null
        }
        return game
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
                    <input type="reset" value="Reset" />
                    <input type="submit" value="Submit" />
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