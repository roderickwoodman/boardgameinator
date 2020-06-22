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

    render() {
        return (
            <div 
                className="thumbnail" 
                data-attrtype="title"
                data-attrname={this.props.name}
                data-newvote="thumbsup"
                onClick={this.props.onnewvote}
                >
                <img src={this.props.url} alt="game box cover" />
                <div className={"vote-count " + ((this.props.allthumbs.total_title_votes > 0 || this.props.allthumbs.total_attribute_votes > 0) ? "" : "no-votes-to-show")}>
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
    onnewvote: PropTypes.func.isRequired,
    url: PropTypes.string,
}