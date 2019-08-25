import React from 'react'
import { GameFooter } from './GameFooter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'


export const GameCardBack = (props) => {
    const { id, name, yearpublished, description, ontoggleside, ondelete } = props
    return (
        <section className="card-back">
            <section className="details">
                <button onClick={ontoggleside}>more...</button>
                <button onClick={ (e) => ondelete(e, id) }>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </section>
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