function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

const geneDefinition = [
  ['DA1dsaDF0', 'dA2dffds1'],
  ['DB1dfdafbv', 'dB2dfsaf23', 'DB3avbgh44'],
  ['DC1dfas456', 'dC2fadf963'],
  ['dD1fadsfas', 'DD2324jk23'],
];

const dslDefinition = {
  canReproduce: 'B A1',
  velocity: 'N 10,100 C D A2 B14',
  turnSpeed: 'N -10,10 A B2 C1 D',
};

for (let i = 0; i < 25; i++) {
  const [i1, i2] = generateIndividuals(geneDefinition, 2);
  const child = reproduce(i1, i2);
  const geneticPhoto = getGeneticPhoto(child);
  console.log(computeIndividual(geneticPhoto, dslDefinition));
}

function hashReduce(hash, min, max) {
  let b = 0;

  for (let i = 0; i < hash.length; i++) {
    b += hash.charCodeAt(i);
  }

  b = b % max;

  return Math.max(b, min);
}

function getBoolFromString(string) {
  const hash = string;

  return hashReduce(hash, 0, 100) > 50 ? true : false;
}

function getNumberFromString(string, min, max) {
  const hash = string;

  return hashReduce(hash, min, max);
}

function getGeneticPhoto({ g1, g2 }) {
  const res = {
    genesGlobal: {},
    genes: {},
  };

  Object.keys(g1.genesGlobal).forEach(genSlot => {
    const gen1 = g1.genesGlobal[genSlot];
    const gen2 = g2.genesGlobal[genSlot];

    // [d,D][A,B,C,D,..][0,1,2,3]gensequencehere
    // D < d
    const winner = gen1[0] <= gen2[0] ? gen1 : gen2;
    const genName = winner[1] + winner[2];

    res.genes[genName] = winner;
    res.genesGlobal[genSlot] = winner;
  });

  return res;
}

function reproduce(i1, i2) {
  const res = {
    g1: {
      genes: {},
      genesGlobal: {},
    },
    g2: {
      genes: {},
      genesGlobal: {},
    },
  };

  Object.keys(i1.g1.genesGlobal).forEach(geneSlot => {
    // A
    const winner = pickRandomGene(i1, geneSlot);
    assignGene(res, 'g1', winner);

    const winner2 = pickRandomGene(i2, geneSlot);
    assignGene(res, 'g2', winner2);
  });

  return res;
}

function pickRandomGene(i, slot) {
  return Math.random() > 0.5 ? i.g1.genesGlobal[slot] : i.g2.genesGlobal[slot];
}

function assignGene(i, chain, gene) {
  const genName = gene[1] + gene[2];

  i[chain].genes[genName] = gene;
  i[chain].genesGlobal[gene[1]] = gene;
}

function generateIndividuals(geneDefinition, number = 1) {
  const res = [];

  for (let i = 0; i < number; i++) {
    const individual = {
      g1: {
        genes: {},
        genesGlobal: {},
      },
      g2: {
        genes: {},
        genesGlobal: {},
      },
    };

    geneDefinition.forEach(genePool => {
      for (let j = 0; j < 2; j++) {
        const winner = genePool[getRandomInt(0, genePool.length)];

        individual[`g${j + 1}`].genes[winner[1] + winner[2]] = winner;
        individual[`g${j + 1}`].genesGlobal[winner[1]] = winner;
      }
    });

    res.push(individual);
  }

  return res;
}

function computeIndividual(genes, dslDefinition) {
  const individual = {};

  Object.entries(dslDefinition).forEach(([idx, val]) => {
    const s = val.split(' ');
    let res;

    switch (s[0]) {
      case 'B': {
        const string = generateString(1, s, genes);

        res = getBoolFromString(string);
        break;
      }

      case 'N': {
        const [min, max] = s[1]
          .split(',')
          .map(a => a.trim())
          .map(a => {
            return parseInt(a);
          });

        const string = generateString(2, s, genes);

        res = getNumberFromString(string, min, max);
        break;
      }
    }

    individual[idx] = res;
  });

  return individual;
}

function generateString(start, s, g) {
  let string = '';

  for (let i = start; i < s.length; i++) {
    const geneDefinition = s[i];

    if (geneDefinition.length > 1) {
      string += g.genes[geneDefinition] ? g.genes[geneDefinition] : '';
    } else {
      string += g.genesGlobal[geneDefinition];
    }
  }

  return string;
}
