import { parseDsl } from './dsl';

const dsl = `
canReproduce = bool(ABC)
velocity = A27 ? A27 * 0.2 : B * 0.1
turnSpeed = cap(AC, 0, 100)
`;

const props = parseDsl(dsl);
const genes = getGenes(dsl);
const result = execute(props, genes);

console.log({ genes, result });
