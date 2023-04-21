import narrowAintas, { aintaArray, aintaNumber, aintaObject, aintaString }
    from '@0bdx/ainta';
import Highlight from './highlight.js';
import Renderable from './renderable.js';
import Result from './result.js';
import Section from './section.js';

// Define a regular expression for validating `title`.
const titleRx = /^[ -\[\]-~]*$/;
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

    /** The test suite's title, usually rendered as a heading above the results.
     * - 0 to 64 printable ASCII characters, except the backslash `"\"`
     * - An empty string `""` means that a default should be used */
    title;

    /** An array containing zero or more test results and sections. */
    #resultsAndSections;
    get resultsAndSections() { return [...this.#resultsAndSections] };

    /** The current highest section index. Incremented by `addSection()`. */
    #currentSectionIndex;

    /** ### Creates a `Suite` instance from the supplied arguments.
     * 
     * @param {number} failTally
     *    A non-negative integer. The total number of failed tests.
     * @param {number} passTally
     *    A non-negative integer. The total number of passed tests.
     * @param {number} pendingTally
     *    A non-negative integer. The total number of tests not completed yet.
     * @param {string} title
     *    The test suite's title, usually rendered as a heading above the results.
     *    - 0 to 64 printable ASCII characters, except the backslash `"\"`
     *    - An empty string `""` means that a default should be used
     * @param {(Result|Section)[]} resultsAndSections
     *    An array containing zero or more test results and sections.
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(
        failTally,
        passTally,
        pendingTally,
        title,
        resultsAndSections,
    ) {
        const begin = 'new Suite()';

        // Validate each argument.
        const [ aResults, aArr, aNum, aStr ] =
            narrowAintas({ begin, gte:0, lte:Number.MAX_SAFE_INTEGER, mod:1 },
            aintaArray, aintaNumber, aintaString);
        aNum(failTally, 'failTally');
        aNum(passTally, 'passTally');
        aNum(pendingTally, 'pendingTally');
        aStr(title, 'title', { min:0, max:64, rx:titleRx });
        aArr(resultsAndSections, 'resultsAndSections', { is:[Result,Section] });
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

        // Store the validated scalar arguments as properties.
        this.failTally = failTally;
        this.passTally = passTally;
        this.pendingTally = pendingTally;
        this.title = title;

        // Store the validated object argument as a private property.
        this.#resultsAndSections = resultsAndSections;

        // Store the current highest section index as a private property.
        // @TODO test that this is working
        this.#currentSectionIndex = resultsAndSections
            .filter(ras => ras instanceof Section)
            .reduce((max, /** @type Section */{ index }) =>
                index > max ? index : max, 0);

        // Prevent this instance from being modified.
        Object.freeze(this);
    }

    /** ### Returns the suite's public properties as an object.
     *
     * JavaScript's `JSON.stringify()` looks for a function named `toJSON()` in
     * any object being serialized. If it exists, it serializes the return value
     * of `toJSON()`, instead of just writing "[object Object]".
     * 
     * @returns {Suite}
     *    The public properties of `Suite`.
     */
    toJSON() {
        return ({ ...this, resultsAndSections:this.resultsAndSections });
    }

    /** ### Adds a result to the test suite.
     * 
     * @param {Result} result
     *    The `Result` instance to add.
     */
    addResult(result) {

        // Validate the `result` argument.
        const aResult = aintaObject(result, 'result',
            { begin:'addResult()', is:[Result], open:true });
        if (aResult) throw Error(aResult);

        // Add the `Result` instance to the private `resultsAndSections` array.
        this.#resultsAndSections.push(result);
    }

    /** ### Adds a new section to the test suite.
     * 
     * @param {string} subtitle
     *    The section title, usually rendered as a sub-heading in the results.
     *    - 1 to 64 printable ASCII characters, except the backslash `"\"`
     * @returns {void}
     *    Does not return anything.
     * @throws
     *    Throws an `Error` if `subtitle` or the `this` context are invalid.
     */
    addSection(subtitle) {
        // Try to instantiate a new `Section`. This will throw an `Error` if
        // `subtitle` is not valid.
        const section = new Section(
            this.#currentSectionIndex + 1,
            subtitle,
        );

        // Increment the current highest section index.
        this.#currentSectionIndex += 1;

        // Add a new `Section` to the private `resultsAndSections` array.
        this.#resultsAndSections.push(section);
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
    const tUsual = 'The Cafe is ok.';
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
    // @TODO *Min
    // @TODO *Max

    // Instantiating with all arguments invalid should fail.
    // @TODO more tests
    // @ts-expect-error
    throws(()=>new C(),
        begin + ": `failTally` is type 'undefined' not 'number'\n" +
        begin + ": `passTally` is type 'undefined' not 'number'\n" +
        begin + ": `pendingTally` is type 'undefined' not 'number'\n" +
        begin + ": `title` is type 'undefined' not 'string'\n" +
        begin + ": `resultsAndSections` is type 'undefined' not an array");

    // `failTally` should be a valid non-negative integer.
    // @ts-expect-error
    throws(()=>new C(BigInt(2), paUsual, peUsual, tUsual, rsUsual),
        begin + ": `failTally` is type 'bigint' not 'number'");
    throws(()=>new C(-1, paUsual, peUsual, tUsual, rsUsual),
        begin + ": `failTally` -1 is not gte 0");
    throws(()=>new C(Number.MAX_SAFE_INTEGER + 2, paUsual, peUsual, tUsual, rsUsual), // or `+ 1` :-)
        begin + ": `failTally` 9007199254740992 is not lte 9007199254740991");
    throws(()=>new C(33.44, paUsual, peUsual, tUsual, rsUsual),
        begin + ": `failTally` 33.44 is not divisible by 1");

    // `passTally` should be a valid non-negative integer.
    // @ts-expect-error
    throws(()=>new C(fUsual, '2', peUsual, tUsual, rsUsual),
        begin + ": `passTally` is type 'string' not 'number'");
    throws(()=>new C(fUsual, -1, peUsual, tUsual, rsUsual),
        begin + ": `passTally` -1 is not gte 0");
    throws(()=>new C(fUsual, Number.MAX_SAFE_INTEGER + 2, peUsual, tUsual, rsUsual),
        begin + ": `passTally` 9007199254740992 is not lte 9007199254740991");
    throws(()=>new C(fUsual, 33.44, peUsual, tUsual, rsUsual),
        begin + ": `passTally` 33.44 is not divisible by 1");

    // `pendingTally` should be a valid non-negative integer.
    // @ts-expect-error
    throws(()=>new C(fUsual, paUsual, [], tUsual, rsUsual),
        begin + ": `pendingTally` is an array not type 'number'");
    throws(()=>new C(fUsual, paUsual, -1, tUsual, rsUsual),
        begin + ": `pendingTally` -1 is not gte 0");
    throws(()=>new C(fUsual, paUsual, Number.MAX_SAFE_INTEGER + 2, tUsual, rsUsual),
        begin + ": `pendingTally` 9007199254740992 is not lte 9007199254740991");
    throws(()=>new C(fUsual, paUsual, 33.44, tUsual, rsUsual),
        begin + ": `pendingTally` 33.44 is not divisible by 1");

    // `title` should be a valid string, up to 64 characters long.
    // @ts-expect-error
    throws(()=>new C(fUsual, paUsual, peUsual, Symbol('nope'), rsUsual),
        begin + ": `title` is type 'symbol' not 'string'");
    throws(()=>new C(fUsual, paUsual, peUsual, '12345678'.repeat(8) + '9', rsUsual),
        begin + ": `title` '123456781234567812345...23456789' is not max 64");
    throws(()=>new C(fUsual, paUsual, peUsual, tUsual + '\\', rsUsual),
        begin + ": `title` 'The Cafe is ok.%5C' fails " +
        "'Printable ASCII characters except backslashes'");
    throws(()=>new C(fUsual, paUsual, peUsual, tUsual + '\n', rsUsual),
        begin + ": `title` 'The Cafe is ok.%0A' fails " +
        "'Printable ASCII characters except backslashes'");

    // `resultsAndSections` should be a mixed array of `Result` and `Section` instances.
    // @ts-expect-error
    throws(()=>new C(fUsual, paUsual, peUsual, tUsual, {}),
        begin + ": `resultsAndSections` is type 'object' not an array");
    // @TODO add `is` to `schema` to detect the following situation:
    // // @ts-expect-error
    // throws(()=>new C(fUsual, paUsual, peUsual, tUsual, [Result, Section]),
    //     begin + ": `resultsAndSections[0]` is type 'function' not object");
    // @ts-expect-error
    throws(()=>new C(fUsual, paUsual, peUsual, tUsual, [...rsUsual, {}]),
        begin + ": `resultsAndSections[1]` is not in `options.is` 'Result:Section'");

    // `failTally`, `passTally` and `pendingTally` should all agree with the
    // `Result` instances in `resultsAndSections`.
    throws(()=>new C(fUsual+1, paUsual, peUsual, 'bad fail', rsUsual),
        begin + ": `failTally` 1 !== 0 fails found in `resultsAndSections`");
    throws(()=>new C(fUsual, paUsual+1, peUsual, 'bad pass', rsUsual),
        begin + ": `passTally` 2 !== 1 passes found in `resultsAndSections`");
    throws(()=>new C(fUsual, paUsual, peUsual+1, 'bad pending', rsUsual),
        begin + ": `pendingTally` 1 !== 0 pending found in `resultsAndSections`");

    // @TODO test that an Error is thrown when a result's `sectionIndex` does not exist. Empty sections are ok.

    // Instantiate a typical `Suite`, and create its JSON representation.
    // The instance should `JSON.stringify()` as expected.
    const usual = new Suite(
        fUsual,
        paUsual,
        peUsual,
        tUsual,
        rsUsual,
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
        `  "title": "The Cafe is ok.",`,
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
        `  ]`,
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

    // It should not be possible to set scalar properties.
    throws(()=>{usual.failTally = 44},
        /read only|read-only|readonly/);
    throws(()=>{usual.passTally = 44},
        /read only|read-only|readonly/);
    throws(()=>{usual.title = 'This would be a valid title'},
        /read only|read-only|readonly/);

    // It should not be possible to set object properties.
    // @TODO accept browser equivalents of this error message
    // @ts-expect-error
    throws(()=>{usual.resultsAndSections = []},
        'Cannot set property resultsAndSections of #<Suite> which has only a getter');

    // It should not be possible to modify object properties.
    // @TODO check that browsers don't throw an error, either
    equal(usual.resultsAndSections.length, 1);
    usual.resultsAndSections.push(
        new Section(123, 'Should be using `addSection()` instead!'));
    equal(usual.resultsAndSections.length, 1);

    // The `resultsAndSections` property should not be the same object as its
    // passed-in argument. So, the argument should not be frozen, and modifying
    // it after `new Suite()` or method calls should not change the property.
    // @TODO

    // It should not be possible to delete scalar properties.
    throws(()=>{delete usual.failTally},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.passTally},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.title},
        /^.*delete.+property.*$|^.*property.+delete.*$/);

    // It should not be possible to delete object properties.
    // @TODO check that browsers don't throw an error, either
    equal(typeof usual.resultsAndSections, 'object');
    // @ts-expect-error
    delete usual.resultsAndSections;
    equal(typeof usual.resultsAndSections, 'object');
    equal(usual.resultsAndSections.length, 1);

    // `isFrozen()` should return `true`, meaning that `freeze()` was used.
    // The instance should `JSON.stringify()` the same as before, which confirms
    // that none of the attempts to modify it worked.
    equal(Object.isFrozen(usual), true);
    equal(toStr(usual), expectedUsual);


    /* ------------------------------- Methods ------------------------------ */

    // addResult() should fail if the `section` argument is invalid.
    // @ts-expect-error
    throws(()=>usual.addResult(),
        "addResult(): `result` is type 'undefined' not 'object'");
    // @ts-expect-error
    throws(()=>usual.addResult([]),
        "addResult(): `result` is an array not a regular object");

    // addResult() should add a valid section to resultsAndSections.
    equal(usual.resultsAndSections.length, 1);
    const secondResult = rsUsual[0];
    equal(usual.addResult(secondResult), void 0);
    equal(usual.resultsAndSections.length, 2);
    equal(toStr(usual.resultsAndSections[1]),
        `{\n` +
        `  "actually": {\n` +
        `    "highlights": [\n` +
        `      {\n` +
        `        "kind": "BOOLNUM",\n` +
        `        "start": 6,\n` +
        `        "stop": 11\n` +
        `      }\n` +
        `    ],\n` +
        `    "text": "{ ok:\\"Café\\" }"\n` +
        `  },\n` +
        `  "expected": {\n` +
        `    "highlights": [\n` +
        `      {\n` +
        `        "kind": "BOOLNUM",\n` +
        `        "start": 6,\n` +
        `        "stop": 11\n` +
        `      }\n` +
        `    ],\n` +
        `    "text": "{ ok:\\"Café\\" }"\n` +
        `  },\n` +
        `  "sectionIndex": 77,\n` +
        `  "status": "PASS",\n` +
        `  "summary": "The Cafe is ok."\n` +
        `}`);
    equal(usual.resultsAndSections[1], secondResult);

    // addSection() should fail if the `subtitle` argument is invalid.
    // @ts-expect-error
    throws(()=>usual.addSection(),
        "new Section(): `subtitle` is type 'undefined' not 'string'");
    throws(()=>usual.addSection(null),
        "new Section(): `subtitle` is null not type 'string'");

    // addSection() should add a valid section to resultsAndSections.
    equal(usual.resultsAndSections.length, 2);
    equal(usual.addSection('The 1st Section'), void 0);
    equal(toStr(usual.resultsAndSections[2]),
        `{\n` +
        `  "index": 1,\n` +
        `  "subtitle": "The 1st Section"\n` +
        `}`);
    equal(usual.resultsAndSections.length, 3);

    // An invalid `subtitle` argument should not increment the suite's private
    // `currentSectionIndex` property.
    // @ts-expect-error
    throws(()=>usual.addSection(123),
        "new Section(): `subtitle` is type 'number' not 'string'");

    // A second successful addSection() should have the expected index.
    equal(usual.resultsAndSections.length, 3);
    equal(usual.addSection('The 2nd Section'), void 0);
    equal(toStr(usual.resultsAndSections[3]),
        `{\n` +
        `  "index": 2,\n` +
        `  "subtitle": "The 2nd Section"\n` +
        `}`);
    equal(usual.resultsAndSections.length, 4);

}
