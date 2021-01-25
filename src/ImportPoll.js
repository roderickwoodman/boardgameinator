import React, { useState, useRef } from 'react'
import { importpollApi } from './Api.js'
import PropTypes from 'prop-types'
import Spinner from 'react-bootstrap/Spinner'

export const hardcoded_polls = [
    {
        id: 1610263515000, // createdAt
        updatedAt: 1610263515000,
        closesAt: 1619301600000,
        name: 'Fake Poll A, VOTING DISABLED',
        pollThumbs: {
            titles: {
                175914: { // Food Chain Magnate
                    'thumbsup': [{user:'Fran', rank:1}, {user:'Filipe', rank:1}, {user:'Fiona', rank:1}, {user:'Mendy', rank:1}]
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
            winners: [],
            total_title_votes: 11,
        }
    },
    {
        id: 1608456120000, // createdAt
        updatedAt: 1608456120000,
        closesAt: 1610263498000,
        name: 'Fake Poll B, VOTING DISABLED',
        pollThumbs: {
            titles: {
                126163: { // Tzolk'in
                    'thumbsup': [{user:'Terry', rank:1}, {user:'Tina', rank:1}, {user:'Mendy', rank:1}]
                },
                266192: { // Wingspan
                    'thumbsup': [{user:'Wendy', rank:1}, {user:'Wally', rank:1}, {user:'Mendy', rank:1}]
                },
                28023: { // Jamaica
                    'thumbsup': [{user:'Jerry', rank:1}]
                },
                218603: { // Photosynthesis
                    'thumbsup': [{user:'Patty', rank:1}]
                },
                237182: { // Root
                    'thumbsup': [{user:'Randy', rank:1}, {user:'Mendy', rank:2}]
                },
            },
            winners: [126163, 266192],
            total_title_votes: 10,
        }
    },

    {
        id: 1610263992000, // createdAt
        updatedAt: 1610263992000,
        closesAt: 1612941797000,
        name: 'Fake Poll C, VOTING DISABLED',
        pollThumbs: {
            titles: {
                298065: { // Santa Monica
                    'thumbsup': [{user:'Santa', rank:1}, {user:'Mendy', rank:1}]
                },
                73761: { // K2
                    'thumbsup': [{user:'Santa', rank:2}, {user:'Mendy', rank:1}, {user:'Keith', rank:1}, {user:'Karl', rank:1}]
                },
                141791: { // Pinata
                    'thumbsup': []
                },
                169786: { // Scythe
                    'thumbsup': [{user:'Santa', rank:3}]
                },
                162886: { // Spirit Island
                    'thumbsup': [{user:'Sue', rank:1}]
                },
            },
            winners: [],
            total_title_votes: 8,
        }
    }
]

export const ImportPoll = (props) => {

    const [ inputValue, setInputValue ] = useState(props.activepoll.id.toString())
    const [ userPollIdInput, setUserPollIdInput ] = useState('')
    const [ loading, setLoading ] = useState(false)

    const inputEl = useRef(null)

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

    const handleIdChange = (event) => {
        event.preventDefault()
        setUserPollIdInput(parseInt(event.target.value))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        const imported_poll = importpollApi(userPollIdInput)
        props.onviewpoll(imported_poll)
        setLoading(false)
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
            <section id="input-by-poll-id">
                <section className="buttonrow">
                    <input ref={inputEl} size="30" value={userPollIdInput} onChange={handleIdChange} placeholder="(poll ID)" />
                    <button onClick={handleSubmit} className="default-primary-styles">Import</button>
                </section>
            </section>
        </div>
        </React.Fragment>
    )
}

ImportPoll.propTypes = {
    activepoll: PropTypes.object.isRequired,
    onviewpoll: PropTypes.func.isRequired,
}