import { includes } from '@dojo/shim/array';
import Map from '@dojo/shim/Map';
import { v, w } from '@dojo/widget-core/d';
import { DNode, WNode } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { theme, ThemeableMixin, ThemeableProperties } from '@dojo/widget-core/mixins/Themeable';
import { Keys } from '@dojo/widgets/common/util';
import * as css from './styles/treepane.m.css';
import { IconJson, IconResolver } from './support/icons';
import { getAbsolutePosition } from './support/events';
import ScrollBar from './support/ScrollBar';

/**
 * The interface for items that can be rendered in the `TreePane`.
 *
 * There needs to be a single `root` item which the rest of the tree is built from.
 */
export interface TreePaneItem {
	/**
	 * Any children that are owned by
	 */
	children?: TreePaneItem[];

	/**
	 * A unique id for the whole tree.
	 */
	id: string;

	/**
	 * The label for the item, if a type of `string`, it will be used with the `IconResolver` to determine the
	 * specific icon used.
	 */
	label: DNode;

	/**
	 * The value displayed when the mouse hovers over an item.  Typically this would be set to the full path of
	 * a file.
	 */
	title: string;
}

/**
 * Properties that can be set for `TreePane`
 */
export interface TreePaneProperties extends ThemeableProperties {
	/**
	 * An array of item IDs that are currently exapanded.
	 */
	expanded?: string[];

	/**
	 * An object that provides information about icons to use with an item
	 */
	icons?: IconJson;

	/**
	 * The label for the widget from an accessability perspective
	 */
	label?: string;

	/**
	 * The ID of the currently selected item
	 */
	selected?: string;

	/**
	 * Should the root be shown?  Defaults to `false`.
	 */
	showRoot?: boolean;

	/**
	 * The path to the root of the icon
	 */
	sourcePath?: string;

	/**
	 * The root item of the tree
	 */
	root?: TreePaneItem;

	/**
	 * Called when an item is opened (double clicked or enter pressed)
	 * @param id The ID of the item that is attempting to be opened
	 */
	onItemOpen?(id?: string): void;

	/**
	 * Called when an item is being selected (clicked or navigated to via the keyboard)
	 *
	 * The controlling application should change the `selected` property if the selection is valid
	 * to update the visual state of the widget
	 * @param id The ID of the item that is attempting to be selected
	 */
	onItemSelect?(id?: string): void;

	/**
	 * Called on a parent item when the item's expanded state is being toggled.
	 *
	 * The controlling application should add or remove the ID from the `expanded` array property to
	 * update the visual state of the widget
	 * @param id The ID of the item that is attempting to have its expanded state toggled
	 */
	onItemToggle?(id?: string): void;
}

const ROW_HEIGHT = 22;
const ROW_LEVEL_LEFT_PADDING = 12;

const ThemeableBase = ThemeableMixin(WidgetBase);

/**
 * Properties for the internal `Row` class.
 */
export interface RowProperties extends ThemeableProperties {
	/**
	 * A custom class which effects the display of the icon for the row
	 */
	class?: string;

	/**
	 * If a parent row, should it be rendered in an expanded or unexpanded state?
	 */
	expanded?: boolean;

	/**
	 * Does the row have children?
	 */
	hasChildren?: boolean;

	/**
	 * The label for the row, typically a `string`
	 */
	label: DNode;

	/**
	 * At what level in the UI should the row display itself at
	 */
	level: number;

	/**
	 * Is the row in a selected state or not
	 */
	selected?: boolean;

	/**
	 * The text that should be displayed when the row is hovered over
	 */
	title?: string;

	/**
	 * Called when the row is clicked
	 */
	onClick?(key?: string): void;

	/**
	 * Called when the row is double clicked
	 */
	onDblClick?(key?: string): void;
}

/**
 * The internal widget class which renders a row in the `TreePane`
 */
@theme(css)
export class Row extends ThemeableBase<RowProperties> {
	private _onclick() {
		this.properties.onClick && this.properties.onClick(this.properties.key);
	}
	private _ondblclick() {
		this.properties.onDblClick && this.properties.onDblClick(this.properties.key);
	}

	render() {
		const {
			_onclick,
			_ondblclick,
			properties: {
				class: rowClass,
				expanded,
				hasChildren,
				label,
				level,
				selected,
				title
			}
		} = this;
		const classes = [ css.row, selected && css.selected || null, hasChildren && css.hasChildren || null, expanded && css.expanded || null ];
		return v('div', {
			'aria-level': String(level),
			'aria-selected': selected,
			'aria-role': 'treeitem',
			classes: this.classes(...classes),
			role: 'treeitem',
			styles: {
				'padding-left': String(level * ROW_LEVEL_LEFT_PADDING) + 'px'
			},
			onclick: _onclick,
			ondblclick: _ondblclick
		}, [
			v('div', {
				classes: this.classes(css.content)
			}, [
				v('div', {
					classes: this.classes(css.label).fixed(css.labelFixed, rowClass || null),
					title: title
				}, [
					v('a', {
						classes: this.classes(css.labelName)
					}, [ label ])
				])
			])
		]);
	}
}

/**
 * An internal interface for maintaining navigation state of the `TreePane` in order to facilitate keyboard
 * navigation.
 */
interface TreePaneNavigationState {
	next: string;
	previous: string;
	selected: string;
	selectedPosition: number;
	start: number;
	end: number;
}

/**
 * A widget class which takes a tree of items with a root specified as the `root` property and renders them into
 * a hierarchical set of rows, providing events that allow expansion/collapse of parent nodes, scrolling, and the
 * ability to _open_ nodes.
 */
@theme(css)
export default class TreePane extends ThemeableBase<TreePaneProperties> {
	private _dragging = false;
	private _dragPosition: number;
	private _focusNode: HTMLElement;
	private _items = new Map<string, TreePaneItem>();
	private _navigation: TreePaneNavigationState;
	private _resolver: IconResolver;
	private _visibleRowCount: number;
	private _scrollPosition = 0;
	private _scrollVisible = false;
	private _size: number;
	private _sliderSize: number;
	private _wantsFocus = false;

	/**
	 * _Flattens_ the tree of items into a map.
	 */
	private _cacheItems() {
		function cacheItem(cache: Map<string, TreePaneItem>, item: TreePaneItem) {
			cache.set(item.id, item);
			if (item.children) {
				item.children.forEach(child => cacheItem(cache, child));
			}
		}

		if (this.properties.root) {
			this._items.clear();
			cacheItem(this._items, this.properties.root);
		}
	}

	/**
	 * Ensures that if the widget is blurred it will no longer grab focus
	 */
	private _onblur() {
		this._wantsFocus = false;
	}

	/**
	 * Hooks functions that grab references and information about the DOM that the widget needs to operate
	 * properly.
	 *
	 * This will eventually be replaced by the Dojo `meta` services.
	 * @param element The HTMLElement that is being updated
	 * @param key The key of the item to be updated
	 */
	private _onDomUpdate(element: HTMLElement, key: string) {
		if (key === 'rows') {
			this._visibleRowCount = element.clientHeight / ROW_HEIGHT;
			if (!this._focusNode) {
				this._focusNode = element;
			}
		}
	}

	/**
	 * Deal with starting to drag the scrollable area
	 * @param evt The TouchEvent or MouseEvent
	 */
	private _onDragStart(evt: TouchEvent & MouseEvent) {
		evt.preventDefault();
		this._dragging = true;
		this._dragPosition = getAbsolutePosition(evt);
	}

	/**
	 * Deal with tracking the movement of the scrollable area
	 * @param evt The TouchEvent or Mouse Event
	 */
	private _onDragMove(evt: TouchEvent & MouseEvent) {
		const {
			_dragging,
			_dragPosition
		} = this;
		if (_dragging) {
			evt.preventDefault();
			const delta = getAbsolutePosition(evt) - _dragPosition;
			this._onPositionUpdate(delta / ROW_HEIGHT);
			this._dragPosition = getAbsolutePosition(evt);
		}
	}

	/**
	 * Deal with when the drag movement ends
	 * @param evt The TouchEvent or MouseEvent
	 */
	private _onDragEnd(evt: TouchEvent & MouseEvent) {
		evt.preventDefault();
		this._dragging = false;
	}

	/**
	 * Deal with keyboard navigation in the scroll area
	 * @param evt The keyboard event
	 */
	private _onkeydown(evt: KeyboardEvent) {
		const {
			properties: {
				expanded = [],
				onItemOpen,
				onItemSelect,
				onItemToggle
			},
			_navigation: { next, previous, selected, start, end, selectedPosition }
		} = this;
		switch (evt.which) {
		case Keys.Down: /* Select Next Row */
			if (next && onItemSelect) {
				evt.preventDefault();
				onItemSelect(next);
				const visibleEnd = end - start - 4;
				if (selectedPosition > visibleEnd) { /* scroll down */
					this._onPositionUpdate(Math.ceil(selectedPosition - visibleEnd));
				}
			}
			break;
		case Keys.Up: /* Select Previous Row */
			if (previous && onItemSelect) {
				evt.preventDefault();
				onItemSelect(previous);
				if (selectedPosition < 2) { /* scroll up */
					this._onPositionUpdate(selectedPosition - 2);
				}
			}
			break;
		case Keys.Left: /* Close a folder */
			if (selected && includes(expanded, selected) && onItemToggle) {
				evt.preventDefault();
				onItemToggle(selected);
			}
			break;
		case Keys.Right: /* Open a folder */
			if (selected) {
				const item = this._items.get(selected);
				if (item && item.children && !includes(expanded, selected) && onItemToggle) {
					evt.preventDefault();
					onItemToggle(selected);
				}
			}
			break;
		case Keys.Enter: /* Open a folder or open an item */
			if (selected && onItemOpen) {
				evt.preventDefault();
				onItemOpen(selected);
			}
			break;
		}
	}

	/**
	 * Show the scrollbar
	 * @param evt The mouse event
	 */
	private _onmouseenter(evt: MouseEvent) {
		evt.preventDefault();
		this._scrollVisible = true;
		this.invalidate();
	}

	/**
	 * Hide the scroll bar
	 * @param evt The mouse event
	 */
	private _onmouseleave(evt: MouseEvent) {
		evt.preventDefault();
		this._scrollVisible = false;
		this.invalidate();
	}

	/**
	 * An internal higher order event that occurs when the top position of tree pane has changed, usually in response to a
	 * scroll event.  The change is expressed in the number of rows moved, positive or negative.
	 * @param delta The number of rows that have been scrolled
	 * @returns `true` if the position was updated, otherwise `false`, which allows other methods to allow the tiggering
	 *          event to bubble.
	 */
	private _onPositionUpdate(delta: number): boolean {
		const { _scrollPosition, _size, _sliderSize } = this;
		const updatedPosition = _scrollPosition + delta;
		const maxPosition = _size - _sliderSize + 1;
		this._scrollPosition = updatedPosition > 0 ? updatedPosition > maxPosition ? maxPosition : updatedPosition : 0;
		if (_scrollPosition !== this._scrollPosition) {
			this.invalidate();
			return true;
		}
		return false;
	}

	/**
	 * Handler for the row's higher order `onClick` event.  This fires the `onItemSelect` event.  If the item has children
	 * then the `onItemToggle` is fired.  It also indicates to the widget that it should attempt to focus itself.
	 * @param key The key of the item that has been clicked
	 */
	private _onRowClick(key: string) {
		this.properties.selected !== key && this.properties.onItemSelect && this.properties.onItemSelect(key);
		const item = this._items.get(key);
		if (!item) {
			throw new Error(`Uncached TreePane row ID: "${key}"`);
		}
		if (item.children && this.properties.onItemToggle) {
			this.properties.onItemToggle(key);
		}
		this._wantsFocus = true;
	}

	/**
	 * Handler for the row's higher order `onDblClick` event.  This fires the `onItemOpen` event.
	 * @param key The key of the item that has been double clicked
	 */
	private _onRowDblClick(key: string) {
		this.properties.onItemOpen && this.properties.onItemOpen(key);
	}

	/**
	 * Handler for the ScrollBar's higher order `onScroll` event.  This calls the `_onPosistionUpdate`.
	 * @param delta The number of rows, positive or negative that have been scrolled
	 */
	private _onScrollbarScroll = (delta: number) => {
		this._onPositionUpdate(delta);
	}

	/**
	 * Handler for the `onwheel` when there is a wheel event in the scroll area that calls the
	 * `_onPositionUpdate`.
	 * @param evt The WheelEvent
	 */
	private _onwheel(evt: WheelEvent) {
		if (this._onPositionUpdate(evt.deltaY / ROW_HEIGHT)) {
			evt.preventDefault();
		}
	}

	/**
	 * Return a `WNode<Row>` that represents a `TreePaneItem`
	 * @param item The TreePaneItem to be rendered
	 * @param level How deep in the hierarchy is the child
	 */
	private _renderChild(item: TreePaneItem, level: number): WNode<Row> {
		const { children, id: key, label, title } = item;
		const navigation = this._navigation;
		const { expanded: propsExpanded = [], selected, theme } = this.properties;
		const expanded = includes(propsExpanded, key);
		const hasChildren = Boolean(children);
		const resolverLabel = typeof label === 'string' ? label : '';
		if (!navigation.selected) {
			if (selected === key) {
				navigation.selected = key;
			}
			else {
				navigation.previous = key;
				navigation.selectedPosition++;
			}
		}
		else if (!navigation.next) {
			navigation.next = key;
		}

		return w(Row, {
			class: hasChildren ? this._resolver.folder(resolverLabel, expanded) : this._resolver.file(resolverLabel),
			expanded,
			hasChildren,
			key,
			level,
			label,
			selected: selected === key,
			title,
			theme,

			onClick: this._onRowClick,
			onDblClick: this._onRowDblClick
		});
	}

	/**
	 * Flatten the `root` of the tree and determine which rows need to be rendered, return an array
	 * of `(WNode<Row> | null)[]`.
	 */
	private _renderChildren(): (WNode<Row> | null)[] {
		this._navigation = {
			next: '',
			previous: '',
			selected: '',
			selectedPosition: 0,
			start: 0,
			end: 0
		};
		const {
			_navigation,
			_scrollPosition,
			_visibleRowCount,
			properties: {
				expanded = [],
				root,
				showRoot
			}
		} = this;
		const children: (WNode<Row> | null)[] = [];
		const start = _navigation.start = _scrollPosition ? _scrollPosition - 1 : 0;
		const end = _navigation.end = start + _visibleRowCount + 2;
		let rowCount = 0;

		const addChildren = (items: TreePaneItem[], level: number) => {
			items.forEach((item) => {
				rowCount++;
				children.push(rowCount >= start && rowCount <= end ? this._renderChild(item, level) : null);
				if (item.children && item.children.length && includes(expanded, item.id)) {
					addChildren(item.children, level + 1);
				}
			});
		};

		if (root) {
			addChildren(showRoot ? [ root ] : root.children || [], 1);
		}

		return children;
	}

	/**
	 * Handler that invokes `_onDomUpdate`
	 * @param element The element being created
	 * @param key The key of the element being created
	 */
	public onElementCreated(element: HTMLElement, key: string) {
		this._onDomUpdate(element, key);
	}

	/**
	 * Handler that invokes `_onDomUpdate`
	 * @param element The element beign created
	 * @param key The key of the element being created
	 */
	public onElementUpdated(element: HTMLElement, key: string) {
		this._onDomUpdate(element, key);
	}

	public render() {
		const {
			_focusNode,
			_onScrollbarScroll,
			_resolver,
			_scrollPosition,
			_scrollVisible,
			properties: {
				icons,
				key,
				label,
				sourcePath,
				theme
			},
			_visibleRowCount,
			_wantsFocus
		} = this;

		/* if we have a cached focus, let's set the focus */
		if (_focusNode && _wantsFocus) {
			this._wantsFocus = false;
			if (_focusNode !== document.activeElement) {
				_focusNode.focus();
			}
		}
		if (!_resolver && icons && sourcePath) {
			this._resolver = new IconResolver(sourcePath, icons);
		}
		this._cacheItems();
		const top =  0 - (_scrollPosition % ROW_HEIGHT);
		const rows = this._renderChildren();
		const sliderSize = this._sliderSize = _visibleRowCount > rows.length ? rows.length : _visibleRowCount;
		const size = this._size = rows.length;

		return v('div', {
			'aria-label': label,
			classes: this.classes(css.root),
			key,
			role: 'tree',

			onmouseenter: this._onmouseenter,
			onmouseleave: this._onmouseleave
		}, [
			v('div', {
				classes: this.classes(css.scroll),
				key: 'rows',
				role: 'presentation',
				styles: {
					top: String(top) + 'px'
				},
				tabIndex: 0,

				onblur: this._onblur,
				onkeydown: this._onkeydown,
				onmousedown: this._onDragStart,
				onmousemove: this._onDragMove,
				onmouseup: this._onDragEnd,
				ontouchstart: this._onDragStart,
				ontouchmove: this._onDragMove,
				ontouchend: this._onDragEnd,
				onwheel: this._onwheel
			}, rows),
			w(ScrollBar, {
				position: _scrollPosition,
				size,
				sliderSize,
				visible: _scrollVisible,
				theme,

				onScroll: _onScrollbarScroll
			})
		]);
	}
}
