"use strict"

const NUMBER_OF_STEPS = 9;

function Game(){
    this._step = 0;
    this._moves = new Array(9).fill('');
}

Game.prototype._NUMBER_OF_STEPS = 9;

Game.prototype._showCell = function(element, cell){
    let className = (element === 'O') ? 'circle' : 'cross';
    
    if (cell.hasChildNodes()){
        let children = cell.childNodes;
        for (let i = 0; i < children.length; ++i) {
            if (children[i].classList === undefined){
                continue;
            }
            if(children[i].classList.contains(className)){
                children[i].classList.remove('hidden');
            }
        }
    }
}

Game.prototype.playerMakeMove = function(event){
    // get id of box from class name
    const className = event.target.className.split(' ').find(el => 
        el.startsWith('cell_id_'));

    if (className === undefined){
        return;
    }
        
    const id = className.slice(-1);
    let cell = document.querySelector('.' + className);

    this._step += 1;
    this._moves[id] = (this._step % 2 == 0) ? 'O' : 'X';
    this._showCell(this._moves[id], cell);

    if (this._step === NUMBER_OF_STEPS){
        this._endGame();
    }
}

Game.prototype._endGame = function(){
    console.log('endgame');
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

    let playerMakeMove = event => game.playerMakeMove(event);
    document.querySelector('.gameboard').addEventListener("click", playerMakeMove);
}

document.addEventListener("DOMContentLoaded", ready);