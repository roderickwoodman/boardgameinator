export function exactSearchApi(title) {
    return 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&exact=1&query=' + title.replace(' ', '+')
}

export function searchApi(title) {
    return 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&query='+ title.replace(' ', '+')
}

export function gamedataApi(gameId) {
    return 'https://boardgamegeek.com/xmlapi2/thing?type=boardgame&stats=1&ratingcomments=1&videos=1&id=' + gameId
}