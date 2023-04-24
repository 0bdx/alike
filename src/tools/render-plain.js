import { aintaObject } from '@0bdx/ainta';
import { Renderable, Suite } from "../classes/index.js";

/** ### Renders a test suite without colours or typographic styling.
 * 
 * @TODO describe with examples
 *
 * @returns {string}
 *    Returns the test suite's title, followed by a summary of the test results.
 * @throws
 *    Throws an `Error` if the `this` context is invalid.
 */
export default function renderPlain() {
    const begin = 'renderPlain()';

    // Tell JSDoc that the `this` context is a `Suite` instance.
    /** @type Suite */
    const suite = this;

    // Check that this function has been bound to a `Suite` instance.
    // @TODO cache this result for performance
    const aSuite = aintaObject(suite, 'suite', { begin, is:[Suite], open:true });
    if (aSuite) throw Error(aSuite);

    // Get the number of tests which failed, passed, and have not completed yet.
    const fail = suite.failTally;
    const pass = suite.passTally;
    const pending = suite.pendingTally;
    const numTests = fail + pass + pending;

    // Return the test suite's title, followed by a summary of the test results.
    return `${'-'.repeat(suite.title.length)}\n` +
        `${suite.title}\n` +
        `${'='.repeat(suite.title.length)}\n\n${
        numTests === 0
            ? 'No tests were run.'
            : pending
                ? `${pending} test${pending === 1 ? '' : 's' } still pending.`
                : fail
                  ? '@TODO fails'
                  : pass === 1
                    ? 'The test passed.'
                    : pass === 2
                        ? 'Both tests passed.'
                        : `All ${pass} tests passed.`
    }\n`;
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `renderPlain()` unit tests.
 * 
 * @param {renderPlain} f
 *    The `renderPlain()` function to test.
 * @param {typeof Renderable} R
 *    The `Renderable` class, because `Renderable` in alike.js !== in src/.
 * @param {typeof Suite} S
 *    The `Suite` class, because `Suite` in alike.js !== `Suite` in src/.
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function renderPlainTest(f, R, S) {
    const e2l = e => (e.stack.split('\n')[2].match(/([^\/]+\.js:\d+):\d+\)?$/)||[])[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = (actual, exp) => { try { actual() } catch (err) {
        if (typeof exp.test=='function'?!exp.test(err.message):err.message!==exp)
        { throw Error(`actual message:\n${err.message}\n!== expected message:\n${
            exp}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${exp}\nbut nothing was thrown\n`) };
    const toLines = (...lines) => lines.join('\n');

    // `renderPlain()` should be bound to a `Suite` instance.
    throws(()=>f(),
        "renderPlain(): `suite` is type 'undefined' not 'object'");
    const badlyBound = f.bind({});
    throws(()=>badlyBound(),
        "renderPlain(): `suite` is not in `options.is` 'Suite'");

    // When bound bound to a `Suite` instance, `renderPlain()` should return a string.
    const suite = new S('Test Suite');
    /** @type f */
    const bound = f.bind(suite);
    const header = toLines(
        `----------`,
        `Test Suite`,
        `==========\n\n`,
    );
    equal(bound(), `${header}No tests were run.\n`);

    // With one, two or three 'PASS' results, the summary wording should be a little different.
    suite.addResult(R.from(1), R.from(1), ['1 is 1'], 'PASS');
    equal(bound(), `${header}The test passed.\n`);
    suite.addResult(R.from('A'), R.from('A'), ['"A" is "A"'], 'PASS');
    equal(bound(), `${header}Both tests passed.\n`);
    suite.addResult(R.from(true), R.from(true), ['true is true'], 'PASS');
    equal(bound(), `${header}All 3 tests passed.\n`);

    // With a 'FAIL' result @TODO
    suite.addResult(R.from(true), R.from(false), ['true is not false'], 'FAIL');
    equal(bound(), `${header}@TODO fails\n`);

    // With one or two 'PENDING' results, the summary wording should be a little different.
    suite.addResult(R.from(new Promise(()=>{})), R.from(2), ['will be 2?'], 'PENDING');
    equal(bound(), `${header}1 test still pending.\n`);
    suite.addResult(R.from(new Promise(()=>{})), R.from('B'), ['will be "B"?'], 'PENDING');
    equal(bound(), `${header}2 tests still pending.\n`);

}
