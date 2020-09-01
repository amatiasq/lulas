import { isJestTesting, setFilename, test } from '../test/index';

let isTestRunning = false;

setFilename(__dirname, __filename);

test('Should render something', () => {
  isTestRunning = true;

  if (!isJestTesting) {
    console.log('Tests running...');
  }
});

setTimeout(testTester, 0);

function testTester() {
  if (!isTestRunning) {
    document.body.style.backgroundColor = 'yellow';
    throw new Error('Test suite not runnig');
  }
}
