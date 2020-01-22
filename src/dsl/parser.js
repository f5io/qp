import Types from './rules/types.js';
const { isType, notType, invariant: inv, syntaxError } = Types;

const clone = o => Object.assign({}, o);

const notTerminatingExpression = notType.bind(null, [
  Types.SelectExpression,
  Types.FilterExpression,
  Types.OptionExpression,
  Types.OrderExpression,
  Types.LimitExpression,
  Types.OffsetExpression,
]);

export default function parser({ tokens, toSource }) {
  const root = {
    type: 'Query',
    body: [],
    source: toSource(),
  };

  const invariant = (...x) => inv(...x, root.source);

  const validLHS = invariant.bind(null, [
    Types.Wildcard,
    Types.FieldIdentifier,
    Types.NumberLiteral,
    Types.StringLiteral,
    Types.BooleanLiteral,
    Types.MatcherLiteral,
    Types.CallExpression,
  ]);

  const validRHS = invariant.bind(null, [
    Types.Wildcard,
    Types.FieldIdentifier,
    Types.NumberLiteral,
    Types.StringLiteral,
    Types.BooleanLiteral,
    Types.MatcherLiteral,
    Types.ArrayLiteral,
    Types.NullLiteral,
    Types.CallExpression,
  ]);

  const next = (t => {
    let i = -1;
    const ignored = [ Types.Whitespace, Types.LineBreak ];
    const pos = (x = 1) => {
      let s = i;
      const forward = x > 0;
      while (x != 0) {
        do { forward ? s++ : s--; } while (isType(ignored, t[s]));
        forward ? x-- : x++;
      }
      return s;
    };
    const n = x => t[i = pos(x)];
    n.peek = x => t[pos(x)];
    return n;
  })(tokens);

  let symbol, currentNode;

  function select() {
    const node = {
      type: Types.SelectExpression,
      fields: [],
      position: clone(symbol.position),
    };

    const unaryLiterals = [
      Types.StringLiteral,
      Types.NumberLiteral,
      Types.BooleanLiteral,
      Types.ArrayLiteral,
      Types.NullLiteral,
      Types.CallExpression,
    ];

    const isUnaryLiteral = isType.bind(null, unaryLiterals);

    while (notTerminatingExpression(next.peek())) {
      factor();

      const fieldNode = invariant([
        Types.Wildcard,
        Types.FieldIdentifier,
        Types.AsExpression,
        ...unaryLiterals,
      ], currentNode);

      node.fields.push(fieldNode);
    }
    node.position.end = currentNode.position.end;
    currentNode = node;
  }

  function as() {
    const node = {
      type: Types.AsExpression,
      value: invariant([
        Types.Wildcard,
        Types.StringLiteral,
        Types.NumberLiteral,
        Types.BooleanLiteral,
        Types.ArrayLiteral,
        Types.NullLiteral,
        Types.FieldIdentifier,
        Types.CallExpression,
      ], currentNode),
      position: clone(currentNode.position),
    };
    factor();
    node.prop = invariant([
      Types.Wildcard,
      Types.StringLiteral,
      Types.FieldIdentifier
    ], currentNode);
    node.position.end = symbol.position.end;
    currentNode = node;
  }

  function expression() {
    term();
    while (isType(Types.LogicalOr, symbol)) {
      const node = {
        type: Types.LogicalExpression,
        left: currentNode,
        operator: symbol,
        position: clone(currentNode.position),
      };
      term();
      node.right = invariant([
        Types.BinaryExpression,
        Types.LogicalExpression,
      ], currentNode);
      node.position.end = currentNode.position.end;
      currentNode = node;
    }
  }

  function term() {
    factor();
    while (isType(Types.LogicalAnd, symbol)) {
      const node = {
        type: Types.LogicalExpression,
        left: currentNode,
        operator: symbol,
        position: clone(currentNode.position),
      };
      factor();
      node.right = invariant([
        Types.BinaryExpression,
        Types.LogicalExpression,
      ], currentNode);
      node.position.end = currentNode.position.end;
      currentNode = node;
    }
  }

  function binary() {
    const node = {
      type: Types.BinaryExpression,
      left: validLHS(currentNode),
      operator: Object.assign(symbol, { value: symbol.value.toLowerCase() }),
      position: clone(currentNode.position),
    };
    factor();
    node.right = validRHS(currentNode);
    node.position.end = currentNode.position.end;
    currentNode = node;
  }

  function array() {
    const node = {
      type: Types.ArrayLiteral,
      values: [],
      position: clone(symbol.position),
    };
    while (notType(Types.ParenRight, next.peek())) {
      factor();
      node.values.push(currentNode);
    }
    symbol = next(); // skip right paren
    node.position.end = symbol.position.end;
    currentNode = node;
    if (isType(Types.AsExpression, next.peek())) {
      factor();
    } else if (isType(Types.Punctuation, next.peek())) {
      symbol = next();
    }
  }

  function limit() {
    const node = {
      type: symbol.type,
      count: invariant(Types.NumberLiteral, next.peek()),
      position: clone(symbol.position),
    };
    symbol = next();
    node.position.end = symbol.position.end;
    currentNode = node;
  }

  function order() {
    const node = {
      type: symbol.type,
      position: clone(symbol.position),
    };
    if (isType(Types.CallExpression, next.peek())) {
      factor();
      node.field = currentNode;
      node.direction = invariant(Types.SortOrderExpression, symbol);
      node.direction.value = symbol.value.toLowerCase();
      node.position.end = symbol.position.end;
      currentNode = node;
    } else {
      node.field = invariant(Types.FieldIdentifier, next.peek()),
      node.direction = invariant(Types.SortOrderExpression, next.peek(2));
      symbol = next(2);
      node.direction.value = symbol.value.toLowerCase();
      node.position.end = symbol.position.end;
      currentNode = node;
    }
  }

  function option() {
    const node = {
      type: symbol.type,
      position: clone(symbol.position),
    };
    factor();
    node.value = currentNode;
    node.position.end = currentNode.position.end;
    currentNode = node;
  }

  function call() {
    const node = {
      type: symbol.type,
      name: symbol.value.toLowerCase(),
      arguments: [],
      position: clone(symbol.position),
    };
    symbol = next(); // skip the left paren
    while (notType(Types.ParenRight, next.peek())) {
      factor();
      node.arguments.push(currentNode);
      node.position.end = currentNode.position.end;
    }
    symbol = next(); // skip right paren
    node.position.end = symbol.position.end;
    currentNode = node;
    if (
      isType([
        Types.BinaryOperator,
        Types.AsExpression,
      ], next.peek())
    ) {
      factor(); // this is the left of a binary expression
    } else if (
      isType([
        Types.LogicalAnd,
        Types.LogicalOr,
        Types.SortOrderExpression,
        Types.Punctuation,
      ], next.peek())
    ) {
      symbol = next();
    }
  }

  function chompToParenRightIsSubExpr() {
    let n, from = 1, depth = 0;
    while (n = next.peek(from++)) {
      if (isType(Types.ParenRight, n) && depth === 0) {
        break;
      } else if (isType([ Types.ParenLeft, Types.CallExpression ], n)) {
        depth++;
      } else if (isType(Types.ParenRight, n)) {
        depth--;
      } else if (isType(Types.BinaryOperator, n)) {
        return true;
      }
    }
    return false;
  }

  function factor() {
    symbol = next();
    switch (symbol.type) {
      case Types.Wildcard:
      case Types.FieldIdentifier:
      case Types.NullLiteral:
      case Types.NumberLiteral:
      case Types.StringLiteral:
      case Types.MatcherLiteral:
      case Types.BooleanLiteral:
        currentNode = symbol;
        if (isType([ Types.BinaryOperator, Types.AsExpression ], next.peek())) {
          factor(); // this is the left of a binary expression
        } else if (
          notTerminatingExpression(next.peek())
          && notType([ Types.ParenRight, Types.FieldIdentifier ], next.peek())
        ) {
          symbol = next(); // advance to the next logical operator
        }
        return;
      case Types.AsExpression:
        as();
        return;
      case Types.BinaryOperator:
        binary();
        return;
      case Types.SelectExpression:
        select();
        return;
      case Types.FilterExpression:
        expression();
        invariant([
          Types.BinaryExpression,
          Types.LogicalExpression,
        ], currentNode);
        return;
      case Types.ParenLeft: {
        if (
          notType(Types.OptionExpression, next.peek(-1))
          && chompToParenRightIsSubExpr()
        ) {
          expression();
          symbol = next();
        } else {
          array();
        }

        if (isType([ Types.LogicalOr, Types.LogicalAnd ], next.peek())) {
          symbol = next();
        }
        return;
      }
      case Types.CallExpression:
        call();
        return;
      case Types.OptionExpression:
        option();
        return;
      case Types.OrderExpression:
        order();
        return;
      case Types.OffsetExpression:
      case Types.LimitExpression:
        limit();
        return;
      default:
        throw syntaxError(root.source, symbol.position);
    }
  }

  while (next.peek()) {
    factor();
    root.body.push(currentNode);
  }

  return root;
}
