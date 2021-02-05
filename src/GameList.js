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
        if (props.myThumbCounts.poll_rank === 1) {
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

        if (typeof props.myThumbCounts !== 'undefined' 
          && props.myThumbCounts.poll_rank === 1) {
            gamecardClasses += ' winner'
        }

        if (typeof props.myThumbCounts === 'undefined' 
          || !props.myThumbCounts.hasOwnProperty('titles') 
          || props.myThumbCounts.titles === 0) {
            gamecardClasses += ' no-title-votes'
        }

        if (typeof props.myThumbCounts === 'undefined' 
          || !props.myThumbCounts.hasOwnProperty('attributes') 
          || props.myThumbCounts.attributes === 0) {
            gamecardClasses += ' no-attribute-votes'
        }

        if (props.id !== props.idunderinspection) {
            gamecard = <GameCardFront 
                id={props.id}
                thumbnail={props.thumbnail}
                activePoll={props.activePoll}
                activeThumbs={props.activeThumbs} 
                myThumbCounts={props.myThumbCounts} 
                name={props.name}
                yearPublished={props.yearPublished}
                attributes={props.attributes}
                onToggleInspection={props.onToggleInspection} 
                onNewVote={props.onNewVote}
                onDelete={props.onDelete}
                reallyNarrow={props.reallyNarrow} />
        } else {
            gamecard = <GameCardBack 
                id={props.id}
                thumbnail={props.thumbnail}
                activePoll={props.activePoll}
                activeThumbs={props.activeThumbs}
                myThumbCounts={props.myThumbCounts} 
                name={props.name}
                yearPublished={props.yearPublished}
                description={props.description}
                inspectingSection={props.inspectingSection}
                comments={props.comments}
                videos={props.videos}
                onToggleInspection={props.onToggleInspection} 
                onInspectionSectionChange={props.onInspectionSectionChange} 
                onNewVote={props.onNewVote}
                onDelete={props.onDelete}
                reallyNarrow={props.reallyNarrow} />
        }
        const gamecard_overlay = <GamecardOverlay myThumbCounts={props.myThumbCounts} />
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
        if (props.activeThumbs.hasOwnProperty('titles')) {
            for (let entry of Object.entries(props.activeThumbs.titles)) {
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
        if (props.activeThumbs.attributes.hasOwnProperty('players')) {
            for (let playercount in props.activeThumbs.attributes.players) {
                if (props.activeThumbs.attributes.players[playercount].hasOwnProperty('thumbsup') 
                  && props.activeThumbs.attributes.players[playercount].thumbsup.length) {
                    playercounts.push(parseInt(playercount.slice(0, -1)))
                }
            }
        }
        return playercounts
    } 

    const getThumbedWeights = (props) => {
        // collect all of the voted weights
        let weights = []
        if (props.activeThumbs.attributes.hasOwnProperty('weight')) {
            for (let weight in props.activeThumbs.attributes.weight) {
                if (props.activeThumbs.attributes.weight[weight].hasOwnProperty('thumbsup') 
                  && props.activeThumbs.attributes.weight[weight].thumbsup.length) {
                    weights.push(weight)
                }
            }
        }
        return weights
    } 

    const getTotalVotes = () => {
        // tally all votes for each game
        let all_vote_counts = {}
        if (props.activeGameData.length) {
            for (const game of props.activeGameData) {
                let new_vote_counts = {
                    attributes: 0,
                    titles: 0,
                    poll_rank: 0,
                    my_rank: 0
                }
                // playercount section of a game gets ONE TOTAL thumbsup if any of its supported playercounts gets a thumbsup
                for (let playercount=game.attributes.minPlayers; playercount<=game.attributes.maxPlayers; playercount++) {
                    if (props.activeThumbs.attributes.players.hasOwnProperty(playercount + 'P')
                      && props.activeThumbs.attributes.players[playercount + 'P'].hasOwnProperty('thumbsup')
                      && props.activeThumbs.attributes.players[playercount + 'P']['thumbsup'].length) {
                        new_vote_counts.attributes++
                        break
                    }
                }
                // weight section of a game gets ONE TOTAL thumbsup if its weight has a thumbsup
                if (props.activeThumbs.attributes.weight.hasOwnProperty(game.attributes.averageWeightName)
                  && props.activeThumbs.attributes.weight[game.attributes.averageWeightName].hasOwnProperty('thumbsup')
                  && props.activeThumbs.attributes.weight[game.attributes.averageWeightName]['thumbsup'].length) {
                    new_vote_counts.attributes++
                }
                // categories section of a game gets one thumbsup for each thumbed-up category
                for (const category of game.attributes.categories) {
                    if (props.activeThumbs.attributes.category.hasOwnProperty(category)
                      && props.activeThumbs.attributes.category[category].hasOwnProperty('thumbsup')
                      && props.activeThumbs.attributes.category[category]['thumbsup'].length) {
                        new_vote_counts.attributes++
                    }
                }
                // mechanics section of a game gets one thumbsup for each thumbed-up mechanic
                for (const mechanic of game.attributes.mechanics) {
                    if (props.activeThumbs.attributes.mechanic.hasOwnProperty(mechanic)
                      && props.activeThumbs.attributes.mechanic[mechanic].hasOwnProperty('thumbsup')
                      && props.activeThumbs.attributes.mechanic[mechanic]['thumbsup'].length) {
                        new_vote_counts.attributes++
                    }
                }

                // title votes
                if (props.activeThumbs.hasOwnProperty('titles') 
                  && props.activeThumbs.titles.hasOwnProperty(game.id.toString())
                  && props.activeThumbs.titles[game.id].hasOwnProperty('thumbsup')) {

                    if (props.activePoll.id !== 'local') {
                        new_vote_counts.titles = props.activeThumbs.titles[game.id.toString()].thumbsup.length
                    } else {
                        let myVote = JSON.parse(JSON.stringify(props.activeThumbs.titles[game.id.toString()].thumbsup)).filter( vote => vote.user === props.user )
                        new_vote_counts.titles = myVote.length
                    }
                    const myVote = JSON.parse(JSON.stringify(props.activeThumbs.titles[game.id.toString()].thumbsup)).filter( (vote) => {
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
                  && props.activeThumbs.hasOwnProperty('winners')
                  && props.activeThumbs.winners.includes(game.id)) {
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
            if (!props.filterTitles || !favoredTitleIds.length) {
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
            if (!props.filterPlayercount || !favoredPlayercounts.length) {
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
            if (!props.filterWeight || !favoredWeights.length) {
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
            if (props.sortBy === 'alphabetical') {
                if (a.unambiguousName < b.unambiguousName) {
                    return -1
                } else if (a.unambiguousName < b.unambiguousName) {
                    return 1
                } else {
                    return 0
                }
            } else if (props.sortBy === 'maxtitlevotes') {
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
            } else if (props.sortBy === 'maxattrvotes') {
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
            } else if (props.sortBy === 'minplaytime') {
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
            } else if (props.sortBy === 'maxplayers') {
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
        if (props.activeThumbs.totalTitleVotes !== 0) {
            classes += 'deemphasize-nonvoted-titles'
        }
        return classes
    }

    const all_thumbcounts = getTotalVotes()
    const sortedFilteredGames = sortGames(filterWeight(filterPlayercount(filterTitles(props.activeGameData))), all_thumbcounts)
    return (
        <React.Fragment>
        <MainControls 
            user={props.user}
            routedGames={props.routedGames}
            activeGameData={props.activeGameData}
            activeThumbs={props.activeThumbs}
            cachedGameTitles={props.cachedGameTitles}
            addValidatedGames={props.addValidatedGames}
            onDeleteAll={props.onDeleteAll}
            onNewVote={props.onNewVote}
            onClearSectionVotes={props.onClearSectionVotes}
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
                                inspectingSection={inspectingSection}
                                name={game.name} 
                                thumbnail={game.thumbnail} 
                                description={game.description} 
                                yearPublished={game.yearPublished} 
                                attributes={game.attributes}
                                comments={game.comments}
                                videos={game.videos}
                                activePoll={props.activePoll}
                                activeThumbs={props.activeThumbs} 
                                myThumbCounts={all_thumbcounts[game.id]}
                                onNewVote={props.onNewVote}
                                onDelete={props.onDelete}
                                onToggleInspection={handleInspectionChange}
                                onInspectionSectionChange={handleInspectionSectionChange}
                                reallyNarrow={props.reallyNarrow} />)
            )}
            {props.activeGameData.length === 0 && (
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
    activeGameData: PropTypes.array.isRequired,
    sortBy: PropTypes.string.isRequired,
    filterTitles: PropTypes.bool.isRequired,
    filterPlayercount: PropTypes.bool.isRequired,
    filterWeight: PropTypes.bool.isRequired,
    cachedGameTitles: PropTypes.object.isRequired,
    addValidatedGames: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDeleteAll: PropTypes.func.isRequired,
    activeThumbs: PropTypes.object.isRequired,
    onNewVote: PropTypes.func.isRequired,
    onClearSectionVotes: PropTypes.func.isRequired,
    activePoll: PropTypes.object.isRequired,
    onViewPoll: PropTypes.func.isRequired,
    reallyNarrow: PropTypes.bool.isRequired,
}