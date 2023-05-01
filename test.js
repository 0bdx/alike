import bindToSuite, {
    addSection,
    areAlike,
    Renderable,
    Suite,
} from './alike.js';
import { bindToSuiteTest } from './src/tools/bind-to-suite.js';
import { addSectionTest } from './src/tools/add-section.js';
import { areAlikeTest } from './src/tools/are-alike.js';

bindToSuiteTest(bindToSuite);
addSectionTest(addSection, Suite);
areAlikeTest(areAlike, Renderable, Suite);
