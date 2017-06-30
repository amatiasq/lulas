import * as params from '../parameters';
import Vector from '../physics/vector';
import Circle from './circle';


export default class Map {
  private _width: number;
  private _height: number;
  private halfWidth: number;
  private halfHeight: number;
  entities: Circle[];


  constructor(
    width = params.MAP_DEFAULT_WIDTH,
    height = params.MAP_DEFAULT_HEIGHT,
    public readonly cellSize = params.MAP_DEFAULT_CELL_SIZE,
  ) {
    this.width = width;
    this.height = height;
    this.entities = [];
  }


  get width() {
    return this._width;
  }
  set width(value) {
    this._width = value;
    this.halfWidth = value / 2;
  }
  get height() {
    return this._height;
  }
  set height(value) {
    this._height = value;
    this.halfHeight = value / 2;
  }


  getEntitiesAt(from: Vector, radius: number) {
    return this.entities.filter(entity => {
      if (entity.isDisposed)
        return false;

      const diff = from.sustract(entity.location);
      return diff.x <= radius && diff.y <= radius;
    });
  }

  getShorterDistance(from: Vector, to: Vector) {
    const diff = to.sustract(from);

    return new Vector(
      roundMap(diff.x, this.width),
      roundMap(diff.y, this.height),
    );
  }

  round(entity: Circle) {
    let x = entity.location.x % this.width;
    let y = entity.location.y % this.height;

    if (x < 0) x = this.width - x;
    if (y < 0) y = this.height - y;

    entity.location = new Vector(x, y);
  }
}


function roundMap(value: number, max: number) {
  if (Math.abs(value) <= max / 2)
    return value;

  if (value < 0)
    return value + max;

  return value - max;
}
