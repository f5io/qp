const { createWriteStream } = require('fs');

const stream = createWriteStream('logger.log');
const to = t => new Promise(resolve => setTimeout(resolve, t));

(async () => {
  let i = 0;
  while (true) {
    await to(500);
    stream.write(JSON.stringify({ a: ++i }) + '\n');
  }
})();
