import { aintaString } from '@0bdx/ainta';
import Highlight from './highlight.js';
import Renderable from './renderable/renderable.js';
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

    /** The test suite's title, usually rendered as a heading above the results.
     * - 0 to 64 printable ASCII characters, except the backslash `"\"`
     * - An empty string `""` means that a default should be used */
    title;

    /** ### A non-negative integer. The total number of failed tests.
     * @property {number} failTally */
    get failTally() { return this.#failTally };
    #failTally;

    /** ### A non-negative integer. The total number of passed tests.
     * @property {number} passTally */
    get passTally() { return this.#passTally };
    #passTally;

    /** ### A non-negative integer. The total number of tests not completed yet.
     * @property {number} pendingTally */
    get pendingTally() { return this.#pendingTally };
    #pendingTally;

    /** ### An array containing zero or more test results and sections.
     * @property {(Result|Section)[]} pendingTally */
    get resultsAndSections() { return [...this.#resultsAndSections] };
    #resultsAndSections;

    /** The current highest section index. Incremented by `addSection()`. */
    #currentSectionIndex;

    /** ### Creates an empty `Suite` instance with the supplied title.
     * 
     * @param {string} title
     *    The test suite's title, usually rendered as a heading above the results.
     *    - 0 to 64 printable ASCII characters, except the backslash `"\"`
     *    - An empty string `""` means that a default should be used
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(title) {
        const begin = 'new Suite()';

        // Validate the `title` argument, and then store it as a property.
        const aTitle = aintaString(title, 'title',
            { begin, min:0, max:64, rx:titleRx });
        if (aTitle) throw Error(aTitle);
        this.title = title;

        // Initialise the read-only properties.
        this.#currentSectionIndex = 0;
        this.#failTally = 0;
        this.#passTally = 0;
        this.#pendingTally = 0;
        this.#resultsAndSections = [];

        // Prevent this instance from being modified.
        Object.freeze(this);
    }

    /** ### Returns the suite's public properties as an object.
     *
     * JavaScript's `JSON.stringify()` looks for a function named `toJSON()` in
     * any object being serialized. If it exists, it serializes the return value
     * of `toJSON()`, instead of just writing "[object Object]".
     * 
     * @returns {{failTally:number, passTally:number, pendingTally:number,
     *           resultsAndSections:(Result|Section)[], title:string}}
     *    The public properties of `Suite`.
     */
    toJSON() {
        return ({
            failTally: this.failTally,
            passTally: this.passTally,
            pendingTally: this.pendingTally,
            resultsAndSections: this.resultsAndSections,
            title: this.title,
        });
    }

    /** ### Adds a new result to the test suite.
     * 
     * Note that the result will be automatically be assigned a section index,
     * based on the suite's current highest section index.
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
     * @param {'FAIL'|'PASS'|'PENDING'|'UNEXPECTED_EXCEPTION'} status
     *    A string (effectively an enum) which can be one of four values:
     *    - `"FAIL"` if the test failed (but not by `"UNEXPECTED_EXCEPTION"`)
     *    - `"PASS"` if the test passed
     *    - `"PENDING"` if the test has not completed yet
     *    - `"UNEXPECTED_EXCEPTION"` if the test threw an unexpected exception
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    addResult(
        actually,
        expected,
        notes,
        status,
    ) {
        // Try to instantiate a new `Result`. We want to throw an `Error` if any
        // of the arguments are invalid, before incrementing a tally.
        const result = new Result(
            actually,
            expected,
            notes,
            this.#currentSectionIndex, // sectionIndex
            status,
        );

        // Update one of the three tallies.
        switch (result.status) {
            case 'FAIL':
            case 'UNEXPECTED_EXCEPTION':
                this.#failTally += 1;
                break;
            case 'PASS':
                this.#passTally += 1;
                break;
            case 'PENDING':
                this.#pendingTally += 1;
                break;
        }

        // Add the new `Result` to the private `resultsAndSections` array.
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
        // Try to instantiate a new `Section`. We want to throw an `Error` if
        // `subtitle` is not valid, before incrementing `currentSectionIndex`.
        const section = new Section(
            this.#currentSectionIndex + 1,
            subtitle,
        );

        // Increment the current highest section index.
        this.#currentSectionIndex += 1;

        // Add the new `Section` to the private `resultsAndSections` array.
        this.#resultsAndSections.push(section);
    }
}


/* ---------------------------------- Tests --------------------------------- */

/** ### `Suite` unit tests.
 * 
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function suiteTest() {
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
    const C = Suite;
    const begin = `new ${C.name}()`; // "new Result()"

    // Define some typical, minimal and maximal valid values.
    const tUsual = 'The Cafe is ok.';
    // @TODO tMin
    // @TODO tMax

    // `title` should be a valid string, up to 64 characters long.
    // @ts-expect-error
    throws(()=>new C(),
        begin + ": `title` is type 'undefined' not 'string'");
    // @ts-expect-error
    throws(()=>new C(Symbol('nope')),
        begin + ": `title` is type 'symbol' not 'string'");
    throws(()=>new C('12345678'.repeat(8) + '9'),
        begin + ": `title` '123456781234567812345...23456789' is not max 64");
    throws(()=>new C(tUsual + '\\'),
        begin + ": `title` 'The Cafe is ok.%5C' fails " +
        "'Printable ASCII characters except backslashes'");
    throws(()=>new C(tUsual + '\n'),
        begin + ": `title` 'The Cafe is ok.%0A' fails " +
        "'Printable ASCII characters except backslashes'");

    // Instantiate a typical `Suite`, and create its JSON representation.
    // The instance should `JSON.stringify()` as expected.
    const usual = new Suite(tUsual);
    const expectedStringifiedUsual = toLines(
        `{`,
        `  "failTally": 0,`,
        `  "passTally": 0,`,
        `  "pendingTally": 0,`,
        `  "resultsAndSections": [],`,
        `  "title": "The Cafe is ok."`,
        `}`,
    );
    equal(toStr(usual), expectedStringifiedUsual);
/*
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
*/

    // A minimal `Result` should `JSON.stringify()` as expected.
    // @TODO

    // A maximal `Result` should `JSON.stringify()` as expected.
    // @TODO

    // It should not be possible to add a new property.
    // @ts-expect-error
    throws(()=>{usual.another = 'OOPS!'}, /^.*property.+extensible\.?$/);

    // It should not be possible to set scalar properties.
    throws(()=>{usual.title = 'This would be a valid title'}, /read only|read-only|readonly/);

    // It should not be possible to set scalar getter properties.
    // @TODO accept browser equivalents of the "...has only a getter" error message
    // @ts-expect-error
    throws(()=>{usual.failTally = 44}, /has only a getter/);
    // @ts-expect-error
    throws(()=>{usual.passTally = 44}, /has only a getter/);
    // @ts-expect-error
    throws(()=>{usual.pendingTally = 44}, /has only a getter/);

    // It should not be possible to set object getter properties.
    // @TODO accept browser equivalents of this error message
    // @ts-expect-error
    throws(()=>{usual.resultsAndSections = []},
        'Cannot set property resultsAndSections of #<Suite> which has only a getter');

    // It should not be possible to modify object getter properties.
    // @TODO check that browsers don't throw an error, either
    equal(usual.resultsAndSections.length, 0);
    usual.resultsAndSections.push(new Section(123, 'Should be using `addSection()` instead!'));
    equal(usual.resultsAndSections.length, 0);

    // It should not be possible to delete scalar properties.
    throws(()=>{delete usual.title}, /^.*delete.+property.*$|^.*property.+delete.*$/);

    // It should not be possible to delete scalar getter properties.
    // @TODO check that browsers don't throw an error, either
    equal(typeof usual.failTally + typeof usual.passTally + typeof usual.pendingTally, 'numbernumbernumber');
    // @ts-expect-error
    delete usual.failTally;
    // @ts-expect-error
    delete usual.passTally;
    // @ts-expect-error
    delete usual.pendingTally;
    equal(typeof usual.failTally + typeof usual.passTally + typeof usual.pendingTally, 'numbernumbernumber');

    // It should not be possible to delete object getter properties.
    // @TODO check that browsers don't throw an error, either
    equal(typeof usual.resultsAndSections, 'object');
    // @ts-expect-error
    delete usual.resultsAndSections;
    equal(typeof usual.resultsAndSections, 'object');
    equal(usual.resultsAndSections.length, 0);

    // `isFrozen()` should return `true`, meaning that `freeze()` was used.
    // The instance should `JSON.stringify()` the same as before, which confirms
    // that none of the attempts to modify it worked.
    equal(Object.isFrozen(usual), true);
    equal(toStr(usual), expectedStringifiedUsual);


    /* ------------------------------- Methods ------------------------------ */

    // `addResult()` should fail if any of the arguments are invalid.
    // @ts-expect-error
    throws(()=>usual.addResult(1, true, null),
        "new Result(): `actually` is type 'number' not 'object'\n" +
        "new Result(): `expected` is type 'boolean' not 'object'\n" +
        "new Result(): `notes` is null not an array\n" +
        "new Result(): `status` is type 'undefined' not 'string'");

    // `addResult()` should add a result to `resultsAndSections`, and increment
    // the correct tally.
    equal(usual.resultsAndSections.length, 0);
    equal(usual.passTally, 0);
    const renUsual = new Renderable([ new Highlight('BOOLNUM', 6, 11) ], '{ ok:"Café" }');
    equal(usual.addResult(renUsual, renUsual, ['The Cafe is','still ok.'], 'PASS'), void 0);
    equal(usual.resultsAndSections.length, 1);
    equal(usual.passTally, 1);
    equal(toStr(usual.resultsAndSections[0]),
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
        `  "notes": "The Cafe is\\nstill ok.",\n` +
        `  "sectionIndex": 0,\n` +
        `  "status": "PASS"\n` +
        `}`);

    // addSection() should fail if the `subtitle` argument is invalid.
    // @ts-expect-error
    throws(()=>usual.addSection(),
        "new Section(): `subtitle` is type 'undefined' not 'string'");
    throws(()=>usual.addSection(null),
        "new Section(): `subtitle` is null not type 'string'");

    // addSection() should add a valid section to resultsAndSections.
    equal(usual.resultsAndSections.length, 1);
    equal(usual.addSection('The 1st Section'), void 0);
    equal(usual.resultsAndSections.length, 2);
    equal(toStr(usual.resultsAndSections[1]),
        `{\n` +
        `  "index": 1,\n` +
        `  "subtitle": "The 1st Section"\n` +
        `}`);

    // An invalid `subtitle` argument should not increment the suite's private
    // `currentSectionIndex` property.
    // @ts-expect-error
    throws(()=>usual.addSection(123),
        "new Section(): `subtitle` is type 'number' not 'string'");

    // A second successful addSection() should have the expected index.
    equal(usual.resultsAndSections.length, 2);
    equal(usual.addSection('The 2nd Section'), void 0);
    equal(usual.resultsAndSections.length, 3);
    equal(toStr(usual.resultsAndSections[2]),
        `{\n` +
        `  "index": 2,\n` +
        `  "subtitle": "The 2nd Section"\n` +
        `}`);

    // After calling `addSection()`, a call to `addResult()` should be assigned
    // to the most recent section, and increment the correct tally.
    equal(usual.resultsAndSections.length, 3);
    equal(usual.failTally, 0);
    const renMin = new Renderable([], "''");
    equal(usual.addResult(renMin, renMin, [], 'UNEXPECTED_EXCEPTION'), void 0);
    equal(usual.resultsAndSections.length, 4);
    equal(usual.failTally, 1);
    equal(toStr(usual.resultsAndSections[3]),
        `{\n` +
        `  "actually": {\n` +
        `    "highlights": [],\n` +
        `    "text": "''"\n` +
        `  },\n` +
        `  "expected": {\n` +
        `    "highlights": [],\n` +
        `    "text": "''"\n` +
        `  },\n` +
        `  "notes": "",\n` +
        `  "sectionIndex": 2,\n` +
        `  "status": "UNEXPECTED_EXCEPTION"\n` +
        `}`);

}
