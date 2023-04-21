import {
    highlightTest,
    renderableTest,
    resultTest,
    sectionTest,
    suiteTest,
} from './classes/index.js';

import bindTestTools from './index.js';
import { bindTestToolsTest } from './bind-test-tools.js';

highlightTest();
renderableTest();
resultTest();
sectionTest();
suiteTest();

bindTestToolsTest(bindTestTools);
