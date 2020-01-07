export const parseArgs = config =>
  Object.fromEntries(Object.entries(config).map(([ k, v ]) => {
    let val = v.default || false;
    switch (v.type) {
      case 'boolean':
        val = v.flags.some(v => scriptArgs.includes(v));
        break;
      case 'string':
        const idx = scriptArgs.findIndex(a => v.flags.includes(a));
        if (idx > -1) val = scriptArgs[idx + 1];
        break;
    }
    return [ k, val ];
  }));

