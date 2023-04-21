import {
    highlightTest,
    renderableTest,
    resultTest,
    sectionTest,
    Suite,
    suiteTest,
} from './classes/index.js';

import bindTestTools, {
    addSection,
    // isEqual,
    // renderPlain,
} from './index.js';
import { bindTestToolsTest } from './bind-test-tools.js';
import { addSectionTest } from './tools/add-section.js';

highlightTest();
renderableTest();
resultTest();
sectionTest();
suiteTest();

bindTestToolsTest(bindTestTools);
addSectionTest(addSection, Suite);
