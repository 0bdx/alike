/** ### A representation of a JavaScript value, ready to render.
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Dereferenced:__ object arguments are deep-cloned, to avoid back-refs
 * - __Frozen:__ both properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ both properties are validated during instantiation
 */
export class Renderable {
    /** ### Creates a new `Renderable` instance from any JavaScript value.
     *
     * @param {any} value
     *    The JavaScript value which needs rendering.
     * @returns {Renderable}
     *    A `Renderable` instance, ready for rendering.
     */
    static from(value: any): Renderable;
    /** ### Creates a `Renderable` instance from the supplied arguments.
     *
     * @param {Highlight[]} highlights
     *    Zero or more 'strokes of the highlighter pen' on `text`.
     * @param {string} text
     *    A string representation of the value, truncated to a maximum length.
     *     - 1 to 65535 unicode characters (about 10,000 lorem ipsum words)
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(highlights: Highlight[], text: string);
    /** Zero or more 'strokes of the highlighter pen' on `text`. */
    highlights: Highlight[];
    /** A string representation of the value, truncated to a maximum length.
     * - 1 to 65535 unicode characters (about 10,000 lorem ipsum words) */
    text: string;
}
/** ### A container for test results.
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Dereferenced:__ object arguments are deep-cloned, to avoid back-refs
 * - __Frozen:__ all properties are read-only, and only change via method calls
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ all properties are validated by instantiation and method calls
 */
export class Suite {
    /** ### Creates an empty `Suite` instance with the supplied title.
     *
     * @param {string} title
     *    The test suite's title, usually rendered as a heading above the results.
     *    - 0 to 64 printable ASCII characters, except the backslash `"\"`
     *    - An empty string `""` means that a default should be used
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(title: string);
    /** The test suite's title, usually rendered as a heading above the results.
     * - 0 to 64 printable ASCII characters, except the backslash `"\"`
     * - An empty string `""` means that a default should be used */
    title: string;
    /** ### A non-negative integer. The total number of failed tests.
     * @property {number} failTally */
    get failTally(): number;
    /** ### A non-negative integer. The total number of passed tests.
     * @property {number} passTally */
    get passTally(): number;
    /** ### A non-negative integer. The total number of tests not completed yet.
     * @property {number} pendingTally */
    get pendingTally(): number;
    /** ### An array containing zero or more test results and sections.
     * @property {(Result|Section)[]} pendingTally */
    get resultsAndSections(): any[];
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
    toJSON(): {
        failTally: number;
        passTally: number;
        pendingTally: number;
        resultsAndSections: (Result | Section)[];
        title: string;
    };
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
    addResult(actually: Renderable, expected: Renderable, notes: string[], status: 'FAIL' | 'PASS' | 'PENDING' | 'UNEXPECTED_EXCEPTION'): void;
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
    addSection(subtitle: string): void;
    #private;
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
export function addSection(subtitle: string): void;
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
 * import bindAlikeTools, { addSection, isEqual, renderPlain }
 *     from '@0bdx/alike';
 *
 * // Give the test suite a title, and bind some functions to it.
 * const [ section,    isEq,    render ] = bindAlikeTools('Mathsy Test Suite',
 *         addSection, isEqual, renderPlain);
 *
 * // Optionally, begin a new addSection.
 * section('Check that factorialise() works');
 *
 * // Run the tests. The third argument, `description`, is optional.
 * isEq(factorialise(0), 1);
 * isEq(factorialise(5), 120,
 *     'factorialise(5) // 5! = 5 * 4 * 3 * 2 * 1');
 *
 * // Output the test results to the console, as plain text.
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
declare function bindAlikeTools(titleOrSuite: string | Suite, ...tools: Function[]): Function[];
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
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if `notes` or the `this` context are invalid.
 */
export function isEqual(actually: any, expected: any, notes?: string[]): void;
/** ### Renders a test suite without colours or typographic styling.
 *
 * @TODO describe with examples
 *
 * @returns {string}
 *    Returns the test suite's title, followed by a summary of the test results.
 * @throws
 *    Throws an `Error` if the `this` context is invalid.
 */
export function renderPlain(): string;
/** ### A single 'stroke of the highlighter pen' when rendering JS values.
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Frozen:__ all properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ all properties are validated during instantiation
 */
declare class Highlight {
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
    constructor(kind: 'ARRAY' | 'BOOLNUM' | 'DOM' | 'ERROR' | 'EXCEPTION' | 'FUNCTION' | 'NULLISH' | 'OBJECT' | 'STRING' | 'SYMBOL', start: number, stop: number);
    /** How the value should be rendered.
     * - Booleans and numbers highlight the same way
     * - A `BigInt` is a number rendered with the `"n"` suffix
     * - A `RegExp` highlights like an `Object` but looks like `/a/` not `{}` */
    kind: "ARRAY" | "BOOLNUM" | "DOM" | "ERROR" | "EXCEPTION" | "FUNCTION" | "NULLISH" | "OBJECT" | "STRING" | "SYMBOL";
    /** A non-negative integer. The position that highlighting starts. */
    start: number;
    /** A non-zero integer greater than `start`, where highlighting stops. */
    stop: number;
}
/** ### Records the outcome of one test.
 *
 * - __Dereferenced:__ object arguments are deep-cloned, to avoid back-refs
 * - __Frozen:__ all properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ all properties are validated during instantiation
 */
declare class Result {
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
    constructor(actually: Renderable, expected: Renderable, notes: string[], sectionIndex: number, status: 'FAIL' | 'PASS' | 'PENDING' | 'UNEXPECTED_EXCEPTION');
    /** A representation of the value that the test actually got, ready to
     * render. This could be the representation of an unexpected exception. */
    actually: Renderable;
    /** A representation of the value that the test expected, ready to render. */
    expected: Renderable;
    /** A description of the test, as a single string of newline-delimited lines.
     * - 0 to 100 newline-delimited lines
     * - 0 to 120 printable ASCII characters (except the backslash `"\"`) per line
     * - An empty array `[]` means that no notes have been supplied */
    notes: string;
    /** The index of the `Section` that the test belongs to. Zero if it should
     * be rendered before the first section, or if there are no sections. */
    sectionIndex: number;
    /** A string (effectively an enum) which can be one of four values:
     * - `"FAIL"` if the test failed (but not by `"UNEXPECTED_EXCEPTION"`)
     * - `"PASS"` if the test passed
     * - `"PENDING"` if the test has not completed yet
     * - `"UNEXPECTED_EXCEPTION"` if the test threw an unexpected exception */
    status: "FAIL" | "PASS" | "PENDING" | "UNEXPECTED_EXCEPTION";
}
/** ### Marks the start of a new section in the test suite.
 *
 * - __Frozen:__ both properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ both properties are validated during instantiation
 */
declare class Section {
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
    constructor(index: number, subtitle: string);
    /** A non-zero positive integer. The first Section is 1, the second is 2. */
    index: number;
    /** The section title, usually rendered as a sub-heading in the results.
     * - 0 to 64 printable ASCII characters, except the backslash `"\"`
     * - An empty string `""` means that a default should be used */
    subtitle: string;
}
export { bindAlikeTools as default };
