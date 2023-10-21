import { aintaArray, aintaString } from '@0bdx/ainta';
import { Are, Renderable } from "../classes/index.js";
import { determineWhetherDeeplyAlike, truncate } from '../helpers.js';

// Define a regular expression for validating each item in `notes`.
const noteRx = /^[ -\[\]-~]*$/;
noteRx.toString = () => "'Printable ASCII characters except backslashes'";

/** ### Compares two JavaScript values in a user-friendly way.
 *
 * `isDeeplyLike()` operates in one of two modes:
 * 1. If it has been bound to an object with an `addResult()` method, it sends
 *    that method the full test results, and then returns an overview.
 * 2. Otherwise, it either throws an `Error` if the test fails, or returns
 *    an overview if the test passes.
 *
 * @TODO finish the description, with examples
 *
 * @param {any} actually
 *    The value that the test actually got.
 * @param {any} expected
 *    The value that the test expected.
 * @param {string|string[]} [notes]
 *    An optional description of the test, as a string or array of strings.
 *    - A string is treated identically to an array containing just that string
 *    - 0 to 100 items, where each item is a line
 *    - 0 to 120 printable ASCII characters (except the backslash `"\"`) per line
 *    - An empty array `[]` means that no notes have been supplied
 *    - The first item (index 0), if present, is used for the overview
 * @returns {string}
 *    Returns an overview of the test result.
 * @throws {Error}
 *    Throws an `Error` if `notes` or the `this` context are invalid.
 *    Also, unless the `this` context is an object with an `addResult()` method,
 *    throws an `Error` if the test fails.
 */
export default function isDeeplyLike(actually, expected, notes) {
    const begin = 'isDeeplyLike()';

    // Validate the `notes` argument. `this.addResult()`, if it exists, will
    // do some similar validation, but its error message would be confusing.
    const notesIsArray = Array.isArray(notes); // used again, further below
    const options = { begin, max:120, most:100, pass:true, rx:noteRx };
    const aNotes = notesIsArray // TODO make ainta able to handle 'or' types
        ? aintaArray(notes, 'notes', { ...options, types:['string'] })
        : typeof notes !== 'undefined'
            ? aintaString(notes, 'notes', options)
            : '' // no `notes` argument was passed in
    if (aNotes) throw Error(aNotes);

    // Determine whether `actually` and `expected` are deeply alike.
    const didFail = !determineWhetherDeeplyAlike(actually, expected);

    // Generate the overview which `isDeeplyLike()` will throw or return.
    const status = didFail ? 'FAIL' : 'PASS';
    const actuallyRenderable = Renderable.from(actually);
    const expectedRenderable = Renderable.from(expected);
    const firstNotesLine = notesIsArray
        ? (notes[0] || '') // `notes` is an array
        : (notes || ''); // `notes` should be undefined or a string
    const overview = status +
        `: ${firstNotesLine && truncate(firstNotesLine,114) + '\n    : '}` +
        `\`actually\` is ${actuallyRenderable.overview}${didFail
            ? `\n    : \`expected\` is ${expectedRenderable.overview}`
            : ' as expected'}`;

    // If there's no `this.addResult()`, throw or return the overview.
    if (typeof this?.addResult !== 'function') {
        if (didFail) throw Error(overview);
        return overview;
    }

    // Normalise the `notes` argument into an array.
    const notesArr = Array.isArray(notes)
        ? notes // was already an array
        : typeof notes === 'undefined'
            ? [] // no `notes` argument was passed in
            : [ notes ] // hopefully a string, but that will be validated below

    // Add the test result to the object that this function has been bound to.
    /** @type {Are} */
    const are = this;
    are.addResult(
        actuallyRenderable,
        expectedRenderable,
        notesArr,
        status,
    );

    // Return an overview of the test result.
    return overview;
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `isDeeplyLike()` unit tests.
 *
 * @param {typeof Are} A
 *    The `Are` class, because `Are` in are.js !== `Are` in src/.
 * @param {isDeeplyLike} f
 *    The `isDeeplyLike()` function to test.
 * @param {typeof Renderable} R
 *    The `Renderable` class, because `Renderable` in are.js !== in src/.
 * @returns {void}
 *    Does not return anything.
 * @throws {Error}
 *    Throws an `Error` if a test fails.
 */
export function isDeeplyLikeTest(A, f, R) {
    const e2l = e => (e.stack.split('\n')[2].match(/([^\/]+\.js:\d+):\d+\)?$/)||[])[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = (actual, exp) => { try { actual() } catch (err) {
        if (typeof exp.test=='function'?!exp.test(err.message):err.message!==exp)
        { throw Error(`actual message:\n${err.message}\n!== expected message:\n${
            exp}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${exp}\nbut nothing was thrown\n`) };
    const toStr = value => JSON.stringify(value, null, '  ');
    const toLines = (...lines) => lines.join('\n');

    const simpleResultMocker = (kind, stop, text) => toLines(
        `    "highlights": [`,
        `      {`,
        `        "kind": "${kind}",`,
        `        "start": 0,`,
        `        "stop": ${stop}`,
        `      }`,
        `    ],`,
        `    "text": "${text}"`,
        `  },`,
    );

    // Create a version of `isDeeplyLike()` which is bound to an `Are` instance.
    const are = new A('Test Suite');
    /** @type f */
    const bound = f.bind(are);

    // Whether `isDeeplyLike()` is bound or not, `notes` should be a valid string, or array of strings.
    // @ts-expect-error
    throws(()=>f(1,2,3),
        "isDeeplyLike(): `notes` is type 'number' not 'string'");
    throws(()=>bound(1,2,null),
        "isDeeplyLike(): `notes` is null not type 'string'");
    throws(()=>f(1,2,['ok','ok',void 0,'ok']),
        "isDeeplyLike(): `notes[2]` is type 'undefined', not the `options.types` 'string'");
    // @ts-expect-error
    throws(()=>bound(1,2,['ok','ok',['nope!'],'ok']),
        "isDeeplyLike(): `notes[2]` is an array, not the `options.types` 'string'");
    throws(()=>f(1,2,'1234567890'.repeat(12) + '1'),
        "isDeeplyLike(): `notes` '123456789012345678901...45678901' is not max 120");
    throws(()=>bound(1,2,['1234567890'.repeat(12),'','1234567890'.repeat(12) + '1']),
        "isDeeplyLike(): `notes[2]` '123456789012345678901...45678901' is not max 120");
    throws(()=>f(1,2,['\n']),
        "isDeeplyLike(): `notes[0]` '%0A' fails 'Printable ASCII characters except backslashes'");
    throws(()=>bound(1,2,'\\'),
        "isDeeplyLike(): `notes` '%5C' fails 'Printable ASCII characters except backslashes'");
    throws(()=>f(1,2,['Ok','Café']),
        "isDeeplyLike(): `notes[1]` 'Caf%C3%A9' fails 'Printable ASCII characters except backslashes'");

    // With no arguments supplied, `isDeeplyLike()` should compare the two `undefined`
    // `actually` and `expected` arguments, and return a one-line overview.
    equal(f(), 'PASS: `actually` is `undefined` as expected');

    // With no arguments supplied and when bound to an `Are` instance, `isDeeplyLike()`
    // should add a full result, in addition to returning a one-line overview.
    const resultUndefinedActually = bound();
    const resultUndefinedExpectedStr = toLines(
        `{`,
        `  "actually": {`,
        simpleResultMocker('NULLISH', 9, 'undefined'),
        `  "expected": {`,
        simpleResultMocker('NULLISH', 9, 'undefined'),
        `  "notes": "",`,
        `  "sectionIndex": 0,`,
        `  "status": "PASS"`,
        `}`
    );
    equal(resultUndefinedActually, 'PASS: `actually` is `undefined` as expected');
    equal(are.resultsAndSections.length, 1);
    equal(toStr(are.resultsAndSections[0]), resultUndefinedExpectedStr);
    equal(are.resultsAndSections[0] === resultUndefinedActually, false); // not the same object

    // Define a string to check that a 120-character line is accepted.
    const longestValidLine =
        ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[' +
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ]^_`abcdefghijklmnopqrstuvwxyz{|}~'

    // `isDeeplyLike()` should throw an `Error` where the message is a three-line overview,
    // if `actually` is a number, `expected` is a string, and `notes` contains several lines.
    throws(()=>f(1234567890, '1234567890', [longestValidLine, 'Scalar values fail strict-equal']),
        toLines(
            'FAIL:  !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[' +
                'ABCDEFGHIJKLMNOP...Z]^_`abcdefghijklmnopqrstuvwxyz{|}~',
            '    : `actually` is `1234567890`',
            '    : `expected` is "1234567890"'));

    // An array containing an empty string is a valid `notes` line.
    equal(bound(null, void 0, ['']),
        'FAIL: `actually` is `null`\n    : `expected` is `undefined`');
    equal(toStr(are.resultsAndSections[1]), toLines(
        `{`,
        `  "actually": {`,
        simpleResultMocker('NULLISH', 4, 'null'),
        `  "expected": {`,
        simpleResultMocker('NULLISH', 9, 'undefined'),
        `  "notes": "",`,
        `  "sectionIndex": 0,`,
        `  "status": "FAIL"`,
        `}`
    ));

    // 120 printable ASCII characters except backslashes, is a valid `notes` line.
    equal(bound(3, Number(3), longestValidLine),
        'PASS:  !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[ABCDEFGHIJKLMNOP...Z' +
            ']^_`abcdefghijklmnopqrstuvwxyz{|}~\n    : `actually` is `3` as expected');
    equal(toStr(are.resultsAndSections[2]), toLines(
        `{`,
        `  "actually": {`,
        simpleResultMocker('BOOLNUM', 1, '3'),
        `  "expected": {`,
        simpleResultMocker('BOOLNUM', 1, '3'),
        `  "notes": " !\\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[ABCDEFGHIJKLMNOPQRSTUVWXYZ` +
            `]^_\`abcdefghijklmnopqrstuvwxyz{|}~",`,
        `  "sectionIndex": 0,`,
        `  "status": "PASS"`,
        `}`
    ));

    // `notes` can be undefined.
    equal(bound('true', true),
        'FAIL: `actually` is "true"\n    : `expected` is `true`');
    equal(are.resultsAndSections.length, 4);
    equal(toStr(are.resultsAndSections[3]), toLines(
        `{`,
        `  "actually": {`,
        simpleResultMocker('STRING', 6, '\\"true\\"'),
        `  "expected": {`,
        simpleResultMocker('BOOLNUM', 4, 'true'),
        `  "notes": "",`,
        `  "sectionIndex": 0,`,
        `  "status": "FAIL"`,
        `}`
    ));

    // TODO more unit tests

    // `notes` can be an empty array.
    // throws(()=>f('true', true, []), 'foo');

    // equal(f(true, true, ['First line here','Second line here']), 'foo');

}
