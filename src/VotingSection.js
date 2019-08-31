import React from 'react'
import PropTypes from 'prop-types'
import { VotableElement } from './VotableElement'

export class VotingSection extends React.Component {

    render() {
        return (
            <ul id={this.props.elementid}>
                <li><b>{this.props.title}</b><button data-attrtype={this.props.type} onClick={this.props.onclearsectionvotes}>clear section votes</button></li>
                {this.props.counts.map((key, index) => {
                    return <VotableElement 
                        key={key.attrName}
                        counts={this.props.counts}
                        preferences={this.props.thumbs}
                        attrtype={this.props.type}
                        attrname={key.attrName} 
                        attrcount={key.attrCount} 
                        onnewvote={this.props.onnewvote}/>
                })}
            </ul>
        )
    }
}

VotingSection.propTypes = {
    counts: PropTypes.array.isRequired,
    elementid: PropTypes.string.isRequired,
    onclearsectionvotes: PropTypes.func.isRequired,
    onnewvote: PropTypes.func.isRequired,
    thumbs: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
}