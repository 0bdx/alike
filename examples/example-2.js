import alike, { addSection, bindToSuite } from '../alike.js';

// Give the test suite a title, and bind two functions to it.
// A suite from previous tests can be used instead of a title.
const [ suite, section,    like ] = bindToSuite('Mathsy Tests',
               addSection, alike);

// Optionally, begin a new section.
section('Check that factorialise() works');

// Run the tests. The third argument, `notes`, is optional.
like(factorialise(0), 1);
like(factorialise(5), 120,
    'factorialise(5) // 5! = 5 * 4 * 3 * 2 * 1');

// Output a test results summary to the console, as plain text.
console.log(suite.renderPlain());

function factorialise(n) {
    if (n === 0 || n === 1) return 1;
    for (let i=n-1; i>0; i--) n *= i;
    return n;
}
