import React from 'react'
import { GameFooter } from './GameFooter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'


function Description(props) {
    const paragraphs = props.description.map ( (paragraph, idx) =>
        <p key={idx}>{paragraph}</p>
    )
    return (
        <section className="gamecard-details text">
            { paragraphs }
        </section>
    )
}

function Comments(props) {
    const comments = props.comments.map ( (comment, idx) =>
        <li key={idx}>{comment}</li>
    )
    return (
        <ul className="gamecard-details text">
            { comments }
        </ul>
    )
}

export class GameCardBack extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            inspecting: 'description',
        }
        this.handleSectionChange = this.handleSectionChange.bind(this)
    }

    handleSectionChange(event) {
        this.setState({
            inspecting: event.target.value
        })
    }

    render() {
        const { id, name, yearpublished, description, comments, ontoggleinspection, ondelete } = this.props
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
            <div id="inspectionsection-selector">
                <label>
                    <input type='radio' key='description' id='description' name='inspectingsection' checked={this.state.inspecting==='description'} value='description' onChange={this.handleSectionChange} /> 
                    Description</label>
                <label>
                    <input type='radio' key='comments' id='comments' name='inspectingsection' checked={this.state.inspecting==='comments'} value='comments' onChange={this.handleSectionChange} /> 
                    Comments</label>
                <label>
                    <input type='radio' key='videos' id='videos' name='inspectingsection' checked={this.state.inspecting==='videos'} value='videos' onChange={this.handleSectionChange} /> 
                    Videos</label>
            </div>
            {this.state.inspecting === 'description' && (
                <Description description={description} />
            )}
            {this.state.inspecting === 'comments' && (
                <Comments comments={comments} />
            )}
            {this.state.inspecting === 'videos' && (
                <i className="warning">Videos section is TBI</i>
            )}
            <section className="gamecard-footer">
                <GameFooter gameid={id}/>
            </section>
            </React.Fragment>
        )
    }
}