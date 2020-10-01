var games = [];
var boardSize = 5;
var preventBingo = false;

window.onload = function() {
/*    $("#header a").attr("href", location.protocol + "//" + location.host + location.pathname);
    loadCurrentGame();

    $("#toggle, .option").on("click", function() {
        if(!$("#create_game").is(":visible")) {
            $("#cancel").removeClass("open");
        }
        $("#play_game, #edit_game, #delete_game").css("height", 0);
        $("#options").toggleClass("open");
        $("#toggle").toggleClass("close");
    });
    
    $("#cancel").on("click", function() {
        $("#cancel").removeClass("open");
        $("#play_game, #edit_game, #delete_game").css("height", 0);
        $("#create_game").fadeOut(250, function() {
            $("#game_board").fadeIn(250);
        });
    });

    $("#modal .footer .confirm").on("click", function() {
        var action = $("#modal").attr("data-action");
        var data = JSON.parse($("#modal").attr("data"));
        switch (action) {
            case "delete":
                games = loadGames();
                delete games[data["bingo_title"]];
                localStorage.savedGames = JSON.stringify(games);
                break;
            case "start":
                populateGame(data, true);
                break;
            case "player_win":
                populateGame(data, true);
                break;
        
            default:
                break;
        }
        closeModal();
    });
    
    $("#modal .footer .cancel").on("click", function() {
        var action = $("#modal").attr("data-action");
        var data = JSON.parse($("#modal").attr("data"));
        switch (action) {
            case "player_win":
                quitGame();
                break;
                
            default:
                break;
        }
        closeModal();
    });
    
    $("#modal_close").on("click", function() {
        var action = $("#modal").attr("data-action");
        var data = JSON.parse($("#modal").attr("data"));
        switch (action) {
            case "not_winner":
                populateGame(data, true);
                break;
        
            default:
                break;
        }
        closeModal();
    });

    $("#btn_create_game").on("click", function() {
        clearErrors();
        $("#bingo_title").val("");
        $("#bingo_options").val("");
        $("#generated_url").text("");
        $("#cancel").addClass("open");
        $("#game_board").fadeOut(250, function() {
            $("#create_game").fadeIn(250);
        });
    });

    $("#btn_play_game").on("click", function() {
        $("#cancel").addClass("open");
        listSavedGames("#play_game");
    });

    $("#btn_quit_game").on("click", function() {
        quitGame();
    });

    $("#btn_edit_game").on("click", function() {
        $("#cancel").addClass("open");
        listSavedGames("#edit_game");
    });

    $("#btn_delete_game").on("click", function() {
        $("#cancel").addClass("open");
        listSavedGames("#delete_game");
    });

    $("#generate_game").on("click", function() {
        event.preventDefault();
        clearErrors();
        var errors = generateGame();
        if(errors) {
            for(var i = 0; i < errors.length; i++) {
                if(errors[i] == "title_required") {
                    $("#bingo_title").addClass("error");
                }
                if(errors[i] == "title_character") {
                    $("#bingo_title").addClass("error");
                    $("#remove_characters").fadeIn(500);
                }
                if(errors[i] == "options_character") {
                    $("#bingo_options").addClass("error");
                    $("#remove_characters").fadeIn(500);
                }
                if(errors[i] == "options_entry") {
                    $("#bingo_options").addClass("error");
                    $("#remove_characters").fadeIn(500);
                }
                if(errors[i] == "options_short") {
                    $("#bingo_options").addClass("error");
                }
                $("#" + errors[i]).show();
            }
        }
    });

    $("#remove_characters").on("click", function() {
        event.preventDefault();
        clearErrors();

        var options = $("#bingo_options").val();
        options = options.replace(/[^a-zA-Z0-9\s,]/g, "");
        options = options.replace(/\,(\s*\,+)+/g, ",");
        $("#bingo_options").val(options);

        var title = $("#bingo_title").val();
        title = title.replace(/[^a-zA-Z0-9\s]/g, "");
        title = title.replace(/\,(\s*\,+)+/g, ",");
        $("#bingo_title").val(title);
    });*/

    $("td").on("click", function() {
        var cell = $(this);
        if(cell.text() == "Free Space") {
            return;
        }
        markCell(cell);
    });

    $("#game_options").on("change", function() {
        var selectVal = $(this).val();
        var cells = $("td");
        for(var i = 0; i < cells.length; i++) {
            var cellVal = $(cells[i]).attr("value");
            if(selectVal == cellVal) {
                markCell($(cells[i]));
                break;
            }
        }
        $(this).val("Select an option");
    });

    $("#pull_option").on("click", function() {
        if(localStorage.currentGame) {
            var gameVars = JSON.parse(atob(localStorage.currentGame));
            var remainingOptions = gameVars.remainingOptions ? gameVars.remainingOptions : [];
            var pulledOptions = gameVars.pulledOptions ? gameVars.pulledOptions : [];
            if(!gameVars.remainingOptions) {
                for(var [key, val] of Object.entries(gameVars)) {
                    if(!Number.isNaN(Number(key))) {
                        remainingOptions.push(key);
                    }
                }
            }

            if(remainingOptions.length == 0) {
                return;
            }
            var randIndex = Math.floor(Math.random() * remainingOptions.length);
            var randOption = remainingOptions.splice(randIndex, 1)[0];
            pulledOptions.push(randOption);

            gameVars["remainingOptions"] = remainingOptions;
            gameVars["pulledOptions"] = pulledOptions;
            localStorage.currentGame = btoa(JSON.stringify(gameVars));

            updateGameBoard();
        }
    });

    $("#delete_local_storage").remove();
}

function closeModal() {
    $("#modal").hide(500, function() {
        $("#modal_bg").fadeOut(250);
    });
}

function markCell(cell) {
    var gameVars = localStorage.currentGame ? JSON.parse(atob(localStorage.currentGame)) : null;
    if(isHost(gameVars)) {
        return;
    }
    var pulledOptions = gameVars.pulledOptions ? gameVars.pulledOptions : [];
    var removeCheck = false;
    for(var i = 0; i < pulledOptions.length; i++) {
        if(cell.attr("value") == pulledOptions[i]) {
            removeCheck = i;
            break;
        }
    }
    if(removeCheck !== false) {
        pulledOptions.splice(removeCheck, 1);
    } else {
        pulledOptions.push(cell.attr("value"));
    }

    gameVars.pulledOptions = pulledOptions;
    localStorage.currentGame = btoa(JSON.stringify(gameVars));

    updateGameBoard();
}

function updateGameBoard() {
    var gameVars = JSON.parse(atob(localStorage.currentGame));
    var pulledOptions = [];
    var cells = $("td");
    $("td").removeClass("checked");
    $("td").removeClass("bingo");
    
    pulledOptions = gameVars.pulledOptions ? gameVars.pulledOptions : [];
    cells.each(function(index) {
        var cell = $(this);
        for(var i = 0; i < pulledOptions.length; i++) {
            if(cell.attr("value") == pulledOptions[i]) {
                cell.addClass("checked");
            }
        }
    });

    if(isHost(gameVars)) {
        var pulledGameOptions = "";
        for(var i = pulledOptions.length-1; i >= 0; i--) {
            var key = pulledOptions[i];
            var val = gameVars[key].trim();
            pulledGameOptions += '<option value="' + key + '">' + val + '</option>';
        }
        $("#pulled_game_options").html(pulledGameOptions);
    }

    checkForWin();
}

function listSavedGames(menu) {
    games = loadGames();
    var menuHtml = "";
    var menuLen = 0;
    for(var [key, val] of Object.entries(games)) {
        menuHtml += '<div class="option" data-game=\'' + val + '\'>' + key + "</div>";
        menuLen++;
    }
    $(menu).html(menuHtml);
    $(menu).css("height", 60 * menuLen);

    $("#play_game .option").on("click", function() {
        $("#cancel").removeClass("open");
        $(".checked").removeClass("checked");
        $("#play_game, #edit_game, #delete_game").css("height", 0);
        var gameVars = JSON.parse($(this).attr("data-game"));
        $("#create_game").fadeOut(250, function() {
            gameVars["is_host"] = true;
            populateGame(gameVars, false);
            $("#game_board").fadeIn(250);
        });
    });

    $("#edit_game .option").on("click", function() {
        $("#play_game, #edit_game, #delete_game").css("height", 0);
        $("#generated_url").text("");
        var gameVars = JSON.parse($(this).attr("data-game"));
        $("#game_board").fadeOut(250, function() {
            populateEdit(gameVars);
            clearErrors();
            $("#create_game").fadeIn(250);
        });
    });

    $("#delete_game .option").on("click", function() {
        if(!$("#create_game").is(":visible")) {
            $("#cancel").removeClass("open");
        }
        $(".checked").removeClass("checked");
        $("#play_game, #edit_game, #delete_game").css("height", 0);
        popupModal("delete", JSON.parse($(this).attr("data-game")));
    });
}

function popupModal(type, data) {
    $("#modal").removeClass("show-footer");
    $("#modal").addClass("show-close");
    var msg = "Something went wrong";
    if(type && data) {
        $("#modal").attr("data", JSON.stringify(data));
        $("#modal").attr("data-action", type);
    }
    switch (type) {
        case "delete":
            $("#modal").removeClass("show-close");
            $("#modal").addClass("show-footer");
            msg = "Are you sure you would like to delete " + data["bingo_title"] + "?";
            msg += "<br/><br/>This cannot be undone. If you would like to edit the selected game, please press \"Cancel\" and select \"Edit Game\" from the menu."
            break;

        case "start":
            $("#modal").removeClass("show-close");
            $("#modal").addClass("show-footer");
            msg = "Would you like to start a new game of " + data["bingo_title"] + "?";
            msg += "<br/><br/>This cannot be undone. This will start a new game.";
            break;

        case "host":
            msg = "You are hosting a game of " + data["bingo_title"];
            msg += '<br/><br/><br/><button id="temp_copy">Copy URL</button>';
            msg += '<p id="temp_copy_success" hidden>Copied to clipboard</p><textarea id="temp_host_id"></textarea>';
            break;

        case "win_url":
            var gameVars = JSON.parse(atob(localStorage.currentGame));
            msg = "<h2>Bingo!</h2>";
            if(!gameVars["is_host"]) {
                msg += '<br/><br/><button id="temp_copy">Copy URL</button>';
                msg += '<p id="temp_copy_success" hidden>Copied to clipboard</p><textarea id="temp_host_id"></textarea>';
            } else {
                msg += "<br/><br/>You can continue pulling options if you are not playing along.";
                preventBingo = true;
            }
            break;

        case "player_win":
            $("#modal").removeClass("show-close");
            $("#modal").addClass("show-footer");
            msg = "<h2>Bingo!</h2>";
            msg += '<br/><br/>The provided gameboard is a winner.';
            msg += '<br/><br/>Press "Confirm" if you would like other players to go for bingo, otherwise, press "Cancel" to quit the game.';
            break;

        case "not_winner":
            msg = "<h2>Not a winner</h2>";
            msg += '<br/><br/>The provided gameboard is not a winner.';
            break;

        default:
            break;
    }
    $("#modal .content").html(msg);
    $("#modal_bg").fadeIn(250, function() {
        $("#modal").show(500, function() {
            switch (type) {
                case "host":
                    $("#temp_copy").on("click", function() {
                        copyUrl(data, "#temp_host_id");

                        $("#temp_copy_success").show(500, function() {
                            setTimeout(function() {
                                $("#temp_copy_success").hide(500);
                            }, 3000);
                        });
                    });
                    break;
                    
                case "win_url":
                    $("#temp_copy").on("click", function() {
                        copyUrl(data, "#temp_host_id");

                        $("#temp_copy_success").show(500, function() {
                            setTimeout(function() {
                                $("#temp_copy_success").hide(500);
                            }, 3000);
                        });
                    });
                    break;
            
                default:
                    break;
            }
        });
    });
}

function clearErrors() {
    $("#bingo_title").removeClass("error");
    $("#bingo_options").removeClass("error");
    $(".error-msg").hide();
    $(".warning-msg").hide();
    $("#remove_characters").hide();
}

function loadCurrentGame() {
    var loadedPrevious = false;
    if(localStorage.currentGame) {
        var gameVars = JSON.parse(atob(localStorage.currentGame));
        var hostVars = Object.assign({}, gameVars);
        if(isHost(hostVars)) {
            var checkResults = false;
            window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
                if(key == "check_win") {
                    var urlVal = value.slice(1, value.length - 1);
                    var checkWin = JSON.parse(atob(urlVal));
                    checkResults = true;
                    if(!checkForWin(checkWin)) {
                        popupModal("not_winner", gameVars);
                    }
                }
            });
            if(checkResults) {
                return;
            }
        }
        populateGame(gameVars, true);
        loadedPrevious = true;
    }

    var gameVars = getGameVars();
    if(gameVars) {
        saveGame(gameVars);
        if(loadedPrevious) {
            popupModal("start", gameVars);
            return;
        }
        populateGame(gameVars);
    }
}

function loadGames() {
    return localStorage.savedGames ? JSON.parse(localStorage.savedGames) : {};
}

function saveGame(gameVars) {
    var savedGames = loadGames();
    var title = gameVars["bingo_title"];
    var gameData = {};
    for(var [key, val] of Object.entries(gameVars)) {
        if(!Number.isNaN(Number(key))) {
            gameData[key] = val;
        }
    }
    gameData["bingo_title"] = title;
    savedGames[title] = JSON.stringify(gameData);
    localStorage.savedGames = JSON.stringify(savedGames);
}

function populateEdit(gameVars) {
    var title = gameVars["bingo_title"];
    $("#bingo_title").val(title);
    var optionsText = "";
    for(var [key, val] of Object.entries(gameVars)) {
        if(key != "bingo_title") {
            var entry = val;
            optionsText += entry + ",";
        }
    }
    if(optionsText[optionsText.length-1] == ",") {
        optionsText = optionsText.slice(0, optionsText.length - 1);
    }
    $("#bingo_options").val(optionsText);
}

function populateGame(gameVars, previousGame=false) {
    if(!previousGame && localStorage.currentGame && localStorage.currentGame != "") {
        // compare the games to see if you should start a new one?
        popupModal("start", gameVars);
        return;
    }
    preventBingo = false;
    var title = gameVars["bingo_title"];
    $("#title_text").text(title);
    var optionsArr = [];
    var optionsLookup = {};
    var selectOptions = "<option>Select an option</option>";
    for(var [key, val] of Object.entries(gameVars)) {
        if(!Number.isNaN(Number(key))) {
            var entry = val.trim();
            optionsArr.push(entry);
            optionsLookup[entry] = key;
            selectOptions += '<option value="' + key + '">' + entry + '</option>';
        }
    }
    $("#game_options").html(selectOptions);

    var cells = $("td");

    var gameBoard = gameVars["gameBoard"] ? gameVars["gameBoard"] : [];
    if(gameBoard.length == 0) {
        var remainingOptions = optionsArr.slice();
        cells.each(function(index) {
            var cell = $(this);
            var randOption = Math.floor(Math.random() * remainingOptions.length);
            var cellVal = "", cellText = "";
            if(index == 12) {
                cellText = "Free Space";
                cellVal = cellText;
            } else {
                cellText = remainingOptions[randOption];
                cellVal = optionsLookup[cellText];
            }
            gameBoard.push(cellVal);
            cell.text(cellText);
            cell.attr("value", cellVal);
            if(index != 12) {
                remainingOptions.splice(randOption, 1);
            }
        });
        gameVars["gameBoard"] = gameBoard;
    } else {
        cells.each(function(index) {
            var cell = $(this);
            var cellVal = gameBoard[index];
            var cellText = gameVars[cellVal] ? gameVars[cellVal] : "Free Space";
            cell.text(cellText);
            cell.attr("value", cellVal);
        });
    }

    $("#game_board").addClass("active");
    localStorage.currentGame = btoa(JSON.stringify(gameVars));
    $("#btn_play_game").hide();
    $("#btn_quit_game").show();
    updateGameBoard();

    handleHost(gameVars);
}

function isHost(gameVars) {
    if(gameVars["is_host"]) {
        return true;
    } else {
        return false;
    }
}

function handleHost(gameVars) {
    if(isHost(gameVars)) {
        $("#host_controls").fadeIn(500);
        $("#game_options").hide();
        delete gameVars["is_host"];
        delete gameVars["gameBoard"];
        delete gameVars["remainingOptions"];
        popupModal("host", gameVars);
    } else {
        $("#game_options").fadeIn(500);
        $("#host_controls").hide();
    }
}

function getGameVars(vars=null) {
    var gameVars = {};
    var foundVars = false;
    if(!vars) {
        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            if(key == "game_vars") {
                var urlVal = value.slice(1, value.length - 1);
                gameVars = JSON.parse(atob(urlVal));
                foundVars = true;
            }
        });
    } else {
        gameVars["bingo_title"] = vars.title;
        for(var i = 0; i < vars.options.length; i++) {
            if(vars.options[i]) {
                gameVars[String(i)] = vars.options[i];
            }
        }
        foundVars = true;
    }
    return foundVars ? gameVars : null;
}

function generateGame() {
    var errors = [];
    var bingoTitle = $("#bingo_title").val().trim();
    var bingoOptions = $("#bingo_options").val().split(",");

    // Check valid characters only
    if(!$("#bingo_options").val().match(/^[a-zA-Z0-9\s,]*$/)) {
        errors.push("options_character");
    }
    // Check for an invalid entry that is blank or only spaces
    if($("#bingo_options").val().match(/\,\s*\,/g)) {
        errors.push("options_entry");
    }
    // Check if too few entries to play a game
    if(bingoOptions.length < 24) {
        errors.push("options_short");
    }
    if(!bingoTitle) {
        errors.push("title_required");
    }
    // Check title has valid characters and that it is not only spaces
    else if(!bingoTitle.match(/^[a-zA-Z0-9\s]*$/) || !bingoTitle.match(/[a-zA-Z0-9]/g)) {
        errors.push("title_character");
    }
    if(errors.length > 0) {
        return errors;
    }
    var gameVars = getGameVars({title: bingoTitle, options: bingoOptions});

    saveGame(gameVars);

    var gameUrl = copyUrl(gameVars, "#generated_url");

    if(gameUrl.length > 2048) {
        errors.push("options_url");
    }

    $("#copy_success").show(500, function() {
        setTimeout(function() {
            $("#copy_success").hide(500);
        }, 3000);
    });
    return errors.length == 0 ? null : errors;
}

function copyUrl(gameVars, textarea) {
    var gameUrl = createUrl(gameVars);
    $(textarea).text(gameUrl);
    $(textarea).select();
    document.execCommand("copy");
    return gameUrl;
}

function createUrl(gameVars) {
    var gameUrl = location.protocol + "//" + location.host + location.pathname;
    var baseEncode = "_" + btoa(JSON.stringify(gameVars)) + "_";
    if(!gameVars["bingo_title"]) {
        gameUrl += "?check_win=" + baseEncode;
    } else {
        gameUrl += "?game_vars=" + baseEncode;
    }
    return gameUrl;
}

function quitGame() {
    delete localStorage.currentGame;
    $("#host_controls").hide();
    $("#game_options").show();
    $("#title_text").text("Bingo");
    $("td").removeClass("checked");
    $("td").removeClass("bingo");
    $("#game_options").html("<option>Create or Load a Game</option>");

    var cells = $("td");
    cells.each(function(index) {
        var cell = $(this);
        cell.text("");
        cell.attr("value", "");
    });


    $("#game_board").removeClass("active");
    setTimeout(function() {
        $("#btn_quit_game").hide();
        $("#btn_play_game").show();
    }, 500);
}

function checkForWin(playerBoard=false) {
    var playerWin = playerBoard ? false : true;
    var gameVars = gameVars ? gameVars : JSON.parse(atob(localStorage.currentGame));
    var gameBoard = playerBoard ? playerBoard : gameVars.gameBoard;
    var foundWin = false;
    // check columns
    for(var i = 0; i < boardSize; i++) {
        foundWin = checkCells([gameBoard[i], gameBoard[i+5], gameBoard[i+10], gameBoard[i+15], gameBoard[i+20]]);
        if(foundWin) {
            foundWinner(playerWin);
            return true;
        }
    }
    // check rows
    for(var i = 0; i < gameBoard.length; i += 5) {
        foundWin = checkCells(gameBoard.slice(i, i+5));
        if(foundWin) {
            foundWinner(playerWin);
            return true;
        }
    }
    //check diag \
    var x = boardSize + 1;
    var cells = [];
    for(var i = 0; i < gameBoard.length; i+=x) {
        cells.push(gameBoard[i]);
    }
    foundWin = checkCells(cells);
    if(foundWin) {
        foundWinner(playerWin);
        return true;
    }
    //check diag /
    x = boardSize - 1;
    cells = [];
    for(var i = x; i < gameBoard.length-x; i+=x) {
        cells.push(gameBoard[i]);
    }
    foundWin = checkCells(cells);
    if(foundWin) {
        foundWinner(playerWin);
        return true;
    }
    return false;
}

function checkCells(cells) {
    var gameVars = JSON.parse(atob(localStorage.currentGame));
    var pulledOptions = gameVars.pulledOptions ? gameVars.pulledOptions : [];
    pulledOptions.push("Free Space");
    var winningCells = [];
    if(!gameVars || pulledOptions <= 1) {
        return false;
    }
    for(var i = 0; i < cells.length; i++) {
        for(var j = 0; j < pulledOptions.length; j++) {
            if(cells[i] == pulledOptions[j]) {
                winningCells.push(cells[i]);
            }
        }
    }
    if(winningCells.length == boardSize) {
        highlightWin(winningCells);
        return true;
    }
    return false;
}

function highlightWin(winningCells) {
    var cells = $("td");
    for(var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        for(var j = 0; j < winningCells.length; j++) {
            var cellVal = winningCells[j];
            if($(cell).attr("value") == cellVal) {
                $(cell).addClass("bingo");
            }
        }
    }
}

function foundWinner(playerWin) {
    var gameVars = JSON.parse(atob(localStorage.currentGame));
    if(playerWin) {
        var gameBoard = gameVars.gameBoard;
        if(!preventBingo) {
            popupModal("win_url", gameBoard);
        }
    } else {
        popupModal("player_win", gameVars);
    }
}