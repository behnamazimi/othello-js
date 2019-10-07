'use strict';

const Cell = require("./cell");

class Board {

    constructor(width = 8) {
        this.width = width;
        this.cells = {};
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
    }

    putInitialNuts() {
        const centerCord = Math.floor(this.width / 2);

        this.setOwner(centerCord, centerCord, "white");
        this.setOwner(centerCord - 1, centerCord - 1, "white");

        this.setOwner(centerCord, centerCord - 1, "black");
        this.setOwner(centerCord - 1, centerCord, "black");
    }

    setOwner(x, y, owner) {
        if (!this.cells[`${x}-${y}`]) {
            throw new Error(`Could not found any cell for x:${x} & y:${y}`)
        }

        this.cells[`${x}-${y}`].owner = owner;
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


    getCordPossibleNeighbors(x, y) {
        return [
            [x - 1, y - 1], [x - 1, y], [x - 1, y + 1],
            [x, y - 1], [x, y + 1],
            [x + 1, y - 1], [x + 1, y], [x + 1, y + 1]
        ].filter(([x, y]) => (x > -1 && y > -1) && (x < this.width && y < this.width));
    }

    getEmptyNeighborsOfCell(x, y) {
        let cells = [];

        const neighbors = this.getCordPossibleNeighbors(x, y);
        neighbors.forEach(([nx, ny]) => {
                if (this.cells[`${nx}-${ny}`].owner === null) {
                    cells.push(this.cells[`${nx}-${ny}`]);
                }
            }
        );

        return cells
    }

    findMoves() {
        let moves = [];
        let nuts = [];
        if (this.turn === "white")
            nuts = this.getBlackNuts();
        else
            nuts = this.getWhiteNuts();

        // nuts.forEach((nut) => {
        const [x, y] = nuts[0].pos();
        const neighbors = this.getEmptyNeighborsOfCell(x, y);

        neighbors.forEach((neighbor) => {
            const [nx, ny] = neighbor.pos();

            for (let i = 1; i < this.width; i++) {
                let cell;

                if (x > nx && y > ny) {
                    cell = this.cells[`${nx + i}-${ny + i}`];

                    if (cell && cell.owner === this.turn) {
                        if (!moves.includes(`${nx}-${ny}`))
                            moves.push(`c1 "${nx + "," + ny}" ${i} ${nx}-${ny}`)
                    } else break;

                } else if (x < nx && y < ny) {
                    cell = this.cells[`${nx - i}-${ny - i}`];
                    if (cell && cell.owner === this.turn) {
                        if (!moves.includes(`${nx}-${ny}`))
                            moves.push(`c2 "${nx + "," + ny}" ${i} ${nx}-${ny}`)
                    } else break;

                } else if (x === nx && y > ny) {
                    cell = this.cells[`${nx}-${ny - i}`];
                    if (cell && cell.owner === this.turn) {
                        if (!moves.includes(`${nx}-${ny}`))
                            moves.push(`c3 "${nx + "," + ny}" ${i} ${nx}-${ny}`)
                    } else break;

                } else if (x < nx && y > ny) {
                    cell = this.cells[`${nx - i}-${ny + i}`];
                    if (cell && cell.owner === this.turn) {
                        if (!moves.includes(`${nx}-${ny}`))
                            moves.push(`c4 "${nx + "," + ny}" ${i} ${nx}-${ny}`)
                    } else break;

                } else if (y < ny && x === nx) {
                    cell = this.cells[`${nx}-${ny + i}`];
                    if (cell && cell.owner === this.turn) {
                        if (!moves.includes(`${nx}-${ny}`))
                            moves.push(`c5 "${nx + "," + ny}" ${i} ${nx}-${ny}`)
                    } else break;

                } else if (x < nx && y === y) {
                    cell = this.cells[`${nx - i}-${ny}`];
                    if (cell && cell.owner === this.turn) {
                        if (!moves.includes(`${nx}-${ny}`))
                            moves.push(`c6 "${nx + "," + ny}" ${i} ${nx}-${ny}`)
                    } else break;

                } else if (x > nx && y === ny) {
                    cell = this.cells[`${nx + i}-${ny}`];
                    if (cell && cell.owner === this.turn) {
                        if (!moves.includes(`${nx}-${ny}`))
                            moves.push(`c7 "${nx + "," + ny}" ${i} ${nx}-${ny}`)
                    } else break;

                } else if (x > nx && y < ny) {
                    cell = this.cells[`${nx + i}-${ny - i}`];
                    if (cell && cell.owner === this.turn) {
                        if (!moves.includes(`${nx}-${ny}`))
                            moves.push(`c8 "${nx + "," + ny}" ${i} ${nx}-${ny}`)
                    } else break;

                }

            }

        });

        // });

        return moves;
    }
}

const b = new Board(8);
console.log(b.findMoves());

module.exports = Board;