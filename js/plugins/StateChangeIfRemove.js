//=============================================================================
// StateChangeIfRemove.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.0 2016/02/07 解除条件によって様々なステートIDを付与できる機能を追加
// 1.0.0 2016/02/04 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc ステート解除時の変化プラグイン
 * @author トリアコンタン
 *
 * @help ステート解除条件を満たしたときに自動的に別のステートに差し替えます。
 * ステートのメモ欄に以下の書式で入力してください。
 *
 * メモ欄書式（ステートIDには制御文字を利用できます）
 *
 * <SCアイテムで解除:（ステートID）>
 *     アイテムやスキルの効果で解除されたときに（ステートID）を付与。
 * <SC歩数で解除:（ステートID）>
 *     歩数で解除されたときに（ステートID）を付与。
 * <SC行動制約によって解除:（ステートID）>
 *     行動制約で解除されたときに（ステートID）を付与。
 * <SCダメージで解除:（ステートID）>
 *     ダメージで解除されたときに（ステートID）を付与。
 * <SC戦闘終了時に解除:（ステートID）>
 *     戦闘終了時に解除されたときに（ステートID）を付与。
 * <SC自動解除のタイミング:（ステートID）>
 *     ターン経過等で自動解除されたときに（ステートID）を付与。
 * 例：<SCアイテムで解除:3>
 *     <SC歩数で解除:\v[1]>
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */
(function () {
    'use strict';
    var pluginName = 'StateChangeIfRemove';

    var getArgNumber = function (arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(convertEscapeCharacters(arg), 10) || 0).clamp(min, max);
    };

    var convertEscapeCharacters = function(text) {
        if (text == null) text = '';
        var window = SceneManager._scene._windowLayer.children[0];
        return window ? window.convertEscapeCharacters(text) : text;
    };

    if (!Object.prototype.hasOwnProperty('iterate')) {
        Object.defineProperty(Object.prototype, 'iterate', {
            value : function (handler) {
                Object.keys(this).forEach(function (key, index) {
                    handler.call(this, key, this[key], index);
                }, this);
            }
        });
    }

    //=============================================================================
    //  Game_Actor
    //   解除時のステート変更処理を追加
    //=============================================================================
    var _Game_Actor_updateStateSteps = Game_Actor.prototype.updateStateSteps;
    Game_Actor.prototype.updateStateSteps = function(state) {
        _Game_Actor_updateStateSteps.apply(this, arguments);
        this.changeState(state.id, '歩数で解除');
    };

    //=============================================================================
    //  Game_Action
    //   解除時のステート変更処理を追加
    //=============================================================================
    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        target.checkToRemoveStates(_Game_Action_apply.bind(this), arguments, 'アイテムで解除');
    };

    //=============================================================================
    //  Game_Battler
    //   解除時のステート変更処理を追加
    //=============================================================================
    var _Game_Battler_onRestrict = Game_Battler.prototype.onRestrict;
    Game_Battler.prototype.onRestrict = function() {
        this.checkToRemoveStates(_Game_Battler_onRestrict.bind(this), arguments, '行動制約によって解除');
    };

    var _Game_Battler_removeStatesByDamage = Game_Battler.prototype.removeStatesByDamage;
    Game_Battler.prototype.removeStatesByDamage = function() {
        this.checkToRemoveStates(_Game_Battler_removeStatesByDamage.bind(this), arguments, 'ダメージで解除');
    };

    var _Game_Battler_removeBattleStates = Game_Battler.prototype.removeBattleStates;
    Game_Battler.prototype.removeBattleStates = function() {
        this.checkToRemoveStates(_Game_Battler_removeBattleStates.bind(this), arguments, '戦闘終了時に解除');
    };

    var _Game_Battler_removeStatesAuto = Game_Battler.prototype.removeStatesAuto;
    Game_Battler.prototype.removeStatesAuto = function(timing) {
        this.checkToRemoveStates(_Game_Battler_removeStatesAuto.bind(this), arguments, '自動解除のタイミング');
    };

    Game_Battler.prototype.checkToRemoveStates = function(handler, args, tagName) {
        var prevStates = this.states();
        handler.apply(null, args);
        prevStates.forEach(function(state) {
            this.changeState(state.id, tagName);
        }, this);
    };

    Game_Battler.prototype.changeState = function(stateId, tagName) {
        if (this.hasState(stateId)) return;
        var newStateId = $dataStates[stateId].meta['SC' + tagName];
        if (newStateId != null) {
            this._result.deleteRemovedStates(stateId);
            this.addState(getArgNumber(newStateId, 1));
        }
    };

    Game_Battler.prototype.hasState = function(stateId) {
        return this._states.indexOf(stateId) >= 0;
    };

    //=============================================================================
    // Game_ActionResult
    //  ステート付与、解除時のメッセージを抑制します。
    //=============================================================================
    Game_ActionResult.prototype.deleteRemovedStates = function(stateId) {
        this.removedStates.iterate(function(key, value, index) {
            if (value === stateId) this.removedStates.splice(index, 1);
        }.bind(this));
    };

    Game_ActionResult.prototype.deleteAddedStates = function(stateId) {
        this.addedStates.iterate(function(key, value, index) {
            if (value === stateId) this.addedStates.splice(index, 1);
        }.bind(this));
    };
})();
