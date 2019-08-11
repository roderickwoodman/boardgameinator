import React from 'react'

export class VotableElement extends React.Component {

    render() {
        let myVote = this.props.preferences.hasOwnProperty(this.props.attrname) 
            ? 'thumbsup' //FIXME, derive from props: this.props.preferences['attrVote']
            : 'novote'
        return (
            <li 
                key={this.props.attrname} 
                className={myVote} 
                data-attrtype={this.props.attrtype}
                data-attrname={this.props.attrname}
                data-newvote='thumbsup'
                onClick={this.props.onnewvote}
            >
                {this.props.attrname} ({this.props.attrcount})
            </li>
        )
    }
}