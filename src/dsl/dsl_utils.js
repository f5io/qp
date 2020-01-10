export const prop = k => o => o[k];
export const compose = (...fns) => fns.reduce((f, g) => (...x) => f(g(...x)));
export const toArray = x => (Array.isArray(x) ? x : [ x ]);
export const mirror = k => k.reduce((acc, k) => ((acc[k] = k), acc), {});
export const flatten = x => x.reduce((y, z) => y.concat(z), []);
