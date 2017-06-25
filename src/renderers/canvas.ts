import Circle from '../map/circle';
import Vector from '../physics/vector';
import { IRenderer } from '../utils';


export default class CanvasRenderer implements IRenderer {

  private context: CanvasRenderingContext2D;


  constructor(private canvas = document.createElement('canvas')) {
    this.context = canvas.getContext('2d');
  }


  get width() {
    return this.canvas.width;
  }
  set width(value) {
    this.canvas.width = value;
  }
  get height() {
    return this.canvas.height;
  }
  set height(value) {
    this.canvas.height = value;
  }


  append(parent: Element) {
    parent.appendChild(this.canvas);
  }

  remove() {
    this.canvas.parentElement.removeChild(this.canvas);
  }

  private generateColor(entity: Circle) {
    const { r, g, b } = entity.baseColor;
    entity.color = `rgb(${calcColor(r)},${calcColor(g)},${calcColor(b)})`;
  }

  drawEntity(entity: Circle) {
    if (!entity.color)
      this.generateColor(entity);

    this.drawItem(entity.location, entity.radius, entity.movement, entity.color);
  }

  private drawItem(position: Vector, radius: number, movement: Vector, color: string) {
    const { context } = this;

    /* tslint:disable:no-bitwise */
    context.save();
    context.fillStyle = color;
    context.translate(position.x | 0, position.y | 0);

    context.beginPath();
    context.arc(0, 0, radius | 0, 0, Math.PI * 2);
    context.fill();
    // context.stroke();

    if (movement.magnitude !== 0) {
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(movement.x | 0, movement.y | 0);
      context.stroke();

      context.fillStyle = 'blue';
      context.translate(movement.x | 0, movement.y | 0);
      context.arc(0, 0, 2, 0, Math.PI * 2);
      context.fill();
    }
    /* tslint:enable:no-bitwise */

    context.restore();
  }

  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }
}


function calcColor(base: number) {
  return base === -1 ? Math.round(Math.random() * 128) : base;
}
