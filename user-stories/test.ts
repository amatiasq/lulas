type TestRun<T extends any[]> = (...args: T) => Promise<any> | void;

interface UnitTest_Basic {
  message: string;
  table: null;
  run: TestRun<[]>;
}

interface UnitTest_Table<T extends any[] = []> {
  message: string;
  table: T[];
  run: TestRun<T>;
}

type UnitTest<T extends any[]> = UnitTest_Basic | UnitTest_Table<T>;

// -----

const tests: UnitTest<any>[] = [];

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
  tests.push({ message, table, run } as UnitTest<T>);
}

export async function runTests({ background }: { background: string }) {
  setInitialState();

  for (const unit of tests) {
    executeTest(unit);
  }

  setSuccessState(background);
}

async function executeTest<T extends any[]>({
  message,
  table,
  run,
}: UnitTest<T>) {
  if (!table) {
    await runTest(message, run as TestRun<[]>);
    return;
  }

  for (let i = 0; i < table.length; i++) {
    await runTest(`${message} [${i}]`, () => run(...table[i]));
  }
}

async function runTest(message: string, run: TestRun<[]>) {
  try {
    await run();
  } catch (error) {
    printError(error, message);
    setFailState();
    throw error;
  }
}

function printError(error: Error, message: string) {
  console.error(`${message} failed`);
  console.error(error);
  document.write(`
    <div style="display: flex; align-items:center; justify-content: center; height: 100%">
    <span>
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
