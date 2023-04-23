import bindTestTools, { addSection, isEqual, renderPlain }
    from '../test-tools.js';

// Give the test suite a title, and bind some functions to it.
const [ section,    isEq,    render ] = bindTestTools('Mathsy Test Suite',
        addSection, isEqual, renderPlain);

// Optionally, begin a new `addSection`.
section('Check that factorialise() works');

// Run the tests. The third argument, `description`, is optional.
isEq(factorialise(0), 1);
isEq(factorialise(5), 120,
    'factorialise(5) // 5! = 5 * 4 * 3 * 2 * 1');

// Output the test results to the console, as plain text.
console.log(render());

function factorialise(n) {
    if (n === 0 || n === 1) return 1;
    for (let i=n-1; i>0; i--) n *= i;
    return n;
}
