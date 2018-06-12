import Cell from './cell';
import { IEnergySource } from './cell/diet';
import Vector from './vector';

export default class World {

    private entities = new Set<IWorldEntity>();

    constructor(
        readonly size: Vector,
    ) {}

    add(entity: IWorldEntity) {
        this.entities.add(entity);
    }

    remove(entity: IWorldEntity) {
        this.entities.delete(entity);
    }

    getEntitiesAlive() {
        return [...this.entities];
    }

    getEntitiesAt(point: Vector) {
        const result: IWorldEntity[] = [];

        for (const entity of this.entities) {
            const { x, y } = point.diff(entity.pos);
            const { size } = entity;
            const isInBox = x < size && y < size;

            if (isInBox && entity.pos.distance(point) <= size) {
                result.push(entity);
            }
        }

        return result;
    }

    getEntitiesIn(point: Vector, radius: number) {
        const start = point.sub({ x: radius, y: radius });
        const end = point.add({ x: radius, y: radius });
        const result: IWorldEntity[] = [];

        for (const entity of this.entities) {
            const { x, y } = entity.pos;
            const range = radius + entity.size;
            const isInBox = x >= start.x && x <= end.x && y >= start.y && y <= end.y;

            if (isInBox && entity.pos.distance(point) <= range) {
                result.push(entity);
            }
        }

        return result;
    }

}

export interface IWorldEntity<T = EntityState> extends IEnergySource, StateHolder<T> {
    id: number;
    size: number;
    pos: Vector;
    tick(map: World): void;
    render(context: CanvasRenderingContext2D): void;
}

export interface StateHolder<T> {
    getState(): T;
    setState(state: T): void;
    flushState(): void;
}

export interface EntityState {

}
