import bindAlikeTools, {
    addSection,
    areAlike,
    Renderable,
    Suite,
} from './alike.js';
import { bindAlikeToolsTest } from './src/bind-alike-tools.js';
import { addSectionTest } from './src/tools/add-section.js';
import { areAlikeTest } from './src/tools/are-alike.js';

bindAlikeToolsTest(bindAlikeTools);
addSectionTest(addSection, Suite);
areAlikeTest(areAlike, Renderable, Suite);
