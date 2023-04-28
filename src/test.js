import {
    highlightTest,
    Renderable,
    renderableFromTest,
    renderableTest,
    resultTest,
    sectionTest,
    Suite,
    suiteTest,
} from './classes/index.js';

import bindAlikeTools, {
    addSection,
    areAlike,
    renderPlain,
} from './index.js';
import { bindAlikeToolsTest } from './bind-alike-tools.js';
import { addSectionTest } from './tools/add-section.js';
import { areAlikeTest } from './tools/are-alike.js';
import { renderPlainTest } from './tools/render-plain.js';

highlightTest();
renderableFromTest();
renderableTest();
resultTest();
sectionTest();
suiteTest();

bindAlikeToolsTest(bindAlikeTools);
addSectionTest(addSection, Suite);
areAlikeTest(areAlike, Renderable, Suite);
renderPlainTest(renderPlain, Renderable, Suite);
