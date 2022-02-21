const STEP_FRAME_COUNT = 11;
const BLOCK_SIZE = 160;

//Grid data
let grid;

let playerPosition;

let playing = false;

//Animation data.
let instep = false;
let newPosition;

let startTime;
let time;

let ctx;

//Current key data.
let keyup = false;
let keyPressed = null;

let totalCoins = null;
let currCoins = null;

document.addEventListener("DOMContentLoaded",() => {
    let playButton = document.getElementById("play");
    playButton.addEventListener("click",() => {
        playButton.remove();
        startNewGame();
    });
    
    let replayButton = document.getElementById("replay");
    replayButton.addEventListener("click",() => {
        replayButton.classList.add("hidden");
        startNewGame();
    });

    let gameCanvas =  document.getElementById("gameCanvas");
    gameCanvas.addEventListener("resize",gameCanvasCtxSetup);

    gameCanvasInputSetup();
    gameCanvasCtxSetup();
    setupInstructions();
});

function setupInstructions() {
    let squareTypes = document.getElementById("squareTypes").querySelectorAll("canvas");
    for (let i = 0; i < squareTypes.length; i++){
        let canvas = squareTypes[i];
        let ctx = canvas.getContext("2d");
        drawSquare(ctx,0,0,100,canvas.dataset["type"]);
    }
    document.getElementById("openInstructions").addEventListener("click",() => {
        document.getElementById("instructions").classList.remove("hidden");
        document.getElementById("game").style.display = "none";
    });
    document.getElementById("closeInstructions").addEventListener("click",() => {
        document.getElementById("instructions").classList.add("hidden");
        document.getElementById("game").style.display = "flex";
    });
}

function gameCanvasInputSetup() {
    let gameCanvas = document.getElementById("gameCanvas");

    gameCanvas.addEventListener("keyup",(ev) => {
        if(ev.key === keyPressed){
            keyup = true;
        }
    });

    gameCanvas.addEventListener("focusout",(ev) => {
        if(["w","a","s","d","ArrowLeft","ArrowUp","ArrowDown","ArrowRight"].findIndex(val => val === keyPressed) !== -1){
            keyup = true;
        }
    });

    gameCanvas.addEventListener("keydown",(ev) => {
        if(["w","a","s","d","ArrowLeft","ArrowUp","ArrowDown","ArrowRight"].findIndex(val => val === ev.key) !== -1){
            keyPressed = ev.key;
            keyup = false;
        }
    });

    //Refer to MDN section on touch events.
    let touch_identifier = null;
    document.querySelectorAll(".arrowButton").forEach(button => {
        button.addEventListener("touchstart",(ev) => {
            let touches = ev.changedTouches;
            touch_identifier = touches[touches.length - 1].identifier;
            keyPressed = button.dataset.move;
            keyup = false;
        });
        button.addEventListener("touchend",(ev) => {
            for(let i = 0; i < ev.changedTouches.length; i++){
                let touch = ev.changedTouches[i];
                if(touch.identifier === touch_identifier){
                    keyup = true;
                    identifier = null;
                }
            }
        });
    });
}

function gameCanvasCtxSetup(){
    ctx = document.getElementById("gameCanvas").getContext("2d");
    ctx.imageSmoothingEnabled = false;
}

function setGridFromGridData() {
    //gridData is present in a script tag in the create_maze html template.
    let lines = gridData.split("\n");
    let dimensionData = lines[0];
    let mazeContent = lines[1];
    let dimensions = dimensionData.split(" ").map(dimension => Number(dimension));

    grid = [];
    totalCoins = 0;

    let c = 0;
    for(let i = 0; i < dimensions[0]; i++){
        let row = [];
        for(let j = 0; j < dimensions[1]; j++){
            row.push(mazeContent[c]);
            if(mazeContent[c] === "P"){
                playerPosition = [i,j];
            }
            if(mazeContent[c] === "C"){
                totalCoins += 1;
            }
            c += 1;
        }
        grid.push(row);
    }
}

function setNewGameGlobalData() {
    keyPressed = null;
    keyup = false;
    currCoins = 0;
    playing = true;
    startTime = Math.floor(Date.now()/1000);
    //totalTime is present in a script tag in the create_maze html template.
    time = Number(totalTime) * 60;

    setGridFromGridData();
}

function startNewGame(){
    let playMenuContainer = document.getElementById("playMenuContainer");
    playMenuContainer.style.display = "none";

    setNewGameGlobalData();

    document.getElementById("timer").innerText = `Time left: ${time}`;
    document.getElementById("result").innerText = "";
    document.getElementById("coins").innerText = `Coins: ${currCoins}/${totalCoins}`;
    
    let gameCanvas = document.getElementById("gameCanvas");
    gameCanvas.focus();

    renderGrid();
    timeCallback();
    stepStart();
}

function timeCallback() {
    if(playing && !instep){
        let timeLeft = time - (Math.floor(Date.now()/1000) - startTime);
        if(timeLeft > 0){
            document.getElementById("timer").innerText = `Time left: ${timeLeft}`;
            //Set timeout for slightly less than a second later.
            setTimeout(timeCallback,999);
        }
        else {
            playing = false;

            document.getElementById("timer").innerText = "0";
            document.getElementById("result").innerText = "Time's up.";
            document.getElementById("replay").classList.remove("hidden");
            document.getElementById("playMenuContainer").style.display = "flex";
        }
    }
    else if(playing){
        setTimeout(timeCallback,999);
    }
}

//This function is for checking time when the animation is playing: we don't want game
//over mid animation, and so we call this at the end of our animation.
function timeCheck(){
    let timeLeft = time - (Math.floor(Date.now()/1000) - startTime);
    if(timeLeft > 0){
        document.getElementById("timer").innerText = `Time left: ${timeLeft}`;
    }
    else {
        playing = false;

        document.getElementById("timer").innerText = "0";
        document.getElementById("result").innerText = "Time's up.";
        document.getElementById("replay").classList.remove("hidden");
        document.getElementById("playMenuContainer").style.display = "flex";
    }
}

function stepStart() {
    if (playing && !instep){
        if(keyPressed){
            switch(keyPressed){
                case "w":
                case "ArrowUp":
                case "UpButton":
                    newPosition = [playerPosition[0] - 1,playerPosition[1]];
                    break;
                case "a":
                case "ArrowLeft":
                case "LeftButton":
                    newPosition = [playerPosition[0],playerPosition[1] - 1];
                    break;
                case "ArrowDown":
                case "s":
                case "DownButton":
                    newPosition = [playerPosition[0] + 1,playerPosition[1]];
                    break;
                case "ArrowRight":
                case "d":
                case "RightButton":
                    newPosition = [playerPosition[0],playerPosition[1] + 1];
                    break;
            }
            let isNewPositionValid = (newPosition[0] < 0 || newPosition[0] >= grid.length
                || newPosition[1] < 0 || newPosition[1] >= grid[0].length)
                || grid[newPosition[0]][newPosition[1]] === "B";

            if(isNewPositionValid){
                setTimeout(stepStart,20);
                return;
            }
            else {
                instep = true;
                requestAnimationFrame(() => {animateStep(STEP_FRAME_COUNT)});
            }
        }
        else {
            setTimeout(stepStart,20);
        }
    }
}

function animateStep(steps) {
    ctx.clearRect(0,0,800,800);

    if(steps === 0){
        stepEnd();
        return;
    }

    //We perform a linear animation, with STEP_FRAME_COUNT many steps.

    let scale = (1 / (STEP_FRAME_COUNT - 1)) * (STEP_FRAME_COUNT - steps);
    let xoff =  scale * (playerPosition[1] - newPosition[1]) * BLOCK_SIZE;
    let yoff = scale * (playerPosition[0] - newPosition[0]) * BLOCK_SIZE;

    for(let i = -1; i < 6; i++){
        for(let j = -1; j < 6; j++){
            //Player location.
            if(i === 2 && j === 2){
                continue;
            }
            let y = playerPosition[0] - 2 + i;
            let x = playerPosition[1] - 2 + j;

            //Position is out of the maze, so draw block.
            if(y < 0 || y >= grid.length || x < 0 || x >= grid[0].length){
                drawSquare(ctx, j * BLOCK_SIZE + xoff, i * BLOCK_SIZE + yoff, BLOCK_SIZE, "B");
                continue;
            }
            
            //If drawing the position we are moving towards, add alpha transperency
            //to create a disappearing effect (for goals, coins and time bonuses).
            drawSquare(ctx, j * BLOCK_SIZE + xoff, i * BLOCK_SIZE + yoff, BLOCK_SIZE, grid[y][x],((x === newPosition[1]) && (y === newPosition[0])) ? 1.0 - scale : 1.0);
        }
    }
    drawSquare(ctx, 2 * BLOCK_SIZE , 2 * BLOCK_SIZE, BLOCK_SIZE, "P");
    steps -= 1;
    requestAnimationFrame(() => {animateStep(steps)});
}

function stepEnd(){
    //Set previous position to be empty.
    grid[playerPosition[0]][playerPosition[1]] = "E";

    switch(grid[newPosition[0]][newPosition[1]]){
        case "G":
            playing = false;
            document.getElementById("result").innerText = "You won!";
            document.getElementById("replay").classList.remove("hidden");
            document.getElementById("playMenuContainer").style.display = "flex";
            break;
        case "C":
            currCoins += 1;
            document.getElementById("coins").innerText = `Coins: ${currCoins}/${totalCoins}`;
            break;
        case "T":
            time += 20;
            break;
    }
    grid[newPosition[0]][newPosition[1]] = "P";
    playerPosition = newPosition;
    instep = false;
    if(keyup){
        keyPressed = null;
    }

    //Time check is required because we don't perform them mid animation step.
    timeCheck();

    renderGrid();
    stepStart();
}

function renderGrid(){
    ctx.clearRect(0,0,800,800);
    for(let i = 0; i < 5; i++){
        for(let j = 0; j < 5; j++){ 
            let y = playerPosition[0] - 2 + i;
            let x = playerPosition[1] - 2 + j;
            if(y < 0 || y >= grid.length || x < 0 || x >= grid[0].length){
                //drawSquare is defined in draw_square.js
                drawSquare(ctx,j * BLOCK_SIZE, i * BLOCK_SIZE,BLOCK_SIZE,"B");
                continue;
            }
            drawSquare(ctx,j * BLOCK_SIZE, i * BLOCK_SIZE,BLOCK_SIZE,grid[y][x]);
        }
    }
}