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
        <ul id="import-poll">
        { hardcoded_polls
            .map( (poll,i) => {
                return (
                    <li>{poll.name} ({Object.keys(poll.pollThumbs.titles).length} games, {poll.pollThumbs.total_title_votes} votes)</li>
                )
            })
        }
        </ul>
        </React.Fragment>
    )
}

ImportPoll.propTypes = {
}