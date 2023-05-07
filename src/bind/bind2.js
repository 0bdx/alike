import narrowAintas, { aintaFunction, aintaObject, aintaString }
    from '@0bdx/ainta';
import { Are } from '../classes/index.js';

/** ### Binds two functions to a shared `Are` instance.
 *
 * Takes an existing `Are` or creates a new one, and binds two functions
 * to it. Each function can then access the shared `Are` instance using
 * the `this` keyword.
 *
 * This pattern of dependency injection allows lots of flexibility, and works
 * well with Rollup's tree shaking.
 *
 * @example
 * import alike, { addSection, bind2 } from '@0bdx/alike';
 *
 * // Create a test suite with a title, and bind two functions to it.
 * const [ like, section, are ] = bind2(alike, addSection, 'fact()');
 *
 * // Or a suite from a previous test could be passed in instead.
 * // const [ like, section ] = bind2(alike, addSection, are);
 *
 * // Optionally, begin a new section.
 * section('Check that fact() works');
 *
 * // Run the tests. The third argument, `notes`, is optional.
 * like(fact(0), 1);
 * like(fact(5), 120,
 *     'fact(5) // 5! = 5 * 4 * 3 * 2 * 1');
 *
 * // Output a test results summary to the console, as plain text.
 * console.log(are.render());
 *
 * // Calculates the factorial of a given integer.
 * function fact(n) {
 *     if (n === 0 || n === 1) return 1;
 *     for (let i=n-1; i>0; i--) n *= i;
 *     return n;
 * }
 *
 * @template {function} A
 * @template {function} B
 *
 * @param {A} functionA
 *    The first function to bind to the test suite.
 * @param {B} functionB
 *    The second function to bind to the test suite.
 * @param {Are|string} areOrTitle
 *    A test suite from previous tests, or else a title for a new test suite.
 * @returns {[A,B,Are]}
 */
export default function bind2(functionA, functionB, areOrTitle) {
    const begin = 'bind2()';

    // Validate the arguments.
    const [ _, aintaAre ] = narrowAintas({ is:[Are], open:true }, aintaObject);
    const [ aResults, aFn, aAreOrString ] = narrowAintas({ begin },
        aintaFunction, [ aintaAre, aintaString ]);
    aFn(functionA, 'functionA');
    aFn(functionB, 'functionB');
    aAreOrString(areOrTitle, 'areOrTitle');
    if (aResults.length) throw Error(aResults.join('\n'));

    // If `areOrTitle` is a string, create a new `Are` instance. Otherwise
    // it must already be an instance of `Are`, so just use it as-is.
    const are = typeof areOrTitle === 'string'
        ? new Are(areOrTitle || 'Untitled Test Suite')
        : areOrTitle;

    // Return the functions bound to the test suite. Also return the test suite.
    return [
        functionA.bind(are),
        functionB.bind(are),
        are,
    ];
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `bind2()` unit tests.
 *
 * @param {typeof Are} A
 *    The `Are` class, because `Are` in alike.js !== `Are` in src/.
 * @param {bind2} f
 *    The `bind2()` function to test.
 * @returns {void}
 *    Does not return anything.
 * @throws {Error}
 *    Throws an `Error` if a test fails.
 */
export function bind2Test(A, f) {
    const e2l = e => (e.stack.split('\n')[4].match(/([^\/]+\.js:\d+):\d+\)?$/)||[])[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = (actual, exp) => { try { actual() } catch (err) {
        if (typeof exp.test=='function'?!exp.test(err.message):err.message!==exp)
        { throw Error(`actual message:\n${err.message}\n!== expected message:\n${
            exp}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${exp}\nbut nothing was thrown\n`) };

    // Three arguments should be passed in.
    // @ts-expect-error
    throws(()=>f(),
        "bind2(): `functionA` is type 'undefined' not 'function'\n" +
        "bind2(): `functionB` is type 'undefined' not 'function'\n" +
        "bind2(): `areOrTitle` is type 'undefined' not 'object'; or 'string'");

    // The `functionA` and `functionB` arguments should be functions.
    throws(()=>f(null, void 0, ''),
        "bind2(): `functionA` is null not type 'function'\n" +
        "bind2(): `functionB` is type 'undefined' not 'function'");
    // @ts-expect-error
    throws(()=>f(()=>{}, 123, new A('')),
        "bind2(): `functionB` is type 'number' not 'function'");

    // The `areOrTitle` argument should be one of the correct types.
    throws(()=>f(()=>{}, ()=>{}, null),
        "bind2(): `areOrTitle` is null not a regular object; or type 'string'");
    // @ts-expect-error
    throws(()=>f(()=>{}, ()=>{}, new Date()),
        "bind2(): `areOrTitle` is not in `options.is` 'Are'; or type 'object' not 'string'");

    // If the `areOrTitle` argument is a string, it should be a valid title.
    throws(()=>f(()=>{}, ()=>{}, 'Café'),
        "new Are(): `title` 'Caf%C3%A9' fails 'Printable ASCII characters except backslashes'");

    // An array of three items should be returned.
    function returnThis1() { return [1,this]; }
    function returnThis2() { return [2,this]; }
    const blankAre = new A('');
    const result = f(returnThis1, returnThis2, blankAre);
    equal(Array.isArray(result), true);
    equal(result.length, 3);

    // It should contain the two bound functions, followed by the `Are` instance.
    equal(result[0]()[0], 1);
    equal(result[0]()[1], blankAre);
    equal(result[1]()[0], 2);
    equal(result[1]()[1], blankAre);
    equal(result[2], blankAre);

}
