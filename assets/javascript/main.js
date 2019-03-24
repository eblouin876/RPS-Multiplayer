// Global Variables
let allPlayers = {}
let db;
let init = true;

// Classes
class Game {
    // the game class is used to store games both in the database and in local storage
    constructor(player1, player2, id, turn, board = ["", "", "", "", "", "", "", "", ""]) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = board;
        this.id = id;
        this.winner = "";
        this.turn = turn;
    }

    // Having this as part of the game class allows each game to build its own board with minimal code
    buildBoard() {
        // As the ids are declared explicitly, this class is tied to this specific HTML doc
        $("#game-board").empty()
        $("#variable-title").append($("<button>").addClass("btn btn-danger").attr("id", "end-button").text("End Game"));
        for (let i = 1; i <= this.board.length; i++) {
            let box = $("<div>").addClass("board-box").attr("id", `box-${i}`).attr("data-index", i - 1);
            let play = $("<h1>").addClass("play center").text(this.board[i - 1]);
            box.append(play);
            $("#game-board").append(box)
        }
    }

    checkWin() {
        // Declares all possible win conditions for a board based on indices
        let Wins = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]

        // Gets all the indices of a variable in an array. Returns an array
        function findIndices(x, arr) {
            var indices = [];
            var idx = arr.indexOf(x);
            while (idx != -1) {
                indices.push(idx);
                idx = arr.indexOf(x, idx + 1);
            }
            return indices
        }

        // Checks to see if the board contains any of the correct (winning) conditions
        function contains(correct, board) {
            for (let i = 0; i < correct.length; i++) {
                let win = true;
                for (let j = 0; j < correct[i].length; j++) {
                    if (board.indexOf(correct[i][j]) === -1) {
                        win = false
                    }
                }
                if (win) {
                    return true
                }
            }
        }

        // Gets the indices of plays for each player
        let yIndex = findIndices("Y", this.board)
        let xIndex = findIndices("X", this.board)
        // Gets the number of plays that have occurred to check if it is a tie
        let played = 0;
        this.board.forEach(square => {
            if (square === "Y" || square === "X") {
                played++
            }
        })
        if (contains(Wins, xIndex)) {
            this.winner = "X"
            endGame("X")
        } else if (contains(Wins, yIndex)) {
            this.winner = "Y"
            endGame("Y")
        } else if (played === 9) {
            endGame()
        }
    }
}

class Player {
    constructor(name, id = "", wins = 0, losses = 0) {
        this.name = name;
        this.id = id;
        this.wins = wins;
        this.losses = losses;
        this.letter;
    }
}


// Firebase functions
function initDatabase() {
    // Configures the database and anonymous user authentication
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
    // This adds the player to the database. Stringify and Parse are necessary because
    // Firebase won't handle custom classes with methods, so they must be stripped
    playerObj = JSON.parse(JSON.stringify(player))
    db.collection("users").add(playerObj)
        .then(function (docRef) {
            player.id = docRef.id
            // This gives each player a unique id that can be referenced
            db.collection("users").doc(player.id).update({
                id: player.id
            })
            // Ensures that the local id matches the db id so it can be compared  later
            sessionStorage.setItem("Id", player.id)
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}

function getUsers() {
    // Grabs all of the users currently in the database and returns a promise with
    // all of the users in an array
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

function addGame(game) {
    // Strips custom class methods and makes simple JSON object
    let gameObj = JSON.parse(JSON.stringify(game))
    db.collection("games").add(gameObj)
        .then(function (docRef) {
            // Assigns unique game id to each game instance
            game.id = docRef.id
            db.collection("games").doc(game.id).update({
                id: game.id
            })
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}

function removeUser(ID) {
    // Removes a user either based on the id passed in or the local user
    let id;
    if (ID) {
        id = ID
    } else {
        id = sessionStorage.Id
    }
    return db.collection('users').doc(id).get()
        .then(function (querySnapshot) {
            querySnapshot.ref.delete();
        });
}

function removeGame(ID) {
    // Removes a game either based on the id passed in or the local user
    let id;
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
    // Fires off when clicking on challenge button
    // Only will run if the playerid data attribute on the button isn't 
    // the locally stored id for the user
    if ($(this).attr("data-playerid") !== sessionStorage.Id) {
        let id = $(this).attr("data-playerid");
        // Stores the players to variables
        let player1 = allPlayers[id];
        let player2 = allPlayers[sessionStorage.Id];
        let turn;
        // Randomly determines player letter and turn
        if (Math.random() > .5) {
            player1.letter = "Y";
            player2.letter = "X";
            turn = player1.id;
        } else {
            player1.letter = "X";
            player2.letter = "Y";
            turn = player2.id;
        }
        // Removes both players from the database so they don't appear in the 
        // player lobby while they are in another game
        removeUser($(this).attr("data-playerid"));
        removeUser();
        // Initializes a new game between the players in the database
        let newGame = new Game(player1, player2, "", turn);
        addGame(newGame);
    }
}

function endGame(winner, final) {
    // Function called when a game is over
    // Grabs the current game state from session storage
    let game = JSON.parse(sessionStorage.getItem("Game"))
    if (game) {
        // If no final argument is passed in (helps handle not having access
        // to both session storages. Fixed a duplication bug that caused it 
        // to fire multiple times on each side)
        if (!final) {
            // Increment the score of each player appropriately and set the winner
            if (winner === game.player1.letter) {
                game.player1.wins += 1;
                game.player2.losses += 1;
                game.winner = game.player1.letter
            } else if (winner === game.player2.letter) {
                game.player1.losses += 1;
                game.player2.wins += 1;
                game.winner = game.player2.letter
            }
            // Update the game document in the database
            db.collection("games").doc(game.id).update({
                    player1: game.player1,
                    player2: game.player2,
                })
                .then(() => {
                    // This adds the user back to the database with update
                    // Wins or losses as well as putting them back in the
                    // main lobby
                    if (game.player1.id === sessionStorage.getItem("Id")) {
                        addUser(game.player1);
                        // Removes the id stored in session storage because a new one
                        // is generated for the newly created player
                        sessionStorage.removeItem("Id")
                    } else if (game.player2.id === sessionStorage.getItem("Id")) {
                        addUser(game.player2);
                        sessionStorage.removeItem("Id")
                    }
                    // Removes the game from the database
                    removeGame(game.id);
                    // Removes the game from session storage
                    sessionStorage.removeItem("Game");
                    // Resets the title and gameboard
                    $("#variable-title")
                        .empty()
                        .append(`<h1>Choose an opponent from the list below</h1>`);
                    $("#game-board").empty();
                    // Queries the database for an updated list of characters
                    updatePlayerList();
                    // Shows the list of active characters
                    $("#active-users").removeClass("d-none");
                })
        }
        // This does the same thing as above, but does it for the player who didn't
        // win the game on their move
        if (game.player1.id === sessionStorage.getItem("Id")) {
            addUser(game.player1);
            sessionStorage.removeItem("Id")
        } else if (game.player2.id === sessionStorage.getItem("Id")) {
            addUser(game.player2);
            sessionStorage.removeItem("Id")
        }
        removeGame(game.id);
        sessionStorage.removeItem("Game");
        $("#variable-title")
            .empty()
            .append(`<h1>Choose an opponent from the list below</h1>`);
        $("#game-board").empty();
        updatePlayerList();
        $("#active-users").removeClass("d-none");

    }
}

function makeMove() {
    // Gets the index for the box that is clicked
    let move = $(this).attr("data-index")
    // Pulls the current game from session storage and creates a new instance
    // of class Game based on it
    let rawgame = JSON.parse(sessionStorage.getItem("Game"))
    let game = new Game(rawgame.player1, rawgame.player2, rawgame.id, rawgame.turn, rawgame.board)
    // Checks to see if it is the user's turn before registering the move
    if (sessionStorage.getItem("Id") === game.turn) {
        // Checks the index of the board for a value
        if (!game.board[move]) {
            // Puts the current user's letter at that position in the game board
            game.board[move] = sessionStorage.getItem("Letter")
            // Changes the turn to the other player
            if (game.player1.id === game.turn) {
                game.turn = game.player2.id
            } else {
                game.turn = game.player1.id
            }
            // Updates the game in the database. A listener will update
            // Session storage for both players
            db.collection("games").doc(game.id).update({
                turn: game.turn,
                board: game.board
            })
            // Checks for a win condition
            game.checkWin()
        }
    }
}

function leave() {
    // Removes the user from the database then empties the window
    // Would prefer to close the window, but browsers don't like that
    removeUser()
        .then(() => {
            $(".container").empty()
        })
}


// Visual update functions
function updatePlayerList() {
    // Pulls all of the users asynchronosly from the database
    getUsers()
        .then((allPlayers) => {
            // Empties the table of all the users that were previously there
            $("#table-body").empty();
            allPlayers.forEach(value => {
                // Builds the row for each user queried from the database
                let name = $("<th>").text(value.name);
                let wins = $("<th>").text(value.wins);
                let losses = $("<th>").text(value.losses);
                let button;
                // Sets a challenge button for other players and a leave button
                // for the current user
                if (value.id !== sessionStorage.getItem("Id")) {
                    button = $("<button>").text("Challenge").addClass("btn btn-primary player-challenge-button").attr("data-playerId", value.id);
                } else {
                    button = $("<button>").text("Leave").addClass("btn btn-danger player-leave-button").attr("data-playerId", value.id);
                }
                let row = $("<tr>");
                $("#table-body").append(row.append(name, wins, losses, button));
            })
        })
}

function start() {
    // Starts a game without reloading the page
    event.preventDefault();
    // Handles if the keypress is an enter
    if (event.key) {
        if (event.key === "Enter") {
            // Only triggers if there is username text
            if ($("#username-text").val()) {
                let name = $("#username-text").val();
                $("#username-text").val("");
                // Initializes a new player class
                let player = new Player(name);
                addUser(player);
                // Changes the display
                $("#username-box").addClass("d-none");
                $("#active-users").removeClass("d-none");
                $("#variable-title").removeClass("d-none");
                $("#welcome").remove()
            } else {
                alert("Please enter a valid name");
            }
        }
    } else {
        // Only triggers if there is username text
        if ($("#username-text").val()) {
            let name = $("#username-text").val();
            $("#username-text").val("");
            // Initializes a new player class
            let player = new Player(name);
            addUser(player);
            // Changes the display
            $("#username-box").addClass("d-none");
            $("#active-users").removeClass("d-none");
            $("#variable-title").removeClass("d-none");
            $("#welcome").remove()
        } else {
            alert("Please enter a valid name");
        }
    }
}


// Event Listeners
$(document).ready(() => {
    db = initDatabase()

    // Creates a listener for any changes made to the users database
    db.collection("users").onSnapshot((snapshot) => {
        let vals = snapshot.docChanges();
        vals.forEach(change => {
            // This handles on the inital load getting the players that are already in
            // This has to be done because the listener is triggered on updates 
            // rather than simple additions
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

    // Creates a listener for any changes made to the games database
    db.collection("games").onSnapshot((snapshot) => {
        let vals = snapshot.docChanges();
        vals.forEach(change => {
            // This triggers when the game is assigned its id
            if (change.type === `modified`) {
                let val = change.doc.data();
                // Checks to see if the players in the game match the locally stored id
                // Will only run for the two players that are challenging each other
                if (val.player1.id === sessionStorage.Id || val.player2.id === sessionStorage.Id) {
                    let opponent = ""
                    if (val.player1.id === sessionStorage.Id) {
                        opponent = val.player2.name
                    } else {
                        opponent = val.player1.name
                    }
                    // Initializes a new game locally based on the update in the database
                    let newGame = new Game(val.player1, val.player2, val.id, val.turn, val.board);
                    // Resets the UI based on players and turn
                    $("#active-users").addClass("d-none");
                    $("#variable-title")
                        .empty()
                        .append(`<h1>Now playing ${opponent}</h1>`);
                    if (val.turn === sessionStorage.getItem("Id")) {
                        $("#variable-title").append(`<h1>Your Turn</h1>`)
                    } else {
                        $("#variable-title").append(`<h1>Waiting for Other Player</h1>`)
                    }
                    // Builds the new board
                    newGame.buildBoard();
                    // Stores the game and user's letter in session storage
                    sessionStorage.setItem("Game", JSON.stringify(newGame));
                    if (sessionStorage.getItem("Id") === val.player1.id) {
                        sessionStorage.setItem("Letter", val.player1.letter)
                    } else {
                        sessionStorage.setItem("Letter", val.player2.letter)
                    }
                }
            }
            // This runs when the game has been removed  from the database because of the other player
            // Either winning, tieing, or leaving
            if (change.type === `removed`) {
                endGame(change.doc.data().winner, true)
            }
        })
    }, err => {
        console.log(`Encountered error: ${err}`);
    })
})

$(document).on('click', '#start-button', start)

$(document).on('click', '.player-challenge-button', challenge);

$(document).on('click', '#end-button', endGame);

$(document).on('click', '.board-box', makeMove)

$(document).on('click', '.player-leave-button', leave)

$(document).on('keyup', '#username-text', start)


// window.addEventListener("unload", function (e) {
//     remove();
//     (e || window.event).returnValue = remove(); //Gecko + IE
//     return remove(); //Webkit, Safari, Chrome
// });