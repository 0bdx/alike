import bindAlikeTools, {
    addSection,
    isEqual,
    Renderable,
    renderPlain,
    Suite,
} from './alike.js';
import { bindAlikeToolsTest } from './src/bind-alike-tools.js';
import { addSectionTest } from './src/tools/add-section.js';
import { isEqualTest } from './src/tools/is-equal.js';
import { renderPlainTest } from './src/tools/render-plain.js';

bindAlikeToolsTest(bindAlikeTools);
addSectionTest(addSection, Suite);
isEqualTest(isEqual, Renderable, Suite);
renderPlainTest(renderPlain, Renderable, Suite);
