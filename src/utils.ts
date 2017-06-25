import Circle from './map/circle';


export interface IRgbColor {
  r: number;
  g: number;
  b: number;
}


export interface IRenderer {
  width: number;
  height: number;

  append(parent: Element): void;
  remove(): void;
  clear(): void;

  drawEntity(entity: Circle): void;
}