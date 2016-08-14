//=============================================================================
// minRPG_MyBattleSetting Ver.0.0.2
//=============================================================================

/*:
 * @plugindesc 戦闘を自分好みに変更するプラグインです。(1)スキル回避判定を取得可能にする。
 * @author 地球のみんな（クレジット記載不要）
 *
 * @help
 *【プラグインコマンド】
 * このプラグインにはプラグインコマンドはありません。
 *
 * 【概要】
 * 戦闘を自分好みに変更するプラグインです。現時点では、以下のことが出来ます。
 *  (1)スキル回避判定をコモンイベントで取得可能にする。
 *
 * 【詳細（上記でわかりにくいところの説明など）】
 * (1)スキルが回避されたかをコモンイベントで取得可能にするためのプラグインです。
 *　　　→　デフォルトでは、取れないようです。
 *　　　→　ですので、rpg_sprites.jsの「//this._battler.clearResult();」の部分をコメントアウトすれば、できるようです。
 *　　　→　スキル発動時に呼び出すコモンイベントで、以下のようなスクリプトを書けば、任意のスイッチに格納できます。
 * 【回避判定をするスクリプトの例】
 * // 回避された場合のみ、スイッチ504をON （使用者が自分でミスした場合はOFF）
 * var _isTargetAvoid = false; // デフォルトはOFF
 * if (BattleManager._subject != null) {                                                                             // 分岐1: _subjectがnullやundefinedの時、_subject._***と書くとエラーになるのを防ぐため
 *   if(BattleManager._subject.opponentsUnit()!= null && BattleManager._subject.opponentsUnit().members() != null){  // 分岐2: opponentsUnit()、menbers()のnullやundefinedチェック
 *     if(BattleManager._subject._lastTargetIndex != null && BattleManager._subject._lastTargetIndex > -1){          // 分岐3： 配列にマイナスが入るエラーを防ぐため
 *       if(BattleManager._subject.opponentsUnit().members()[BattleManager._subject._lastTargetIndex] != null){      // 分岐4: ターゲットがnullじゃない。                               // 例外3: ラストターゲットがnullかundefined（なし）ならエラーになり、どうすることも出来ないので、とりあえずエラー回避。
 *         if(BattleManager._subject.opponentsUnit().members()[BattleManager._subject._lastTargetIndex]._result != null) { // 例外5: _resultがundefinedやnullだとエラーになるので、回避
 *           _isTargetAvoid = BattleManager._subject.opponentsUnit().members()[BattleManager._subject._lastTargetIndex]._result.evaded; // ラストターゲットが回避したかを取得 // メモ。右はスキル使用者が回避したかだから、違うよ。 var _isAvoid = BattleManager._subject.result().evaded;
 * } } } } }
 * $gameSwitches.setValue(504, _isTargetAvoid); // ラストターゲットが回避したかをスイッチ504へ
 * // スクリプト、終わり
 * 
 * 【競合について】
 *  rpg_sprites.jsの、Sprite_Battler.prototype.setupDamagePopupを上書きしています。競合に注意してください。
 *
 * 【著作権フリーについて】
 * このプラグインは「地球の共有物（パブリックドメイン）」です。
 * 　　・無償・有償問わず、あらゆる作品に使用でき、また自由に改変・改良・二次配布できます。
 * 　　・著作表示のわずらわしさを回避するため、著作権は放棄します。事後報告、クレジット記載も不要です。
 * 　　・もちろんクローズドに使っていただいてもOKです。是非、自分好みに改造してお使いください。
 *
 * 【更新履歴】
 * 2016/03/03 初版後悔
 * 2016/03/11 ヘルプ修正。スキルの対象が「なし」の時、_resultなどが"undefined"でエラーになるのを、条件分岐で回避する記述を追加。
 * 2016/03/17 HP・MPのダメージポップアップ表示を、別のプラグインminRPG_DamageEffect.jsに移行。こちらは回避判定に特化。
 * 
 *【連作先】
 * merusaia (http://merusaia.higoyomi.com/)が雛形を作成しました。バグ報告などはtwitter(https://twitter.com/merusaia/)までお気軽に。
 *
 *【謝礼】
 * トリアコンタンさん (http://triacontane.blogspot.jp/)さんのおかげです。感謝！
 * 
 */

(function() {



// merusaiaが追加。(a)戦闘ダメージを消したい人用。(b)スキルが回避されたことをコモンイベントで取得するために上書き。
// 上書き前と、以下の２点だけ変更しています。
// ・(a)変更なし。戦闘中のダメージポップアップを消したいなら、(a-1)と(a-2)の２行をコメントアウト（命令の前に「//」を付けます）。
// ・(b)回避したかをコモンイベントで取得するため、バトラーの結果消去メソッドをコメントアウト。
Sprite_Battler.prototype.setupDamagePopup = function() {
    if (this._battler.isDamagePopupRequested()) {
        if (this._battler.isSpriteVisible()) {
            var sprite = new Sprite_Damage();
            sprite.x = this.x + this.damageOffsetX();
            sprite.y = this.y + this.damageOffsetY();
            sprite.setup(this._battler);
            this._damages.push(sprite);   // (a-1)ここをコメントアウトすると、ダメージポップアップを消せる→ここだけじゃ消せない。次の行も消さないといけないよ。
            this.parent.addChild(sprite); // (a-2)ここをコメントアウトすると、ダメージポップアップを消せる→上のと合わせて２行消す。
        }
        this._battler.clearDamagePopup();
        //this._battler.clearResult(); // 変更前はポップアップ表示後に_resutを初期化している。ポップアップ後に回避されたかをコモンイベントで取得するため、削除。トリアコンタンさんに感謝。
    }
};


})();
