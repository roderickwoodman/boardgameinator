import React from 'react'


export class TitleInput extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            stagedGames: [],
            value: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.searchApi = this.searchApi.bind(this)
        this.validateUserTitles = this.validateUserTitles.bind(this)
    }

    searchApi(gameTitle) {
        return 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&exact=1&query=' + gameTitle.replace(' ', '+')
    }

    async validateUserTitles(gameTitles) {
        const gameInfoJsonArray = await Promise.all(
            gameTitles.map(
                gameTitle =>
                    fetch(this.searchApi(gameTitle))
                        .then(searchResponse => searchResponse.text())
                        .then(searchText => this.extractFromSearchApiXml(searchText))
            ))
        gameInfoJsonArray.forEach( (info, idx) => {
            if (Object.entries(info).length !== 0) {
                this.props.onnewtitle(info.id)
            }
        })
        this.setState({ stagedGames: gameInfoJsonArray })
    }

    extractFromSearchApiXml(str) {

        let game = {}
        let responseDoc = new DOMParser().parseFromString(str, 'application/xml')
        let gamesHtmlCollection = responseDoc.getElementsByTagName("item")
        if (gamesHtmlCollection.length) {
            game['id'] = gamesHtmlCollection[0].id
            gamesHtmlCollection[0].childNodes.forEach(
                function (node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ( (node.tagName === "name") && (node.getAttribute("type") === "primary") ) {
                            game['name'] = node.getAttribute("value")
                        }
                        if (node.tagName === "yearpublished") {
                            game['yearpublished'] = parseInt(node.getAttribute("value"))
                        }
                    }
                }
            )
        }
        return game
    }

    handleChange(event) {
        this.setState({value: event.target.value})
    }

    handleSubmit(event) {
        event.preventDefault()
        let gameTitlesArray = [this.state.value]
        this.validateUserTitles(gameTitlesArray)
    }

    render() {
        return (
            <React.Fragment>

            <span className='instructions'>
                <span className='circledNumber'>&#9312;</span>Input your games.
            </span>

            <form onSubmit={this.handleSubmit}>
                <label>
                    Game Title:
                    <input type="text" value={this.state.value} onChange={this.handleChange} placeholder="(fixme: not working yet)" />
                </label>
                <input type="submit" value="Submit" />
            </form>

            </React.Fragment>
        )
    }
}