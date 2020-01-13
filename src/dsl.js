import parser from './dsl/parser.js';
import tokenizer from './dsl/tokenizer.js';
import validator from './dsl/validator.js';
import { compose } from './dsl/utils.js';
import toRuntime from './dsl/runtime.js';

const toAST = compose(validator, parser, tokenizer);

export const toQuery = compose(toRuntime, toAST);
