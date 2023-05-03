# @0bdx/alike

__Utilities for unit testing 0bdx apps, libraries and websites.__

⨂ __Version:__ 0.0.1  
⨂ __NPM:__ <https://www.npmjs.com/package/@0bdx/alike>  
⨂ __Repo:__ <https://github.com/0bdx/alike>  
⨂ __Homepage:__ <https://0bdx.com/alike>

@TODO add an overview

## Examples

Example scripts can be found in the 'examples/' directory.

You can run __Example 1,__ for example, using:  
`node examples/example-1.js`

### Example 1

```js
import alike from '@0bdx/alike';

// Compare two numbers.
console.log(alike(0, -0, 'Zero and minus-zero are alike'));
// PASS: Zero and minus-zero are alike
//     : `actually` is `0` as expected

// Compare two booleans.
try { alike(true, false, 'true and false are not alike.');
} catch (err) { console.log(err.message) }
// FAIL: true and false are not alike.
//     : `actually` is `true`
//     : `expected` is `false`

// Compare two plain objects.
console.log(alike({a:1}, {a:1}, 'Similar objects are alike.'));
// PASS: Similar objects are alike.
//     : `actually` is `{ a:1 }` as expected
```

### Example 2

```js
import alike, { addSection, bindToSuite } from '@0bdx/alike';

// Give the test suite a title, and bind two functions to it.
// A suite from previous tests can be used instead of a title.
const suite = bindToSuite('Mathsy Tests', addSection, alike);

// Optionally, begin a new section.
section('Check that factorialise() works');

// Run the tests. The third argument, `notes`, is optional.
like(factorialise(0), 1);
like(factorialise(5), 120,
    'factorialise(5) // 5! = 5 * 4 * 3 * 2 * 1');

// Output a test results summary to the console, as plain text.
console.log(suite.render());

function factorialise(n) {
    if (n === 0 || n === 1) return 1;
    for (let i=n-1; i>0; i--) n *= i;
    return n;
}
```
