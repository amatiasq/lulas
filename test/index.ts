type TestRun<T extends any[]> = (...args: T) => Promise<any> | void;

interface UnitTest_Basic {
  file: string;
  message: string;
  table: null;
  run: TestRun<[]>;
}

interface UnitTest_Table<T extends any[] = []> {
  file: string;
  message: string;
  table: T[];
  run: TestRun<T>;
}

type UnitTest<T extends any[]> = UnitTest_Basic | UnitTest_Table<T>;

// -----

const tests: UnitTest<any>[] = [];
const documentTitle = document.title;
let file = '';

export const isJestTesting = Boolean(
  typeof global !== 'undefined' && (global as any).test,
);

export function test(message: string, run: TestRun<[]>): void;
export function test<T extends any[]>(
  message: string,
  table: T[],
  run: TestRun<T>,
): void;

export function test<T extends any[]>(
  message: string,
  first: TestRun<[]> | T[],
  second?: TestRun<T>,
): void {
  const table = Array.isArray(first) ? first : null;
  const run = table ? second : (first as TestRun<T>);
  const unit = { file, message, table, run } as UnitTest<T>;

  if (isJestTesting) {
    executeTest(unit);
  } else {
    tests.push(unit);
  }
}

export function runTests({ background }: { background?: string } = {}) {
  setInitialState();
  let lastFile = '';

  for (const unit of tests) {
    if (!isJestTesting && unit.file !== lastFile) {
      console.groupEnd();
      lastFile = unit.file;
      console.groupCollapsed(unit.file);
    }

    executeTest(unit);
  }

  if (!isJestTesting) {
    console.groupEnd();
  }

  tests.length = 0;
  document.title = documentTitle;
  setSuccessState(background);
}

export function setFilename(dirname: string, filename: string) {
  file = filename.replace(`${dirname}/`, '').replace(/(\.test)?\.ts$/, '');
}

function executeTest<T extends any[]>({
  file,
  message,
  table,
  run,
}: UnitTest<T>) {
  if (!table) {
    runTest(file, message, run as TestRun<[]>);
    return;
  }

  if (!isJestTesting) {
    console.groupCollapsed(message);
  }

  for (let i = 0; i < table.length; i++) {
    runTest(file, `${message} [${i}]`, () => run(...table[i]));
  }

  if (!isJestTesting) {
    console.groupEnd();
  }
}

function runTest(file: string, message: string, run: TestRun<[]>) {
  if (isJestTesting) {
    (global as any).test(message, run);
    return;
  }

  try {
    run();
    console.log(`${message} 🟢`);
  } catch (error) {
    printError(file, error, message);
    setFailState();
    throw error;
  }
}

function printError(file: string, error: Error, message: string) {
  console.log(`${message} 🔴`);
  console.error(error);
  document.write(`
    <div style="display: flex; align-items:center; justify-content: center; height: 100%">
    <span>
      <h1>${file}</h1>
      <h2>${message}</h2>
      <pre>${error.stack?.replace('\n', '<br>')}}</pre>
    </span>
    </div>
  `);
}

// -----

function setInitialState() {
  setFailState();
}

function setFailState() {
  document.body.style.backgroundColor = '#440000';
}

function setSuccessState(background = 'green') {
  document.body.style.backgroundColor = background;
}
