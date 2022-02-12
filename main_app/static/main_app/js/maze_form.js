const BLOCK_SIZE = 40;
const HOVER_COLOR = "rgba(236,206,17,0.2)";

let grid = null;
let playerPosition = null;
let goalPosition = null;

document.addEventListener("DOMContentLoaded",() => {
    let gridString = document.getElementById("gridString");
    if (gridString.value !== ""){
        createGridFromData(gridString.value);
    }
    else {
        createNewGrid(20,20);
    }
    setupGridEditor();
    setupMazeFormValidation();
});

function setupGridEditor(){
    document.getElementById("openGridEditor").addEventListener("click",() => {
        document.getElementById("gridEditor").classList.remove("hidden");
        document.getElementById("mazeFormContainer").classList.add("hidden");
    });

    document.getElementById("closeGridEditor").addEventListener("click", () => {
        document.getElementById("gridEditor").classList.add("hidden");
        document.getElementById("mazeFormContainer").classList.remove("hidden");
        
        let gridString = document.getElementById("gridString");
        gridString.value = gridToString(grid);

        checkAndSetGridErrors();
    });
    
    document.getElementById("newGrid").addEventListener("click",() => {
        document.getElementById("newGrid").classList.add("hidden");
        document.getElementById("newGridDimensions").classList.remove("hidden");
    });

    document.getElementById("newGridForm").addEventListener("submit",(ev) => {
        ev.preventDefault();
        let width = document.getElementById("width").value;
        let height = document.getElementById("height").value;
        document.getElementById("width").value = "";
        document.getElementById("height").value = "";
        document.getElementById("newGrid").classList.remove("hidden");
        document.getElementById("newGridDimensions").classList.add("hidden");
        createNewGrid(width,height);
    })

    document.getElementById("cancelNewGrid").addEventListener("click",() => {
        document.getElementById("width").value = "";
        document.getElementById("height").value = "";
        document.getElementById("newGrid").classList.remove("hidden");
        document.getElementById("newGridDimensions").classList.add("hidden");
    });
}

function checkAndSetGridErrors(){
    let gridErrors = document.getElementById("gridErrors");

    if(grid === null){
        gridErrors.innerText = "Create a grid.";
        return false;
    }
    else if(playerPosition === null && goalPosition === null){
        gridErrors.innerText = "Player and goal need to be placed in the maze.";
        return false;
    }
    else if(playerPosition === null){
        gridErrors.innerText = "Player needs to be placed in the maze.";
        return false;
    }
    else if(goalPosition === null){
        gridErrors.innerText = "Goal needs to be placed in the maze.";
        return false;
    }
    else {
        gridErrors.innerText = "";
        return true;
    }
}

function setupMazeFormValidation(){
    document.getElementById("mazeForm").addEventListener("submit",(ev) => {
        let validGrid = checkAndSetGridErrors();
        if(!validGrid){
            ev.preventDefault();
        }
    });
}

function gridToString(grid){
    let s = "";
    s += grid.length;
    s += " ";
    s += grid[0].length;
    s += "\n";
    for(let i = 0; i < grid.length; i++){
        for(let j = 0; j < grid[0].length; j++){
            s += grid[i][j];
        }
    }
    return s;
}

function createNewGrid(width, height){
    playerPosition = null;
    goalPosition = null;

    let canvasContainer = document.getElementById("canvasContainer");
    canvasContainer.innerHTML = `<canvas width="${BLOCK_SIZE * width}" height="${BLOCK_SIZE * height}"></canvas>`;
    
    grid = [];
    for(let i = 0; i < height; i++){
        let row = [];
        for(let j = 0; j < width; j++){
            row.push("E");
        }
        grid.push(row);
    }

    let ctx = document.querySelector("canvas").getContext("2d");
    setupCanvasHover(ctx);
    setupCanvasClick(ctx);

    //Render the grid.
    for(let i = 0; i < height; i++){
        for(let j = 0; j < width; j++){
            drawSquare(ctx,j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE, grid[i][j]);
        }
    }
}

function createGridFromData(data){
    playerPosition = null;
    goalPosition = null;

    let lines = data.split('\n');

    let dimensions = lines[0].split(' ').map(val => Number(val.trim()));
    let height = dimensions[0];
    let width = dimensions[1];

    let gridData = lines[1];

    let canvasContainer = document.getElementById("canvasContainer");
    canvasContainer.innerHTML = `<canvas width="${BLOCK_SIZE * width}" height="${BLOCK_SIZE * height}"></canvas>`;
    
    grid = [];
    let c = 0;
    for(let i = 0; i < height; i++){
        let row = [];
        for(let j = 0; j < width; j++){
            row.push(gridData[c]);
            if(gridData[c] === "P"){
                playerPosition = [i,j];
            }
            else if(gridData[c] === "G"){
                goalPosition = [i,j];
            }
            c += 1;
        }
        grid.push(row);
    }

    let ctx = document.querySelector("canvas").getContext("2d");
    setupCanvasHover(ctx);
    setupCanvasClick(ctx);

    //Render the grid.
    for(let i = 0; i < height; i++){
        for(let j = 0; j < width; j++){
            drawSquare(ctx,j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE, grid[i][j]);
        }
    }
}

function setupCanvasHover(ctx){
    let hoverPosition = null;

    document.querySelector("canvas").addEventListener("mousemove",(ev) => {
        if(ev.offsetX < 0 || ev.offsetX >= BLOCK_SIZE * grid[0].length || ev.offsetY < 0 || ev.offsetY >= BLOCK_SIZE * grid.length){
            return;
        }

        let i = Math.floor(ev.offsetY/BLOCK_SIZE);
        let j = Math.floor(ev.offsetX/BLOCK_SIZE);
        
        //Render previous hoverposition without hover.
        if(hoverPosition){
            drawSquare(ctx,
                        hoverPosition[1] * BLOCK_SIZE,
                        hoverPosition[0] * BLOCK_SIZE, 
                        BLOCK_SIZE, 
                        grid[hoverPosition[0]][hoverPosition[1]]);
        }

        //Render new hoverposition with hover.
        drawSquare(ctx,j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE, grid[i][j]);
        ctx.fillStyle = HOVER_COLOR;
        ctx.fillRect(j * BLOCK_SIZE + 1, i * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

        hoverPosition = [i,j];
    });

    document.querySelector("canvas").addEventListener("mouseleave",(ev) => {
        if(hoverPosition){
            //Render previous hoverposition without hover.
            drawSquare(ctx,
                        hoverPosition[1] * BLOCK_SIZE,
                        hoverPosition[0] * BLOCK_SIZE, 
                        BLOCK_SIZE, 
                        grid[hoverPosition[0]][hoverPosition[1]]);
            
            hoverPosition = null;
        }
    });
}

function setupCanvasClick(ctx){
    document.querySelector("canvas").addEventListener("click",(ev) => {
        if(ev.offsetX < 0 || ev.offsetX >= BLOCK_SIZE * grid[0].length || ev.offsetY < 0 || ev.offsetY >= BLOCK_SIZE * grid.length){
            return;
        }

        let j = Math.floor(ev.offsetX/BLOCK_SIZE);
        let i = Math.floor(ev.offsetY/BLOCK_SIZE);
        let brush = document.getElementById("brushSelect").value;

        if(grid[i][j] === brush){
            return;
        }

        if(grid[i][j] === "G"){
            goalPosition = null;
        }
        else if(grid[i][j] === "P"){
            playerPosition = null;
        }

        if(brush === "P"){
            //Clear out the previous playerPosition.
            if(playerPosition !== null){
                grid[playerPosition[0]][playerPosition[1]] = "E";
                drawSquare(ctx,
                        playerPosition[1] * BLOCK_SIZE, 
                        playerPosition[0] * BLOCK_SIZE, 
                        BLOCK_SIZE, 
                        grid[playerPosition[0]][playerPosition[1]]);
            }
            playerPosition = [i,j];
        }
        else if(brush === "G"){
            //Clear out the previous goalPosition.
            if(goalPosition !== null){
                grid[goalPosition[0]][goalPosition[1]] = "E";
                drawSquare(ctx,
                            goalPosition[1] * BLOCK_SIZE, 
                            goalPosition[0] * BLOCK_SIZE, 
                            BLOCK_SIZE, 
                            grid[goalPosition[0]][goalPosition[1]]);
            }
            goalPosition = [i,j];
        }

        grid[i][j] = brush;
        drawSquare(ctx,j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE, grid[i][j]);
    });
}