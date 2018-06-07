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

    getAllEntities() {
        return [...this.entities];
    }

    getEntitiesAt(point: Vector, radius: number) {
        const start = point.sub({ x: radius, y: radius });
        const end = point.add({ x: radius, y: radius });
        const result: IWorldEntity[] = [];

        for (const entity of this.entities) {
            const { x, y } = entity.pos;
            const isInBox = x >= start.x && x <= end.x && y >= start.y && y <= end.y;

            if (isInBox && entity.pos.distance(point) <= radius) {
                result.push(entity);
            }
        }

        return result;
    }

}

export interface IWorldEntity extends IEnergySource {
    pos: Vector;
    tick(map: World): void;
    render(context: CanvasRenderingContext2D): void;
}
