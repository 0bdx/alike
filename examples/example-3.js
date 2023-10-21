import Are, { bind2, isDeeplyLike, throwsError } from '../are.js';

console.log('\n\n> @0bdx/are/examples/example-3.js\n');

// Create a new test suite, run some tests, and log summary of the results.
const testSuite = new Are('fact()');
runTest(testSuite);
console.log(testSuite.render());

/** ### Tests `fact()`.
 *
 * @param {Are} testSuite
 *    [testSuite description]
 */
function runTest(testSuite) {

    // Take a test suite from a previous test, and bind two functions to it.
    const [ isLike, throws ] = bind2(isDeeplyLike, throwsError, testSuite);

    // Optionally, begin a new section.
    testSuite.addSection('Check that fact() works');

    // Run the tests. The third argument, `notes`, is optional.
    throws(()=>fact(), "`n` is not type 'number'");
    throws(()=>fact(NaN), '`n` is NaN!',
        ['`fact(NaN)` cannot factorialise the special `NaN` number']);
    isLike(fact(0), 1);
    isLike(fact(5), 120,
        ['`fact(5)` 5! = 5 * 4 * 3 * 2 * 1']);

    // Calculates the factorial of a given integer.
    function fact(n) {
        if (typeof n !== 'number') throw Error("`n` is not type 'number'");
        if (isNaN(n)) throw Error('`n` is NaN!');
        if (n === 0 || n === 1) return 1;
        for (let i=n-1; i>0; i--) n *= i;
        return n;
    }
}
