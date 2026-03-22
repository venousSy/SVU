const express = require('express');
const app = express();

try {
  app.get(['/', '/*splat'], (req, res) => res.send('ok'));
  console.log('SUCCESS: Array of / and /*splat');
} catch (e) {
  console.log('ERROR [' + '/' + ', /*splat]: ' + e.message);
}
try {
  app.get('*splat', (req, res) => res.send('ok'));
  console.log('SUCCESS: *splat');
} catch (e) {
  console.log('ERROR [*splat]: ' + e.message);
}
try {
  app.get('/*', (req, res) => res.send('ok'));
  console.log('SUCCESS: /*');
} catch (e) {
  console.log('ERROR [/*]: ' + e.message);
}
try {
  app.get('/:path(*)', (req, res) => res.send('ok'));
  console.log('SUCCESS: /:path(*)');
} catch(e) {
  console.log('ERROR [/:path(*)]: ' + e.message);
}
