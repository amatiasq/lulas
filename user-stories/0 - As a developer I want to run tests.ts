import { test, setFilename } from '../test';

let isTestRunning = false;

setFilename(__dirname, __filename);

test('Should render something', () => {
  isTestRunning = true;
  console.log('Tests running...');
});

setTimeout(testTester, 0);

function testTester() {
  if (!isTestRunning) {
    document.body.style.backgroundColor = 'yellow';
    throw new Error('Test suite not runnig');
  }
}
