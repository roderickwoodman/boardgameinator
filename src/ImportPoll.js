import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Spinner from 'react-bootstrap/Spinner'

const hardcoded_polls = [
    {
        id: '1',
        name: 'Fake Poll A, VOTING DISABLED',
        pollThumbs: {
            titles: {
                126163: { // Tzolk'in
                    'thumbsup': ['Terry', 'Tina', 'Thomas']
                },
                266192: { // Wingspan
                    'thumbsup': ['Wendy']
                },
                28023: { // Jamaica
                    'thumbsup': ['_me_']
                },
                218603: { // Photosynthesis
                    'thumbsup': ['Patty', 'Peter', 'Paula']
                },
                194626: { // Happy Salmon
                    'thumbsup': ['Harry', '_me_']
                },
            },
            winners: [126163, 218603],
            total_title_votes: 10,
        }
    },
    {
        id: '2',
        name: 'Fake Poll B, VOTING DISABLED',
        pollThumbs: {
            titles: {
                175914: { // Food Chain Magnate
                    'thumbsup': ['Fran', 'Filipe', 'Fiona', '_me_']
                },
                266192: { // Wingspan
                    'thumbsup': ['Wesley', 'Will']
                },
                31481: { // Galaxy Trucker
                    'thumbsup': ['Gary']
                },
                199478: { // Flamme Rouge
                    'thumbsup': ['Fred']
                },
                169786: { // Scythe
                    'thumbsup': ['Sue']
                },
                9209: { // Ticket To Ride
                    'thumbsup': ['Tina', 'Timothy']
                },
            },
            winners: [175914],
            total_title_votes: 11,
        }
    },
    {
        id: '3',
        name: 'Fake Poll C, VOTING DISABLED',
        pollThumbs: {
            titles: {
                141791: { // Pinata
                    'thumbsup': ['Peggy']
                },
                162886: { // Spirit Island
                    'thumbsup': ['Sue']
                },
            },
            winners: [],
            total_title_votes: 2,
        }
    }
]

export const ImportPoll = (props) => {

    const [ inputValue, setInputValue ] = useState(props.activepoll)
    const [ loading, setLoading ] = useState(false)

    const handleChange = (event) => {
        setInputValue(event.target.value)
        setLoading(true)
        if (event.target.value === 'local') {
            let no_poll = {
                id: 'local',
                name: 'local',
            }
            props.onviewpoll(no_poll)
        } else {
            props.onviewpoll(hardcoded_polls.filter( polls => polls.name === event.target.value )[0])
        }
    }

    return (
        <React.Fragment>
        <h4>Select a group poll:</h4>
        <div id="import-poll">

            <label 
                htmlFor="poll-local">
                <input 
                    type="radio" 
                    id="poll-local" 
                    name="gamelist" 
                    value="local"
                    checked={inputValue === 'local'}
                    onChange={handleChange} />
                &nbsp;No poll</label>

            { hardcoded_polls
                .map( (poll,i) => {
                    let gamecount = Object.keys(poll.pollThumbs.titles).length + ' ' + ((Object.keys(poll.pollThumbs.titles).length === 1) ? 'game' : 'games')
                    let votecount = poll.pollThumbs.total_title_votes + ' ' + ((poll.pollThumbs.total_title_votes === 1) ? 'vote' : 'votes')
                    return (
                        <label 
                            key={i}
                            htmlFor={"poll-" + i}>
                            <input 
                                type="radio" 
                                id={"poll-" + i} 
                                name="gamelist" 
                                value={poll.name}
                                checked={inputValue === poll.name}
                                onChange={handleChange} />
                            &nbsp;{poll.name} ({gamecount}, {votecount})&nbsp;
                            { loading && inputValue === poll.name &&
                            <Spinner animation="border" size="sm" />
                            }

                            </label>
                    )})
            }

        </div>
        </React.Fragment>
    )
}

ImportPoll.propTypes = {
    activepoll: PropTypes.string.isRequired,
    onviewpoll: PropTypes.func.isRequired,
}