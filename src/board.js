'use strict';

const Cell = require("./cell");

class Board {

    constructor(width) {

        this.width = width;
        this.cells = {};
        this.moves = [];
        this._turn = "black";

        this.initBoard();
    }

    initBoard() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.width; y++) {
                this.cells[`${x}-${y}`] = new Cell(x, y);
            }
        }

        this.putInitialNuts();
    }

    putInitialNuts() {
        const centerCord = Math.floor(this.width / 2);

        this.setOwner(centerCord, centerCord, "white");
        this.setOwner(centerCord - 1, centerCord - 1, "white");

        this.setOwner(centerCord, centerCord - 1, "black");
        this.setOwner(centerCord - 1, centerCord, "black");

        this.findMoves();
    }

    get turn() {
        return this._turn
    }

    getCell(x, y) {
        return this.cells[`${x}-${y}`]
    }

    setOwner(x, y, owner) {
        if (!this.cells[`${x}-${y}`]) {
            throw new Error(`Could not found any cell for x:${x} & y:${y}`)
        }

        this.cells[`${x}-${y}`].owner = owner;
    }

    changeTurn() {
        this._turn = this._turn === "white" ? "black" : "white";
    }

    getNuts(type = null) {
        let nuts = [];
        Object.keys(this.cells)
            .map(key => {
                if ((!type && this.cells[key].owner !== null) || (type && this.cells[key].owner === type))
                    nuts.push(this.cells[key]);
            });
        return nuts;
    }

    getWhiteNuts() {
        return this.getNuts("white");
    }

    getBlackNuts() {
        return this.getNuts("black");
    }

    addMove(x, y, centerNut, direction) {

        let alreadyAdded = false;
        this.moves.map((move) => {
            if (move.x === x && move.y === y) {
                alreadyAdded = true;

                if (move.directions.indexOf(direction) === -1) {
                    move.directions.push(direction)
                }
            }
        });

        if (!alreadyAdded)
            this.moves.push({
                x,
                y,
                centerNut,
                directions: [direction],
            })
    }

    getAllNeighbors(x, y) {
        return [
            [x - 1, y - 1], [x - 1, y], [x - 1, y + 1],
            [x, y - 1], [x, y + 1],
            [x + 1, y - 1], [x + 1, y], [x + 1, y + 1]
        ]
            .filter(([x, y]) => (x > -1 && y > -1) && (x < this.width && y < this.width));
    }

    getEmptyNeighborsOfCell(x, y) {
        let emptyNeighbors = [];

        const allNeighbors = this.getAllNeighbors(x, y);
        allNeighbors.map(([nx, ny]) => {
                if (this.cells[`${nx}-${ny}`].owner === null) {
                    emptyNeighbors.push(this.cells[`${nx}-${ny}`]);
                }
            }
        );

        return emptyNeighbors
    }

    moveCrossDirection(nx, ny, centerNut) {

        const directions = {
            topLeftToNut: (i) => `${nx + i}-${ny + i}`, // x > nx && y > ny
            topCenterToNut: (i) => `${nx}-${ny + i}`, // x === nx && y > ny
            topRightToNut: (i) => `${nx - i}-${ny + i}`, // x < nx && y > ny
            leftCenterToNut: (i) => `${nx + i}-${ny}`, // x > nx && y === ny
            rightCenterToNut: (i) => `${nx - i}-${ny}`, // x < nx && y === ny
            bottomLeftToNut: (i) => `${nx + i}-${ny - i}`, // x > nx && y < ny
            bottomCenterToNut: (i) => `${nx}-${ny - i}`, // x < nx && y < ny
            bottomRightToNut: (i) => `${nx - i}-${ny - i}`, // x < nx && y < ny
        };

        Object.keys(directions).map(dir => {
            let rivalOnCross = 0;
            for (let i = 0; i < this.width; i++) {
                let cell = this.cells[directions[dir](i)];

                if (!cell) {
                    break;

                } else if (cell.owner !== this._turn && cell.owner !== null) {
                    rivalOnCross++;

                } else if (cell.owner === this._turn && rivalOnCross > 0) {
                    this.addMove(nx, ny, centerNut, dir);
                    break;

                } else if (i === 1 && (cell.owner === this._turn || cell.owner === null)) {
                    break;
                }
            }
        })

    }

    findMoves() {
        this.moves = [];

        let nuts;
        if (this._turn === "white")
            nuts = this.getBlackNuts();
        else
            nuts = this.getWhiteNuts();

        nuts.map((nut) => {
            const [x, y] = nut.pos();
            const neighbors = this.getEmptyNeighborsOfCell(x, y);

            neighbors.map((neighbor) => {
                const [nx, ny] = neighbor.pos();

                this.moveCrossDirection(nx, ny, [x, y]);
            });

        });

    }

    findCellToChangeByCross(nx, ny, dir) {

        const directions = {
            topLeftToNut: (i) => `${nx + i}-${ny + i}`, // x > nx && y > ny
            topCenterToNut: (i) => `${nx}-${ny + i}`, // x === nx && y > ny
            topRightToNut: (i) => `${nx - i}-${ny + i}`, // x < nx && y > ny
            leftCenterToNut: (i) => `${nx + i}-${ny}`, // x > nx && y === ny
            rightCenterToNut: (i) => `${nx - i}-${ny}`, // x < nx && y === ny
            bottomLeftToNut: (i) => `${nx + i}-${ny - i}`, // x > nx && y < ny
            bottomCenterToNut: (i) => `${nx}-${ny - i}`, // x < nx && y < ny
            bottomRightToNut: (i) => `${nx - i}-${ny - i}`, // x < nx && y < ny
        };

        let cellToChange = [];

        for (let i = 0; i <= this.width; i++) {
            let cell = this.cells[directions[dir](i)];

            if (!cell) {
                break;

            } else if (cell.owner !== this._turn) {
                cellToChange.push(cell);

            } else if (cell.owner === this._turn || cell.owner === null) {
                break;

            }
        }

        return cellToChange

    }

    isValidMove(x, y) {
        return this.moves.find(move => move.x === x && move.y === y) !== undefined
    }

    placeNutTo(x, y) {

        const move = this.moves.find(move => move.x === x && move.y === y);
        if (!move)
            throw new Error(`The move [${x},${y}] is impossible!`);

        let cellsToChange = [];
        move.directions.map((dir) => {
            cellsToChange = [...cellsToChange, ...this.findCellToChangeByCross(x, y, dir)];
        });

        cellsToChange.map(cell => cell.owner = this._turn);

        this.changeTurn();
        this.findMoves();

        if (this.moves.length === 0) {
            console.log(`from == bottom ==>> turn change from ${this._turn} to ${this._turn === "white" ? "black" : "white"}`);
            this.changeTurn();
            this.findMoves();
        }

    }

    gameResult() {
        const white = this.getWhiteNuts().length,
            black = this.getBlackNuts().length;

        return {
            white,
            black,
            winner: white > black ? "white" :
                black > white ?
                    "black" : "equal"
        };

    }
}

// const b = new Board(8);
// b.placeNutTo(2, 3);
// b.placeNutTo(2, 4);
// b.placeNutTo(1, 5);
// b.placeNutTo(5, 2);
// b.placeNutTo(5, 5);
// console.log(b.gameResult());
// console.log(b.gameResult());

// console.log(b.getBlackNuts());
// console.log(b.getWhiteNuts());

module.exports = Board;