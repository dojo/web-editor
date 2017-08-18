import { Base } from '@dojo/widget-core/meta/Base';

export default class Matches extends Base {
	/**
	 * Determine if the target of a particular `Event` matches the virtual DOM key
	 * @param key The virtual DOM key
	 * @param event The event object
	 */
	public get(key: string, event: Event): boolean {
		this.requireNode(key);

		const node = this.nodes.get(key);

		// if we don't have a reference to the node yet, return an empty set of results
		if (!node) {
			return false;
		}

		return node === event.target;
	}
}
