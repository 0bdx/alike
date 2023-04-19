import equal from '../private-methods/equal.js';

/**
 * A single 'stroke of the highlighter pen' when rendering JavaScript values.
 */
export default class Highlight {
    /**
     * Creates a `Highlight` instance.
     *     A single 'stroke of the highlighter pen' when rendering JS values.
     * @param {number} begin
     *     Non-negative integer, the position that highlighting starts.
     * @param {number} end
     *     Non-negative integer greater than `begin`, where highlighting stops.
     * @param {'ARRAY'|'BOOLNUM'|'DOM'|'ERROR'|'EXCEPTION'|'FUNCTION'|'NULLISH'|
     *     'OBJECT'|'STRING'|'SYMBOL'} kind
     *     How the value should be rendered. Booleans and numbers highlight the
     *     same way. A `BigInt` is a number rendered with the "n" suffix. A
     *     `RegExp` highlights like an `Object` but looks like `/a/` not `{}`.
     */
    constructor(begin, end, kind) {
        this.begin = begin;
        this.end = end;
        this.kind = kind;
    }
}

/**
 * Determines whether the argument is a valid Highlight instance.
 * 
 * Not that a plain object with valid properties is treated as a valid instance,
 * this is known as "duck typing".
 *
 * @param {Highlight} highlight
 *     An instance of `Highlight` to validate.
 * @returns {string|void}
 *     `undefined` means `highlight` is valid. Otherwise, the reason is returned.
 */
export function validateHighlight(highlight) {
    const ep = 'Error: validateHighlight():'; // error prefix

    // Check that `highlight` is a plain object.
    if (highlight === null) return `${ep
        } highlight is null not a plain object`;
    if (Array.isArray(highlight)) return `${ep
        } highlight is an array not a plain object`;
    if (typeof highlight !== 'object') return `${ep
        } highlight is type '${typeof highlight}' not 'object'`;

    const { begin, end, kind } = highlight;

    // Check each property's type.
    if (typeof begin !== 'number') return `${ep
        } highlight.begin is type '${typeof begin}' not 'number'`;
    if (typeof end !== 'number') return `${ep
        } highlight.end is type '${typeof end}' not 'number'`;
    if (typeof kind !== 'string') return `${ep
        } highlight.kind is type '${typeof kind}' not 'string'`;

    // Check each property in more detail.
    if (begin !== ~~begin || begin < 0) return `${ep
        } highlight.begin '${begin}' is not a non-negative integer`;
    if (end !== ~~end || end < 0) return `${ep
        } highlight.end '${end}' is not a non-negative integer`;
    if (end <= begin) return `${ep} highlight.end '${end
        }' is less than or equal to highlight.begin '${begin}'`;
    if (!['ARRAY','BOOLNUM','DOM','ERROR','EXCEPTION','FUNCTION','NULLISH',
        'OBJECT','STRING','SYMBOL'].includes(kind)) return  `${ep
            } highlight.kind not recognised, use "ARRAY|BOOLNUM|...|SYMBOL"`;
}

/**
 * Runs unit tests on `validateHighlight()`.
 * 
 * @param {validateHighlight} f  The function to test.
 * @returns {void}  Does not return anything.
 * @throws  Throws an `Error` if a test fails.
 */
export function testValidateHighlight(f) {
    const ep = 'Error: validateHighlight():'; // error prefix

    // `highlight` is an incorrect type.
    // @ts-expect-error
    equal(f(), `${ep
        } highlight is type 'undefined' not 'object'`);
    equal(f(null), `${ep
        } highlight is null not a plain object`);
    // @ts-expect-error
    equal(f([12]), `${ep
        } highlight is an array not a plain object`);
    // @ts-expect-error
    equal(f(123), `${ep
        } highlight is type 'number' not 'object'`);

    // `highlight` properties are incorrect types.
    // @ts-expect-error
    equal(f({}),
        `${ep} highlight.begin is type 'undefined' not 'number'`);
    // @ts-expect-error
    equal(f({ begin:0, end:[] }),
        `${ep} highlight.end is type 'object' not 'number'`);
    equal(f({ begin:0, end:1, kind:null }),
        `${ep} highlight.kind is type 'object' not 'string'`);

    // The numeric properties are not non-negative integers.
    equal(f({ begin:0.1, end:1, kind:'ARRAY' }),
        `${ep} highlight.begin '0.1' is not a non-negative integer`);
    equal(f({ begin:-3, end:1, kind:'BOOLNUM' }),
        `${ep} highlight.begin '-3' is not a non-negative integer`);
    equal(f({ begin:Infinity, end:1, kind:'DOM' }),
        `${ep} highlight.begin 'Infinity' is not a non-negative integer`);
    equal(f({ begin:0, end:Math.PI, kind:'ERROR' }),
        `${ep} highlight.end '${Math.PI}' is not a non-negative integer`);
    equal(f({ begin:0, end:NaN, kind:'EXCEPTION' }),
        `${ep} highlight.end 'NaN' is not a non-negative integer`);
    equal(f({ begin:0, end:-5, kind:'FUNCTION' }),
        `${ep} highlight.end '-5' is not a non-negative integer`);

    // `end` is the same as or less than `begin`.
    equal(f({ begin:7, end:2, kind:'NULLISH' }),
        `${ep} highlight.end '2' is less than or equal to highlight.begin '7'`);
    equal(f({ begin:0, end:0, kind:'OBJECT' }),
        `${ep} highlight.end '0' is less than or equal to highlight.begin '0'`);
    // @ts-expect-error
    equal(f({ begin:0, end:1, kind:'String' }),
        `${ep} highlight.kind not recognised, use "ARRAY|BOOLNUM|...|SYMBOL"`);

}
