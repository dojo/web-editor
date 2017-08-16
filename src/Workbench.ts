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
			icons,
			iconsSourcePath: sourcePath,
			program,
			theme,
			onRun
		} = this.properties;

		const runnerProperties: RunnerProperties = assign({}, program, { key: 'runner', theme, onRun });

		return v('div', {
			classes: this.classes(css.root)
		}, [
			w(IconCss, { baseClass: css.icons, icons, key: 'icons', sourcePath }),
			w(Editor, {
				filename,
				key: 'editor',
				options: {
					minimap: { enabled: false }
				},
				theme
			}),
			w(Runner, runnerProperties)
		]);
	}
}
