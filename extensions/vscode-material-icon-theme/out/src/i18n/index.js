"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
// Get current language of the vs code workspace
exports.getCurrentLanguage = () => vscode.env.language;
let currentTranslation;
let fallbackTranslation; // default: en
let init = false;
/** Initialize the translations */
exports.initTranslations = () => {
    return loadTranslation(exports.getCurrentLanguage()).then(translation => {
        currentTranslation = translation;
        // load fallback translation
        loadTranslation('en').then(fallbackTranslation => {
            fallbackTranslation = fallbackTranslation;
        });
    });
};
/** Load the required translation */
const loadTranslation = (language) => {
    return readTranslationFile(language)
        .catch(() => readTranslationFile('en'));
};
/** Read the translation file from the file system */
const readTranslationFile = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(`${__dirname}/${filename}.json`, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(JSON.parse(data));
            }
        });
    });
};
/** Translate the keys */
exports.translate = (key, translations = currentTranslation, fallback = fallbackTranslation) => {
    return getValue(translations, key) ?
        getValue(translations, key) :
        getValue(fallback, key) ?
            getValue(fallback, key) : undefined;
};
/** Get the nested keys of an object (http://stackoverflow.com/a/6491621/6942210)
 *
 * *This solution is lighter than the lodash get-version and works fine for the translations.* */
const getValue = (o, s) => {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, ''); // strip a leading dot
    let a = s.split('.');
    /** Avoid errors in the getValue function. */
    const isObject = (object) => {
        return object === Object(object);
    };
    for (let i = 0, n = a.length; i < n; ++i) {
        let k = a[i];
        if (isObject(o) && k in o) {
            o = o[k];
        }
        else {
            return;
        }
    }
    return o;
};
//# sourceMappingURL=index.js.map