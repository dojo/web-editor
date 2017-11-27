import { find, includes } from '@dojo/shim/array';
import { assign } from '@dojo/shim/object';
import { v, w } from '@dojo/widget-core/d';
import { WNode } from '@dojo/widget-core/interfaces';
import { ThemeableMixin, ThemeableProperties, theme } from '@dojo/widget-core/mixins/Themeable';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import Editor from './widgets/Editor';
import IconCss from './widgets/IconCss';
import { Program } from './project';
import Runner, { RunnerProperties } from './widgets/Runner';
import { Tab } from './widgets/Tablist';
import TreePane, { TreePaneItem } from './widgets/TreePane';
import Toolbar from './widgets/Toolbar';
import { IconJson, IconResolver } from './support/icons';
import * as iconCss from './styles/icons.m.css';
import * as workbenchCss from './styles/workbench.m.css';

const ThemeableBase = ThemeableMixin(WidgetBase);

export interface WorkbenchProperties extends ThemeableProperties {
	/**
	 * The filename that the editor should be displaying, otherwise `undefined`
	 */
	filename?: string;

	/**
	 * An array of filenames that the workbench should be displaying in the file tree, otherwise `undefined`
	 */
	files?: string[];

	/**
	 * An object which expresses the icons that should be used when displaying file icons
	 */
	icons?: IconJson;

	/**
	 * The source path to the icons
	 */
	iconsSourcePath?: string;

	model?: Editor['properties']['model'];

	/**
	 * An array of filenames that have open tabs
	 */
	openFiles?: string[];

	/**
	 * Is the current program _runnable_ (meaning the UI should have an active run button)
	 */
	runnable?: boolean;

	/**
	 * The current emitted program that the runner should be running, otherwise `undefined`
	 */
	program?: Program;

	/**
	 * Called whenver a change is made to a file in the editor
	 */
	onDirty?(): void;

	/**
	 * Called when a file is attempting to close from the open tabs in the editor
	 * @param filename The name of the file that is being request to be closed
	 */
	onFileClose?(filename: string): void;

	/**
	 * Called when a file is opened on the workbench
	 * @param filename The name of the file that is being requested to be opened
	 */
	onFileOpen?(filename: string): void;

	/**
	 * Called when a file is attempted to be selected from the pen tabs in the editor
	 * @param filename The name of the file that is being requested to be selected
	 */
	onFileSelect?(filename: string): void;

	/**
	 * Called when the runner completes loading the program
	 */
	onRun?(): void;

	/**
	 * Called when a run of the project is requested
	 */
	onRunClick?(): void;
}

@theme(workbenchCss)
export default class Workbench extends ThemeableBase<WorkbenchProperties> {
	private _expanded = [ './', './src' ];
	private _fileTreeOpen = true;
	private _iconResolver = new IconResolver();
	private _layoutEditor = false;
	private _runnerOpen = true;
	private _selected = '';

	private _getItemClass = (item: TreePaneItem, expanded?: boolean): string | undefined => {
		if (typeof item.label === 'string') {
			return item.children && item.children.length ? this._iconResolver.folder(item.label, expanded) : this._iconResolver.file(item.label);
		}
	}

	private _getTabs(): WNode<Tab>[] {
		const { properties: { filename: openFilename, openFiles, theme } } = this;

		if (!openFiles) {
			return [];
		}

		return openFiles.map((filename, idx) => {
			const parts = filename.split(/[\/\\]/);
			// TODO: deal with adding a labelDescription when duplicate files are opened
			return w(Tab, {
				iconClass: this._iconResolver.file(filename),
				key: `${idx}`,
				label: parts[parts.length - 1],
				selected: filename === openFilename,
				title: filename,
				theme,

				onClose: this._onFileTabClose,
				onSelect: this._onFileTabSelect
			});
		});
	}
	private _getTreeRoot(): TreePaneItem | undefined {
		/**
		 * Add a file to a tree of files, by parsing the filename and adding generating a `TreePaneItem`
		 * @param root The root to add the file to
		 * @param filename The full path of the filename
		 */
		function addFile(root: TreePaneItem, filename: string): TreePaneItem {
			const endsWithPathMarker = /[\/\\]$/.test(filename);
			const parts = filename.split(/[\/\\]/);
			const deliminator = filename.split('/').length === parts.length ? '/' : '\\';
			const idParts: string[] = [];
			if (parts[0] === '.') {
				idParts.push(parts.shift()!);
				if (root.id === '') {
					root = {
						children: [],
						id: '.',
						label: '.',
						title: '.'
					};
				}
			}
			let parent = root;
			while (parts.length) {
				const currentPart = parts[0];
				if (!parent.children) {
					parent.children = [];
				}
				let item = find(parent.children, (child) => child.label === currentPart);
				if (!item) {
					item = {
						id: idParts.concat(currentPart).join(deliminator),
						label: currentPart,
						title: idParts.concat(currentPart).join(deliminator)
					};
					parent.children.push(item);
				}
				parent = item;
				idParts.push(parts.shift()!);
			}
			if (endsWithPathMarker && !parent.children) {
				parent.children = [];
			}
			return root;
		}

		const { files } = this.properties;
		if (files) {
			return files
				.sort((a, b) => a < b ? -1 : 1)
				.reduce((previous, current) => addFile(previous, current), {
					id: '',
					label: '',
					title: ''
				} as TreePaneItem);
		}
	}

	private _onItemOpen(id: string) {
		this._selected = id;
		const { onFileOpen } = this.properties;
		onFileOpen && onFileOpen(id);
		this.invalidate();
	}

	private _onItemSelect(id: string) {
		this._selected = id;
		this.invalidate();
	}

	private _onItemToggle(id: string) {
		const { _expanded } = this;
		if (includes(_expanded, id)) {
			_expanded.splice(_expanded.indexOf(id), 1);
		}
		else {
			_expanded.push(id);
		}
		this.invalidate();
	}

	private _onFileTabClose = (key: string | number | undefined, label: string) => {
		const { openFiles, onFileClose } = this.properties;
		const idx = Number(key);
		if (onFileClose && openFiles && openFiles[idx]) {
			if (!this._fileTreeOpen && openFiles.length === 1) {
				this._onToggleFiles();
			}
			onFileClose(openFiles[idx]);
		}
	}

	private _onFileTabSelect = (key: string | number | undefined, label: string) => {
		const { openFiles, onFileSelect } = this.properties;
		const idx = Number(key);
		if (onFileSelect && openFiles && openFiles[idx]) {
			onFileSelect(openFiles[idx]);
		}
	}

	private _onRun() {
		const { onRun } = this.properties;
		if (!this._runnerOpen) {
			this._onToggleRunner();
		}
		onRun && onRun();
	}

	private _onToggleFiles() {
		this._fileTreeOpen = !this._fileTreeOpen;
		this._layoutEditor = true;
		this.invalidate();
	}

	private _onToggleRunner() {
		this._runnerOpen = !this._runnerOpen;
		this._layoutEditor = true;
		this.invalidate();
	}

	constructor() {
		super();
		// we need to "trap" window resize events so we can layout the editor intelligently
		window.addEventListener('resize', () => {
			this._layoutEditor = true;
			this.invalidate();
		});
		window.addEventListener('beforeunload', (evt) => {
			evt.returnValue = 'Do you wish to navigate away from this page?';
			return evt.returnValue;
		});
	}

	render() {
		const {
			_expanded,
			_fileTreeOpen: filesOpen,
			_getItemClass: getItemClass,
			_layoutEditor: layout,
			_runnerOpen: runnerOpen,
			_selected: selected,
			properties: {
				icons,
				iconsSourcePath: sourcePath,
				model,
				program,
				runnable,
				theme,
				onDirty,
				onRunClick
			}
		} = this;

		if (icons && sourcePath) {
			this._iconResolver.setProperties({ icons, sourcePath });
		}

		// Need to mixin the program into the Runner's properties
		const runnerProperties: RunnerProperties = assign({}, program, { key: 'runner', theme, onRun: this._onRun });

		// if we are laying out the editor on this render, we can reset the state
		if (layout) {
			this._layoutEditor = false;
		}

		return v('div', {
			classes: this.classes(workbenchCss.root).fixed(workbenchCss.rootFixed)
		}, [
			w(IconCss, {
				baseClass: iconCss.label,
				icons,
				key: 'icons',
				sourcePath
			}),
			v('div', {
				classes: this.classes(workbenchCss.left, filesOpen ? null : workbenchCss.closed),
				key: 'left'
			}, [
				w(TreePane, {
					expanded: [ ..._expanded ],
					getItemClass,
					key: 'treepane',
					root: this._getTreeRoot(),
					selected,
					theme,

					onItemOpen: this._onItemOpen,
					onItemSelect: this._onItemSelect,
					onItemToggle: this._onItemToggle
				})
			]),
			v('div', {
				classes: this.classes(workbenchCss.middle),
				key: 'middle'
			}, [
				w(Toolbar, {
					runnable,
					runnerOpen,
					filesOpen,
					theme,
					onRunClick,
					onToggleFiles: this._onToggleFiles,
					onToggleRunner: this._onToggleRunner
				}, this._getTabs()),
				w(Editor, {
					key: 'editor',
					layout,
					model,
					options: {
						folding: true,
						minimap: { enabled: false },
						renderWhitespace: 'boundary'
					},
					theme,
					onDirty
				})
			]),
			v('div', {
				classes: this.classes(workbenchCss.right, runnerOpen ? null : workbenchCss.closed),
				key: 'right'
			}, [
				w(Runner, runnerProperties)
			])
		]);
	}
}
