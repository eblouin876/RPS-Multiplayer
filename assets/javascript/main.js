// Global Variables
let allPlayers = {}

// Classes
class Game {
    constructor(player1, player2, id, turn, board = ["", "", "", "", "", "", "", "", ""]) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = board;
        this.id = id;
        this.winner = "";
        this.turn = turn;
    }

    buildBoard() {
        // let row = [];
        $("#game-board").empty()
        $("#game-board").append($("<button>").addClass("btn btn-danger").attr("id", "end-button").text("End Game"));
        for (let i = 1; i <= this.board.length; i++) {
            let box = $("<div>").addClass("board-box").attr("id", `box-${i}`).attr("data-index", i - 1);
            let play = $("<h1>").addClass("play center").text(this.board[i - 1]);
            box.append(play);
            // row.push(box);
            $("#game-board").append(box)
            // if (i % 3 === 0) {
            //     let rowDiv = $("<div>").addClass("row").attr("id", `row-${i}`);
            //     row.forEach(box => {
            //         rowDiv.append(box);
            //     })
            //     $("#game-board").append(rowDiv);
            //     row = [];
            // }
        }
    }

    checkWin() {
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

        function findIndices(x, arr) {
            var indices = [];
            var idx = arr.indexOf(x);
            while (idx != -1) {
                indices.push(idx);
                idx = arr.indexOf(x, idx + 1);
            }
            return indices
        }

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

        let yIndex = findIndices("Y", this.board)
        let xIndex = findIndices("X", this.board)
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

function removeUser(ID) {
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

function endGame(winner, final) {
    let game = JSON.parse(sessionStorage.getItem("Game"))
    if (game) {

        if (!final) {
            if (winner === game.player1.letter) {
                game.player1.wins += 1;
                game.player2.losses += 1;
                game.winner = game.player1.letter
            } else if (winner === game.player2.letter) {
                game.player1.losses += 1;
                game.player2.wins += 1;
                game.winner = game.player2.letter
            }
            db.collection("games").doc(game.id).update({
                    player1: game.player1,
                    player2: game.player2,
                    // winner: game.winner
                })
                .then(() => {
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
                })
        }
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
    let move = $(this).attr("data-index")
    let rawgame = JSON.parse(sessionStorage.getItem("Game"))
    let game = new Game(rawgame.player1, rawgame.player2, rawgame.id, rawgame.turn, rawgame.board)
    if (sessionStorage.getItem("Id") === game.turn) {
        if (!game.board[move]) {
            game.board[move] = sessionStorage.getItem("Letter")
            if (game.player1.id === game.turn) {
                game.turn = game.player2.id
            } else {
                game.turn = game.player1.id
            }
            db.collection("games").doc(game.id).update({
                turn: game.turn,
                board: game.board
            })
            game.checkWin()
        }
    }
}

function leave() {
    removeUser()
        .then(() => {
            $(".container").empty()
        })
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
                let button;
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
    event.preventDefault();
    if (event.key) {
        if (event.key === "Enter") {
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
        }
    } else {
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
    }
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
                    let newGame = new Game(val.player1, val.player2, val.id, val.turn, val.board);
                    $("#active-users").addClass("d-none");
                    $("#variable-title")
                        .empty()
                        .append(`<h1>${val.player1.name} now playing ${val.player2.name}</h1>`);
                    if (val.turn === sessionStorage.getItem("Id")) {
                        $("#variable-title").append(`<h1>Your Turn</h1>`)
                    } else {
                        $("#variable-title").append(`<h1>Waiting for Other Player</h1>`)
                    }
                    newGame.buildBoard();
                    sessionStorage.setItem("Game", JSON.stringify(newGame));
                    if (sessionStorage.getItem("Id") === val.player1.id) {
                        sessionStorage.setItem("Letter", val.player1.letter)
                    } else {
                        sessionStorage.setItem("Letter", val.player2.letter)
                    }
                }
            }
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