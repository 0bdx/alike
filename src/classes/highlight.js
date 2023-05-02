import narrowAintas, { aintaNumber, aintaString } from '@0bdx/ainta';

// Define an enum for validating `kind`.
const validKind = [ 'ARRAY', 'BOOLNUM', 'DOM', 'ERROR', 'EXCEPTION',
    'FUNCTION', 'NULLISH', 'OBJECT', 'REGEXP', 'STRING', 'SYMBOL' ];

/** ### A single 'stroke of the highlighter pen' when rendering JS values.
 *
 * - __Consistent:__ related data in different properties always agrees
 * - __Frozen:__ all properties are read-only, and no methods ever change them
 * - __Sealed:__ properties aren't reconfigurable, new properties can't be added
 * - __Valid:__ all properties are validated during instantiation
 */
export default class Highlight {

    /** How the value should be rendered.
     * - Booleans and numbers highlight the same way
     * - A `BigInt` is a number rendered with the `"n"` suffix
     * - A `RegExp` highlights like an `Object` but looks like `/a/` not `{}` */
    kind;

    /** A non-negative integer. The position that highlighting starts. */
    start;

    /** A non-zero integer greater than `start`, where highlighting stops. */
    stop;

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
    constructor(
        kind,
        start,
        stop,
    ) {
        const begin = 'new Highlight()';

        // Validate each argument.
        const [ aResults, aNum, aStr ] = narrowAintas(
            { begin, mod:1 },
            aintaNumber, aintaString);
        aStr(kind, 'kind', { is:validKind });
        aNum(start, 'start', { gte:0, lte:Number.MAX_SAFE_INTEGER - 1 });
        aNum(stop, 'stop', { gte:1, lte:Number.MAX_SAFE_INTEGER });
        if (aResults.length) throw Error(aResults.join('\n'));

        // Check that the stop position is after the start position.
        const aStop = aintaNumber(stop, 'stop', { begin, gte:start + 1 })
        if (aStop) throw Error(aStop);

        // Store the validated arguments as properties.
        this.kind = kind;
        this.start = start;
        this.stop = stop;

        // Prevent this instance from being modified.
        Object.freeze(this);
    }

}


/* ---------------------------------- Tests --------------------------------- */

/** ### `Highlight` unit tests.
 * 
 * @returns {void}
 *    Does not return anything.
 * @throws {Error}
 *    Throws an `Error` if a test fails.
 */
export function highlightTest() {
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
    // Define the string that all `new Highlight(...)` error messages begin with.
    const C = Highlight;
    const begin = `new ${C.name}()`; // "new Highlight()"

    // Define some typical, minimal and maximal valid values.
    const stUsual = 77;
    const spUsual = 123;
    const kUsual = 'STRING';
    const stMin = 1;
    const spMin = 2;
    const kMin = 'ARRAY';
    const stMax = Number.MAX_SAFE_INTEGER - 1;
    const spMax = Number.MAX_SAFE_INTEGER;
    const kMax = 'SYMBOL';

    // Instantiating with all arguments invalid should fail.
    // @TODO more tests
    // @ts-expect-error
    throws(()=>new C(),
        begin + ": `kind` is type 'undefined' not 'string'\n" +
        begin + ": `start` is type 'undefined' not 'number'\n" +
        begin + ": `stop` is type 'undefined' not 'number'");

    // `kind` should be one of the 10 valid strings.
    // @ts-expect-error
    throws(()=>new C(true, stUsual, spUsual),
        begin + ": `kind` is type 'boolean' not 'string'");
    // @ts-expect-error
    throws(()=>new C('', stMin, spMin),
        begin + ": `kind` '' is not in `options.is` 'ARRAY:BOOLNUM:DOM:ERR...G:SYMBOL'");
    // @ts-expect-error
    throws(()=>new C('Array', stMin, spMin),
        begin + ": `kind` 'Array' is not in `options.is` 'ARRAY:BOOLNUM:DOM:ERR...G:SYMBOL'");

    // `start` should be a valid non-negative integer.
    // @ts-expect-error
    throws(()=>new C(kUsual, BigInt(2), spUsual),
        begin + ": `start` is type 'bigint' not 'number'");
    throws(()=>new C(kMin, -1, spMin),
        begin + ": `start` -1 is not gte 0");
    throws(()=>new C(kMin, Number.MAX_SAFE_INTEGER, spMin),
        begin + ": `start` 9007199254740991 is not lte 9007199254740990");
    throws(()=>new C(kMax, 33.44, spMax),
        begin + ": `start` 33.44 is not divisible by 1");

    // `stop` should be a valid non-zero integer.
    // @ts-expect-error
    throws(()=>new C(kUsual, stUsual, ()=>2),
        begin + ": `stop` is type 'function' not 'number'");
    throws(()=>new C(kMin, stMin, 0),
        begin + ": `stop` 0 is not gte 1");
    throws(()=>new C(kMin, stMin, Number.MAX_SAFE_INTEGER + 2), // or `+ 1` :-)
        begin + ": `stop` 9007199254740992 is not lte 9007199254740991");
    throws(()=>new C(kMax, stMax, 33.44),
        begin + ": `stop` 33.44 is not divisible by 1");

    // `stop` should be greater than `start`.
    throws(()=>new C(kUsual, spUsual, stUsual),
        begin + ": `stop` 77 is not gte 124");
    throws(()=>new C(kMin, stMin, stMin),
        begin + ": `stop` 1 is not gte 2");
    throws(()=>new C(kMin, stMax, stMax),
        begin + ": `stop` 9007199254740990 is not gte 9007199254740991");

    // Instantiate a typical `Highlight`, and create its JSON representation.
    // The instance should `JSON.stringify()` as expected.
    const usual = new Highlight(
        kUsual,
        stUsual,
        spUsual,
    );
    const expectedUsual = toLines(
        '{',
        `  "kind": "${kUsual}",`,
        `  "start": ${stUsual},`,
        `  "stop": ${spUsual}`,
        '}'
    );
    equal(toStr(usual), expectedUsual);

    // A minimal `Highlight` should `JSON.stringify()` as expected.
    const min = new Highlight(
        kMin,
        stMin,
        spMin,
    );
    equal(toStr(min), toLines(
        '{',
        `  "kind": "${kMin}",`,
        `  "start": ${stMin},`,
        `  "stop": ${spMin}`,
        '}'
    ));

    // A maximal `Highlight` should `JSON.stringify()` as expected.
    const max = new Highlight(
        kMax,
        stMax,
        spMax,
    );
    equal(toStr(max), toLines(
        '{',
        `  "kind": "${kMax}",`,
        `  "start": ${stMax},`,
        `  "stop": ${spMax}`,
        '}'
    ));

    // It should not be possible to add a new property.
    // @ts-expect-error
    throws(()=>{usual.another = 'OOPS!'},
        /^.*property.+extensible\.?$/);

    // It should not be possible to modify properties.
    throws(()=>{usual.kind = 'BOOLNUM'},
        /read only|read-only|readonly/);
    throws(()=>{usual.start = 123},
        /read only|read-only|readonly/);
    throws(()=>{usual.stop = 777},
        /read only|read-only|readonly/);

    // It should not be possible to delete properties.
    throws(()=>{delete usual.kind},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.start},
        /^.*delete.+property.*$|^.*property.+delete.*$/);
    throws(()=>{delete usual.stop},
        /^.*delete.+property.*$|^.*property.+delete.*$/);

    // `isFrozen()` should return `true`, meaning that `freeze()` was used.
    // The instance should `JSON.stringify()` the same as before, which confirms
    // that none of the attempts to modify it worked.
    equal(Object.isFrozen(usual), true);
    equal(toStr(usual), expectedUsual);

}
