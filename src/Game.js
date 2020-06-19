import React from 'react'
import PropTypes from 'prop-types'
import { GameCardFront } from './GameCardFront'
import { GameCardBack } from './GameCardBack'


export class Game extends React.Component {

    render() {
        const { id, idunderinspection, inspectingsection, name, thumbnail, description, yearpublished, attributes, comments, videos, thumbs, thumbcount, ondelete, ontoggleinspection, oninspectionsectionchange, reallynarrow } = this.props
        let gamecard
        let gamecardClasses = (id === idunderinspection) ? "game inspecting" : "game"
        if (id !== idunderinspection) {
            gamecard = <GameCardFront 
                id={id}
                thumbnail={thumbnail}
                name={name}
                yearpublished={yearpublished}
                attributes={attributes}
                thumbs={thumbs} 
                thumbcount={thumbcount} 
                ontoggleinspection={ontoggleinspection} 
                ondelete={ondelete}
                reallynarrow={reallynarrow} />
        } else {
            gamecard = <GameCardBack 
                id={id}
                thumbnail={thumbnail}
                thumbcount={thumbcount} 
                name={name}
                yearpublished={yearpublished}
                description={description}
                inspectingsection={inspectingsection}
                comments={comments}
                videos={videos}
                thumbs={thumbs}
                ontoggleinspection={ontoggleinspection} 
                oninspectionsectionchange={oninspectionsectionchange} 
                ondelete={ondelete}
                reallynarrow={reallynarrow} />
        }
        return(
            <section className={gamecardClasses}>
                {gamecard}
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
    ondelete: PropTypes.func.isRequired,
    oninspectionsectionchange: PropTypes.func.isRequired,
    ontoggleinspection: PropTypes.func.isRequired,
    thumbcount: PropTypes.number.isRequired,
    thumbnail: PropTypes.string,
    thumbs: PropTypes.object.isRequired,
    videos: PropTypes.array,
    yearpublished: PropTypes.number,
    reallynarrow: PropTypes.bool.isRequired,
}