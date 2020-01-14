import * as std from 'std';
import { setTimeout } from 'os';
import { put, take } from './csp.js'; 

const timeout = ms =>
  new Promise(res => setTimeout(res, ms));

const [
  LEFT_PAREN, LEFT_BRACK,
  RIGHT_PAREN, RIGHT_BRACK,
  QUOTE, ESCAPE_CHAR,
] = [
  '{'.charCodeAt(), '['.charCodeAt(),
  '}'.charCodeAt(), ']'.charCodeAt(),
  '"'.charCodeAt(), '\\'.charCodeAt(),
];

const WHITESPACE = [
  0x9, 0xa, 0xb, 0xc, 0xd, 0x20, 0x85, 0xa0,
  0x1680, 0x180e, 0x2000, 0x2001, 0x2002, 0x2003,
  0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009,
  0x200a, 0x200b, 0x200c, 0x200d, 0x2028, 0x2029,
  0x202f, 0x205f, 0x2060, 0x3000, 0xfeff,
];

export async function readJSON(file, json) {
  let byte, depth = 0, object = false, string = false, buffer = [];

  while (byte = file.getByte(), byte !== -1) {
    switch (byte) {
      case LEFT_PAREN:
      case LEFT_BRACK:
        object = true;
        depth++;
        break;
      case RIGHT_PAREN:
      case RIGHT_BRACK:
        depth--;
        break;
      case QUOTE:
        if (buffer[buffer.length - 1] !== ESCAPE_CHAR) string = !string;
        break;
    }
    if (!string) {
      if (!WHITESPACE.includes(byte)) buffer.push(byte);
      if ((object || buffer.length && byte === WHITESPACE[1]) && depth === 0) {
        const output = buffer.map(c => String.fromCharCode(c)).join('');
        await put(json, output);
        object = false;
        buffer = [];
        await timeout(0);
      }
    } else buffer.push(byte);
  }

  if (buffer.length) {
    const output = buffer.map(c => String.fromCharCode(c)).join('');
    await put(json, output);
  }
};

