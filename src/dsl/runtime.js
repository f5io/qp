import Types from './rules/types.js';
const { isType, invariant: inv } = Types;

const unsupported = syntax => {
  throw new Error(`Unsupported syntax: ${syntax}`);
};

const eq = (left, right) => input => left(input) === right(input);
const ne = (left, right) => input => left(input) !== right(input);
const eq_c = (left, right) => input => left(input) == right(input);
const ne_c = (left, right) => input => left(input) != right(input);
const gt = (left, right) => input => left(input) > right(input);
const gte = (left, right) => input => left(input) >= right(input);
const lt = (left, right) => input => left(input) < right(input);
const lte = (left, right) => input => left(input) <= right(input);
const or = (left, right) => input => left(input) || right(input);
const and = (left, right) => input => left(input) && right(input);

const operatorMapping = {
  '=': eq,
  'is': eq,
  '!=': ne,
  '<>': ne,
  'is not': ne, 
  '%=': eq_c,
  '!%=': ne_c,
  '>': gt,
  '>=': gte,
  '<': lt,
  '<=': lte,
};

const toRegex = (str, flags) =>
  new RegExp(String(str).replace(/_/g, '.').replace(/%/g, '.*'), flags);

const defaultCallExpressions = {
  date: (node, { traverseArray, Types, invariant }) => {
    const args = traverseArray(node.arguments);
    return input => new Date(...args.map(f => f(input)));
  },
  from_entries: (node, { traverseArray, invariant }) => {
    const args = node.arguments.map(x => invariant(Types.ArrayLiteral, x));
    const kv = traverseArray(args);
    return input => Object.fromEntries(kv.map(f => f(input)));
  }
};

const toRuntime = (ast, { callExpressions = {} } = {}) => {
  let select = x => x;
  let offset = 0;
  let limit = Infinity;

  const invariant = (...x) => inv(...x, ast.source);

  const callExpr = {
    ...defaultCallExpressions,
    ...callExpressions,
  };

  function traverseArray(array) {
    return array.map(x => traverseNode(x)).filter(x => x != null);
  }

  function traverseCallExpression(node) {
    const call = callExpr[node.name.toLowerCase()];
    if (!call) return unsupported(`CallExpression: ${node.name}`);
    return call(node, { traverseNode, traverseArray, Types, invariant });
  }

  function traverseSelect(node) {
    const roots = [], keyed = [];

    for (const field of node.fields) {
      if (isType(Types.FieldIdentifier, field)) {
        const value = traverseNode(field);
        keyed.push([ field.value, value ]);
      } else if (isType(Types.AsExpression, field)) {
        const value = traverseNode(field.value);
        if (isType(Types.Wildcard, field.prop)) {
          return value;
        } else {
          keyed.push([ field.prop.value, value ]);
        }
      } else if (isType(Types.Wildcard, field)) {
        roots.push(traverseNode(field));
      } else return traverseNode(field);
    }

    return input => Object.assign(
      roots.reduce((acc, f) => Object.assign(acc, f(input)), {}),
      Object.fromEntries(keyed.map(([ k, v ]) => [ k, v(input) ])),
    );
  }

  function traverseBinaryExpression(node) {
    switch (node.operator.value) {
      case 'like':
      case 'ilike':
      case 'not like':
      case 'not ilike': {
        const types = [
          Types.StringLiteral,
          Types.NumberLiteral,
          Types.NullLiteral,
          Types.BooleanLiteral,
        ];

        const validLHS = [ Types.FieldIdentifier, ...types ];
        const validRHS = [ Types.MatcherLiteral, ...types ];
        
        const target = invariant(validLHS, node.left);
        const matcher = invariant(validRHS, node.right);

        const flags = node.operator.value.includes('il') ? 'i' : void 0;
        const regex = toRegex(matcher.value, flags);
        const field = traverseNode(target, '');
        const inversed = node.operator.value.includes('not');

        return inversed
          ? input => !regex.test(field(input))
          : input => regex.test(field(input));
      }
      case 'in':
      case 'not in': {
        const array = traverseNode(node.right, []);
        const value = traverseNode(node.left);
        const inversed = node.operator.value.includes('not');
        
        return inversed
          ? input => !array(input).includes(value(input))
          : input => array(input).includes(value(input));
      }
      default: {
        const left = traverseNode(node.left);
        const operator = traverseNode(node.operator);
        const right = traverseNode(node.right);
        return operator(left, right);
      }
    }
  }

  function chainFromPath(path, coalesce = null) {
    const p = path.split('.');
    return (input) => p.reduce((o, k) => o?.[k], input) ?? coalesce;
  }

  function traverseNode(node, whenNull) {
    if (!node) return null;
    switch (node.type) {
      case Types.Wildcard:
        return input => input;
      case Types.StringLiteral:
      case Types.NumberLiteral:
      case Types.BooleanLiteral:
        return () => node.value;
      case Types.NullLiteral:
        return () => null;
      case Types.FieldIdentifier:
        return chainFromPath(node.value, whenNull);
      case Types.ArrayLiteral: {
        const elements = traverseArray(node.values);
        return input => elements.map(f => f(input));
      }
      case Types.BinaryOperator:
        return operatorMapping[node.value];
      case Types.LogicalOr:
        return or;
      case Types.LogicalAnd:
        return and;
      case Types.Query:
        return traverseArray(node.body);
      case Types.LogicalExpression: {
        const left = traverseNode(node.left);
        const right = traverseNode(node.right);
        const op = traverseNode(node.operator);
        return op(left, right);
      }
      case Types.BinaryExpression:
        return traverseBinaryExpression(node);
      case Types.SelectExpression:
        select = traverseSelect(node);
        return;
      case Types.LimitExpression:
        limit = node.count.value;
        return;
      case Types.OffsetExpression:
        offset = node.count.value;
        return;
      case Types.SortOrderExpression:
      case Types.OrderExpression:
      case Types.OptionExpression:
        return unsupported(node.type);
      case Types.CallExpression:
        return traverseCallExpression(node);
      default:
        throw new Error(`Unknown type: ${node.type}`);
    }
  }

  const [ filter = () => true ] = traverseNode(ast);
  filter.select = select;
  filter.limit = limit;
  filter.offset = offset;

  return filter;
};

export default toRuntime; 
