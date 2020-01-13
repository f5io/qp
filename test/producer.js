import { setTimeout } from 'os';
import * as std from 'std';

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const profiles = [
  { "dob": "1979-06-23", "name": { "first": "Sam" }, "age": 40, "data": [ "heads" ] },
  { "dob": "1986-01-10", "name": { "first": "Izzy" }, "age": 34, "data": [ "tails" ] },
  { "dob": "1992-06-08", "name": { "first": "Abed" }, "age": 27, "data": [ "none" ] },
  { "dob": "2000-12-09", "name": { "first": "Orion" }, "age": 19, "data": [ "tails" ] },
  { "dob": "1984-05-18", "name": { "first": "Cameron" }, "age": 35, "data": [ "none" ] },
  { "dob": "1993-12-28", "name": { "first": "Ana" }, "age": 26, "data": [ "heads" ] },
];

(async () => {
  for (let i = 0; i < Infinity; i++) {
    console.log(JSON.stringify({ id: i, ...profiles[i % profiles.length] }));
    std.out.flush();
    await timeout(50);
  }
})();
