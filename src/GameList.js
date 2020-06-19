import React from 'react'
import PropTypes from 'prop-types'
import { ViewControls } from './ViewControls'
import { Game } from './Game'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltLeft } from '@fortawesome/free-solid-svg-icons'

export class GameList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            idUnderInspection: null,
            inspectingSection: 'description',
            sortOrder: 'maxattrvotes',
            filterPlayercount: true,
            filterWeight: true
        }
        this.handleSortChange = this.handleSortChange.bind(this)
        this.getTotalTitleVotes = this.getTotalTitleVotes.bind(this)
        this.getTotalAttrVotes = this.getTotalAttrVotes.bind(this)
        this.handleFilterChange = this.handleFilterChange.bind(this)
        this.handleInspectionChange = this.handleInspectionChange.bind(this)
        this.handleInspectionSectionChange = this.handleInspectionSectionChange.bind(this)
    }

    componentDidMount() {

        const stored_sortorder = JSON.parse(localStorage.getItem("sortOrder"))
        if (stored_sortorder !== null) {
            this.setState({ sortOrder: stored_sortorder })
        }

        const stored_filterplayercount = JSON.parse(localStorage.getItem("filterPlayercount"))
        if (stored_filterplayercount !== null) {
            this.setState({ filterPlayercount: stored_filterplayercount })
        }

        const stored_filterweight = JSON.parse(localStorage.getItem("filterWeight"))
        if (stored_filterweight !== null) {
            this.setState({ filterWeight: stored_filterweight })
        }

        const stored_idUnderInspection = JSON.parse(localStorage.getItem("idUnderInspection"))
        if (stored_filterplayercount !== null) {
            this.setState({ idUnderInspection: stored_idUnderInspection })
        }
    }

    getThumbedTitles() {
        // collect all of the voted titles (by ID)
        let titles_by_id = []
        if (Object.keys(this.props.titlethumbs).length) {
            for (let id in this.props.titlethumbs) {
                titles_by_id.push(parseInt(id))
            }
        }
        return titles_by_id
    } 

    getThumbedPlayercounts() {
        // collect all of the voted playercounts
        let playercounts = []
        if (this.props.thumbs.attributes.hasOwnProperty('players')) {
            for (let playercount in this.props.thumbs.attributes.players) {
                playercounts.push(parseInt(playercount.slice(0, -1)))
            }
        }
        return playercounts
    } 

    getThumbedWeights() {
        // collect all of the voted weights
        let weights = []
        if (this.props.thumbs.attributes.hasOwnProperty('weight')) {
            for (let weight in this.props.thumbs.attributes.weight) {
                weights.push(weight)
            }
        }
        return weights
    } 

    getTotalAttrVotes() {
        // tally all attribute votes for each game
        let counts = {}
        if (this.props.allgames.length) {
            for (const game of this.props.allgames) {
                let defaultCount = 0
                counts[game.name] = defaultCount
                // playercount section of a game gets ONE TOTAL thumbsup if any of its supported playercounts gets a thumbsup
                for (let playercount=game.attributes.min_players; playercount<=game.attributes.max_players; playercount++) {
                    if (this.props.thumbs.attributes.players.hasOwnProperty(playercount + 'P')) {
                        counts[game.name]++
                        break
                    }
                }
                // weight section of a game gets ONE TOTAL thumbsup if its weight has a thumbsup
                if (this.props.thumbs.attributes.weight.hasOwnProperty(game.attributes.average_weight_name)) {
                    counts[game.name]++
                }
                // categories section of a game gets one thumbsup for each thumbed-up category
                for (const category of game.attributes.categories) {
                    if (this.props.thumbs.attributes.category.hasOwnProperty(category)) {
                        counts[game.name]++
                    }
                }
                // mechanics section of a game gets one thumbsup for each thumbed-up mechanic
                for (const mechanic of game.attributes.mechanics) {
                    if (this.props.thumbs.attributes.mechanic.hasOwnProperty(mechanic)) {
                        counts[game.name]++
                    }
                }
            }
        }
        return counts
    } 

    getTotalTitleVotes() {
        // tally all title votes for each game
        let counts = {}
        if (this.props.allgames.length) {
            for (const game of this.props.allgames) {
                let defaultCount = 0
                counts[game.name] = defaultCount
                if (this.props.titlethumbs.hasOwnProperty(game.name)) {
                    counts[game.name]++
                }
            }
        }
        return counts
    } 

    handleSortChange(event, value) {
        this.setState(prevState => {
            localStorage.setItem('sortOrder', JSON.stringify(value))
            localStorage.setItem('idUnderInspection', JSON.stringify(null))
            return {
                sortOrder: value,
                idUnderInspection: null
            }
        })
    }

    handleFilterChange(event, value) {
        switch (value) {
            case 'playercount':
                this.setState(prevState => {
                    let filterPlayercount = !prevState.filterPlayercount
                    localStorage.setItem('filterPlayercount', JSON.stringify(filterPlayercount))
                    localStorage.setItem('idUnderInspection', JSON.stringify(null))
                    return { 
                        filterPlayercount: !this.state.filterPlayercount,
                        idUnderInspection: null
                    }
                })
                break
            case 'weight':
                this.setState(prevState => {
                    let filterWeight = !prevState.filterWeight
                    localStorage.setItem('filterWeight', JSON.stringify(filterWeight))
                    localStorage.setItem('idUnderInspection', JSON.stringify(null))
                    return { 
                        filterWeight: !this.state.filterWeight,
                        idUnderInspection: null
                    }
                })
                break
            default:
                break
        }
    }

    handleInspectionChange(event, id) {
        let gameId = parseInt(id)
        if (this.state.idUnderInspection === gameId) {
            localStorage.setItem('idUnderInspection', JSON.stringify(null))
            this.setState({
                idUnderInspection: null
            })
        } else {
            localStorage.setItem('idUnderInspection', JSON.stringify(gameId))
            this.setState({
                idUnderInspection: gameId
            })
        }
    }

    handleInspectionSectionChange(event) {
        let newSelection = event.target.id.replace(/select-/g, '')
        this.setState({
            inspectingSection: newSelection
        })
    }

    // apply a playercount filter, if configured to and if playercount votes exist
    filterPlayercount(games) {
        let self = this
        let favoredPlayercounts = this.getThumbedPlayercounts()
        let filtered = games.filter(function(game) {
            if (!self.state.filterPlayercount || !favoredPlayercounts.length) {
                return true
            } else {
                for (let playercount=game.attributes.min_players; playercount<=game.attributes.max_players; playercount++) {
                    if (favoredPlayercounts.includes(playercount)) {
                        return true
                    }
                }
                return false
            }
        })
        return filtered
    }

    // apply a weight filter, if configured to and if weight votes exist
    filterWeight(games) {
        let self = this
        let favoredWeights = this.getThumbedWeights()
        let filtered = games.filter(function(game) {
            if (!self.state.filterWeight || !favoredWeights.length) {
                return true
            } else if (favoredWeights.includes(game.attributes.average_weight_name)) {
                return true
            } else {
                return false
            }
        })
        return filtered
    }

    // order the games
    sortGames(games) {
        let self = this
        let attrcounts = this.getTotalAttrVotes()
        let titlecounts = this.getTotalTitleVotes()
        // SORTING OPTIONS:
        //   sort by maxtitlevotes... FIRST: most title votes,  SECOND: most attr votes
        //   sort by maxattrvotes...  FIRST: most attr votes,   SECOND: most title votes
        //   sort by minplaytime...   FIRST: shortest playtime, SECOND: most attr votes
        //   sort by maxplayers...    FIRST: most players,      SECOND: most attr votes
        let sorted = games.sort(function(a, b) {
            if (self.state.sortOrder === 'maxtitlevotes') {
                if (titlecounts[a.name] < titlecounts[b.name]) {
                    return 1
                } else if (titlecounts[a.name] > titlecounts[b.name]) {
                    return -1
                } else {
                    if (attrcounts[a.name] < attrcounts[b.name]) {
                        return 1
                    } else if (attrcounts[a.name] > attrcounts[b.name]) {
                        return -1
                    } else {
                        return 0
                    }
                }
            } else if (self.state.sortOrder === 'maxattrvotes') {
                if (attrcounts[a.name] < attrcounts[b.name]) {
                    return 1
                } else if (attrcounts[a.name] > attrcounts[b.name]) {
                    return -1
                } else {
                    if (titlecounts[a.name] > titlecounts[b.name]) {
                        return 1
                    } else if (titlecounts[a.name] < titlecounts[b.name]) {
                        return -1
                    } else {
                        return 0
                    }
                }
            } else if (self.state.sortOrder === 'minplaytime') {
                if (a.max_playtime > b.max_playtime) {
                    return 1
                } else if (a.max_playtime < b.max_playtime) {
                    return -1
                } else {
                    if (attrcounts[a.name] < attrcounts[b.name]) {
                        return 1
                    } else if (attrcounts[a.name] > attrcounts[b.name]) {
                        return -1
                    } else {
                        return 0
                    }
                }
            } else if (self.state.sortOrder === 'maxplayers') {
                if (a.attributes.max_players < b.attributes.max_players) {
                    return 1
                } else if (a.attributes.max_players > b.attributes.max_players) {
                    return -1
                } else {
                    if (attrcounts[a.name] < attrcounts[b.name]) {
                        return 1
                    } else if (attrcounts[a.name] > attrcounts[b.name]) {
                        return -1
                    } else {
                        return 0
                    }
                }
            } else {
                return 0
            }
        })
        return sorted
    }

    render() {
        let thumbcounts = this.getTotalAttrVotes()
        let sortedFilteredGames = this.sortGames(this.filterWeight(this.filterPlayercount(this.props.allgames)))
        let filterStr
        if (sortedFilteredGames.length !== this.props.allgames.length) {
            filterStr = 'now showing ' + sortedFilteredGames.length + ' of ' + this.props.allgames.length + ' games'
        } else {
            filterStr = 'now showing ' + sortedFilteredGames.length + ' games'
        }
        return (
            <React.Fragment>
            <ViewControls 
                allgames={this.props.allgames}
                titlethumbs={this.props.titlethumbs}
                thumbs={this.props.thumbs}
                onnewtitle={this.props.onnewtitle}
                ondeleteall={this.props.ondeleteall}
                sortby={this.state.sortOrder}
                onsortchange={this.handleSortChange}
                filterplayercount={this.state.filterPlayercount}
                filterweight={this.state.filterWeight}
                onfilterchange={this.handleFilterChange}
                filtermessage={filterStr}
                onnewvote={this.props.onnewvote}
                onclearsectionvotes={this.props.onclearsectionvotes}
                attributestally={this.props.attributestally} />
            <div id="resulting-games">
                {sortedFilteredGames.length !== 0 && (
                    sortedFilteredGames
                        .map(
                            (game, i) => 
                                <Game
                                    key={i}
                                    id={game.id} 
                                    idunderinspection={this.state.idUnderInspection}
                                    inspectingsection={this.state.inspectingSection}
                                    name={game.name} 
                                    thumbnail={game.thumbnail} 
                                    description={game.description} 
                                    yearpublished={game.year_published} 
                                    attributes={game.attributes}
                                    comments={game.comments}
                                    videos={game.videos}
                                    thumbs={this.props.thumbs} 
                                    totalattributevotes={this.props.totalattributevotes}
                                    thumbcount={thumbcounts[game.name]}
                                    ondelete={this.props.ondelete}
                                    ontoggleinspection={this.handleInspectionChange}
                                    oninspectionsectionchange={this.handleInspectionSectionChange}
                                    reallynarrow={this.props.reallynarrow} />)
                )}
                {this.props.allgames.length === 0 && (
                    <span className="message warning">
                        <p>START COMPARING BOARDGAMES!</p>
                        <p>Please add game titles using the form in the left sidebar.</p>
                        <p>
                            <FontAwesomeIcon icon={faLongArrowAltLeft} />&nbsp;
                            <FontAwesomeIcon icon={faLongArrowAltLeft} />&nbsp;
                            <FontAwesomeIcon icon={faLongArrowAltLeft} />&nbsp;
                        </p>
                    </span>
                )}
            </div>
            </React.Fragment>
        )
    }
}

GameList.propTypes = {
    allgames: PropTypes.array.isRequired,
    onnewtitle: PropTypes.func.isRequired,
    ondelete: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
    titlethumbs: PropTypes.object.isRequired,
    thumbs: PropTypes.object.isRequired,
    onnewvote: PropTypes.func.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
    attributestally: PropTypes.object.isRequired,
    totalattributevotes: PropTypes.number.isRequired,
    reallynarrow: PropTypes.bool.isRequired,
}