// Global Variables
let allPlayers = []
let allGames = []


// Firebase functions
function initDatabase() {
    let config = {
        apiKey: "AIzaSyDyOJdwnPtF8AfdpNU6Av8Nozv5F7PABns",
        authDomain: "rps-multiplayer-9a5ff.firebaseapp.com",
        databaseURL: "https://rps-multiplayer-9a5ff.firebaseio.com",
        projectId: "rps-multiplayer-9a5ff",
        storageBucket: "",
        messagingSenderId: "235790546609"
    };
    firebase
        .initializeApp(config)
        .auth().signInAnonymously()
        .then(function () {
            console.log('Logged in as Anonymous!')

        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });
    return firebase.firestore()
}

function addUser(player) {
    db.collection("users").add({
            Player: player
        })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}

function getUsers() {
    return db.collection("users").get().then((querySnapshot) => {
        querySnapshot.forEach((usr) => {
            let newUser = {};
            let data = usr.data()
            newUser[usr.id] = data
            allPlayers.push(newUser)
        });
    });
}

function getUser(id) {
    getUsers()
        .then(() => {
            db.collection("users").doc(id).get().then((querySnapshot) => {
                let data = querySnapshot.data()
                console.log(data)
            })
        })
}

function gameListener(gameId) {
    return db.collection("games").doc(gameId)
        .onSnapshot((doc) => {
            console.log("Current data: ", doc.data());
        })
}

function addGame(game) {
    db.collection("games").add({
            game: game,
        })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}

function getGames() {
    return db.collection("games").get().then((querySnapshot) => {
        querySnapshot.forEach((game) => {
            let newGame = {};
            let data = game.data()
            newGame[game.id] = data
            allGames.push(newGame)
        });
    });
}

function getGame(id) {
    getGames()
        .then(() => {
            db.collection("games").doc(id).get().then((querySnapshot) => {
                let data = querySnapshot.data()
                console.log(data)
            })
        })
}


// Classes
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
    }
}

class Player {
    constructor(name) {
        this.name = name;
    }

}


// Initialize Database
let db = initDatabase()


// addUser("Vera", 15, "O")
// addUser("Emile", 20, "X")

// getUser('2rw16DBmoQ2SdnnGzy76')
// User 1 goes to the website. They see a screen appear prompting them to input a username

// The user inputs a username

// The screen changes. Now the user sees a list of other active users. The instructions say to choose an opponent to play

// They click on an opponent, and the opponent is prompted asking if they want to play

// Player accepts, and the scene changes

// Player one clicks "rock", and the screen displays waiting

// Player two clicks "scissors", and the results are shown on the screen

// Both players are prompted to play again

// Both players say yes and a new round begins