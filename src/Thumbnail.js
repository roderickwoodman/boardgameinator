import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

export class Thumbnail extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
        this.getAttributeCountLabel = this.getAttributeCountLabel.bind(this)
        this.getClasses = this.getClasses.bind(this)
    }

    getAttributeCountLabel(attributecount) {
        let label
        if (this.props.reallynarrow) {
            label = 'attr.'
        } else if (attributecount !== 1) {
            label = 'attributes'
        } else {
            label = 'attribute'
        }
        return label
    }

    getClasses() {
        let classes = 'vote-count'
        if (this.props.allthumbs.total_title_votes === 0) {
            classes += ' no-votes-to-show'
        }
        return classes
    }

    render() {
        return (
            <div className="thumbnail">
                <img src={this.props.url} alt="game box cover" />
                <div className={this.getClasses()}>
                    <FontAwesomeIcon icon={faThumbsUp} /> {this.props.thumbcounts.titles} 
                    <span className="vote-count-label">& {this.props.thumbcounts.attributes} {this.getAttributeCountLabel(this.props.thumbcounts.attributes)}</span>
                </div>
            </div>
        )
    }
}

Thumbnail.propTypes = {
    allthumbs: PropTypes.object.isRequired,
    thumbcounts: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    reallynarrow: PropTypes.bool.isRequired,
    url: PropTypes.string,
}