import Types from './rules/types.js';
const { invariant } = Types;

const validTopLevelTypes = invariant.bind(null, [
  Types.SelectExpression,
  Types.BinaryExpression,
  Types.LogicalExpression,
  Types.OptionExpression,
  Types.OrderExpression,
  Types.LimitExpression,
  Types.OffsetExpression,
]);

export default function validator(ast) {
  if (!ast.body.length) throw new Error('Query is Empty');
  return {
    type: ast.type,
    body: ast.body.map(x => validTopLevelTypes(x, ast.source)),
  };
}
