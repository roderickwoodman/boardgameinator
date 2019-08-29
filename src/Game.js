import React from 'react'
import { GameCardFront } from './GameCardFront'
import { GameCardBack } from './GameCardBack'


export class Game extends React.Component {

    render() {
        const { id, underinspection, name, description, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, averageweightname, categories, mechanics, comments, thumbs, thumbcount, ondelete, ontoggleinspection } = this.props
        let gamecard
        let gamecardClasses = (id === underinspection) ? "game inspecting" : "game"
        if (id !== underinspection) {
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
                comments={comments}
                ontoggleinspection={ontoggleinspection} 
                ondelete={ondelete} />
        }
        return(
            <section className={gamecardClasses}>
                {gamecard}
            </section>
        )
    }
}