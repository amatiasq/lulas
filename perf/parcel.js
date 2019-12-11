const path = require('path');
const Parcel = require('parcel-bundler');

module.exports = serve;

async function serve(port) {
  const url = path.join(__dirname, 'runner.html');

  const bundler = new Parcel(url, {
    watch: false,
    target: 'browser',
    sourceMaps: false,
  });

  return bundler.serve(port);
}
