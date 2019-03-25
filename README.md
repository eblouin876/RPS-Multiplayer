# Tic Tac Toe Multiplayer

## Description
This is a mulitplayer, server based tic tac toe website. It is built on Google's firestore database and will run multiple independent games at the same time. Each player and game is built from a player and game class to handle multiple instances. 

## Languages and Frameworks Used
* HTML
* CSS
* Bootstrap
* JavaScript
* JQuery
* LocalStorage
* Firebase Firestore
* Firebase Authentication

## Instructions
Enter a username when prompted and hit submit or enter. It will take you to the lobby, where you will see other active players. You may challenge any other player in the lobby and it will take you to the game. If you get brought into a game that you do not want to play, you may hit end game at any time to return to the lobby. When you are done, hit the leave game button so that your player is taken out of the lobby properly. 

## Support
If you come across any bugs or have any suggestions to improve the code or the UI, please feel free to comment! I would love to improve the code, especially the interfacing with the API, and I want to improve my UIs as a whole. 

## Project Status
This project is part of a web development program I am currently enrolled in and is in the works. I will continue to improve upon it over the next few months. Directions at the moment include: 
* Better responsiveness for mobile
* Redesign using CSS grid or higher level manipulation with bootstrap
* Figure out how to run the leave game function when the user closes the tab so they are removed from the lobby. (there could be a way to do this server side which also may be worth exploring)


## Updates
* Added responsiveness for mobile
* Added CSS grid to hand the board
* Still looking for a browser side solution to removing the player from the game. Do web workers continue to run in the background until they complete their task on close? Could be a solution
