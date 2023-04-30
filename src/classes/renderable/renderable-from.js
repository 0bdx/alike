import Highlight from '../highlight.js';

/** ### Prepares arguments for a new `Renderable`, from any JavaScript value.
 *
 * @param {any} value
 *    The JavaScript value which needs rendering.
 * @returns {{highlights:Highlight[],text:string}}
 *    Arguments ready to pass into `new Renderable()`.
 */
export default function renderableFrom(value) {

    // Deal with `null`, which might otherwise be confused with an object.
    if (value === null) return { highlights:
        [ new Highlight('NULLISH', 0, 4) ], text:'null'};

    // Deal with a scalar: bigint, boolean, number, symbol or undefined.
    const type = typeof value;
    switch (type) {
        case 'bigint':
        case 'number': // treat `NaN` like a regular number
            const n = value.toString() + (type === 'bigint' ? 'n' : '');
            return { highlights:[ new Highlight('BOOLNUM', 0, n.length) ], text:n};
        case 'boolean':
            return value
                ? { highlights:[ new Highlight('BOOLNUM', 0, 4) ], text:'true' }
                : { highlights:[ new Highlight('BOOLNUM', 0, 5) ], text:'false' };
        case 'undefined':
            return { highlights:[ new Highlight('NULLISH', 0, 9) ], text:'undefined' };
        case 'symbol':
            const s = value.toString();
            return { highlights:[ new Highlight('SYMBOL', 0, s.length) ], text:s };
    }

    // Deal with a string.
    if (type === 'string') {

        // If the string contains double-quotes but no single-quotes, wrap it
        // in single-quotes.
        if (value.includes('"') && !value.includes("'")) return { highlights:
            [ new Highlight('STRING', 0, value.length+2) ], text:`'${value}'` };

        // Otherwise, `JSON.stringify()` will escape any double-quotes
        // (plus backslashes), and then wrap it in double-quotes.
        const text = JSON.stringify(value);
        return { highlights: [ new Highlight('STRING', 0, text.length) ], text }
    }

    // Deal with a function.
    if (type === 'function') {
        const params = new RegExp('(?:'+value.name+'\\s*|^)\\s*\\((.*?)\\)')
            .exec(String.toString.call(value)
            .replace(/\n/g, ''))[1]
            .replace(/\/\*.*?\*\//g, '')
            .replace(/ /g, '');
        const name = value.name || '<anon>';
        const f = `${name}(${params})`;
        return { highlights: [ new Highlight('FUNCTION', 0, f.length) ], text:f }
    }

    return { highlights:[], text:'@TODO' };
}


/* ---------------------------------- Test ---------------------------------- */

/** ### `renderableFrom()` unit tests.
 * 
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function renderableFromTest() {
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

    const f = renderableFrom;

    // `null` should return a 4-character 'NULLISH' `Renderable`.
    equal(toStr(f(null)), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "NULLISH",`,
        `      "start": 0,`,
        `      "stop": 4`,
        `    }`,
        `  ],`,
        `  "text": "null"`,
        `}`,
    ));

    // BigInts should return 'BOOLNUM' `Renderable` instances with varying lengths.
    equal(toStr(f(BigInt(0))), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "BOOLNUM",`,
        `      "start": 0,`,
        `      "stop": 2`,
        `    }`,
        `  ],`,
        `  "text": "0n"`,
        `}`,
    ));
    equal(toStr(f(BigInt(-12.34e5))), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "BOOLNUM",`,
        `      "start": 0,`,
        `      "stop": 9`,
        `    }`,
        `  ],`,
        `  "text": "-1234000n"`,
        `}`,
    ));

    // Boolean `true` and `false` should return a 4- or 5-character 'BOOLNUM' `Renderable`.
    equal(toStr(f(true)), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "BOOLNUM",`,
        `      "start": 0,`,
        `      "stop": 4`,
        `    }`,
        `  ],`,
        `  "text": "true"`,
        `}`,
    ));
    equal(toStr(f(false)), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "BOOLNUM",`,
        `      "start": 0,`,
        `      "stop": 5`,
        `    }`,
        `  ],`,
        `  "text": "false"`,
        `}`,
    ));

    // Numbers should return 'BOOLNUM' `Renderable` instances with varying lengths.
    equal(toStr(f(0)), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "BOOLNUM",`,
        `      "start": 0,`,
        `      "stop": 1`,
        `    }`,
        `  ],`,
        `  "text": "0"`,
        `}`,
    ));
    equal(toStr(f(-12.34e-5)), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "BOOLNUM",`,
        `      "start": 0,`,
        `      "stop": 10`,
        `    }`,
        `  ],`,
        `  "text": "-0.0001234"`,
        `}`,
    ));
    equal(toStr(f(-Infinity)), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "BOOLNUM",`,
        `      "start": 0,`,
        `      "stop": 9`,
        `    }`,
        `  ],`,
        `  "text": "-Infinity"`,
        `}`,
    ));
    equal(toStr(f(NaN)), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "BOOLNUM",`,
        `      "start": 0,`,
        `      "stop": 3`,
        `    }`,
        `  ],`,
        `  "text": "NaN"`,
        `}`,
    ));

    // Symbols should return 'SYMBOL' `Renderable` instances with varying lengths.
    equal(toStr(f(Symbol())), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "SYMBOL",`,
        `      "start": 0,`,
        `      "stop": 8`,
        `    }`,
        `  ],`,
        `  "text": "Symbol()"`,
        `}`,
    ));
    equal(toStr(f(Symbol("'"))), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "SYMBOL",`,
        `      "start": 0,`,
        `      "stop": 9`,
        `    }`,
        `  ],`,
        `  "text": "Symbol(')"`,
        `}`,
    ));
    equal(toStr(f(Symbol(`"'`))), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "SYMBOL",`,
        `      "start": 0,`,
        `      "stop": 10`,
        `    }`,
        `  ],`,
        `  "text": "Symbol(\\"')"`,
        `}`,
    ));

    // `undefined` should return a 9-character 'NULLISH' `Renderable`.
    equal(toStr(f()), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "NULLISH",`,
        `      "start": 0,`,
        `      "stop": 9`,
        `    }`,
        `  ],`,
        `  "text": "undefined"`,
        `}`,
    ));

    // Strings should return 'STRING' `Renderable` instances with varying lengths.
    const emptyStringRenderable = f('');
    equal(emptyStringRenderable.highlights[0].kind, 'STRING');
    equal(emptyStringRenderable.highlights[0].stop, 2);
    equal(emptyStringRenderable.text, '""');
    equal(toStr(emptyStringRenderable), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "STRING",`,
        `      "start": 0,`,
        `      "stop": 2`,
        `    }`,
        `  ],`,
        `  "text": "\\"\\""`,
        `}`,
    ));
    const containsDQRenderable = f('Contains "double-quotes".');
    equal(containsDQRenderable.highlights[0].kind, 'STRING');
    equal(containsDQRenderable.highlights[0].stop, 27);
    equal(containsDQRenderable.text, `'Contains "double-quotes".'`);
    equal(toStr(containsDQRenderable), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "STRING",`,
        `      "start": 0,`,
        `      "stop": 27`,
        `    }`,
        `  ],`,
        `  "text": "'Contains \\"double-quotes\\".'"`,
        `}`,
    ));
    const containsSQRenderable = f("Contains 'single-quotes'.");
    equal(containsSQRenderable.highlights[0].kind, 'STRING');
    equal(containsSQRenderable.highlights[0].stop, 27);
    equal(containsSQRenderable.text, `"Contains 'single-quotes'."`);
    const containsBQRenderable = f(`"Contains" 'both-quotes'.`);
    equal(containsBQRenderable.highlights[0].kind, 'STRING');
    equal(containsBQRenderable.highlights[0].stop, 29); // not 27
    equal(containsBQRenderable.text, `"\\"Contains\\" 'both-quotes'."`);
    const multiLineRenderable = f('Café ok!\n'.repeat(99));
    equal(multiLineRenderable.highlights[0].kind, 'STRING');
    equal(multiLineRenderable.highlights[0].stop, 992);
    equal(multiLineRenderable.text.slice(-21), 'Café ok!\\nCafé ok!\\n"');

    // Functions should return 'FUNCTION' `Renderable` instances with varying lengths.
    equal(toStr(f(()=>{})), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "FUNCTION",`,
        `      "start": 0,`,
        `      "stop": 8`,
        `    }`,
        `  ],`,
        `  "text": "<anon>()"`,
        `}`,
    ));
    equal(toStr(f(function foo(a, b=2, ...rest){})), toLines(
        `{`,
        `  "highlights": [`,
        `    {`,
        `      "kind": "FUNCTION",`,
        `      "start": 0,`,
        `      "stop": 18`,
        `    }`,
        `  ],`,
        `  "text": "foo(a,b=2,...rest)"`,
        `}`,
    ));

}
