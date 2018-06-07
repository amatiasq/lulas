import { abs } from './math';

export default class Vector {

    static ZERO = Vector.of(0, 0);

    static of(x: number, y: number) {
        return new Vector(x, y);
    }

    static from({ x = 0, y = 0 }: IVectorSetter) {
        return new Vector(x, y);
    }

    static withMagnitude({ x, y, magnitude}: Vector, value: number) {
        const ratio = magnitude / value;
        return Vector.of(x / ratio, y / ratio);
    }

    constructor(
        readonly x: number,
        readonly y: number,
    ) {}

    get magnitude() {
        return Math.hypot(this.x, this.y);
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
