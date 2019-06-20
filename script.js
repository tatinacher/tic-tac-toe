"use strict"

const CIRCLE = 'O';
const CROSS = 'X';
const CELL_CLASS_PREFIX = 'cell_id_';
const NUMBER_OF_STEPS = 9;
const WIN_VARIANTS = [  [0,1,2],[0,3,6],[0,4,8],
                        [3,4,5],[6,7,8],[1,4,7],
                        [2,5,8],[2,4,6]];

function Game(){
    this._step = 1;
    this._moves = new Array(9).fill('');
    this._timerId;
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
            console.log(this._timerId);
            clearTimeout(this._timerId);
            this._endGame(player, variant);
        }
    });
    return canWinIndex;
}

Game.prototype._circleMove = function(){
    console.log('circle', this._timerId)
    if(this._step === 2){
        /*  Choose strategy to win. If center cell is empty we choose it.
            If not, we choose any cell in the corner. */
        const i = (this._moves[4] === '') ? 4 : this._randomFromArray([0,2,6,8]);
        const cellClassName = CELL_CLASS_PREFIX + i;
        this._doStep(CIRCLE, cellClassName, i);
    } else {
        let index = this._canWinIndex(CIRCLE);
        if(!index){
            index = this._canWinIndex(CROSS);
            if(!index){
                let emptyIndexes = [];
                this._moves.forEach((el, index) => { if (el === '') { emptyIndexes.push(index); }});
                index = this._randomFromArray(emptyIndexes);
            }
        }
        const cellClassName = CELL_CLASS_PREFIX + index;
        this._doStep(CIRCLE, cellClassName, index);
    }
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

Game.prototype.playerMove = function(event){

    let gameboard = document.querySelector('.gameboard');
    gameboard.classList.add('not-clickable');

    this._crossMove(event, gameboard);
    if (this._step === NUMBER_OF_STEPS){
        this._endGame();
    }
    this._timerId = setTimeout(this._circleMove.bind(this), 1000);
    gameboard.classList.remove('not-clickable');
}

Game.prototype._endGame = function(player, winMove){
    console.log('end game', player, winMove);
    let gameboard = document.querySelector('.gameboard'), id, cellClassName;
    gameboard.classList.add('not-clickable');
}

function prepareGame(){
    let element = document.querySelector('.gameboard');
    for(let i = 0; i < NUMBER_OF_STEPS; i++){
        let child = document.createElement('div');
        child.className = "cell cell_id_" + i ;
        let crossAndCircle = `
        <div class="cross hidden">
            <svg viewbox="0 0 40 40">
                <path class="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
            </svg>
        </div>
        <div class="circle hidden">
            <svg viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="30" stroke="#58a8ff" 
                        stroke-width="12"  stroke-linecap="round" fill="transparent"/>
            </svg>
        </div>
        `;
        child.innerHTML = crossAndCircle;
        element.appendChild(child);
    }
}

function ready() {
    prepareGame();

    let game = new Game();
    let playerMove = event => game.playerMove(event);
    document.querySelector('.gameboard').addEventListener("click", playerMove);
}

document.addEventListener("DOMContentLoaded", ready);