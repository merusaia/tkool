//=============================================================================
// RetryBattlePluginCommand.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2016 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2016/11/12 初版 (merusaia) →　トリアコンタンさんのRetryBattle.jsが他プラグインとの競合で使えなかったため、「強制リトライ」プラグインコマンド部分だけ抜き出して使用
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc RetryBattlePluginCommand
 * @author triacontane
 *
 * @help
 * 戦闘中に実行すると強制的に戦闘を最初からやり直す
 * プラグインコマンドを提供します。有名RPGの某魔法が再現できます。
 *（トリアコンタンさんのRetryBattle.jsで、オマケ機能として提供されたものだけを抜き出して、このプラグインで使用しています）
 * 
 * プラグインコマンド詳細
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 *
 * RB_強制リトライ  # 戦闘中に使用すると強制的にリトライします。
 * RB_FORCE_RETRY   # 同上
 *
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc 戦闘リトライプラグインコマンド専用プラグイン
 * @author トリアコンタン, メルサイア（著作表示はトリアコンタンさんのみ）
 *
 * @help 
 * 戦闘中に実行すると強制的に戦闘を最初からやり直す
 * プラグインコマンドを提供します。有名RPGの某魔法が再現できます。
 *（トリアコンタンさんのRetryBattle.jsで、オマケ機能として提供されたものだけを抜き出したものです）
 * 
 * プラグインコマンド詳細
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 *
 * RB_強制リトライ  # 戦闘中に使用すると強制的にリトライします。
 * RB_FORCE_RETRY   # 同上
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(function() {
    'use strict';
    var pluginName    = 'RetryBattlePluginCommand';
    var metaTagPrefix = 'RB_'; // プラグインコマンドの命令後の最初につける識別子です。"RetryBattle_"の略で"RB_強制リトライ"などと記述します。

    var getCommandName = function(command) {
        return (command || '').toUpperCase();
    };

    var getParamString = function(paramNames) {
        var value = getParamOther(paramNames);
        return value === null ? '' : value;
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return (value || '').toUpperCase() === 'ON';
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var commandPrefix = new RegExp('^' + metaTagPrefix);
        if (!command.match(commandPrefix)) return;
        // try～catchせずにプラグインコマンドをチェックします。
        this.pluginCommandRetryBattle(command.replace(commandPrefix, ''), args);
        // このプラグインの下で例外を取れるようにするため、try～catch文はコメントアウトしています(merusaia)。
        // try {
        //     this.pluginCommandRetryBattle(command.replace(commandPrefix, ''), args);
        // } catch (e) {
        //     if ($gameTemp.isPlaytest() && Utils.isNwjs()) {
        //         var window = require('nw.gui').Window.get();
        //         if (!window.isDevToolsOpen()) {
        //             var devTool = window.showDevTools();
        //             devTool.moveTo(0, 0);
        //             devTool.resizeTo(window.screenX + window.outerWidth, window.screenY + window.outerHeight);
        //             window.focus();
        //         }
        //     }
        //     console.log('プラグインコマンドの実行中にエラーが発生しました。');
        //     console.log('- コマンド名 　: ' + command);
        //     console.log('- コマンド引数 : ' + args);
        //     console.log('- エラー原因   : ' + e.stack || e.toString());
        // }
    };

    Game_Interpreter.prototype.pluginCommandRetryBattle = function(command) {
        switch (getCommandName(command)) {
            case '強制リトライ' :
            case 'FORCE_RETRY' :
                if ($gameParty.inBattle()) SceneManager.push(Scene_BattleReturn);
                break;
        }
    };

    var _Game_Interpreter_command353      = Game_Interpreter.prototype.command353;
    Game_Interpreter.prototype.command353 = function() {
        var result = _Game_Interpreter_command353.apply(this, arguments);
        BattleManager.goToGameover();
        return result;
    };

    var _Game_Interpreter_command301      = Game_Interpreter.prototype.command301;
    Game_Interpreter.prototype.command301 = function() {
        var result = _Game_Interpreter_command301.apply(this, arguments);
        if (!$gameParty.inBattle()) {
            BattleManager.setBossBattle(this._params[0] <= 1);
        }
        return result;
    };


    //=============================================================================
    // Game_System
    //  リトライ禁止フラグを管理します。
    //=============================================================================
    var _Game_System_initialize      = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.apply(this, arguments);
        this._retryDisable = false;
        this._retryCount   = 0;
    };

    Game_System.prototype.setRetryDisable = function(value) {
        this._retryDisable = !!value;
    };

    Game_System.prototype.isRetryDisable = function() {
        return this._retryDisable;
    };

    Game_System.prototype.addRetryCount = function() {
        this._retryCount = this.getRetryCount() + 1;
    };

    Game_System.prototype.getRetryCount = function() {
        return this._retryCount || 0;
    };

    //=============================================================================
    // BattleManager
    //  リトライ関連処理を追加定義します。
    //=============================================================================
    BattleManager.setupRetry = function() {
        SoundManager.playBattleStart();
        $gameTemp.clearCommonEvent();
        $gameTroop.setup($gameTroop.troop().id);
        $gameSystem.addRetryCount();
    };

    BattleManager.setBossBattle = function(value) {
        this._bossBattle = !!value;
    };

    var _BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle      = function() {
        DataManager.saveGameForRetry();
        _BattleManager_startBattle.apply(this, arguments);
    };

    var _BattleManager_updateBattleEnd = BattleManager.updateBattleEnd;
    BattleManager.updateBattleEnd      = function() {
        _BattleManager_updateBattleEnd.apply(this, arguments);
        this.goToGameover();
    };

    BattleManager.goToGameover = function() {
        if (SceneManager.isNextScene(Scene_Gameover)) {
            Scene_Gameover.firstShow = true;
            SceneManager.push(Scene_Gameover);
        }
    };

    BattleManager.canRetry = function() {
        return !$gameSystem.isRetryDisable() && this.checkBattleType() && paramCommandRetry && DataManager.hasRetryData();
    };

    BattleManager.checkBattleType = function() {
        return (paramRetryNormalEnemy && !this._bossBattle) || (paramRetryBossEnemy && this._bossBattle);
    };

    //=============================================================================
    // DataManager
    //  リトライ用データのセーブとロードを行います。
    //=============================================================================
    DataManager.saveGameForRetry = function() {
        var json = JsonEx.stringify(this.makeSaveContents());
        if (json.length >= 200000) {
            console.warn('Save data too big!');
        }
        this._retryData = LZString.compressToBase64(json);
    };

    DataManager.hasRetryData = function() {
        return !!this._retryData;
    };

    DataManager.loadGameForRetry = function() {
        if (this._retryData) {
            var json = LZString.decompressFromBase64(this._retryData);
            this.extractSaveContents(JsonEx.parse(json));
        }
    };

    //=============================================================================
    // SceneManager
    //  リトライ中かどうかの判定を行います。
    //=============================================================================
    SceneManager.isSceneRetry = function() {
        return this._stack.some(function(scene) {
            return scene === Scene_Gameover;
        });
    };

    //=============================================================================
    // Window_MenuCommand
    //  リトライ用のメニューでセーブを禁止します。
    //=============================================================================
    var _Window_MenuCommand_isSaveEnabled      = Window_MenuCommand.prototype.isSaveEnabled;
    Window_MenuCommand.prototype.isSaveEnabled = function() {
        return _Window_MenuCommand_isSaveEnabled.apply(this, arguments) && !SceneManager.isSceneRetry();
    };

    var _Window_MenuCommand_isGameEndEnabled      = Window_MenuCommand.prototype.isGameEndEnabled;
    Window_MenuCommand.prototype.isGameEndEnabled = function() {
        return _Window_MenuCommand_isGameEndEnabled.apply(this, arguments) && !SceneManager.isSceneRetry();
    };


    //=============================================================================
    // Scene_Gameover
    //  リトライ用データのセーブとロードを行います。
    //=============================================================================
    Scene_Gameover.firstShow = false;

    var _Scene_Gameover_create      = Scene_Gameover.prototype.create;
    Scene_Gameover.prototype.create = function() {
        _Scene_Gameover_create.apply(this, arguments);
        this.createWindowLayer();
        this.createForeground();
        this.createRetryWindow();
    };

    var _Scene_Gameover_start      = Scene_Gameover.prototype.start;
    Scene_Gameover.prototype.start = function() {
        _Scene_Gameover_start.apply(this, arguments);
        if (!Scene_Gameover.firstShow) {
            if (SceneManager.isPreviousScene(Scene_Menu)) {
                this.executeRetry(1);
            }
            if (SceneManager.isPreviousScene(Scene_Load)) {
                this.startFadeIn(this.fadeSpeed(), false);
            }
        }
        Scene_Gameover.firstShow = false;
    };

    var _Scene_Gameover_stop      = Scene_Gameover.prototype.stop;
    Scene_Gameover.prototype.stop = function() {
        if (!SceneManager.isNextScene(Scene_Load) && !SceneManager.isNextScene(Scene_Menu)) {
            _Scene_Gameover_stop.apply(this, arguments);
        } else {
            Scene_Base.prototype.stop.call(this);
        }
    };

    var _Scene_Gameover_terminate      = Scene_Gameover.prototype.terminate;
    Scene_Gameover.prototype.terminate = function() {
        if (!SceneManager.isNextScene(Scene_Load) && !SceneManager.isNextScene(Scene_Menu)) {
            _Scene_Gameover_terminate.apply(this, arguments);
        } else {
            Scene_Base.prototype.terminate.call(this);
        }
    };

    var _Scene_Gameover_playGameoverMusic      = Scene_Gameover.prototype.playGameoverMusic;
    Scene_Gameover.prototype.playGameoverMusic = function() {
        if (!SceneManager.isPreviousScene(Scene_Load)) {
            _Scene_Gameover_playGameoverMusic.apply(this, arguments);
        }
    };

    Scene_Gameover.prototype.createRetryWindow = function() {
        this._retryWindow = new Window_RetryCommand();
        this._retryWindow.setHandler('retry', this.commandRetry.bind(this));
        this._retryWindow.setHandler('load', this.commandLoad.bind(this));
        this._retryWindow.setHandler('title', this.commandTitle.bind(this));
        this.addWindow(this._retryWindow);
    };

    Scene_Gameover.prototype.createForeground = function() {
        this._messageWindow                   = new Window_Base(0, 0, 0, 0);
        this._messageWindow.opacity           = 0;
        this._messageWindow.contents.fontSize = paramFontSize;
        this.addWindow(this._messageWindow);
        if (paramMessage) {
            this.drawMessage();
        }
    };

    Scene_Gameover.prototype.drawMessage = function() {
        var padding = this._messageWindow.padding;
        var width   = this._messageWindow.drawTextEx(paramMessage, 0, 0) + padding * 2;
        var height  = paramFontSize + 8 + padding * 2;
        var x       = Graphics.boxWidth / 2 - width / 2;
        this._messageWindow.move(x, paramMessageY, width, height);
        this._messageWindow.createContents();
        this._messageWindow.drawTextEx(paramMessage, 0, 0);
    };

    Scene_Gameover.prototype.commandRetry = function() {
        DataManager.loadGameForRetry();
        if (paramShowMenu) {
            SceneManager.push(Scene_Menu);
        } else {
            this._retryWindow.close();
            this.executeRetry(this.fadeSpeed());
        }
    };

    Scene_Gameover.prototype.commandLoad = function() {
        this._retryWindow.close();
        SceneManager.push(Scene_Load);
    };

    Scene_Gameover.prototype.commandTitle = function() {
        this._retryWindow.close();
        this.gotoTitle();
    };

    Scene_Gameover.prototype.executeRetry = function(fade) {
        BattleManager.setupRetry();
        this.popScene();
        this.startFadeOut(fade, true);
    };

    Scene_Gameover.prototype.update = function() {
        if (!this.isBusy()) {
            this._retryWindow.open();
        }
        Scene_Base.prototype.update.call(this);
    };

    Scene_Gameover.prototype.isBusy = function() {
        return this._retryWindow.isClosing() || Scene_Base.prototype.isBusy.call(this);
    };

    //=============================================================================
    // Scene_Base
    //  リトライ状態からの再ゲームオーバーを禁止します。
    //=============================================================================
    var _Scene_Base_checkGameover      = Scene_Base.prototype.checkGameover;
    Scene_Base.prototype.checkGameover = function() {
        return !SceneManager.isSceneRetry() && _Scene_Base_checkGameover.apply(this, arguments);
    };

    //=============================================================================
    // Scene_Load
    //  ロード時にゲームオーバーMEを止めます。
    //=============================================================================
    var _Scene_Load_onLoadSuccess      = Scene_Load.prototype.onLoadSuccess;
    Scene_Load.prototype.onLoadSuccess = function() {
        if (SceneManager.isSceneRetry()) {
            AudioManager.stopAll();
        }
        _Scene_Load_onLoadSuccess.apply(this, arguments);
    };

    //=============================================================================
    // Scene_BattleReturn
    //  そのまま戦闘画面に戻ります。
    //=============================================================================
    function Scene_BattleReturn() {
        this.initialize.apply(this, arguments);
    }

    Scene_BattleReturn.prototype             = Object.create(Scene_Gameover.prototype);
    Scene_BattleReturn.prototype.constructor = Scene_BattleReturn;

    Scene_BattleReturn.prototype.create = function() {
    };

    Scene_BattleReturn.prototype.start = function() {
        this.executeRetry(this.fadeSpeed());
    };

    Scene_BattleReturn.prototype.isBusy = function() {
        return Scene_Base.prototype.isBusy.call(this);
    };

})();

