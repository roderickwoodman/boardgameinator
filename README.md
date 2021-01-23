([click here to visit this app on the Internet!](https://roderickwoodman.github.io/boardgameinator/))

## Boardgameinator
*A board game comparison site*

<p align="center">
  <img width="800" height="420" src="public/og-image.png">
</p>

### What is this thing?

Behold, the **BOARDGAMEINATOR**!  (...said in my best [Dr. Doofenshmirtz](https://www.youtube.com/watch?v=Sj7yxI-r_ag) accent)

This app is a sandbox that lets you prioritize a list of board games that you are considering either playing or purchasing.

Any board game that has been added to this site can be upvoted. And any characteristic of these games, like the theme or the player count for example, can be upvoted too.

### Who is it for?

First of all, **Boardgameinator** *is not for* geeks to manage their huge collections. 

Instead, this app *is for* regular people who need help in selecting a board game. It can be overwhelming these days with so many titles being published every year.

### What do I do with it?

It is easy to build and upvote a list of board games.
1. **Add a Game.** Click the "Add" button to add a board game by its title. 
2. **Upvote Attributes.** Click the "Vote Attributes" button to upvote an attribute across all games.
3. **Upvote Games.** Either click the "Vote Titles" button or click on a thumbnail to upvote the game itself.

If you need more information about any game before you make a decision to upvote, click the info button on a game card and you will get a brief description.

### Why is it so awesome?

The likability of any board game is so subjective and multifactorial, in the same way that a novel is. And the primary online resource for the board game industry, [BoardGameGeek](https://boardgamegeek.com) (BGG), breaks down all of these factors very scientifically. However, it is organized like an encyclopedia and so it is not great at making the arbitrary comparisons that are needed to filter *out* information.

**Boardgameinator**, however, is a user-driven comparison tool similar to an e-commerce shopping experience. It displays information side-by-side with sorting and filtering knobs, allowing you to converge on the right game for you based on your preferences.

### Sharing your game lists (URL shortcuts)
Using the BoardGameGeek IDs or the poll IDs from this app, you can share lists of games with others...
* Share a new list of games: https://roderickwoodman.github.io/boardgameinator/?newlist=194789+148228+11
* Share an additional set of games: https://roderickwoodman.github.io/boardgameinator/?addtolist=194789+148228+11
* Share a poll: https://roderickwoodman.github.io/boardgameinator/?poll=1

<p align="center">
  <img width="800" height="420" src="public/ss-poll.png">
</p
### [under development] Creating a poll
Users who are logged in can create polls and vote on them with other users.

### DISCLAIMER

This app has been designed for the author's needs only, in the author's spare time. By using this app, you are accepting it as-is.

For most people, [the link above](https://roderickwoodman.github.io/boardgameinator/) will take you to the live, production version of the app on the Internet. But for developers who would like more...

### (For Developers) What is it doing under the hood?

Game data is pulled from [the BoardGameGeek API](https://boardgamegeek.com/wiki/page/BGG_XML_API2). All data is stored locally within the user's browser (aka: "local storage"). 

API calls are minimized because when games are deleted, their data is kept so that subsequent calls for the same game ID are directed to cache. 

There are no user sessions or sensitive data for this application. All personalization is kept in local storage and retrieved on browser refresh.

### (For Developers) Running this app locally

As a one-time setup, copy the code for this app to your local machine. 
```
git clone https://github.com/roderickwoodman/boardgameinator.git
cd boardgameinator
npm install
```

Now, every time you want to run the app, just run a script that starts up a development server with the code. This will run the app in development mode.
```
npm start
```

Doing this will open a browser tab for viewing the app at [http://localhost:3000](http://localhost:3000). The page will reload if you make edits to your local code copies. You will also see any lint errors in the browser console. 
