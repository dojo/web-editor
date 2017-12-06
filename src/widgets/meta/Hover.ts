import WeakMap from '@dojo/shim/WeakMap';
import { Base } from '@dojo/widget-core/meta/Base';

interface NodeData {
	hovering: boolean;
	invalidate: () => void;
}

class HoverController {
	private _nodeMap = new WeakMap<HTMLElement, NodeData>();

	private _onmouseenter = (event: MouseEvent) => {
		// cannot end up here unless we have data in the map
		const data = this._nodeMap.get(event.target as HTMLElement)!;
		if (!data.hovering) {
			data.hovering = true;
			data.invalidate();
		}
	}

	private _onmouseleave = (event: MouseEvent) => {
		// cannot end up here unless we have data in the map
		const data = this._nodeMap.get(event.target as HTMLElement)!;
		if (data.hovering) {
			data.hovering = false;
			data.invalidate();
		}
	}

	public get(node: HTMLElement, invalidate: () => void): boolean {
		const { _nodeMap } = this;
		if (!_nodeMap.has(node)) {
			_nodeMap.set(node, { hovering: false, invalidate });
			node.addEventListener('mouseenter', this._onmouseenter);
			node.addEventListener('mouseleave', this._onmouseleave);
		}
		return _nodeMap.get(node)!.hovering;
	}
}

const controller = new HoverController();

export default class Hover extends Base {
	private _boundInvalidate: () => void = this.invalidate.bind(this);

	public get(key: string | number): boolean {
		const node = this.getNode(key) as HTMLElement;

		if (!node) {
			return false;
		}
		return controller.get(node, this._boundInvalidate);
	}
}
