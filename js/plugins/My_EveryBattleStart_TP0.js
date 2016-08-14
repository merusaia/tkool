//=============================================================================
// ***.js
//=============================================================================

// コメント英語版
/*:
 * @plugindesc ----.
 * @author merusaia
 *
 * @help This plugin does not provide plugin commands.
 */

// コメント日本語版
/*:ja
 * @plugindesc バトル開始時に、味方・敵パーティ全員のTPを0にします。
 * @author merusaia
 *
 * @help このプラグインには、プラグインコマンドはありません。
 */


// TP制御
Game_Battler.prototype.initTp = function() {
    this.setTp(0);
};
