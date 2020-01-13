const collectFlags = () => {
  const output = { short: [], long: [] };
  scriptArgs.shift(); // throwaway src/main.js
  while (scriptArgs.length && scriptArgs[0].startsWith('-')) {
    const arg = scriptArgs.shift();
    if (arg.startsWith('--')) output.long.push(arg.slice(1))
    else output.short.push(...arg.slice(1).split(''));
  }
  return output;
}

export function parseArgs(config) {
  const flags = collectFlags();
  return Object.fromEntries(Object.entries(config).map(([ k, v ]) => {
    let val = v.default || false;
    switch (v.type) {
      case 'boolean':
        val = v.flags.some(v =>
          flags.short.includes(v.slice(1))
          || flags.long.includes(v.slice(1))
        );
        break;
      case 'rest':
        val = scriptArgs.join(' ') || v.default;
        break;
    }
    return [ k, val ];
  }));
}

