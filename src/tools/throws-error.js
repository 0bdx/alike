import narrowAintas, { aintaArray, aintaFunction, aintaObject, aintaString }
    from '@0bdx/ainta';
import { Are, Renderable } from "../classes/index.js";
import { truncate } from '../helpers.js';

// Define a regular expression for validating each item in `notes`.
const noteRx = /^[ -\[\]-~]*$/;
noteRx.toString = () => "'Printable ASCII characters except backslashes'";

// Define two constants which will act as enums.
const PASS = 'PASS';
const FAIL = 'FAIL';

/** ### Determines whether a function throws the expected error.
 *
 * `throwsError()` operates in one of two modes:
 * 1. If it has been bound to an object with an `addResult()` method, it sends
 *    that method the full test results, and then returns an overview.
 * 2. Otherwise, it either throws an `Error` if the test fails, or returns
 *    an overview if the test passes.
 *
 * @TODO finish the description, with examples
 *
 * @param {function} actually
 *    A function which is expected to throw an `Error` exception when called.
 * @param {string|{test:(arg0:string)=>boolean,toString:()=>string}} expected
 *    Either the `Error` object's expected message, or a regular expression
 *    to test that message.
 *    - Instead of a `RegExp`, any object with a `test()` method can be used
 * @param {string|string[]} [notes]
 *    An optional description of the test, as a string or array of strings.
 *    - A string is treated identically to an array containing just that string
 *    - 0 to 100 items, where each item is a line
 *    - 0 to 120 printable ASCII characters (except the backslash `"\"`) per line
 *    - An empty array `[]` means that no notes have been supplied
 *    - The first item (index 0), if present, is used for the overview
 * @returns {string}
 *    Returns an overview of the test result.
 * @throws {Error}
 *    Throws an `Error` if the arguments or the `this` context are invalid.
 *    Also, unless the `this` context is an object with an `addResult()` method,
 *    throws an `Error` if the test fails.
 */
export default function throwsError(actually, expected, notes) {
    const begin = 'throwsError()';

    // Validate the `actually` and `expected` arguments.
    const aActually = aintaFunction(actually, 'actually', { begin });
    if (aActually) throw Error(aActually);
    const [ aExpected, isStrOrRxLike ] = narrowAintas(
        { begin, schema:{ test: { types:['function'] } } },
        [ aintaObject, aintaString ]); // array means 'OR' to `narrowAintas()`
    isStrOrRxLike(expected, 'expected');
    if (aExpected.length) throw Error(aExpected.join('\n'));

    // Validate the `notes` argument. `this.addResult()`, if it exists, will
    // do some similar validation, but its error message would be confusing.
    const notesIsArray = Array.isArray(notes); // used again, further below
    const options = { begin, max:120, most:100, pass:true, rx:noteRx };
    const aNotes = notesIsArray // @TODO make ainta able to handle 'or' types
        ? aintaArray(notes, 'notes', { ...options, types:['string'] })
        : typeof notes !== 'undefined'
            ? aintaString(notes, 'notes', options)
            : '' // no `notes` argument was passed in
    if (aNotes) throw Error(aNotes);

    // Determine if `actually()` throws an exception. If so, store it in `err`.
    let didThrow = false;
    let didThrowError = false;
    let err;
    try { actually() } catch (thrownErr) {
        didThrow = true;
        err = thrownErr;
    }

    // Generate `result`, which will be the main part of the `overview`. Also,
    // set `status`, which is 'PASS' if the expected error message is thrown.
    let result = '';
    /** @type {'FAIL'|'PASS'|'PENDING'|'UNEXPECTED_EXCEPTION'} */
    let status = FAIL;
    if (didThrow) {
        const type = typeof err;
        result = err === null
            ? '`null`'
            : Array.isArray(err)
                ? 'an array'
                : type !== 'object'
                    ? "type '" + type + "'"
                    : err instanceof Error
                        ? ''
                        : "an instance of '" + err.constructor.name + "'";
        if (!result) {
            didThrowError = true;
            if (typeof expected === 'string'
                ? err.message === expected
                : expected.test(err.message)
            ) status = PASS;
        }
    }

    // Generate the overview which `throwsError()` will throw or return.
    const firstNotesLine = Array.isArray(notes)
        ? (notes[0] || '') // `notes` is an array
        : (notes || ''); // `notes` should be undefined or a string
    const exp = typeof expected === 'object'
        ? truncate(expected.toString(),114) // could be a RegExp, or just rx-like
        : expected // must be a string
            ? `"${truncate(expected,114)}"`
            : 'an empty string'
    ;
    const overview = status +
        `: ${firstNotesLine && truncate(firstNotesLine,114) + '\n    : '}` +
        (status === PASS
            ? typeof expected === 'string'
                ? `\`actually()\` throws ${exp} as expected`
                : `\`actually()\` throws "${truncate(err.message,92)}"\n    : ` +
                  `\`expected\`, ${expected.constructor.name} ${exp}, allows it`
            : !didThrow
                ? '`actually()` did not throw an exception' +
                  '\n    : `expected` is ' + exp
                : !didThrowError
                    ? `\`actually()\` throws ${result}, not an \`Error\` object`
                    : `\`actually()\` throws "${truncate(err.message,92)}"\n` +
                      '    : `expected`' + (typeof expected === 'string'
                        ? ' value is ' + exp
                        : `, ${expected.constructor.name} ${exp}, disallows it`
                    )
        );

    // If there's no `this.addResult()` then `throwsError()` is not bound,
    // so throw `overview` if the test failed or return it if the test passed.
    if (typeof this?.addResult !== 'function') {
        if (status === FAIL) throw Error(overview);
        return overview;
    }

    // Normalise the `notes` argument into an array.
    const notesArr = Array.isArray(notes)
        ? notes // was already an array
        : typeof notes === 'undefined'
            ? [] // no `notes` argument was passed in
            : [ notes ] // hopefully a string, but that will be validated below

    // Add the test result to the object that this function has been bound to.
    // @TODO this will need to be improved
    /** @type {Are} */
    const are = this;
    are.addResult(
        Renderable.from(err), // will be `undefined` if nothing was thrown
        Renderable.from(expected),
        [ ...notesArr, overview ],
        status,
    );

    // Return an overview of the test result.
    return overview;
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `throwsError()` unit tests.
 *
 * @param {typeof Are} A
 *    The `Are` class, because `Are` in are.js !== `Are` in src/.
 * @param {throwsError} f
 *    The `throwsError()` function to test.
 * @param {typeof Renderable} R
 *    The `Renderable` class, because `Renderable` in are.js !== in src/.
 * @returns {void}
 *    Does not return anything.
 * @throws {Error}
 *    Throws an `Error` if a test fails.
 */
export function throwsErrorTest(A, f, R) {
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
    const toLines = (...lines) => lines.join('\n');

    const simpleResultMocker = (kind, stop, text) => toLines(
        `    "highlights": [`,
        `      {`,
        `        "kind": "${kind}",`,
        `        "start": 0,`,
        `        "stop": ${stop}`,
        `      }`,
        `    ],`,
        `    "text": "${text}"`,
        `  },`,
    );

    // Create a version of `throwsError()` which is bound to an `Are` instance.
    const are = new A('Test Suite');
    /** @type f */
    const bound = f.bind(are);

    // Whether `throwsError()` is bound or not, an exception should be thrown if
    // `actually` is not a function.
    throws(()=>f(null,'',''),
        "throwsError(): `actually` is null not type 'function'");
    // @ts-expect-error
    throws(()=>bound('','',''),
        "throwsError(): `actually` is type 'string' not 'function'");

    // Whether `throwsError()` is bound or not, an exception should be thrown
    // if `actually` is not a function.
    throws(()=>bound(null,'',''),
        "throwsError(): `actually` is null not type 'function'");
    // @ts-expect-error
    throws(()=>f([],'',''),
        "throwsError(): `actually` is an array not type 'function'");
    // @ts-expect-error
    throws(()=>bound(123,'',''),
        "throwsError(): `actually` is type 'number' not 'function'");

    // Whether `throwsError()` is bound or not, an exception should be thrown
    // if `expected` is not a string or RegExp-like object.
    // @ts-expect-error
    throws(()=>bound(()=>{},[],''),
        "throwsError(): `expected` is an array not a regular object; or type 'string'");
    // @ts-expect-error
    throws(()=>f(()=>{},Symbol('Not a string or RegExp-like object'),''),
        "throwsError(): `expected` is type 'symbol' not 'object'; or 'string'");
    // @ts-expect-error
    throws(()=>bound(()=>{},{},''),
        "throwsError(): `expected.test` is type 'undefined', not the `options.types` 'function'; " +
        "or ` is type 'object' not 'string'"); //@TODO minor ainta fix
    // @ts-expect-error
    throws(()=>f(()=>{},{Test:(str)=>str==='foo'},''), // uppercase `T`
        "throwsError(): `expected.Test` is unexpected; or ` is type 'object' not 'string'"); //@TODO minor ainta fix

    // Whether `throwsError()` is bound or not, an exception should be thrown
    // if `notes` is not a valid string or array of strings.
    // @ts-expect-error
    throws(()=>f(()=>{},'',3),
        "throwsError(): `notes` is type 'number' not 'string'");
    throws(()=>bound(()=>{},'',null),
        "throwsError(): `notes` is null not type 'string'");
    throws(()=>f(()=>{},'',['ok','ok',void 0,'ok']),
        "throwsError(): `notes[2]` is type 'undefined', not the `options.types` 'string'");
    // @ts-expect-error
    throws(()=>bound(()=>{},'',['ok','ok',['nope!'],'ok']),
        "throwsError(): `notes[2]` is an array, not the `options.types` 'string'");
    throws(()=>f(()=>{},'','1234567890'.repeat(12) + '1'),
        "throwsError(): `notes` '123456789012345678901...45678901' is not max 120");
    throws(()=>bound(()=>{},'',['1234567890'.repeat(12),'','1234567890'.repeat(12) + '1']),
        "throwsError(): `notes[2]` '123456789012345678901...45678901' is not max 120");
    throws(()=>f(()=>{},'',['\n']),
        "throwsError(): `notes[0]` '%0A' fails 'Printable ASCII characters except backslashes'");
    throws(()=>bound(()=>{},'','\\'),
        "throwsError(): `notes` '%5C' fails 'Printable ASCII characters except backslashes'");
    throws(()=>f(()=>{},'',['Ok','Café']),
        "throwsError(): `notes[1]` 'Caf%C3%A9' fails 'Printable ASCII characters except backslashes'");


    // UNBOUND, PASS

    // Unbound, if `expected` is an empty string, an overview is returned if `actually()` throws an empty `Error.message`.
    equal(f(()=>{throw Error('')},''),
        'PASS: `actually()` throws an empty string as expected');
    equal(f(()=>{throw RangeError('')},'',''), // `notes` is an empty string
        'PASS: `actually()` throws an empty string as expected');
    equal(f(()=>{throw TypeError('')},'','Throws an empty-string `Error.message`'), toLines(
        'PASS: Throws an empty-string `Error.message`',
        '    : `actually()` throws an empty string as expected'));

    // Unbound, if `expected` is a string, an overview is returned if `actually()` throws the same `Error.message`.
    equal(f(()=>{throw ReferenceError('Oh no!')},'Oh no!'),
        'PASS: `actually()` throws "Oh no!" as expected');
    equal(f(()=>{throw Error('Some "Error"')},'Some "Error"',['']), // `notes` is an array containing an empty string
        'PASS: `actually()` throws "Some "Error"" as expected'); // @TODO fix double double quote!
    equal(f(()=>{throw EvalError('Oh no!')},'Oh no!','Throws the expected `Error.message`'), toLines(
        'PASS: Throws the expected `Error.message`',
        '    : `actually()` throws "Oh no!" as expected'));

    // Unbound, if `expected` is RegExp-like, an overview is returned if `actually()` throws a correct `Error.message`.
    equal(f(()=>{throw SyntaxError('"')},{test:(s)=>s==='"'}), toLines(
        'PASS: `actually()` throws """', // @TODO fix double double quote!
        '    : `expected`, Object [object Object], allows it'));
    equal(f(()=>{throw TypeError('abc Is /thrown/ xyz')},/Is \/thrown\//,[]), toLines( // `notes` is an empty array
        'PASS: `actually()` throws "abc Is /thrown/ xyz"',
        '    : `expected`, RegExp /Is \\/thrown\\//, allows it'));
    equal(f(()=>{throw Error('CDE')},new RegExp('[abc]','i'),'"Throws ok"'), toLines(
        'PASS: "Throws ok"',
        '    : `actually()` throws "CDE"',
        '    : `expected`, RegExp /[abc]/i, allows it'));


    // BOUND, PASS

    // Bound, if `expected` is an empty string, an overview is returned if `actually()` throws an empty `Error.message`.
    const resultEmptyStrings = bound(()=>{throw Error('')},'');
    const resultEmptyStringsStr = toLines(
        `{`,
        `  "actually": {`,
        `    "highlights": [],`,
        `    "text": "{}"`,
        `  },`,
        `  "expected": {`,
        simpleResultMocker('STRING', 2, '\\"\\"'),
        '  "notes": "PASS: `actually()` throws an empty string as expected",',
        `  "sectionIndex": 0,`,
        `  "status": "PASS"`,
        `}`
    );
    equal(resultEmptyStrings, 'PASS: `actually()` throws an empty string as expected');
    equal(are.resultsAndSections.length, 1);
    equal(toStr(are.resultsAndSections[0]), resultEmptyStringsStr);
    equal(are.resultsAndSections[0] === resultEmptyStrings, false); // not the same object

    // @TODO lots more bound unit tests


    // UNBOUND, DOES NOT THROW

    // Unbound, if `expected` is an empty string, an overview is thrown if `actually()` does not throw.
    throws(()=>f(()=>{},''), toLines( // minimal arguments
        'FAIL: `actually()` did not throw an exception',
        '    : `expected` is an empty string'));
    throws(()=>f(()=>{},'',[]), toLines( // `notes` is an empty array
        'FAIL: `actually()` did not throw an exception',
        '    : `expected` is an empty string'));
    throws(()=>f(()=>{},'','Does not throw'), toLines(
        'FAIL: Does not throw',
        '    : `actually()` did not throw an exception',
        '    : `expected` is an empty string'));

    // Unbound, if `expected` is a string, an overview is thrown if `actually()` does not throw.
    throws(()=>f(()=>{},'Never thrown'), toLines(
        'FAIL: `actually()` did not throw an exception',
        '    : `expected` is "Never thrown"'));
    throws(()=>f(()=>{},'Never "thrown"',''), toLines( // `notes` is an empty string
        'FAIL: `actually()` did not throw an exception',
        '    : `expected` is "Never "thrown""')); // @TODO fix double double quote!
    throws(()=>f(()=>{},'Never thrown',['Does not throw','IGNORED!']), toLines(
        'FAIL: Does not throw',
        '    : `actually()` did not throw an exception',
        '    : `expected` is "Never thrown"'));

    // Unbound, if `expected` is RegExp-like, an overview is thrown if `actually()` does not throw.
    throws(()=>f(()=>{},{test:()=>false,toString:()=>'-=- Custom toString() method! -=-'}), toLines(
        'FAIL: `actually()` did not throw an exception',
        '    : `expected` is -=- Custom toString() method! -=-'));
    throws(()=>f(()=>{},/Never \/thrown\//,['']), toLines( // `notes` is an array containing an empty string
        'FAIL: `actually()` did not throw an exception',
        '    : `expected` is /Never \\/thrown\\//'));
    throws(()=>f(()=>{},new RegExp('Never /thrown/'),'Does not "throw"'), toLines(
        'FAIL: Does not "throw"',
        '    : `actually()` did not throw an exception',
        '    : `expected` is /Never \\/thrown\\//'));


    // UNBOUND, THROWS A NON-ERROR

    // Unbound, if `expected` is an empty string, an overview is thrown if `actually()` does not throw.
    throws(()=>f(()=>{throw 'throws a string'},'',void 0), // `notes` is undefined
        "FAIL: `actually()` throws type 'string', not an `Error` object");
    throws(()=>f(()=>{throw null},'',['','IGNORED']), // `notes[0]` is an empty string
        'FAIL: `actually()` throws `null`, not an `Error` object');
    throws(()=>f(()=>{throw [123]},'','Throws an array'), toLines(
        'FAIL: Throws an array',
        '    : `actually()` throws an array, not an `Error` object'));
    throws(()=>f(()=>{throw new Promise(()=>{})},'',['Throws a Promise','notes[1] is note used']), toLines(
        'FAIL: Throws a Promise',
        "    : `actually()` throws an instance of 'Promise', not an `Error` object"));


    // UNBOUND, THROWS UNEXPECTED ERROR

    // Unbound, if `expected` is an empty string, an overview is thrown if `actually()` throws a different `Error.message`.
    throws(()=>f(()=>{throw URIError('Unexpected')},''), toLines(
        'FAIL: `actually()` throws "Unexpected"',
        '    : `expected` value is an empty string'));
    throws(()=>f(()=>{throw TypeError('Surprise!')},'',['','']), toLines( // `notes` is an array of empty strings
        'FAIL: `actually()` throws "Surprise!"',
        '    : `expected` value is an empty string'));
    throws(()=>f(()=>{throw Error('Oh no!')},'','Throws an "Oh no!" TypeError'), toLines(
        'FAIL: Throws an "Oh no!" TypeError',
        '    : `actually()` throws "Oh no!"',
        '    : `expected` value is an empty string'));

    // Unbound, if `expected` is a string, an overview is thrown if `actually()` throws a different `Error.message`.
    class CustomError extends Error {}
    throws(()=>f(()=>{throw new CustomError('Unexpected')},'expected'), toLines(
        'FAIL: `actually()` throws "Unexpected"',
        '    : `expected` value is "expected"'));
    throws(()=>f(()=>{throw Error('')},'Emptiness"',''), toLines( // `notes` is an empty string
        'FAIL: `actually()` throws ""', // @TODO maybe make this "FAIL: `actually()` throws an empty string"
        '    : `expected` value is "Emptiness""')); // @TODO fix double double quote!
    throws(()=>f(()=>{throw RangeError(' ')},'-',['!']), toLines(
        'FAIL: !',
        '    : `actually()` throws " "',
        '    : `expected` value is "-"'));

    // Unbound, if `expected` is RegExp-like, an overview is thrown if `actually()` throws an incorrect `Error.message`.
    throws(()=>f(()=>{throw Error('Unexpected')},{test:()=>false,toString:()=>'-=- Custom toString() method! -=-'}), toLines(
        'FAIL: `actually()` throws "Unexpected"',
        '    : `expected`, Object -=- Custom toString() method! -=-, disallows it'));
    throws(()=>f(()=>{throw ReferenceError('')},/foo \/bar\//,[]), toLines( // `notes` is an empty array
        'FAIL: `actually()` throws ""', // @TODO maybe make this "FAIL: `actually()` throws an empty string"
        '    : `expected`, RegExp /foo \\/bar\\//, disallows it'));
    throws(()=>f(()=>{throw URIError('YIKES!')},new RegExp('^yikes!$'),'Throws an interjection'), toLines(
        'FAIL: Throws an interjection',
        '    : `actually()` throws "YIKES!"',
        '    : `expected`, RegExp /^yikes!$/, disallows it'));
}
