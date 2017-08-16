'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const i18n = require("./i18n");
const commands = require("./commands");
const start_1 = require("./messages/start");
const config_1 = require("./helpers/config");
/** If the icons theme gets activated by starting the editor this function will be executed. */
exports.activate = (context) => {
    // show start messages after the translations are initialized
    i18n.initTranslations().then(() => {
        start_1.showStartMessages();
    }).catch(err => console.log(err));
    // load the commands
    context.subscriptions.push(...commands.commands);
    config_1.configChangeDetection();
    config_1.watchForConfigChanges();
};
/** This method is called when your extension is deactivated */
exports.deactivate = () => {
};
//# sourceMappingURL=extension.js.map