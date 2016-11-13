//=============================================================================
// Plugin - Fps Sync as Option
// FpsSyncOption.js
//=============================================================================

var Imported = Imported || {};
Imported.FpsSyncOption = true;

var Liquidize = Liquidize || {};
Liquidize.FpsSync = Liquidize.FpsSync || {};

//=============================================================================
/*:
 * @plugindesc v1.00 Adds a command to the options to enable turning on
 * or off the Monitor FPS Sync.
 * @author Liquidize
 *
 * @param Command Name
 * @desc Command name in the options menu.
 * @default Monitor FPS Sync
 *
 * @param Default Value
 * @desc The default value of the fps sync option.
 * @default true
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin is to be used with RPG Maker MV version 1.2.0 and upward.
 *
 * Enables the user to disable or enable the FPS Syncing way of updating the
 * game that was added as of v1.1.0.
 *
 * 以下、merusaia (https://twitter.com/merusaia)が追記。
 *  
 * 20160812: SceneManager.updateWithoutFpsSync に以下の三行をw追加。
 *  // 以下の三行は、ver1.3.0用の修正。tokinekoさんより。この三行がないと、Syncをfalse ＆ v1.3.0& & iOS の場合にタップが反応しなくなります。
 *  if(!Utils.isMobileSafari()) {
 *      this.updateInputData();
 *  }
 *
 */
//=============================================================================

//=============================================================================
// Parameters
//=============================================================================

Liquidize.Parameters = PluginManager.parameters('FpsSyncOption');
Liquidize.Param = Liquidize.Param || {};

Liquidize.Param.FpsSyncCmdName = String(Liquidize.Parameters['Command Name']);
Liquidize.Param.FpsSyncDefault = eval(String(Liquidize.Parameters['Default Value']));

//=============================================================================
// Main
//=============================================================================

ConfigManager.fpsSync = Liquidize.Param.FpsSyncDefault;

Liquidize.FpsSync.ConfigManager_makeData = ConfigManager.makeData;
ConfigManager.makeData = function() {
    var config = Liquidize.FpsSync.ConfigManager_makeData.call(this);
    config.fpsSync = this.fpsSync;
    return config;
};

Liquidize.FpsSync.ConfigManager_applyData = ConfigManager.applyData;
ConfigManager.applyData = function(config) {
    Liquidize.FpsSync.ConfigManager_applyData.call(this, config);
    this.fpsSync = this.readFpsSyncConfig(config, 'fpsSync');
};

ConfigManager.readFpsSyncConfig = function(config, name) {
    var value = config[name];
    if (value !== undefined) {
        return value;
    } else {
        return Liquidize.Param.FpsSyncDefault;
    }
};

//=============================================================================
// SceneManager
//=============================================================================

SceneManager.updateMainDefault = SceneManager.updateMain;

SceneManager.updateWithoutFpsSync = function() {
    // 以下の三行は、ver1.3.0用の修正。tokinekoさんより。この三行がないと、Syncをfalse ＆ v1.3.0& & iOS の場合にタップが反応しなくなります。
    if(!Utils.isMobileSafari()) {
        this.updateInputData();
    }
    this.updateInputData();
    this.changeScene();
    this.updateScene();
    this.renderScene();
    this.requestUpdate();
};

SceneManager.updateMain = function() {
    if (ConfigManager.fpsSync) {
        this.updateMainDefault();
    } else {
        this.updateWithoutFpsSync();
    }
};

//=============================================================================
// Window_Options
//=============================================================================

Liquidize.FpsSync.Window_Options_addGeneralOptions =
    Window_Options.prototype.addGeneralOptions;
Window_Options.prototype.addGeneralOptions = function() {
    Liquidize.FpsSync.Window_Options_addGeneralOptions.call(this);
    this.addCommand(Liquidize.Param.FpsSyncCmdName, 'fpsSync');
};

//=============================================================================
// End of File
//=============================================================================
