import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'

export const ViewControls = (props) => {
    return (
        <React.Fragment>
        <div id="gamesorting-controls">
            <span className='instructions'>
                <span className='circledNumber'>&#9314;</span>Sort the results.
            </span>
            <label>
                <input type='radio' key='maxvotes' id='maxvotes' name='sortorder' checked={props.sortby==='maxvotes'} value='maxvotes' onChange={props.onsortchange} /> 
                sort by thumbsup votes</label>
            <label>
                <input type='radio' key='maxplaytime' id='maxplaytime' name='sortorder' checked={props.sortby==='maxplaytime'} value='maxplaytime' onChange={props.onsortchange} /> 
                sort by playtime</label>
            <label>
                <input type='radio' key='maxplayers' id='maxplayers' name='sortorder' checked={props.sortby==='maxplayers'} value='maxplayers' onChange={props.onsortchange} /> 
                sort by player count</label>
        </div>
        <div id="gamefiltering-controls">
            <span className='instructions'>
                <span className='circledNumber'>&#9315;</span>Filter the results.
            </span>
            <label>
                <input type="checkbox" id="filterplayercount" checked={props.filterplayercount} onChange={props.onfilterchange} />
                show only games supporting the voted playercounts</label>
            <label>
                <input type="checkbox" id="filterweight" checked={props.filterweight} onChange={props.onfilterchange} />
                show only games matching the voted weights</label>
            <div className="status-messages">
                <p className="message"><FontAwesomeIcon icon={faLongArrowAltRight} /> {props.filtermessage}</p>
            </div>
        </div>
        </React.Fragment>
    )
}