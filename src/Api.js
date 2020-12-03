export function exactSearchApi(title) {
    let url = 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&exact=1&query=' + title.replaceAll(' ', '+').replaceAll(':', '+')
    return (
        fetch(url)
        .then(exactSearchResponse => exactSearchResponse.text())
        .then(exactSearchText => parseSearchApiXml(exactSearchText))
    )
}

export function searchApi(title) {
    let url = 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&query='+ title.replaceAll(' ', '+').replaceAll(':', '+')
    return (
        fetch(url)
        .then(searchResponse => searchResponse.text())
        .then(searchText => parseSearchApiXml(searchText))
    )
}

export function gamedataApi(gameId) {
    let url =  'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&stats=1&ratingcomments=1&videos=1&id=' + gameId
    return (
        fetch(url)
        .then(gamedataResponse => gamedataResponse.text())
        .then(gamedataText => parseGamedataApiXml(gamedataText))
    )
}

function parseSearchApiXml(resp_str) {
    let games = []
    let responseDoc = new DOMParser().parseFromString(resp_str, 'application/xml')
    let gamesHtmlCollection = responseDoc.getElementsByTagName("item")
    for (let matchedGame of gamesHtmlCollection) {
        let game = {}
        game['id'] = parseInt(matchedGame.id)
        matchedGame.childNodes.forEach(
            function (node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if ( (node.tagName === "name") && (node.getAttribute("type") === "primary") ) {
                        game["name"] = node.getAttribute("value")
                    }
                    if (node.tagName === "yearpublished") {
                        game["year_published"] = parseInt(node.getAttribute("value"))
                    }
                }
            }
        )
        if ("name" in game) {
            games.push(game)
        }
        if (!("year_published" in game)) {
            game["year_published"] = null
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
    let responseDoc = new DOMParser().parseFromString(str, "application/xml")
    let gamesHtmlCollection = responseDoc.getElementsByTagName("item")
    let makeReadable = parseIntoParagraphs
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
                        game["year_published"] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "minplayers") {
                        game.attributes["min_players"] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "maxplayers") {
                        game.attributes["max_players"] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "minplaytime") {
                        game.attributes["min_playtime"] = parseInt(node.getAttribute("value"))
                    }
                    if (node.tagName === "maxplaytime") {
                        game.attributes["max_playtime"] = parseInt(node.getAttribute("value"))
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
                                                game["num_weights"] = grandchildNode.getAttribute("value")
                                            }
                                            if (grandchildNode.tagName === "averageweight") {
                                                game.attributes["average_weight"] = grandchildNode.getAttribute("value")
                                                let weight = parseFloat(game.attributes.average_weight)
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
                                                game.attributes["average_weight_name"] = weightname
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
    if ( Object.keys(game) && (!game.hasOwnProperty("year_published") || game["year_published"] === 0) ) {
        game["year_published"] = null
    }
    return game
}

function parseIntoParagraphs(str) {
    let paragraphs = str
      .replace(/&amp;/g, '&')
      .replace(/&rsquo;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '–')
      .replace(/&bull;/g, '∙')
      .replace(/&nbsp;/g, ' ')
      .split('&#10;');
    return paragraphs;
}

export function voteinpollApi(poll_id, game_id, newvote, user) {
    console.log('FIXME (WIP): implement a "' + newvote + '" vote by ' + user + ' in poll #' + poll_id + ' for game #' + game_id + '.')
    return { }
}

export function clearmyvotesApi(poll_id, user) {
    console.log('FIXME (WIP): implement clearing all title votes by ' + user + ' in poll #' + poll_id + '.')
    return { }
}

export function deletetitleinpollApi(poll_id, game_id, user) {
    console.log('FIXME (WIP): implement deleting game #' + game_id + ' in poll #' + poll_id + ' by user ' + user + '.')
    return { }
}
