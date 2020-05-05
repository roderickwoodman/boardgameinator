import React from 'react'
import PropTypes from 'prop-types'
import { AddByCollection } from './AddByCollection';
import { AddByTitle } from './AddByTitle';
import { AddedList } from './AddedList';
import { TransitionGroup, CSSTransition } from 'react-transition-group';


export class AddGamesBox extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            inputBy: 'title',
        }
        this.handleSectionChange = this.handleSectionChange.bind(this)
        this.gamedataApi = this.gamedataApi.bind(this)
        this.doGamedataApi = this.doGamedataApi.bind(this)
        this.parseGamedataApiXml = this.parseGamedataApiXml.bind(this)
        this.parseIntoParagraphs = this.parseIntoParagraphs.bind(this)
    }

    gamedataApi(gameId) {
        return 'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&stats=1&ratingcomments=1&videos=1&id=' + gameId
    }

    doGamedataApi(gameId) {
        return fetch(this.gamedataApi(gameId))
    }

    parseGamedataApiXml(str) {
        let game = {"categories": [], "mechanics": []}
        let responseDoc = new DOMParser().parseFromString(str, "application/xml")
        let gamesHtmlCollection = responseDoc.getElementsByTagName("item")
        let makeReadable = this.parseIntoParagraphs
        if (gamesHtmlCollection.length) {
            game["id"] = parseInt(gamesHtmlCollection[0].id)
            gamesHtmlCollection[0].childNodes.forEach(
                function (node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ( (node.tagName === "name") && (node.getAttribute("type") === "primary") ) {
                            game["name"] = node.getAttribute("value")
                        }
                        if (node.tagName === "thumbnail") {
                            game["thumbnail"] = node.innerHTML
                        }
                        if (node.tagName === "description") {
                            game["description"] = makeReadable(node.innerHTML)
                        }
                        if (node.tagName === "yearpublished") {
                            game["yearpublished"] = parseInt(node.getAttribute("value"))
                        }
                        if (node.tagName === "minplayers") {
                            game["minplayers"] = parseInt(node.getAttribute("value"))
                        }
                        if (node.tagName === "maxplayers") {
                            game["maxplayers"] = parseInt(node.getAttribute("value"))
                        }
                        if (node.tagName === "minplaytime") {
                            game["minplaytime"] = parseInt(node.getAttribute("value"))
                        }
                        if (node.tagName === "maxplaytime") {
                            game["maxplaytime"] = parseInt(node.getAttribute("value"))
                        }
                        if ( (node.tagName === "link")
                            && (node.getAttribute("type") === "boardgamecategory") ) {
                            if (game.hasOwnProperty("categories")) {
                                game["categories"].push(node.getAttribute("value"))
                            } else {
                                game["categories"] = [node.getAttribute("value")]
                            }
                        }
                        if ( (node.tagName === "link")
                            && (node.getAttribute("type") === "boardgamemechanic") ) {
                            if (game.hasOwnProperty("mechanics")) {
                                game["mechanics"].push(node.getAttribute("value"))
                            } else {
                                game["mechanics"] = [node.getAttribute("value")]
                            }
                        }
                        if ( node.tagName === "statistics") {
                            node.childNodes.forEach(
                                function (childNode) {
                                    if (childNode.tagName === "ratings") {
                                        childNode.childNodes.forEach(
                                            function (grandchildNode) {
                                                if (grandchildNode.tagName === "numweights") {
                                                    game["numweights"] = grandchildNode.getAttribute("value")
                                                }
                                                if (grandchildNode.tagName === "averageweight") {
                                                    game["averageweight"] = grandchildNode.getAttribute("value")
                                                    let weight = parseFloat(game.averageweight)
                                                    let weightname = null
                                                    if (weight < 1.5) {
                                                        weightname = "light"
                                                    } else if (weight < 2.5) {
                                                        weightname = "medium light"
                                                    } else if (weight < 3.5) {
                                                        weightname = "medium"
                                                    } else if (weight < 4.5) {
                                                        weightname = "medium heavy"
                                                    } else {
                                                        weightname = "heavy"
                                                    }
                                                    game["averageweightname"] = weightname
                                                }
                                            }
                                        )
                                    }
                                }
                            )
                        }
                        if ( node.tagName === "comments") {
                            node.childNodes.forEach(
                                function (childNode) {
                                    if (childNode.tagName === "comment") {
                                        let comment = childNode.getAttribute("value")
                                        if (comment.length > 30 && comment.length < 800) {
                                            let author = childNode.getAttribute("username")
                                            let newComment = {"comment": comment, "author": author}
                                            if (game.hasOwnProperty("comments")) {
                                                game["comments"].push(newComment)
                                            } else {
                                                game["comments"] = [newComment]
                                            }
                                        }
                                    }
                        })}
                        if ( node.tagName === "videos") {
                            node.childNodes.forEach(
                                function (childNode) {
                                    if ((childNode.tagName === "video") 
                                        && (childNode.getAttribute("language") === "English")
                                        && (childNode.getAttribute("category") === "review")) {
                                        let title = childNode.getAttribute("title")
                                        let link = childNode.getAttribute("link")
                                        let author = childNode.getAttribute("username")
                                        let newVideo = {"title": title, "link": link, "author": author}
                                        if (game.hasOwnProperty("videos")) {
                                            game["videos"].push(newVideo)
                                        } else {
                                            game["videos"] = [newVideo]
                                        }
                                    }
                        })}
                    }
                }
            )
        }
        if ( Object.keys(game) && (!game.hasOwnProperty("yearpublished") || game["yearpublished"] === 0) ) {
            game["yearpublished"] = null
        }
        return game
    }

    parseIntoParagraphs(str) {
        let paragraphs = str
          .replace(/&amp;/g, '&')
          .replace(/&rsquo;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&ndash;/g, '–')
          .split('&#10;');
        return paragraphs;
    }
  
    handleSectionChange(event) {
        let newSelection = event.target.id.replace(/select-/g, '')
        this.setState({
            inputBy: newSelection
        })
    }

    render() {
        return (
            <React.Fragment>

            <span className="instructions">
                <span className="leftGroup">
                    <span className="circledNumber">&#9312;</span>Add your games.
                </span>
                <button className="rightGroup default-styles" onClick={this.props.ondeleteall} disabled={this.props.allgames.length===0}>Remove All</button>
            </span>

            <ul id="inputsection-selector">
                <li id="select-title" className={"selector" + (this.state.inputBy === "title" ? " selected" : "")} onClick={this.handleSectionChange}>By Title</li>
                <li id="select-collection" className={"selector" + (this.state.inputBy === "collection" ? " selected" : "")} onClick={this.handleSectionChange}>By Collection</li>
                <li id="select-addedlist" className={"selector" + (this.state.inputBy === "addedlist" ? " selected" : "")} onClick={this.handleSectionChange}>Added List</li>
            </ul>

            <div id="input-section">
                <TransitionGroup>
                {this.state.inputBy === 'title' &&
                    <CSSTransition
                        key={0}
                        in={true}
                        appear={false}
                        timeout={2000}
                        classNames={"showsegment"}
                    >
                        <AddByTitle
                            allgames={this.props.allgames}
                            onnewtitle={this.props.onnewtitle} 
                            dogamedataapi={this.doGamedataApi}
                            parsegamedataxml={this.parseGamedataApiXml}
                        />
                    </CSSTransition>
                }
                {this.state.inputBy === 'collection' &&
                    <CSSTransition
                        key={1}
                        in={true}
                        appear={false}
                        timeout={2000}
                        classNames={"showsegment"}
                    >
                        <AddByCollection />
                    </CSSTransition>
                }
                {this.state.inputBy === 'addedlist' &&
                    <CSSTransition
                        key={2}
                        in={true}
                        appear={false}
                        timeout={2000}
                        classNames={"showsegment"}
                    >
                        <AddedList
                            allgames={this.props.allgames} 
                            ondelete={this.props.ondelete} 
                        />
                    </CSSTransition>
                }
                </TransitionGroup>
            </div>

            </React.Fragment>
        )
    }
}

AddGamesBox.propTypes = {
    allgames: PropTypes.array.isRequired,
    ondelete: PropTypes.func.isRequired,
    ondeleteall: PropTypes.func.isRequired,
    onnewtitle: PropTypes.func.isRequired,
}