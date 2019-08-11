import React from 'react'
import { render } from 'react-dom'
import './index.css'
import { Boardgameinator } from './Boardgameinator'


let gameListDefault = [
    {
        "id": 0, 
        "name":"(no name info)",
        "description":"(no description)",
        "yearpublished":0,
        "minplayers":0,
        "maxplayers":0,
        "minplaytime":0,
        "maxplaytime":0,
        "categories":null,
        "mechanics":null
    }
]

render(
    <Boardgameinator games={gameListDefault}/>,
    document.getElementById('root')
)