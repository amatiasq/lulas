import { Cell } from '../Cell';
import { TAU } from '../math';
import { Vector } from '../Vector';
import { Game } from './Game';

export class GameRenderer {
  constructor(
    private readonly game: Game,
    private readonly canvas: HTMLCanvasElement,
  ) {}

  renderEntities() {
    const { game, canvas } = this;
    const { width, height } = canvas;
    const entities = game.getEntitiesAlive();
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, width, height);

    for (const entity of entities) {
      entity.render(context);
    }
  }

  renderCellDetails(cell: Cell) {
    this.renderCellVision(cell);
    this.renderCellBehavior(cell);
  }

  private renderCellVision(cell: Cell) {
    for (const visible of cell.getVisibleEntities(this.game.world)) {
      this.drawLine(cell.pos, visible.pos, {
        color: 'rgba(0, 0, 0, 50)',
        width: 0.5,
      });
    }

    const visionRange = cell.getVisionRange();

    this.drawCircle(cell.pos, visionRange, {
      color: 'red',
    });
  }

  private renderCellBehavior(cell: Cell) {
    const velocityMultiplier = 100;
    const velocityLine = cell.velocity.multiply({
      x: velocityMultiplier,
      y: velocityMultiplier,
    });

    this.drawLine(cell.pos, velocityLine.add(cell.pos), {
      color: 'blue',
      width: 2,
    });
  }

  drawLine(from: Vector, to: Vector, { color = 'black', width = 1 } = {}) {
    const context = this.canvas.getContext('2d');

    context.lineWidth = width;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.closePath();
    context.stroke();
  }

  drawCircle(at: Vector, radius: number, { color = 'black', width = 1 } = {}) {
    const context = this.canvas.getContext('2d');

    context.lineWidth = width;
    context.strokeStyle = color;
    context.beginPath();
    context.arc(at.x, at.y, radius, 0, TAU);
    context.closePath();
    context.stroke();
  }
}
