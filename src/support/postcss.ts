import global from '@dojo/core/global';
import { Processor, AcceptedPlugin } from 'postcss';

interface Postcss {
	(plugins?: AcceptedPlugin[]): Processor;
	(...plugins: AcceptedPlugin[]): Processor;
}

const postcss: Postcss = global.postcss;

export default postcss;
