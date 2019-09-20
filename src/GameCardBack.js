import React from 'react'
import PropTypes from 'prop-types'
import { GameFooter } from './GameFooter'
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
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

Description.propTypes = {
    description: PropTypes.array.isRequired,
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

Comments.propTypes = {
    comments: PropTypes.array.isRequired,
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

Videos.propTypes = {
    videos: PropTypes.array.isRequired,
}

export class GameCardBack extends React.Component {

    render() {
        const { id, name, yearpublished, disambiguation, description, inspectingsection, comments, videos, ontoggleinspection, oninspectionsectionchange, ondelete } = this.props
        return (
            <React.Fragment>
            <section className="gamecard-header">
                <FontAwesomeIcon className="fa-button" icon={faTrash} onClick={ (e) => ondelete(e, id) }/>
                <FontAwesomeIcon className="fa-button" icon={faInfoCircle} onClick={ (e) => ontoggleinspection(e, id) }/>
            </section>
            <section className="gamecard-title">
                <h2 className="game-name">{name}</h2>
                <h4 className="game-yearpublished">({(yearpublished !== null) ? yearpublished : disambiguation})</h4>
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
            <TransitionGroup>
                {inspectingsection === "description" &&
                    <CSSTransition 
                        key={0}
                        in={true}
                        appear={false}
                        timeout={2000}
                        classNames={"showinspection"}
                    >
                        <Description description={description} />
                    </CSSTransition>
                }
                {inspectingsection === "comments" &&
                    <CSSTransition 
                        key={1}
                        in={true}
                        appear={false}
                        timeout={2000}
                        classNames={"showinspection"}
                    >
                        <Comments comments={comments} />
                    </CSSTransition>
                }
                {inspectingsection === "videos" &&
                    <CSSTransition 
                        key={2}
                        in={true}
                        appear={false}
                        timeout={2000}
                        classNames={"showinspection"}
                    >
                        <Videos videos={videos} />
                    </CSSTransition>
                }
            </TransitionGroup>
            <section className="gamecard-footer">
                <GameFooter gameid={id}/>
            </section>
            </React.Fragment>
        )
    }
}

GameCardBack.propTypes = {
    comments: PropTypes.array,
    description: PropTypes.array.isRequired,
    id: PropTypes.number.isRequired,
    inspectingsection: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    ondelete: PropTypes.func.isRequired,
    oninspectionsectionchange: PropTypes.func.isRequired,
    ontoggleinspection: PropTypes.func.isRequired,
    videos: PropTypes.array,
    yearpublished: PropTypes.number.isRequired,
}

GameCardBack.defaultProps = {
    comments: [{author: "ERROR", comment: "(no comments for this game exist on BoardGameGeek.com)"}],
    videos: [{author: "ERROR", link: "#", title: "(no videos for this game exist on BoardGameGeek.com)"}]
}