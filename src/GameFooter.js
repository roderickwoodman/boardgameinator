import React from 'react'
import bggLogo from './bgg-logo-50.png'

export const GameFooter = (props) => {
    return (
        <a href={'https://boardgamegeek.com/boardgame/' + props.gameid } target="_blank" rel="noopener noreferrer">
            <img src={bggLogo} alt="BoardGameGeek website logo" />
        </a>
    )
}