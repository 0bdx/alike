import { bind2, isDeeplyLike, throwsError } from '../are.js';

// Create a test suite with a title, and bind one function to it.
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
