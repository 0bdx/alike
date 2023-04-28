import bindAlikeTools, {
    addSection,
    areAlike,
    Renderable,
    renderPlain,
    Suite,
} from './alike.js';
import { bindAlikeToolsTest } from './src/bind-alike-tools.js';
import { addSectionTest } from './src/tools/add-section.js';
import { areAlikeTest } from './src/tools/are-alike.js';
import { renderPlainTest } from './src/tools/render-plain.js';

bindAlikeToolsTest(bindAlikeTools);
addSectionTest(addSection, Suite);
areAlikeTest(areAlike, Renderable, Suite);
renderPlainTest(renderPlain, Renderable, Suite);
