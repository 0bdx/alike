import Are, {
    bind1,
    bind2,
    bind3,
    Highlight,
    isDeeplyLike,
    Renderable,
} from './are.js';
import {
    bind1Test,
    bind2Test,
    bind3Test,
} from './src/bind/index.js';
import { isDeeplyLikeTest } from './src/tools/is-deeply-like.js';
import { areTest } from './src/classes/are/are.js';

isDeeplyLikeTest(Are, isDeeplyLike, Renderable);
areTest(Are, Highlight, Renderable);
bind1Test(Are, bind1);
bind2Test(Are, bind2);
bind3Test(Are, bind3);
