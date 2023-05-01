import alike, {
    addSection,
    bindToSuite,
    Renderable,
    Suite,
} from './alike.js';
import { alikeTest } from './src/alike.js';
import { addSectionTest } from './src/tools/add-section.js';
import { bindToSuiteTest } from './src/tools/bind-to-suite.js';

alikeTest(alike, Renderable, Suite);
addSectionTest(addSection, Suite);
bindToSuiteTest(bindToSuite);
