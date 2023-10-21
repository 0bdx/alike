import { isDeeplyLike as isLike } from '../are.js';

console.log('\n\n> @0bdx/are/examples/example-1.js\n');

// Compare two numbers.
console.log(isLike(0, -0, 'Zero and minus-zero are alike.'));
// PASS: Zero and minus-zero are alike.
//     : `actually` is `0` as expected

// Compare two booleans.
try { isLike(true, false, 'true and false are not alike.');
} catch (err) { console.log(err.message) }
// FAIL: true and false are not alike.
//     : `actually` is `true`
//     : `expected` is `false`

// Compare two plain objects.
console.log(isLike({a:1}, {a:1}, 'Similar objects are alike.'));
// PASS: Similar objects are alike.
//     : `actually` is `{ a:1 }` as expected
