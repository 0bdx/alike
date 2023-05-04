import narrowAintas, { aintaFunction, aintaObject, aintaString }
    from '@0bdx/ainta';
import { Suite } from '../classes/index.js';

/** ### Binds two functions to a shared `Suite` instance.
 *
 * Takes an existing `Suite` or creates a new one, and binds two functions
 * to it. Each function can then access the shared `Suite` instance using
 * the `this` keyword.
 *
 * This pattern of dependency injection allows lots of flexibility, and works
 * well with Rollup's tree shaking.
 *
 * @example
 * import alike, { addSection, bind2 } from '@0bdx/alike';
 * 
 * // Create a test suite with a title, and bind two functions to it.
 * const [ section, like, suite ] = bind2(addSection, alike, 'fact()');
 * 
 * // Or a suite from a previous test could be passed in instead.
 * // const [ section, like ] = bind2(addSection, alike, suite);
 * 
 * // Optionally, begin a new section.
 * section('Check that factorialise() works');
 * 
 * // Run the tests. The third argument, `notes`, is optional.
 * like(fact(0), 1);
 * like(fact(5), 120,
 *     'fact(5) // 5! = 5 * 4 * 3 * 2 * 1');
 * 
 * // Output a test results summary to the console, as plain text.
 * console.log(suite.render());
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
 *    The first function to bind to the suite.
 * @param {B} functionB
 *    The second function to bind to the suite.
 * @param {Suite|string} suiteOrTitle
 *    A suite from previous tests, or else a title for a new suite.
 * @returns {[A,B,Suite]}
 */
export default function bind2(functionA, functionB, suiteOrTitle) {
    const begin = 'bind2()';

    // Validate the arguments.
    const [ _, aintaSuite ] = narrowAintas({ is:[Suite], open:true }, aintaObject);
    const [ aResults, aFn, aSuiteOrString ] = narrowAintas({ begin },
        aintaFunction, [ aintaSuite, aintaString ]);
    aFn(functionA, 'functionA');
    aFn(functionB, 'functionB');
    aSuiteOrString(suiteOrTitle, 'suiteOrTitle');
    if (aResults.length) throw Error(aResults.join('\n'));

    // If `suiteOrTitle` is a string, create a new `Suite` instance. Otherwise
    // it must already be an instance of `Suite`, so just use it as-is.
    const suite = typeof suiteOrTitle === 'string'
        ? new Suite(suiteOrTitle || 'Untitled Test Suite')
        : suiteOrTitle;

    // Bind the functions to the suite, and return them. Also, return the suite.
    return [
        functionA.bind(suite),
        functionB.bind(suite),
        suite,
    ];
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `bind2()` unit tests.
 * 
 * @param {bind2} f
 *    The `bind2()` function to test.
 * @param {typeof Suite} S
 *    The `Suite` class, because `Suite` in alike.js !== `Suite` in src/.
 * @returns {void}
 *    Does not return anything.
 * @throws {Error}
 *    Throws an `Error` if a test fails.
 */
export function bind2Test(f, S) {
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
        "bind2(): `suiteOrTitle` is type 'undefined' not 'object'; or 'string'");

    // The `functionA` and `functionB` arguments should be functions.
    throws(()=>f(null, void 0, ''),
        "bind2(): `functionA` is null not type 'function'\n" +
        "bind2(): `functionB` is type 'undefined' not 'function'");
    // @ts-expect-error
    throws(()=>f(()=>{}, 123, new S('')),
        "bind2(): `functionB` is type 'number' not 'function'");

    // The `suiteOrTitle` argument should be one of the correct types.
    throws(()=>f(()=>{}, ()=>{}, null),
        "bind2(): `suiteOrTitle` is null not a regular object; or type 'string'");
    // @ts-expect-error
    throws(()=>f(()=>{}, ()=>{}, new Date()),
        "bind2(): `suiteOrTitle` is not in `options.is` 'Suite'; or type 'object' not 'string'");

    // If the `suiteOrTitle` argument is a string, it should be a valid title.
    throws(()=>f(()=>{}, ()=>{}, 'Café'),
        "new Suite(): `title` 'Caf%C3%A9' fails 'Printable ASCII characters except backslashes'");

    // If the `suiteOrTitle` argument is an object, it should be a `Suite` instance.
    // @ts-expect-error
    throws(()=>f(()=>{}, ()=>{}, {}),
        "bind2(): `suiteOrTitle` is not in `options.is` 'Suite'; or type 'object' not 'string'");

    // An array of three items should be returned.
    function returnThis1() { return this; }
    function returnThis2() { return this; }
    const blankSuite = new S('');
    const result = f(returnThis1, returnThis2, blankSuite);
    equal(Array.isArray(result), true);
    equal(result.length, 3);

    // It should contain the two bound functions, followed by the `Suite` instance.
    equal(result[0](), blankSuite);
    equal(result[1](), blankSuite);
    equal(result[2], blankSuite);

}
