import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'
import { searchApi, exactSearchApi, gamedataApi } from './Api.js'


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
        this.validateUserTitles = this.validateUserTitles.bind(this)
        this.extractYearFromTitle = this.extractYearFromTitle.bind(this)
        this.ifGameHasBeenAdded = this.ifGameHasBeenAdded.bind(this)
    }

    withYear(title, year, id) {
        let printedYear = (year === null) ? '#'+id : year
        return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '').concat(' ('+printedYear+')')
    }

    withoutYear(title) {
        if (typeof title === 'string' && title.length) {
            return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '')
        } else {
            return title
        }
    }

    // for disambiguation of titles, the game ID will be put in parentheses when the API does not provide yearpublished info
    extractYearFromTitle(title) {
        if (typeof title === 'string' && title.length) {
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
    }

    async validateUserTitlesV2(userTitles) {
        let messages = []
        let newTextareaValue = ""
        let self = this
        const titleData = await Promise.all(
            userTitles.map( function(gameTitle) {
                return (
                    // STEP 1: do BGG exact search API, using user-supplied name string
                    exactSearchApi(gameTitle)

                    // OPTIONAL STEP 2 (if no matches were found): do BGG non-exact search API, using user-supplied name string
                    .then( function(exactSearchData, idx) {
                        if (Object.entries(exactSearchData.length !==0)) {
                            return (exactSearchData)
                        } else {
                            return searchApi(userTitles[idx])
                        }})

                    // (EVENTUAL) STEP 3: do BGG game data API, using BGG-API-supplied game ID
                    .then( function(nonexactSearchData, idx2) {

                        // if an ID was searched for and not a title name, no disambiguation will be needed
                        let idMatches = nonexactSearchData.filter( titleMatch => titleMatch.id === parseInt(userTitles[idx2]))

                        // no BGG titles were found
                        if (nonexactSearchData.length === 0) {
                            messages.push('ERROR: "' + self.withoutYear(userTitles[idx2]) + '" was not found in the BGG database')
                            newTextareaValue += userTitles[idx2] + '\n'

                        // multiple BGG titles were found (without an exact ID match), so do disambiguation by year published
                        } else if (nonexactSearchData.length > 1 && idMatches.length !== 1) {
                            let desiredYear = self.extractYearFromTitle(userTitles[idx2])
                            let yearMatches = nonexactSearchData
                                .filter(ambiguousTitle => 
                                    desiredYear != null
                                    && ( (desiredYear.startsWith('#') && ambiguousTitle.id === parseInt(desiredYear.substr(1)))
                                        || ambiguousTitle.year_published === parseInt(desiredYear) ))
                            // the user's search submission did provide a publishing year that matches that of a BGG title
                            if (yearMatches.length) {
                                if (self.ifGameHasBeenAdded(yearMatches[0].id)) {
                                    messages.push('"' + self.withYear(userTitles[idx2], yearMatches[0].year_published, yearMatches[0].id) + '" was previously added')
                                } else {
                                    gamedataApi(yearMatches[0].id)
                                        .then(json => {
                                            if (json.hasOwnProperty('id')) {
                                                if (desiredYear !== null) {
                                                    messages.push('"' + self.withYear(yearMatches[0].name, yearMatches[0].year_published, yearMatches[0].id) + '" has now been added')
                                                } else {
                                                    messages.push('"' + self.withoutYear(yearMatches[0].name) + '" has now been added')
                                                }
                                                json["name_is_unique"] = false
                                                self.props.onnewtitle(json)
                                            } else {
                                                messages.push('ERROR: "' + self.withoutYear(yearMatches[0].name) + '" is not producing data from the BGG API, so deleting it from your input')
                                            }
                                        })
                                }
                            // re-populate the user's input textarea with titles that have disambiguation applied (so they can re-submit immediately)
                            } else {
                                messages.push('ERROR: "' + self.withoutYear(userTitles[idx2]) + '" has multiple matches in the BGG database')
                                for (let ambiguousTitle of nonexactSearchData) {
                                    let disambiguousTitle = self.withYear(ambiguousTitle.name, ambiguousTitle.year_published, ambiguousTitle.id)
                                    newTextareaValue += disambiguousTitle + '\n'
                                }
                            }
                        // exactly 1 BGG title was found
                        } else {
                            if (self.ifGameHasBeenAdded(nonexactSearchData[0].id)) {
                                messages.push('"' + self.withYear(nonexactSearchData[0].name) + '" was previously added')
                            } else {
                                gamedataApi(nonexactSearchData[0].id)
                                    .then(json => {
                                        if (json.hasOwnProperty('id')) {
                                            // messages.push('"' + this.withoutYear(nonexactSearchData[0].name) + '" has now been added')
                                            json["name_is_unique"] = true
                                            self.props.onnewtitle(json)
                                            } else {
                                                // messages.push('ERROR: "' + this.withoutYear(nonexactSearchData[0].name) + '" is not producing data from the BGG API, so deleting it from your input')
                                                newTextareaValue += ''
                                            }
                                        })
                                }
                            }
                        // FIXME: re-enable status messages and textarea updates
                        // this.setState({ value: newTextareaValue })
                        // this.setState({ statusMessages: messages })
                        })
                    )
            })
        )
    }

    async validateUserTitles(userTitles) {

        let messages = []
        let newTextareaValue = ""

        // search for an exact title match (BGG API)
        const exactSearchApiResults = await Promise.all(
            userTitles.map( gameTitle => exactSearchApi(this.withoutYear(gameTitle)) )
        )

        // if there was no response to the exact title search, do a non-exact one (BGG API)
        const searchApiResults = await Promise.all(
            exactSearchApiResults.map(
                (exactSearchApiResult, idx) => {
                    if (Object.entries(exactSearchApiResult).length !== 0) {
                        return exactSearchApiResult
                    } else {
                        return (
                            searchApi(userTitles[idx])
                        )
                    }
                }
            ))

        // the search result for each user-supplied title may have returned multiple possible BGG titles
        searchApiResults.forEach( (titleMatches, titleMatchesIdx) => {

            // if an ID was searched for and not a title name, no disambiguation will be needed
            let idMatches = titleMatches.filter( titleMatch => titleMatch.id === parseInt(userTitles[titleMatchesIdx]))

            // no BGG titles were found
            if (titleMatches.length === 0) {
                messages.push('ERROR: "' + this.withoutYear(userTitles[titleMatchesIdx]) + '" was not found in the BGG database')
                newTextareaValue += userTitles[titleMatchesIdx] + '\n'

            // multiple BGG titles were found (without an exact ID match), so do disambiguation by year published
            } else if (titleMatches.length > 1 && idMatches.length !== 1) {
                let desiredYear = this.extractYearFromTitle(userTitles[titleMatchesIdx])
                let yearMatches = titleMatches
                    .filter(ambiguousTitle => 
                        desiredYear != null
                        && ( (desiredYear.startsWith('#') && ambiguousTitle.id === parseInt(desiredYear.substr(1)))
                            || ambiguousTitle.year_published === parseInt(desiredYear) ))
                // the user's search submission did provide a publishing year that matches that of a BGG title
                if (yearMatches.length) {
                    if (this.ifGameHasBeenAdded(yearMatches[0].id)) {
                        messages.push('"' + this.withYear(userTitles[titleMatchesIdx], yearMatches[0].year_published, yearMatches[0].id) + '" was previously added')
                    } else {
                        gamedataApi(yearMatches[0].id)
                            .then(json => {
                                if (json.hasOwnProperty('id')) {
                                    if (desiredYear !== null) {
                                        messages.push('"' + this.withYear(yearMatches[0].name, yearMatches[0].year_published, yearMatches[0].id) + '" has now been added')
                                    } else {
                                        messages.push('"' + this.withoutYear(yearMatches[0].name) + '" has now been added')
                                    }
                                    json["name_is_unique"] = false
                                    this.props.onnewtitle(json)
                                } else {
                                    messages.push('ERROR: "' + this.withoutYear(yearMatches[0].name) + '" is not producing data from the BGG API, so deleting it from your input')
                                }
                            })
                    }
                // re-populate the user's input textarea with titles that have disambiguation applied (so they can re-submit immediately)
                } else {
                    messages.push('ERROR: "' + this.withoutYear(userTitles[titleMatchesIdx]) + '" has multiple matches in the BGG database')
                    for (let ambiguousTitle of titleMatches) {
                        let disambiguousTitle = this.withYear(ambiguousTitle.name, ambiguousTitle.year_published, ambiguousTitle.id)
                        newTextareaValue += disambiguousTitle + '\n'
                    }
                }
            // exactly 1 BGG title was found
            } else {
                if (this.ifGameHasBeenAdded(titleMatches[0].id)) {
                    messages.push('"' + this.withYear(titleMatches[0].name) + '" was previously added')
                } else {
                    gamedataApi(titleMatches[0].id)
                        .then(json => {
                            if (json.hasOwnProperty('id')) {
                                messages.push('"' + this.withoutYear(titleMatches[0].name) + '" has now been added')
                                json["name_is_unique"] = true
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
        this.validateUserTitlesV2(Array.from(new Set(userTitles)))
    }

    render() {
        return (
            <React.Fragment>

            <h4>Add board game(s) by title:</h4>

            <div id="input-section">

                <section id="input-by-title">
                    <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                        <label htmlFor="titles-input">Game Title(s):</label>
                        <textarea rows="8" cols="40" value={this.state.value} onChange={this.handleChange} placeholder="(exact match only)" required/>
                        <section className="buttonrow">
                            <button type="reset" className="default-primary-styles">Reset</button>
                            <button type="submit" className="default-primary-styles">Submit</button>
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

            </div>
            </React.Fragment>
        )
    }
}

AddByTitle.propTypes = {
    allgames: PropTypes.array.isRequired,
    onnewtitle: PropTypes.func.isRequired,
}