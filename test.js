import Are, {
    addSection,
    bind2,
    bind3,
    Highlight,
    isDeeplyLike,
    Renderable,
} from './alike.js';
import {
    bind2Test,
    bind3Test,
} from './src/bind/index.js';
import { isDeeplyLikeTest } from './src/tools/is-deeply-like.js';
import { addSectionTest } from './src/tools/add-section.js';
import { areTest } from './src/classes/are/are.js';

isDeeplyLikeTest(Are, isDeeplyLike, Renderable);
addSectionTest(Are, addSection);
areTest(Are, Highlight, Renderable);
bind2Test(Are, bind2);
bind3Test(Are, bind3);
