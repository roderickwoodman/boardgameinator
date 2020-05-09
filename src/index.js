import React from 'react'
import ReactDOM from 'react-dom'
import { Route, BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { Boardgameinator } from './Boardgameinator'


const routing = (
    <Router>
        <div>
            <Route path="/" component={Boardgameinator} />
        </div>
    </Router>
)

ReactDOM.render(routing, document.getElementById('root'))