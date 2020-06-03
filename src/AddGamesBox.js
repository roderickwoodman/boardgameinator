import React from 'react'
import PropTypes from 'prop-types'
import { AddByTitle } from './AddByTitle';


export class AddGamesBox extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            inputBy: 'title',
        }
        this.handleSectionChange = this.handleSectionChange.bind(this)
    }
  
    handleSectionChange(event) {
        let newSelection = event.target.id.replace(/select-/g, '')
        this.setState({
            inputBy: newSelection
        })
    }

    render() {
        return (
            <React.Fragment>

            <h4>Add board game(s) by title:</h4>

            <div id="input-section">
                <AddByTitle
                    allgames={this.props.allgames}
                    onnewtitle={this.props.onnewtitle} 
                />
            </div>

            </React.Fragment>
        )
    }
}

AddGamesBox.propTypes = {
    allgames: PropTypes.array.isRequired,
    onnewtitle: PropTypes.func.isRequired,
}