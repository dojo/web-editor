"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const helpers = require("./../helpers");
const path = require("path");
const fs = require("fs");
const i18n = require("./../i18n");
const reload = require("./../messages/reload");
/** Command to toggle the Angular icons. */
exports.toggleAngularIcons = () => {
    return exports.checkAngularIconsStatus()
        .then(showQuickPickItems)
        .then(handleQuickPickActions);
};
/** Show QuickPick items to select prefered configuration for the folder icons. */
const showQuickPickItems = isEnabled => {
    const on = {
        description: i18n.translate('toggleSwitch.on'),
        detail: i18n.translate('angular.enableIcons'),
        label: isEnabled ? "\u2714" : "\u25FB"
    };
    const off = {
        description: i18n.translate('toggleSwitch.off'),
        detail: i18n.translate('angular.disableIcons'),
        label: !isEnabled ? "\u2714" : "\u25FB"
    };
    return vscode.window.showQuickPick([on, off], {
        placeHolder: i18n.translate('angular.toggleIcons'),
        ignoreFocusOut: false
    });
};
/** Handle the actions from the QuickPick. */
const handleQuickPickActions = value => {
    if (!value || !value.description)
        return;
    switch (value.description) {
        case i18n.translate('toggleSwitch.on'): {
            exports.checkAngularIconsStatus().then(result => {
                if (!result) {
                    helpers.setThemeConfig('angular.iconsEnabled', true, true);
                }
            });
            break;
        }
        case i18n.translate('toggleSwitch.off'): {
            exports.checkAngularIconsStatus().then(result => {
                if (result) {
                    helpers.setThemeConfig('angular.iconsEnabled', false, true);
                }
            });
            break;
        }
        default:
            break;
    }
};
/** Enable icons for angular files */
exports.enableAngularIcons = () => {
    return addAngularFileExtensions().then(() => {
        reload.showConfirmToReloadMessage().then(result => {
            if (result)
                helpers.reload();
        });
    });
};
/** Disable icons for angular files */
exports.disableAngularIcons = () => {
    return deleteAngularFileExtensions().then(() => {
        reload.showConfirmToReloadMessage().then(result => {
            if (result)
                helpers.reload();
        });
    });
};
/** Are the angular icons enabled? */
exports.checkAngularIconsStatus = () => {
    return helpers.getMaterialIconsJSON().then((config) => {
        if (config.fileExtensions['module.ts']) {
            return true;
        }
        else {
            return false;
        }
    });
};
/** Add file extensions for angular files */
const addAngularFileExtensions = () => {
    const iconJSONPath = path.join(helpers.getExtensionPath(), 'out', 'src', 'material-icons.json');
    return helpers.getMaterialIconsJSON().then(config => {
        fs.writeFileSync(iconJSONPath, JSON.stringify(createConfigWithAngular(config), null, 2));
    });
};
const createConfigWithAngular = (config) => {
    return Object.assign({}, config, { "fileExtensions": Object.assign({}, config.fileExtensions, { "module.ts": "_file_angular", "routing.ts": "_file_angular_routing", "component.ts": "_file_angular_component", "guard.ts": "_file_angular_guard", "service.ts": "_file_angular_service", "pipe.ts": "_file_angular_pipe", "directive.ts": "_file_angular_directive" }) });
};
/** Remove file extensions for angular files */
const deleteAngularFileExtensions = () => {
    const iconJSONPath = path.join(helpers.getExtensionPath(), 'out', 'src', 'material-icons.json');
    return helpers.getMaterialIconsJSON().then(config => {
        fs.writeFileSync(iconJSONPath, JSON.stringify(Object.assign({}, helpers.removeIconExtensions(config, 'angular')), null, 2));
    });
};
//# sourceMappingURL=angular.js.map