import bindTestTools, {
    addSection,
    isEqual,
    Renderable,
    renderPlain,
    Suite,
} from './test-tools.js';
import { bindTestToolsTest } from './src/bind-test-tools.js';
import { addSectionTest } from './src/tools/add-section.js';
import { isEqualTest } from './src/tools/is-equal.js';
import { renderPlainTest } from './src/tools/render-plain.js';

bindTestToolsTest(bindTestTools);
addSectionTest(addSection, Suite);
isEqualTest(isEqual, Renderable, Suite);
renderPlainTest(renderPlain, Renderable, Suite);
