import equal from './private-methods/equal.js';
import throws from './private-methods/throws.js';

/**
 * bindTestTools() unit tests.
 * 
 * @param   {import('./bind-test-tools').default}  f  bindTestTools()
 * @returns  {void}
 * @throws  Throws an `Error` if a test fails
 */
export default function bindTestToolsTest(f) {
    const ep = 'Error: bindTestTools():'; // error prefix
/*
    // titleOrState is an incorrect type.
    // @ts-expect-error
    throws(()=>f(),
        `${ep} titleOrState is type 'undefined' not 'string'`);
    throws(()=>f(null),
        `${ep} titleOrState is null not 'string' or a TestState object`);
    // @ts-expect-error
    throws(()=>f(true),
        `${ep} titleOrState is type 'boolean' not 'string'`);
    // @ts-expect-error
    throws(()=>f([]),
        `${ep} titleOrState is an array, not a string or plain object`);
    // @ts-expect-error
    throws(()=>f({}),
        `${ep} titleOrState.failTally is type 'undefined' not 'number'`);
    // @ts-expect-error
    throws(()=>f({ failTally:0, passTally:'123' }),
        `${ep} titleOrState.passTally is type 'string' not 'number'`);
    // @ts-expect-error
    throws(()=>f({ failTally:0, passTally:123, title:0 }),
        `${ep} titleOrState.title is type 'number' not 'string'`);
    const fpt = { failTally:0, passTally:123, title:'' };
    // @ts-expect-error
    throws(()=>f({ ...fpt, results:{} }),
        `${ep} titleOrState.results is type 'object' not an array`);

    // titleOrState is an object, but its `results` array fails.
    throws(()=>f({ ...fpt, results:[null] }),
        `${ep} titleOrState.results[0] is null not a plain object`);
    // @ts-expect-error
    throws(()=>f({ ...fpt, results:[true] }),
        `${ep} titleOrState.results[0] is type 'boolean' not 'object'`);
    // @ts-expect-error
    throws(()=>f({ ...fpt, results:[[]] }),
        `${ep} titleOrState.results[0] is an array, not a plain object`);
    const ae = { actually:void 0, expected:undefined };
    // @ts-expect-error
    throws(()=>f({ ...fpt, results:[{ ...ae, kind:'pass' }] }),
        `${ep} titleOrState.results[0].kind is not ERROR|FAIL|PASS|SECTION`);
    // @ts-expect-error
    throws(()=>f({ ...fpt, results:[{ ...ae, kind:'PASS', summary:123 }] }),
        `${ep} titleOrState.results[0].summary is type 'number' not 'string'`);
    // @ts-expect-error
    throws(()=>f({ ...fpt, results:[{ expected:1, kind:'FAIL', summary:'' }] }),
        `${ep} titleOrState.results[0].actually does not exist`);
    // @ts-expect-error
    throws(()=>f({ ...fpt, results:[{ actually:1, kind:'PASS', summary:'' }] }),
        `${ep} titleOrState.results[0].expected does not exist`);
    const ok = { actually:void 0, expected:undefined, summary:'ok' };
    throws(()=>f({ ...fpt, results:[{ ...ok, kind:'SECTION', actually:1 }] }),
        `${ep} titleOrState.results[0].kind is 'SECTION' but `
        + `results[0].actually is type 'number' not 'undefined'`);
    throws(()=>f({ ...fpt, results:[{ ...ok, kind:'SECTION', expected:null }] }),
        `${ep} titleOrState.results[0].kind is 'SECTION' but `
        + `results[0].expected is type 'object' not 'undefined'`); // @TODO "is null"
    throws(()=>f({ ...fpt, results:[{ ...ae, kind:'SECTION', summary:'' }] }),
        `${ep} titleOrState.results[0].kind is 'SECTION' but `
        + `results[0].summary is an empty string`);

    // @ts-expect-error
    throws(()=>f('', 1e3),
        `${ep} tools[0] is type 'number' not 'function'`);

    // Arguments are ok, and bindTestTools() returns an array of functions.
    equal(JSON.stringify(f('')),
        '[]');
    equal(JSON.stringify(f({ ...fpt, results:[{
        actually:undefined, expected:void 0, kind:'PASS', summary:'' }] })),
        '[]');
    equal(Array.isArray(f('Mathsy Test Suite')),
        true);
    equal(Array.isArray(f({ ...fpt, results:[] })),
        true);
    equal(typeof(f('Mathsy Test Suite', ()=>1))[0],
        'function');
    equal((f('Mathsy Test Suite', ()=>1, ()=>2)).length,
        2);
*/
}
