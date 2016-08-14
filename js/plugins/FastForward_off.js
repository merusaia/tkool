//=============================================================================
// FastForward_off.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
/*:
 * @plugindesc 処理の高速化オフプラグイン
 * @author Trb
 * 
 * @help RPGツクールMVにはイベント中決定キーを押し続けると処理が速くなる機能がありますが、
 *  その機能をオフにするためのプラグインです。
 *  アクションゲームなど、高速化を発動させたくないゲームを作る時に使ってください。
 *
 *  <プラグインコマンド>
 *  F_OFF 高速化機能を無効にします。（決定キーを押し続けていてもイベントの処理が速くならない）
 *  F_ON 高速化機能を元に戻します。（通常の状態）
 *  F_BOOST 高速化機能が常時オンになります。（実験で入れてみたものなので不具合が出る可能性あり？）
 *  (プラグインを入れただけだと最初はF_ONの状態になってます。）
 *
 */
(function () {

    var f_flag = 0;
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command && command.toUpperCase() === "F_ON") {
            f_flag = 0;
        }
        if (command && command.toUpperCase() === "F_OFF") {
            f_flag = 1;
        }
        if (command && command.toUpperCase() === "F_BOOST") {
            f_flag = 2;
        }

    };


    var Scene_Map_prototype_isFastForward = Scene_Map.prototype.isFastForward;
    Scene_Map.prototype.isFastForward = function() {
        Scene_Map_prototype_isFastForward.call(this);
        if (f_flag == 1) {
            return 0;
        }
        else if (f_flag == 2) {
            return 1;
        }
        else return ($gameMap.isEventRunning() && !SceneManager.isSceneChanging() &&
            (Input.isLongPressed('ok') || TouchInput.isLongPressed()));

    };

})();