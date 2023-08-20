# @0bdx/are

__Utilities for unit testing 0bdx apps, libraries and websites.__

⨂ __Version:__ 0.0.5  
⨂ __NPM:__ <https://www.npmjs.com/package/@0bdx/are>  
⨂ __Repo:__ <https://github.com/0bdx/are>  
⨂ __Homepage:__ <https://0bdx.com/are>

TODO add an overview

## Examples

Example scripts can be found in the 'examples/' directory.

You can run __Example 1,__ for example, using:  
`node examples/example-1.js`

### Example 1

```js
import { isDeeplyLike as isLike } from '@0bdx/are';

// Compare two numbers.
console.log(isLike(0, -0, 'Zero and minus-zero are alike'));
// PASS: Zero and minus-zero are alike
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
```

### Example 2

```js
import { bind1, isDeeplyLike } from '@0bdx/are';

// Create a test suite with a title, and bind one function to it.
const [ isLike, testSuite ] = bind1(isDeeplyLike, 'fact()');

// Or a test suite from a previous test could be passed in instead.
// const [ isLike ] = bind1(isDeeplyLike, testSuite);

// Optionally, begin a new section.
testSuite.addSection('Check that fact() works');

// Run the tests. The third argument, `notes`, is optional.
isLike(fact(0), 1);
isLike(fact(5), 120,
    ['`fact(5)` 5! = 5 * 4 * 3 * 2 * 1']);

// Output a test results summary to the console, as plain text.
console.log(testSuite.render());

// Calculates the factorial of a given integer.
function fact(n) {
    if (n === 0 || n === 1) return 1;
    for (let i=n-1; i>0; i--) n *= i;
    return n;
}
```

### Example 3

```js
import { bind2, isDeeplyLike, throwsError } from '@0bdx/are';

// Create a test suite with a title, and bind two functions to it.
const [ isLike, throws, testSuite ] = bind2(isDeeplyLike, throwsError, 'fact()');

// Or a test suite from a previous test could be passed in instead.
// const [ isLike, throws ] = bind2(isDeeplyLike, throwsError, testSuite);

// Optionally, begin a new section.
testSuite.addSection('Check that fact() works');

// Run the tests. The third argument, `notes`, is optional.
throws(()=>fact(), "`n` is not type 'number'");
throws(()=>fact(NaN), '`n` is NaN!',
    ['`fact(NaN)` cannot factorialise the special `NaN` number']);
isLike(fact(0), 1);
isLike(fact(5), 120,
    ['`fact(5)` 5! = 5 * 4 * 3 * 2 * 1']);

// Output a test results summary to the console, as plain text.
console.log(testSuite.render());

// Calculates the factorial of a given integer.
function fact(n) {
    if (typeof n !== 'number') throw Error("`n` is not type 'number'");
    if (isNaN(n)) throw Error('`n` is NaN!');
    if (n === 0 || n === 1) return 1;
    for (let i=n-1; i>0; i--) n *= i;
    return n;
}
```
