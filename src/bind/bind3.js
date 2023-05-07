import narrowAintas, { aintaFunction, aintaObject, aintaString }
    from '@0bdx/ainta';
import { Are } from '../classes/index.js';

/** ### Binds three functions to a shared `Are` instance.
 *
 * Takes an existing `Are` or creates a new one, and binds three functions
 * to it. Each function can then access the shared `Are` instance using
 * the `this` keyword.
 *
 * This pattern of dependency injection allows lots of flexibility, and works
 * well with Rollup's tree shaking.
 *
 * @example
 * import { addSection, alike, bind3, throws } from '@0bdx/alike';
 *
 * // Create a test suite with a title, and bind three functions to it.
 * const [ section, like, are ] = bind3(addSection, alike, 'fact()');
 *
 * // Or a suite from a previous test could be passed in instead.
 * // const [ like, section ] = bind3(alike, addSection, are);
 *
 * // Optionally, begin a new section.
 * section('Check that fact() works');
 *
 * // Run the tests. The third argument, `notes`, is optional.
 * throws(fact(), '`n` is not a number!');
 * like(fact(0), 1);
 * like(fact(5), 120,
 *     'fact(5) // 5! = 5 * 4 * 3 * 2 * 1');
 *
 * // Output a test results summary to the console, as plain text.
 * console.log(are.render());
 *
 * // Calculates the factorial of a given integer.
 * function fact(n) {
 *     if (typeof n !== 'number') throw Error('`n` is not a number!');
 *     if (n === 0 || n === 1) return 1;
 *     for (let i=n-1; i>0; i--) n *= i;
 *     return n;
 * }
 *
 * @template {function} A
 * @template {function} B
 * @template {function} C
 *
 * @param {A} functionA
 *    The first function to bind to the test suite.
 * @param {B} functionB
 *    The second function to bind to the test suite.
 * @param {C} functionC
 *    The second function to bind to the test suite.
 * @param {Are|string} areOrTitle
 *    A test suite from previous tests, or else a title for a new test suite.
 * @returns {[A,B,C,Are]}
 */
export default function bind3(functionA, functionB, functionC, areOrTitle) {
    const begin = 'bind3()';

    // Validate the arguments.
    const [ _, aintaAre ] = narrowAintas({ is:[Are], open:true }, aintaObject);
    const [ aResults, aFn, aAreOrString ] = narrowAintas({ begin },
        aintaFunction, [ aintaAre, aintaString ]);
    aFn(functionA, 'functionA');
    aFn(functionB, 'functionB');
    aFn(functionC, 'functionC');
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
        functionC.bind(are),
        are,
    ];
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `bind3()` unit tests.
 *
 * @param {typeof Are} A
 *    The `Are` class, because `Are` in alike.js !== `Are` in src/.
 * @param {bind3} f
 *    The `bind3()` function to test.
 * @returns {void}
 *    Does not return anything.
 * @throws {Error}
 *    Throws an `Error` if a test fails.
 */
export function bind3Test(A, f) {
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
        "bind3(): `functionA` is type 'undefined' not 'function'\n" +
        "bind3(): `functionB` is type 'undefined' not 'function'\n" +
        "bind3(): `functionC` is type 'undefined' not 'function'\n" +
        "bind3(): `areOrTitle` is type 'undefined' not 'object'; or 'string'");

    // The `functionA` and `functionB` arguments should be functions.
    // @ts-expect-error
    throws(()=>f(null, void 0, 123, ''),
        "bind3(): `functionA` is null not type 'function'\n" +
        "bind3(): `functionB` is type 'undefined' not 'function'\n" +
        "bind3(): `functionC` is type 'number' not 'function'");
    throws(()=>f(()=>{}, ()=>{}, void 0, new A('')),
        "bind3(): `functionC` is type 'undefined' not 'function'");

    // The `areOrTitle` argument should be one of the correct types.
    // @ts-expect-error
    throws(()=>f(()=>{}, ()=>{}, ()=>{}, []),
        "bind3(): `areOrTitle` is an array not a regular object; or type 'string'");
    // @ts-expect-error
    throws(()=>f(()=>{}, ()=>{}, ()=>{}, new Promise(()=>{})),
        "bind3(): `areOrTitle` is not in `options.is` 'Are'; or type 'object' not 'string'");

    // If the `areOrTitle` argument is a string, it should be a valid title.
    throws(()=>f(()=>{}, ()=>{}, ()=>{}, 'Café'),
        "new Are(): `title` 'Caf%C3%A9' fails 'Printable ASCII characters except backslashes'");

    // An array of three items should be returned.
    function returnThis1() { return [1,this]; }
    function returnThis2() { return [2,this]; }
    function returnThis3() { return [3,this]; }
    const blankAre = new A('');
    const result = f(returnThis1, returnThis2, returnThis3, blankAre);
    equal(Array.isArray(result), true);
    equal(result.length, 4);

    // It should contain the three bound functions, followed by the `Are` instance.
    equal(result[0]()[0], 1);
    equal(result[0]()[1], blankAre);
    equal(result[1]()[0], 2);
    equal(result[1]()[1], blankAre);
    equal(result[2]()[0], 3);
    equal(result[2]()[1], blankAre);
    equal(result[3], blankAre);

}
