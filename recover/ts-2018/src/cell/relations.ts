import Cell from './index';
import CellState from './state';

export default class CellRelations {

    private get parent() {
        return this.state.parent;
    }
    private set parent(id: number) {
        this.state.parent = id;
    }

    private get hasParent() {
        return this.parent != null;
    }

    constructor(
        private cell: Cell,
        private state: CellState,
    ) {}

    setParent(target: Cell) {
        if (this.hasParent) {
            throw new Error('Only one parent per cell!');
        }

        this.parent = target.id;
    }

    isFamily(target: Cell) {
        const { parent, cell } = this;
        const targetParent = this.getOthersParent(target);

        return (
            this.isParentOf(target) ||
            this.isChildOf(target) ||
            this.isSibling(target)
        );
    }

    isParentOf(target: Cell) {
        return this.getOtherHasParent(target) && this.getOthersParent(target) === this.cell.id;
    }

    isChildOf(target: Cell) {
        return this.hasParent && this.parent === target.id;
    }

    isSibling(target: Cell) {
        return (
            this.hasParent &&
            this.getOtherHasParent(target) &&
            this.parent === this.getOthersParent(target)
        );
    }

    private getOthersParent(other: Cell) {
        // Accessing private property of another instance of the same class
        return (other as any).relations.parent as number;
    }

    private getOtherHasParent(other: Cell) {
        // Accessing private property of another instance of the same class
        return (other as any).relations.hasParent as boolean;
    }

}
