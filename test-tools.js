/**
 * https://www.npmjs.com/package/@0bdx/test-tools
 * @version 0.0.1
 * @license Copyright (c) 2023 0bdx <0@0bdx.com> (0bdx.com)
 * SPDX-License-Identifier: MIT
 */
import narrowAintas, { aintaNumber, aintaString, aintaArray, aintaObject } from '@0bdx/ainta';

// Define an enum for validating `kind`.
const validKind = [ 'ARRAY', 'BOOLNUM', 'DOM', 'ERROR', 'EXCEPTION',
    'FUNCTION', 'NULLISH', 'OBJECT', 'STRING', 'SYMBOL' ];

/** ### A single 'stroke of the highlighter pen' when rendering JS values.
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Frozen:__ all properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ all properties are validated during instantiation
 */
class Highlight {

    /** How the value should be rendered.
     * - Booleans and numbers highlight the same way
     * - A `BigInt` is a number rendered with the `"n"` suffix
     * - A `RegExp` highlights like an `Object` but looks like `/a/` not `{}` */
    kind;

    /** A non-negative integer. The position that highlighting starts. */
    start;

    /** A non-zero integer greater than `start`, where highlighting stops. */
    stop;

    /** ### Creates a `Highlight` instance from the supplied arguments.
     * 
     * @param {'ARRAY'|'BOOLNUM'|'DOM'|'ERROR'|'EXCEPTION'|
     *         'FUNCTION'|'NULLISH'|'OBJECT'|'STRING'|'SYMBOL'} kind
     *    How the value should be rendered.
     *    - Booleans and numbers highlight the same way
     *    - A `BigInt` is a number rendered with the `"n"` suffix
     *    - A `RegExp` highlights like an `Object` but looks like `/a/` not `{}`
     * @param {number} start
     *    A non-negative integer. The position that highlighting starts.
     * @param {number} stop
     *    A non-zero integer greater than `start`, where highlighting stops.
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(
        kind,
        start,
        stop,
    ) {
        const begin = 'new Highlight()';

        // Validate each argument.
        const [ aResults, aNum, aStr ] = narrowAintas(
            { begin, mod:1 },
            aintaNumber, aintaString);
        aStr(kind, 'kind', { is:validKind });
        aNum(start, 'start', { gte:0, lte:Number.MAX_SAFE_INTEGER - 1 });
        aNum(stop, 'stop', { gte:1, lte:Number.MAX_SAFE_INTEGER });
        if (aResults.length) throw Error(aResults.join('\n'));

        // Check that the stop position is after the start position.
        const aStop = aintaNumber(stop, 'stop', { begin, gte:start + 1 });
        if (aStop) throw Error(aStop);

        // Store the validated arguments as properties.
        this.kind = kind;
        this.start = start;
        this.stop = stop;

        // Prevent this instance from being modified.
        Object.freeze(this);
    }

}

/** ### A representation of a JavaScript value, ready to render.
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Dereferenced:__ object arguments are deep-cloned, to avoid back-refs
 * - __Frozen:__ both properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ both properties are validated during instantiation
 */
class Renderable {

    /** Zero or more 'strokes of the highlighter pen' on `text`. */
    highlights;

    /** A string representation of the value, truncated to a maximum length.
     * - 1 to 64 unicode characters */
    text;

    /** ### Creates a `Renderable` instance from the supplied arguments.
     * 
     * @param {Highlight[]} highlights
     *    Zero or more 'strokes of the highlighter pen' on `text`.
     * @param {string} text
     *    A string representation of the value, truncated to a maximum length.
     *    - 1 to 64 unicode characters `"\"`
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(
        highlights,
        text,
    ) {
        const begin = 'new Renderable()';

        // Validate each argument.
        const [ aResults, aArr, aStr ] =
            narrowAintas({ begin }, aintaArray, aintaString);
        aArr(highlights, 'highlights', { is:[Highlight] });
        aStr(text, 'text', { min:1, max:64 });
        if (aResults.length) throw Error(aResults.join('\n'));

        // @TODO check that none of the Highlights overlap
        // @TODO and that they don't extend beyond the end of `text`

        // Store the validated arguments as properties.
        this.highlights = highlights;
        this.text = text;

        // Prevent this instance from being modified.
        Object.freeze(this);
    }

}

// Define a regular expression for validating `summary`.
const summaryRx = /^[ -\[\]-~]+$/;
summaryRx.toString = () => "'Printable ASCII characters except backslashes'";

// Define an enum for validating `status`.
const validStatus = [ 'FAIL', 'PASS', 'PENDING', 'UNEXPECTED_EXCEPTION' ];

/** ### Records the outcome of one test.
 *
 * - __Dereferenced:__ object arguments are deep-cloned, to avoid back-refs
 * - __Frozen:__ all properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ all properties are validated during instantiation
 */
class Result {

    /** A representation of the value that the test actually got, ready to
     * render. This could be the representation of an unexpected exception. */
    actually;

    /** A representation of the value that the test expected, ready to render. */
    expected;

    /** The index of the `Section` that the test belongs to. Zero if it should
     * be rendered before the first section, or if there are no sections. */
    sectionIndex;

    /** A string (effectively an enum) which can be one of four values:
     * - `"FAIL"` if the test failed (but not by `"UNEXPECTED_EXCEPTION"`)
     * - `"PASS"` if the test passed
     * - `"PENDING"` if the test has not completed yet
     * - `"UNEXPECTED_EXCEPTION"` if the test threw an unexpected exception */
    status;

    /** A description of the test.
     * - An empty string `""` means that no summary has been supplied */
    summary;

    /** ### Creates a `Result` instance from the supplied arguments.
     * 
     * @param {Renderable} actually
     *    A representation of the value that the test actually got, ready to
     *    render. This could be the representation of an unexpected exception.
     * @param {Renderable} expected
     *    A representation of the value that the test expected, ready to render.
     * @param {number} sectionIndex
     *    The index of the `Section` that the test belongs to. Zero if it should
     *    be rendered before the first section, or if there are no sections.
     * @param {'FAIL'|'PASS'|'PENDING'|'UNEXPECTED_EXCEPTION'} status
     *    A string (effectively an enum) which can be one of four values:
     *    - `"FAIL"` if the test failed (but not by `"UNEXPECTED_EXCEPTION"`)
     *    - `"PASS"` if the test passed
     *    - `"PENDING"` if the test has not completed yet
     *    - `"UNEXPECTED_EXCEPTION"` if the test threw an unexpected exception
     * @param {string} summary
     *    A description of the test.
     *    - An empty string `""` means that no summary has been supplied
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(
        actually,
        expected,
        sectionIndex,
        status,
        summary,
    ) {
        const begin = 'new Result()';

        // Validate each argument.
        const [ aResults, aObj, aNum, aStr ] =
            narrowAintas({ begin }, aintaObject, aintaNumber, aintaString);
        aObj(actually, 'actually', { is:[Renderable], open:true });
        aObj(expected, 'expected', { is:[Renderable], open:true });
        aNum(sectionIndex, 'sectionIndex', {
            gte:1, lte:Number.MAX_SAFE_INTEGER, mod:1 });
        aStr(status, 'status', { is:validStatus });
        aStr(summary, 'summary', { min:0, max:64, rx:summaryRx });
        if (aResults.length) throw Error(aResults.join('\n'));

        // Store the validated arguments as properties.
        this.actually = actually;
        this.expected = expected;
        this.sectionIndex = sectionIndex;
        this.status = status;
        this.summary = summary;

        // Prevent this instance from being modified.
        Object.freeze(this);
    }

}

// Define a regular expression for validating `subtitle`.
const subtitleRx = /^[ -\[\]-~]*$/;
subtitleRx.toString = () => "'Printable ASCII characters except backslashes'";

/** ### Marks the start of a new section in the test suite.
 *
 * - __Frozen:__ both properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ both properties are validated during instantiation
 */
class Section {

    /** A non-zero positive integer. The first Section is 1, the second is 2. */
    index;

    /** The section title, usually rendered as a sub-heading in the results.
     * - 0 to 64 printable ASCII characters, except the backslash `"\"`
     * - An empty string `""` means that a default should be used */
    subtitle;

    /** ### Creates a `Section` instance from the supplied arguments.
     * 
     * @param {number} index
     *    A non-zero positive integer. The first Section is 1, the second is 2.
     * @param {string} subtitle
     *    The section title, usually rendered as a sub-heading in the results.
     *    - 1 to 64 printable ASCII characters, except the backslash `"\"`
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(
        index,
        subtitle,
    ) {
        const begin = 'new Section()';

        // Validate each argument.
        const [ aResults, aNum, aStr ] =
            narrowAintas({ begin }, aintaNumber, aintaString);
        aNum(index, 'index', { gte:1, lte:Number.MAX_SAFE_INTEGER, mod:1 });
        aStr(subtitle, 'subtitle', { min:0, max:64, rx:subtitleRx });
        if (aResults.length) throw Error(aResults.join('\n'));

        // Store the validated arguments as properties.
        this.index = index;
        this.subtitle = subtitle;

        // Prevent this instance from being modified.
        Object.freeze(this);
    }

}

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
class Suite {

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

/** ### Binds various test tools to a shared `Suite` instance.
 * 
 * Takes an existing `Suite` or creates a new one, binds any number of functions
 * to it, and returns those functions in an array. Each function can then access
 * the shared `Suite` instance using the `this` keyword.
 *
 * This pattern of dependency injection allows lots of flexibility, and works
 * well with Rollup's tree shaking.
 *
 * @example
 * import bindTestTools, { addSection, isEqual, renderAnsi }
 *     from '@0bdx/test-tools';
 *
 * // Give the test suite a title, and bind some functions to it.
 * const [ section,    isEq,    render ] = bindTestTools('Mathsy Test Suite',
 *         addSection, isEqual, renderAnsi);
 *
 * // Optionally, begin a new addSection.
 * section('Check that factorialise() works');
 *
 * // Run the tests. The third argument, `description`, is optional.
 * isEq(factorialise(0), 1);
 * isEq(factorialise(5), 120,
 *     'factorialise(5) // 5! = 5 * 4 * 3 * 2 * 1');
 *
 * // Output the test results to the console, using ANSI colours.
 * console.log(render());
 *
 * function factorialise(n) {
 *     if (n === 0 || n === 1) return 1;
 *     for (let i=n-1; i>0; i--) n *= i;
 *     return n;
 * }
 *
 * @param {string|Suite} titleOrSuite
 *    A name for the group of tests, or else a suite from previous tests.
 * @param {...function} tools
 *    Any number of functions, which will be bound to a shared `Suite` instance.
 * @returns {function[]}
 *    The functions which were passed in, now bound to a shared `Suite` instance.
 * @throws
 *    Throws an `Error` if any of the arguments are invalid.
 */
function bindTestTools(titleOrSuite, ...tools) {
    const begin = 'bindTestTools():';

    // Validate the arguments.
    const [ aResults, aArr, aObj, aStr ] = narrowAintas({ begin },
        aintaArray, aintaObject, aintaString);
    const aTitle = aStr(titleOrSuite, 'titleOrSuite');
    const aSuite = aObj(titleOrSuite, 'titleOrSuite', { is:[Suite] });
    const aTools = aArr(tools, 'tools', { types:['function'] });
    if ((aTitle && aSuite) || aTools)
        throw Error(aTitle && aSuite ? aResults.join('\n') : aResults[1]);

    // If `titleOrSuite` is an object it must already be an instance of `Suite`,
    // so just use is as-is. Otherwise, create a new `Suite` instance.
    const suite = typeof titleOrSuite === 'object'
        ? titleOrSuite
        : new Suite(
            0, // failTally
            0, // passTally
            0, // pendingTally
            titleOrSuite || 'Untitled Test Suite', // title
            [], // resultsAndSections
        );

    // Bind the `Suite` instance to each test tool.
    return tools.map(tool => tool.bind(suite));
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
function addSection(subtitle) {
    const begin = 'addSection()';

    // Check that this function has been bound to a `Suite` instance.
    const aSuite = aintaObject(this, 'suite', { begin, is:[Suite], open:true });
    if (aSuite) throw Error(aSuite);

    // The brackets around `this` make JSDoc see `(this)` as a `Suite` instance.
    /** @type Suite */
    (this).addSection(subtitle);
}

function isEqual(actual, expected, desc='') {
    this.results.push(
        actual === expected
            ? { desc, pass: true }
            : { desc, fail: `actual:\n${actual}\n!== expected:\n${expected}\n` }
    );
}

function renderPlain() {
    const header = `${this.title}\n${'-'.repeat(this.title.length)}\n\n`;
    return `${header}${
        this.results.length === 0
            ? 'No tests were run'
            : this.results.every(result => result.pass)
                ? this.results.length === 1
                    ? `The test passed`
                    : this.results.length === 2
                        ? `Both tests passed`
                        : `All ${this.results.length} tests passed`
                : '@TODO fails'
    }\n`;
}

export { Suite, addSection, bindTestTools as default, isEqual, renderPlain };
