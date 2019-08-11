import React from 'react'
import { GameFooter } from './GameFooter'

export const GameCardBack = (props) => {
    const { id, name, yearpublished, description } = props
    return (
        <section className="cardBack">
            <section className="details major">
                <h2 className="game-name">{name}</h2>
                <h4 className="game-yearpublished">({yearpublished})</h4>
            </section>
            <section className="details minor">
                <p>{description}</p>
            </section>
            <section>
                <GameFooter gameid={id}/>
            </section>
        </section>
    )
}