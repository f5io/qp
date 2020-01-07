import parser from './dsl/parser.js';
import tokenizer from './dsl/tokenizer.js';
import validator from './dsl/validator.js';
import { compose } from './dsl/dsl_utils.js';

import toQuery from './dsl/generators/javascript.js';

const toAST = compose(
  validator,
  parser,
  tokenizer,
);

export const toQuery = compose(toQuery, toAST);
