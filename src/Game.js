import React from 'react'
import PropTypes from 'prop-types'
import { GameCardFront } from './GameCardFront'
import { GameCardBack } from './GameCardBack'
import { GameFooter } from './GameFooter'


export class Game extends React.Component {

    render() {
        const { id, idunderinspection, inspectingsection, name, thumbnail, description, yearpublished, attributes, comments, videos, allthumbs, thumbcounts, onnewvote, ondelete, ontoggleinspection, oninspectionsectionchange, reallynarrow } = this.props
        let gamecard
        let gamecardClasses = 'game'
        if (id === idunderinspection) {
            gamecardClasses += ' inspecting'
        } 
        if (thumbcounts.titles === 1) {
            gamecardClasses += ' thumbsup'
        } else {
            gamecardClasses += ' novote'
        }
        if (id !== idunderinspection) {
            gamecard = <GameCardFront 
                id={id}
                thumbnail={thumbnail}
                name={name}
                yearpublished={yearpublished}
                attributes={attributes}
                allthumbs={allthumbs} 
                thumbcounts={thumbcounts} 
                ontoggleinspection={ontoggleinspection} 
                onnewvote={onnewvote}
                ondelete={ondelete}
                reallynarrow={reallynarrow} />
        } else {
            gamecard = <GameCardBack 
                id={id}
                thumbnail={thumbnail}
                thumbcounts={thumbcounts} 
                name={name}
                yearpublished={yearpublished}
                description={description}
                inspectingsection={inspectingsection}
                comments={comments}
                videos={videos}
                allthumbs={allthumbs}
                ontoggleinspection={ontoggleinspection} 
                oninspectionsectionchange={oninspectionsectionchange} 
                onnewvote={onnewvote}
                ondelete={ondelete}
                reallynarrow={reallynarrow} />
        }
        return(
            <section className={gamecardClasses}>
                {gamecard}
                <section className="gamecard-footer">
                    <GameFooter gameid={id}/>
                </section>
            </section>
        )
    }
}

Game.propTypes = {
    attributes: PropTypes.object.isRequired,
    comments: PropTypes.array,
    description: PropTypes.array.isRequired,
    id: PropTypes.number.isRequired,
    idunderinspection: PropTypes.number,
    inspectingsection: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onnewvote: PropTypes.func.isRequired,
    ondelete: PropTypes.func.isRequired,
    oninspectionsectionchange: PropTypes.func.isRequired,
    ontoggleinspection: PropTypes.func.isRequired,
    thumbcounts: PropTypes.object.isRequired,
    thumbnail: PropTypes.string,
    allthumbs: PropTypes.object.isRequired,
    videos: PropTypes.array,
    yearpublished: PropTypes.number,
    reallynarrow: PropTypes.bool.isRequired,
}