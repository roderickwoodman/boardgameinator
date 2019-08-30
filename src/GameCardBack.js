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
        <li key={idx}><b>{comment.author}: </b>{comment.comment}</li>
    )
    return (
        <ul className="gamecard-details text">
            { comments }
        </ul>
    )
}

function Videos(props) {
    const videos = props.videos.map ( (video, idx) =>
        <li key={idx}><b>{video.author}: </b><a href={video.link} target="_blank" rel="noopener noreferrer">{video.title}</a></li>
    )
    return (
        <ul className="gamecard-details text">
            { videos }
        </ul>
    )
}

export class GameCardBack extends React.Component {

    render() {
        const { id, name, yearpublished, description, inspectingsection, comments, videos, ontoggleinspection, oninspectionsectionchange, ondelete } = this.props
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
                    <input type='radio' key='description' id='description' name='inspectingsection' checked={inspectingsection==='description'} value='description' onChange={oninspectionsectionchange} /> 
                    Description</label>
                <label>
                    <input type='radio' key='comments' id='comments' name='inspectingsection' checked={inspectingsection==='comments'} value='comments' onChange={oninspectionsectionchange} /> 
                    Comments</label>
                <label>
                    <input type='radio' key='videos' id='videos' name='inspectingsection' checked={inspectingsection==='videos'} value='videos' onChange={oninspectionsectionchange} /> 
                    Videos</label>
            </div>
            {inspectingsection === 'description' && (
                <Description description={description} />
            )}
            {inspectingsection === 'comments' && (
                <Comments comments={comments} />
            )}
            {inspectingsection === 'videos' && (
                <Videos videos={videos} />
            )}
            <section className="gamecard-footer">
                <GameFooter gameid={id}/>
            </section>
            </React.Fragment>
        )
    }
}