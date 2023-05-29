/** ### A single 'stroke of the highlighter pen' when rendering JS values.
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Frozen:__ all properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ all properties are validated during instantiation
 */
export class Highlight {
    /** ### Creates a `Highlight` instance from the supplied arguments.
     *
     * @param {'ARRAY'|'BOOLNUM'|'DOM'|'ERROR'|'EXCEPTION'|
     *         'FUNCTION'|'NULLISH'|'OBJECT'|'REGEXP'|'STRING'|'SYMBOL'} kind
     *    How the value should be rendered.
     *    - Booleans and numbers highlight the same way
     *    - A `BigInt` is a number rendered with the `"n"` suffix
     *    - A `RegExp` highlights like an `Object` but looks like `/a/` not `{}`
     * @param {number} start
     *    A non-negative integer. The position that highlighting starts.
     * @param {number} stop
     *    A non-zero integer greater than `start`, where highlighting stops.
     * @throws {Error}
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(kind: 'ARRAY' | 'BOOLNUM' | 'DOM' | 'ERROR' | 'EXCEPTION' | 'FUNCTION' | 'NULLISH' | 'OBJECT' | 'REGEXP' | 'STRING' | 'SYMBOL', start: number, stop: number);
    /** How the value should be rendered.
     * - Booleans and numbers highlight the same way
     * - A `BigInt` is a number rendered with the `"n"` suffix
     * - A `RegExp` highlights like an `Object` but looks like `/a/` not `{}` */
    kind: "ARRAY" | "BOOLNUM" | "DOM" | "ERROR" | "EXCEPTION" | "FUNCTION" | "NULLISH" | "OBJECT" | "REGEXP" | "STRING" | "SYMBOL";
    /** A non-negative integer. The position that highlighting starts. */
    start: number;
    /** A non-zero integer greater than `start`, where highlighting stops. */
    stop: number;
}
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
     *    A string representation of the value.
     *     - 1 to 65535 unicode characters (about 10,000 lorem ipsum words)
     * @throws {Error}
     *    Throws an `Error` if any of the arguments are invalid.
     */
    constructor(highlights: Highlight[], text: string);
    /** Zero or more 'strokes of the highlighter pen' on `text`. */
    highlights: Highlight[];
    /** A string representation of the value.
     * - 1 to 65535 unicode characters (about 10,000 lorem ipsum words) */
    text: string;
    /** ### Determines whether the full value could be rendered on one line.
     *
     * The maximum line length is 120 characters, which may begin "actually: "
     * or "expected: ", leaving 110 characters for the value.
     *
     * @returns {boolean}
     *    Returns `true` if this instance is short enough to render on one line.
     */
    isShort(): boolean;
    /** ### The value as a plain string, for a test-result overview.
     *
     * An overview which passes will be one line:
     * ```
     * PASS: actually: 123
     * ```
     *
     * An overview which fails will be two lines:
     * ```
     * FAIL: actually: 123
     *       expected: 546
     * ```
     *
     * The maximum line length is 120 characters, so `this.text` may need to be
     * truncated to 104 characters. @TODO truncate
     *
     * @returns {string}
     *    Xx.
     */
    get overview(): string;
}
/** ### Binds one function to a shared `Are` instance.
 *
 * Takes an existing `Are` or creates a new one, and binds one function to it.
 * That function can then access the `Are` instance using the `this` keyword.
 *
 * This pattern of dependency injection allows lots of flexibility, and works
 * well with Rollup's tree shaking.
 *
 * @example
 * import { bind1, isDeeplyLike } from '../are.js';
 *
 * // Create a test suite with a title, and bind one function to it.
 * const [ isLike, testSuite ] = bind1(isDeeplyLike, 'fact()');
 *
 * // Or a test suite from a previous test could be passed in instead.
 * // const [ isLike ] = bind1(isDeeplyLike, testSuite);
 *
 * // Optionally, begin a new section.
 * testSuite.addSection('Check that fact() works');
 *
 * // Run the tests. The third argument, `notes`, is optional.
 * isLike(fact(0), 1);
 * isLike(fact(5), 120,
 *     ['`fact(5)` 5! = 5 * 4 * 3 * 2 * 1']);
 *
 * // Output a test results summary to the console, as plain text.
 * console.log(testSuite.render());
 *
 * // Calculates the factorial of a given integer.
 * function fact(n) {
 *     if (n === 0 || n === 1) return 1;
 *     for (let i=n-1; i>0; i--) n *= i;
 *     return n;
 * }
 *
 * @template {function} A
 *
 * @param {A} functionA
 *    The function to bind to the test suite.
 * @param {Are|string} areOrTitle
 *    A test suite from previous tests, or else a title for a new test suite.
 * @returns {[A,Are]}
 */
export function bind1<A extends Function>(functionA: A, areOrTitle: Are | string): [A, Are];
/** ### Binds two functions to a shared `Are` instance.
 *
 * Takes an existing `Are` or creates a new one, and binds two functions
 * to it. Each function can then access the shared `Are` instance using
 * the `this` keyword.
 *
 * This pattern of dependency injection allows lots of flexibility, and works
 * well with Rollup's tree shaking.
 *
 * @example
 * import { bind2, isDeeplyLike, throwsError } from '../are.js';
 *
 * // Create a test suite with a title, and bind two functions to it.
 * const [ isLike, throws, testSuite ] = bind2(isDeeplyLike, throwsError, 'fact()');
 *
 * // Or a test suite from a previous test could be passed in instead.
 * // const [ isLike, throws ] = bind2(isDeeplyLike, throwsError, testSuite);
 *
 * // Optionally, begin a new section.
 * testSuite.addSection('Check that fact() works');
 *
 * // Run the tests. The third argument, `notes`, is optional.
 * throws(()=>fact(), "`n` is not type 'number'");
 * throws(()=>fact(NaN), '`n` is NaN!',
 *     ['`fact(NaN)` cannot factorialise the special `NaN` number']);
 * isLike(fact(0), 1);
 * isLike(fact(5), 120,
 *     ['`fact(5)` 5! = 5 * 4 * 3 * 2 * 1']);
 *
 * // Output a test results summary to the console, as plain text.
 * console.log(testSuite.render());
 *
 * // Calculates the factorial of a given integer.
 * function fact(n) {
 *     if (typeof n !== 'number') throw Error("`n` is not type 'number'");
 *     if (isNaN(n)) throw Error('`n` is NaN!');
 *     if (n === 0 || n === 1) return 1;
 *     for (let i=n-1; i>0; i--) n *= i;
 *     return n;
 * }
 *
 * @template {function} A
 * @template {function} B
 *
 * @param {A} functionA
 *    The first function to bind to the test suite.
 * @param {B} functionB
 *    The second function to bind to the test suite.
 * @param {Are|string} areOrTitle
 *    A test suite from previous tests, or else a title for a new test suite.
 * @returns {[A,B,Are]}
 */
export function bind2<A extends Function, B extends Function>(functionA: A, functionB: B, areOrTitle: Are | string): [A, B, Are];
/** ### Binds three functions to a shared `Are` instance.
 *
 * Takes an existing `Are` or creates a new one, and binds three functions
 * to it. Each function can then access the shared `Are` instance using
 * the `this` keyword.
 *
 * This pattern of dependency injection allows lots of flexibility, and works
 * well with Rollup's tree shaking.
 *
 * @TODO example
 *
 * @template {function} A
 * @template {function} B
 * @template {function} C
 *
 * @param {A} functionA
 *    The first function to bind to the test suite.
 * @param {B} functionB
 *    The second function to bind to the test suite.
 * @param {C} functionC
 *    The second function to bind to the test suite.
 * @param {Are|string} areOrTitle
 *    A test suite from previous tests, or else a title for a new test suite.
 * @returns {[A,B,C,Are]}
 */
export function bind3<A extends Function, B extends Function, C extends Function>(functionA: A, functionB: B, functionC: C, areOrTitle: Are | string): [A, B, C, Are];
/** ### A test suite, which contains test results, sections, etc.
 *
 * "Are" could stand for "All Results Etc", or it could be the plural of "is".
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Dereferenced:__ object arguments are deep-cloned, to avoid back-refs
 * - __Frozen:__ all properties are read-only, and only change via method calls
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ all properties are validated by instantiation and method calls
 */
declare class Are {
    /** ### Creates an empty `Are` instance with the supplied title.
     *
     * @param {string} title
     *    The test suite's title, usually rendered as a heading above the results.
     *    - 0 to 64 printable ASCII characters, except the backslash `"\"`
     *    - An empty string `""` means that a default should be used
     * @throws {Error}
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
     * @property {(Result|Section)[]} resultsAndSections */
    get resultsAndSections(): any[];
    /** ### Returns the test suite's public properties as an object.
     *
     * JavaScript's `JSON.stringify()` looks for a function named `toJSON()` in
     * any object being serialized. If it exists, it serializes the return value
     * of `toJSON()`, instead of just writing "[object Object]".
     *
     * @returns {{failTally:number, passTally:number, pendingTally:number,
     *           resultsAndSections:(Result|Section)[], title:string}}
     *    The public properties of `Are`.
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
     * based on the test suite's current highest section index.
     *
     * @param {Renderable} actually
     *    A representation of the value that the test actually got, ready to
     *    render. This could be the representation of an unexpected exception.
     * @param {Renderable} expected
     *    A representation of the value that the test expected, ready to render.
     * @param {string[]} notes
     *    A description of the test, as an array of strings.
     *    - 0 to 100 items, where each item is a line
     *    - 0 to 120 printable ASCII characters (except `"\"`) per line
     *    - An empty array `[]` means that no notes have been supplied
     * @param {'FAIL'|'PASS'|'PENDING'|'UNEXPECTED_EXCEPTION'} status
     *    A string (effectively an enum) which can be one of four values:
     *    - `"FAIL"` if the test failed (but not by `"UNEXPECTED_EXCEPTION"`)
     *    - `"PASS"` if the test passed
     *    - `"PENDING"` if the test has not completed yet
     *    - `"UNEXPECTED_EXCEPTION"` if the test threw an unexpected exception
     * @returns {void}
     *    Does not return anything.
     * @throws {Error}
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
     * @throws {Error}
     *    Throws an `Error` if `subtitle` or the `this` context are invalid.
     */
    addSection(subtitle: string): void;
    /** ### Stringifies the test suite with ANSI colours for the terminal.
     *
     * @param {string} [filterSections='']
     *    Optional string, which hides sections whose subtitles do not match.
     *    - Defaults to the empty string `""`, which does not filter anything
     * @param {string} [filterResults='']
     *    Optional string, which hides results whose notes do not match.
     *    - Defaults to the empty string `""`, which does not filter anything
     * @param {'QUIET'|'VERBOSE'|'VERY'|'VERYVERY'} [verbosity='QUIET']
     *    Optional enum, which controls how detailed the render should be.
     *    - One of `"QUIET|VERBOSE|VERY|VERYVERY"`
     *    - Defaults to `"QUIET"`, which just shows a summary of all tests
     * @returns {string}
     *    Returns the rendered test suite.
     * @throws {Error}
     *    Does not catch the `Error`, if underlying `areRender()` throws one.
     */
    renderAnsi(filterSections?: string, filterResults?: string, verbosity?: 'QUIET' | 'VERBOSE' | 'VERY' | 'VERYVERY'): string;
    /** ### Stringifies the test suite.
     *
     * @param {string} [begin='render()']
     *    An optional way to override the `begin` string sent to `Ainta` functions.
     * @param {string} [filterSections='']
     *    Optional string, which hides sections whose subtitles do not match.
     *    - Defaults to the empty string `""`, which does not filter anything
     * @param {string} [filterResults='']
     *    Optional string, which hides results whose notes do not match.
     *    - Defaults to the empty string `""`, which does not filter anything
     * @param {'ANSI'|'HTML'|'JSON'|'PLAIN'} [formatting='PLAIN']
     *    Optional enum, which controls how the render should be styled.
     *    - One of `"ANSI|HTML|JSON|PLAIN"`
     *    - Defaults to `"PLAIN"`
     * @param {'QUIET'|'VERBOSE'|'VERY'|'VERYVERY'} [verbosity='QUIET']
     *    Optional enum, which controls how detailed the render should be.
     *    - One of `"QUIET|VERBOSE|VERY|VERYVERY"`
     *    - Defaults to `"QUIET"`, which just shows a summary of all tests
     * @returns {string}
     *    Returns the rendered test suite.
     * @throws {Error}
     *    Does not catch the `Error`, if underlying `areRender()` throws one.
     */
    render(begin?: string, filterSections?: string, filterResults?: string, formatting?: 'ANSI' | 'HTML' | 'JSON' | 'PLAIN', verbosity?: 'QUIET' | 'VERBOSE' | 'VERY' | 'VERYVERY'): string;
    #private;
}
/** ### Compares two JavaScript values in a user-friendly way.
 *
 * `isDeeplyLike()` operates in one of two modes:
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
 * @throws {Error}
 *    Throws an `Error` if `notes` or the `this` context are invalid.
 *    Also, unless it's bound to an object with an `addResult()` method, throws
 *    an `Error` if the test fails.
 */
export function isDeeplyLike(actually: any, expected: any, notes?: string | string[]): string;
/** ### Determines whether a function throws the expected error.
 *
 * `throwsError()` operates in one of two modes:
 * 1. If it has been bound to an object with an `addResult()` method, it sends
 *    that method the full test results, and then returns an overview.
 * 2. Otherwise, it either throws an `Error` if the test fails, or returns
 *    an overview if the test passes.
 *
 * @TODO finish the description, with examples
 *
 * @param {function} actually
 *    A function which is expected to throw an `Error` exception when called.
 * @param {string|{test:(arg0:string)=>boolean}} expected
 *    Either the `Error` object's expected message, or a regular expression
 *    to test that message.
 *    - Instead of a `RegExp`, any object with a `test()` method can be used
 * @param {string|string[]} [notes]
 *    An optional description of the test, as a string or array of strings.
 *    - A string is treated identically to an array containing just that string
 *    - 0 to 100 items, where each item is a line
 *    - 0 to 120 printable ASCII characters (except the backslash `"\"`) per line
 *    - An empty array `[]` means that no notes have been supplied
 *    - The first item (index 0), if present, is used for the overview
 * @returns {string}
 *    Returns an overview of the test result.
 * @throws {Error}
 *    Throws an `Error` if the arguments or the `this` context are invalid.
 *    Also, unless it's bound to an object with an `addResult()` method, throws
 *    an `Error` if the test fails.
 */
export function throwsError(actually: Function, expected: string | {
    test: (arg0: string) => boolean;
}, notes?: string | string[]): string;
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
     * @throws {Error}
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
     * @throws {Error}
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
export { Are as default };
