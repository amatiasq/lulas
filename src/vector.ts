import { abs } from './math';

export default class Vector {

    static ZERO = Vector.of(0, 0);

    static of(x: number, y: number) {
        return new Vector(x, y);
    }

    static from({ x = 0, y = 0 }: IVectorSetter) {
        return new Vector(x, y);
    }

    static apply(action: (...values: number[]) => number, ...vectors: IVector[]) {
        return Vector.of(
            action(...vectors.map(vector => vector.x)),
            action(...vectors.map(vector => vector.y)),
        );
    }

    static range({ x = 0, y = 0 }: IVectorSetter) {
        return this.iterate(Vector.of(x, y));
    }

    static *iterate(vectorA: IVector, vectorB: IVector = new Vector(0, 0)) {
        const start = this.apply(Math.min, vectorA, vectorB);
        const end = this.apply(Math.max, vectorA, vectorB);

        for (let x = start.x; x < end.x; x++) {
            for (let y = start.y; y < end.y; y++) {
                yield start.add({ x, y });
            }
        }
    }

    constructor(
        readonly x: number,
        readonly y: number,
    ) {
        if (isNaN(x) || isNaN(y)) {
            throw new Error(`Creating vector with NaN: ${this}`);
        }
    }

    get isZero() {
        return this.x === 0 && this.y === 0;
    }

    private _magnitude: number;

    get magnitude() {
        if (this.isZero) {
            return 0;
        }

        if (!this._magnitude) {
            this._magnitude = Math.hypot(this.x, this.y);
        }

        return this._magnitude;
    }


    get radians(): number {
        if (this.isZero) {
            return 0;
        }

        const { x, y } = this;
        let arctan = Math.atan(y / x);

        if (arctan < 0) {
            arctan += Math.PI;
        }

        if (y < 0 || (y === 0 && x < 0)) {
            arctan += Math.PI;
        }

        return arctan;
    }

    setMagnitude(value: number) {
        if (this.magnitude === 0) {
            return Vector.of(value, 0);
        }

        const ratio = this.magnitude / value;
        return Vector.of(this.x / ratio, this.y / ratio);
    }

    distance(target: Vector) {
        return this.sub(target).magnitude;
    }

    is({ x = this.x, y = this.y }: IVectorSetter) {
        return this.x === x && this.y === y;
    }

    sub({ x = 0, y = 0 }: IVectorSetter) {
        return Vector.of(this.x - x, this.y - y);
    }

    add({ x = 0, y = 0 }: IVectorSetter) {
        return Vector.of(this.x + x, this.y + y);
    }

    multiply({ x = 1, y = 1 }: IVectorSetter) {
        return Vector.of(this.x * x, this.y * y);
    }

    diff({ x = this.x, y = this.y }: IVectorSetter) {
        return Vector.of(abs(this.x - x), abs(this.y - y));
    }

    toString() {
        return `[Vector(${this.x}, ${this.y})]`;
    }

}

export interface IVector {
    x: number;
    y: number;
}

interface IXVector {
    x: number;
    y?: number;
}

interface IYVector {
    y: number;
    x?: number;
}

export type IVectorSetter = IXVector | IYVector;
