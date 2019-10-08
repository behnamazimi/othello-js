'use strict';

const Cell = require("./cell");

class Board {

    constructor(options) {

        const {width = 8} = options;

        this.options = options;
        this.width = width;
        this.cells = {};
        this.moves = [];
        this.turn = "black";

        this.initBoard();
    }

    initBoard() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.width; y++) {
                this.cells[`${x}-${y}`] = new Cell(x, y);
            }
        }

        this.putInitialNuts();

        this.renderOnHTML()
    }

    putInitialNuts() {
        const centerCord = Math.floor(this.width / 2);

        this.setOwner(centerCord, centerCord, "white");
        this.setOwner(centerCord - 1, centerCord - 1, "white");

        this.setOwner(centerCord, centerCord - 1, "black");
        this.setOwner(centerCord - 1, centerCord, "black");
    }

    renderOnHTML() {
        const {selector = "othella"} = this.options;

        const elm = document.getElementById(selector);

        if (!elm)
            throw new Error(`Node not found for id ${elm}`)

        elm.appendChild(`<h1>Huuum</h1>`)

    }

    setOwner(x, y, owner) {
        if (!this.cells[`${x}-${y}`]) {
            throw new Error(`Could not found any cell for x:${x} & y:${y}`)
        }

        this.cells[`${x}-${y}`].owner = owner;
    }

    changeTurn() {
        this.turn = this.turn === "white" ? "black" : "white";
    }

    getNuts(type = null) {
        let nuts = [];
        Object.keys(this.cells)
            .forEach(key => {
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
        allNeighbors.forEach(([nx, ny]) => {
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
            for (let i = 1; i < this.width; i++) {
                let cell = this.cells[directions[dir](i)];

                if (!cell || cell.owner === null) {
                    break;

                } else if (cell.owner !== this.turn) {
                    rivalOnCross++;

                } else if (cell.owner === this.turn && rivalOnCross > 0) {
                    this.addMove(nx, ny, centerNut, dir);
                    break;
                }
            }
        })

    }

    findMoves() {
        this.moves = [];
        let nuts = [];
        if (this.turn === "white")
            nuts = this.getBlackNuts();
        else
            nuts = this.getWhiteNuts();

        nuts.forEach((nut) => {
            const [x, y] = nut.pos();
            const neighbors = this.getEmptyNeighborsOfCell(x, y);

            neighbors.forEach((neighbor) => {
                const [nx, ny] = neighbor.pos();

                this.moveCrossDirection(nx, ny, [x, y]);

            });

        });

        return this.moves;
    }

    placeNutByCrossDirection(nx, ny, dir) {

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

        for (let i = 0; i < this.width; i++) {
            let cell = this.cells[directions[dir](i)];
            // console.log(dir, [nx, ny], cell);
            if (!cell) {
                break;

            } else if (cell.owner !== this.turn) {
                cell.owner = this.turn;

            } else if (cell.owner === this.turn) {
                break;

            } else if (cell.owner === null) {
                break
            }
        }

    }

    placeNutTo(x, y) {

        this.findMoves();

        const move = this.moves.find(move => move.x === x && move.y === y);
        if (!move || !move.x)
            throw new Error(`The move [${x},${y}] is not possible!`);

        move.directions.forEach((dir) => {
            this.placeNutByCrossDirection(x, y, dir);
        });

        this.changeTurn()

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