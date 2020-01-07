import * as std from 'std';
import { put } from './csp.js';

const [
  LEFT_PAREN, LEFT_BRACK,
  RIGHT_PAREN, RIGHT_BRACK,
] = [
  '{'.charCodeAt(), '['.charCodeAt(),
  '}'.charCodeAt(), ']'.charCodeAt()
];

const WHITESPACE = [
  0x9, 0xa, 0xb, 0xc, 0xd, 0x20, 0x85, 0xa0,
  0x1680, 0x180e, 0x2000, 0x2001, 0x2002, 0x2003,
  0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009,
  0x200a, 0x200b, 0x200c, 0x200d, 0x2028, 0x2029,
  0x202f, 0x205f, 0x2060, 0x3000, 0xfeff,
];

export const readJSON = async (file, out) => {
  "use strip";
  let b, depth = 0, buf = [], begun = false;

  while (b = file.getByte(), b !== -1) {
    switch (b) {
      case LEFT_PAREN:
      case LEFT_BRACK:
        begun = true;
        depth++;
        break;
      case RIGHT_PAREN:
      case RIGHT_BRACK:
        depth--;
        break;
    }
    if (!WHITESPACE.includes(b)) {
      buf.push(b);
      if (begun && depth === 0) {
        const output = buf.map(c => String.fromCharCode(c)).join('');
        await put(out, output);
        begun = false;
        buf = [];
      }
    }
  }

  if (buf.length) {
    const output = buf.map(c => String.fromCharCode(c)).join('');
    await put(out, output);
  }
};

