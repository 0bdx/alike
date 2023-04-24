import { aintaArray, aintaObject } from '@0bdx/ainta';
import { Renderable, Result, Suite } from "../classes/index.js";

/** ### Uses deep-equal to compare two values.
 * 
 * @TODO describe with examples
 *
 * @param {any} actually
 *    The value that the test actually got.
 * @param {any} expected
 *    The value that the test expected.
 * @param {string[]} [notes]
 *    An optional description of the test, as an array of strings.
 *    - 0 to 100 items, where each item is a line
 *    - 0 to 120 printable ASCII characters (except the backslash `"\"`) per line
 * @returns {Result}
 *    Returns a deep clone of the `Result` instance which was added to the suite.
 * @throws
 *    Throws an `Error` if `notes` or the `this` context are invalid.
 */
export default function isAlike(actually, expected, notes) {
    const begin = 'isAlike()';

    // Check that this function has been bound to a `Suite` instance.
    // @TODO cache this result for performance
    /** @type Suite */
    const suite = this;
    const aSuite = aintaObject(suite, 'suite', { begin, is:[Suite], open:true });
    if (aSuite) throw Error(aSuite);

    // Check that the optional `notes` argument is an array of some kind.
    // `addResult()` will run more stringent checks on `notes`.
    if (typeof notes !== 'undefined') {
        const aNotes = aintaArray(notes, 'notes', { begin });
        if (aNotes) throw Error(aNotes);
    }

    // @TODO describe
    const generated = [ 'actual:', '{{actually}}', '!== expected:', '{{expected}}' ];
    const notesCombined = notes ? [ ...notes, ...generated ] : generated;

    // Add the test result to the suite, and also return the test result.
    return suite.addResult(
        Renderable.from(actually),
        Renderable.from(expected),
        notesCombined,
        actually === expected ? 'PASS' : 'FAIL',
    );
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `isAlike()` unit tests.
 * 
 * @param {isAlike} f
 *    The `isAlike()` function to test.
 * @param {typeof Renderable} R
 *    The `Renderable` class, because `Renderable` in alike.js !== in src/.
 * @param {typeof Suite} S
 *    The `Suite` class, because `Suite` in alike.js !== `Suite` in src/.
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function isAlikeTest(f, R, S) {
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

    // `isAlike()` should be bound to a `Suite` instance.
    throws(()=>f(),
        "isAlike(): `suite` is type 'undefined' not 'object'");
    const badlyBound = f.bind({});
    throws(()=>badlyBound(),
        "isAlike(): `suite` is not in `options.is` 'Suite'");

    // When bound bound to a `Suite` instance, `isAlike()` should add a result.
    const suite = new S('Test Suite');
    /** @type f */
    const bound = f.bind(suite);
    const resultUndefinedActually = bound();
    const highlightsUndefinedExpectedStr = toLines(
        `    "highlights": [`,
        `      {`,
        `        "kind": "NULLISH",`,
        `        "start": 0,`,
        `        "stop": 9`,
        `      }`,
        `    ],`,
    );
    const resultUndefinedExpectedStr = toLines(
        `{`,
        `  "actually": {`,
        highlightsUndefinedExpectedStr,
        `    "text": "undefined"`,
        `  },`,
        `  "expected": {`,
        highlightsUndefinedExpectedStr,
        `    "text": "undefined"`,
        `  },`,
        `  "notes": "actual:\\n{{actually}}\\n!== expected:\\n{{expected}}",`,
        `  "sectionIndex": 0,`,
        `  "status": "PASS"`,
        `}`
    );
    equal(toStr(resultUndefinedActually), resultUndefinedExpectedStr);
    equal(suite.resultsAndSections.length, 1);
    equal(toStr(suite.resultsAndSections[0]), resultUndefinedExpectedStr);
    equal(suite.resultsAndSections[0] === resultUndefinedActually, false); // not the same object

    // `notes` should be 0 to 64 printable ASCII characters plus newlines, but
    // not backslashes.
    // @ts-expect-error
    throws(()=>bound(1,2,''),
        "isAlike(): `notes` is type 'string' not an array");
    throws(()=>bound(1,2,['1234567890'.repeat(12),'','1234567890'.repeat(12) + '1']),
        "new Result(): `notes[2]` '123456789012345678901...45678901' is not max 120");
    throws(()=>bound(1,2,['\\']),
        "new Result(): `notes[0]` '%5C' fails 'Printable ASCII characters except backslashes'");
    throws(()=>bound(1,2,['\n']),
        "new Result(): `notes[0]` '%0A' fails 'Printable ASCII characters except backslashes'");
    throws(()=>bound(1,2,['Ok','Café']),
        "new Result(): `notes[1]` 'Caf%C3%A9' fails 'Printable ASCII characters except backslashes'");

    // 64 printable ASCII characters except backslashes, is a
    // valid `summary`, and so is an empty string.
    const longestValidLine =
        ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[' +
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ]^_`abcdefghijklmnopqrstuvwxyz{|}~'
    bound(null,void 0,[]);
    bound(3,3,[longestValidLine]);
    bound('true',true);
    equal(suite.resultsAndSections.length, 4);
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
        `  "notes": "actual:\\n{{actually}}\\n!== expected:\\n{{expected}}",`,
        `  "sectionIndex": 0,`,
        `  "status": "FAIL"`,
        `}`
    ));
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
            `]^_\`abcdefghijklmnopqrstuvwxyz{|}~\\nactual:\\n{{actually}}\\n!== expected:\\n{{expected}}",`,
        `  "sectionIndex": 0,`,
        `  "status": "PASS"`,
        `}`
    ));
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
        `    "text": "'true'"`,
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
        `  "notes": "actual:\\n{{actually}}\\n!== expected:\\n{{expected}}",`,
        `  "sectionIndex": 0,`,
        `  "status": "FAIL"`,
        `}`
    ));

}
