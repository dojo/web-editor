"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers = require("./index");
const vscode = require("vscode");
const angular_1 = require("../commands/angular");
const folders_1 = require("../commands/folders");
/** Store the latest version number in the user data settings. */
exports.updateVersionInUserDataSettings = () => {
    const setting = {
        version: helpers.getCurrentExtensionVersion(),
    };
    return helpers.writeUserDataSettings(setting);
};
/** Initialize the user data settings. */
exports.initUserDataSettings = () => {
    const setting = {
        name: 'material-icon-theme',
        version: helpers.getCurrentExtensionVersion()
    };
    return helpers.writeUserDataSettings(setting);
};
/** Watch for changes in the configurations to update the icons theme. */
exports.watchForConfigChanges = () => {
    vscode.workspace.onDidChangeConfiguration(exports.configChangeDetection);
};
/**
 * Compare the workspace and the user configurations
 * with the current setup of the icons.
*/
exports.configChangeDetection = () => {
    return compareAngularConfigs()
        .then(() => compareFolderConfigs());
};
const compareAngularConfigs = () => {
    const angularIconsConfig = helpers.getThemeConfig('angular.iconsEnabled');
    return angular_1.checkAngularIconsStatus().then(result => {
        if (angularIconsConfig.workspaceValue === true || angularIconsConfig.globalValue === true) {
            if (!result) {
                angular_1.enableAngularIcons();
            }
        }
        else if ((angularIconsConfig.workspaceValue === false && angularIconsConfig.globalValue === false) ||
            (angularIconsConfig.workspaceValue === undefined && angularIconsConfig.globalValue === false) ||
            (angularIconsConfig.workspaceValue === false && angularIconsConfig.globalValue === undefined)) {
            if (result) {
                angular_1.disableAngularIcons();
            }
        }
    });
};
const compareFolderConfigs = () => {
    const folderIconsConfig = helpers.getThemeConfig('folders.icons');
    return folders_1.checkFolderIconsStatus().then(result => {
        switch (result) {
            case folders_1.FolderType.None:
                if (folderIconsConfig.globalValue === "default") {
                    folders_1.enableFolderIcons();
                }
                else if (folderIconsConfig.globalValue === "classic") {
                    folders_1.enableClassicFolderIcons();
                }
                break;
            case folders_1.FolderType.Default:
                if (folderIconsConfig.globalValue === "none") {
                    folders_1.disableFolderIcons();
                }
                else if (folderIconsConfig.globalValue === "classic") {
                    folders_1.enableClassicFolderIcons();
                }
                break;
            case folders_1.FolderType.Classic:
                if (folderIconsConfig.globalValue === "none") {
                    folders_1.disableFolderIcons();
                }
                else if (folderIconsConfig.globalValue === "default") {
                    folders_1.enableFolderIcons();
                }
                break;
            default:
                break;
        }
    });
};
//# sourceMappingURL=config.js.map