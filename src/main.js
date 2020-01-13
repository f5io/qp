import * as std from 'std';
import { parseArgs } from './args.js';
import { readJSON } from './json.js';
import { toQuery } from './dsl.js';
import { help, syntax, VERSION } from './output.js';
import { channel, take } from './csp.js';

(async function() {

  const config = {
    query: { type: 'rest', default: 'select *' },
    pretty: { type: 'boolean', flags: [ '-p', '--pretty' ] },
    array: { type: 'boolean', flags: [ '-a', '--no-array' ] },
    buffer: { type: 'boolean', flags: [ '-b', '--buffer' ] },
    strict: { type: 'boolean', flags: [ '-s', '--strict' ] },
    silent: { type: 'boolean', flags: [ '-x' ] },
    help: { type: 'boolean', flags: [ '-h', '--help' ] },
    version: { type: 'boolean', flags: [ '-v', '--version' ] },
    syntax: { type: 'boolean', flags: [ '--syntax' ] },
  };

  const argv = parseArgs(config);

  if (argv.help) return print(help);
  if (argv.syntax) return print(syntax);
  if (argv.version) return print(VERSION);

  const outArgs = argv.pretty ? [ null, 2 ] : [];

  let query;
  try {
    query = toQuery(argv.query);
  } catch(err) {
    print(`\n  ${err.message}\n  Please reference the syntax documentation: \`qp --syntax\``);
    std.exit(1);
    return;
  };

  const jsons = channel();
  readJSON(std.in, jsons);

  let o, i = 0, j = 0;
  for await (const json of take(jsons)) {
    try {
      o = JSON.parse(json);

      if (!argv.array && Array.isArray(o)) {

        o = o.filter(x => query(x))
          .map(x => query.select(x))
          .slice(query.offset, query.offset + query.limit)
        print(JSON.stringify(o, ...outArgs));

      } else if (query(o)) {

        if (++i <= query.offset) continue;
        o = query.select(o);
        print(JSON.stringify(o, ...outArgs));
        if (++j >= query.limit) break;

      }
    } catch(err) {
      if (!argv.silent)
        std.err.puts(`json parse error: ${err.message}\n`);
      if (argv.strict) return std.exit(1);
    }
    if (!argv.buffer) std.out.flush();
    std.gc();
  }

  std.exit(0);
})();

