import React, { useState } from 'react'
// import PropTypes from 'prop-types'

const hardcoded_polls = [
    {
        id: '1',
        name: 'Poll A',
        pollThumbs: {
            titles: {
                'Coloretto (2003)': {
                    'Charles': 'thumbsup',
                    'Cassidy': 'thumbsup',
                },
                'Wingspan': {
                    'Wendy': 'thumbsup',
                }
            },
            total_title_votes: 3
        }
    },
    {
        id: '2',
        name: 'Poll B',
        pollThumbs: {
            titles: {
                'Food Chain Magnate': {
                    'Fran': 'thumbsup',
                    'Filipe': 'thumbsup',
                    'Fiona': 'thumbsup',
                },
                'Wingspan': {
                    'Wesley': 'thumbsup',
                },
                'Flamme Rouge': {
                }
            },
            total_title_votes: 4
        }
    }
]

export const ImportPoll = (props) => {

    const [ inputValue, setInputValue ] = useState('local')

    const handleChange = (event) => {
        setInputValue(event.target.value)
        console.log('event.target.value:', event.target.value)
    }

    return (
        <React.Fragment>
        <h4>Import poll:</h4>
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
                            &nbsp;{poll.name} ({Object.keys(poll.pollThumbs.titles).length} games, {poll.pollThumbs.total_title_votes} votes)</label>
                    )})
            }

        </div>
        </React.Fragment>
    )
}

ImportPoll.propTypes = {
}