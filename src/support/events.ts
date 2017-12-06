function isTouchEvent(evt: any): evt is TouchEvent {
	return evt.type.match(/^touch/);
}

/**
 * Retrieve the absolute posistion for a mouse/touch event
 * @param evt The event to determine the position for
 * @param horizontal A flag to calculate the horizontal position
 * @return the absolute number of the position for the event
 */
export function getAbsolutePosition(evt: MouseEvent, horizontal?: boolean): number;
/**
 * Retrieve the absolute posistion for a mouse/touch event
 * @param evt The event to determine the position for
 * @param horizontal A flag to calculate the horizontal position
 * @return the absolute number of the position for the event
 */
export function getAbsolutePosition(evt: TouchEvent, horizontal?: boolean): number;
/**
 * Retrieve the absolute posistion for a mouse/touch event
 * @param evt The event to determine the position for
 * @param horizontal A flag to calculate the horizontal position
 * @return the absolute number of the position for the event
 */
export function getAbsolutePosition(evt: MouseEvent | TouchEvent, horizontal?: boolean): number {
	return isTouchEvent(evt) ?
		horizontal ? evt.changedTouches[0].screenX : evt.changedTouches[0].screenY :
		horizontal ? evt.pageX : evt.pageY;
}
