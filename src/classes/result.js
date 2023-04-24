import narrowAintas, { aintaArray, aintaObject, aintaNumber, aintaString }
    from '@0bdx/ainta';
import Highlight from './highlight.js';
import Renderable from './renderable/renderable.js';

// Define a regular expression for validating each item in `notes`.
const noteRx = /^[ -\[\]-~]*$/;
noteRx.toString = () => "'Printable ASCII characters except backslashes'";

// Define an enum for validating `status`.
const validStatus = [ 'FAIL', 'PASS', 'PENDING', 'UNEXPECTED_EXCEPTION' ];

/** ### Records the outcome of one test.
 *
 * - __Dereferenced:__ object arguments are deep-cloned, to avoid back-refs
 * - __Frozen:__ all properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ all properties are validated during instantiation
 */
export default class Result {

    /** A representation of the value that the test actually got, ready to
     * render. This could be the representation of an unexpected exception. */
    actually;

    /** A representation of the value that the test expected, ready to render. */
    expected;

    /** A description of the test, as a single string of newline-delimited lines.
     * - 0 to 100 newline-delimited lines
     * - 0 to 120 printable ASCII characters (except the backslash `"\"`) per line
     * - An empty array `[]` means that no notes have been supplied */
    notes;

    /** The index of the `Section` that the test belongs to. Zero if it should
     * be rendered before the first section, or if there are no sections. */
    sectionIndex;

    /** A string (effectively an enum) which can be one of four values:
     * - `"FAIL"` if the test failed (but not by `"UNEXPECTED_EXCEPTION"`)
     * - `"PASS"` if the test passed
     * - `"PENDING"` if the test has not completed yet
     * - `"UNEXPECTED_EXCEPTION"` if the test threw an unexpected exception */
    status;

    /** ### Creates a `Result` instance from the supplied arguments.
     * 
     * @param {Renderable} actually
     *    A representation of the value that the test actually got, ready to
     *    render. This could be the representation of an unexpected exception.
     * @param {Renderable} expected
     *    A representation of the value that the test expected, ready to render.
     * @param {string[]} notes
     *    A description of the test, as an array of strings.
     *    - 0 to 100 items, where each item is a line
     *    - 0 to 120 printable ASCII characters (except the backslash `"\"`) per line
     *    - An empty array `[]` means that no notes have been supplied
     * @param {number} sectionIndex
     *    The index of the `Section` that the test belongs to. Zero if it should
     *    be rendered before the first section, or if there are no sections.
     * @param {'FAIL'|'PASS'|'PENDING'|'UNEXPECTED_EXCEPTION'} status
     *    A string (effectively an enum) which can be one of four values:
     *    - `"FAIL"` if the test failed (but not by `"UNEXPECTED_EXCEPTION"`)
     *    - `"PASS"` if the test passed
     *    - `"PENDING"` if the test has not completed yet
     *    - `"UNEXPECTED_EXCEPTION"` if the test threw an unexpected exception
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(
        actually,
        expected,
        notes,
        sectionIndex,
        status,
    ) {
        const begin = 'new Result()';

        // Validate each argument.
        const [ aResults, aArr, aObj, aNum, aStr ] = narrowAintas({ begin },
            aintaArray, aintaObject, aintaNumber, aintaString);
        aObj(actually, 'actually', { is:[Renderable], open:true });
        aObj(expected, 'expected', { is:[Renderable], open:true });
        aArr(notes, 'notes', { most:100, max:120, pass:true, rx:noteRx, types:['string'] });
        aNum(sectionIndex, 'sectionIndex', {
            gte:0, lte:Number.MAX_SAFE_INTEGER, mod:1 });
        aStr(status, 'status', { is:validStatus });
        if (aResults.length) throw Error(aResults.join('\n'));

        // Store the validated arguments as properties.
        this.actually = actually;
        this.expected = expected;
        this.notes = notes.join('\n');
        this.sectionIndex = sectionIndex;
        this.status = status;

        // Prevent this instance from being modified.
        Object.freeze(this);
    }

    /**
     * Creates a dereferenced copy of the `Result` instance.
     *
     * @returns {Result}
     *    Returns the deep clone.
     */
    clone() {
        return new Result(
            this.actually.clone(),
            this.expected.clone(),
            this.notes.split('\n'), // creates a new array
            this.sectionIndex,
            this.status,
        );
    }
}


/* ---------------------------------- Tests --------------------------------- */

/** ### `Result` unit tests.
 * 
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function resultTest() {
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
    const toStr = value => JSON.stringify(value, null, '  ');

    // Define a short alias to the class being tested.
    // Define the string that all `new Result(...)` error messages begin with.
    const C = Result;
    const begin = `new ${C.name}()`; // "new Result()"

    // Define some typical, minimal and maximal valid values.
    const aUsual = new Renderable(
        [ new Highlight('BOOLNUM', 6, 11) ],
        '{ ok:"Café" }',
    );
    const eUsual = new Renderable(
        [ new Highlight('BOOLNUM', 6, 11) ],
        '{ ok:"Café" }',
    );
    const nUsual = ['First line.','Second Line.'];
    const siUsual = 77;
    const stUsual = 'PASS';
    // @TODO *Min
    // @TODO *Max

    // Instantiating with all arguments invalid should fail.
    // @TODO more tests
    // @ts-expect-error
    throws(()=>new C(),
        begin + ": `actually` is type 'undefined' not 'object'\n" +
        begin + ": `expected` is type 'undefined' not 'object'\n" +
        begin + ": `notes` is type 'undefined' not an array\n" +
        begin + ": `sectionIndex` is type 'undefined' not 'number'\n" +
        begin + ": `status` is type 'undefined' not 'string'");

    // `actually` should be a `Renderable` instance.
    // @ts-expect-error
    throws(()=>new C([], eUsual, nUsual, siUsual, stUsual),
        begin + ": `actually` is an array not a regular object");
    // @ts-expect-error
    throws(()=>new C({}, eUsual, nUsual, siUsual, stUsual),
        begin + ": `actually` is not in `options.is` 'Renderable'");

    // `expected` should be a `Renderable` instance.
    throws(()=>new C(aUsual, null, nUsual, siUsual, stUsual),
        begin + ": `expected` is null not a regular object");
    // @ts-expect-error
    throws(()=>new C(aUsual, Renderable, nUsual, siUsual, stUsual),
        begin + ": `expected` is type 'function' not 'object'");

    // `sectionIndex` should be a valid non-zero integer.
    // @ts-expect-error
    throws(()=>new C(aUsual, eUsual, nUsual, BigInt(2), stUsual),
        begin + ": `sectionIndex` is type 'bigint' not 'number'");
    throws(()=>new C(aUsual, eUsual, nUsual, -1, stUsual),
        begin + ": `sectionIndex` -1 is not gte 0");
    throws(()=>new C(aUsual, eUsual, nUsual, Number.MAX_SAFE_INTEGER + 2, stUsual), // or `+ 1` :-)
        begin + ": `sectionIndex` 9007199254740992 is not lte 9007199254740991");
    throws(()=>new C(aUsual, eUsual, nUsual, 33.44, stUsual),
        begin + ": `sectionIndex` 33.44 is not divisible by 1");

    // `status` should be one of the 4 valid strings.
    // @ts-expect-error
    throws(()=>new C(aUsual, eUsual, nUsual, siUsual, true),
        begin + ": `status` is type 'boolean' not 'string'");
    // @ts-expect-error
    throws(()=>new C(aUsual, eUsual, nUsual, siUsual, ''),
        begin + ": `status` '' is not in `options.is` 'FAIL:PASS:PENDING:UNE...XCEPTION'");
    // @ts-expect-error
    throws(()=>new C(aUsual, eUsual, nUsual, siUsual, 'Pass'),
        begin + ": `status` 'Pass' is not in `options.is` 'FAIL:PASS:PENDING:UNE...XCEPTION'");

    // `notes` should be a valid array of up to 100 strings, each to 120 characters long.
    // @ts-expect-error
    throws(()=>new C(aUsual, eUsual, true, siUsual, stUsual),
        begin + ": `notes` is type 'boolean' not an array");
    throws(()=>new C(aUsual, eUsual, ['1234567890'.repeat(12) + '1'], siUsual, stUsual),
        begin + ": `notes[0]` '123456789012345678901...45678901' is not max 120");
    throws(()=>new C(aUsual, eUsual, [...stUsual,'Backslash \\ not allowed'], siUsual, stUsual),
        begin + ": `notes[4]` 'Backslash %5C not allowed' fails " +
        "'Printable ASCII characters except backslashes'");

    // Instantiate a typical `Result`, and create its JSON representation.
    // The instance should `JSON.stringify()` as expected.
    const usual = new Result(
        aUsual,
        eUsual,
        nUsual,
        siUsual,
        stUsual,
    );
    const commonUsual = [
        `    "highlights": [`,
        `      {`,
        `        "kind": "BOOLNUM",`,
        `        "start": 6,`,
        `        "stop": 11`,
        `      }`,
        `    ],`,
        `    "text": "{ ok:\\"Café\\" }"`,
    ];
    const expectedUsual = toLines(
        `{`,
        `  "actually": {`,
        ...commonUsual,
        `  },`,
        `  "expected": {`,
        ...commonUsual,
        `  },`,
        `  "notes": "First line.\\nSecond Line.",`,
        `  "sectionIndex": 77,`,
        `  "status": "PASS"`,
        `}`,
    );
    equal(toStr(usual), expectedUsual);

    // A minimal `Result` should `JSON.stringify()` as expected.
    // @TODO

    // A maximal `Result` should `JSON.stringify()` as expected.
    // @TODO

    // It should not be possible to add a new property.
    // @ts-expect-error
    throws(()=>{usual.another = 'OOPS!'},
        /^.*property.+extensible\.?$/);

    // It should not be possible to modify properties.
    throws(()=>{usual.actually = eUsual},
        /read only|read-only|readonly/);
    throws(()=>{usual.expected = aUsual},
        /read only|read-only|readonly/);
    throws(()=>{usual.notes = 'This would be valid\n summary text'},
        /read only|read-only|readonly/);
    throws(()=>{usual.sectionIndex = 44},
        /read only|read-only|readonly/);
    throws(()=>{usual.status = 'PENDING'},
        /read only|read-only|readonly/);

    // It should not be possible to delete properties.
    throws(()=>{delete usual.actually},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.expected},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.notes},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.sectionIndex},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.status},
        /^.*delete.+property.*$|^.*property.+delete.*$/);

    // `isFrozen()` should return `true`, meaning that `freeze()` was used.
    // The instance should `JSON.stringify()` the same as before, which confirms
    // that none of the attempts to modify it worked.
    equal(Object.isFrozen(usual), true);
    equal(toStr(usual), expectedUsual);

    // The `actually` and `expected` properties should also be frozen.
    // @TODO

    // The `actually` and `expected` properties should not be the same objects
    // as their passed-in arguments. So, the arguments should not be frozen, and
    // modifying them after `new Result()` should not change the properties.
    // @TODO


    /* ------------------------------- clone() ------------------------------ */

    const clonedUsual = usual.clone();
    equal(toStr(clonedUsual), expectedUsual);
    equal(usual === clonedUsual, false); // not the same object

}
