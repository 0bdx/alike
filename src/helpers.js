/** ### Determines whether two arguments are deeply alike.
 *
 * @private
 * @param {any} actually
 *    The value that the test actually got.
 * @param {any} expected
 *    The value that the test expected.
 * @param {number} [maxDepth=99]
 *    Prevents infinite recursion.
 * @returns {boolean}
 *    Returns `true` if the arguments are deeply alike, and `false` if not.
 */
export const determineWhetherDeeplyAlike = (actually, expected, maxDepth=99) => {

    // If either argument is `null`, return `true` or `false` early.
    const actuallyIsNull = actually === null;
    const expectedIsNull = expected === null;
    if (actuallyIsNull && expectedIsNull) return true; // both `null`
    if (actuallyIsNull || expectedIsNull) return false; // only one is `null`

    // If either argument is `NaN`, return `true` or `false` early.
    const actuallyIsNaN = Number.isNaN(actually);
    const expectedIsNaN = Number.isNaN(expected);
    if (actuallyIsNaN && expectedIsNaN) return true; // both 'not-a-number'
    if (actuallyIsNaN || expectedIsNaN) return false; // only one is `NaN`

    // If the arguments are not the same type, return `false`.
    const typeActually = typeof actually;
    const typeExpected = typeof expected;
    if (typeActually !== typeExpected) return false; // not the same type

    // They're the same type. If they're also scalar, return `true` or `false`.
    if ({ bigint:1, boolean:1, number:1, string:1, symbol:1, undefined:1
        }[typeActually]) return actually === expected;

    // The arguments are arrays, functions or objects. If they are references
    // to the same thing, return `true`.
    if (actually === expected) return true;

    // If the arguments are both functions, return `false`.
    // TODO maybe compare static properties on a class
    if (typeActually === 'function') return false;

    // If they are both arrays, compare each argument recursively.
    // TODO improve cyclic reference detection, by passing down a `foundObjects` argument
    const actuallyIsArray = Array.isArray(actually);
    const expectedIsArray = Array.isArray(expected);
    if (actuallyIsArray && expectedIsArray) {
        if (maxDepth === 0) return true; // prevent infinite recursion
        const len = actually.length;
        if (expected.length !== len) return false;
        for (let i=0; i<len; i++) {
            if (!determineWhetherDeeplyAlike(actually[i], expected[i], maxDepth - 1))
                return false;
        }
        return true;
    }

    // If one argument is an array but the other is an object, return `false`.
    if (actuallyIsArray || expectedIsArray) return false;

    // The arguments are both objects. Compare their constructors.
    if (actually.constructor !== expected.constructor) return false;

    // Check they have the same number of properties, ignoring non-enumerables.
    const actuallyKeys = Object.keys(actually);
    const expectedKeys = Object.keys(expected);
    if (actuallyKeys.length !== expectedKeys.length) return false;

    // Prevent infinite recursion.
    if (maxDepth === 0) return true;

    // Compare the two objects recursively, ignoring non-enumerable properties.
    // TODO improve cyclic reference detection, by passing down a `foundObjects` argument
    for (const key of actuallyKeys) {
        if (!determineWhetherDeeplyAlike(actually[key], expected[key], maxDepth - 1))
            return false;
    }
    return true;
};

/** ### Protects `JSON.stringify()` against cyclic references.
 *
 * See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value>
 *
 * @private
 * @returns {function(string,any):any}
 */
export function getCircularReplacer() {
    const ancestors = [];
    /**
     * @param {string} key
     * @param {any} value
     */
    return function (key, value) {
        // Ignore `null`, and ignore anything which is not an array or object.
        if (value === null || typeof value !== 'object') { return value }

        // `this` is the object that `value` is contained in - its direct parent.
        while (ancestors.length && ancestors.at(-1) !== this) ancestors.pop();
        if (ancestors.includes(value)) { return '[Circular]' }
        ancestors.push(value);
        return value;
    };
}

/** ### Shortens text to a given length, by inserting `"..."` near the end.
 *
 * @private
 * @param {string} text
 *    Text to shorten.
 * @param {number} length
 *    The maximum allowed length of the truncated string.
 * @throws {Error}
 *    Throws an `Error` if `text` has no `length` property or `slice()` method.
 *    Also throws an `Error` if `length` is less than 12.
 */
export const truncate = (text, length) => {
    if (length < 12) throw Error('truncate(): `length` ' + length + ' is < 12');
    const textLength = text.length;
    if (textLength <= length) return text;
    const postLen = Math.max(4, length - ~~(length * 0.7));
    const preLen = length - postLen - 3;
    return `${text.slice(0, preLen)}...${text.slice(-postLen)}`;
};


/* ---------------------------------- Test ---------------------------------- */

/** ### helper unit tests.
 *
 * @returns {void}
 *    Does not return anything.
 * @throws {Error}
 *    Throws an `Error` if a test fails.
 */
export function helpersTest() {
    const e2l = e => (e.stack.split('\n')[2].match(/([^\/]+\.js:\d+):\d+\)?$/)||[])[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = (actual, exp) => { try { actual() } catch (err) {
        if (typeof exp.test=='function'?!exp.test(err.message):err.message!==exp)
        { throw Error(`actual message:\n${err.message}\n!== expected message:\n${
            exp}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${exp}\nbut nothing was thrown\n`) };


    /* -------------------- determineWhetherDeeplyAlike() ------------------- */

    const dwda = determineWhetherDeeplyAlike;

    // Should return `true` or `false` if `actually` or `expected` is `null`.
    equal(dwda(null, null), true);
    equal(dwda(void 0, null), false);
    equal(dwda(0, null), false);
    equal(dwda(null, 'null'), false);

    // Should return `true` or `false` if `actually` or `expected` is `NaN`.
    equal(dwda(NaN, NaN), true);
    equal(dwda(-Infinity, NaN), false);
    equal(dwda(0, NaN), false);
    equal(dwda(NaN, 'NaN'), false);

    // Should return `true` or `false` if `actually` is a bigint.
    equal(dwda(BigInt(12), BigInt(12)), true);
    equal(dwda(BigInt(34), BigInt('34')), true);
    equal(dwda(BigInt(56), BigInt(-56)), false);
    equal(dwda(BigInt(78), 78), false);

    // Should return `true` or `false` if `actually` is a boolean.
    equal(dwda(Boolean('abc'), true), true);
    equal(dwda(!1, false), true);
    equal(dwda(true, false), false);
    equal(dwda(Boolean(true), !1), false);
    equal(dwda(false, () => false), false);
    equal(dwda(true, 'true'), false);

    // Should return `true` or `false` if `actually` is a number.
    equal(dwda(Number(1.2), 1.2), true);
    equal(dwda(-0.09, -9e-2), true);
    equal(dwda(Infinity, Infinity), true);
    equal(dwda(-Infinity, -Infinity), true);
    equal(dwda(0, -0), true);
    equal(dwda(0xff, 255), true);
    equal(dwda(0xff, '255'), false);

    // Should return `true` or `false` if `actually` is a string.
    equal(dwda(String(1.2), '1.2'), true);
    equal(dwda('', ''), true);
    equal(dwda('A', Symbol('A')), false);
    equal(dwda('abc', ['a','b','c']), false);

    // Should return `true` or `false` if `actually` is a symbol.
    const abcSymbol = Symbol('abc');
    equal(dwda(abcSymbol, abcSymbol), true);
    equal(dwda(abcSymbol, Symbol('abc')), false);
    const emptySymbol = Symbol('');
    equal(dwda(emptySymbol, emptySymbol), true);
    equal(dwda(Symbol(''), Symbol('')), false);
    equal(dwda(Symbol('abc'), 'abc'), false);

    // Should return `true` or `false` if `actually` is a undefined.
    equal(dwda(void 0, void 0), true);
    equal(dwda([][0], {}.nope), true);
    equal(dwda([][0], {}.constructor), false);
    equal(dwda([][0], [].length), false);

    // Should return `true` if the arguments reference the same thing.
    // TODO maybe test functions bound to different things
    const arr = []; class Cls {}; const fn = () => {}; const obj = {};
    equal(dwda(arr, arr), true);
    equal(dwda(Cls, Cls), true);
    equal(dwda(fn, fn), true);
    equal(dwda(obj, obj), true);
    equal(dwda(arr, Cls), false);
    equal(dwda(Cls, fn), false);
    equal(dwda(fn, obj), false);
    equal(dwda(obj, arr), false);

    // Should return `true` or `false` if `actually` is an array.
    // TODO test that infinite recursion is handled ok
    equal(dwda([], []), true);
    equal(dwda([], function () { return [] }), false);
    equal(dwda(Array(10), Array(10)), true);
    equal(dwda(Array(10), Array(7)), false);
    equal(dwda([[[[],[]]],[]], [[[[],[]]],[]]), true);
    equal(dwda([[[[],[]]],[]], [[[[]]],[]]), false);
    equal(dwda([1,'b',[3]], [1,'b',[3]]), true);
    equal(dwda([1,'b',[3]], [1,[3],'b']), false);
    equal(dwda('123'.split(''), ['1','2','3']), true);
    equal(dwda('123'.split(''), ['1','2',3]), false);

    // Should return `true` or `false` even if an array has are cyclic references.
    const arrA1 = []; const arrB1 = [ arrA1 ]; arrA1[0] = arrB1;
    const arrA2 = []; const arrB2 = [ arrA2 ]; arrA2[0] = arrB2;
    equal(dwda(arrA1, arrA2), true);
    equal(dwda(arrA1, [ [ [ [] ] ] ]), false);
    equal(dwda([ [ [ [] ] ] ], arrA1), false);

    // Should return `true` or `false` if `actually` is an object.
    equal(dwda({}, {}), true);
    equal(dwda({}, () => ({})), false);
    equal(dwda({ a:1, b:2, c:3 }, { a:1, b:2, c:3 }), true);
    equal(dwda({ a:1, b:2, c:3 }, { a:1, b:2, c:3, d:4 }), false); // extra
    equal(dwda({ a:1, b:2, c:3 }, { a:1, b:2 }), false); // missing
    equal(dwda({ a:1, b:{ c:3 } }, { a:1, b: { c:3 } }), true);
    equal(dwda({ a:1, b:{ c:3 } }, { a:1, b: { c:'3' } }), false);
    equal(dwda({ a:1, b:[2,3] }, { a:1, b:[2,3] }), true);
    equal(dwda({ a:1, b:[2,3] }, { a:1, b:[2,'3'] }), false);
    class Polygon { constructor(sides) { this.sides = sides } }
    equal(dwda(new Polygon(3), new Polygon(3)), true);
    equal(dwda(new Polygon(3), new Polygon(4)), false);
    class Shape { constructor(sides) { this.sides = sides } }
    equal(dwda(new Polygon(3), new Shape(3)), false); // different constructors

    // Should ignore non-enumerable properties.
    // non-enumerable property
    const hasNonEnumerable = Object.create({}, {
        getNonEnumerable: {
            value() { return this.nonEnumerable },
            enumerable: false,
        },
    });
    hasNonEnumerable.nonEnumerable = 1;
    equal(dwda(hasNonEnumerable, { getNonEnumerable:() => 1, nonEnumerable:1 }), false);
    equal(dwda(hasNonEnumerable, { nonEnumerable:1 }), true);

    // Should return `true` or `false` even if an object has are cyclic references.
    const objA1 = {}; const objB1 = { a:objA1 }; objA1.b = objB1;
    const objA2 = {}; const objB2 = { a:objA2 }; objA2.b = objB2;
    equal(dwda(objA1, objA2), true);
    equal(dwda(objA1, { b:{ a:{ b:{} } } }), false);
    equal(dwda({ b:{ a:{ b:{} } } }, objA1), false);


    /* ------------------------ getCircularReplacer() ----------------------- */

    const gcr = getCircularReplacer;

    // Should detect a circular reference in an array.
    const arrA3 = []; const arrB3 = [ arrA3 ]; arrA3[0] = arrB3;
    equal(JSON.stringify(arrA3, gcr()),
        '[["[Circular]"]]');
    const circularReferenceInArr = [];
    circularReferenceInArr.push(123);
    circularReferenceInArr.push([ 456, circularReferenceInArr, 789 ]);
    equal(JSON.stringify(circularReferenceInArr, gcr()),
        '[123,[456,"[Circular]",789]]');

    // Should detect a circular reference in an object.
    const objA3 = {}; const objB3 = { a:objA3 }; objA3.b = objB3;
    equal(JSON.stringify(objA3, gcr()),
        '{"b":{"a":"[Circular]"}}');
    const circularReferenceInObj = { otherData: 123 };
    circularReferenceInObj.myself = circularReferenceInObj;
    equal(JSON.stringify(circularReferenceInObj, gcr()),
        '{"otherData":123,"myself":"[Circular]"}');

    // Should ignore two references to the same array.
    const a = [1];
    const notCircularReferenceInArr = [a, a];
    equal(JSON.stringify(notCircularReferenceInArr, gcr()),
        '[[1],[1]]');

    // Should ignore two references to the same object.
    const o = {};
    const notCircularReference = { a:o, b:o };
    equal(JSON.stringify(notCircularReference, gcr()),
        '{"a":{},"b":{}}');


    /* ----------------------------- truncate() ----------------------------- */

    // Should throw an `Error` if the arguments are invalid.
    // @ts-expect-error
    throws(()=>truncate(), /undefined/); // TODO test in all browsers
    // @ts-expect-error
    throws(()=>truncate(123), /function/); // TODO test in all browsers
    throws(()=>truncate('abc', 11), 'truncate(): `length` 11 is < 12');

    // Should return `text` as-is, if it is not longer than `length`.
    equal(truncate('', 120), '');
    equal(truncate('123456789012', 12), '123456789012');

    // Should shorten `text`, if it is longer than `length`.
    equal(truncate('1234567890123', 12), '12345...0123');
    equal(truncate('abcdefghijklmnopqrstuvwxyz', 25), 'abcdefghijklmn...stuvwxyz');
    equal(truncate('abcdefghijklmnopqrstuvwxyz', 20), 'abcdefghijk...uvwxyz');
    equal(truncate('abcdefghijklmnopqrstuvwxyz', 12), 'abcde...wxyz');

}