export default function renderPlain() {
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


/* ---------------------------------- Test ---------------------------------- */

/**
 * ### `renderPlain()` unit tests.
 * 
 * @param {renderPlain} f
 *    The `renderPlain()` function to test.
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function renderPlainTest(f) {
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
