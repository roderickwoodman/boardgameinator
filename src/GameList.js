import React from 'react'
import PropTypes from 'prop-types'
import { MainControls } from './MainControls'
import { GameCardFront } from './GameCardFront'
import { GameCardBack } from './GameCardBack'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltLeft } from '@fortawesome/free-solid-svg-icons'
import bggLogo from './img/bgg-logo-50.png'

const GameFooter = (props) => {
    return (
        <div className="footer">
            <a href={"https://boardgamegeek.com/boardgame/" + props.gameid } rel="noopener noreferrer">
                this game on BGG
            </a>&nbsp;
            <img src={bggLogo} alt="BoardGameGeek logo" />
        </div>
    )
}

const Game = (props) => {
        let gamecard
        let gamecardClasses = 'game'
        if (props.id === props.idunderinspection) {
            gamecardClasses += ' inspecting'
        } 
        if (props.thumbcounts.titles === 1) {
            gamecardClasses += ' thumbsup'
        } else {
            gamecardClasses += ' novote'
        }
        if (props.id !== props.idunderinspection) {
            gamecard = <GameCardFront 
                id={props.id}
                thumbnail={props.thumbnail}
                name={props.name}
                yearpublished={props.yearpublished}
                attributes={props.attributes}
                allthumbs={props.allthumbs} 
                thumbcounts={props.thumbcounts} 
                ontoggleinspection={props.ontoggleinspection} 
                onnewvote={props.onnewvote}
                ondelete={props.ondelete}
                reallynarrow={props.reallynarrow} />
        } else {
            gamecard = <GameCardBack 
                id={props.id}
                thumbnail={props.thumbnail}
                thumbcounts={props.thumbcounts} 
                name={props.name}
                yearpublished={props.yearpublished}
                description={props.description}
                inspectingsection={props.inspectingsection}
                comments={props.comments}
                videos={props.videos}
                allthumbs={props.allthumbs}
                ontoggleinspection={props.ontoggleinspection} 
                oninspectionsectionchange={props.oninspectionsectionchange} 
                onnewvote={props.onnewvote}
                ondelete={props.ondelete}
                reallynarrow={props.reallynarrow} />
        }
        return(
            <section className={gamecardClasses}>
                {gamecard}
                <section className="gamecard-footer">
                    <GameFooter gameid={props.id}/>
                </section>
            </section>
        )
    }

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
        this.getTotalVotes = this.getTotalVotes.bind(this)
        this.handleFilterChange = this.handleFilterChange.bind(this)
        this.handleInspectionChange = this.handleInspectionChange.bind(this)
        this.handleInspectionSectionChange = this.handleInspectionSectionChange.bind(this)
        this.getClasses = this.getClasses.bind(this)
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

        const stored_idunderinspection = JSON.parse(localStorage.getItem("idUnderInspection"))
        if (stored_idunderinspection !== null) {
            this.setState({ idUnderInspection: stored_idunderinspection })
        }
    }

    getThumbedTitles() {
        // collect all of the voted titles (by ID)
        let titles_by_id = []
        if (Object.keys(this.props.allthumbs.titles).length) {
            for (let id in this.props.allthumbs.titles) {
                titles_by_id.push(parseInt(id))
            }
        }
        return titles_by_id
    } 

    getThumbedPlayercounts() {
        // collect all of the voted playercounts
        let playercounts = []
        if (this.props.allthumbs.attributes.hasOwnProperty('players')) {
            for (let playercount in this.props.allthumbs.attributes.players) {
                playercounts.push(parseInt(playercount.slice(0, -1)))
            }
        }
        return playercounts
    } 

    getThumbedWeights() {
        // collect all of the voted weights
        let weights = []
        if (this.props.allthumbs.attributes.hasOwnProperty('weight')) {
            for (let weight in this.props.allthumbs.attributes.weight) {
                weights.push(weight)
            }
        }
        return weights
    } 

    getTotalVotes() {
        // tally all votes for each game
        let all_vote_counts = {}
        if (this.props.allgames.length) {
            for (const game of this.props.allgames) {
                let new_vote_counts = {
                    attributes: 0,
                    titles: 0
                }
                // playercount section of a game gets ONE TOTAL thumbsup if any of its supported playercounts gets a thumbsup
                for (let playercount=game.attributes.min_players; playercount<=game.attributes.max_players; playercount++) {
                    if (this.props.allthumbs.attributes.players.hasOwnProperty(playercount + 'P')) {
                        new_vote_counts.attributes++
                        break
                    }
                }
                // weight section of a game gets ONE TOTAL thumbsup if its weight has a thumbsup
                if (this.props.allthumbs.attributes.weight.hasOwnProperty(game.attributes.average_weight_name)) {
                    new_vote_counts.attributes++
                }
                // categories section of a game gets one thumbsup for each thumbed-up category
                for (const category of game.attributes.categories) {
                    if (this.props.allthumbs.attributes.category.hasOwnProperty(category)) {
                        new_vote_counts.attributes++
                    }
                }
                // mechanics section of a game gets one thumbsup for each thumbed-up mechanic
                for (const mechanic of game.attributes.mechanics) {
                    if (this.props.allthumbs.attributes.mechanic.hasOwnProperty(mechanic)) {
                        new_vote_counts.attributes++
                    }
                }

                // title votes
                if (this.props.allthumbs.titles.hasOwnProperty(game.name)) {
                    new_vote_counts.titles++
                }

                all_vote_counts[game.name] = new_vote_counts
            }
        }
        return all_vote_counts
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
    sortGames(games, votecounts) {
        let self = this
        // SORTING OPTIONS:
        //   sort by maxtitlevotes... FIRST: most title votes,  SECOND: most attr votes
        //   sort by maxattrvotes...  FIRST: most attr votes,   SECOND: most title votes
        //   sort by minplaytime...   FIRST: shortest playtime, SECOND: most attr votes
        //   sort by maxplayers...    FIRST: most players,      SECOND: most attr votes
        let sorted = games.sort(function(a, b) {
            if (self.state.sortOrder === 'maxtitlevotes') {
                if (votecounts[a.name].titles < votecounts[b.name].titles) {
                    return 1
                } else if (votecounts[a.name].titles > votecounts[b.name].titles) {
                    return -1
                } else {
                    if (votecounts[a.name].attributes < votecounts[b.name].attributes) {
                        return 1
                    } else if (votecounts[a.name].attributes > votecounts[b.name].attributes) {
                        return -1
                    } else {
                        return 0
                    }
                }
            } else if (self.state.sortOrder === 'maxattrvotes') {
                if (votecounts[a.name].attributes < votecounts[b.name].attributes) {
                    return 1
                } else if (votecounts[a.name].attributes > votecounts[b.name].attributes) {
                    return -1
                } else {
                    if (votecounts[a.name].titles > votecounts[b.name].titles) {
                        return 1
                    } else if (votecounts[a.name].titles < votecounts[b.name].titles) {
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
                    if (votecounts[a.name].attributes < votecounts[b.name].attributes) {
                        return 1
                    } else if (votecounts[a.name].attributes > votecounts[b.name].attributes) {
                        return -1
                    } else {
                        return 0
                    }
                }
            } else if (self.state.sortOrder === 'maxplayers') {
                if (a.max_players < b.max_players) {
                    return 1
                } else if (a.max_players > b.max_players) {
                    return -1
                } else {
                    if (votecounts[a.name].attributes < votecounts[b.name].attributes) {
                        return 1
                    } else if (votecounts[a.name].attributes > votecounts[b.name].attributes) {
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

    getClasses() {
        let classes = ''
        if (this.props.allthumbs.total_title_votes === 0) {
            classes = 'no-votes-to-show'
        }
        return classes
    }

    render() {
        let thumbcounts = this.getTotalVotes()
        let sortedFilteredGames = this.sortGames(this.filterWeight(this.filterPlayercount(this.props.allgames)), thumbcounts)
        return (
            <React.Fragment>
            <MainControls 
                allgames={this.props.allgames}
                allthumbs={this.props.allthumbs}
                onnewtitle={this.props.onnewtitle}
                ondeleteall={this.props.ondeleteall}
                onnewvote={this.props.onnewvote}
                onclearsectionvotes={this.props.onclearsectionvotes} />
            <div id="resulting-games" className={this.getClasses()}>
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
                                    allthumbs={this.props.allthumbs} 
                                    thumbcounts={thumbcounts[game.name]}
                                    onnewvote={this.props.onnewvote}
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
    allthumbs: PropTypes.object.isRequired,
    onnewvote: PropTypes.func.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
    reallynarrow: PropTypes.bool.isRequired,
}