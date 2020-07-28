import React from 'react'
import PropTypes from 'prop-types'
import { VotingSection } from './VotingSection';

export const VoteTitles = (props) => {

    let countsArray = []
    props.activegamedata.forEach(function(game) {
        countsArray.push({'attrName': game.unambiguous_name, 'attrCount': 1})
    })

    return (
        <React.Fragment>
        <h4>Upvote board game titles:</h4>
        <VotingSection 
            type='title'
            elementid='game-titles'
            title='TITLES:'
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
    activegamedata: PropTypes.array.isRequired,
    titlethumbs: PropTypes.object.isRequired,
    onnewvote: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
}