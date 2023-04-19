import narrowAintas, { aintaNumber, aintaString } from '@0bdx/ainta';

// Define a regular expression for validating `subtitle`.
const subtitleRx = /^[ -\[\]-~]+$/;
subtitleRx.toString = () => "'Printable ASCII characters except backslashes'";

/** ### Marks the start of a new section in the test suite.
 *
 * - __Frozen:__ both properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ both properties are validated during instantiation
 */
export default class Section {

    /** A non-zero positive integer. The first Section is 1, the second is 2. */
    index;

    /** The section title, usually rendered as a sub-heading in the results.
     * - 1 to 64 printable ASCII characters, except the backslash `"\"` */
    subtitle;

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
    constructor(
        index,
        subtitle,
    ) {
        const begin = 'new Section()';

        // Validate each argument.
        const [ aResults, aNum, aStr ] =
            narrowAintas({ begin }, aintaNumber, aintaString);
        aNum(index, 'index', { gte:1, lte:Number.MAX_SAFE_INTEGER, mod:1 });
        aStr(subtitle, 'subtitle', { min:1, max:64, rx:subtitleRx });
        if (aResults.length) throw Error(aResults.join('\n'));

        // Store the validated arguments as properties.
        this.index = index;
        this.subtitle = subtitle;

        // Prevent this instance from being modified.
        Object.freeze(this);
    }

}


/* ---------------------------------- Tests --------------------------------- */

/**
 * ### `Section` unit tests.
 * 
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function sectionTest() {
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
    // Define the string that all `new Section(...)` error messages begin with.
    const C = Section;
    const begin = `new ${C.name}()`; // "new Section()"

    // Define some typical, minimal and maximal valid values.
    const iUsual = 77;
    const sUsual = 'The 77th Section';
    const iMin = 1;
    const tMin = ' ';
    const iMax = Number.MAX_SAFE_INTEGER;
    const tMax = '12345678'.repeat(8);

    // Instantiating with both arguments invalid should fail.
    // @TODO more tests
    // @ts-expect-error
    throws(()=>new C(),
        begin + ": `index` is type 'undefined' not 'number'\n" +
        begin + ": `subtitle` is type 'undefined' not 'string'");

    // `index` should be a valid non-zero integer.
    // @ts-expect-error
    throws(()=>new C(BigInt(2), sUsual),
        begin + ": `index` is type 'bigint' not 'number'");
    throws(()=>new C(0, tMin),
        begin + ": `index` 0 is not gte 1");
    throws(()=>new C(Number.MAX_SAFE_INTEGER + 2, tMin), // or `+ 1` :-)
        begin + ": `index` 9007199254740992 is not lte 9007199254740991");
    throws(()=>new C(33.44, tMax),
        begin + ": `index` 33.44 is not divisible by 1");
    throws(()=>new C(-3, sUsual),
        begin + ": `index` -3 is not gte 1");

    // `subtitle` should be a valid string, 1 to 64 characters long.
    // @ts-expect-error
    throws(()=>new C(iUsual, true),
        begin + ": `subtitle` is type 'boolean' not 'string'");
    throws(()=>new C(iMin, ''),
        begin + ": `subtitle` '' is not min 1");
    throws(()=>new C(iMax, '12345678'.repeat(8) + '9'),
        begin + ": `subtitle` '123456781234567812345...23456789' is not max 64");
    throws(()=>new C(iUsual, sUsual + '\\'),
        begin + ": `subtitle` 'The 77th Section%5C' fails " +
        "'Printable ASCII characters except backslashes'");

    // Instantiate a typical `Section`, and create its JSON representation.
    // The instance should `JSON.stringify()` as expected.
    const usual = new Section(
        iUsual,
        sUsual,
    );
    const expectedUsual = toLines(
        '{',
        `  "index": ${iUsual},`,
        `  "subtitle": "${sUsual}"`,
        '}'
    );
    equal(toStr(usual), expectedUsual);

    // A minimal `Section` should `JSON.stringify()` as expected.
    const min = new Section(
        iMin,
        tMin,
    );
    equal(toStr(min), toLines(
        '{',
        `  "index": ${iMin},`,
        `  "subtitle": "${tMin}"`,
        '}'
    ));

    // A maximal `Section` should `JSON.stringify()` as expected.
    const max = new Section(
        iMax,
        tMax,
    );
    equal(toStr(max), toLines(
        '{',
        `  "index": ${iMax},`,
        `  "subtitle": "${tMax}"`,
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
    // - Firefox: "subtitle" is read-only
    // - Chrome, Edge and Opera: Cannot assign to read only property 'subtitle' of object '#<Object>'
    // - Safari: Attempted to assign to readonly property.
    // - Node: Cannot assign to read only property 'subtitle' of object '#<Section>'
    throws(()=>{usual.index = 123},
        /read only|read-only|readonly/);
    throws(()=>{usual.subtitle = 'This would be a valid subtitle'},
        /read only|read-only|readonly/);

    // It should not be possible to delete properties.
    // - Firefox: property "subtitle" is non-configurable and can't be deleted
    // - Chrome, Edge and Opera: Cannot delete property 'subtitle' of #<Object>
    // - Safari: Unable to delete property
    // - Node: Cannot delete property 'subtitle' of #<Section>
    throws(()=>{delete usual.index},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.subtitle},
        /^.*delete.+property.*$|^.*property.+delete.*$/);

    // `isFrozen()` should return `true`, meaning that `freeze()` was used.
    // The instance should `JSON.stringify()` the same as before, which confirms
    // that none of the attempts to modify it worked.
    equal(Object.isFrozen(usual), true);
    equal(toStr(usual), expectedUsual);

}
