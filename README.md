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
import bindAlikeTools, { addSection, isEqual, renderPlain }
    from '@0bdx/alike';

// Give the test suite a title, and bind some functions to it.
const [ section,    isEq,    render ] = bindAlikeTools('Mathsy Test Suite',
        addSection, isEqual, renderPlain);

// Optionally, begin a new section by calling `addSection()`.
section('Check that factorialise() works');

// Run the tests. The third argument, `description`, is optional.
isEq(factorialise(0), 1);
isEq(factorialise(5), 120,
    'factorialise(5) // 5! = 5 * 4 * 3 * 2 * 1');

// Output the test results to the console, as plain text.
console.log(render());

function factorialise(n) {
    if (n === 0 || n === 1) return 1;
    for (let i=n-1; i>0; i--) n *= i;
    return n;
}
```
