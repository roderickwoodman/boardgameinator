import React from 'react'
import PropTypes from 'prop-types'
import { Thumbnail } from './Thumbnail'
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
        <section className="gamecard-description">
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
        <ul className="gamecard-comments">
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
        <ul className="gamecard-videos">
            { videos }
        </ul>
    )
}

Videos.propTypes = {
    videos: PropTypes.array.isRequired,
}

export class GameCardBack extends React.Component {

    render() {

        const { id, name, yearpublished, description, inspectingsection, comments, videos, allthumbs, ontoggleinspection, oninspectionsectionchange, onnewvote, ondelete, thumbnail, thumbcounts } = this.props
        return (
            <React.Fragment>
            <section className="gamecard-header">
                <button className="fa fa-button" onClick={ (e) => ondelete(e, id) }><FontAwesomeIcon icon={faTrash}/></button>
                <button className="fa fa-button inspect" onClick={ (e) => ontoggleinspection(e, id) }><FontAwesomeIcon icon={faInfoCircle}/></button>
            </section>
            <section className="gamecard-collapse-control">
                <button className="fa fa-button inspect" onClick={ (e) => ontoggleinspection(e, id) }><FontAwesomeIcon icon={faInfoCircle}/></button>
            </section>
            <section className="gamecard-title">
                <h5 className="game-name">{name}</h5>
                {(yearpublished !== null) 
                    ? <h6 className="game-yearpublished">({yearpublished})</h6>
                    : <h6 className="game-yearpublished">(#{id})</h6>
                }
            </section>
            <section 
                className="gamecard-visual"
                data-attrtype="title"
                data-attrname={name}
                data-newvote="thumbsup"
                onClick={this.props.onnewvote}
                >
                <Thumbnail name={name} url={thumbnail} allthumbs={allthumbs} thumbcounts={thumbcounts} onnewvote={onnewvote} />

            </section>
            <ul id="inspectionsection-selector">
                <li id="select-description" className={"selector darkbg" + (inspectingsection === "description" ? " selected" : "")} onClick={oninspectionsectionchange}>{this.props.reallynarrow ? 'Desc.' : 'Description'}</li>
                <li id="select-comments" className={"selector darkbg" + (inspectingsection === "comments" ? " selected" : "")} onClick={oninspectionsectionchange}>Comments</li>
                <li id="select-videos" className={"selector darkbg" + (inspectingsection === "videos" ? " selected" : "")} onClick={oninspectionsectionchange}>Videos</li>
            </ul>
            <section className="gamecard-variable">
                <TransitionGroup>
                    {inspectingsection === "description" &&
                        <CSSTransition 
                            key={0}
                            in={true}
                            appear={false}
                            timeout={2000}
                            classNames={"showsegment"}
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
                            classNames={"showsegment"}
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
                            classNames={"showsegment"}
                        >
                            <Videos videos={videos} />
                        </CSSTransition>
                    }
                </TransitionGroup>
            </section>
            <section className="gamecard-footer">
                <GameFooter gameid={id}/>
            </section>
            </React.Fragment>
        )
    }
}

GameCardBack.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    yearpublished: PropTypes.number,
    description: PropTypes.array.isRequired,
    inspectingsection: PropTypes.string.isRequired,
    allthumbs: PropTypes.object.isRequired,
    thumbcounts: PropTypes.object.isRequired,
    comments: PropTypes.array,
    videos: PropTypes.array,
    ontoggleinspection: PropTypes.func.isRequired,
    oninspectionsectionchange: PropTypes.func.isRequired,
    onnewvote: PropTypes.func.isRequired,
    ondelete: PropTypes.func.isRequired,
    reallynarrow: PropTypes.bool.isRequired,
}

GameCardBack.defaultProps = {
    comments: [{author: "ERROR", comment: "(no comments for this game exist on BoardGameGeek.com)"}],
    videos: [{author: "ERROR", link: "#", title: "(no videos for this game exist on BoardGameGeek.com)"}]
}