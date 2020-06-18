import React from 'react'
import PropTypes from 'prop-types'
import { VotingSection } from './VotingSection';


export class VoteTitles extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
        }
    }

    render() {

        let countsArray = []
        this.props.allgames.forEach(function(game) {
            let game_name = game.name.concat((game.hasOwnProperty("name_is_unique") && game["name_is_unique"] === false) ? game["disambiguation"] : "")
            countsArray.push({'attrName': game_name, 'attrCount': 1})
        })

        return (
            <React.Fragment>
            <h4>Upvote board game titles:</h4>
            <VotingSection 
                type='title'
                elementid='game-titles'
                title='TITLES:'
                counts={countsArray}
                thumbs={this.props.titlethumbs}
                onnewvote={this.props.onnewvote}
                alphabetize={true}
                suppresslowcounts={true}
            />
            </React.Fragment>
        )
    }
}

VoteTitles.propTypes = {
    allgames: PropTypes.array.isRequired,
    titlethumbs: PropTypes.object.isRequired,
    onnewvote: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
}