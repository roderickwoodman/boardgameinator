import React from 'react'
import PropTypes from 'prop-types'
import { VotingSection } from './VotingSection';

export const VoteTitles = (props) => {

    let countsArray = []
    props.activeGameData.forEach(function(game) {
        countsArray.push({'attrId': game.id, 'attrName': game.unambiguousName, 'attrCount': 1})
    })

    return (
        <React.Fragment>
        <h4>Upvote board game titles:</h4>
        <VotingSection 
            user={props.user}
            type='title'
            elementid='game-titles'
            title={'TITLES ('+countsArray.length+'):'}
            counts={countsArray}
            sectionthumbs={props.titlethumbs}
            onNewVote={props.onNewVote}
            alphabetize={true}
            suppresslowcounts={true}
        />
        </React.Fragment>
    )
}

VoteTitles.propTypes = {
    user: PropTypes.string,
    activeGameData: PropTypes.array.isRequired,
    titlethumbs: PropTypes.object,
    onNewVote: PropTypes.func.isRequired,
    onDeleteAll: PropTypes.func.isRequired,
}