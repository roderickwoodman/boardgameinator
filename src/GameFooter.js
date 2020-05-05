import React from 'react'
import PropTypes from 'prop-types'
import bggLogo from './bgg-logo-50.png'

export const GameFooter = (props) => {
    return (
        <div className="footer">
            <a href={"https://boardgamegeek.com/boardgame/" + props.gameid } rel="noopener noreferrer">
                this on BGG
            </a>&nbsp;
            <img src={bggLogo} alt="BoardGameGeek logo" />
        </div>
    )
}

GameFooter.propTypes = {
    gameid: PropTypes.number.isRequired,
}