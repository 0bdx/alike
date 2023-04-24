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
    isAlike,
    renderPlain,
} from './index.js';
import { bindAlikeToolsTest } from './bind-alike-tools.js';
import { addSectionTest } from './tools/add-section.js';
import { isAlikeTest } from './tools/is-alike.js';
import { renderPlainTest } from './tools/render-plain.js';

highlightTest();
renderableFromTest();
renderableTest();
resultTest();
sectionTest();
suiteTest();

bindAlikeToolsTest(bindAlikeTools);
addSectionTest(addSection, Suite);
isAlikeTest(isAlike, Renderable, Suite);
renderPlainTest(renderPlain, Renderable, Suite);
