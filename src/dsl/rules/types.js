import { flatten, mirror, toArray } from '../utils.js';

const Types = mirror([
  'Query',
  'Whitespace',
  'LineBreak',
  'SelectExpression',
  'AsExpression',
  'FilterExpression',
  'LogicalAnd',
  'LogicalOr',
  'CallExpression',
  'OptionExpression',
  'LimitExpression',
  'OffsetExpression',
  'OrderExpression',
  'SortOrderExpression',
  'LogicalExpression',
  'BinaryExpression',
  'BinaryOperator',
  'Punctuation',
  'Wildcard',
  'ParenLeft',
  'ParenRight',
  'FieldIdentifier',
  'NullLiteral',
  'StringLiteral',
  'NumberLiteral',
  'BooleanLiteral',
  'MatcherLiteral',
  'ArrayLiteral',
]);

const isType = (types, node) => node && toArray(types).includes(node.type);

const notType = (types, node) => node && !toArray(types).includes(node.type);

const invariant = (types, node, original) => {
  const ts = toArray(types);
  if (node && ts.includes(node.type)) return node;
  throw Types.typeError(
    original,
    node
      ? node.position
      : {
        start: original.length + 1,
        end: original.length + 1,
      },
    node,
    ts
  );
};

const Ignore = Symbol('Ignore');

/* eslint-disable indent */

const syntaxError = (original, position) =>
  new SyntaxError(`Your query contained a syntax error, near:
 
${original.split('\n').map((line, i) => {
  const result = `  ${line.trim()}`;
  return position.line === i
    ? `${result}
    ${' '.repeat(position.start)}${'~'.repeat(Math.max(position.end - position.start, 1))}
    ${' '.repeat(position.start)}`
    : result;
}).join('\n')}
  Please correct the issue and try again.
  `);

const typeError = (original, position, node, validTypes) =>
  new TypeError(`Your query contained a type error:
 
${original.split('\n').map((line, i) => {
  const result = `  ${line.trim()}`;
  return position.line === i
    ? `  ${result}
    ${' '.repeat(position.start)}${'~'.repeat(Math.max(position.end - position.start, 1))}
    ${' '.repeat(position.start)} `
    : result;
}).join('\n')}
  One of the following types was expected:

  ${validTypes.map(t => ` - ${t}`).join('\n  ')}

  But found ${node && node.type || 'Nothing'} \`${printToken(node)}\`
  `);

/* eslint-enable indent */

const printToken = token => {
  if (!token) return '';
  switch (token.type) {
    case Types.SelectExpression: return 'SELECT';
    case Types.FilterExpression: return 'WHERE';
    case Types.LogicalOr: return 'OR';
    case Types.LogicalAnd: return 'AND';
    case Types.AsExpression: return 'AS';
    case Types.NullLiteral: return 'NULL';
    case Types.OptionExpression: return 'OPTION';
    case Types.OrderExpression: return 'ORDER BY';
    case Types.LimitExpression: return 'LIMIT';
    case Types.OffsetExpression: return 'OFFSET';
    case Types.CallExpression:
      return (token.value || token.name).toUpperCase();
    case Types.Wildcard: return '*';
    case Types.StringLiteral: return `"${token.value}"`;
    case Types.Punctuation: return ',';
    case Types.Whitespace: return ' ';
    case Types.LineBreak: return '\n';
    case Types.ParenLeft: return '(';
    case Types.ParenRight: return ')';
    case Types.ArrayLiteral:
      return `(${token.values.map(printToken).join(',')})`;
    default: return token.value;
  }
};

const printTokens = tokens =>
  tokens.reduce((acc, t) => acc += printToken(t), '');

export default Object.assign(
  Types,
  {
    isType, notType,
    invariant, Ignore,
    syntaxError, typeError,
    printToken, printTokens,
  }
);
