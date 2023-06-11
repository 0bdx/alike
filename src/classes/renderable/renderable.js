import narrowAintas, { aintaArray, aintaString } from '@0bdx/ainta';
import renderableFrom from './renderable-from.js';
import Highlight from '../highlight.js';

/** ### A representation of a JavaScript value, ready to render.
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Dereferenced:__ object arguments are deep-cloned, to avoid back-refs
 * - __Frozen:__ both properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ both properties are validated during instantiation
 */
export default class Renderable {

    /** Zero or more 'strokes of the highlighter pen' on `text`. */
    highlights;

    /** A string representation of the value.
     * - 1 to 65535 unicode characters (about 10,000 lorem ipsum words) */
    text;

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
    constructor(
        highlights,
        text,
    ) {
        const begin = 'new Renderable()';

        // Validate each argument.
        const [ aResults, aArr, aStr ] =
            narrowAintas({ begin }, aintaArray, aintaString);
        aArr(highlights, 'highlights', { is:[Highlight] });
        aStr(text, 'text', { min:1, max:65535 });
        if (aResults.length) throw Error(aResults.join('\n'));

        // @TODO check that none of the Highlights overlap
        // @TODO and that they don't extend beyond the end of `text`

        // Store the validated arguments as properties.
        this.highlights = highlights;
        this.text = text;

        // Prevent this instance from being modified.
        Object.freeze(this);
    }

    /** ### Determines whether the full value could be rendered on one line.
     *
     * The maximum line length is 120 characters, which may begin "actually: "
     * or "expected: ", leaving 110 characters for the value.
     * 
     * @returns {boolean}
     *    Returns `true` if this instance is short enough to render on one line.
     */
    isShort() {
        return this.text.length <= 110;
    }

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
    get overview() {
        const c0 = this.text[0];
        return c0 === "'" || c0 === '"'
            ? this.text
            : `\`${this.text}\``;
    }

    /** ### Creates a new `Renderable` instance from any JavaScript value.
     *
     * @param {any} value
     *    The JavaScript value which needs rendering.
     * @returns {Renderable}
     *    A `Renderable` instance, ready for rendering.
     */
    static from(value) {
        const { highlights, text } = renderableFrom(value);
        return new Renderable(highlights, text);
    }

}


/* ---------------------------------- Tests --------------------------------- */

/** ### `Renderable` unit tests.
 *
 * @returns {void}
 *    Does not return anything.
 * @throws {Error}
 *    Throws an `Error` if a test fails.
 */
export function renderableTest() {
    const e2l = e => (e.stack.split('\n')[2].match(/([^\/]+\.js:\d+):\d+\)?$/)||[])[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = (actual, exp) => { try { actual() } catch (err) {
        if (typeof exp.test=='function'?!exp.test(err.message):err.message!==exp)
        { throw Error(`actual message:\n${err.message}\n!== expected message:\n${
            exp}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${exp}\nbut nothing was thrown\n`) };
    const toLines = (...lines) => lines.join('\n');
    const toStr = value => JSON.stringify(value, null, '  ');

    // Define a short alias to the class being tested.
    // Define the string that all `new Renderable(...)` error messages begin with.
    const C = Renderable;
    const begin = `new ${C.name}()`; // "new Renderable()"

    // Define some typical, minimal and maximal valid values.
    const hUsual = [ new Highlight('BOOLNUM', 6, 11) ];
    const tUsual = '{ ok:"Café" }';
    const hMin = [];
    const tMin = ' ';
    const hMax = []; // @TODO
    const tMax = '12345678'.repeat(8);

    // Instantiating with both arguments invalid should fail.
    // @TODO more tests
    // @ts-expect-error
    throws(()=>new C(),
        begin + ": `highlights` is type 'undefined' not an array\n" +
        begin + ": `text` is type 'undefined' not 'string'");

    // `highlights` should be an array of `Highlight` instances.
    // @ts-expect-error
    throws(()=>new C('0,1,2', tUsual),
        begin + ": `highlights` is type 'string' not an array");
    // @ts-expect-error
    throws(()=>new C([0], tMin),
        begin + ": `highlights[0]` is not in `options.is` 'Highlight'");

    // `text` should be a valid string, 1 to 64 characters long.
    // @ts-expect-error
    throws(()=>new C(hUsual, true),
        begin + ": `text` is type 'boolean' not 'string'");
    throws(()=>new C(hMin, ''),
        begin + ": `text` '' is not min 1");
    throws(()=>new C(hMax, '1234567890'.repeat(6553) + '123456'),
        begin + ": `text` '123456789012345678901...90123456' is not max 65535");

    // Instantiate a typical `Renderable`, and create its JSON representation.
    // The instance should `JSON.stringify()` as expected.
    const usual = new Renderable(
        hUsual,
        tUsual,
    );
    const expectedUsual = toLines(
        '{',
        `  "highlights": [`,
        `    {`,
        `      "kind": "BOOLNUM",`,
        `      "start": 6,`,
        `      "stop": 11`,
        `    }`,
        `  ],`,
        `  "text": "{ ok:\\"Café\\" }"`,
        '}'
    );
    equal(toStr(usual), expectedUsual);

    // A minimal `Renderable` should `JSON.stringify()` as expected.
    const min = new Renderable(
        hMin,
        tMin,
    );
    equal(toStr(min), toLines(
        '{',
        `  "highlights": [],`,
        `  "text": "${tMin}"`,
        '}'
    ));

    // A maximal `Renderable` should `JSON.stringify()` as expected.
    const max = new Renderable(
        hMax,
        tMax,
    );
    equal(toStr(max), toLines(
        '{',
        `  "highlights": [${hMax.join(',')}],`,
        `  "text": "${tMax}"`,
        '}'
    ));

    // It should not be possible to add a new property.
    // - Firefox: can't define property "another": Object is not extensible
    // - Chrome, Edge and Opera: Cannot add property another, object is not extensible
    // - Safari: Attempting to define property on object that is not extensible.
    // - Node: Cannot add property another, object is not extensible
    // @ts-expect-error
    throws(()=>{usual.another = 'OOPS!'},
        /^.*property.+extensible\.?$/);

    // It should not be possible to modify properties.
    // - Firefox: "text" is read-only
    // - Chrome, Edge and Opera: Cannot assign to read only property 'text' of object '#<Object>'
    // - Safari: Attempted to assign to readonly property.
    // - Node: Cannot assign to read only property 'text' of object '#<Renderable>'
    throws(()=>{usual.highlights = [new Highlight('DOM', 1, 12)]},
        /read only|read-only|readonly/);
    throws(()=>{usual.text = 'also-valid'},
        /read only|read-only|readonly/);

    // It should not be possible to delete properties.
    // - Firefox: property "text" is non-configurable and can't be deleted
    // - Chrome, Edge and Opera: Cannot delete property 'text' of #<Object>
    // - Safari: Unable to delete property
    // - Node: Cannot delete property 'text' of #<Renderable>
    throws(()=>{delete usual.highlights},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.text},
        /^.*delete.+property.*$|^.*property.+delete.*$/);

    // `isFrozen()` should return `true`, meaning that `freeze()` was used.
    // The instance should `JSON.stringify()` the same as before, which confirms
    // that none of the attempts to modify it worked.
    equal(Object.isFrozen(usual), true);
    equal(toStr(usual), expectedUsual);

    // The `highlights` property should also be frozen.
    // @TODO

    // The `highlights` property should not be the same object as the passed-in
    // `highlights` argument. So, that argument should not be frozen, and
    // modifying its items after `new Renderable()` should not change the
    // `highlights` property.
    // @TODO

}
