const tests: UnitTest[] = [];

export function test(message: string, run: UnitTest['run']) {
  tests.push({ message, run });
}

export async function runTests() {
  setInitialState();

  for (const unit of tests) {
    try {
      await unit.run();
    } catch (error) {
      console.error(`${unit.message} failed`);
      console.error(error);
      document.write(`${unit.message} failed`);
      throw error;
    }
  }

  setSuccessState();
}

// -----

interface UnitTest {
  message: string;
  run: () => Promise<any> | void;
}

// -----

function setInitialState() {
  setFailState();
}

function setFailState() {
  document.body.style.backgroundColor = 'red';
}

function setSuccessState() {
  document.body.style.backgroundColor = 'green';
}
