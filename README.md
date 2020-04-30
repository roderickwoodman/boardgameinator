([click here to visit this app on the Internet!](https://roderickwoodman.github.io/boardgameinator/))

## Boardgameinator
*A board game comparison site*

### What is this thing?

Behold, the **BOARDGAMEINATOR**!  (...said in my best [Dr. Doofenshmirtz](https://www.youtube.com/watch?v=Sj7yxI-r_ag) accent)

This app is a sandbox for users to prioritize a list of boardgames that they are considering playing or purchasing. Once a game has been added (by name), the user is given a set of that game's characteristics for upvoting. And the more upvoted characteristics a game gets, the higher it will bubble up in the user's overall ranking of all of the added games.

### Who is it for?

First of all, **Boardgameinator** IS NOT for geeks to manage their huge collections.

Instead, this app IS for anyone who feels overwhelmed or who has stalled out in selecting a boardgame. And with all of the new titles and all of the hype these days, I do feel your pain.

### Why is it so awesome?

The likability of any board game is so subjective and multifactorial. And unfortunately, the primary online  resource for the industry is a firehose of information called [BoardGameGeek](https://boardgamegeek.com) (BGG), which can be a bit overwhelming for casual boardgamers. Often there is actually too much information there, and the way it is organized forces you to focus on one game at a time.

**Boardgameinator**, however, is a comparison tool that sits on top of all of that BGG data and shows you only a few bits of filterable, high-level characteristics in a visually side-by-side fashion. It feels more like an e-commerce shopping experience that is designed for users to converge on only those results that meet their own preferences.

### What is it doing under the hood?

The app pulls game information from [the BoardGameGeek API](https://boardgamegeek.com/wiki/page/BGG_XML_API2) and stores both it and the user's likes in the browser's local storage area. Then, the aggregated likes plus other input controls determine the final filtered, ordered list of games that the user sees on the page.

### DISCLAIMER

This app has been designed for the author's needs only, in the author's spare time. By using this app, you are accepting it as-is.

For most people, [the link above](https://roderickwoodman.github.io/boardgameinator/) will take you to the live, production version of the app on the Internet. But for developers who would like to run this app in development mode...

### Running Locally

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).  You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

As with other Create React App projects, from the project directory you can run:

#### `npm start`

This runs the app in the development mode.<br> 
 Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

