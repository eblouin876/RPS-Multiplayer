// Global Variables
let allPlayers = {}

// Classes
class Game {
    constructor(player1, player2, id, turn) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = ["", "", "", "", "", "", "", "", ""];
        this.id = id;
        this.winner;
        this.turn = turn;
    }

    buildBoard() {
        let row = [];
        $("#game-board").append($("<button>").addClass("btn btn-danger").attr("id", "end-button").text("End Game"));
        for (let i = 1; i <= this.board.length; i++) {
            let box = $("<div>").addClass("board-box").attr("id", `box-${i}`).attr("data-index", i - 1);
            let play = $("<h1>").addClass("play").text(this.board[i - 1]);
            box.append(play);
            row.push(box);
            if (i % 3 === 0) {
                let rowDiv = $("<div>").addClass("row").attr("id", `row-${i}`);
                row.forEach(box => {
                    rowDiv.append(box);
                })
                $("#game-board").append(rowDiv);
                row = [];
            }
        }
        $(".board-box").on("click", function () {
            // Make turn function goes here.
        })
    }

}

class Player {
    constructor(name, id = "", wins = 0, losses = 0) {
        this.name = name;
        this.id = id;
        this.wins = wins;
        this.losses = losses;
        this.turn = false;
        this.letter;

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
            sessionStorage.setItem("Id", player.id)
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}

function getUsers() {
    return db.collection("users").get().then((querySnapshot) => {
        let users = []
        querySnapshot.forEach((usr) => {
            let data = usr.data()
            let newUser = data;
            users.push(newUser)
        });
        return users
    });
}

function getUser(id) {
    getUsers()
        .then(() => {
            db.collection("users").doc(id).get().then((querySnapshot) => {
                let data = querySnapshot.data()
                let newPlayer = new Player(data.name, data.id, data.wins, data.loss)
                return newPlayer
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

function removeUser(ID) {
    let id;
    if (ID) {
        id = ID
    } else {
        id = sessionStorage.Id
    }
    db.collection('users').doc(id).get()
        .then(function (querySnapshot) {
            querySnapshot.ref.delete();
        });
}

function removeGame(ID) {
    if (ID) {
        id = ID
    } else {
        id = JSON.parse(sessionStorage.getItem("Game")).id
    }
    db.collection('games').doc(id).get()
        .then(function (querySnapshot) {
            querySnapshot.ref.delete();
        });
}

function challenge() {
    if ($(this).attr("data-playerid") !== sessionStorage.Id) {
        let id = $(this).attr("data-playerid");
        let player1 = allPlayers[id];
        let player2 = allPlayers[sessionStorage.Id];
        let turn;
        if (Math.random() > .5) {
            player1.letter = "Y";
            player2.letter = "X";
            turn = player1.id;
        } else {
            player1.letter = "X";
            player2.letter = "Y";
            turn = player2.id;
        }
        removeUser($(this).attr("data-playerid"));
        removeUser();
        let newGame = new Game(player1, player2, "", turn);
        addGame(newGame);
    }
}

function endGame() {
    let game = JSON.parse(sessionStorage.getItem("Game"))
    if (game.winner === game.player1.id) {
        game.player1.wins += 1;
        game.player2.losses += 1;
    } else if (game.winner === game.player2.id) {
        game.player1.losses += 1;
        game.player2.wins += 1;
    }
    addUser(game.player1);
    addUser(game.player2);
    removeGame(game.id);
    sessionStorage.removeItem("Game");
    $("#variable-title")
        .empty()
        .append(`<h1>Choose an opponent from the list below</h1>`);
    $("#game-board").empty();
    updatePlayerList();
    $("#active-users").removeClass("d-none");
}


// Visual update functions
function updatePlayerList() {
    getUsers()
        .then((allPlayers) => {
            $("#table-body").empty();
            allPlayers.forEach(value => {
                let name = $("<th>").text(value.name);
                let wins = $("<th>").text(value.wins);
                let losses = $("<th>").text(value.losses);
                let button = $("<button>").text("Challenge").addClass("btn btn-primary player-challenge-button").attr("data-playerId", value.id);
                let row = $("<tr>");
                $("#table-body").append(row.append(name, wins, losses, button));
            })
        })
}


// Initializers
let db;
let init = true;


// Event Listeners
$(document).ready(() => {
    db = initDatabase()
    db.collection("users").onSnapshot((snapshot) => {
        let vals = snapshot.docChanges();
        vals.forEach(change => {
            // This handles on the inital load getting the players that are already in
            if (init) {
                let val = change.doc.data();
                let newPlayer = new Player(val.name, val.id, val.wins, val.losses);
                allPlayers[val.id] = newPlayer;
            }
            // This handles bringing in any new players
            if (change.type === `modified`) {
                let val = change.doc.data();
                let newPlayer = new Player(val.name, val.id, val.wins, val.losses);
                allPlayers[val.id] = newPlayer;
            }
            if (change.type === `removed`) {}
        })
        init = false;
        updatePlayerList();
    }, err => {
        console.log(`Encountered error: ${err}`);
    })
    db.collection("games").onSnapshot((snapshot) => {
        let vals = snapshot.docChanges();
        vals.forEach(change => {
            // This handles bringing in any new players
            if (change.type === `modified`) {
                let val = change.doc.data();
                if (val.player1.id === sessionStorage.Id || val.player2.id === sessionStorage.Id) {
                    let newGame = new Game(val.player1, val.player2, val.id, val.turn);
                    $("#active-users").addClass("d-none");
                    $("#variable-title")
                        .empty()
                        .append(`<h1>${val.player1.name} now playing ${val.player2.name}</h1>`);
                    newGame.buildBoard();
                    sessionStorage.setItem("Game", JSON.stringify(newGame));
                }
            }
            if (change.type === `removed`) {
                endGame()
            }
        })
    }, err => {
        console.log(`Encountered error: ${err}`);
    })
})

$("#start-button").on('click', (event) => {
    event.preventDefault();
    if ($("#username-text").val()) {
        let name = $("#username-text").val();
        $("#username-text").val("");
        let player = new Player(name);
        addUser(player);
        $("#username-box").addClass("d-none");
        $("#active-users").removeClass("d-none");
        $("#variable-title").removeClass("d-none");

    } else {
        alert("Please enter a valid name");
    }

})

$(document).on('click', '.player-challenge-button', challenge);

$(document).on('click', '#end-button', endGame);






// window.addEventListener("unload", function (e) {
//     remove();
//     (e || window.event).returnValue = remove(); //Gecko + IE
//     return remove(); //Webkit, Safari, Chrome
// });



// User 1 goes to the website. They see a screen appear prompting them to input a username

// The user inputs a username

// The screen changes. Now the user sees a list of other active users. The instructions say to choose an opponent to play

// They click on an opponent, and the opponent is prompted asking if they want to play

// Player accepts, and the scene changes

// Player one clicks "rock", and the screen displays waiting

// Player two clicks "scissors", and the results are shown on the screen

// Both players are prompted to play again

// Both players say yes and a new round begins