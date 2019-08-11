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
        const { id, name, description, yearpublished, minplayers, maxplayers, minplaytime, maxplaytime, categories, mechanics, thumbs, thumbcount } = this.props

        return (
            <section className="game">
                <section className="details">
                    <button onClick={this.toggleFrontBack}>more...</button>
                </section>
                { this.state.viewingGameCardFront 
                    ? <GameCardFront 
                        id={id}
                        name={name}
                        yearpublished={yearpublished}
                        minplayers={minplayers}
                        maxplayers={maxplayers}
                        minplaytime={minplaytime}
                        maxplaytime={maxplaytime}
                        categories={categories}
                        mechanics={mechanics}
                        thumbs={thumbs} 
                        thumbcount={thumbcount} />
                    : <GameCardBack 
                        id={id}
                        name={name}
                        yearpublished={yearpublished}
                        description={description}/>
                }
            </section>
        )
    }
}