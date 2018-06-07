import Emitter, { Listener } from "../emitter.js";
import Stat from "../stat.js";
import Vector from "../vector.js";
import World from "../world.js";
import CellBehavior from "./behavior.js";
import CellBody from "./body.js";
import CellDiet, { IEnergySource, IEnergySourceConstructor } from "./diet.js";
import CellPhysic from "./physic.js";
import CellRelations from "./relations.js";
import CellRenderer from "./renderer.js";
import CellSenses from "./senses.js";

export default class Cell {

    private senses = new CellSenses(this);
    private diet = new CellDiet(this);
    private body = new CellBody(this);
    private physic = new CellPhysic(this);
    private relations = new CellRelations(this);
    private behavior = new CellBehavior(this);
    private renderer = new CellRenderer(this);
    private emitter = new Emitter();
    private stats = new Map<Stat, number>();

    //
    // STATS
    //

    getStat(key: Stat) {
        return this.stats.get(key);
    }

    setStat(key: Stat, value: number) {
        this.stats.set(key, value);
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

        return this.diet.canEat(target);
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
