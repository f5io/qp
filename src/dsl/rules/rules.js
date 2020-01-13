import Types from './types.js';
import { prop, compose } from '../utils.js';

const rules = {
  [1]: {
    type: Types.Whitespace,
    re: /^ +/,
  },
  [2]: {
    type: Types.LineBreak,
    re: /^\n/,
  },
  [3]: {
    type: Types.SelectExpression,
    re: /^SELECT(?= |\n)/,
  },
  [4]: {
    type: Types.AsExpression,
    re: /^AS(?= |\n)/,
  },
  [5]: {
    type: Types.FilterExpression,
    re: /^WHERE(?= |\n)/,
  },
  [6]: {
    type: Types.LogicalAnd,
    re: /^AND(?= |\n)/,
  },
  [7]: {
    type: Types.LogicalOr,
    re: /^OR(?= |\n)/,
  },
  [8]: {
    type: Types.CallExpression,
    re: /^([A-Z0-9_]+)(?=\()/,
    tokens: prop(1),
  },
  [10]: {
    type: Types.OptionExpression,
    re: /^OPTION(?= |\n)/,
  },
  [11]: {
    type: Types.LimitExpression,
    re: /^LIMIT(?= |\n)/,
  },
  [12]: {
    type: Types.OffsetExpression,
    re: /^OFFSET(?= |\n)/,
  },
  [13]: {
    type: Types.OrderExpression,
    re: /^ORDER\sBY(?= |\n)/,
  },
  [14]: {
    type: Types.SortOrderExpression,
    re: /^(ASC|DESC)(?= |$|\n|;)/,
    tokens: prop(1),
  },
  [16]: {
    type: Types.ParenLeft,
    re: /^\(/,
  },
  [17]: {
    type: Types.ParenRight,
    re: /^\)/,
  },
  [18]: {
    type: Types.BinaryOperator,
    re: /^(>=?|<[=|>]?|!?%?=|(?:IS(?: NOT)?|(?:NOT )?(?:IN|i?LIKE))(?![a-z]))(?= )?/,
    tokens: prop(1),
  },
  [20]: {
    type: Types.Punctuation,
    re: /^,/,
  },
  [21]: {
    type: Types.Wildcard,
    re: /^\*/,
  },
  [22]: {
    type: Types.FieldIdentifier,
    re: /^(?!%|-|_|true|false|null|"|'|\d)([^\s)][\w_.-]*(?!%|_))(?=,|[\s)]|=|<|>|!|%|[);]?$)/,
    tokens: prop(1),
  },
  [24]: {
    type: Types.NullLiteral,
    re: /^NULL(?= |$|\n|;|\))/,
  },
  [25]: {
    type: Types.StringLiteral,
    re: /^(?:")([^"]+)(?:")/,
    tokens: prop(1),
  },
  [27]: {
    type: Types.StringLiteral,
    re: /^(?:')([^']+)(?:')/,
    tokens: prop(1),
  },
  [29]: {
    type: Types.NumberLiteral,
    re: /^([+-]?\d+(?:\.\d+)?)/,
    tokens: compose(
      Number,
      prop(1),
    ),
  },
  [31]: {
    type: Types.BooleanLiteral,
    re: /^(true|false)/,
    tokens: compose(
      x => x === 'true',
      prop(1),
    ),
  },
  [33]: {
    type: Types.MatcherLiteral,
    re: /^([^\s)]{0,}(?:_|%)[^\s)]{0,})/,
    tokens: prop(1),
  },
};

const regexString = Object.values(rules)
  .reduce((acc, { re }) => (acc += `(${re.source})|`), '')
  .slice(0, -1);

const regex = new RegExp(regexString, 'i');
export { rules, regex };
