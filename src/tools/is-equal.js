export default function isEqual(actual, expected, desc='') {
    this.results.push(
        actual === expected
            ? { desc, pass: true }
            : { desc, fail: `actual:\n${actual}\n!== expected:\n${expected}\n` }
    );
}


/* ---------------------------------- Test ---------------------------------- */

/**
 * ### `isEqual()` unit tests.
 * 
 * @param {isEqual} f
 *    The `isEqual()` function to test.
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function isEqualTest(f) {
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
