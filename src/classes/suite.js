import narrowAintas, { aintaArray, aintaNumber, aintaString } from '@0bdx/ainta';
import { Highlight, Renderable, Result, Section } from './index.js';

// Define a regular expression for validating `title`.
const titleRx = /^[ -\[\]-~]+$/;
titleRx.toString = () => "'Printable ASCII characters except backslashes'";

/** ### A container for test results.
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Dereferenced:__ object arguments are deep-cloned, to avoid back-refs
 * - __Frozen:__ all properties are read-only, and only change via method calls
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ all properties are validated by instantiation and method calls
 */
export default class Suite {

    /** A non-negative integer. The total number of failed tests. */
    failTally;

    /** A non-negative integer. The total number of passed tests. */
    passTally;

    /** A non-negative integer. The total number of tests not completed yet. */
    pendingTally;

    /** An array containing zero or more test results and sections. */
    resultsAndSections;

    /** The test suite's title, usually rendered as a heading above the results.
     * - 0 to 64 printable ASCII characters, except the backslash `"\"`
     * - An empty string `""` means that no title has been supplied */
    title;

    /** ### Creates a `Suite` instance from the supplied arguments.
     * 
     * @param {number} failTally
     *    A non-negative integer. The total number of failed tests.
     * @param {number} passTally
     *    A non-negative integer. The total number of passed tests.
     * @param {number} pendingTally
     *    A non-negative integer. The total number of tests not completed yet.
     * @param {(Result|Section)[]} resultsAndSections
     *    An array containing zero or more test results and sections.
     * @param {string} title
     *    The test suite's title, usually rendered as a heading above the results.
     *    - 0 to 64 printable ASCII characters, except the backslash `"\"`
     *    - An empty string `""` means that no title has been supplied
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(
        failTally,
        passTally,
        pendingTally,
        resultsAndSections,
        title,
    ) {
        const begin = 'new Suite()';

        // Validate each argument.
        const [ aResults, aArr, aNum, aStr ] =
            narrowAintas({ begin, gte:0, lte:Number.MAX_SAFE_INTEGER, mod:1 },
            aintaArray, aintaNumber, aintaString);
        aNum(failTally, 'failTally');
        aNum(passTally, 'passTally');
        aNum(pendingTally, 'pendingTally');
        aArr(resultsAndSections, 'resultsAndSections', { is:[Result,Section] });
        aStr(title, 'title', { min:0, max:64, rx:titleRx });
        if (aResults.length) throw Error(aResults.join('\n'));

        // Check that the fail, pass and pending tallies agree with the results.
        const [ foundFails, foundPasses, foundPending ] = resultsAndSections
            .filter(rs => rs instanceof Result)
            .reduce(
                ([ fails, passes, pending ], /** @type Result */ rs) => [
                    fails + +(rs.status !== 'PASS' && rs.status !== 'PENDING'),
                    passes + +(rs.status === 'PASS'),
                    pending + +(rs.status === 'PENDING'),
                ],
                [0, 0, 0]
            );
        if (foundFails !== failTally) throw Error(`${begin}: \`failTally\` ${
            failTally} !== ${foundFails} fails found in \`resultsAndSections\``);
        if (foundPasses !== passTally) throw Error(`${begin}: \`passTally\` ${
            passTally} !== ${foundPasses} passes found in \`resultsAndSections\``);
        if (foundPending !== pendingTally) throw Error(`${begin}: \`pendingTally\` ${
            pendingTally} !== ${foundPending} pending found in \`resultsAndSections\``);

        // @TODO Check that every result's `sectionIndex` refers to a `Section` instance in `resultsAndSections`.
        // @TODO Note that empty sections are allowed.

        // Store the validated arguments as properties.
        this.failTally = failTally;
        this.passTally = passTally;
        this.pendingTally = pendingTally;
        this.resultsAndSections = resultsAndSections;
        this.title = title;

        // Prevent this instance from being modified.
        Object.freeze(this);
    }
}


/* ---------------------------------- Tests --------------------------------- */

/**
 * ### `Suite` unit tests.
 * 
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function suiteTest() {
    const e2l = e => (e.stack.split('\n')[1].match(/([^\/]+\.js:\d+):\d+\)?$/)||[])[1];
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
    const C = Suite;
    const begin = `new ${C.name}()`; // "new Result()"

    // Define some typical, minimal and maximal valid values.
    const fUsual = 0;
    const paUsual = 1;
    const peUsual = 0;
    const rsUsual = [
        new Result(
            new Renderable(
                [ new Highlight('BOOLNUM', 6, 11) ],
                '{ ok:"Café" }',
            ),
            new Renderable(
                [ new Highlight('BOOLNUM', 6, 11) ],
                '{ ok:"Café" }',
            ),
            77,
            'PASS',
            'The Cafe is ok.',
        )
    ];
    const tUsual = 'The Cafe is ok.';
    // @TODO *Min
    // @TODO *Max

    // Instantiating with all arguments invalid should fail.
    // @TODO more tests
    // @ts-expect-error
    throws(()=>new C(),
        begin + ": `failTally` is type 'undefined' not 'number'\n" +
        begin + ": `passTally` is type 'undefined' not 'number'\n" +
        begin + ": `pendingTally` is type 'undefined' not 'number'\n" +
        begin + ": `resultsAndSections` is type 'undefined' not an array\n" +
        begin + ": `title` is type 'undefined' not 'string'");

    // `failTally` should be a valid non-negative integer.
    // @ts-expect-error
    throws(()=>new C(BigInt(2), paUsual, peUsual, rsUsual, tUsual),
        begin + ": `failTally` is type 'bigint' not 'number'");
    throws(()=>new C(-1, paUsual, peUsual, rsUsual, tUsual),
        begin + ": `failTally` -1 is not gte 0");
    throws(()=>new C(Number.MAX_SAFE_INTEGER + 2, paUsual, peUsual, rsUsual, tUsual), // or `+ 1` :-)
        begin + ": `failTally` 9007199254740992 is not lte 9007199254740991");
    throws(()=>new C(33.44, paUsual, peUsual, rsUsual, tUsual),
        begin + ": `failTally` 33.44 is not divisible by 1");

    // `passTally` should be a valid non-negative integer.
    // @ts-expect-error
    throws(()=>new C(fUsual, '2', peUsual, rsUsual, tUsual),
        begin + ": `passTally` is type 'string' not 'number'");
    throws(()=>new C(fUsual, -1, peUsual, rsUsual, tUsual),
        begin + ": `passTally` -1 is not gte 0");
    throws(()=>new C(fUsual, Number.MAX_SAFE_INTEGER + 2, peUsual, rsUsual, tUsual),
        begin + ": `passTally` 9007199254740992 is not lte 9007199254740991");
    throws(()=>new C(fUsual, 33.44, peUsual, rsUsual, tUsual),
        begin + ": `passTally` 33.44 is not divisible by 1");

    // `pendingTally` should be a valid non-negative integer.
    // @ts-expect-error
    throws(()=>new C(fUsual, paUsual, [], rsUsual, tUsual),
        begin + ": `pendingTally` is an array not type 'number'");
    throws(()=>new C(fUsual, paUsual, -1, rsUsual, tUsual),
        begin + ": `pendingTally` -1 is not gte 0");
    throws(()=>new C(fUsual, paUsual, Number.MAX_SAFE_INTEGER + 2, rsUsual, tUsual),
        begin + ": `pendingTally` 9007199254740992 is not lte 9007199254740991");
    throws(()=>new C(fUsual, paUsual, 33.44, rsUsual, tUsual),
        begin + ": `pendingTally` 33.44 is not divisible by 1");

    // `resultsAndSections` should be a mixed array of `Result` and `Section` instances.
    // @ts-expect-error
    throws(()=>new C(fUsual, paUsual, peUsual, {}, tUsual),
        begin + ": `resultsAndSections` is type 'object' not an array");
    // // @ts-expect-error
    // throws(()=>new C(fUsual, paUsual, peUsual, [Result, Section], tUsual), // @TODO add `is` to `schema` to detect this situation
    //     begin + ": `resultsAndSections[0]` is type 'function' not object");
    // @ts-expect-error
    throws(()=>new C(fUsual, paUsual, peUsual, [...rsUsual, {}], tUsual),
        begin + ": `resultsAndSections[1]` is not in `options.is` 'Result:Section'");

    // `title` should be a valid string, up to 64 characters long.
    // @ts-expect-error
    throws(()=>new C(fUsual, paUsual, peUsual, rsUsual, Symbol('nope')),
        begin + ": `title` is type 'symbol' not 'string'");
    throws(()=>new C(fUsual, paUsual, peUsual, rsUsual, '12345678'.repeat(8) + '9'),
        begin + ": `title` '123456781234567812345...23456789' is not max 64");
    throws(()=>new C(fUsual, paUsual, peUsual, rsUsual, tUsual + '\\'),
        begin + ": `title` 'The Cafe is ok.%5C' fails " +
        "'Printable ASCII characters except backslashes'");
    throws(()=>new C(fUsual, paUsual, peUsual, rsUsual, tUsual + '\n'),
        begin + ": `title` 'The Cafe is ok.%0A' fails " +
        "'Printable ASCII characters except backslashes'");

    // `failTally`, `passTally` and `pendingTally` should all agree with the
    // `Result` instances in `resultsAndSections`.
    throws(()=>new C(fUsual+1, paUsual, peUsual, rsUsual, 'bad fail'),
        begin + ": `failTally` 1 !== 0 fails found in `resultsAndSections`");
    throws(()=>new C(fUsual, paUsual+1, peUsual, rsUsual, 'bad pass'),
        begin + ": `passTally` 2 !== 1 passes found in `resultsAndSections`");
    throws(()=>new C(fUsual, paUsual, peUsual+1, rsUsual, 'bad pending'),
        begin + ": `pendingTally` 1 !== 0 pending found in `resultsAndSections`");

    // @TODO test that an Error is thrown when a result's `sectionIndex` does not exist. Empty sections are ok.

    // Instantiate a typical `Suite`, and create its JSON representation.
    // The instance should `JSON.stringify()` as expected.
    const usual = new Suite(
        fUsual,
        paUsual,
        peUsual,
        rsUsual,
        tUsual,
    );
    const commonUsual = [
        `        "highlights": [`,
        `          {`,
        `            "kind": "BOOLNUM",`,
        `            "start": 6,`,
        `            "stop": 11`,
        `          }`,
        `        ],`,
        `        "text": "{ ok:\\"Café\\" }"`,
    ];
    const expectedUsual = toLines(
        `{`,
        `  "failTally": 0,`,
        `  "passTally": 1,`,
        `  "pendingTally": 0,`,
        `  "resultsAndSections": [`,
        `    {`,
        `      "actually": {`,
        ...commonUsual,
        `      },`,
        `      "expected": {`,
        ...commonUsual,
        `      },`,
        `      "sectionIndex": 77,`,
        `      "status": "PASS",`,
        `      "summary": "The Cafe is ok."`,
        `    }`,
        `  ],`,
        `  "title": "The Cafe is ok."`,
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
    throws(()=>{usual.failTally = 44},
        /read only|read-only|readonly/);
    throws(()=>{usual.passTally = 44},
        /read only|read-only|readonly/);
    throws(()=>{usual.resultsAndSections = []},
        /read only|read-only|readonly/);
    throws(()=>{usual.title = 'This would be a valid title'},
        /read only|read-only|readonly/);

    // It should not be possible to delete properties.
    throws(()=>{delete usual.failTally},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.passTally},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.resultsAndSections},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.title},
        /^.*delete.+property.*$|^.*property.+delete.*$/);

    // `isFrozen()` should return `true`, meaning that `freeze()` was used.
    // The instance should `JSON.stringify()` the same as before, which confirms
    // that none of the attempts to modify it worked.
    equal(Object.isFrozen(usual), true);
    equal(toStr(usual), expectedUsual);

    // The `resultsAndSections` property should also be frozen.
    // @TODO

    // The `resultsAndSections` property should not be the same object as its
    // passed-in argument. So, the argument should not be frozen, and modifying
    // it after `new Suite()` or method calls should not change the property.
    // @TODO
}
