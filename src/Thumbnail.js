import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

export class Thumbnail extends React.Component {

    render() {
        return (
            <div className="thumbnail">
                <img src={this.props.url} alt="game box cover" />
                <div className={"vote-count " + ((this.props.allthumbs.total_attribute_votes > 0) ? "" : "no-attribute-votes")}>
                    <FontAwesomeIcon icon={faThumbsUp} />:{this.props.thumbcount} 
                    <span className="vote-count-label">{this.props.thumbcount === 1 ? 'attribute' : 'attributes'}</span>
                </div>
            </div>
        )
    }
}

Thumbnail.propTypes = {
    allthumbs: PropTypes.object.isRequired,
    thumbcount: PropTypes.number.isRequired,
    url: PropTypes.string,
}