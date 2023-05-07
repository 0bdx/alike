import {
    bind2,
    bind2Test,
    bind3,
    bind3Test,
} from './bind/index.js';

import {
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

import Are, {
    addSection,
    isDeeplyLike,
} from './index.js';
import { isDeeplyLikeTest } from './tools/is-deeply-like.js';
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

isDeeplyLikeTest(Are, isDeeplyLike, Renderable);
addSectionTest(Are, addSection);
