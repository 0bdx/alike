import alike, { addSection, bind3, throws } from '../alike.js';

// Create a test suite with a title, and bind three functions to it.
const [ like, section, thro, are ] = bind3(alike, addSection, throws, 'fact()');

// Or a suite from a previous test could be passed in instead.
// const [ like, section, thro ] = bind3(alike, addSection, throws, are);

// Optionally, begin a new section.
section('Check that fact() works');

// Run the tests. The third argument, `notes`, is optional.
thro(fact(), "`n` is not type 'number'");
thro(fact(NaN), '`n` is NaN!',
    'fact(NaN) // cannot factorialise the special `NaN` number');
like(fact(0), 1);
like(fact(5), 120,
    'fact(5) // 5! = 5 * 4 * 3 * 2 * 1');

// Output a test results summary to the console, as plain text.
console.log(are.render());

// Calculates the factorial of a given integer.
function fact(n) {
    if (typeof n !== 'number') throw Error("`n` is not type 'number'");
    if (isNaN(n)) throw Error('`n` is NaN!');
    if (n === 0 || n === 1) return 1;
    for (let i=n-1; i>0; i--) n *= i;
    return n;
}
