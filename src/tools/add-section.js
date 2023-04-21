import { aintaObject } from '@0bdx/ainta';
import { Suite } from "../classes/index.js";

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
export default function addSection(subtitle) {
    const begin = 'addSection()';

    const aSuite = aintaObject(this, 'suite', { begin, is:[Suite] });
    if (aSuite) throw Error(aSuite);

    /** @type Suite */
    const suite = this;

    suite.addSection(subtitle);
}


/* ---------------------------------- Test ---------------------------------- */

/**
 * ### `addSection()` unit tests.
 * 
 * @param {addSection} f
 *    The `addSection()` function to test.
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function addSectionTest(f) {
    const e2l = e => (e.stack.split('\n')[2].match(/([^\/]+\.js:\d+):\d+\)?$/)||[])[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = (actual, exp) => { try { actual() } catch (err) {
        if (typeof exp.test=='function'?!exp.test(err.message):err.message!==exp)
        { throw Error(`actual message:\n${err.message}\n!== expected message:\n${
            exp}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${exp}\nbut nothing was thrown\n`) };
}
