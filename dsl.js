const uniq = (x) => Array.from(new Set(x));
const functions = {
  bool: (x) => x > 0.5,
  cap: (x, a, b) => {
    const min = a < b ? a : b;
    const max = a < b ? b : a;
    return x * (max - min) + min;
  },
};

function parse(x) {
  const lines = x
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);

  const properties = lines.map((line) => {
    const [, prop, value] = line.match(/(\w+)\s*=\s*(.+)/);
    return { prop, value };
  });

  const values = properties.map((x) => x.value).join('\n');
  const genes = Object.fromEntries(
    uniq(values.match(/([A-Z](\d+)?)+/g)).map((x) => [x, 1]),
  );

  return {
    genes,
    properties: Object.fromEntries(
      properties.map((x) => [x.prop, createFunction(x.value)(genes)]),
    ),
  };
}

function createFunction(code) {
  const helpers = Object.entries(functions).map((x) => `const ${x.join('=')}`);

  const body = `
    ${helpers.join(';')}
    with (genes) {
      return ${code}
    }
  `;

  return new Function('genes', body);
}

console.log(
  parse(`
    canReproduce = bool(ABC)
    velocity = A27 ? A27 * 0.2 : B * 0.1
    turnSpeed = cap(AC, 0, 100)
`),
);
