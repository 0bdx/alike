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

    // Check that this function has been bound to a `Suite` instance.
    const aSuite = aintaObject(this, 'suite', { begin, is:[Suite], open:true });
    if (aSuite) throw Error(aSuite);

    // The brackets around `this` make JSDoc see `(this)` as a `Suite` instance.
    /** @type Suite */
    (this).addSection(subtitle);
}


/* ---------------------------------- Test ---------------------------------- */

/**
 * ### `addSection()` unit tests.
 * 
 * @param {addSection} f
 *    The `addSection()` function to test.
 * @param {typeof Suite} S
 *    The `Suite` class. Actually different in the source and production build.
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function addSectionTest(f, S) {
    const e2l = e => (e.stack.split('\n')[2].match(/([^\/]+\.js:\d+):\d+\)?$/)||[])[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = (actual, exp) => { try { actual() } catch (err) {
        if (typeof exp.test=='function'?!exp.test(err.message):err.message!==exp)
        { throw Error(`actual message:\n${err.message}\n!== expected message:\n${
            exp}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${exp}\nbut nothing was thrown\n`) };
    const toStr = value => JSON.stringify(value, null, '  ');

    // `addSection()` should be bound to a `Suite` instance.
    throws(()=>f('Valid title.'),
        "addSection(): `suite` is type 'undefined' not 'object'");
    const badlyBound = f.bind({});
    throws(()=>badlyBound('Valid title.'),
        "addSection(): `suite` is not in `options.is` 'Suite'");

    // When bound bound to a `Suite` instance, `addSection()` adds a section.
    const suite = new S(0,0,0,'Test Suite',[]);
    /** @type f */
    const bound = f.bind(suite);
    equal(bound('Valid title.'), void 0);
    equal(suite.resultsAndSections.length, 1);
    equal(toStr(suite.resultsAndSections[0]),
        `{\n` +
        `  "index": 1,\n` +
        `  "subtitle": "Valid title."\n` +
        `}`);

    // `subtitle` should be 0 to 64 printable ASCII characters, except backslashes.
    // @ts-expect-error
    throws(()=>bound(),
        "new Section(): `subtitle` is type 'undefined' not 'string'");
    // @ts-expect-error
    throws(()=>bound([]),
        "new Section(): `subtitle` is an array not type 'string'");
    throws(()=>bound('12345678'.repeat(8) + '9'),
        "new Section(): `subtitle` '123456781234567812345...23456789' is not max 64");
    throws(()=>bound('\\'),
        "new Section(): `subtitle` '%5C' fails 'Printable ASCII characters except backslashes'");
    throws(()=>bound('Café'),
        "new Section(): `subtitle` 'Caf%C3%A9' fails 'Printable ASCII characters except backslashes'");

    // 64 printable ASCII characters except backslashes is a valid `subtitle`,
    // and so is an empty string.
    equal(bound(' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`'), void 0);
    equal(bound('>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~'), void 0);
    equal(bound(''), void 0);
    equal(suite.resultsAndSections.length, 4);
    equal(toStr(suite.resultsAndSections[1]),
        `{\n` +
        `  "index": 2,\n` +
        `  "subtitle": " !\\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_\`"\n` +
        `}`);
    equal(toStr(suite.resultsAndSections[2]),
        `{\n` +
        `  "index": 3,\n` +
        `  "subtitle": ">?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_\`abcdefghijklmnopqrstuvwxyz{|}~"\n` +
        `}`);
    equal(toStr(suite.resultsAndSections[3]),
        `{\n` +
        `  "index": 4,\n` +
        `  "subtitle": ""\n` +
        `}`);
    
}
