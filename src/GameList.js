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

const GamecardOverlay = (props) => {
        if (props.mythumbcounts.poll_rank === 1) {
            return (
                <div className="gamecard-overlay">WINNER!</div>

            )
        } else {
            return null
        }
}

const Game = (props) => {
        let gamecard
        let gamecardClasses = 'game'

        if (props.id === props.idunderinspection) {
            gamecardClasses += ' inspecting'
        } 

        if (typeof props.mythumbcounts !== 'undefined' 
          && props.mythumbcounts.poll_rank === 1) {
            gamecardClasses += ' winner'
        }

        if (typeof props.mythumbcounts === 'undefined' 
          || !props.mythumbcounts.hasOwnProperty('titles') 
          || props.mythumbcounts.titles === 0) {
            gamecardClasses += ' no-title-votes'
        }

        if (typeof props.mythumbcounts === 'undefined' 
          || !props.mythumbcounts.hasOwnProperty('attributes') 
          || props.mythumbcounts.attributes === 0) {
            gamecardClasses += ' no-attribute-votes'
        }

        if (props.id !== props.idunderinspection) {
            gamecard = <GameCardFront 
                id={props.id}
                thumbnail={props.thumbnail}
                activePoll={props.activePoll}
                activethumbs={props.activethumbs} 
                mythumbcounts={props.mythumbcounts} 
                name={props.name}
                yearpublished={props.yearpublished}
                attributes={props.attributes}
                ontoggleinspection={props.ontoggleinspection} 
                onnewvote={props.onnewvote}
                ondelete={props.ondelete}
                reallynarrow={props.reallynarrow} />
        } else {
            gamecard = <GameCardBack 
                id={props.id}
                thumbnail={props.thumbnail}
                activePoll={props.activePoll}
                activethumbs={props.activethumbs}
                mythumbcounts={props.mythumbcounts} 
                name={props.name}
                yearpublished={props.yearpublished}
                description={props.description}
                inspectingsection={props.inspectingsection}
                comments={props.comments}
                videos={props.videos}
                ontoggleinspection={props.ontoggleinspection} 
                oninspectionsectionchange={props.oninspectionsectionchange} 
                onnewvote={props.onnewvote}
                ondelete={props.ondelete}
                reallynarrow={props.reallynarrow} />
        }
        const gamecard_overlay = <GamecardOverlay mythumbcounts={props.mythumbcounts} />
        return(
            <section className={gamecardClasses}>
                {gamecard_overlay}
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

    const getThumbedTitleIds = (props) => {
        // collect all of the voted titles
        let titles = []
        if (props.activethumbs.hasOwnProperty('titles')) {
            for (let entry of Object.entries(props.activethumbs.titles)) {
                if (entry[1].hasOwnProperty('thumbsup') && entry[1].thumbsup.length) {
                    titles.push(parseInt(entry[0]))
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
                if (props.activethumbs.attributes.players[playercount].hasOwnProperty('thumbsup') 
                  && props.activethumbs.attributes.players[playercount].thumbsup.length) {
                    playercounts.push(parseInt(playercount.slice(0, -1)))
                }
            }
        }
        return playercounts
    } 

    const getThumbedWeights = (props) => {
        // collect all of the voted weights
        let weights = []
        if (props.activethumbs.attributes.hasOwnProperty('weight')) {
            for (let weight in props.activethumbs.attributes.weight) {
                if (props.activethumbs.attributes.weight[weight].hasOwnProperty('thumbsup') 
                  && props.activethumbs.attributes.weight[weight].thumbsup.length) {
                    weights.push(weight)
                }
            }
        }
        return weights
    } 

    const getTotalVotes = () => {
        // tally all votes for each game
        let all_vote_counts = {}
        if (props.activegamedata.length) {
            for (const game of props.activegamedata) {
                let new_vote_counts = {
                    attributes: 0,
                    titles: 0,
                    poll_rank: 0,
                    my_rank: 0
                }
                // playercount section of a game gets ONE TOTAL thumbsup if any of its supported playercounts gets a thumbsup
                for (let playercount=game.attributes.minPlayers; playercount<=game.attributes.maxPlayers; playercount++) {
                    if (props.activethumbs.attributes.players.hasOwnProperty(playercount + 'P')
                      && props.activethumbs.attributes.players[playercount + 'P'].hasOwnProperty('thumbsup')
                      && props.activethumbs.attributes.players[playercount + 'P']['thumbsup'].length) {
                        new_vote_counts.attributes++
                        break
                    }
                }
                // weight section of a game gets ONE TOTAL thumbsup if its weight has a thumbsup
                if (props.activethumbs.attributes.weight.hasOwnProperty(game.attributes.averageWeightName)
                  && props.activethumbs.attributes.weight[game.attributes.averageWeightName].hasOwnProperty('thumbsup')
                  && props.activethumbs.attributes.weight[game.attributes.averageWeightName]['thumbsup'].length) {
                    new_vote_counts.attributes++
                }
                // categories section of a game gets one thumbsup for each thumbed-up category
                for (const category of game.attributes.categories) {
                    if (props.activethumbs.attributes.category.hasOwnProperty(category)
                      && props.activethumbs.attributes.category[category].hasOwnProperty('thumbsup')
                      && props.activethumbs.attributes.category[category]['thumbsup'].length) {
                        new_vote_counts.attributes++
                    }
                }
                // mechanics section of a game gets one thumbsup for each thumbed-up mechanic
                for (const mechanic of game.attributes.mechanics) {
                    if (props.activethumbs.attributes.mechanic.hasOwnProperty(mechanic)
                      && props.activethumbs.attributes.mechanic[mechanic].hasOwnProperty('thumbsup')
                      && props.activethumbs.attributes.mechanic[mechanic]['thumbsup'].length) {
                        new_vote_counts.attributes++
                    }
                }

                // title votes
                if (props.activethumbs.hasOwnProperty('titles') 
                  && props.activethumbs.titles.hasOwnProperty(game.id.toString())
                  && props.activethumbs.titles[game.id].hasOwnProperty('thumbsup')) {

                    if (props.activePoll.id !== 'local') {
                        new_vote_counts.titles = props.activethumbs.titles[game.id.toString()].thumbsup.length
                    } else {
                        let myVote = JSON.parse(JSON.stringify(props.activethumbs.titles[game.id.toString()].thumbsup)).filter( vote => vote.user === props.user )
                        new_vote_counts.titles = myVote.length
                    }
                    const myVote = JSON.parse(JSON.stringify(props.activethumbs.titles[game.id.toString()].thumbsup)).filter( (vote) => {
                        if (props.user !== null) {
                            if (vote.user === props.user) {
                                return true
                            } else {
                                return false
                            }
                        } else {
                            if (vote.user === null) {
                                return true
                            } else {
                                return false
                            }
                        }
                    })
                    if (myVote.length === 1) {
                        new_vote_counts.my_rank = myVote[0].rank
                    } else {
                        new_vote_counts.my_rank = null
                    }
                }

                // poll winner
                if (props.activePoll.id !== 'local'
                  && props.activethumbs.hasOwnProperty('winners')
                  && props.activethumbs.winners.includes(game.id)) {
                    new_vote_counts.poll_rank = 1
                }

                all_vote_counts[game.id] = new_vote_counts
            }
        }
        return all_vote_counts
    } 

    const handleInspectionChange = (event, id) => {
        const gameId = parseInt(id)
        if (idUnderInspection === gameId) {
            localStorage.setItem('idUnderInspection', JSON.stringify(null))
            setIdUnderInspection(null)
        } else {
            localStorage.setItem('idUnderInspection', JSON.stringify(gameId))
            setIdUnderInspection(gameId)
        }
    }

    const handleInspectionSectionChange = (event) => {
        const newSelection = event.target.id.replace(/select-/g, '')
        setInspectingSection(newSelection)
    }

    // apply a title filter, if configured and if title votes exist
    const filterTitles = (games) => {
        const favoredTitleIds = getThumbedTitleIds(props)
        const filtered = games.filter(function(game) {
            if (!props.filtertitles || !favoredTitleIds.length) {
                return true
            } else if (favoredTitleIds.includes(game.id)) {
                return true
            } else {
                return false
            }
        })
        return filtered
    }

    // apply a playercount filter, if configured and if playercount votes exist
    const filterPlayercount = (games) => {
        const favoredPlayercounts = getThumbedPlayercounts(props)
        const filtered = games.filter(function(game) {
            if (!props.filterplayercount || !favoredPlayercounts.length) {
                return true
            } else {
                for (let playercount=game.attributes.minPlayers; playercount<=game.attributes.maxPlayers; playercount++) {
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
        const favoredWeights = getThumbedWeights(props)
        const filtered = games.filter(function(game) {
            if (!props.filterweight || !favoredWeights.length) {
                return true
            } else if (favoredWeights.includes(game.attributes.averageWeightName)) {
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
        //   sort by alphabetical...  FIRST: alphabetical
        //   sort by maxtitlevotes... FIRST: most title votes,  SECOND: most attr votes
        //   sort by maxattrvotes...  FIRST: most attr votes,   SECOND: most title votes
        //   sort by minplaytime...   FIRST: shortest playtime, SECOND: most title votes, THIRD: most attr votes
        //   sort by maxplayers...    FIRST: most players,      SECOND: most title votes, THIRD: most attr votes
        const sorted = games.sort(function(a, b) {
            if (props.sortby === 'alphabetical') {
                if (a.unambiguousName < b.unambiguousName) {
                    return -1
                } else if (a.unambiguousName < b.unambiguousName) {
                    return 1
                } else {
                    return 0
                }
            } else if (props.sortby === 'maxtitlevotes') {
                if (votecounts[a.id].titles < votecounts[b.id].titles) {
                    return 1
                } else if (votecounts[a.id].titles > votecounts[b.id].titles) {
                    return -1
                } else {
                    if (votecounts[a.id].attributes < votecounts[b.id].attributes) {
                        return 1
                    } else if (votecounts[a.id].attributes > votecounts[b.id].attributes) {
                        return -1
                    } else {
                        if (a.attributes.maxPlaytime > b.attributes.maxPlaytime) {
                            return 1
                        } else if (a.attributes.maxPlaytime < b.attributes.maxPlaytime) {
                            return -1
                        } else {
                            return 0
                        }
                    }
                }
            } else if (props.sortby === 'maxattrvotes') {
                if (votecounts[a.id].attributes < votecounts[b.id].attributes) {
                    return 1
                } else if (votecounts[a.id].attributes > votecounts[b.id].attributes) {
                    return -1
                } else {
                    if (votecounts[a.id].titles < votecounts[b.id].titles) {
                        return 1
                    } else if (votecounts[a.id].titles > votecounts[b.id].titles) {
                        return -1
                    } else {
                        if (a.attributes.maxPlaytime > b.attributes.maxPlaytime) {
                            return 1
                        } else if (a.attributes.maxPlaytime < b.attributes.maxPlaytime) {
                            return -1
                        } else {
                            return 0
                        }
                    }
                }
            } else if (props.sortby === 'minplaytime') {
                if (a.attributes.maxPlaytime > b.attributes.maxPlaytime) {
                    return 1
                } else if (a.attributes.maxPlaytime < b.attributes.maxPlaytime) {
                    return -1
                } else {
                    if (votecounts[a.id].titles < votecounts[b.id].titles) {
                        return 1
                    } else if (votecounts[a.id].titles > votecounts[b.id].titles) {
                        return -1
                    } else {
                        if (votecounts[a.id].attributes < votecounts[b.id].attributes) {
                            return 1
                        } else if (votecounts[a.id].attributes > votecounts[b.id].attributes) {
                            return -1
                        } else {
                            return 0
                        }
                    }
                }
            } else if (props.sortby === 'maxplayers') {
                if (a.attributes.maxPlayers < b.attributes.maxPlayers) {
                    return 1
                } else if (a.attributes.maxPlayers > b.attributes.maxPlayers) {
                    return -1
                } else {
                    if (votecounts[a.id].titles < votecounts[b.id].titles) {
                        return 1
                    } else if (votecounts[a.id].titles > votecounts[b.id].titles) {
                        return -1
                    } else {
                        if (votecounts[a.id].attributes < votecounts[b.id].attributes) {
                            return 1
                        } else if (votecounts[a.id].attributes > votecounts[b.id].attributes) {
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
        if (props.activethumbs.total_title_votes !== 0) {
            classes += 'deemphasize-nonvoted-titles'
        }
        return classes
    }

    const all_thumbcounts = getTotalVotes()
    const sortedFilteredGames = sortGames(filterWeight(filterPlayercount(filterTitles(props.activegamedata))), all_thumbcounts)
    return (
        <React.Fragment>
        <MainControls 
            user={props.user}
            routedGames={props.routedGames}
            activegamedata={props.activegamedata}
            activethumbs={props.activethumbs}
            cachedGameTitles={props.cachedGameTitles}
            addvalidatedgames={props.addvalidatedgames}
            ondeleteall={props.ondeleteall}
            onnewvote={props.onnewvote}
            onclearsectionvotes={props.onclearsectionvotes}
            activePoll={props.activePoll}
            onViewPoll={props.onViewPoll} />
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
                                yearpublished={game.yearPublished} 
                                attributes={game.attributes}
                                comments={game.comments}
                                videos={game.videos}
                                activePoll={props.activePoll}
                                activethumbs={props.activethumbs} 
                                mythumbcounts={all_thumbcounts[game.id]}
                                onnewvote={props.onnewvote}
                                ondelete={props.ondelete}
                                ontoggleinspection={handleInspectionChange}
                                oninspectionsectionchange={handleInspectionSectionChange}
                                reallynarrow={props.reallynarrow} />)
            )}
            {props.activegamedata.length === 0 && (
                <span className="message warning">
                    <p>No board games to compare yet!</p>
                    <p>Please add game titles by clicking "Add Games".</p>
                </span>
            )}
        </div>
        </React.Fragment>
    )
}

GameList.propTypes = {
    user: PropTypes.string,
    routedGames: PropTypes.object.isRequired,
    activegamedata: PropTypes.array.isRequired,
    sortby: PropTypes.string.isRequired,
    filtertitles: PropTypes.bool.isRequired,
    filterplayercount: PropTypes.bool.isRequired,
    filterweight: PropTypes.bool.isRequired,
    cachedGameTitles: PropTypes.object.isRequired,
    addvalidatedgames: PropTypes.func.isRequired,
    ondelete: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
    activethumbs: PropTypes.object.isRequired,
    onnewvote: PropTypes.func.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
    activePoll: PropTypes.object.isRequired,
    onViewPoll: PropTypes.func.isRequired,
    reallynarrow: PropTypes.bool.isRequired,
}