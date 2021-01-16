import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'


export const PollInfo = (props) => {

    const [pollInfoIsOpen, setPollInfoIsOpen] = useState(false)

    const showPollInfoModal = () => {
        setPollInfoIsOpen(true)
    }

    const hidePollInfoModal = () => {
        setPollInfoIsOpen(false)
    }

    const epochToLocal = (epoch) => {
        let d = new Date(epoch)
        const dayName = d.toString().split(' ')[0]
        return dayName + ' ' + d.toLocaleDateString('en-US', { 
            day: '2-digit',
            month: '2-digit',
            year:'numeric'
        })
    }

    if (props.poll.id === 'local') {
        return (
            <p></p>
        )
    }  else {

        // tally the votes
        let voteTally = {}
        Object.entries(props.poll.pollThumbs.titles).forEach( entry => {
            let name = props.gamedata.filter( gamedata => gamedata.id === parseInt(entry[0]) )[0].unambiguous_name
            if (entry[1].hasOwnProperty('thumbsup')) {
                let thumbsupVotes = JSON.parse(JSON.stringify(entry[1].thumbsup)).map( vote => vote.user ).sort()
                voteTally[name] = thumbsupVotes 
            }
        })


        // sort the tallied votes
        let sortedVoteTally = Object.entries(voteTally).sort( (a,b) => {
            if (a[1].length > b[1].length) {
                return -1
            } else if (a[1].length < b[1].length) {
                return 1
            } else {
                return 0
            }
        })

        // tag each game with a ranking string
        for (let [idx,votes] of sortedVoteTally.entries()) {
            let rankStr = ''
            if (idx === 0) {
                rankStr = '1'
            } else {
                // if the previous vote count equals this one, use the previous rankStr
                if (votes.length === sortedVoteTally[idx-1][1].length) {
                    if (!sortedVoteTally[idx-1][2].endsWith('T')) {
                        sortedVoteTally[idx-1][2] += 'T'
                    }
                    rankStr = sortedVoteTally[idx-1][2]
                } else {
                    rankStr = (idx + 1).toString()
                }
            }
            sortedVoteTally[idx].push(rankStr)
        }

        return (
            <div id="poll-info">
                <button className={(props.poll.id !== 'local') ? "fa fa-button poll-info" : null} onClick={showPollInfoModal}><FontAwesomeIcon icon={faInfoCircle}/></button>
                <Modal size="md" show={pollInfoIsOpen} onHide={hidePollInfoModal}>
                    <ModalBody>
                        <h4>{props.poll.name}</h4>
                        <table id="poll-metadata">
                            <tbody>
                                <tr>
                                    <th>ID:</th><td>{props.poll.id}</td>
                                </tr>
                                <tr>
                                    <th>created:</th><td>{epochToLocal(props.poll.id)}</td>
                                </tr>
                                <tr>
                                    <th>updated:</th><td>{epochToLocal(props.poll.updatedAt)}</td>
                                </tr>
                                <tr>
                                    <th>closes:</th><td>{epochToLocal(props.poll.closesAt)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table id="poll-results">
                            <tbody>
                                { sortedVoteTally.map( (game, i) =>
                                    <tr key={i}>
                                        <th>{game[2]}.</th>
                                        <td>{game[0]}</td>
                                        <td>
                                            { game[1].map( (vote, j) =>
                                                <span key={j}>{vote}, </span>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </ModalBody>
                    <ModalFooter> 
                        <button className="default-primary-styles" onClick={hidePollInfoModal}>Close</button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }

}

PollInfo.propTypes = {
    poll: PropTypes.object.isRequired,
    gamedata: PropTypes.array.isRequired,
}