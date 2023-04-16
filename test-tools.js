/**
 * https://www.npmjs.com/package/@0bdx/test-tools
 * @version 0.0.1
 * @license Copyright (c) 2023 0bdx <0@0bdx.com> (0bdx.com)
 * SPDX-License-Identifier: MIT
 */
/**
* @typedef {Object} Highlight
*     A single 'stroke of the highlighter pen' when rendering JavaScript values.
* @property {number} begin
*     Non-negative integer, the position that highlighting should start.
* @property {number} end
*     Non-negative integer greater than `begin`, where highlighting should stop.
* @property {'ARRAY'|'BOOLNUM'|'DOM'|'ERROR'|'EXCEPTION'|'FUNCTION'|'NULLISH'|
*     'OBJECT'|'STRING'|'SYMBOL'} kind
*     How the value should be rendered. Booleans and numbers are highlighted the
*     same way. A `BigInt` is a number rendered with the "n" suffix. A `RegExp`
*     is highlighted like an `Object`, but looks like `/abc/` not `{ a:1 }`.
*/

/**
* @typedef {Object} Renderable
*     Instructions for how to render a JavaScript value.
* @property {string} text
*     String representation of the value, often truncated to a maximum length.
* @property {Highlight[]} highlights
*     Zero or more 'strokes of the highlighter pen' on `text`.
*/

/**
* @typedef {Object} Result
*     Captures the outcome of one test. It's important that the Result is fixed,
*     so it does not maintain any references to objects elsewhere in the code.
* @property {Renderable} actually
*     A representation of the value that the test actually got, ready to render.
*     Note that this could be the representation of an unexpected exception.
* @property {Renderable} expected
*     A representation of the value that the test expected, ready to render.
* @property {boolean|null} didPass
*     `true` if it passed, `false` if it failed. `null` means that the test
*     threw an unexpected exception.
* @property {number} sectionIndex
*     The index of the section that the test belongs to. Zero if it should be
*     rendered before the first section, or if there are no sections.
* @property {string} summary
*     A description of the test.
*/

/**
* @typedef {Object} Section
*     Marks the start of a new section in the test suite.
* @property {number} index
*     Non-zero positive integer, where the first Section is 1, the second is 2.
* @property {string} title
*     Usually rendered as a heading within the results.
*/

/**
* @typedef {Object} TestState
*     Foo.
* @property {number} failTally
*     The total number of failed tests.
* @property {number} passTally
*     The total number of passed tests.
* @property {(Result|Section)[]} results
*     Zero or more section-markers and test results.
* @property {string} title
*     The title of the test suite, usually rendered at the top of the results.
*/

/**
 * Creates a ‘context object’, binds any number of functions to it, and returns
 * those functions in an array. Each function can then access the shared context
 * object using the `this` keyword.
 *
 * This pattern of dependency injection allows lots of flexibility, and is great
 * for Rollup's tree shaking.
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
 * @param {string|TestState} titleOrState
 *     A name for the group of tests, or else the state from previous tests.
 * @param {...function} tools
 *     Any number of functions, which will be bound to a shared context object.
 * @returns {function[]}
 *     The functions which were passed in, now bound to a shared context object.
 * @throws
 *     Throws an `Error` if any of the arguments are invalid.
 */
function bindTestTools(titleOrState, ...tools) {
    const ep = 'Error: bindTestTools():'; // error prefix
    if (titleOrState === null) throw Error(`${ep
        } titleOrState is null not 'string' or a TestState object`);

    let state;
    if (typeof titleOrState === 'string') {
        state = {
            failTally: 0,
            passTally: 0,
            results: [],
            title: titleOrState,
        };
    } else if (typeof titleOrState !== 'object') {
        throw Error(`${ep
            } titleOrState is type '${typeof titleOrState}' not 'string'`);
    } else if (Array.isArray(titleOrState)) {
        throw Error(`${ep
            } titleOrState is an array, not a string or plain object`);
    } else ;

    for (let i=0, len=tools.length; i<len; i++)
        if (typeof tools[i] !== 'function') throw Error(`${ep
            } tools[${i}] is type '${typeof tools[i]}' not 'function'`);

    return tools.map(tool => tool.bind(state));
}

export { bindTestTools as default };
