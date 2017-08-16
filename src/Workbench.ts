import { assign } from '@dojo/shim/object';
import { v, w } from '@dojo/widget-core/d';
import { ThemeableMixin, ThemeableProperties, theme } from '@dojo/widget-core/mixins/Themeable';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import Editor from './Editor';
import IconCss from './IconCss';
import { Program } from './project';
import Runner, { RunnerProperties } from './Runner';
import { IconJson } from './support/icons';
import * as css from './styles/workbench.m.css';

const ThemeableBase = ThemeableMixin(WidgetBase);

export interface WorkbenchProperties extends ThemeableProperties {
	filename?: string;
	icons?: IconJson;
	iconsSourcePath?: string;
	program?: Program;

	onRun?(): void;
}

@theme(css)
export default class Workbench extends ThemeableBase<WorkbenchProperties> {
	render() {
		const {
			filename,
			program,
			icons,
			iconsSourcePath: sourcePath,
			onRun } = this.properties;
		const runnerProperties: RunnerProperties = assign({}, program, { key: 'runner', onRun });

		return v('div', {
			classes: this.classes(css.base)
		}, [
			w(IconCss, { baseClass: css.icons, icons, key: 'icons', sourcePath }),
			w(Editor, { filename, key: 'editor' }),
			w(Runner, runnerProperties)
		]);
	}
}
