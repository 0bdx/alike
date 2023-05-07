import { addSection, bind2, isDeeplyLike } from '../are.js';

// Create a test suite with a title, and bind two functions to it.
const [ section, isLike, suite ] = bind2(addSection, isDeeplyLike, 'fact()');

// Or a suite from a previous test could be passed in instead.
// const [ section, isLike ] = bind2(addSection, isDeeplyLike, suite);

// Optionally, begin a new section.
section('Check that fact() works');

// Run the tests. The third argument, `notes`, is optional.
isLike(fact(0), 1);
isLike(fact(5), 120,
    ['`fact(5)` 5! = 5 * 4 * 3 * 2 * 1']);

// Output a test results summary to the console, as plain text.
console.log(suite.render());

// Calculates the factorial of a given integer.
function fact(n) {
    if (n === 0 || n === 1) return 1;
    for (let i=n-1; i>0; i--) n *= i;
    return n;
}
