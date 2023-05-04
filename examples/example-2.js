import alike, { addSection, bind2 } from '../alike.js';

// Create a test suite with a title, and bind two functions to it.
const [ like, section, suite ] = bind2(alike, addSection, 'fact()');

// Or a suite from a previous test could be passed in instead.
// const [ like, section ] = bind2(alike, addSection, suite);

// Optionally, begin a new section.
section('Check that fact() works');

// Run the tests. The third argument, `notes`, is optional.
like(fact(0), 1);
like(fact(5), 120,
    'fact(5) // 5! = 5 * 4 * 3 * 2 * 1');

// Output a test results summary to the console, as plain text.
console.log(suite.render());

// Calculates the factorial of a given integer.
function fact(n) {
    if (n === 0 || n === 1) return 1;
    for (let i=n-1; i>0; i--) n *= i;
    return n;
}
