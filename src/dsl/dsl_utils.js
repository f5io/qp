export const prop = k => o => o[k];
export const lowerCase = s => s.toLowerCase();
export const upperCase = s => s.toUpperCase();
export const compose = (...fns) => fns.reduce((f, g) => (...x) => f(g(...x)));
export const toArray = x => (Array.isArray(x) ? x : [ x ]);
export const mirror = k => k.reduce((acc, k) => ((acc[k] = k), acc), {});
export const values = o => Object.keys(o).map(k => o[k]);
export const flatten = x => x.reduce((y, z) => y.concat(z), []);
export const clone = x => Object.assign({}, x);
