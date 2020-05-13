([click here to visit this app on the Internet!](https://roderickwoodman.github.io/boardgameinator/))

## Boardgameinator
*A board game comparison site*

### What is this thing?

Behold, the **BOARDGAMEINATOR**!  (...said in my best [Dr. Doofenshmirtz](https://www.youtube.com/watch?v=Sj7yxI-r_ag) accent)

This app is a sandbox for users to prioritize a list of boardgames that they are considering playing or purchasing. Once a game has been added (by name), the user is given a set of that game's characteristics for upvoting. And the more upvoted characteristics a game gets, the higher it will bubble up in the user's overall ranking of all of the added games.

### Who is it for?

First of all, **Boardgameinator** IS NOT FOR geeks to manage their huge collections.

Instead, this app IS FOR anyone who feels overwhelmed or who has stalled out in selecting a boardgame. And with all of the new titles and all of the hype these days, I do feel your pain.

### Why is it so awesome?

The likability of any board game is so subjective and multifactorial, sort of like a novel is. And unfortunately, the primary online  resource for the industry is a firehose of information called [BoardGameGeek](https://boardgamegeek.com) (BGG). Yes, the geeks are the most vocal group of boardgamers on the Internet, so be very careful. The BGG website is organized like an encyclopedia, which forces you to focus on one game at a time.

**Boardgameinator**, however, is a user-driven comparison tool for filtering through all of that BGG data in a visually side-by-side fashion. Only a few bits of information are shown for each game title, and simple mouse clicks either promote or eliminate games. It feels like a light e-commerce shopping experience.

### What is it doing under the hood?

The browser stores the user's likes locally, along with game information that it pulls from [the BoardGameGeek API](https://boardgamegeek.com/wiki/page/BGG_XML_API2). It then determines how to sort and filter it all to produce the ordered list of games that the user sees on the page.

### DISCLAIMER

This app has been designed for the author's needs only, in the author's spare time. By using this app, you are accepting it as-is.

For most people, [the link above](https://roderickwoodman.github.io/boardgameinator/) will take you to the live, production version of the app on the Internet. But for developers who would like to run this app in development mode...

### Running This App Locally

As a one-time setup, copy the code for this app to your local machine. 
#### `git clone https://github.com/roderickwoodman/boardgameinator.git`
#### `cd boardgameinator`
#### `npm install`

Now, every time you want to run the app, just run a script that starts up a development server with the code. This will run the app in development mode.
#### `npm start`

Doing this will open a browser tab for viewing the app at [http://localhost:3000](http://localhost:3000). The page will reload if you make edits to your local code copies. You will also see any lint errors in the browser console. 

FYI, this project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).  You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
