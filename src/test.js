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

import { helpersTest } from './helpers.js';

import alike, {
    addSection,
    bindToSuite,
} from './index.js';
import { alikeTest } from './alike.js';
import { addSectionTest } from './tools/add-section.js';
import { bindToSuiteTest } from './tools/bind-to-suite.js';

highlightTest();
renderableFromTest();
renderableTest();
resultTest();
sectionTest();
suiteTest();
suiteRenderTest(Suite);

helpersTest();

alikeTest(alike, Renderable, Suite);
addSectionTest(addSection, Suite);
bindToSuiteTest(bindToSuite);
