import React from 'react'
import { VotableElement } from './VotableElement'

export class VotingBox extends React.Component {

    render() {
        return (
            <React.Fragment>
            <button data-attrtype="all" onClick={this.props.onclearsectionvotes}>CLEAR ALL</button>
            <ul id="supported-players">
                <li><b>PLAYERS:</b><button data-attrtype="players" onClick={this.props.onclearsectionvotes}>clear all</button></li>
                {this.props.playercounts.map((key, index) => {
                    return <VotableElement 
                        key={key.attrName}
                        preferences={this.props.thumbs['players']}
                        attrtype="players" 
                        attrname={key.attrName} 
                        attrcount={key.attrCount} 
                        onnewvote={this.props.onnewvote}/>
                })}
            </ul>
            <ul id="category-counts">
                <li><b>CATEGORY:</b><button data-attrtype="category" onClick={this.props.onclearsectionvotes}>clear all</button></li>
                {this.props.categorycounts.map((key, index) => {
                    return <VotableElement 
                        key={key.attrName}
                        preferences={this.props.thumbs['category']}
                        attrtype="category" 
                        attrname={key.attrName} 
                        attrcount={key.attrCount}
                        onnewvote={this.props.onnewvote}/>
                })}
            </ul>
            <ul id="mechanic-counts">
                <li><b>MECHANIC:</b><button data-attrtype="mechanic" onClick={this.props.onclearsectionvotes}>clear all</button></li>
                {this.props.mechaniccounts.map((key, index) => {
                    return <VotableElement 
                        key={key.attrName}
                        preferences={this.props.thumbs['mechanic']}
                        attrtype="mechanic" 
                        attrname={key.attrName} 
                        attrcount={key.attrCount}
                        onnewvote={this.props.onnewvote}/>
                })}
            </ul>
            </React.Fragment>
        )
    }
}