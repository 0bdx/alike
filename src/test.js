import {
    bind2,
    bind2Test,
    bind3,
    bind3Test,
} from './bind/index.js';

import {
    Are,
    areRenderTest,
    areTest,
    Highlight,
    highlightTest,
    Renderable,
    renderableFromTest,
    renderableTest,
    resultTest,
    sectionTest,
} from './classes/index.js';

import { helpersTest } from './helpers.js';

import alike, {
    addSection,
} from './index.js';
import { alikeTest } from './alike.js';
import { addSectionTest } from './tools/add-section.js';

bind2Test(Are, bind2);
bind3Test(Are, bind3);

areRenderTest(Are);
areTest(Are, Highlight, Renderable);
highlightTest();
renderableFromTest();
renderableTest();
resultTest();
sectionTest();

helpersTest();

alikeTest(Are, alike, Renderable);
addSectionTest(Are, addSection);
