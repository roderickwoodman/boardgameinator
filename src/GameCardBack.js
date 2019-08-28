import React from 'react'
import { GameFooter } from './GameFooter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'


function Description(props) {
    const paragraphs = props.description.map ( (paragraph, idx) =>
        <p key={idx}>{paragraph}</p>
    )
    return (
        <section className="gamecard-details minor">
            { paragraphs }
        </section>
    )
}

export const GameCardBack = (props) => {
    const { id, name, yearpublished, description, ontoggleinspection, ondelete } = props
    return (
        <React.Fragment>
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
        <Description description={description} />
        <section className="gamecard-footer">
            <GameFooter gameid={id}/>
        </section>
        </React.Fragment>
    )
}