import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { MainControls } from './MainControls'
import { GameCardFront } from './GameCardFront'
import { GameCardBack } from './GameCardBack'
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
                activethumbs={props.activethumbs} 
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
                activethumbs={props.activethumbs}
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

export const GameList = (props) => {

    const [idUnderInspection, setIdUnderInspection] = useState(null)
    const [inspectingSection, setInspectingSection] = useState('description')

    useEffect( () => {
        const stored_idunderinspection = JSON.parse(localStorage.getItem("idUnderInspection"))
        if (stored_idunderinspection !== null) {
            setIdUnderInspection(stored_idunderinspection)
        }
    }, [])

    const getThumbedTitles = (props) => {
        // collect all of the voted titles
        let titles = []
        if (props.activethumbs.hasOwnProperty('titles')) {
            for (let entry of Object.entries(props.activethumbs.titles)) {
                if (entry[1] === 'thumbsup') {
                    titles.push(entry[0])
                }
            }
        }
        return titles
    } 

    const getThumbedPlayercounts = (props) => {
        // collect all of the voted playercounts
        let playercounts = []
        if (props.activethumbs.attributes.hasOwnProperty('players')) {
            for (let playercount in props.activethumbs.attributes.players) {
                playercounts.push(parseInt(playercount.slice(0, -1)))
            }
        }
        return playercounts
    } 

    const getThumbedWeights = (props) => {
        // collect all of the voted weights
        let weights = []
        if (props.activethumbs.attributes.hasOwnProperty('weight')) {
            for (let weight in props.activethumbs.attributes.weight) {
                weights.push(weight)
            }
        }
        return weights
    } 

    const getTotalVotes = (props) => {
        // tally all votes for each game
        let all_vote_counts = {}
        if (props.activegamedata.length) {
            for (const game of props.activegamedata) {
                let new_vote_counts = {
                    attributes: 0,
                    titles: 0
                }
                // playercount section of a game gets ONE TOTAL thumbsup if any of its supported playercounts gets a thumbsup
                for (let playercount=game.attributes.min_players; playercount<=game.attributes.max_players; playercount++) {
                    if (props.activethumbs.attributes.players.hasOwnProperty(playercount + 'P')) {
                        new_vote_counts.attributes++
                        break
                    }
                }
                // weight section of a game gets ONE TOTAL thumbsup if its weight has a thumbsup
                if (props.activethumbs.attributes.weight.hasOwnProperty(game.attributes.average_weight_name)) {
                    new_vote_counts.attributes++
                }
                // categories section of a game gets one thumbsup for each thumbed-up category
                for (const category of game.attributes.categories) {
                    if (props.activethumbs.attributes.category.hasOwnProperty(category)) {
                        new_vote_counts.attributes++
                    }
                }
                // mechanics section of a game gets one thumbsup for each thumbed-up mechanic
                for (const mechanic of game.attributes.mechanics) {
                    if (props.activethumbs.attributes.mechanic.hasOwnProperty(mechanic)) {
                        new_vote_counts.attributes++
                    }
                }

                // title votes
                if (props.activethumbs.titles.hasOwnProperty(game.name)) {
                    new_vote_counts.titles++
                }

                all_vote_counts[game.name] = new_vote_counts
            }
        }
        return all_vote_counts
    } 

    const handleInspectionChange = (event, id) => {
        let gameId = parseInt(id)
        if (idUnderInspection === gameId) {
            localStorage.setItem('idUnderInspection', JSON.stringify(null))
            setIdUnderInspection(null)
        } else {
            localStorage.setItem('idUnderInspection', JSON.stringify(gameId))
            setIdUnderInspection(gameId)
        }
    }

    const handleInspectionSectionChange = (event) => {
        let newSelection = event.target.id.replace(/select-/g, '')
        setInspectingSection(newSelection)
    }

    // apply a title filter, if configured and if title votes exist
    const filterTitles = (games) => {
        let favoredTitles = getThumbedTitles(props)
        let filtered = games.filter(function(game) {
            if (!props.filtertitles || !favoredTitles.length) {
                return true
            } else if (favoredTitles.includes(game.name)) {
                return true
            } else {
                return false
            }
        })
        return filtered
    }

    // apply a playercount filter, if configured and if playercount votes exist
    const filterPlayercount = (games) => {
        let favoredPlayercounts = getThumbedPlayercounts(props)
        let filtered = games.filter(function(game) {
            if (!props.filterplayercount || !favoredPlayercounts.length) {
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

    // apply a weight filter, if configured and if weight votes exist
    const filterWeight = (games) => {
        let favoredWeights = getThumbedWeights(props)
        let filtered = games.filter(function(game) {
            if (!props.filterweight || !favoredWeights.length) {
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
    const sortGames = (games, votecounts) => {
        // SORTING OPTIONS:
        //   sort by maxtitlevotes... FIRST: most title votes,  SECOND: most attr votes
        //   sort by maxattrvotes...  FIRST: most attr votes,   SECOND: most title votes
        //   sort by minplaytime...   FIRST: shortest playtime, SECOND: most title votes, THIRD: most attr votes
        //   sort by maxplayers...    FIRST: most players,      SECOND: most title votes, THIRD: most attr votes
        let sorted = games.sort(function(a, b) {
            if (props.sortby === 'maxtitlevotes') {
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
                        if (a.attributes.max_playtime > b.attributes.max_playtime) {
                            return 1
                        } else if (a.attributes.max_playtime < b.attributes.max_playtime) {
                            return -1
                        } else {
                            return 0
                        }
                    }
                }
            } else if (props.sortby === 'maxattrvotes') {
                if (votecounts[a.name].attributes < votecounts[b.name].attributes) {
                    return 1
                } else if (votecounts[a.name].attributes > votecounts[b.name].attributes) {
                    return -1
                } else {
                    if (votecounts[a.name].titles < votecounts[b.name].titles) {
                        return 1
                    } else if (votecounts[a.name].titles > votecounts[b.name].titles) {
                        return -1
                    } else {
                        if (a.attributes.max_playtime > b.attributes.max_playtime) {
                            return 1
                        } else if (a.attributes.max_playtime < b.attributes.max_playtime) {
                            return -1
                        } else {
                            return 0
                        }
                    }
                }
            } else if (props.sortby === 'minplaytime') {
                if (a.attributes.max_playtime > b.attributes.max_playtime) {
                    return 1
                } else if (a.attributes.max_playtime < b.attributes.max_playtime) {
                    return -1
                } else {
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
                }
            } else if (props.sortby === 'maxplayers') {
                if (a.attributes.max_players < b.attributes.max_players) {
                    return 1
                } else if (a.attributes.max_players > b.attributes.max_players) {
                    return -1
                } else {
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
                }
            } else {
                return 0
            }
        })
        return sorted
    }

    const getClasses = () => {
        let classes = ''
        if (props.activethumbs.total_title_votes === 0 && props.activethumbs.total_attribute_votes === 0) {
            classes += 'no-votes-to-show'
        }
        if (props.activethumbs.total_title_votes !== 0) {
            classes += ' deemphasize-notvoted-games'
        }
        return classes
    }

    let thumbcounts = getTotalVotes(props)
    let sortedFilteredGames = sortGames(filterWeight(filterPlayercount(filterTitles(props.activegamedata))), thumbcounts)
    return (
        <React.Fragment>
        <MainControls 
            activegamedata={props.activegamedata}
            activethumbs={props.activethumbs}
            cachedgametitles={props.cachedgametitles}
            onaddcachedtitle={props.onaddcachedtitle}
            onaddnewtitle={props.onaddnewtitle}
            oncachenewtitle={props.oncachenewtitle}
            ondeleteall={props.ondeleteall}
            onnewvote={props.onnewvote}
            onclearsectionvotes={props.onclearsectionvotes}
            activepoll={props.activepoll}
            onviewpoll={props.onviewpoll} />
        <div id="resulting-games" className={getClasses()}>
            {sortedFilteredGames.length !== 0 && (
                sortedFilteredGames
                    .map(
                        (game, i) => 
                            <Game
                                key={i}
                                id={game.id} 
                                idunderinspection={idUnderInspection}
                                inspectingsection={inspectingSection}
                                name={game.name} 
                                thumbnail={game.thumbnail} 
                                description={game.description} 
                                yearpublished={game.year_published} 
                                attributes={game.attributes}
                                comments={game.comments}
                                videos={game.videos}
                                activethumbs={props.activethumbs} 
                                thumbcounts={thumbcounts[game.name]}
                                onnewvote={props.onnewvote}
                                ondelete={props.ondelete}
                                ontoggleinspection={handleInspectionChange}
                                oninspectionsectionchange={handleInspectionSectionChange}
                                reallynarrow={props.reallynarrow} />)
            )}
            {props.activegamedata.length === 0 && (
                <span className="message warning">
                    <p>No board games to compare yet!</p>
                    <p>Please add game titles by clicking "Add".</p>
                </span>
            )}
        </div>
        </React.Fragment>
    )
}

GameList.propTypes = {
    activegamedata: PropTypes.array.isRequired,
    sortby: PropTypes.string.isRequired,
    filtertitles: PropTypes.bool.isRequired,
    filterplayercount: PropTypes.bool.isRequired,
    filterweight: PropTypes.bool.isRequired,
    cachedgametitles: PropTypes.object.isRequired,
    onaddcachedtitle: PropTypes.func.isRequired,
    onaddnewtitle: PropTypes.func.isRequired,
    oncachenewtitle: PropTypes.func.isRequired,
    ondelete: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
    activethumbs: PropTypes.object.isRequired,
    onnewvote: PropTypes.func.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
    activepoll: PropTypes.string.isRequired,
    onviewpoll: PropTypes.func.isRequired,
    reallynarrow: PropTypes.bool.isRequired,
}