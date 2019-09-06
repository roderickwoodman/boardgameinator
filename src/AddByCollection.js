import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'


export class AddByCollection extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            value: '',
            statusMessages: []
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleReset = this.handleReset.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event) {
        this.setState({value: event.target.value})
    }

    handleReset(event) {
        this.setState({value: ""})
    }

    handleSubmit(event) {
        event.preventDefault()
        let username = this.state.value
        username=username    
            .trim()
            .replace(/[^0-9a-zA-Z ]/g, "")
        let messages = []
        messages.push('Collection of BGG user "' + username + '" will be searched (FIXME)')
        this.setState({ statusMessages: messages })
    }

    render() {
        return (
            <section id="input-by-collection">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label htmlFor="bggusername-input">BGG Username:</label>
                    <input type="text" value={this.state.value} onChange={this.handleChange} placeholder="(BoardGameGeek.com username)" required/>
                    <input type="reset" value="Reset" />
                    <input type="submit" value="Submit" />
                </form>
                <div className="status-messages">
                    { this.state.statusMessages
                        .map(
                            (message, i) => {
                                return (message.toLowerCase().startsWith("error"))
                                ? <p key={i} className="message error">{message}</p>
                                : <p key={i} className="message"><FontAwesomeIcon icon={faLongArrowAltRight} /> {message}</p>
                            }
                        )
                    }
                </div>
            </section>
        )
    }
}