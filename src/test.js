import {
    highlightTest,
    Renderable,
    renderableFromTest,
    renderableTest,
    resultTest,
    sectionTest,
    Suite,
    suiteRenderTest,
    suiteTest,
} from './classes/index.js';

import { helperTest } from './helpers.js';

import bindAlikeTools, {
    addSection,
    areAlike,
} from './index.js';
import { bindAlikeToolsTest } from './bind-alike-tools.js';
import { addSectionTest } from './tools/add-section.js';
import { areAlikeTest } from './tools/are-alike.js';

highlightTest();
renderableFromTest();
renderableTest();
resultTest();
sectionTest();
suiteTest();
suiteRenderTest(Suite);

helperTest();

bindAlikeToolsTest(bindAlikeTools);
addSectionTest(addSection, Suite);
areAlikeTest(areAlike, Renderable, Suite);
