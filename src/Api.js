import { hardcodedPolls } from './ImportPoll'

export function exactSearchApi(title) {
    const url = 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&exact=1&query=' + title.replaceAll(' ', '+').replaceAll(':', '+')
    return (
        fetch(url)
        .then(exactSearchResponse => exactSearchResponse.text())
        .then(exactSearchText => parseSearchApiXml(exactSearchText))
    )
}

export function searchApi(title) {
    const url = 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&query='+ title.replaceAll(' ', '+').replaceAll(':', '+')
    return (
        fetch(url)
        .then(searchResponse => searchResponse.text())
        .then(searchText => parseSearchApiXml(searchText))
    )
}

export function gamedataApi(gameId) {
    const url =  'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&stats=1&ratingcomments=1&videos=1&id=' + gameId
    return (
        fetch(url)
        .then(gamedataResponse => gamedataResponse.text())
        .then(gamedataText => parseGamedataApiXml(gamedataText))
    )
}

function parseSearchApiXml(resp_str) {
    let games = []
    const responseDoc = new DOMParser().parseFromString(resp_str, 'application/xml')
    const gamesHtmlCollection = responseDoc.getElementsByTagName("item")
    for (const matchedGame of gamesHtmlCollection) {
        let game = {}
        game['id'] = parseInt(matchedGame.id)
        matchedGame.childNodes.forEach(
            function (node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if ( (node.tagName === "name") && (node.getAttribute("type") === "primary") ) {
                        game["name"] = node.getAttribute("value")
                    }
                    if (node.tagName === "yearpublished") {
                        game["yearPublished"] = parseInt(node.getAttribute("value"))
                    }
                }
            }
        )
        if ("name" in game) {
            games.push(game)
        }
        if (!("yearPublished" in game)) {
            game["yearPublished"] = null
        }
    }
    return games
}

function parseGamedataApiXml(str) {
    let game = {
        "attributes": {
            "categories": [], 
            "mechanics": []
        }
    }
    const responseDoc = new DOMParser().parseFromString(str, "application/xml")
    const gamesHtmlCollection = responseDoc.getElementsByTagName("item")
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
                        game["yearPublished"] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "minplayers") {
                        game.attributes["minPlayers"] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "maxplayers") {
                        game.attributes["maxPlayers"] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "minplaytime") {
                        game.attributes["minPlaytime"] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "maxplaytime") {
                        game.attributes["maxPlaytime"] = parseInt(node.getAttribute("value"))
                    }
                    if ( (node.tagName === "link")
                        && (node.getAttribute("type") === "boardgamecategory") ) {
                        game.attributes.categories.push(node.getAttribute("value"))
                    }
                    if ( (node.tagName === "link")
                        && (node.getAttribute("type") === "boardgamemechanic") ) {
                        game.attributes.mechanics.push(node.getAttribute("value"))
                    }
                    if ( node.tagName === "statistics") {
                        node.childNodes.forEach(
                            function (childNode) {
                                if (childNode.tagName === "ratings") {
                                    childNode.childNodes.forEach(
                                        function (grandchildNode) {
                                            if (grandchildNode.tagName === "numweights") {
                                                game["numWeights"] = grandchildNode.getAttribute("value")
                                            }
                                            if (grandchildNode.tagName === "averageweight") {
                                                game.attributes["averageWeight"] = grandchildNode.getAttribute("value")
                                                const weight = parseFloat(game.attributes.averageWeight)
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
                                                game.attributes["averageWeightName"] = weightname
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
                                    const comment = childNode.getAttribute("value")
                                    if (comment.length > 30 && comment.length < 800) {
                                        const author = childNode.getAttribute("username")
                                        const newComment = {"comment": comment, "author": author}
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
                                    const title = childNode.getAttribute("title")
                                    const link = childNode.getAttribute("link")
                                    const author = childNode.getAttribute("username")
                                    const newVideo = {"title": title, "link": link, "author": author}
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
    if ( Object.keys(game) && (!game.hasOwnProperty("yearPublished") || game["yearPublished"] === 0) ) {
        game["yearPublished"] = null
    }
    return game
}

function makeReadable(str) {
    const paragraphs = str
      .replace(/&amp;/g, '&')
      .replace(/&rsquo;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&ldquo;/g, '“')
      .replace(/&rdquo;/g, '”')
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '–')
      .replace(/&bull;/g, '∙')
      .replace(/&nbsp;/g, ' ')
      .split('&#10;');
    return paragraphs;
}

export function importpollApi(pollId) {
    console.log(`FIXME (WIP): implement the fetching of poll #${pollId}.`)
    const matchingPolls = hardcodedPolls.filter( poll => poll.id === pollId )
    return (matchingPolls.length === 1) ? matchingPolls[0] : null
}

export function voteinpollApi(pollId, gameId, newVote, user) {
    console.log(`FIXME (WIP): implement a "${newVote}" vote by ${user} in poll #${pollId} for game #${gameId}.`)
    return { }
}

export function clearmyvotesApi(pollId, user) {
    console.log(`FIXME (WIP): implement clearing all title votes by ${user} in poll #${pollId}.`)
    return { }
}

export function deletetitleinpollApi(pollId, gameId, user) {
    console.log(`FIXME (WIP): implement deleting game #${gameId} in poll #${pollId} by user ${user}.`)
    return { }
}
