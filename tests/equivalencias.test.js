const fs = require('fs');

function loadApp() {
  const html = fs.readFileSync('index.html', 'utf8');
  const match = html.match(/<script>([\s\S]*)<\/script>/);
  if (!match) throw new Error('No se encontró el bloque <script> en index.html');

  const storage = {};
  global.localStorage = {
    getItem: (k) => (k in storage ? storage[k] : null),
    setItem: (k, v) => {
      storage[k] = String(v);
    }
  };

  global.window = {};
  global.document = {
    getElementById: () => ({}),
    querySelectorAll: () => [],
    body: { setAttribute: () => {} },
    createElement: () => ({})
  };

  global.alert = () => {};
  global.confirm = () => true;

  return match[1];
}

function runEquivalencyCountCheck() {
  const script = loadApp();
  const verification = `
${script}
rules = [{ id: 'test-rule', source: 'maj7(b5)', note: 'D', target: '13' }];
rawDict = JSON.parse(JSON.stringify(baseDictionary));
reGenerateDictionary();
const source = dictionary.find(d => d.name === 'maj7(b5)' && d.root === 'C');
const target = dictionary.find(d => d.name === '13' && d.root === 'C');
if (!source) throw new Error('No se encontró acorde fuente maj7(b5)');
if (!target) throw new Error('No se encontró acorde equivalente 13');
if (source.shapes.length !== target.shapes.length) {
  throw new Error('Conteo distinto: fuente=' + source.shapes.length + ', equivalente=' + target.shapes.length);
}
console.log('OK equivalencia maj7(b5)->13:', source.shapes.length, target.shapes.length);
`;

  new Function(verification)();
}

runEquivalencyCountCheck();
console.log('Todas las pruebas de equivalencias pasaron.');
