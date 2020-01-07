import { rules, regex } from './rules.js';

export default function match(str) {
  const result = str.match(regex);
  const { length } = result[0];
  const index = result.slice(1).findIndex(x => x) + 1;
  const values = result.slice(index);
  const { type, tokens = () => {} } = rules[index];
  return {
    type,
    length,
    value: tokens(values),
  };
}
