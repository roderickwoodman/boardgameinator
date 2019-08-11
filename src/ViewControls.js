import React from 'react'

export const ViewControls = (props) => {
    return (
        <div id="sort-controls">
            <div>
                <label>
                    <input type='radio' key='maxplayers' id='maxplayers' name='sortorder' checked={props.sortby==='maxplayers'} value='maxplayers' onChange={props.onChange} /> 
                    sort by player count</label>
                <label>
                    <input type='radio' key='maxplaytime' id='maxplaytime' name='sortorder' checked={props.sortby==='maxplaytime'} value='maxplaytime' onChange={props.onChange} /> 
                    sort by playtime</label>
                <label>
                    <input type='radio' key='maxvotes' id='maxvotes' name='sortorder' checked={props.sortby==='maxvotes'} value='maxvotes' onChange={props.onChange} /> 
                    sort by thumbsup votes</label>
            </div>
        </div>
    )
}