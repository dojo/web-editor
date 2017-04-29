import global from '@dojo/core/global';

const result = global.window && global.window.DOMParser;

export default result as typeof DOMParser;
