import { aintaObject } from '@0bdx/ainta';
import { Renderable, Suite } from "../classes/index.js";

/** ### Uses deep-equal to compare two values.
 * 
 * @TODO describe with examples
 *
 * @param {any} actually
 *    The value that the test actually got.
 * @param {any} expected
 *    The value that the test expected.
 * @param {string} [summary]
 *    An optional description of the test.
 *    - 0 to 64 printable ASCII characters, except the backslash `"\"`
 *    - An empty string `""` means that no summary should be shown
 *    - A default `summary` will be generated if none is supplied
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if `summary` or the `this` context are invalid.
 */
export default function isEqual(actually, expected, summary) {
    const begin = 'isEqual()';

    // Check that this function has been bound to a `Suite` instance.
    // @TODO cache this result for performance
    const aSuite = aintaObject(this, 'suite', { begin, is:[Suite], open:true });
    if (aSuite) throw Error(aSuite);

    // The brackets around `this` make JSDoc see `(this)` as a `Suite` instance.
    /** @type Suite */
    (this).addResult(
        Renderable.from(actually),
        Renderable.from(expected),
        actually === expected ? 'PASS' : 'FAIL',
        summary === void 0
            ? 'actual:\n{{actually}}\n!== expected:\n{{expected}}'
            : summary
    );
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `isEqual()` unit tests.
 * 
 * @param {isEqual} f
 *    The `isEqual()` function to test.
 * @param {typeof Renderable} R
 *    The `Renderable` class, because `Renderable` in test-tools.js !== in src/.
 * @param {typeof Suite} S
 *    The `Suite` class, because `Suite` in test-tools.js !== `Suite` in src/.
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function isEqualTest(f, R, S) {
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

    // `isEqual()` should be bound to a `Suite` instance.
    throws(()=>f(),
        "isEqual(): `suite` is type 'undefined' not 'object'");
    const badlyBound = f.bind({});
    throws(()=>badlyBound(),
        "isEqual(): `suite` is not in `options.is` 'Suite'");

    // When bound bound to a `Suite` instance, `isEqual()` should add a result.
    const suite = new S('Test Suite');
    /** @type f */
    const bound = f.bind(suite);
    equal(bound(), void 0);
    equal(suite.resultsAndSections.length, 1);
    const highlightsUndefined = toLines(
        `    "highlights": [`,
        `      {`,
        `        "kind": "NULLISH",`,
        `        "start": 0,`,
        `        "stop": 9`,
        `      }`,
        `    ],`,
    );
    equal(toStr(suite.resultsAndSections[0]), toLines(
        `{`,
        `  "actually": {`,
        highlightsUndefined,
        `    "text": "undefined"`,
        `  },`,
        `  "expected": {`,
        highlightsUndefined,
        `    "text": "undefined"`,
        `  },`,
        `  "sectionIndex": 0,`,
        `  "status": "PASS",`,
        `  "summary": "actual:\\n{{actually}}\\n!== expected:\\n{{expected}}"`,
        `}`
    ));

    // `summary` should be 0 to 64 printable ASCII characters plus newlines, but
    // not backslashes.
    // @ts-expect-error
    throws(()=>bound(1,2,[]),
        "new Result(): `summary` is an array not type 'string'");
    throws(()=>bound(1,2,'12345678'.repeat(8) + '9'),
        "new Result(): `summary` '123456781234567812345...23456789' is not max 64");
    throws(()=>bound(1,2,'\\'),
        "new Result(): `summary` '%5C' fails 'Printable ASCII characters plus newlines, but not backslashes'");
    throws(()=>bound(1,2,'Café'),
        "new Result(): `summary` 'Caf%C3%A9' fails 'Printable ASCII characters plus newlines, but not backslashes'");

    // 64 printable ASCII characters plus newlines, but not backslashes, is a
    // valid `summary`, and so is an empty string.
    equal(bound(null,void 0,'\n !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_'), void 0);
    equal(bound(3,3,'>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~'), void 0);
    equal(bound('true',true,''), void 0);
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
        `  "sectionIndex": 0,`,
        `  "status": "FAIL",`,
        `  "summary": "\\n !\\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_"`,
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
        `  "sectionIndex": 0,`,
        `  "status": "PASS",`,
        `  "summary": ">?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_\`abcdefghijklmnopqrstuvwxyz{|}~"`,
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
        `  "sectionIndex": 0,`,
        `  "status": "FAIL",`,
        `  "summary": ""`,
        `}`
    ));

}
