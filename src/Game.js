import React from 'react'
import { GameCardFront } from './GameCardFront'
import { GameCardBack } from './GameCardBack'


export class Game extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            viewingGameCardFront: true
        }
        this.toggleFrontBack = this.toggleFrontBack.bind(this)
    }

    toggleFrontBack() {
        this.setState(prevState => ({
            viewingGameCardFront: !prevState.viewingGameCardFront
        }))
    }

    render() {
        const { id, name, description, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, averageweightname, categories, mechanics, thumbs, thumbcount, ondelete } = this.props
        let cardWidth = (this.state.viewingGameCardFront) ? "game narrow" : "game wide"
        return (
            <section className={cardWidth}>
                { this.state.viewingGameCardFront 
                    ? <GameCardFront 
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
                        ontoggleside={this.toggleFrontBack} 
                        ondelete={ondelete} />
                    : <GameCardBack 
                        id={id}
                        name={name}
                        yearpublished={yearpublished}
                        description={description}
                        ontoggleside={this.toggleFrontBack} 
                        ondelete={ondelete} />
                }
            </section>
        )
    }
}