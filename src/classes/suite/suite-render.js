import narrowAintas, { aintaString } from '@0bdx/ainta';
import Renderable from "../../classes/renderable/renderable.js";

// Define styling-strings for all possible `formatting`.
const STYLING_STRINGS = {
    ANSI: {
        failIn: '\x1B[38;5;198;48;5;52m', // bright red on dull red
        failOut: '\x1B[0m',
    },
    PLAIN: {
        failIn: '',
        failOut: '',
    },
};

/** ### Renders a given test suite.
 *
 * @param {string} begin
 *    Overrides the `begin` string sent to `Ainta` functions.
 * @param {string} filterSections
 *    Optional string, which hides sections whose subtitles do not match.
 *    - The empty string `""` is treated the same as `undefined`
 * @param {string} filterResults
 *    A string, which hides results whose notes do not match.
 *    - The empty string `""` is treated the same as `undefined`
 * @param {'ANSI'|'HTML'|'JSON'|'PLAIN'} formatting
 *    Controls how the render should be styled. One of `"ANSI|HTML|JSON|PLAIN"`.
 * @param {'QUIET'|'VERY'|'VERYVERY'} verbosity
 *    Controls how detailed the render should be. One of `"QUIET|VERY|VERYVERY"`.
 * @returns {string}
 *    Returns the rendered test suite.
 * @throws
 *    Throws an `Error` if either of the arguments are invalid.
 */
export default function suiteRender(
    begin,
    filterSections,
    filterResults,
    formatting,
    verbosity,
) {
    // Validate the `begin` argument.
    const aBegin = aintaString(begin, 'begin', { begin:'suiteRender()' });
    if (aBegin) throw Error(aBegin);

    // Validate the other arguments.
    const [ aResults, aStr ] = narrowAintas({ begin }, aintaString);
    aStr(filterSections, 'filterSections');
    aStr(filterResults, 'filterResults');
    aStr(formatting, 'formatting', { is:['ANSI','HTML','JSON','PLAIN'] });
    aStr(verbosity, 'verbosity', { is:['QUIET','VERY','VERYVERY'] });
    if (aResults.length) throw Error(aResults.join('\n'));

    // Get the number of tests which failed, passed, and have not completed yet.
    const fail = this.failTally;
    const pass = this.passTally;
    const pending = this.pendingTally;
    const numTests = fail + pass + pending;

    // Set up the appropriate styling-strings for the current `formatting`.
    const { failIn, failOut } = STYLING_STRINGS[formatting];

    // Return the test this's title, followed by a summary of the test results.
    return `${'-'.repeat(this.title.length)}\n` +
        `${this.title}\n` +
        `${'='.repeat(this.title.length)}\n\n${
        numTests === 0
            ? 'No tests were run.'
            : pending
                ? `${pending} test${pending === 1 ? '' : 's' } still pending.`
                : fail
                  ? `${failIn}${
                    numTests === fail
                        ? (
                            fail === 1
                            ? 'The test failed.'
                            : fail === 2
                                ? 'Both tests failed.'
                                : `All ${fail} tests passed.`)
                        : (
                            `${fail} of ${numTests} tests failed.`
                        )
                  }${failOut}`
                  : pass === 1
                    ? 'The test passed.'
                    : pass === 2
                        ? 'Both tests passed.'
                        : `All ${pass} tests passed.`
    }\n`;
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `suiteRender()` unit tests.
 * 
 * @param {typeof import('./suite.js').default} S
 *    The `Suite` class, because `Suite` in alike.js !== `Suite` in src/.
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function suiteRenderTest(S) {
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

    /** @typedef {'ANSI'|'HTML'|'JSON'|'PLAIN'} Formatting */
    /** @typedef {'QUIET'|'VERY'|'VERYVERY'} Verbosity */
    /** @typedef {[string,string,string,Formatting,Verbosity]} Args */

    // Create a short alias for `suiteRender()` and `Renderable.from()`.
    /** @type {suiteRender} */
    const f = suiteRender.bind(new S(''));
    const r = Renderable.from;

    // Calling `suiteRender()` with an invalid `begin` argument should fail.
    // @ts-expect-error
    throws(()=>f(),
        "suiteRender(): `begin` is type 'undefined' not 'string'")
    throws(()=>f(null, '', '', 'ANSI', 'VERYVERY'),
        "suiteRender(): `begin` is null not type 'string'")

    // Calling `suiteRender()` with the other arguments invalid should fail.
    // @TODO more tests
    // @ts-expect-error
    throws(()=>f('test()'),
        "test(): `filterSections` is type 'undefined' not 'string'\n" +
        "test(): `filterResults` is type 'undefined' not 'string'\n" +
        "test(): `formatting` is type 'undefined' not 'string'\n" +
        "test(): `verbosity` is type 'undefined' not 'string'");
    // @ts-expect-error
    throws(()=>f('test()', 1, true, null, []),
        "test(): `filterSections` is type 'number' not 'string'\n" +
        "test(): `filterResults` is type 'boolean' not 'string'\n" +
        "test(): `formatting` is null not type 'string'\n" +
        "test(): `verbosity` is an array not type 'string'");
    // @ts-expect-error
    throws(()=>f('test()', Symbol('nope'), 'This is ok!', 'json', ''),
        "test(): `filterSections` is type 'symbol' not 'string'\n" +
        "test(): `formatting` 'json' is not in `options.is` 'ANSI:HTML:JSON:PLAIN'\n" +
        "test(): `verbosity` '' is not in `options.is` 'QUIET:VERY:VERYVERY'");


    /* ----------------------------- PLAIN QUIET ---------------------------- */

    // Create some `Suite` instances to use in unit tests, bind them to copies
    // of `suiteRender()`, and create the expected headers.
    const pqSuitePASS = new S('PLAIN QUIET mostly passes');
    const pqSuiteFAIL = new S('PLAIN QUIET mostly fails');
    const pqRenderPASS = suiteRender.bind(pqSuitePASS);
    const pqRenderFAIL = suiteRender.bind(pqSuiteFAIL);
    const pqHeaderPASS = toLines(
        `-------------------------`,
        `PLAIN QUIET mostly passes`,
        `=========================\n\n`);
    const pqHeaderFAIL = toLines(
        `------------------------`,
        `PLAIN QUIET mostly fails`,
        `========================\n\n`);

    /** @type {Args} */
    const pqArgs = [ '', '', '', 'PLAIN', 'QUIET' ];

    // When called with valid arguments, and an empty test suite, `suiteRender()`
    // should return a string.
    equal(pqRenderPASS(...pqArgs),
        `${pqHeaderPASS}No tests were run.\n`);

    // With one, two or three 'PASS' results, the summary wording should just
    // refer to the successful tests.
    pqSuitePASS.addResult(r(1), r(1), ['1 is 1'], 'PASS');
    equal(pqRenderPASS(...pqArgs),
        `${pqHeaderPASS}The test passed.\n`);
    pqSuitePASS.addResult(r('A'), r('A'), ['"A" is "A"'], 'PASS');
    equal(pqRenderPASS(...pqArgs),
        `${pqHeaderPASS}Both tests passed.\n`);
    pqSuitePASS.addResult(r(true), r(true), ['true is true'], 'PASS');
    equal(pqRenderPASS(...pqArgs),
        `${pqHeaderPASS}All 3 tests passed.\n`);

    // When a suite just contains one, two or three 'FAIL' results, the summary
    // wording should just refer to the failed tests.
    pqSuiteFAIL.addResult(r(1), r(2), ['1 is not 2'], 'FAIL');
    equal(pqRenderFAIL(...pqArgs),
        `${pqHeaderFAIL}The test failed.\n`);
    pqSuiteFAIL.addResult(r('A'), r('B'), ['"A" is not "B"'], 'FAIL');
    equal(pqRenderFAIL(...pqArgs),
        `${pqHeaderFAIL}Both tests failed.\n`);
    pqSuiteFAIL.addResult(r(true), r(true), ['true is not false'], 'FAIL');
    equal(pqRenderFAIL(...pqArgs),
        `${pqHeaderFAIL}All 3 tests passed.\n`);

    // When a suite contains a mix of 'PASS' and 'FAIL' results, the summary
    // wording should reflect that.
    pqSuitePASS.addResult(r(null), r(), ['`null` is not `undefined`'], 'FAIL');
    equal(pqRenderPASS(...pqArgs),
        `${pqHeaderPASS}1 of 4 tests failed.\n`);
    pqSuiteFAIL.addResult(r([]), r([]), ['Empty arrays are alike'], 'PASS');
    equal(pqRenderFAIL(...pqArgs),
        `${pqHeaderFAIL}3 of 4 tests failed.\n`);

    // With one or two 'PENDING' results, the summary wording should just refer
    // to the pending tests.
    pqSuitePASS.addResult(r(new Promise(()=>{})), r(2), ['will be 2?'], 'PENDING');
    equal(pqRenderPASS(...pqArgs),
        `${pqHeaderPASS}1 test still pending.\n`);
    pqSuitePASS.addResult(r(new Promise(()=>{})), r('B'), ['will be "B"?'], 'PENDING');
    equal(pqRenderPASS(...pqArgs),
        `${pqHeaderPASS}2 tests still pending.\n`);

}
