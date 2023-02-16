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
    throws(()=>f('', null),
        `Error: bindTestTools(): tools[0] is null, not a class`);
    // @ts-expect-error
    throws(()=>f('', 1e3),
        `Error: bindTestTools(): tools[0] is type 'number' not 'function'`);

    // Ok.
    equal(JSON.stringify(f('')),
        '[]');
    equal(JSON.stringify(f('Mathsy Test Suite')),
        '[]');
    equal(typeof(f('Mathsy Test Suite', ()=>1))[0],
        'function');
}
