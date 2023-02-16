/**
 * https://www.npmjs.com/package/@0bdx/test-tools
 * @version 0.0.1
 * @license Copyright (c) 2023 0bdx <0@0bdx.com> (0bdx.com)
 * SPDX-License-Identifier: MIT
 */
/**
 * Placeholder function.
 *
 * @param   {string}  msg  A short message
 *
 * @return  {string}  Returns the short message appended to "foo(): "
 */
function foo(msg) {
    const ep = 'Error: foo():'; // error prefix
    if (typeof msg !== 'string') throw Error(`${ep
        } msg is type '${typeof msg}' not 'string'`);

    return `foo(): ${msg}`;
}

export { foo };
