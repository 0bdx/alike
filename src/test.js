import {
    bind2,
    bind2Test,
    bind3,
    bind3Test,
} from './bind/index.js';

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
} from './index.js';
import { alikeTest } from './alike.js';
import { addSectionTest } from './tools/add-section.js';

bind2Test(bind2, Suite);
bind3Test(bind3, Suite);

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
