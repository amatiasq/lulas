import Emitter, { Listener } from '../emitter';
import Stat from '../stat';
import Vector from '../vector';
import World from '../world';
import CellBehavior from './behavior';
import CellBody from './body';
import CellDiet, { IEnergySource, IEnergySourceConstructor } from './diet';
import CellPhysic from './physic';
import CellRelations from './relations';
import CellRenderer from './renderer';
import CellSenses from './senses';
import CellState, { IStateScreenshot } from './state';

let id = 0;
const cells: Cell[] = (window as any).cells = [];

export default class Cell {

    private behavior = new CellBehavior(this);
    private diet = new CellDiet(this);
    private relations = new CellRelations(this);
    private renderer = new CellRenderer(this);
    private senses = new CellSenses(this);
    private state = new CellState(this);
    private body = new CellBody(this, this.state);
    private physic = new CellPhysic(this, this.state);
    private emitter = new Emitter();
    id: number;

    constructor() {
        this.id = id++;

        cells[this.id] = this;
        this.flushState();
    }

    toString() {
        return `[Cell ${this.id}]`;
    }

    //
    // STATE
    //

    getStat(key: Stat) {
        return this.state.getStat(key);
    }

    setStat(key: Stat, value: number) {
        this.state.setStat(key, value);
    }

    getState() {
        return this.state.getState();
    }

    setState(value: IStateScreenshot) {
        return this.state.setState(value);
    }

    flushState() {
        return this.state.flushState();
    }

    //
    // SIGNALS
    //

    on(signal: string, listener: Listener) {
        this.emitter.on(signal, listener);
    }

    emit(signal: string, argument: any) {
        this.emitter.emit(signal, argument);
    }

    //
    // BODY
    //

    get isAlive() {
        return this.body.isAlive;
    }

    get size() {
        return this.body.size;
    }
    set size(value) {
        this.body.size = value;
    }

    get energy() {
        return this.body.energy;
    }
    set energy(value) {
        this.body.energy = value;
    }

    canMitos() {
        return this.body.canMitos();
    }

    mitos() {
        return this.body.mitos();
    }

    //
    // DIET
    //

    setDietType(Type: IEnergySourceConstructor, nutrition = 1) {
        this.diet.addType(Type, nutrition);
    }

    eat(target: IEnergySource) {
        return this.diet.eat(target);
    }

    canEat(target: IEnergySource) {
        if (target instanceof Cell && this.isFamily(target)) {
            return false;
        }

        return this.considerFood(target) > 0;
    }

    considerFood(target: IEnergySource) {
        const dietFactor = this.diet.consider(target);

        if (target instanceof Cell) {
            return dietFactor * this.considerFight(target);
        }

        return dietFactor;
    }

    //
    // SENSES
    //

    getVisionRange() {
        return this.senses.getVisionRange();
    }

    getVisibleEntities(map: World) {
        return this.senses.getVisibleEntities(map);
    }

    canSee(target: Cell) {
        return this.senses.canSee(target);
    }

    isTouching(target: Cell) {
        return this.senses.isTouching(target);
    }

    considerFight(target: Cell) {
        return this.senses.considerFight(target);
    }

    //
    // RELATIONS
    //

    setParent(target: Cell) {
        this.relations.setParent(target);
    }

    isFamily(target: Cell) {
        return this.relations.isFamily(target);
    }

    isParentOf(target: Cell) {
        return this.relations.isParentOf(target);
    }

    isChildOf(target: Cell) {
        return this.relations.isChildOf(target);
    }

    isSibling(target: Cell) {
        return this.relations.isSibling(target);
    }

    //
    // PHYSIC
    //

    get pos() {
        return this.physic.pos;
    }
    set pos(value) {
        this.physic.pos = value;
    }

    get velocity() {
        return this.physic.velocity;
    }
    set velocity(value) {
        this.physic.velocity = value;
    }

    shove(force: Vector) {
        return this.physic.shove(force);
    }

    move() {
        return this.physic.move();
    }

    //
    // BEHAVIOR
    //

    tick(map: World) {
        return this.behavior.tick(map);
    }

    //
    // RENDERER
    //

    render(context: CanvasRenderingContext2D) {
        return this.renderer.render(context);
    }

}
