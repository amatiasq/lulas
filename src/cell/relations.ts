import Cell from './index';

export default class CellRelations {

    private parents = new Set<Cell>();

    constructor(
        private cell: Cell,
    ) {}

    setParent(target: Cell) {
        this.parents.add(target);
    }

    isFamily(target: Cell) {
        return (
            this.isChildOf(target) ||
            this.isParentOf(target) ||
            this.isSibling(target)
        );
    }

    isParentOf(target: Cell) {
        return target.isChildOf(this.cell);
    }

    isChildOf(target: Cell) {
        return this.parents.has(target);
    }

    isSibling(target: Cell) {
        for (const parent of this.parents) {
            if (target.isChildOf(parent)) {
                return true;
            }
        }

        return false;
    }

}
