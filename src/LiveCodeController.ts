import { ProjectFileType } from '@dojo/cli-export-project/interfaces/project.json';
import Map from '@dojo/shim/Map';
import { assign } from '@dojo/shim/object';
import { isWNode } from '@dojo/widget-core/d';
import { DNode, HNode, WidgetProperties, WNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import LiveCodeExample from './LiveCodeExample';
import { Program, Project } from './project';

export interface LiveCodeControllerProperties extends WidgetProperties {
	/**
	 * The interval, in milliseconds, when the last change to the editor causes it to call `onDirty`.  It will default to
	 * `2000` (2 seconds)
	 */
	changeInterval?: number;

	/**
	 * A reference to the project that should be used by the controller
	 */
	project: Project;

	/**
	 * A URI to the initial page that should be displayed in the runners displaying code examples
	 */
	runnerSrc?: string;
}

const DEFAULT_CHANGE_INTERVAL = 2000;

/**
 * A custom type guard that determines if a child node is a `LiveCodeExample` or not
 * @param value the value to guard
 */
function isLiveCodeExampleWNode(value: any): value is WNode<LiveCodeExample> {
	return isWNode(value) && value.widgetConstructor === LiveCodeExample;
}

interface EditorData {
	dirty: boolean;
	model?: monaco.editor.IModel;
}

/**
 * A _global_ map of editor IDs and their data
 *
 * *Note:* Exported for testing purposes only
 */
export const editorMap = new Map<string, EditorData>();

/**
 * A controller widget which iterates through its children and decorates the `LiveCodeExample` nodes
 * with model information from the project passed as a property
 */
export class LiveCodeController extends WidgetBase<LiveCodeControllerProperties> {
	private _program: Program | undefined;

	/**
	 * When a `LiveCodeExample` child is dirty, it needs to be put into a dirty
	 * state and the program needs to be recompiled and the widget invalidated
	 */
	private _onDirty = async (id: string) => {
		const { project } = this.properties;
		const data = editorMap.get(id);
		if (data) {
			data.dirty = true;
		}
		this._program = await project.getProgram();
		this.invalidate();
	}

	/**
	 * Create a new project file, get the model, compile the program and invalidate
	 */
	private async _setModel(data: EditorData, id: string, text: string, tsx?: boolean) {
		const { project } = this.properties;
		const name = `./src/${id}.ts${tsx ? 'x' : ''}`;
		if (!project.includes(name)) {
			await project.addFile({
				type: ProjectFileType.TypeScript,
				name,
				text
			});
		}
		data.model = project.getFileModel(name);
		this._program = await project.getProgram();
		this.invalidate();
	}

	protected render(): DNode[] {
		const {
			_program,
			children,
			properties: {
				changeInterval = DEFAULT_CHANGE_INTERVAL,
				runnerSrc
			}
		} = this;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (isLiveCodeExampleWNode(child)) {
				const { id, tsx } = child.properties;
				if (!editorMap.has(id)) {
					editorMap.set(id, { dirty: true });
				}
				const data = editorMap.get(id)!;
				const { model } = data;
				if (!model) {
					const text = child.children
						.filter((child) => child !== null)
						.map((child) => typeof child === 'object' ? (child as HNode).text : child)
						.join('\n');
					if (text) {
						this._setModel(data, id, text, tsx);
					}
				}
				let program: Program | undefined;
				if (model && _program && data.dirty) {
					data.dirty = false;
					program = _program;
				}
				assign(child.properties, {
					changeInterval,
					model,
					program,
					runnerSrc,
					onDirty: this._onDirty
				});
			}
		}
		return children;
	}
}

export default LiveCodeController;
