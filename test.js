import bindTestTools, {
    addSection,
    // isEqual,
    // renderPlain,
    Suite,
} from './test-tools.js';
import { bindTestToolsTest } from './src/bind-test-tools.js';
import { addSectionTest } from './src/tools/add-section.js';

bindTestToolsTest(bindTestTools);
addSectionTest(addSection, Suite);
