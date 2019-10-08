'use strict';

class Cell {

    constructor(x, y, owner = null) {
        this.x = x;
        this.y = y;
        this._owner = owner;
    }

    pos() {
        return [this.x, this.y]
    }

    get owner() {
        return this._owner;
    }

    set owner(owner) {
        this._owner = owner;
    }

    neighbors() {
        return [
            [this.x - 1, this.y - 1], [this.x - 1, this.y], [this.x - 1, this.y + 1],
            [this.x, this.y - 1], [this.x, this.y + 1],
            [this.x + 1, this.y - 1], [this.x + 1, this.y], [this.x + 1, this.y + 1],
        ];
    }

}

module.exports = Cell;