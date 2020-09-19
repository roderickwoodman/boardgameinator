([click here to visit this app on the Internet!](https://roderickwoodman.github.io/boardgameinator/))

## Boardgameinator
*A board game comparison site*

### What is this thing?

Behold, the **BOARDGAMEINATOR**!  (...said in my best [Dr. Doofenshmirtz](https://www.youtube.com/watch?v=Sj7yxI-r_ag) accent)

This app is a sandbox for users to prioritize a list of board games that they are considering playing or purchasing. 

Any board game that has been added to this site can be upvoted. And any characteristic of these games, like the theme or the player count for example, can be upvoted too. Then, the games that get the most votes are displayed the most prominently.

### Who is it for?

First of all, **Boardgameinator** IS NOT FOR geeks to manage their huge collections. It is not for people who spend any amount of time on [BoardGameGeek](https://boardgamegeek.com).

Instead, this app IS FOR regular people who need help in selecting a board game. This can be a common problem these days, with so many new titles and all of the hype in the industry.

### What do I do with it?

It is easy to build and upvote a list of board games.
1. **Add.** Click the "Add" button to add a board game by its title. 
2. **Learn.** Click the info button on a game card to get a brief description about a game.
3. **Upvote Attributes.** Click the "Vote Attributes" button to upvote an attribute across all games.
4. **Upvote Games.** Click its thumbnail or the "Vote Titles" button to upvote the game itself.

Within the user preferences panel, the user can choose to sort and/or filter the list of added games by these title and attribute vote counts. The vote counts will appear overlayed on top of the game box art thumbnail.

### Why is it so awesome?

The likability of any board game is so subjective and multifactorial, in the same way that a novel is. But the primary online resource for the board game industry, [BoardGameGeek](https://boardgamegeek.com) (BGG), forces you to focus on one game at a time because it is organized like an encyclopedia.

**Boardgameinator**, however, is a user-driven comparison tool that displays information side-by-side, allowing users to either promote or eliminate games. It feels like driving a light e-commerce shopping experience as you converge on what is most in agreement with your preferences.

### What is it doing under the hood?

Game data is pulled from [the BoardGameGeek API](https://boardgamegeek.com/wiki/page/BGG_XML_API2). All data is stored locally within the user's browser (aka: "local storage"). There are no user sessions or sensitive data for this application.

### DISCLAIMER

This app has been designed for the author's needs only, in the author's spare time. By using this app, you are accepting it as-is.

For most people, [the link above](https://roderickwoodman.github.io/boardgameinator/) will take you to the live, production version of the app on the Internet. But for developers who would like to run this app in development mode...

### Running This App Locally

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

FYI, this project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).  You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
