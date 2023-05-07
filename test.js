import Are, {
    addSection,
    alike,
    bind2,
    bind3,
    Highlight,
    Renderable,
} from './alike.js';
import {
    bind2Test,
    bind3Test,
} from './src/bind/index.js';
import { alikeTest } from './src/tools/alike.js';
import { addSectionTest } from './src/tools/add-section.js';
import { areTest } from './src/classes/are/are.js';

alikeTest(Are, alike, Renderable);
addSectionTest(Are, addSection);
areTest(Are, Highlight, Renderable);
bind2Test(Are, bind2);
bind3Test(Are, bind3);
