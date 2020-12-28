import React, { useState } from 'react'
import { importpollApi } from './Api.js'
import PropTypes from 'prop-types'
import Spinner from 'react-bootstrap/Spinner'

export const hardcoded_polls = [
    {
        id: 1,
        name: 'Fake Poll A, VOTING DISABLED',
        pollThumbs: {
            titles: {
                126163: { // Tzolk'in
                    'thumbsup': [{user:'Terry', rank:1}, {user:'Tina', rank:1}, {user:'_me_', rank:1}]
                },
                266192: { // Wingspan
                    'thumbsup': [{user:'Wendy', rank:1}, {user:'Wally', rank:1}, {user:'Wade', rank:1}]
                },
                28023: { // Jamaica
                    'thumbsup': [{user:'Jerry', rank:1}]
                },
                218603: { // Photosynthesis
                    'thumbsup': [{user:'Patty', rank:1}]
                },
                237182: { // Root
                    'thumbsup': [{user:'Randy', rank:1}, {user:'_me_', rank:1}]
                },
            },
            winners: [126163, 266192],
            total_title_votes: 10,
        }
    },
    {
        id: 2,
        name: 'Fake Poll B, VOTING DISABLED',
        pollThumbs: {
            titles: {
                175914: { // Food Chain Magnate
                    'thumbsup': [{user:'Fran', rank:1}, {user:'Filipe', rank:1}, {user:'Fiona', rank:1}, {user:'_me_', rank:1}]
                },
                266192: { // Wingspan
                    'thumbsup': [{user:'Wesley', rank:1}, {user:'Will', rank:1}]
                },
                31481: { // Galaxy Trucker
                    'thumbsup': [{user:'Gary', rank:1}]
                },
                199478: { // Flamme Rouge
                    'thumbsup': [{user:'Fred', rank:1}]
                },
                169786: { // Scythe
                    'thumbsup': [{user:'Sue', rank:1}]
                },
                9209: { // Ticket To Ride
                    'thumbsup': [{user:'Tina', rank:1}, {user:'Timothy', rank:1}]
                },
            },
            winners: [175914],
            total_title_votes: 11,
        }
    },
    {
        id: 3,
        name: 'Fake Poll C, VOTING DISABLED',
        pollThumbs: {
            titles: {
                141791: { // Pinata
                    'thumbsup': []
                },
                162886: { // Spirit Island
                    'thumbsup': [{user:'Sue', rank:1}]
                },
            },
            winners: [],
            total_title_votes: 1,
        }
    }
]

export const ImportPoll = (props) => {

    const [ inputValue, setInputValue ] = useState(props.activepoll.id.toString())
    const [ loading, setLoading ] = useState(false)

    const handleChange = (event) => {
        if (!loading) {
            setInputValue(event.target.value)
            if (event.target.value === 'local') {
                const no_poll = {
                    id: 'local',
                    name: 'local',
                }
                props.onviewpoll(no_poll)
            } else {
                setLoading(true)
                const imported_poll = importpollApi(parseInt(event.target.value))
                props.onviewpoll(imported_poll)
                setLoading(false)
            }
        }
    }

    return (
        <React.Fragment>
        <h4>Select a group poll</h4>
        <h6 className="warning">(UNDER CONSTRUCTION)</h6>
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
                    const gamecount = Object.keys(poll.pollThumbs.titles).length + ' ' + ((Object.keys(poll.pollThumbs.titles).length === 1) ? 'game' : 'games')
                    const votecount = poll.pollThumbs.total_title_votes + ' ' + ((poll.pollThumbs.total_title_votes === 1) ? 'vote' : 'votes')
                    return (
                        <label 
                            key={i}
                            htmlFor={"poll-" + i}>
                            <input 
                                type="radio" 
                                id={"poll-" + i} 
                                name="gamelist" 
                                value={poll.id}
                                checked={inputValue === poll.id.toString()}
                                onChange={handleChange} />
                            &nbsp;{poll.name} ({gamecount}, {votecount})&nbsp;
                            { loading && inputValue === poll.id.toString() &&
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
    activepoll: PropTypes.object.isRequired,
    onviewpoll: PropTypes.func.isRequired,
}