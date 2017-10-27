import { v } from '@dojo/widget-core/d';
import Dimensions from '@dojo/widget-core/meta/Dimensions';
import Drag from '@dojo/widget-core/meta/Drag';
import Matches from '@dojo/widget-core/meta/Matches';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { theme, ThemeableMixin, ThemeableProperties } from '@dojo/widget-core/mixins/Themeable';
import * as css from '../styles/scrollbar.m.css';

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
	onScroll(delta: number): void;
}

const DEFAULT_KEY = 'root';

const ThemeableBase = ThemeableMixin(WidgetBase);

/**
 * Convert a relative number to an absolute number
 * @param relative The relative value to convert to an absolute value
 * @param relativeSize The relative size to compare with the absolute size
 * @param absoluteSize The absolute size to compare with the relative size
 */
function fromRelative(relative: number, relativeSize: number, absoluteSize: number): number {
	return absoluteSize * (relativeSize ? relative / relativeSize : 0);
}

/**
 * Convert an absolute number to a relative number
 * @param absolute The absolute value to convert to a relative value
 * @param relativeSize The relative size to compare with the absolute size
 * @param absoluteSize The absolute size to compare with the relative size
 */
function toRelative(absolute: number, relativeSize: number, absoluteSize: number): number {
	return absoluteSize ? (absolute / absoluteSize) * relativeSize : 0;
}

/**
 * A class that provides a visualization of scrolling as well as emits events when the user interacts with
 * the scroll bar.  The properties of the scroll widget are relative, thereby not needing to translate from
 * the real DOM size of the scroll bar or scroll area it represents.
 */
@theme(css)
export default class ScrollBar extends ThemeableBase<ScrollBarProperties> {
	private _visible = false;

	/**
	 * Returns the height or width of the scroll bar, depending on if it is horizontal or not
	 */
	private _getDomSize(): number {
		const { horizontal, key = DEFAULT_KEY } = this.properties;
		const { height, width } = this.meta(Dimensions).get(`${key}`).size;
		return horizontal ? width : height;
	}

	/**
	 * Determine if the scroll bar node is being clicked and if so, call the scroll listener with the relative position
	 * that is attempted to be navigated to.
	 * @param event The mouse event
	 */
	private _onclick(event: MouseEvent) {
		const { key = DEFAULT_KEY } = this.properties;
		if (this.meta(Matches).get(`${key}`, event)) {
			event.preventDefault();
			const domSize = this._getDomSize();
			const {
				horizontal,
				position,
				size = domSize,
				sliderMin = 10,
				sliderSize,
				onScroll
			} = this.properties;
			const absoluteDelta = (horizontal ? event.offsetX : event.offsetY) -
				(fromRelative(position, size, domSize) +
				((sliderSize ? fromRelative(sliderSize, size, domSize) : sliderMin) / 2));
			onScroll(toRelative(absoluteDelta, size, domSize));
		}
	}

	/**
	 * Set the visible state to true if the mouse is hovering over the scroll bar
	 * @param event The pointer event
	 */
	private _onpointerenter(event: PointerEvent) {
		event.preventDefault();
		if (!this._visible) {
			this._visible = true;
			this.invalidate();
		}
	}

	/**
	 * Set the visible state to false if the mouse has moved away from the scroll bar
	 * @param event The pointer event
	 */
	private _onpointerleave(event: PointerEvent) {
		event.preventDefault();
		if (this._visible) {
			this._visible = false;
			this.invalidate();
		}
	}

	render() {
		const domSize = this._getDomSize();
		const {
			properties: {
				horizontal = false,
				key = DEFAULT_KEY,
				position,
				size = domSize,
				sliderMin = 10,
				sliderSize = 0,
				visible: propsVisible,
				onScroll
			}
		} = this;

		let dragging = false;
		const dragResult = this.meta(Drag).get('slider');
		const delta = horizontal ? dragResult.delta.x : dragResult.delta.y;
		dragging = dragResult.isDragging;
		delta && onScroll(toRelative(delta, size, domSize));

		const renderPosition = `${fromRelative(position, size, domSize)}px`;
		const absoluteSliderSize = fromRelative(sliderSize, size, domSize);
		const renderSliderSize = `${absoluteSliderSize > sliderMin ? absoluteSliderSize : sliderMin}px`;
		const visible = sliderSize >= size ? false : propsVisible !== undefined ? propsVisible : this._visible;
		const styles = {
			[ horizontal ? 'left' : 'top' ]: renderPosition,
			[ horizontal ? 'width' : 'height' ]: renderSliderSize
		};

		return v('div', {
			classes: this.classes(
				css.root,
				horizontal ? css.horizontal : css.vertical,
				visible || dragging ? css.visible : css.invisible
			),
			key,

			onclick: this._onclick,
			onpointerenter: this._onpointerenter,
			onpointerleave: this._onpointerleave
		}, [
			v('div', {
				classes: this.classes(css.slider, dragging ? css.dragging : null),
				key: 'slider',
				styles
			})
		]);
	}
}
