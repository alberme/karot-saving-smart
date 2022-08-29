const { spawnSync } = require('child_process');
const fs = require('fs');

function expoBuildWeb(done) {
  const buildCmd = spawnSync('expo', ['build:web'], {stdio: 'inherit'});
  if (buildCmd.status !== 0) {
    done('Failed to compile');
  }
  // Support for Netlify client-side routing https://create-react-app.dev/docs/deployment/#netlify
  fs.writeFileSync('web-build/_redirects', '/*  /index.html  200');
  done();
}

exports['build-web'] = expoBuildWeb;
