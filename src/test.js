import {
    highlightTest,
    Renderable,
    renderableTest,
    resultTest,
    sectionTest,
    Suite,
    suiteTest,
} from './classes/index.js';

import bindTestTools, {
    addSection,
    isEqual,
    // renderPlain,
} from './index.js';
import { bindTestToolsTest } from './bind-test-tools.js';
import { addSectionTest } from './tools/add-section.js';
import { isEqualTest } from './tools/is-equal.js';

highlightTest();
renderableTest();
resultTest();
sectionTest();
suiteTest();

bindTestToolsTest(bindTestTools);
addSectionTest(addSection, Suite);
isEqualTest(isEqual, Renderable, Suite);
