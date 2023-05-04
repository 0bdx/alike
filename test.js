import alike, {
    bind2,
    bind3,
    addSection,
    Renderable,
    Suite,
} from './alike.js';
import { alikeTest } from './src/alike.js';
import {
    bind2Test,
    bind3Test,
} from './src/bind/index.js';
import { addSectionTest } from './src/tools/add-section.js';

alikeTest(alike, Renderable, Suite);
bind2Test(bind2, Suite);
bind3Test(bind3, Suite);
addSectionTest(addSection, Suite);
