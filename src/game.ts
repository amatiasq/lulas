import Life from './life/life';
import WorldMap from './map/map';
import Vector from './physics/vector';
import { IRenderer } from './utils';


type OnEntityDie = (entity: Life) => void;
type OnEntityReproduce = (children: Life[], entity: Life) => void;

interface ILifeCreator {
  new (location: Vector, diameter: number, parents: Life[]): Life;
}


export default class Game {
  private _onEntityDie: OnEntityDie;
  private _onEntityReproduce: OnEntityReproduce;
  private _renderer: IRenderer;
  private children: Life[];
  private dead: Life[];
  private types = new Map<string, ILifeCreator>();

  onEntityDie: OnEntityDie;
  onEntityReproduce: OnEntityReproduce;
  entities = [] as Life[];
  map = new WorldMap();


  constructor(public readonly container: Element) {
    /* tslint:disable:no-unsafe-any */
    this._onEntityDie = this.__onEntityDie.bind(this);
    this._onEntityReproduce = this.__onEntityReproduce.bind(this);
    /* tslint:enable:no-unsafe-any */
  }

  get renderer() {
    return this._renderer;
  }
  set renderer(value) {
    if (this._renderer)
      this._renderer.remove();

    value.append(this.container);
    this._renderer = value;
  }

  get width() {
    return this.map.width;
  }
  set width(value) {
    this.map.width = value;
    this.renderer.width = value;
  }
  get height() {
    return this.map.height;
  }
  set height(value) {
    this.map.height = value;
    this.renderer.height = value;
  }


  __onEntityDie(entity: Life) {
    this.dead.push(entity);

    if (this.onEntityDie)
      this.onEntityDie(entity);
  }

  __onEntityReproduce(children: Life[], parent: Life) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      this.children.push(child);
      child.$entityType = parent.$entityType;
    }

    if (this.onEntityReproduce)
      this.onEntityReproduce(children, parent);
  }

  addEntityType(id: string, type: ILifeCreator) {
    this.types.set(id, type);
  }

  removeEntityType(id: string) {
    this.types.delete(id);
    this.entities = this.entities.filter(item => item.$entityType !== id);
  }

  _newEntity(entity: Life) {
    entity.onDie = this._onEntityDie;
    entity.onReproduce = this._onEntityReproduce;
    this.entities.push(entity);
    return entity;
  }

  spawn(id: string, position: Vector, diameter: number) {
    const ctor = this.types.get(id);
    const entity = new ctor(position, diameter, null);
    entity.$entityType = id;
    return this._newEntity(entity);
  }

  remove(entity: Life) {
    const index = this.entities.indexOf(entity);

    if (index === -1)
      return false;

    this.entities.slice(index, 1);
    return true;
  }

  tick() {
    this.tickEntities();
    this.roundMap();
    this.render();
  }

  tickEntities() {
    this.dead = [];
    this.children = [];
    const entities = this.entities.slice();
    const { length } = entities;

    for (let i = 0; i < length; i++) {
      const entity = entities[i];
      this.map.entities = this.entities;

      if (entity.isAlive)
        entity.tick(this.map);
    }

    this.removeDead();
    this.addChildren(this.children);
    this.children = null;
    this.dead = null;
  }

  addChildren(children: Life[]) {
    const { length } = children;

    for (let i = 0; i < length; i++) {
      const child = children[i];

      if (child)
        this._newEntity(child);
    }
  }

  removeDead() {
    const { entities } = this;
    const { length } = entities;
    const alive = [];

    for (let i = 0; i < length; i++) {
      const entity = entities[i];

      if (entity.isDisposed || entity.isDead)
        entity.dispose();
      else
        alive.push(entity);
    }

    this.entities = alive;
  }

  roundMap() {
    const { length } = this.entities;

    for (let i = 0; i < length; i++)
      this.map.round(this.entities[i]);
  }

  render() {
    this.renderer.clear();
    const { length } = this.entities;

    for (let i = 0; i < length; i++)
      this.renderer.drawEntity(this.entities[i]);
  }
}
