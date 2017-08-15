import WeakMap from '@dojo/shim/WeakMap';

interface PrivateData {
	contentWindowEventListeners: { [type: string]: (EventListener | EventListenerObject | undefined)[]; };
	documentOpen?: boolean;
	documentStrings: string[];
	eventListeners: { [type: string]: (EventListener | EventListenerObject | undefined)[]; };
}

const iframeData = new WeakMap<HTMLIFrameElement, PrivateData>();

export function callIframeListener(iframe: HTMLIFrameElement, type: string): boolean {
	const evt = document.createEvent('CustomEvent');
	evt.initEvent(type, true, true);
	return iframe.dispatchEvent(evt);
}

export function callContentWindowListener(iframe: HTMLIFrameElement, type: string): boolean {
	const evt = document.createEvent('CustomEvent');
	evt.initEvent(type, true, true);
	return iframe.contentWindow.dispatchEvent(evt);
}

export function getDocumentStrings(iframe: HTMLIFrameElement): string[] {
	return [ ...iframeData.get(iframe)!.documentStrings ];
}

export default function createMockIframe(): HTMLIFrameElement {
	const iframe = {
		addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean | undefined): void {
			if (!iframeData.get(iframe)!.eventListeners[type]) {
				iframeData.get(iframe)!.eventListeners[type] = [];
			}
			iframeData.get(iframe)!.eventListeners[type].push(listener);
		},

		classList: {
			add() {}
		},

		contentWindow: {
			addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean | undefined): void {
				if (!iframeData.get(iframe)!.contentWindowEventListeners[type]) {
					iframeData.get(iframe)!.contentWindowEventListeners[type] = [];
				}
				iframeData.get(iframe)!.contentWindowEventListeners[type].push(listener);
			},

			dispatchEvent(evt: Event): boolean {
				const listeners = iframeData.get(iframe)!.contentWindowEventListeners[evt.type];
				if (listeners) {
					return listeners.some((listener) => {
						(<any> listener).call(iframe.contentWindow, evt);
						return evt.defaultPrevented;
					});
				}
				return true;
			},

			document: {
				close(): void {
					iframeData.get(iframe)!.documentOpen = false;
				},

				write(...content: string[]): void {
					const data = iframeData.get(iframe)!;
					if (!data.documentOpen) {
						data.documentStrings = [];
						data.documentOpen = true;
					}
					data.documentStrings = data.documentStrings.concat(content);
				}
			},

			location: {
				reload() {
					callIframeListener(iframe, 'load');
				}
			},

			removeEventListener(type: string, listener?: EventListener | EventListenerObject | undefined, options?: boolean | EventListenerOptions | undefined): void {
				const listeners = iframeData.get(iframe)!.contentWindowEventListeners[type];
				if (listeners) {
					iframeData.get(iframe)!.contentWindowEventListeners[type] = listeners
						.filter((item) => item !== listener);
				}
			}
		},

		dispatchEvent(evt: Event): boolean {
			const listeners = iframeData.get(iframe)!.eventListeners[evt.type];
			if (listeners) {
				return listeners.some((listener) => {
					(<any> listener).call(iframe.contentWindow, evt);
					return evt.defaultPrevented;
				});
			}
			return true;
		},

		removeEventListener(type: string, listener?: EventListener | EventListenerObject | undefined, options?: boolean | EventListenerOptions | undefined): void {
			const listeners = iframeData.get(iframe)!.eventListeners[type];
				if (listeners) {
					iframeData.get(iframe)!.eventListeners[type] = listeners
						.filter((item) => item !== listener);
				}
		},

		setAttribute(name: string, value: string): void {
			(<any> this)[name] = value;
		}
	} as HTMLIFrameElement;

	iframeData.set(iframe, {
		contentWindowEventListeners: {},
		documentStrings: [],
		eventListeners: {}
	});

	return iframe;
}
