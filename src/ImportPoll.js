import React, { useState, useRef, useEffect } from 'react'
import { importpollApi } from './Api.js'
import PropTypes from 'prop-types'
import Spinner from 'react-bootstrap/Spinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

export const hardcodedPolls = [
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
            totalTitleVotes: 11,
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
            totalTitleVotes: 10,
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
            totalTitleVotes: 8,
        }
    }
]

const fetchDataForPolls = async (pollIds) => {
    const polldata = await Promise.all(
        pollIds.map( pollId => importpollApi(pollId) )
    )
    return polldata
}

export const ImportPoll = (props) => {

    const [ pollList, setPollList ] = useState([])
    const [ pollListData, setPollListData ] = useState([])
    const [ selectedPoll, setSelectedPoll ] = useState(props.activePoll.id.toString())
    const [ userPollIdInput, setUserPollIdInput ] = useState('')
    const [ validPollIdInput, setValidPollIdInput ] = useState(null)
    const [ statusMessage, setStatusMessage ] = useState(null)
    const [ hiddenPollIds, setHiddenPollIds ] = useState([])
    const [ loading, setLoading ] = useState(false)

    const inputEl = useRef(null)

    useEffect( () => {

        let isSubscribed = true

        const storedPollList = JSON.parse(localStorage.getItem("pollList"))
        if (storedPollList !== null) {
            setPollList(storedPollList)
            fetchDataForPolls(storedPollList).then( polldata => {
                if (isSubscribed) {
                    setPollListData(polldata)
                }
            })
        }

        return () => isSubscribed = false

    }, [])

    const selectPoll = (event) => {
        if (!loading) {
            setSelectedPoll(event.target.value)
            if (event.target.value === 'local') {
                const noPoll = {
                    id: 'local',
                    name: 'local',
                }
                props.onViewPoll(noPoll)
            } else {
                setLoading(true)
                const importedPoll = importpollApi(parseInt(event.target.value))
                if (importedPoll !== null) {
                    if (!pollList.includes(importedPoll.id)) {
                        let updatedPollList = [...pollList]
                        updatedPollList.push(importedPoll.id)
                        localStorage.setItem('pollList', JSON.stringify(updatedPollList))
                    }
                    props.onViewPoll(importedPoll)
                }
                setLoading(false)
            }
        }
    }

    const newPollIdChange = (event) => {
        event.preventDefault()
        const potentialPollId = event.target.value
        setUserPollIdInput(potentialPollId)
        const validationErrors = validate(potentialPollId)
        if (Object.keys(validationErrors).length) {
            if (validationErrors.hasOwnProperty('chars')) {
                setValidPollIdInput(null)
                setStatusMessage(validationErrors.chars)
            }
        } else {
            setValidPollIdInput(potentialPollId)
            setStatusMessage(null)
        }
    }

    const validate = (value) => {
        let errors = {}
        const legalCharacters = value.replace(/[^0-9]/g, '')
        if (legalCharacters !== value) {
            errors['chars'] = `Invalid. Please use only digits.`
        }
        return errors
    }

    const newPollIdSubmit = async (event) => {
        event.preventDefault()
        if (validPollIdInput !== null) {
            setLoading(true)
            const importedPoll = await importpollApi(parseInt(userPollIdInput))
            if (importedPoll !== null) {
                let updatedHiddenPollIds = [...hiddenPollIds]
                updatedHiddenPollIds = updatedHiddenPollIds.filter( poll => poll.id !== validPollIdInput )
                setHiddenPollIds(updatedHiddenPollIds)
                setUserPollIdInput('')
                setValidPollIdInput(null)
                props.onViewPoll(importedPoll)
            }
            setLoading(false)
        }
    }

    const loadHardcodedPolls = () => {
        setPollList(hardcodedPolls.map( poll => poll.id ))
        let updatedPollList = hardcodedPolls.map( poll => poll.id )
        localStorage.setItem('pollList', JSON.stringify(updatedPollList))
        setPollListData(hardcodedPolls)
    }

    const handleHidePoll = (event) => {
        const poll = parseInt(event.target.id.replace('poll-hide-',''))
        let updatedHiddenPollIds = [...hiddenPollIds]
        updatedHiddenPollIds.push(poll)
        setHiddenPollIds(updatedHiddenPollIds)
        let updatedPollList = [...pollList]
        updatedPollList = updatedPollList.filter( pollId => !updatedHiddenPollIds.includes(pollId) )
        localStorage.setItem('pollList', JSON.stringify(updatedPollList))
        if (poll === props.activePoll.id) {
            setSelectedPoll('local')
            const noPoll = {
                id: 'local',
                name: 'local',
            }
            props.onViewPoll(noPoll)
        }
    }

    let displayPolls = pollListData.filter( pollData => !hiddenPollIds.includes(pollData.id))

    return (
        <React.Fragment>
        <h4>Import and select group polls</h4>
        <h6 className="warning">(UNDER CONSTRUCTION)</h6>
        <div id="import-poll">

            <label 
                htmlFor="poll-local">
                <input 
                    type="radio" 
                    id="poll-local" 
                    name="gamelist" 
                    value="local"
                    checked={selectedPoll === 'local'}
                    onChange={selectPoll} />
                &nbsp;No poll. Edit my own game list.</label>

            <section id="input-by-poll-id">
                <section className="buttonrow">
                    <input ref={inputEl} size="30" value={userPollIdInput} onChange={newPollIdChange} placeholder="(poll ID)" />
                    <button onClick={newPollIdSubmit} className="default-primary-styles">Import</button>
                    { !displayPolls.filter( poll => !hiddenPollIds.includes(poll.id) ).length  &&
                        <button onClick={loadHardcodedPolls} className="default-primary-styles">Show Me Polls</button>
                    }
                </section>
                <div className="status-messages">
                    { statusMessage &&
                        <p className="message error">ERROR: {statusMessage}</p>
                    }
                </div>
            </section>

            { displayPolls
                .map( (pollData,i) => {
                    // const gamecount = Object.keys(poll.pollThumbs.titles).length + ' ' + ((Object.keys(poll.pollThumbs.titles).length === 1) ? 'game' : 'games')
                    // const votecount = poll.pollThumbs.totalTitleVotes + ' ' + ((poll.pollThumbs.totalTitleVotes === 1) ? 'vote' : 'votes')
                    if (!hiddenPollIds.includes(pollData.id)) {
                        return (
                            <label 
                                key={i}
                                htmlFor={"poll-" + pollData.id}>
                                <button 
                                    id={"poll-hide-" + pollData.id}
                                    className="fa fa-button"
                                    onClick={handleHidePoll}>
                                    <FontAwesomeIcon icon={faTrash}/>
                                    </button>
                                <input 
                                    type="radio" 
                                    id={"poll-" + pollData.id} 
                                    name="gamelist" 
                                    value={pollData.id}
                                    checked={selectedPoll === pollData.id.toString()}
                                    onChange={selectPoll} />
                                {pollData.id/* &nbsp;{poll.name} ({gamecount}, {votecount})&nbsp; */}
                                { loading && selectedPoll === pollData.id.toString() &&
                                <Spinner animation="border" size="sm" />
                                }
                            </label>
                        )
                    } else {
                        return (
                            null
                        )
                    }
                })
            }
        </div>
        </React.Fragment>
    )
}

ImportPoll.propTypes = {
    activePoll: PropTypes.object.isRequired,
    onViewPoll: PropTypes.func.isRequired,
}