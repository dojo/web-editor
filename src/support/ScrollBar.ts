import { v } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { theme, ThemeableMixin, ThemeableProperties } from '@dojo/widget-core/mixins/Themeable';
import * as css from '../styles/scrollbar.m.css';
import { getAbsolutePosition } from './events';

/**
 * Properties that can be set `ScrollBar`
 */
export interface ScrollBarProperties extends ThemeableProperties {
	/**
	 * Is the scroll bar horizontal?  Defaults to `false`.
	 */
	horizontal?: boolean;

	/**
	 * The relative position of the top of slider to the scroll area
	 */
	position: number;

	/**
	 * The relative size of the scroll area
	 */
	size?: number;

	/**
	 * The minimum number of pixels of the slider
	 */
	sliderMin?: number;

	/**
	 * The relative size of the slider
	 */
	sliderSize?: number;

	/**
	 * Is the slider visible?
	 */
	visible?: boolean;

	/**
	 * Called when the widget wants to scroll
	 * @param delta The relative size of the requested scroll, negative values are a scroll up and positive values are
	 *              a scroll down.
	 */
	onScroll?(delta: number): void;
}

const DEFAULT_KEY = 'scrollbar';

const ThemeableBase = ThemeableMixin(WidgetBase);

/**
 * A class that provides a visualization of scrolling as well as emits events when the user interacts with
 * the scroll bar.  The properties of the scroll widget are relative, thereby not needing to translate from
 * the real DOM size of the scroll bar or scroll area it represents.
 */
@theme(css)
export default class ScrollBar extends ThemeableBase<ScrollBarProperties> {
	private _domSize = 0;
	private _dragging = false;
	private _dragPosition: number;
	private _visible = false;

	private _getSize(): number {
		return this.properties.size || this._domSize;
	}

	private _fromRelative = (relative: number): number => {
		const size = this._getSize();
		return this._domSize * (size ? relative / size : 0);
	}

	private _toRelative = (absolute: number): number => {
		const size = this._getSize();
		return this._domSize ? (absolute / this._domSize) * size : 0;
	}

	private _onDomUpdate(element: HTMLElement, key: string) {
		const { horizontal = false, key: widgetKey = DEFAULT_KEY } = this.properties;
		if (key === widgetKey) {
			this._domSize = horizontal ? element.clientWidth : element.clientHeight;
		}
	}

	private _onmouseenter(evt: MouseEvent) {
		evt.preventDefault();
		if (!this._visible) {
			this._visible = true;
			this.invalidate();
		}
	}

	private _onmouseleave(evt: MouseEvent) {
		evt.preventDefault();
		if (this._visible) {
			this._visible = false;
			this.invalidate();
		}
	}

	private _onSliderDragStart = (evt: MouseEvent & TouchEvent) => {
		evt.preventDefault();
		const { horizontal } = this.properties;
		this._dragging = true;
		this._dragPosition = getAbsolutePosition(evt, horizontal);
	}

	private _onSliderDrag = (evt: MouseEvent & TouchEvent) => {
		const {
			_dragging,
			_dragPosition,
			properties: {
				horizontal,
				onScroll
			}
		} = this;
		if (_dragging) {
			evt.preventDefault();
			const delta = this._toRelative(getAbsolutePosition(evt, horizontal) - _dragPosition);
			onScroll && onScroll(delta);
			this._dragPosition = getAbsolutePosition(evt, horizontal);
		}
	}

	private _onSliderDragStop = (evt: MouseEvent & TouchEvent) => {
		evt.preventDefault();
		this._dragging = false;
	}

	public onElementCreated(element: HTMLElement, key: string) {
		this._onDomUpdate(element, key);
	}

	public onElementUpdated(element: HTMLElement, key: string) {
		this._onDomUpdate(element, key);
	}

	render() {
		const {
			horizontal = false,
			key = DEFAULT_KEY,
			position,
			size = 0,
			sliderMin = 10,
			sliderSize = 0,
			visible: propsVisible
		} = this.properties;
		const renderPosition = String(this._fromRelative(position)) + 'px';
		const relativeSliderSize = this._fromRelative(sliderSize);
		const renderSliderSize = String(relativeSliderSize > sliderMin ? relativeSliderSize : sliderMin) + 'px';
		const visible = sliderSize >= size ? false : propsVisible !== undefined ? propsVisible : this._visible;
		const styles = horizontal ? {
			left: renderPosition,
			width: renderSliderSize
		} : {
			top: renderPosition,
			height: renderSliderSize
		};

		return v('div', {
			classes: this.classes(css.root, css.vertical, visible ? css.visible : css.invisible),
			key,

			onmouseenter: this._onmouseenter,
			onmouseleave: this._onmouseleave
		}, [
			v('div', {
				classes: this.classes(css.slider),
				key: 'slider',
				styles,

				onmousedown: this._onSliderDragStart,
				onmousemove: this._onSliderDrag,
				onmouseup: this._onSliderDragStop,
				ontouchstart: this._onSliderDragStart,
				ontouchmove: this._onSliderDrag,
				ontouchend: this._onSliderDragStop
			})
		]);
	}
}
