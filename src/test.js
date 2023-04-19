import {
    highlightTest,
    renderableTest,
    resultTest,
    sectionTest,
    suiteTest,
} from './classes/index.js';

import bindTestTools from './index.js';

import bindTestToolsTest from './bind-test-tools.test.js';

bindTestToolsTest(bindTestTools);

// import { validateHighlight, testValidateHighlight } from './index.js';

// testValidateHighlight(validateHighlight);

highlightTest();
renderableTest();
resultTest();
sectionTest();
suiteTest();
