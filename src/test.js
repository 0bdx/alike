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

import bindToSuite, {
    addSection,
    areAlike,
} from './index.js';
import { bindToSuiteTest } from './tools/bind-to-suite.js';
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

bindToSuiteTest(bindToSuite);
addSectionTest(addSection, Suite);
areAlikeTest(areAlike, Renderable, Suite);
