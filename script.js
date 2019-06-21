"use strict"

const CIRCLE = 'O';
const CROSS = 'X';
const CELL_CLASS_PREFIX = 'cell_id_';
const NUMBER_OF_STEPS = 9;
const WIN_VARIANTS = [  [0,1,2],[0,3,6],[0,4,8],
                        [3,4,5],[6,7,8],[1,4,7],
                        [2,5,8],[2,4,6]];
const CROSS_SVG = `
    <svg viewbox="0 0 40 40">
        <path class="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
    </svg>
`;
const CIRCLE_SVG = `
    <svg viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="30" stroke="#58a8ff" 
                stroke-width="12"  stroke-linecap="round" fill="transparent"/>
    </svg>
`;

function Game(){
    this._step = 1;
    this._moves = new Array(9).fill('');
    this._isGameEnded = false;
    this._gameboard = document.querySelector('.gameboard');
    this.runLink = this.run.bind(this);
    this._addEvents();
}

Game.prototype._showCell = function(element, cellClassName){
    const cell = document.querySelector('.' + cellClassName);
    let className = (element === CIRCLE) ? 'circle' : 'cross';

    try {
        if (!cell.hasChildNodes()){
            return;
        }

        let children = cell.childNodes;
        for (let i = 0; i < children.length; ++i) {
            if (children[i].classList === undefined){
                continue;
            }
            if(children[i].classList.contains(className)){
                children[i].classList.remove('hidden');
            }
        }
    } catch (e) {
        return;
    }
}

Game.prototype._randomFromArray = function(items){
    return items[Math.floor(Math.random()*items.length)];
}

Game.prototype._canWinIndex = function(player){
    let filledCellsByPlayer = [], canWinIndex=null;
    this._moves.forEach((el, index) => { if (el === player) { filledCellsByPlayer.push(index); }});

    WIN_VARIANTS.forEach(variant => {
        const result = variant.filter(cell => !filledCellsByPlayer.includes(cell));
        
        // If there is only one cell and it is not taken by other player;
        if(result.length === 1 && this._moves[result[0]] === ''){
            canWinIndex = result[0];
        }
    });

    return canWinIndex;
}

Game.prototype._isPlayerWon = function(player){
    let filledCellsByPlayer = [], canWinIndex=null;
    this._moves.forEach((el, index) => { if (el === player) { filledCellsByPlayer.push(index); }});
    WIN_VARIANTS.forEach(variant => {
        const result = variant.filter(cell => !filledCellsByPlayer.includes(cell));

        if(result.length === 0){
            this._endGame(player, variant);
        }
    });
    return canWinIndex;
}

Game.prototype._circleMove = function(){
    if(this._step === 2){
        /*  Choose strategy to win. If center cell is empty we choose it.
            If not, we choose any cell in the corner. */
        const i = (this._moves[4] === '') ? 4 : this._randomFromArray([0,2,6,8]);
        const cellClassName = CELL_CLASS_PREFIX + i;
        this._doStep(CIRCLE, cellClassName, i);
    } else {
        let index = this._canWinIndex(CIRCLE);
        if(index === null){
            index = this._canWinIndex(CROSS);
            if(index === null){
                let emptyIndexes = [];
                this._moves.forEach((el, index) => { if (el === '') { emptyIndexes.push(index); }});
                index = this._randomFromArray(emptyIndexes);
            }
        }
        const cellClassName = CELL_CLASS_PREFIX + index;
        this._doStep(CIRCLE, cellClassName, index);
    }

    this._gameboard.classList.remove('not-clickable');
}

Game.prototype._crossMove = function(event, gameboard){
    let id, cellClassName;

    // Get id of cell from class name.
    try{
        cellClassName = event.target.className.split(' ').find(el => 
            el.startsWith(CELL_CLASS_PREFIX));
        id = cellClassName.slice(-1);
    } catch (e) {
        gameboard.classList.remove('not-clickable');
        return;
    }

    this._doStep(CROSS, cellClassName, id);
}

Game.prototype._doStep = function(player, cellClassName, id){
    this._moves[id] = player;
    this._showCell(player, cellClassName);
    this._step += 1;
    this._isPlayerWon(player);
}

Game.prototype.run = function(event){
    this._gameboard.classList.add('not-clickable');
    const step = this._step;
    this._crossMove(event, this._gameboard);

    if(step === this._step){
        return;
    }

    if(this._isGameEnded){
        return;
    }

    if (this._step > NUMBER_OF_STEPS){
        this._endGame();
        return;
    }

    setTimeout(this._circleMove.bind(this), 1000);
}

Game.prototype._getCoordinates = function(winMove){
    let coordinates = {};
    winMove.sort();
    let firstPoint = winMove[0];
    let lastPoint = winMove[2];
    coordinates.y1 = this._getCoordinate(Math.floor(firstPoint / 3));
    coordinates.y2 = this._getCoordinate(Math.floor(lastPoint / 3));
    coordinates.x1 = this._getCoordinate(firstPoint % 3);
    coordinates.x2 = this._getCoordinate(lastPoint % 3);

    if (coordinates.x1 === coordinates.x2){
        coordinates.y1 = '0%';
        coordinates.y2 = '100%';
    }
    if (coordinates.y1 === coordinates.y2){
        coordinates.x1 = '0%';
        coordinates.x2 = '100%';
    }
    return coordinates;
}

Game.prototype._getCoordinate = function(number){
    return  (number === 0) ? '15%' : 
            (number === 1) ? '50%': '85%';
}

Game.prototype._prepareResultText = function(player){
    let infoBoxText = document.querySelector('.info-box__text');
    let winner = (player === CIRCLE) ? CIRCLE_SVG : CROSS_SVG;
    winner = '<div class="svg-container">' + winner + '</div>';
    const text = player ? 'Winner is ' + winner : 'Tie' + CIRCLE_SVG + CROSS_SVG;
    infoBoxText.innerHTML = text;
}

Game.prototype._showInfoBox = function(){
    this._gameboard.classList.add('not-clickable', 'blurry');
    let infoBox = document.querySelector('.info-box');
    infoBox.classList.remove('hidden');
}

Game.prototype._showResults = function(player){
    this._prepareResultText(player);
    this._showInfoBox();
}

Game.prototype._drawWinLine = function(winMove){
    let line = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    line.classList.add('line');
    
    const coordinates = this._getCoordinates(winMove);
    line.innerHTML =    "<line x1=" + coordinates.x1 + " y1=" + coordinates.y1+ 
                        " x2=" + coordinates.x2 + " y2=" + coordinates.y2 + 
                        " style='stroke:rgb(89, 168, 251); stroke-width:11'/> ";
    this._gameboard.appendChild(line);
}

Game.prototype._endGame = function(player, winMove){
    this._isGameEnded = true;
    this._removeEvents();

    if(winMove){
        this._drawWinLine(winMove);
    }

    setTimeout(this._showResults.bind(this), 1000, player);
}

Game.prototype._clear = function(){
    this._gameboard.innerHTML = '';
    this._gameboard.classList.remove('not-clickable', 'blurry');

    let text = document.querySelector('.info-box__text');
    text.innerHTML = '';

    let infoBox = document.querySelector('.info-box');
    infoBox.classList.add('hidden');
}

Game.prototype._drawGameboard = function(){
    for(let i = 0; i < NUMBER_OF_STEPS; i++){
        let child = document.createElement('div');
        child.className = "cell cell_id_" + i ;
        let crossAndCircle =   `<div class="circle hidden">` + CIRCLE_SVG + `</div>
                                <div class="cross hidden">` +  CROSS_SVG + `</div>`;
        child.innerHTML = crossAndCircle;
        this._gameboard.appendChild(child);
    }
}

Game.prototype.prepare = function(){
    this._clear();
    this._drawGameboard();
}

Game.prototype._addEvents = function () {
    this._gameboard.addEventListener('click', this.runLink);
}

Game.prototype._removeEvents = function () {
    this._gameboard.removeEventListener('click', this.runLink);
}

function ready() {
    document.querySelector('.start-game_button').removeEventListener("click", ready);
    let game = new Game();
    game.prepare();
    document.querySelector('.start-game_button').addEventListener("click", ready);
}

document.addEventListener("DOMContentLoaded", ready);