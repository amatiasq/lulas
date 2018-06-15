import Cell from './index';
import CellState from './state';

export default class CellRelations {

    get parent() {
        return this.state.parent;
    }
    set parent(id: number) {
        this.state.parent = id;
    }

    constructor(
        private cell: Cell,
        private state: CellState,
    ) {}

    setParent(target: Cell) {
        if (this.parent != null) {
            throw new Error('Only one parent per cell!');
        }

        this.parent = target.id;
    }

    isFamily(target: Cell) {
        const { parent, cell } = this;
        const targetParent = this.getOthersParent(target);

        return (
            parent === target.id ||
            targetParent === cell.id ||
            parent === targetParent
        );
    }

    isParentOf(target: Cell) {
        return this.getOthersParent(target) === this.cell.id;
    }

    isChildOf(target: Cell) {
        return this.parent === target.id;
    }

    isSibling(target: Cell) {
        return this.parent === this.getOthersParent(target);
    }

    private getOthersParent(other: Cell) {
        // Accessing private property of another instance of the same class
        return (other as any).relations.parent as number
    }

}
