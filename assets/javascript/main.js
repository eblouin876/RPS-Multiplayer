// Global Variables
let allPlayers = []
let allGames = []


// Classes
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
    }
}

class Player {
    constructor(name, id = "", wins = 0, losses = 0) {
        this.name = name;
        this.id = id;
        this.wins = wins;
        this.losses = losses;
    }

}


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

        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });
    return firebase.firestore()
}

function addUser(player) {
    playerObj = JSON.parse(JSON.stringify(player))
    db.collection("users").add(playerObj)
        .then(function (docRef) {
            player.id = docRef.id
            db.collection("users").doc(player.id).update({
                id: player.id
            })
            localStorage.setItem("Id", player.id)
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

function addGameListener(gameId) {
    return db.collection("games").doc(gameId)
        .onSnapshot((doc) => {
            console.log("Current data: ", doc.data());
        })
}

function removeGameListener(gameId) {
    db.collection("games").doc(gameId)
        .onSnapshot(() => {})
}

function addGame(game) {
    let gameObj = JSON.parse(JSON.stringify(game))
    db.collection("games").add(gameObj)
        .then(function (docRef) {
            game.id = docRef.id
            db.collection("games").doc(game.id).update({
                id: game.id
            })
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


// Visual update functions
function updatePlayerList() {
    $("#table-body").empty()
    allPlayers.forEach(player => {
        let name = $("<th>").text(player.name);
        let wins = $("<th>").text(player.wins);
        let losses = $("<th>").text(player.losses);
        let button = $("<button>").text("Challenge").addClass("btn btn-primary player-challenge-button").attr("data-playerId", player.id)
        let row = $("<tr>")
        $("#table-body").append(row.append(name, wins, losses, button))
    })
}


// Initializers
let db;
let init = true;

// Event Listeners
$(document).ready(() => {
    db = initDatabase()
    db.collection("users").onSnapshot((snapshot) => {
        let vals = snapshot.docChanges()
        vals.forEach(change => {
            // This handles on the inital load getting the players that are already in
            if (init) {
                let val = change.doc.data()
                let newPlayer = new Player(val.name, val.id, val.wins, val.losses)
                allPlayers.push(newPlayer)
            }
            // This handles bringing in any new players
            if (change.type === `modified`) {
                let val = change.doc.data()
                let newPlayer = new Player(val.name, val.id, val.wins, val.losses)
                allPlayers.push(newPlayer)
            }
        })
        init = false;
        updatePlayerList()
    }, err => {
        console.log(`Encountered error: ${err}`)
    })
})

$("#start-button").on('click', (event) => {
    event.preventDefault()
    if ($("#username-text").val()) {
        let name = $("#username-text").val()
        $("#username-text").val("")
        let player = new Player(name)
        addUser(player)
        $("#username-box").addClass("d-none")
        $("#active-users").removeClass("d-none")

    } else {
        alert("Please enter a valid name")
    }

})







// User 1 goes to the website. They see a screen appear prompting them to input a username

// The user inputs a username

// The screen changes. Now the user sees a list of other active users. The instructions say to choose an opponent to play

// They click on an opponent, and the opponent is prompted asking if they want to play

// Player accepts, and the scene changes

// Player one clicks "rock", and the screen displays waiting

// Player two clicks "scissors", and the results are shown on the screen

// Both players are prompted to play again

// Both players say yes and a new round begins