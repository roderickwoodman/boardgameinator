import React from 'react'
import PropTypes from 'prop-types'
import { GameCardFront } from './GameCardFront'
import { GameCardBack } from './GameCardBack'


export class Game extends React.Component {

    render() {
        const { id, idunderinspection, inspectingsection, name, thumbnail, description, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, averageweightname, categories, mechanics, comments, videos, totalattributevotes, thumbs, thumbcount, ondelete, ontoggleinspection, oninspectionsectionchange, reallynarrow } = this.props
        let gamecard
        let gamecardClasses = (id === idunderinspection) ? "game inspecting" : "game"
        if (id !== idunderinspection) {
            gamecard = <GameCardFront 
                id={id}
                thumbnail={thumbnail}
                name={name}
                yearpublished={yearpublished}
                minplayers={minplayers}
                maxplayers={maxplayers}
                minplaytime={minplaytime}
                maxplaytime={maxplaytime}
                averageweightname={averageweightname}
                categories={categories}
                mechanics={mechanics}
                totalattributevotes={totalattributevotes}
                thumbs={thumbs} 
                thumbcount={thumbcount} 
                ontoggleinspection={ontoggleinspection} 
                ondelete={ondelete} />
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
                totalattributevotes={totalattributevotes}
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
    averageweightname: PropTypes.string.isRequired,
    categories: PropTypes.array.isRequired,
    comments: PropTypes.array,
    description: PropTypes.array.isRequired,
    id: PropTypes.number.isRequired,
    idunderinspection: PropTypes.number,
    inspectingsection: PropTypes.string.isRequired,
    maxplayers: PropTypes.number.isRequired,
    maxplaytime: PropTypes.number.isRequired,
    mechanics: PropTypes.array.isRequired,
    minplayers: PropTypes.number.isRequired,
    minplaytime: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    ondelete: PropTypes.func.isRequired,
    oninspectionsectionchange: PropTypes.func.isRequired,
    ontoggleinspection: PropTypes.func.isRequired,
    totalattributevotes: PropTypes.number.isRequired,
    thumbcount: PropTypes.number.isRequired,
    thumbnail: PropTypes.string,
    thumbs: PropTypes.object.isRequired,
    videos: PropTypes.array,
    yearpublished: PropTypes.number,
    reallynarrow: PropTypes.bool.isRequired,
}