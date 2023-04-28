import { aintaArray, aintaString } from '@0bdx/ainta';
import { Renderable, Suite } from "../classes/index.js";
import { determineWhetherAlike, isScalarType, truncate } from './helpers.js';

// Define a regular expression for validating each item in `notes`.
const noteRx = /^[ -\[\]-~]*$/;
noteRx.toString = () => "'Printable ASCII characters except backslashes'";

/** ### Compares two JavaScript values in a user-friendly way.
 * 
 * `areAlike()` operates in one of two modes:
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
 * @throws
 *    Throws an `Error` if `notes` or the `this` context are invalid.
 *    Also throws an `Error` if the test fails.
 */
export default function areAlike(actually, expected, notes) {
    const begin = 'areAlike()';

    // Validate the `notes` argument. `this.addResult()`, if it exists, will
    // do some similar validation, but its error message would be confusing.
    const notesIsArray = Array.isArray(notes); // used again, further below
    const options = { begin, max:120, most:100, pass:true, rx:noteRx };
    const aNotes = notesIsArray // @TODO make ainta able to handle 'or' types
        ? aintaArray(notes, 'notes', { ...options, types:['string'] })
        : typeof notes !== 'undefined'
            ? aintaString(notes, 'notes', options)
            : '' // no `notes` argument was passed in
    if (aNotes) throw Error(aNotes);

    // Determine whether `actually` and `expected` are alike.
    const didFail = !determineWhetherAlike(actually, expected);

    // Generate the overview which `areAlike()` will throw or return.
    const status = didFail ? 'FAIL' : 'PASS';
    const actuallyRenderable = Renderable.from(actually);
    const expectedRenderable = Renderable.from(expected);
    const overview = `${status}: ${notesIsArray
        ? (notes[0] ? `${truncate(notes[0],114)}\n    ` : '') // `notes` is an array
        : (notes ? `${truncate(notes,114)}\n    ` : '') // `notes` should be undefined or a string
    }\`actually\` is ${actuallyRenderable.overview}${didFail
        ? `\n    \`expected\` is ${expectedRenderable.overview}`
        : ' as expected'
    }`;

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

    // Prepare an array of strings to pass to the `addResult()` `notes` argument.
    // This array will end with some auto-generated notes about the test.
    const auto = !didFail
        ? [ '{{actually}} as expected' ]
        : actuallyRenderable.isShort() && expectedRenderable.isShort()
            ? [ 'actually: {{actually}}', 'expected: {{expected}}' ]
            : [ 'actually:', '{{actually}}', 'expected:', '{{expected}}' ];
    const notesPlusAuto = [ ...notesArr, ...auto ];

    // Add the test result to the object that this function has been bound to.
    this.addResult(
        actuallyRenderable,
        expectedRenderable,
        notesPlusAuto,
        status,
    );

    // Return an overview of the test result.
    return overview;
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `areAlike()` unit tests.
 * 
 * @param {areAlike} f
 *    The `areAlike()` function to test.
 * @param {typeof Renderable} R
 *    The `Renderable` class, because `Renderable` in alike.js !== in src/.
 * @param {typeof Suite} S
 *    The `Suite` class, because `Suite` in alike.js !== `Suite` in src/.
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function areAlikeTest(f, R, S) {
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

    // Create a version of `areAlike()` which is bound to a `Suite` instance.
    const suite = new S('Test Suite');
    /** @type f */
    const bound = f.bind(suite);

    // Whether `areAlike()` is bound or not, `notes` should be a valid string, or array of strings.
    // @ts-expect-error
    throws(()=>f(1,2,3),
        "areAlike(): `notes` is type 'number' not 'string'");
    throws(()=>bound(1,2,null),
        "areAlike(): `notes` is null not type 'string'");
    throws(()=>f(1,2,['ok','ok',void 0,'ok']),
        "areAlike(): `notes[2]` is type 'undefined', not the `options.types` 'string'");
    // @ts-expect-error
    throws(()=>bound(1,2,['ok','ok',['nope!'],'ok']),
        "areAlike(): `notes[2]` is an array, not the `options.types` 'string'");
    throws(()=>f(1,2,'1234567890'.repeat(12) + '1'),
        "areAlike(): `notes` '123456789012345678901...45678901' is not max 120");
    throws(()=>bound(1,2,['1234567890'.repeat(12),'','1234567890'.repeat(12) + '1']),
        "areAlike(): `notes[2]` '123456789012345678901...45678901' is not max 120");
    throws(()=>f(1,2,['\n']),
        "areAlike(): `notes[0]` '%0A' fails 'Printable ASCII characters except backslashes'");
    throws(()=>bound(1,2,'\\'),
        "areAlike(): `notes` '%5C' fails 'Printable ASCII characters except backslashes'");
    throws(()=>f(1,2,['Ok','Café']),
        "areAlike(): `notes[1]` 'Caf%C3%A9' fails 'Printable ASCII characters except backslashes'");

    // With no arguments supplied, `areAlike()` should compare the two `undefined`
    // `actually` and `expected` arguments, and return a one-line overview.
    equal(f(), 'PASS: `actually` is `undefined` as expected');

    // With no arguments supplied and when bound to a `Suite` instance, `areAlike()`
    // should add a full result, in addition to returning a one-line overview.
    const resultUndefinedActually = bound();
    const highlightsUndefinedExpectedStr = toLines(
        `    "highlights": [`,
        `      {`,
        `        "kind": "NULLISH",`,
        `        "start": 0,`,
        `        "stop": 9`,
        `      }`,
        `    ],`,
        `    "text": "undefined"`,
        `  },`,
    );
    const resultUndefinedExpectedStr = toLines(
        `{`,
        `  "actually": {`,
        highlightsUndefinedExpectedStr,
        `  "expected": {`,
        highlightsUndefinedExpectedStr,
        `  "notes": "{{actually}} as expected",`,
        `  "sectionIndex": 0,`,
        `  "status": "PASS"`,
        `}`
    );
    equal(resultUndefinedActually, 'PASS: `actually` is `undefined` as expected');
    equal(suite.resultsAndSections.length, 1);
    equal(toStr(suite.resultsAndSections[0]), resultUndefinedExpectedStr);
    equal(suite.resultsAndSections[0] === resultUndefinedActually, false); // not the same object

    // Define a string to check that a 120-character line is accepted.
    const longestValidLine =
        ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[' +
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ]^_`abcdefghijklmnopqrstuvwxyz{|}~'

    // `areAlike()` should throw an `Error` where the message is a three-line overview,
    // if `actually` is a number, `expected` is a string, and `notes` contains several lines.
    throws(()=>f(1234567890, '1234567890', [longestValidLine, 'Scalar values fail strict-equal']),
        toLines(
            'FAIL:  !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[' +
                'ABCDEFGHIJKLMNOPQRSTUVWXYZ]^_`abcdefghijklm...wxyz{|}~',
            '    `actually` is `1234567890`',
            '    `expected` is "1234567890"'));

    // An array containing an empty string is a valid `notes` line.
    bound(null, void 0, ['']);
    equal(toStr(suite.resultsAndSections[1]), toLines(
        `{`,
        `  "actually": {`,
        `    "highlights": [`,
        `      {`,
        `        "kind": "NULLISH",`,
        `        "start": 0,`,
        `        "stop": 4`,
        `      }`,
        `    ],`,
        `    "text": "null"`,
        `  },`,
        `  "expected": {`,
        `    "highlights": [`,
        `      {`,
        `        "kind": "NULLISH",`,
        `        "start": 0,`,
        `        "stop": 9`,
        `      }`,
        `    ],`,
        `    "text": "undefined"`,
        `  },`,
        `  "notes": "\\nactually: {{actually}}\\nexpected: {{expected}}",`,
        `  "sectionIndex": 0,`,
        `  "status": "FAIL"`,
        `}`
    ));

    // 120 printable ASCII characters except backslashes, is a valid `notes` line.
    bound(3, Number(3), longestValidLine);
    equal(toStr(suite.resultsAndSections[2]), toLines(
        `{`,
        `  "actually": {`,
        `    "highlights": [`,
        `      {`,
        `        "kind": "BOOLNUM",`,
        `        "start": 0,`,
        `        "stop": 1`,
        `      }`,
        `    ],`,
        `    "text": "3"`,
        `  },`,
        `  "expected": {`,
        `    "highlights": [`,
        `      {`,
        `        "kind": "BOOLNUM",`,
        `        "start": 0,`,
        `        "stop": 1`,
        `      }`,
        `    ],`,
        `    "text": "3"`,
        `  },`,
        `  "notes": " !\\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[ABCDEFGHIJKLMNOPQRSTUVWXYZ` +
            `]^_\`abcdefghijklmnopqrstuvwxyz{|}~\\n{{actually}} as expected",`,
        `  "sectionIndex": 0,`,
        `  "status": "PASS"`,
        `}`
    ));

    // `notes` can be undefined.
    bound('true', true);
    equal(suite.resultsAndSections.length, 4);
    equal(toStr(suite.resultsAndSections[3]), toLines(
        `{`,
        `  "actually": {`,
        `    "highlights": [`,
        `      {`,
        `        "kind": "STRING",`,
        `        "start": 0,`,
        `        "stop": 6`,
        `      }`,
        `    ],`,
        `    "text": "\\"true\\""`,
        `  },`,
        `  "expected": {`,
        `    "highlights": [`,
        `      {`,
        `        "kind": "BOOLNUM",`,
        `        "start": 0,`,
        `        "stop": 4`,
        `      }`,
        `    ],`,
        `    "text": "true"`,
        `  },`,
        `  "notes": "actually: {{actually}}\\nexpected: {{expected}}",`,
        `  "sectionIndex": 0,`,
        `  "status": "FAIL"`,
        `}`
    ));

}
