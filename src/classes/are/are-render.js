import narrowAintas, { aintaObject, aintaString } from '@0bdx/ainta';
import Renderable from "../renderable/renderable.js";
import Section from '../section.js';
import Are from './are.js';

// Define styling-strings for all possible `formatting`.
const STYLING_STRINGS = {
    ANSI: {
        failIn: '\x1B[38;5;224;48;5;52m ', // bright red on dark red
        failOut: ' \x1B[0m',
        passIn: '\x1B[38;5;118;48;5;22m ', // bright green on dark green
        passOut: ' \x1B[0m',
    },
    PLAIN: {
        failIn: '',
        failOut: '',
        passIn: '',
        passOut: '',
    },
};

/** ### Renders a given test suite.
 *
 * @param {Are} are
 *    An `Are` instance.
 * @param {string} begin
 *    Overrides the `begin` string sent to `Ainta` functions.
 * @param {string} filterSections
 *    Optional string, which hides sections whose subtitles do not match.
 *    - The empty string `""` is treated the same as `undefined`
 * @param {string} filterResults
 *    A string, which hides results whose notes do not match.
 *    - The empty string `""` is treated the same as `undefined`
 * @param {'ANSI'|'HTML'|'JSON'|'PLAIN'} formatting
 *    How the render should be styled. One of `"ANSI|HTML|JSON|PLAIN"`.
 * @param {'QUIET'|'VERBOSE'|'VERY'|'VERYVERY'} verbosity
 *    How detailed the render should be. One of `"QUIET|VERBOSE|VERY|VERYVERY"`.
 * @returns {string}
 *    Returns the rendered test suite.
 * @throws {Error}
 *    Throws an `Error` if either of the arguments are invalid.
 */
const areRender = (
    are,
    begin,
    filterSections,
    filterResults,
    formatting,
    verbosity,
) => {
    // Validate the `begin` argument.
    const aBegin = aintaString(begin, 'begin', { begin:'areRender()' });
    if (aBegin) throw Error(aBegin);

    // Validate the other arguments.
    const [ aResults, aObj, aStr ] = narrowAintas({ begin },
        aintaObject, aintaString);
    aObj(are, 'are', { is:[Are], open:true });
    aStr(filterSections, 'filterSections');
    aStr(filterResults, 'filterResults');
    aStr(formatting, 'formatting', { is:['ANSI','HTML','JSON','PLAIN'] });
    aStr(verbosity, 'verbosity', { is:['QUIET','VERBOSE','VERY','VERYVERY'] });
    if (aResults.length) throw Error(aResults.join('\n'));

    // Get the number of tests which failed, passed, and have not completed yet.
    const fail = are.failTally;
    const pass = are.passTally;
    const numTests = fail + pass;

    // Set up the appropriate styling-strings for the current `formatting`.
    const { failIn, failOut, passIn, passOut } = STYLING_STRINGS[formatting];

    // Create the test suite's heading.
    const heading = [
        '-'.repeat(are.title.length),
        are.title,
        '='.repeat(are.title.length),
    ].join('\n');

    // Create a summary of the test results.
    const summary =
        numTests === 0
            ? 'No tests were run.'
            : fail
                ? `${failIn}${
                numTests === fail
                    ? (
                        fail === 1
                        ? 'The test failed.'
                        : fail === 2
                            ? 'Both tests failed.'
                            : `All ${fail} tests failed.`)
                    : (
                        `${fail} of ${numTests} tests failed.`
                    )
                }${failOut}`
                : `${passIn}${
                pass === 1
                    ? 'The test passed.'
                    : pass === 2
                        ? 'Both tests passed.'
                        : `All ${pass} tests passed.`
                }${passOut}`
    ;

    // Create a more detailed report of the test results.
    const details = verbosity === 'QUIET'
        ? !fail
            ? ''
            : '\n\n' + getQuietFailDetails(are)
        : '\n\n' + getVerboseDetails(are, verbosity)
    ;

    // Return the rendered test suite.
    return `${heading}\n\n${summary}${details}\n`;
}

/** ### Returns details about a failed test suite.
 *
 * @param {Are} are
 *    An `Are` instance.
 * @returns {string}
 *    Returns details about a failed test suite.
 */
const getQuietFailDetails = (are) => {
    const sections = { 0:{ results:[] } };
    for (const resultOrSection of are.resultsAndSections) {
        if (resultOrSection instanceof Section) {
            sections[resultOrSection.index] = {
                results: [],
                section: resultOrSection,
            };
        } else if (resultOrSection.status === 'FAIL') {
            const section = sections[resultOrSection.sectionIndex];
            section.results.push(resultOrSection);
        }
    }
    return Object.values(sections).flatMap(({ results, section }) => (
        !section
            ? renderResults(results) // sectionIndex 0, the anonymous section
            : results.length
                ? [ '', underline(section.subtitle), '', ...renderResults(results) ]
                : []
    )).join('\n');
}

const underline = text => text + '\n' + '-'.repeat(text.length);

const renderResults = results =>
    results.map(({ actually, expected, notes }) =>
        `FAIL: ${notes && notes + '\n    : '}` +
        `\`actually\` is ${actually.overview}\n` +
        `    : \`expected\` is ${expected.overview}`
    );

const getVerboseDetails = (are, verbosity) => {
    return 'getVerboseDetails()'
};

// Implement `Are#render()`.
Are.prototype.render = function render(
    begin = 'render()',
    filterSections = '',
    filterResults = '',
    /** @type {'ANSI'|'HTML'|'JSON'|'PLAIN'} */ formatting = 'PLAIN',
    /** @type {'QUIET'|'VERBOSE'|'VERY'|'VERYVERY'} */ verbosity = 'QUIET',
) {
    return areRender(
        this,
        begin,
        filterSections,
        filterResults,
        formatting,
        verbosity,
    );
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `Are#render()` unit tests.
 *
 * @param {typeof Are} A
 *    The `Are` class, because `Are` in are.js !== `Are` in src/.
 * @returns {void}
 *    Does not return anything.
 * @throws {Error}
 *    Throws an `Error` if a test fails.
 */
export function areRenderTest(A) {
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
    /** @typedef {'QUIET'|'VERBOSE'|'VERY'|'VERYVERY'} Verbosity */
    /** @typedef {[Are,string,string,string,Formatting,Verbosity]} Args */

    // Create a short alias for `areRender()` and `Renderable.from()`.
    const f = areRender;
    const r = Renderable.from;

    // Calling `areRender()` with an invalid `begin` argument should fail.
    // @ts-expect-error
    throws(()=>f(),
        "areRender(): `begin` is type 'undefined' not 'string'")
    throws(()=>f(new A(''), null, '', '', 'ANSI', 'VERYVERY'),
        "areRender(): `begin` is null not type 'string'")

    // Calling `areRender()` with the other arguments invalid should fail.
    // TODO more tests
    // @ts-expect-error
    throws(()=>f(new A(''), 'test()'),
        "test(): `filterSections` is type 'undefined' not 'string'\n" +
        "test(): `filterResults` is type 'undefined' not 'string'\n" +
        "test(): `formatting` is type 'undefined' not 'string'\n" +
        "test(): `verbosity` is type 'undefined' not 'string'");
    // @ts-expect-error
    throws(()=>f(new A(''), 'test()', 1, true, null, []),
        "test(): `filterSections` is type 'number' not 'string'\n" +
        "test(): `filterResults` is type 'boolean' not 'string'\n" +
        "test(): `formatting` is null not type 'string'\n" +
        "test(): `verbosity` is an array not type 'string'");
    // @ts-expect-error
    throws(()=>f(new A(''), 'test()', Symbol('nope'), 'This is ok!', 'json', ''),
        "test(): `filterSections` is type 'symbol' not 'string'\n" +
        "test(): `formatting` 'json' is not in `options.is` 'ANSI:HTML:JSON:PLAIN'\n" +
        "test(): `verbosity` '' is not in `options.is` 'QUIET:VERBOSE:VERY:VERYVERY'");


    /* ----------------------------- PLAIN QUIET ---------------------------- */

    // Create some `Are` instances to use in unit tests, bind them to copies
    // of `areRender()`, and create the expected headers.
    const pqArePASS = new A('PLAIN QUIET mostly passes');
    const pqAreFAIL = new A('PLAIN QUIET mostly fails');
    const pqHeaderPASS = toLines(
        `-------------------------`,
        `PLAIN QUIET mostly passes`,
        `=========================\n\n`);
    const pqHeaderFAIL = toLines(
        `------------------------`,
        `PLAIN QUIET mostly fails`,
        `========================\n\n`);

    /** @type {Args} */
    const pqPassArgs = [ pqArePASS, '', '', '', 'PLAIN', 'QUIET' ];
    /** @type {Args} */
    const pqFailArgs = [ pqAreFAIL, '', '', '', 'PLAIN', 'QUIET' ];

    // When called with valid arguments, and an empty test suite, `areRender()`
    // should return a string.
    equal(f(...pqPassArgs),
        `${pqHeaderPASS}No tests were run.\n`);

    // With one, two or three 'PASS' results, the summary wording should just
    // refer to the successful tests.
    pqArePASS.addResult(r(1), r(1), ['1 is 1'], 'PASS');
    equal(f(...pqPassArgs),
        `${pqHeaderPASS}The test passed.\n`);
    pqArePASS.addResult(r('A'), r('A'), ['"A" is "A"'], 'PASS');
    equal(f(...pqPassArgs),
        `${pqHeaderPASS}Both tests passed.\n`);
    pqArePASS.addResult(r(true), r(true), ['true is true'], 'PASS');
    equal(f(...pqPassArgs),
        `${pqHeaderPASS}All 3 tests passed.\n`);

    // When a test suite just contains one, two or three 'FAIL' results, the
    // summary wording should just refer to the failed tests.
    pqAreFAIL.addResult(r(1), r(2), ['1 is not 2'], 'FAIL');
    equal(f(...pqFailArgs), toLines(
        `${pqHeaderFAIL}The test failed.\n`,
        'FAIL: 1 is not 2',
        '    : `actually` is `1`',
        '    : `expected` is `2`\n',
    ));
    pqAreFAIL.addSection('The first section has no tests');
    pqAreFAIL.addSection('The second section');
    pqAreFAIL.addResult(r('A'), r('B'), ['"A" is not "B"'], 'FAIL');
    equal(f(...pqFailArgs), toLines(
        `${pqHeaderFAIL}Both tests failed.\n`,
        'FAIL: 1 is not 2',
        '    : `actually` is `1`',
        '    : `expected` is `2`\n',
        'The second section',
        '------------------\n',
        'FAIL: "A" is not "B"',
        '    : `actually` is "A"',
        '    : `expected` is "B"\n',
    ));
    pqAreFAIL.addResult(r(true), r(false), [''], 'FAIL');
    equal(f(...pqFailArgs), toLines(
        `${pqHeaderFAIL}All 3 tests failed.\n`,
        'FAIL: 1 is not 2',
        '    : `actually` is `1`',
        '    : `expected` is `2`\n',
        'The second section',
        '------------------\n',
        'FAIL: "A" is not "B"',
        '    : `actually` is "A"',
        '    : `expected` is "B"',
        'FAIL: `actually` is `true`',
        '    : `expected` is `false`\n',
    ));

    // When a test suite contains a mix of 'PASS' and 'FAIL' results, the
    // summary wording should reflect that.
    pqArePASS.addResult(r(null), r(), ['`null` is not `undefined`'], 'FAIL');
    equal(f(...pqPassArgs), toLines(
        `${pqHeaderPASS}1 of 4 tests failed.\n`,
        'FAIL: `null` is not `undefined`',
        '    : `actually` is `null`',
        '    : `expected` is `undefined`\n',
    ));
    pqAreFAIL.addResult(r([]), r([]), ['Empty arrays are deeply alike'], 'PASS');
    equal(f(...pqFailArgs), toLines(
        `${pqHeaderFAIL}3 of 4 tests failed.\n`,
        'FAIL: 1 is not 2',
        '    : `actually` is `1`',
        '    : `expected` is `2`\n',
        'The second section',
        '------------------\n',
        'FAIL: "A" is not "B"',
        '    : `actually` is "A"',
        '    : `expected` is "B"',
        'FAIL: `actually` is `true`',
        '    : `expected` is `false`\n',
    ));
}
