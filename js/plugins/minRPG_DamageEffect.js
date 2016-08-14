// --------------------------------------------------------------------------
// minRPG_DamageEffect Ver.0.1.1
// --------------------------------------------------------------------------
/*:
 * @plugindesc ダメージポップアップを変更したり、クリティカル時に好きなアニメーションを流すプラグイン
 * @author 地球のみんな（クレジット記載不要）
 *
 * @help
 * 【更新履歴】
 * 2016/03/17 初版公開（merusia）
 * 2016/07/12 ポップアップ表示のON/OFFを、ゲーム内スイッチで指定できるように対応（merusia, Ver.0.1.1）
 * 
 * 
 * 【プラグインコマンド】
 * このプラグインにはプラグインコマンドはありません。
 *
 * 【概要】
 * ダメージエフェクトを自分好みに変えられます。
 * 例えば、
 * ・ダメージポップアップを非表示にしたり、
 * ・クリティカルヒット時の演出を変えたり、
 * ・プラグインコマンドで上記のON/OFFを切り替えたり、
 * できます。
 *
 * 【詳細（上記でわかりにくいところの説明など）】
 * ・パラメータ「HP_DamagePopUp_ON」や「MP_DamagePopUp_ON」を0にすると、
 *  大賞グラフィック中心に表示される、HPやMPのダメージポップアップ（回復・自動再生値を含む）が表示されなくなります。
 * ・パラメータ「Miss_PopUp_ON」を0にすると、「Miss」のポップアップが表示されなくなります。
 * ・スイッチ番号を入れることで、ゲーム中にON/OFFすることも出来ます（Ver.0.0.1～）。
 * 
 * 【用途】
 *    敵の最大値を推測できないようにして、戦闘の緊張感UPに使ってください。
 *　　　→　エ◯シャダイみたく、極力数字を表示せず、臨場感と感覚重視っぽい戦闘にしたい時などに使います。
 *　　　　　→　ただ、戦闘メッセージでは数値で表示されるので、
 *　　　　　　　HPダメージの数値だけを見せたくない場合は、用語「敵／味方HPダメージ」の   "%1に %2 のダメージ！" とかを、 "" に変えるといいと思います。
 *　　　　　　　MPや各種能力の増減値も見せたくない場合は、用語「敵／味方ポイント減少」の "%1の%2が %3 減少！"   とかを、 "%1の%2が減少！" や "" に変えるといいと思います。
 *　　　　　→　状態異常のメッセージすら表示したくなければ、サスケさんのプラグインコマンドを使うか、戦闘メッセージを全て消してください（ "" にする）。
 *
 * 【競合について】
 * ※rpg_sprite.jsのSprite_Damage.prototype.setupを上書きしています。戦闘系プラグインとの競合に注意してください。
 *
 * 【著作権フリーについて】
 * このプラグインは「地球の共有物（パブリックドメイン）」です。
 * 　　・無償・有償問わず、あらゆる作品に使用でき、また自由に改変・改良・二次配布できます。
 * 　　・著作表示のわずらわしさを回避するため、著作権は放棄します。事後報告、クレジット記載も不要です。
 * 　　・もちろんクローズドに使っていただいてもOKです。是非、自分好みに改造してお使いください。
 *
 * 
 *【連作先】
 * merusaia (http://merusaia.higoyomi.com/)が雛形を作成しました。バグ報告などはtwitter(https://twitter.com/merusaia/)までお気軽に。
 *
 *【謝礼】
 * kotonoha (http://ktnh5108.pw/)さんの記事を参考につくらせていただきました。感謝！
 * 
 * 
 * @param HP_DamagePopUp_ON
 * @desc HPポップアップダメージ（自動再生値を含む）をグラフィック中心に表示するかのスイッチ番号（デフォルトは0で表示無し）
 * @default 0
 *
 * @param MP_DamagePopUp_ON
 * @desc MPポップアップダメージ（自動再生値を含む）をグラフィック中心に表示するかのスイッチ番号（デフォルトは0で表示無し）
 * @default 0
 *
 * @param Miss_PopUp_ON
 * @desc 「Miss」ポップアップをグラフィック中心に表示するかのスイッチ番号（デフォルトは0で表示無し）
 * @default 0
 *
 * @param Actor_CriticalAnimationID
 * @desc 味方側のクリティカルヒット時に流すアニメーションのID（フロントビュー・サイドビュー戦闘共通）。
 * @default 0
 * 
 * @param Enemy_CriticalAnimationID
 * @desc 敵側のクリティカルヒット時に追加で流すアニメーションのID（※サイドビュー戦闘のみ動作）。
 * @default 0
 * 
 * @param DamagePopUp_FlashEffectFrameNum
 * @desc ポップアップダメージをフラッシュさせるフレーム数（デフォルト=60。0でフラッシュ無し）
 * @default 60
 *
 * @param DamagePopUp_FlashEffectColor
 * @desc ポップアップダメージをフラッシュさせる色(「赤,緑,青,不透明度」の順。デフォルト「255, 0, 0, 160」)
 * @default 255, 0, 0, 160
 * 
*/

(function() {
  // パラメーターを宣言します。競合を避けるため、名前を長くしているよ。読みづらくてごめんね。
  var parameters = PluginManager.parameters('minRPG_DamageEffect'); // ファイル名を変更したらここの変更も忘れないようにね。
	var HP_DamagePopUp_ON = Number(parameters['HP_DamagePopUp_ON']);
	var MP_DamagePopUp_ON = Number(parameters['MP_DamagePopUp_ON']);
	var Miss_PopUp_ON = Number(parameters['Miss_PopUp_ON']);
	var Actor_CriticalAnimationID = Number(parameters['Actor_CriticalAnimationID']);
	var Enemy_CriticalAnimationID = Number(parameters['Enemy_CriticalAnimationID']);
	var DamagePopUp_FlashEffectFrameNum = Number(parameters['DamagePopUp_FlashEffectFrameNum']);
	var DamagePopUp_FlashEffectColor = String(parameters['DamagePopUp_FlashEffectColor']);

    // プロトタイプを上書きするよ。競合に注意してね。
    // 変更前: Miss、HP、MPダメージのポップアップを管理してるよ。クリティカル演出は、敵も味方も、ポップアップが赤にフラッシュするだけだよ。
    // Sprite_Damage.prototype.setup = function(target) {
    //     var result = target.result();
    //     if (result.missed || result.evaded) {
    //         this.createMiss();
    //     } else if (result.hpAffected) {
    //         this.createDigits(0, result.hpDamage);
    //     } else if (target.isAlive() && result.mpDamage !== 0) {
    //         this.createDigits(2, result.mpDamage);
    //     }
    //     if (result.critical) {
    //         this.setupCriticalEffect();
    //     }
    // };
	// 変更後:  Miss、HP、MPダメージのポップアップを消したり、敵や味方で違うアニメーションIDを再生したり、クリティカルダメージをフラッシュさせる色を変えたり、フラッシュさせなかったりできるよ。
    Sprite_Damage.prototype.setup = function(target) {
          var result = target.result();
          if (result.missed || result.evaded) {                          // 結果がミスや回避だったら（回避の場合も「miss」と出る模倣）、
              if(Miss_PopUp_ON == null || Miss_PopUp_ON !== 0) {         // 指定パラメータが未定義か、0でなかったら
                if($gameSwitches.value(Miss_PopUp_ON) === true){         // スイッチの値がONの時だけ（スイッチ番号は-1でも10万でもfalse）
                  this.createMiss();                                     // missのポップアップ文字を生成
                }
              }
          } else if (result.hpAffected) {                                // HPに変化があれば（-100とか回復もあり）
              if(HP_DamagePopUp_ON == null || HP_DamagePopUp_ON !== 0) { // 指定パラメータが未定義か、0でなかったら
                if($gameSwitches.value(HP_DamagePopUp_ON) === true){     // スイッチの値がONの時だけ（スイッチ番号は-1でも10万でもfalse）
                  this.createDigits(0, result.hpDamage);                 // HPのダメージポップアップ文字を生成
                }
              }
          } else if (target.isAlive() && result.mpDamage !== 0) {        // ターゲットが生きていて、かつMPダメージが0じゃなかったら（-100とか回復もあり）
              if(MP_DamagePopUp_ON == null || MP_DamagePopUp_ON !== 0) { // 指定パラメータが未定義か、0でなかったら
                if($gameSwitches.value(MP_DamagePopUp_ON) === true){     // スイッチの値がONの時だけ（スイッチ番号は-1でも10万でもfalse）
                  this.createDigits(2, result.mpDamage);                 // MPのダメージポップアップ文字を生成
                }
              }
          }
          if (result.critical) {                          // クリティカルなら
              // アニメーションIDが1以上なら、ターゲット（被攻撃者）が敵と味方で、違うアニメーションIDを再生するよ。
              var _isBattlerEnemy = target instanceof Game_Enemy;
              if(_isBattlerEnemy) {                       // ターゲットが敵なので、会心エフェクト
                  if (Actor_CriticalAnimationID != null && Actor_CriticalAnimationID >= 1) {
                      target.startAnimation(Actor_CriticalAnimationID, false, 0);
                  }
              }else{                                      // ターゲットが味方なので、痛恨エフェクト
                  if (Enemy_CriticalAnimationID != null && Enemy_CriticalAnimationID >= 1) {
                      target.startAnimation(Enemy_CriticalAnimationID, false, 0);
                  }
              }
              // クリティカル時のダメージポップアップのフラッシュフレームが1未満なら、フラッシュさせるかよ。処理速度アップ対策だよ。
              if (DamagePopUp_FlashEffectFrameNum != null && DamagePopUp_FlashEffectFrameNum >= 1) {
                  // フラッシュカラーを設定するよ。カラーが未定義だったら、デフォルトの赤にするよ。
                  var _criticalFlashColor = [255, 0, 0, 160]; // メモ: javascriptでは配列は参照渡しなので、メソッドまたがると値が消えてしまいます。右のように直接代入（参照渡し）すると、Sprite.prototype.setBlendColorでAgument must be an arrayのエラーになります。 this._flashColor = DamagePopUp_FlashEffectColor;
                  if(DamagePopUp_FlashEffectColor != null){ // undefinedでもnullでもなかったら、
                        // 文字列（"a, b, c, d"）を、数値配列_array = [a, b, c, d]に変換します。メモ: 一行で書きたいなら、var _array = eval('[' + _string + ']')を使っても出来ますが、低速で非推奨とのことで、めんどくさいですが自前でつくっています。
                        var _array = []; // 要素数0の配列を定義
                        var _items = DamagePopUp_FlashEffectColor.split(','); // 「,」で分割した文字列配列を作成
                        for( var i=0 ; i<_items.length ; i++ ){ // それぞれの値を数値として格納
                            _array.push(_items[i]);
                        }
                        // 要素数が4個じゃなければ、デフォルトの赤にするよ。
                        if(_array.length != 4){
                             _criticalFlashColor = [255, 0, 0, 160];
                        }else{
                            _criticalFlashColor = _array.concat(); // メモ: javascriptでは配列の値渡しをするなら、concat()が便利です。Array.concatは配列に要素を追加した配列を返すものですが、要素を追加しなければ 元々の配列のコピーが返されますので、それを利用しています。 
                        }
                  }
                  //フラッシュカラーを代入するよ。
                  this._flashColor = _criticalFlashColor.concat(); // 配列の値渡しはconcat()
                  
                  // フラッシュ時間を変えるよ。
                  this._flashDuration = DamagePopUp_FlashEffectFrameNum;
                  // メモ: デフォルトのクリティカルエフェクト（フラッシュ）は呼び出してないよ。 
                  // this.setupCriticalEffect();
                  // 参考: デフォルトのクリティカルエフェクトの中身はこんな感じだよ。フラッシュ色を赤、時間60フレームに設定。
                  // Sprite_Damage.prototype.setupCriticalEffect = function() {
                  //   this._flashColor = [255, 0, 0, 160];
                  //   this._flashDuration = 60;
                  // };
              }
          }
	};

})();