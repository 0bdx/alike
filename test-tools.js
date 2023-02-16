/**
 * https://www.npmjs.com/package/@0bdx/test-tools
 * @version 0.0.1
 * @license Copyright (c) 2023 0bdx <0@0bdx.com> (0bdx.com)
 * SPDX-License-Identifier: MIT
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
 * @param {string} title
 *     A name for the group of tests, eg "Mathsy Test Suite"
 * @param {...function} tools
 *     Any number of functions, which will be bound to a shared context object
 * @return {function[]}
 *     The functions which were passed in, now bound to a shared context object
 * @throws
 *     Throws an `Error` if any of the arguments are invalid.
 */
function bindTestTools(title, ...tools) {
    const ep = 'Error: bindTestTools():'; // error prefix

    if (typeof title !== 'string') throw Error(`${ep
        } title is type '${typeof title}' not 'string'`);

    for (let i=0, len=tools.length; i<len; i++)
        if (typeof tools[i] !== 'function') throw Error(`${ep
            } tools[${i}] is type '${typeof tools[i]}' not 'function'`);

    const sharedContext = { results:[], title };
    return tools.map(tool => tool.bind(sharedContext));
}

export { bindTestTools as default };
