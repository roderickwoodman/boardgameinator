import React from 'react'


export class GamesAdded extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            statusMessages: []
        }
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) {
        console.log(event.target.value)
    }

    render() {
        return (
            <section id="games-added">
                { this.props.allgames.length >= 0 && (
                    this.props.allgames
                        .sort( (a, b) => (a.name > b.name) ? 1 : -1 )
                        .map(
                            (game, i) => {
                                return <p key={i} className="listing">{game.name} ({game.yearpublished})</p>
                            })
                )}
                { this.props.allgames.length === 0 && (
                    <span className="message warning">
                    <p>Please add game titles using the forms in this section.</p>
                    </span>
                )}
            </section>
        )
    }
}