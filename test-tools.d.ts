export { bindTestTools as default };
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
declare function bindTestTools(titleOrSuite: string | Suite, ...tools: Function[]): Function[];
/** ### A container for test results.
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Dereferenced:__ object arguments are deep-cloned, to avoid back-refs
 * - __Frozen:__ all properties are read-only, and only change via method calls
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ all properties are validated by instantiation and method calls
 */
declare class Suite {
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
     *    - An empty string `""` means that no title has been supplied
     * @param {(Result|Section)[]} resultsAndSections
     *    An array containing zero or more test results and sections.
     * @throws
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(failTally: number, passTally: number, pendingTally: number, title: string, resultsAndSections: (Result | Section)[]);
    /** A non-negative integer. The total number of failed tests. */
    failTally: number;
    /** A non-negative integer. The total number of passed tests. */
    passTally: number;
    /** A non-negative integer. The total number of tests not completed yet. */
    pendingTally: number;
    /** The test suite's title, usually rendered as a heading above the results.
     * - 0 to 64 printable ASCII characters, except the backslash `"\"`
     * - An empty string `""` means that no title has been supplied */
    title: string;
    get resultsAndSections(): (Result | Section)[];
    toJSON(): Suite & {
        resultsAndSections: (Result | Section)[];
    };
    /** ### Adds a result to the test suite.
     *
     * @param {Result} result
     *    The `Result` instance to add.
     */
    addResult(result: Result): void;
    /** ### Adds a section to the test suite.
     *
     * @param {Section} section
     *    The `Section` instance to add.
     */
    addSection(section: Section): void;
    #private;
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
    constructor(actually: Renderable, expected: Renderable, sectionIndex: number, status: 'FAIL' | 'PASS' | 'PENDING' | 'UNEXPECTED_EXCEPTION', summary: string);
    /** A representation of the value that the test actually got, ready to
     * render. This could be the representation of an unexpected exception. */
    actually: Renderable;
    /** A representation of the value that the test expected, ready to render. */
    expected: Renderable;
    /** The index of the `Section` that the test belongs to. Zero if it should
     * be rendered before the first section, or if there are no sections. */
    sectionIndex: number;
    /** A string (effectively an enum) which can be one of four values:
     * - `"FAIL"` if the test failed (but not by `"UNEXPECTED_EXCEPTION"`)
     * - `"PASS"` if the test passed
     * - `"PENDING"` if the test has not completed yet
     * - `"UNEXPECTED_EXCEPTION"` if the test threw an unexpected exception */
    status: "FAIL" | "PASS" | "PENDING" | "UNEXPECTED_EXCEPTION";
    /** A description of the test.
     * - An empty string `""` means that no summary has been supplied */
    summary: string;
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
     * - 1 to 64 printable ASCII characters, except the backslash `"\"` */
    subtitle: string;
}
/** ### A representation of a JavaScript value, ready to render.
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Dereferenced:__ object arguments are deep-cloned, to avoid back-refs
 * - __Frozen:__ both properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ both properties are validated during instantiation
 */
declare class Renderable {
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
    constructor(highlights: Highlight[], text: string);
    /** Zero or more 'strokes of the highlighter pen' on `text`. */
    highlights: Highlight[];
    /** A string representation of the value, truncated to a maximum length.
     * - 1 to 64 unicode characters */
    text: string;
}
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
