import React from 'react'
import PropTypes from 'prop-types'
import { VotingSection } from './VotingSection';

export const VoteTitles = (props) => {

    let countsArray = []
    props.activegamedata.forEach(function(game) {
        countsArray.push({'attrId': game.id, 'attrName': game.unambiguous_name, 'attrCount': 1})
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
            onnewvote={props.onnewvote}
            alphabetize={true}
            suppresslowcounts={true}
        />
        </React.Fragment>
    )
}

VoteTitles.propTypes = {
    user: PropTypes.string,
    activegamedata: PropTypes.array.isRequired,
    titlethumbs: PropTypes.object,
    onnewvote: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
}