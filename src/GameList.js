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
            sortOrder: 'maxvotes',
            filterPlayercount: true,
            filterWeight: true
        }
        this.handleSortChange = this.handleSortChange.bind(this)
        this.getThumbCounts = this.getThumbCounts.bind(this)
        this.handleFilterChange = this.handleFilterChange.bind(this)
        this.handleInspectionChange = this.handleInspectionChange.bind(this)
        this.handleInspectionSectionChange = this.handleInspectionSectionChange.bind(this)
    }

    componentDidMount() {

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

    getThumbedPlayercounts() {
        // collect all of the voted playercounts
        let playercounts = []
        if (this.props.thumbs.hasOwnProperty('players')) {
            for (let playercount in this.props.thumbs.players) {
                playercounts.push(parseInt(playercount.slice(0, -1)))
            }
        }
        return playercounts
    } 

    getThumbedWeights() {
        // collect all of the voted weights
        let weights = []
        if (this.props.thumbs.hasOwnProperty('weight')) {
            for (let weight in this.props.thumbs.weight) {
                weights.push(weight)
            }
        }
        return weights
    } 

    getThumbCounts() {
        // tally all votes for each game
        let counts = {}
        if (this.props.allgames.length) {
            for (const game of this.props.allgames) {
                let defaultCount = 0
                counts[game.name] = defaultCount
                // playercount section of a game gets ONE TOTAL thumbsup if any of its supported playercounts gets a thumbsup
                for (let playercount=game.min_players; playercount<=game.max_players; playercount++) {
                    if (this.props.thumbs.players.hasOwnProperty(playercount + 'P')) {
                        counts[game.name]++
                        break
                    }
                }
                // weight section of a game gets ONE TOTAL thumbsup if its weight has a thumbsup
                if (this.props.thumbs.weight.hasOwnProperty(game.average_weight_name)) {
                    counts[game.name]++
                }
                // categories section of a game gets one thumbsup for each thumbed-up category
                for (const category of game.categories) {
                    if (this.props.thumbs.category.hasOwnProperty(category)) {
                        counts[game.name]++
                    }
                }
                // mechanics section of a game gets one thumbsup for each thumbed-up mechanic
                for (const mechanic of game.mechanics) {
                    if (this.props.thumbs.mechanic.hasOwnProperty(mechanic)) {
                        counts[game.name]++
                    }
                }
            }
        }
        return counts
    } 

    handleSortChange(event, value) {
        localStorage.setItem('idUnderInspection', JSON.stringify(null))
        this.setState({
            sortOrder: value,
            idUnderInspection: null
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

    render() {
        let thumbcounts = this.getThumbCounts()
        let favoredPlayercounts = this.getThumbedPlayercounts()
        let favoredWeights = this.getThumbedWeights()
        let filterStr, filteredGames = this.props.allgames
            // if necessary, filter by playercount,
            .filter( (game) => {
                if (!this.state.filterPlayercount || favoredPlayercounts.length === 0) {
                    return true
                } else {
                    for (let playercount=game.min_players; playercount<=game.max_players; playercount++) {
                        if (favoredPlayercounts.includes(playercount)) {
                            return true
                        }
                    }
                    return false
                }
            })
            // if necessary, filter by weight,
            .filter( (game) => {
                if (!this.state.filterWeight || favoredWeights.length === 0) {
                    return true
                } else {
                    if (favoredWeights.includes(game.average_weight_name)) {
                        return true
                    } else {
                        return false
                    }
                }
            })
        if (filteredGames.length !== this.props.allgames.length) {
            filterStr = 'now showing ' + filteredGames.length + ' of ' + this.props.allgames.length + ' games'
        } else {
            filterStr = 'now showing ' + filteredGames.length + ' games'
        }
        return (
            <React.Fragment>
            <ViewControls 
                thumbs={this.props.thumbs}
                allgames={this.props.allgames}
                onnewtitle={this.props.onnewtitle}
                ondelete={this.props.ondelete}
                ondeleteall={this.props.ondeleteall}
                sortby={this.state.sortOrder}
                onsortchange={this.handleSortChange}
                filterplayercount={this.state.filterPlayercount}
                filterweight={this.state.filterWeight}
                onfilterchange={this.handleFilterChange}
                filtermessage={filterStr}
                onnewvote={this.props.onnewvote}
                onclearsectionvotes={this.props.onclearsectionvotes}
                playercounts={this.props.playercounts}
                weightcounts={this.props.weightcounts}
                categorycounts={this.props.categorycounts}
                mechaniccounts={this.props.mechaniccounts} />
            <div id="resulting-games">
                {filteredGames.length !== 0 && (
                    filteredGames
                        // sort by maxvotes...     FIRST: most votes,        SECOND: shortest playtime
                        // sort by maxplaytime...  FIRST: shortest playtime, SECOND: most votes
                        // sort by maxplayers...   FIRST: most players,      SECOND: most votes
                        .sort((this.state.sortOrder === 'maxvotes') 
                            ? ( (a, b) => (thumbcounts[a.name] < thumbcounts[b.name]) ? 1 : (thumbcounts[a.name] === thumbcounts[b.name]) && (a.max_playtime > b.max_playtime) ? 1 : -1 )
                            : ( (this.state.sortOrder === 'max_playtime') 
                                ? ( (a, b) => (a.max_playtime > b.max_playtime) ? 1 : (a.max_playtime === b.max_playtime) && (thumbcounts[a.name] < thumbcounts[b.name]) ? 1 : -1 )
                                : ( (a, b) => (a.max_players < b.max_players) ? 1 : (a.max_players === b.max_players) && (thumbcounts[a.name] < thumbcounts[b.name]) ? 1 : -1 ) ) )
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
                                    minplayers={game.min_players} 
                                    maxplayers={game.max_players} 
                                    minplaytime={game.min_playtime} 
                                    maxplaytime={game.max_playtime}
                                    average_weight_name={game.average_weight_name}
                                    categories={game.categories}
                                    mechanics={game.mechanics} 
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
    thumbs: PropTypes.object.isRequired,
    onnewvote: PropTypes.func.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
    playercounts: PropTypes.array.isRequired,
    weightcounts: PropTypes.array.isRequired,
    categorycounts: PropTypes.array.isRequired,
    mechaniccounts: PropTypes.array.isRequired,
    totalattributevotes: PropTypes.number.isRequired,
    reallynarrow: PropTypes.bool.isRequired,
}