import bindTestTools, {
    addSection,
    isEqual,
    Renderable,
    // renderPlain,
    Suite,
} from './test-tools.js';
import { bindTestToolsTest } from './src/bind-test-tools.js';
import { addSectionTest } from './src/tools/add-section.js';
import { isEqualTest } from './src/tools/is-equal.js';

bindTestToolsTest(bindTestTools);
addSectionTest(addSection, Suite);
isEqualTest(isEqual, Renderable, Suite);
