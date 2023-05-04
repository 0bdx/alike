import alike, {
    bind2,
    addSection,
    Renderable,
    Suite,
} from './alike.js';
import { alikeTest } from './src/alike.js';
import {
    bind2Test,
} from './src/bind/index.js';
import { addSectionTest } from './src/tools/add-section.js';

alikeTest(alike, Renderable, Suite);
bind2Test(bind2, Suite);
addSectionTest(addSection, Suite);
