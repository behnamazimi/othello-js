const Board = require("./board");

class OthelloGame {

    defaultOptions = {
        width: 8,
        cellMaxWidth: 50,
        selector: "othello",
        cellBGColor: "#43a047",
    };

    constructor(options = {}) {
        if (options && typeof options === "object")
            this.options = {...this.defaultOptions, ...options};

        this.board = new Board(this.options.width);

        this.initGame()
    }

    initGame() {
        const {selector = "othella"} = this.options;

        this.elm = document.getElementById(selector);

        if (!this.elm)
            throw new Error(`Element not found for id ${selector}`);

        for (let y = 0; y < this.options.width; y++) {
            const boardRowElm = this.createRowElm(y);
            for (let x = 0; x < this.options.width; x++) {

                const cell = this.board.getCell(x, y);

                const boardCellElm = this.createCellElm(x, y);
                boardCellElm.appendChild(this.createNutElm(cell.owner, this.board.isValidMove(x, y), this.board.turn));

                boardRowElm.appendChild(boardCellElm)
            }

            this.elm.appendChild(boardRowElm)
        }

        // this.handleCellClick(2, 3)();
        // this.handleCellClick(2, 2)();
        // this.handleCellClick(3, 2)();
        // this.handleCellClick(2, 4)();
        // this.handleCellClick(1, 5)();
        // this.handleCellClick(1, 4)();
        // this.handleCellClick(1, 3)();
        // this.handleCellClick(1, 2)();
        // this.handleCellClick(1, 1)();
        // this.handleCellClick(2, 1)();
        // this.handleCellClick(1, 0)();
        // this.handleCellClick(3, 1)();
        // this.handleCellClick(4, 0)();
        // this.handleCellClick(2, 0)();
        // this.handleCellClick(3, 0)();
        // this.handleCellClick(4, 2)();

        // this.handleCellClick(2, 4)()
        // this.handleCellClick(1, 5)()
        // this.handleCellClick(1, 4)()

    }

    reRender() {

        for (let y = 0; y < this.options.width; y++) {
            for (let x = 0; x < this.options.width; x++) {

                const cell = this.board.getCell(x, y);

                const boardCellElm = document.getElementById(`og-board-cell-${x}-${y}`);
                boardCellElm.innerHTML = "";
                boardCellElm.appendChild(this.createNutElm(cell.owner, this.board.isValidMove(x, y), this.board.turn));

            }
        }

    }

    createNutElm(type, validMove = false, turn) {
        const nut = document.createElement("span");
        nut.style.backgroundColor = type;
        nut.style.display = "inline-block";
        nut.style.width = `${Math.floor(this.options.cellMaxWidth * .8)}px`;
        nut.style.height = `${Math.floor(this.options.cellMaxWidth * .8)}px`;
        nut.style.borderRadius = '100%';

        if (validMove) {
            nut.style.border = `1px dashed #${turn === "white" ? "eee" : "444"}`;
        }

        return nut;
    }

    createRowElm(y) {
        const elm = document.createElement("div");
        elm.style.display = "flex";
        elm.setAttribute("class", `og-board-row row-${y}`);
        elm.setAttribute("id", `og-board-row-${y}`);

        return elm;
    }

    handleCellClick(x, y) {
        return (e) => {
            console.log(this.board.moves);
            this.board.placeNutTo(x, y);
            this.reRender();
        }
    }

    createCellElm(x, y) {
        const elm = document.createElement("div");
        elm.setAttribute("class", `og-cell cell-${x}-${y}`);
        elm.setAttribute("id", `og-board-cell-${x}-${y}`);

        elm.style.backgroundColor = this.options.cellBGColor;
        elm.style.border = "1px solid #d5d5d5";
        elm.style.width = `${this.options.cellMaxWidth}px`;
        elm.style.height = `${this.options.cellMaxWidth}px`;
        elm.style.display = "flex";
        elm.style.justifyContent = "center";
        elm.style.alignItems = "center";

        elm.onclick = this.handleCellClick(x, y);
        return elm;
    }

}

console.time("BOARD_INIT");
const OG = new OthelloGame();
console.timeEnd("BOARD_INIT");
