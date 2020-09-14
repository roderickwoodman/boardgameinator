import React from 'react'
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

    return (
        <React.Fragment>
        <h4>Import poll:</h4>
        <div id="import-poll">

            <input 
                type="radio" 
                id="poll-local" 
                name="gamelist" 
                value="local" />
            <label 
                for="poll-local">No poll</label>

            { hardcoded_polls
                .map( (poll,i) => {
                    return (
                        <React.Fragment>
                        <input 
                            type="radio" 
                            id={"poll-" + i} 
                            name="gamelist" 
                            value={poll.name} />
                        <label 
                            for={"poll-" + i}>{poll.name} ({Object.keys(poll.pollThumbs.titles).length} games, {poll.pollThumbs.total_title_votes} votes)</label>
                        </React.Fragment>
                    )})
            }

        </div>
        </React.Fragment>
    )
}

ImportPoll.propTypes = {
}