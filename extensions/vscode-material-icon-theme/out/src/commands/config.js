"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const angular_1 = require("./angular");
const reload = require("./../messages/reload");
const helpers = require("./../helpers");
const folders_1 = require("./folders");
exports.restoreDefaultConfig = () => {
    return restore().then(() => {
        reload.showConfirmToReloadMessage().then(result => {
            if (result)
                helpers.reload();
        });
    });
};
/** Restore all configurations to default. */
const restore = () => {
    // Angular
    return angular_1.enableAngularIcons().then(() => {
        if (helpers.getThemeConfig('angular.iconsEnabled').workspaceValue === false)
            helpers.setThemeConfig('angular.iconsEnabled', true);
        else if (helpers.getThemeConfig('angular.iconsEnabled').globalValue === false)
            helpers.setThemeConfig('angular.iconsEnabled', true, true);
    }).then(() => {
        // Folders
        return folders_1.enableFolderIcons().then(() => {
            helpers.setThemeConfig('folders.icons', 'Default');
        });
    });
};
//# sourceMappingURL=config.js.map