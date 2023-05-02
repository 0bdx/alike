import narrowAintas, { aintaArray, aintaObject, aintaString } from '@0bdx/ainta';
import { Suite } from "../classes/index.js";

/** ### Binds various test tools to a shared `Suite` instance.
 * 
 * Takes an existing `Suite` or creates a new one, binds any number of functions
 * to it, and returns the suite and those functions in an array. Each function
 * can then access the shared `Suite` instance using the `this` keyword.
 *
 * This pattern of dependency injection allows lots of flexibility, and works
 * well with Rollup's tree shaking.
 *
 * @example
 * import alike, { addSection, bindToSuite } from '@0bdx/alike';
 * 
 * // Give the test suite a title, and bind two functions to it.
 * // A suite from previous tests can be used instead of a title.
 * const [ suite, section,    like ] = bindToSuite('Mathsy Tests',
 *                addSection, alike);
 * 
 * // Optionally, begin a new section.
 * section('Check that factorialise() works');
 * 
 * // Run the tests. The third argument, `notes`, is optional.
 * like(factorialise(0), 1);
 * like(factorialise(5), 120,
 *     'factorialise(5) // 5! = 5 * 4 * 3 * 2 * 1');
 * 
 * // Output a test results summary to the console, as plain text.
 * console.log(suite.render());
 * 
 * function factorialise(n) {
 *     if (n === 0 || n === 1) return 1;
 *     for (let i=n-1; i>0; i--) n *= i;
 *     return n;
 * }
 *
 * @param {string|Suite} titleOrSuite
 *    A name for the group of tests, or else a suite from previous tests.
 * @param {...function} tools
 *    Any number of functions, which will be bound to a shared `Suite` instance.
 * @returns {(Suite|function)[]}
 *    Returns the shared `Suite` instance, followed by the passed-in functions
 *    which are now bound to it.
 * @throws {Error}
 *    Throws an `Error` if any of the arguments are invalid.
 */
export default function bindToSuite(titleOrSuite, ...tools) {
    const begin = 'bindToSuite():';

    // Validate the arguments.
    const [ aResults, aArr, aObj, aStr ] = narrowAintas({ begin },
        aintaArray, aintaObject, aintaString);
    const aTitle = aStr(titleOrSuite, 'titleOrSuite');
    const aSuite = aObj(titleOrSuite, 'titleOrSuite', { is:[Suite] });
    const aTools = aArr(tools, 'tools', { types:['function'] });
    if ((aTitle && aSuite) || aTools)
        throw Error(aTitle && aSuite ? aResults.join('\n') : aResults[1]);

    // If `titleOrSuite` is an object it must already be an instance of `Suite`,
    // so just use is as-is. Otherwise, create a new `Suite` instance.
    const suite = typeof titleOrSuite === 'object'
        ? titleOrSuite
        : new Suite(titleOrSuite || 'Untitled Test Suite');

    // Bind the `Suite` instance to each test tool.
    return [ suite, ...tools.map(tool => tool.bind(suite)) ];
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `bindToSuite()` unit tests.
 * 
 * @param {bindToSuite} f
 *    The `bindToSuite()` function to test.
 * @returns {void}
 *    Does not return anything.
 * @throws {Error}
 *    Throws an `Error` if a test fails.
 */
export function bindToSuiteTest(f) {
    const e2l = e => (e.stack.split('\n')[2].match(/([^\/]+\.js:\d+):\d+\)?$/)||[])[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = (actual, exp) => { try { actual() } catch (err) {
        if (typeof exp.test=='function'?!exp.test(err.message):err.message!==exp)
        { throw Error(`actual message:\n${err.message}\n!== expected message:\n${
            exp}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${exp}\nbut nothing was thrown\n`) };

    // The `titleOrSuite` argument should be one of the correct types.
    // @ts-expect-error
    throws(()=>f(),
        "bindToSuite():: `titleOrSuite` is type 'undefined' not 'string'\n" +
        "bindToSuite():: `titleOrSuite` is type 'undefined' not 'object'");
    throws(()=>f(null),
        "bindToSuite():: `titleOrSuite` is null not type 'string'\n" +
        "bindToSuite():: `titleOrSuite` is null not a regular object");

    // If the `titleOrSuite` argument is a string, it should be a valid title.
    throws(()=>f('Café'),
        "new Suite(): `title` 'Caf%C3%A9' fails 'Printable ASCII characters except backslashes'");

    // If the `titleOrSuite` argument is an object, it should be a `Suite` instance.
    // @ts-expect-error
    throws(()=>f({}),
        "bindToSuite():: `titleOrSuite` is type 'object' not 'string'\n" +
        "bindToSuite():: `titleOrSuite` is not in `options.is` 'Suite'");

    // The `tools` arguments should all be functions.
    // @ts-expect-error
    throws(()=>f('', ()=>{}, 123),
        "bindToSuite():: `tools[1]` is type 'number', not the `options.types` 'function'");

}
