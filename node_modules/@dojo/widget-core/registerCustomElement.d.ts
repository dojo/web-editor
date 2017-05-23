import { CustomElementDescriptor } from './customElements';
/**
 * Describes a function that returns a CustomElementDescriptor
 */
export interface CustomElementDescriptorFactory {
    (): CustomElementDescriptor;
}
/**
 * Register a custom element using the v1 spec of custom elements. Note that
 * this is the default export, and, expects the proposal to work in the browser.
 * This will likely require the polyfill and native shim.
 *
 * @param descriptorFactory
 */
export declare function registerCustomElement(descriptorFactory: CustomElementDescriptorFactory): void;
export default registerCustomElement;
