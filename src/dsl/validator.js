import Types from './rules/types.js';
const { invariant } = Types;

const validTopLevelTypes = invariant.bind(null, [
  Types.SelectExpression,
  Types.BinaryExpression,
  Types.LogicalExpression,
  Types.LimitExpression,
  Types.OffsetExpression,
]);

export default function validator(ast) {
  if (!ast.body.length) throw new Error('Query is Empty');
  return {
    ...ast,
    body: ast.body.map(x => validTopLevelTypes(x, ast.source)),
  };
}
