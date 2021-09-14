const uniq = x => Array.from(new Set(x));
const functions = {
  bool: x => x > 0.5,
  cap: (x, a, b) => {
    const min = a < b ? a : b;
    const max = a < b ? b : a;
    return x * (max - min) + min;
  },
};

function getGenes(dsl) {
  const match = dsl.match(/\b([A-Z](\d+)?)+\b/g);
  const list = uniq(match);
  const withValues = list.map(x => [x, 1]);
  return Object.fromEntries(withValues);
}

function parse(dsl) {
  const lines = dsl
    .split('\n')
    .map(x => x.trim())
    .filter(Boolean);

  const properties = lines.map(line => {
    const [, prop, value] = line.match(/(\w+)\s*=\s*(.+)/);
    return { prop, value };
  });

  return Object.fromEntries(
    properties.map(x => [x.prop, createFunction(x.value)]),
  );
}

function execute(props, genes) {
  const entries = Object.entries(props);
  entries.forEach(x => (x[1] = x[1](genes)));
  return Object.fromEntries(entries);
}

function createFunction(code) {
  const helpers = Object.entries(functions).map(x => `const ${x.join('=')}`);

  const body = `
    ${helpers.join(';')}
    with (genes) {
      return ${code}
    }
  `;

  return new Function('genes', body);
}

const dsl = `
  canReproduce = bool(ABC)
  velocity = A27 ? A27 * 0.2 : B * 0.1
  turnSpeed = cap(AC, 0, 100)
`;

const props = parse(dsl);
const genes = getGenes(dsl);
const result = execute(props, genes);

console.log({ genes, result });
