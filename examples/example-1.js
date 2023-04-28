import { areAlike } from '../alike.js';

// Compare two numbers.
console.log(areAlike(0, -0, 'Zero and minus-zero are alike'));
// PASS: Zero and minus-zero are alike

// Compare two booleans.
console.log(areAlike(true, false, 'true and false are not alike.'));
// FAIL: true and false are not alike.

// Compare two plain objects.
// @TODO fix this
console.log(areAlike({a:1}, {a:1}, 'Identical-looking objects are alike.'));
// PASS: Identical-looking objects are alike.
