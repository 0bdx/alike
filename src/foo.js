/**
 * Placeholder function.
 *
 * @param   {string}  msg  A short message
 *
 * @return  {string}  Returns the short message appended to "foo(): "
 */
export default function foo(msg) {
    const ep = 'Error: foo():'; // error prefix
    if (typeof msg !== 'string') throw Error(`${ep
        } msg is type '${typeof msg}' not 'string'`);

    return `foo(): ${msg}`;
}
