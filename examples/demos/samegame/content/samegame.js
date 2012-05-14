/****************************************************************************
**
** Copyright (C) 2012 Nokia Corporation and/or its subsidiary(-ies).
** Contact: http://www.qt-project.org/
**
** This file is part of the QtQml module of the Qt Toolkit.
**
** $QT_BEGIN_LICENSE:LGPL$
** GNU Lesser General Public License Usage
** This file may be used under the terms of the GNU Lesser General Public
** License version 2.1 as published by the Free Software Foundation and
** appearing in the file LICENSE.LGPL included in the packaging of this
** file. Please review the following information to ensure the GNU Lesser
** General Public License version 2.1 requirements will be met:
** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
**
** In addition, as a special exception, Nokia gives you certain additional
** rights. These rights are described in the Nokia Qt LGPL Exception
** version 1.1, included in the file LGPL_EXCEPTION.txt in this package.
**
** GNU General Public License Usage
** Alternatively, this file may be used under the terms of the GNU General
** Public License version 3.0 as published by the Free Software Foundation
** and appearing in the file LICENSE.GPL included in the packaging of this
** file. Please review the following information to ensure the GNU General
** Public License version 3.0 requirements will be met:
** http://www.gnu.org/copyleft/gpl.html.
**
** Other Usage
** Alternatively, this file may be used in accordance with the terms and
** conditions contained in a signed written agreement between you and Nokia.
**
**
**
**
**
**
** $QT_END_LICENSE$
**
****************************************************************************/
/* This script file handles the game logic */
.pragma library
.import QtQuick.LocalStorage 2.0 as Sql

var maxColumn = 10;
var maxRow = 15;
var maxIndex = maxColumn*maxRow;
var board = new Array(maxIndex);
var blockSrc = "BoomBlock.qml";
var scoresURL = "";
var gameDuration;
var component = Qt.createComponent(blockSrc);
var highScoreBar = -1;
var gameCanvas;
var nameInputDialog = null;
var dialog = null;

// Index function used instead of a 2D array
function index(column, row)
{
    return column + row * maxColumn;
}

function timeStr(msecs)
{
    var secs = Math.floor(msecs/1000);
    var m = Math.floor(secs/60);
    var ret = "" + m + "m " + (secs%60) + "s";
    return ret;
}

function startNewGame(gc)
{
    gameCanvas = gc;
    // Delete blocks from previous game
    for (var i = 0; i < maxIndex; i++) {
        if (board[i] != null)
            board[i].destroy();
    }

    // Calculate board size
    maxColumn = Math.floor(gameCanvas.width/gameCanvas.blockSize);
    maxRow = Math.floor(gameCanvas.height/gameCanvas.blockSize);
    maxIndex = maxRow * maxColumn;

    // Close dialogs
    if(nameInputDialog != null)
        nameInputDialog.forceClose();
    if(dialog != null)
        dialog.forceClose();

    // Initialize Board
    board = new Array(maxIndex);
    gameCanvas.score = 0;
    for (var column = 0; column < maxColumn; column++) {
        for (var row = 0; row < maxRow; row++) {
            board[index(column, row)] = null;
            createBlock(column, row);
        }
    }
    gameDuration = new Date();
}

var fillFound;  // Set after a floodFill call to the number of blocks found
var floodBoard; // Set to 1 if the floodFill reaches off that node

// NOTE: Be careful with vars named x,y, as the calling object's x,y are still in scope
function handleClick(x,y)
{
    if(gameCanvas == undefined){
        console.log("But the game hasn't started yet!");
        return;
    }
    var column = Math.floor(x/gameCanvas.blockSize);
    var row = Math.floor(y/gameCanvas.blockSize);
    if (column >= maxColumn || column < 0 || row >= maxRow || row < 0)
        return;
    if (board[index(column, row)] == null)
        return;
    // If it's a valid block, remove it and all connected (does nothing if it's not connected)
    floodFill(column,row, -1);
    if (fillFound <= 0)
        return;
    gameCanvas.score += (fillFound - 1) * (fillFound - 1);
    shuffleDown();
    victoryCheck();
}

function floodFill(column,row,type)
{
    if (board[index(column, row)] == null)
        return;
    var first = false;
    if (type == -1) {
        first = true;
        type = board[index(column,row)].type;

        // Flood fill initialization
        fillFound = 0;
        floodBoard = new Array(maxIndex);
    }
    if (column >= maxColumn || column < 0 || row >= maxRow || row < 0)
        return;
    if (floodBoard[index(column, row)] == 1 || (!first && type != board[index(column, row)].type))
        return;
    floodBoard[index(column, row)] = 1;
    floodFill(column + 1, row, type);
    floodFill(column - 1, row, type);
    floodFill(column, row + 1, type);
    floodFill(column, row - 1, type);
    if (first == true && fillFound == 0)
        return; // Can't remove single blocks
    board[index(column, row)].dying = true;
    board[index(column, row)] = null;
    fillFound += 1;
}

function shuffleDown()
{
    // Fall down
    for (var column = 0; column < maxColumn; column++) {
        var fallDist = 0;
        for (var row = maxRow - 1; row >= 0; row--) {
            if (board[index(column,row)] == null) {
                fallDist += 1;
            } else {
                if (fallDist > 0) {
                    var obj = board[index(column, row)];
                    obj.y = (row + fallDist) * gameCanvas.blockSize;
                    board[index(column, row + fallDist)] = obj;
                    board[index(column, row)] = null;
                }
            }
        }
    }
    // Fall to the left
    fallDist = 0;
    for (column = 0; column < maxColumn; column++) {
        if (board[index(column, maxRow - 1)] == null) {
            fallDist += 1;
        } else {
            if (fallDist > 0) {
                for (row = 0; row < maxRow; row++) {
                    obj = board[index(column, row)];
                    if (obj == null)
                        continue;
                    obj.x = (column - fallDist) * gameCanvas.blockSize;
                    board[index(column - fallDist,row)] = obj;
                    board[index(column, row)] = null;
                }
            }
        }
    }
}

function victoryCheck()
{
    // Awards bonuses for no blocks left
    var deservesBonus = true;
    for (var column = maxColumn - 1; column >= 0; column--)
        if (board[index(column, maxRow - 1)] != null)
            deservesBonus = false;
    if (deservesBonus)
        gameCanvas.score += 500;
    // Checks for game over
    if (deservesBonus || !(floodMoveCheck(0, maxRow - 1, -1))) {
        gameDuration = new Date() - gameDuration;
        if(nameInputDialog == null){
            nameInputDialog = Qt.createQmlObject('import "."; import "samegame.js" as Logic; NameInputDialog{onAccepted: Logic.saveHighScore(name)}', gameCanvas, "highscoredialog.qml");
        }
        if(dialog == null){
            dialog = Qt.createComponent("Dialog.qml").createObject(gameCanvas);
        }
        initHighScoreBar();
        if(gameCanvas.score > highScoreBar){
            nameInputDialog.show("You won! Your name:                 ");
            nameInputDialog.initialWidth = nameInputDialog.text.width + 20;
            if (nameInputDialog.name == "")
               nameInputDialog.width = nameInputDialog.initialWidth;
            nameInputDialog.text.opacity = 0; // Just a spacer
        }else{
            dialog.show("You won!");
        }
    }
}

// Only floods up and right, to see if it can find adjacent same-typed blocks
function floodMoveCheck(column, row, type)
{
    if (column >= maxColumn || column < 0 || row >= maxRow || row < 0)
        return false;
    if (board[index(column, row)] == null)
        return false;
    var myType = board[index(column, row)].type;
    if (type == myType)
        return true;
    return floodMoveCheck(column + 1, row, myType) ||
           floodMoveCheck(column, row - 1, board[index(column, row)].type);
}

function createBlock(column,row)
{
    // Note that we don't wait for the component to become ready. This will
    // only work if the block QML is a local file. Otherwise the component will
    // not be ready immediately. There is a statusChanged signal on the
    // component you could use if you want to wait to load remote files.
    if(component.status == 1){
        var dynamicObject = component.createObject(gameCanvas,
                {"type": Math.floor(Math.random() * 3),
                "x": column*gameCanvas.blockSize,
                "width": gameCanvas.blockSize,
                "height": gameCanvas.blockSize,
                "particleSystem": gameCanvas.ps});
        if(dynamicObject == null){
            console.log("error creating block");
            console.log(component.errorString());
            return false;
        }
        dynamicObject.y = row*gameCanvas.blockSize;
        dynamicObject.spawned = true;

        board[index(column,row)] = dynamicObject;
    }else{
        console.log("error loading block component");
        console.log(component.errorString());
        return false;
    }
    return true;
}

function initHighScoreBar()
{
    var db = Sql.openDatabaseSync(
        "SameGameScores",
        "1.0",
        "Local SameGame High Scores",
        100
    );
    db.transaction(
        function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS Scores(name TEXT, score NUMBER, gridSize TEXT, time NUMBER)');
            // Only show results for the current grid size
            var rs = tx.executeSql('SELECT * FROM Scores WHERE gridSize = "'
                + maxColumn + "x" + maxRow + '" ORDER BY score desc LIMIT 10');
            if(rs.rows.length < 10)
                highScoreBar = 0;
            else 
                highScoreBar = rs.rows.item(rs.rows.length - 1).score;
        }
    );
}

function saveHighScore(name)
{
    if (scoresURL != "")
        sendHighScore(name);
    // Offline storage
    var db = Sql.openDatabaseSync(
        "SameGameScores",
        "1.0",
        "Local SameGame High Scores",
        100
    );
    var dataStr = "INSERT INTO Scores VALUES(?, ?, ?, ?)";
    var data = [
        name,
        gameCanvas.score,
        maxColumn + "x" + maxRow,
        Math.floor(gameDuration / 1000)
    ];
    db.transaction(
        function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS Scores(name TEXT, score NUMBER, gridSize TEXT, time NUMBER)');
            tx.executeSql(dataStr, data);

            // Only show results for the current grid size
            var rs = tx.executeSql('SELECT * FROM Scores WHERE gridSize = "'
                + maxColumn + "x" + maxRow + '" ORDER BY score desc LIMIT 10');
            var r = "\nHIGH SCORES for this grid size\n\n"
            for (var i = 0; i < rs.rows.length; i++) {
                r += (i+1) + ". " + rs.rows.item(i).name + ' got '
                    + rs.rows.item(i).score + ' points in '
                    + rs.rows.item(i).time + ' seconds.\n';
            }
            if(rs.rows.length == 10)
                highScoreBar = rs.rows.item(9).score;
            dialog.show(r);
        }
    );
}
