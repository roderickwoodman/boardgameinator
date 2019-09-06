import React from 'react'
import PropTypes from 'prop-types'
import { AddByCollection } from './AddByCollection';
import { AddByTitle } from './AddByTitle';
import { AddedList } from './AddedList';

export class AddGamesBox extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            inputBy: 'title',
        }
        this.handleSectionChange = this.handleSectionChange.bind(this)
    }

    handleSectionChange(event) {
        this.setState({
            inputBy: event.target.value
        })
    }

    render() {
        return (
            <React.Fragment>

            <span className="instructions">
                <span className="circledNumber">&#9312;</span>Add your games.
            </span>

            <div id="inputsection-selector">
                <div>
                    <label>
                        <input type='radio' key='title' id='title' name='inputsection' checked={this.state.inputBy==='title'} value='title' onChange={this.handleSectionChange} /> 
                        By Title</label>
                    <label>
                        <input type='radio' key='collection' id='collection' name='inputsection' checked={this.state.inputBy==='collection'} value='collection' onChange={this.handleSectionChange} /> 
                        By Collection</label>
                    <label>
                        <input type='radio' key='addedlist' id='addedlist' name='inputsection' checked={this.state.inputBy==='addedlist'} value='addedlist' onChange={this.handleSectionChange} /> 
                        Added List</label>
                </div>
            </div>

            <div id="input-section">
                {this.state.inputBy === 'title' && (
                    <AddByTitle
                        allgames={this.props.allgames}
                        onnewtitle={this.props.onnewtitle} />
                )}
                {this.state.inputBy === 'collection' && (
                    <AddByCollection />
                )}
                {this.state.inputBy === 'addedlist' && (
                    <AddedList
                        allgames={this.props.allgames} 
                        ondelete={this.props.ondelete}
                        ondeleteall={this.props.ondeleteall} />
                )}
            </div>

            </React.Fragment>
        )
    }
}

AddGamesBox.propTypes = {
    allgames: PropTypes.array.isRequired,
    ondelete: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
    onnewtitle: PropTypes.func.isRequired,
}