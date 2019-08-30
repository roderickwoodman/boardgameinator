import React from 'react'
import { GameCardFront } from './GameCardFront'
import { GameCardBack } from './GameCardBack'


export class Game extends React.Component {

    render() {
        const { id, idunderinspection, inspectingsection, name, description, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, averageweightname, categories, mechanics, comments, videos, thumbs, thumbcount, ondelete, ontoggleinspection, oninspectionsectionchange } = this.props
        let gamecard
        let gamecardClasses = (id === idunderinspection) ? "game inspecting" : "game"
        if (id !== idunderinspection) {
            gamecard = <GameCardFront 
                id={id}
                name={name}
                yearpublished={yearpublished}
                minplayers={minplayers}
                maxplayers={maxplayers}
                minplaytime={minplaytime}
                maxplaytime={maxplaytime}
                averageweightname={averageweightname}
                categories={categories}
                mechanics={mechanics}
                thumbs={thumbs} 
                thumbcount={thumbcount} 
                ontoggleinspection={ontoggleinspection} 
                ondelete={ondelete} />
        } else {
            gamecard = <GameCardBack 
                id={id}
                name={name}
                yearpublished={yearpublished}
                description={description}
                inspectingsection={inspectingsection}
                comments={comments}
                videos={videos}
                ontoggleinspection={ontoggleinspection} 
                oninspectionsectionchange={oninspectionsectionchange} 
                ondelete={ondelete} />
        }
        return(
            <section className={gamecardClasses}>
                {gamecard}
            </section>
        )
    }
}