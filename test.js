import Are, {
    bind1,
    bind2,
    bind3,
    Highlight,
    isDeeplyLike,
    Renderable,
    throwsError,
} from './are.js';
import {
    bind1Test,
    bind2Test,
    bind3Test,
} from './src/bind/index.js';
import { areTest } from './src/classes/are/are.js';
import { isDeeplyLikeTest } from './src/tools/is-deeply-like.js';
import { throwsErrorTest } from './src/tools/throws-error.js';

areTest(Are, Highlight, Renderable);
bind1Test(Are, bind1);
bind2Test(Are, bind2);
bind3Test(Are, bind3);

isDeeplyLikeTest(Are, isDeeplyLike, Renderable);
throwsErrorTest(Are, throwsError, Renderable);
