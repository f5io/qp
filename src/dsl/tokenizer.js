import match from './rules/match.js';
import Types from './rules/types.js';
const {
  isType,
  notType,
  printTokens,
  LineBreak,
  Whitespace,
  syntaxError,
} = Types; 

export default function tokenizer(
  input = '',
  {
    tokens,
    position: [ x, y ],
  } = {
    tokens: [],
    position: [ 0, 0 ],
  }
) {
  if (input.length === 0) {
    while (
      isType([
        LineBreak,
        Whitespace,
      ], tokens[tokens.length - 1])
    ) tokens.pop();
    return { tokens, toSource: () => printTokens(tokens) };
  }

  try {
    const { type, length, value } = match(input);
    let tLen = length;

    const token = {
      type,
      position: { start: x, end: x + length, line: y },
    };
    if (value !== void 0) token.value = value;

    switch (type) {
      case LineBreak: {
        //if (
        //isType(Whitespace, tokens[tokens.length - 1])
        //) {
        //const prev = tokens.pop();
        //token.position = prev.position;
        //}
        if (tokens.length) {
          y++;
          x = -1;
          tokens.push(token);
        }
        break;
      }
      case Whitespace: {
        if (
          notType(LineBreak, tokens[tokens.length - 1])
          && tokens.length
        ) {
          tLen = 1;
          token.position.end = token.position.start + tLen;
          tokens.push(token);
        } else {
          x = x - length;
        }
        break;
      }
      default: {
        tokens.push(token);
        break;
      }
    }

    return tokenizer(input.slice(length), { tokens, position: [ x + tLen, y ] });
  } catch (e) {
    if (e instanceof SyntaxError) throw e;
    throw syntaxError(printTokens(tokens) + input, { start: x, end: x + 1, line: y });
  }
}
