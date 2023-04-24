import bindAlikeTools, {
    addSection,
    isAlike,
    Renderable,
    renderPlain,
    Suite,
} from './alike.js';
import { bindAlikeToolsTest } from './src/bind-alike-tools.js';
import { addSectionTest } from './src/tools/add-section.js';
import { isAlikeTest } from './src/tools/is-alike.js';
import { renderPlainTest } from './src/tools/render-plain.js';

bindAlikeToolsTest(bindAlikeTools);
addSectionTest(addSection, Suite);
isAlikeTest(isAlike, Renderable, Suite);
renderPlainTest(renderPlain, Renderable, Suite);
