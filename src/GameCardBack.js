import React from 'react'
import { GameFooter } from './GameFooter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'


export const GameCardBack = (props) => {
    const { id, name, yearpublished, description, ontoggleinspection, ondelete } = props
    return (
        <section className="game inspecting">
            <section className="gamecard-header">
                <button id={id} onClick={ontoggleinspection}>more...</button>
                <button onClick={ (e) => ondelete(e, id) }>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </section>
            <section className="gamecard-title">
                <h2 className="game-name">{name}</h2>
                <h4 className="game-yearpublished">({yearpublished})</h4>
            </section>
            <section className="gamecard-details minor">
                <p>{description}</p>
            </section>
            <section className="gamecard-footer">
                <GameFooter gameid={id}/>
            </section>
        </section>
    )
}