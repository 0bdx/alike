import equal from './private-methods/equal.js';
import throws from './private-methods/throws.js';

/**
 * bindTestTools() unit tests.
 * 
 * @param   {import('./bind-test-tools').default}  f  bindTestTools()
 * @return  {void}
 * @throws  Throws an `Error` if a test fails
 */
export default function bindTestToolsTest(f) {

    // Arguments are incorrect types.
    // @ts-expect-error
    throws(()=>f(),
        `Error: bindTestTools(): title is type 'undefined' not 'string'`);
    // @ts-expect-error
    throws(()=>f(true),
        `Error: bindTestTools(): title is type 'boolean' not 'string'`);
    // @ts-expect-error
    throws(()=>f('', 1e3),
        `Error: bindTestTools(): tools[0] is type 'number' not 'function'`);

    // Arguments are ok, and bindTestTools() returns an array of functions.
    equal(JSON.stringify(f('')),
        '[]');
    equal(Array.isArray(f('Mathsy Test Suite')),
        true);
    equal(typeof(f('Mathsy Test Suite', ()=>1))[0],
        'function');
    equal((f('Mathsy Test Suite', ()=>1, ()=>2)).length,
        2);
}
