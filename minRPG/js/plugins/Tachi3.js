//=============================================================================
// Tachi3.js
//=============================================================================

/*:
 * @plugindesc tachiさんによる、ツクールのデフォルト機能を様々に変更・拡張できるようにされたプラグインです。※競合に注意してください。
 * @author tachi, merusaia （著作表示はTachiさん)
 *
 * @help 気をつけろ！( ・´ｰ・｀) by Tachiさん
 *  
 *  ※以下、メルサイアが追記しました。ヘルプ・誤字脱字・要望・バグ報告などはtwitter:(https://twitter.com/merusaia/)までお気軽に。
 * 
 *  【更新履歴:  詳細（更新者 連絡先）】
 * 2016/01/16: Tachiさんのプラグインが素晴らしすぎるので、ソース内部にコメントを入れて解読を始める。Tachi2と命名。 （merusaia）
 * 2016/06/04: 早送りの多機能化、スキップモード、かばうの条件変更などの機能を追加して、初版公開。Tachi3と命名。 （merusaia）
 * 2016/08/02: スキップモード中、メッセージ中の「/.」や「\|」を飛ばす機能を実装。「/.」や「\|」待ち時間をパラメータで変更可能に。（merusaia）
 * 2016/09/05: かばう（制御フラグ：身代わり）条件の変更を追加（merusaia）
 * 2016/10/09: 通常時・早送り時・スキップ時それぞれにおいて、バトルメッセージの細かなパラメータ調整。デバッグON/OF機能を追加。（merusaia）
 * 2016/10/20: α版公開(ver.0.1）。やっと正常に動くようになりました…。（merusaia）
 * 2016/10/25: 身代わり時にエラーが出るバグ修正。
 * 2016/10/30: スキップ機能をパラメータ化。これで「ゲーム１～１００倍速で数分クリア」も思いのまま？（merusaia）
 *
 * 【概要】
 * ツクールMVサンプルゲーム「Sea Pirate シーピラート」の作者、Tachiさんのプロジェクトファイルに入っている、
 * 「Tachi.js」をカスタマイズしたものです。
 * ゲーム高速化の解説をはじめ、メルサイアの判る範囲内で、なるべく競合を減らしつつ、
 * ゲーム高速化をより柔軟にコントロールできるパラメータ化、一部機能をコメントアウト、内容の編集や、
 * その他、他の方が改変して使いやすいよう、ソース内部に多くの日本語コメントを追加しています。
 * 
 * 【主な機能】
 * ・ゲームスピード高速化（エンカウントエフェクトなどの高速化）
 * ・早送りの多機能化（マップ／戦闘中を問わず、SHIFTボタンや画面タッチ長押しでも早送り可能に。早送りボタン・スピードをゲーム内変数で変更可能に。）
 * ・スキップモードの追加（プラグインコマンドでON/OFFが可能な、早送りよりも更に早いモード。スピードをゲーム内変数で変更可能に。）
 * ・パラメーター最大値限界突破（デフォルトの力：999などを、99億などに設定可能）
 * ・吸収技にもダメージエフェクトをつける
 * ・かばう（制御フラグ：身代わり）の条件変更
 *
 *  
 * などなど、ツクールMVデフォルトの様々な箇所を改変します。
 * （必要な機能だけ、パラメータでON／OFF出来るようになっています）
 * 
 * 特にTachiさんのゲーム高速プラグインには、ユーザさんに極力ストレスが掛からないように、何度もテストプレイをされて調整された跡があり、
 * 快適操作に最適化されたTachiさんの高速化ノウハウを即導入できる、有能なプラグインかもしれません。
 * タッチ操作にも対応しています（テストはしてません。誰か助けて…＞＜）。
 * 
 * 
 * 【詳細】
 * ＜「早送り」機能について＞
 * ・早送りとは、ツクールのデフォルトで実装されている機能であり、
 *   「決定ボタン(okボタン、Enter/zキーのこと)」を押しっぱなしにしている時、戦闘・メッセージ送りなどが早くなる機能のことです（通常は２倍になる）。
 *  ただし、この機能は、ユーザの没入感を阻害してしまっているのではないか、と少し疑問に思っています。
 *     →  しかし、ユーザ目線に立つと、早送りしたいユーザ、早送りしてほしくないツクラーと、賛否両論あると思います。
 *     →  そこで、ツクラーやユーザが、自分好みにゲームスピードや、早送り・スキップ速度などを調整できるようにしました。
 * ・このプラグインでは、ゲームのスピード倍率を、パラメータにより静的に、さらにゲーム内変数により動的に調整できます。
 * ・また、早送りボタンに、「画面タッチ押しっぱなし（スマホのみ）」が自動的に追加されます。
 * ・なお、マップや戦闘毎に、高速化されるボタンに、「決定ボタン(okボタン、Enter/zキーのこと)」「ダッシュボタン(SHIFTキーのこと)」を有効／無効にできます。
 * ・後述するスキップモードとは、倍率は別に設定します。
 *     →  デフォルトにある、決定ボタン長押しで高速化を禁止するには、パラメータ「マップ早送り倍数」と「戦闘早送り倍数」を1にすることで実現できます。
 *
 * ＜「スキップモード」について＞
 * ・スキップモードとは、このプラグインで新しく実装されている機能です。
 *   早送りされるを押さなくても、自動的にゲームスピードをあっという間に過ぎさせるボタンです。
 *   早送りと併用することで、さらにゲームスピードが早くできます。
 *   用途としては、一度見たシナリオスキップや、戦闘スキップなどを想定しています。
 * ・スキップボタンには、ダッシュボタン（ゲームパッドのダッシュボタン、キーボードのShiftキー）に割り当てています。
 *   それ以外のボタンで実装したい場合は、イベントの自動実行機能などを使ってください。
 *   プラグインコマンドでも実行できます。
 * ・スキップ時のスピードは、「早送り時のスピード×スキップ倍数」となります。
 * 
 * ＜かばう（制御フラグ：身代わり）の条件変更について＞
 * ・デフォルトではHPが１／４以下の味方を１００％守る仕様ですが、それだとかばったキャラが延々と身代わりして死んでしまうのを、回避できるようにしました。
 *    → かばわれるキャラ、かばわれる側それぞれに、HP・MPがいくら以下か、かつ確率などを、それぞれパラメータで自由に変えられるように変更しています。
 * 
 * 【プラグインコマンド】
 * エディタ上で、以下のプラグインコマンドを実行してください。
 * 
 * ・「早送りボタンON」、もしくは「RapidButton_ON」
 *   →  決定ボタンなどを押しっぱなしにしている時だけ、早送りが有効になります。
 * ・「早送りボタンOFF」、もしくは「RapidButton_OFF」
 *   →  早送りが無効になります。
 * 
 * ・「スキップモードON」、もしくは「SKIPMODE_ON」
 *   →  スキップモードを開始します。
 * ・「スキップモードOFF」、もしくは「SKIPMODE_OFF」
 *   →  スキップモードを停止します。
 *
 * 
 * 【謝辞】
 * トリアコンタンさん (http://triacontane.blogspot.jp/)さんのIconDescription.jsのソースを参考に使わせていただいてます。感謝！
 * 
 * 【競合について】
 * ・その他、下記メソッドを 【丸ごと上書き】 しています。下記メソッドを持つプラグインとの競合に注意してください。
 *    ■rpg_scenes.jsの、Scene_Map.prototype.isFastForward
 *    → 「マップ上で早送りボタンが長押しされている時」のデフォルトの機能を、
 *      「マップ上で、各種早送りボタン（ok/shiftなど）が有効の時のみ、長押し押されているとtrue」という機能に置き換えています。
 * 
 *    ■rpg_object.jsの、Game_BattlerBase.prototype.paramMax
 *    → ステータス限界値の変更を、このプラグインのパラメータで動的に変更できるようにしています。
 * 
 *    ■マップや戦闘の高速化・快適化のために、丸ごと上書きしているメソッド
 *     Window_BattleLog.prototype.updateWaitCount
 *     Scene_Map.prototype.updateMainMultiply
 *     Scene_Map.prototype.encounterEffectSpeed
 *     Scene_Map.prototype.updateEncounterEffect
 *     Scene_Map.prototype.startEncounterEffect
 *     Sprite_Animation.prototype.update
 *     Sprite_Enemy.prototype.update
 *     Sprite_Weapon.prototype.animationWait
 *     Sprite_Actor.prototype.motionSpeed
 *     Sprite_Actor.prototype.updateMove
 *     Game_Action.prototype.apply
 * 
 *    ■ゲームオーバー制御（ランダムエンカウントの敵に負けても、ゲームオーバーにならず、指定したコモンイベントを呼ぶ処理）
 *     BattleManager.updateBattleEnd
 * 
 *    ■エンカウント制御（戦闘開始直後に、指定したコモンイベントを呼ぶ処理。ランダムエンカウント時は敵グループIDを指定した変数に格納。）
 *     Game_Player.prototype.executeEncounter
 * 
 *    ■身代わり条件を変更するために、丸ごと上書きしているメソッド。
 *     BattleManager.checkSubstitute
 *
 * ・下記メソッドを追加定義（一度元のメソッドを別の名前にして呼び出し、その後に上書き）しています。
 *  通常の使い方では問題ないです。
 *    ■Game_Interpreter.prototype.pluginCommand
 *    ■Game_Interpreter.prototype.command355
 *    ■Game_Battler.prototype.performSubstitute
 *    ■Window_Message.prototype.updateShowFast
 *    ■Window_Message.prototype.updateInput
 *    ■Window_ScrollText.prototype.scrollSpeed
 *    ■Window_Message.prototype.processEscapeCharacter
 *    ■Window_BattleLog.prototype.messageSpeed
 *    → 上記メソッドを丸ごと上書きしているプラグインは、このプラグインの「上」においてください。
 *      それでも、予期せぬ動作が起こる場合は、これらのメソッドを呼び出しているプラグインをOFFにして使ってください。
 * 
 * 
 * 【開発者用メモ （※ツクラーさんは読まなくて大丈夫です）】
 * プラグイン競合スクリプトの書き方：
 *   ・プラグイン作成時は、他のプラグインとの競合に注意が必要です。
 *       競合とは、同名メソッド（例えばオプション項目を追加する、Window_Options.prototype.addGeneralOptions = function()など）
 *        を上書きするプラグインの下に、「まったくおなじ名前の」同名メソッドを上書きするプラグインが定義されている場合、
 *        複数のプラグインをONにしても、「一番下に定義されているプラグインの同名メソッドしか機能しない」ことにより、
 *       ゲーム中に意図しない動作を引き起こすことです。
 *   ・出来る限り競合を避けるためにも、以下の様な、競合に強い書き方をしています。
 *       同名メソッドを上書きする前に、新規メソッドに代入し、
 *       その中で、新規メソッド.call(this, 引数1, 引数2, ...)や、新規メソッド.apply(this, arguments)を呼ぶことで、
 *       複数のプラグインをONにしても、「全てのプラグインの同名メソッドが順に実行される」ように出来ます。
 *=============================================================================
 * ＜記述例＞
 * var _上書きするメソッド名 = 上書きするメソッド名;
 * 上書きするメソッド名 = function(引数) {
 *   var ret = _上書きするメソッド名.apply(this, arguments); // 上書き後メソッドの最初に、上書き前メソッドを呼び出す。
 *   追加したい処理;                                       // この行から、上書き後のメソッドの処理を実行。 
 *   return ret;                                         // 返り値を忘れないようにね。そうしないと、予期せぬエラーに悩まされるよ。
 * };
 *=============================================================================
 * ＜実際の記述例＞
 * // (1)デフォルトのメソッドを別名に置き換え、(2)上書き後のメソッドの中で、(3)applyやcallを使って呼び出すことで、このプラグインより上でONにされている、同じメソッドを上書きするプラグインとの競合を回避できます。
 * var _KeyboardConfig_Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions; // (1)上書き前のメソッドを退避
 * Window_Options.prototype.addGeneralOptions = function() {                                          // (2)上書き後
 *	   var ret = _KeyboardConfig_Window_Options_addGeneralOptions.apply(this, arguments);             // (3)上書き後メソッド内で、上書き前メソッドを呼び出す。
 *     // ↓  この行から、上書き後のメソッドの処理を記述しています。
 *	   this.addKeyConfigCommand();                                                   
 *     return ret;                                  
 * };
 * =============================================================================
 * ↑ このようにすることで、競合を出来る限り回避できます。プラグイン作成時は、是非、試してみてください。
 * 
 *  ※ただし、この方法は、「元のメソッドに処理を追加する」場合にしか使えません。
 *    そこで、元のメソッドの処理を呼び出さず、「内容そのものを置き換える」場合は、このようにします。
 *=============================================================================
 * ＜実際の記述例＞
 *   _上書きするメソッド名.paramMax = function (引数1, 引数2, ...) {
 *       if(特定条件){                                        // このプラグインの機能が不要なら
 *          return _上書きするメソッド名.apply(this, arguments); // 元のメソッドを呼び出す。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
 *       }else{
 *          return 変更した処理;                              // 返り値は、元のメソッドを同じ性質のものを返そうね。でないと、使う側が混乱するよ。
 *      }
 *  }
 * =============================================================================
 * ↑ このようにすることで、パラメータや特定の条件を元の処理を上書きせず、保持したまま、元メソッドの機能を変更することが出来ます。
 *  ただし、この場合、プラグインリストで、このプラグインよりも「下にある」プラグインがこのメソッドを上書きしている場合、正常に動かないことに注意してください。
 * 
 *  余談: いずれはVisualStudioCodeにフォルダ内での同一メソッド定義の検索が実装され、競合チェックも簡単になるのでは…（もうなりましたね。よかった！）。
 *
 *
 * 【著作権について】
 * このプラグインはMITライセンスです。
 *     ・「地球の共有物（パブリックドメイン）」と、MITライセンスは、著作権情報の明記以外、ほとんど変わりありません。
 *     ・無償・有償問わず、あらゆる作品に使用でき、また自由に改変・改良・二次配布できます。
 *     ・著作表示のわずらわしさを回避するため、merusaiaの著作権は放棄します。事後報告、クレジット記載は「Tachi」とだけ入れてください。
 *     ・もちろんクローズドに使っていただいてもOKです。是非、自分好みに改造してお使いください。
 *     ・改変・再配布時は、以下のMITライセンス全文は消さないでください。よろしくお願いします。（他、コメントなどは消していただいて結構です）
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 *
 *
 * @param ※表示領域の調整方法
 * @desc 上のバー項目の境目「｜」をドラッグすると、項目表示の横幅が調整できます。項目名が見にくい場合、調整してみてください。
 * @default 上のバー「｜」ドラッグで横幅調整可能
 *
 * @param デバッグ出力するか
 * @desc 初期値=OFF。ゲームスピードや早送り、スキップモードON/OFFのタイミングを出力するかです。本番プレイ時は表示されません。
 * @default OFF
 *
 * @param 「＼.」の待ちフレーム数
 * @desc 初期値=15。制御文字「\.」利用時に待機するフレーム数です。(60フレーム=1秒)。ここだけ、制御文字\V[n]が使えます。
 * @default 15
 *
 * @param 「＼|」の待ちフレーム数
 * @desc 初期値=60。制御文字「\|」利用時に待機するフレーム数です。(60フレーム=1秒)。ここだけ、制御文字\V[n]が使えます。
 * @default 60
 *
 * @param ■スピードの変更
 * @desc 以下は、「スピード変更を禁止するか」がONの時だけ有効です。制御文字「\.」や「\|」のウェイトは別判定です。
 * @default 
 * 
 * @param スピード変更を禁止するか
 * @desc 初期値=OFF。競合対策。このプラグインでスピード変更するならOFF。他のプラグインでスピード変更を行う場合はONにしてください。
 * @default OFF
 *
 * @param スピード倍率の設定
 * @desc 以下は、このゲーム固有の、標準速度を設定します。ゲーム中は変更できません。制御文字「\.」や「\|」、ウェイトには無効です。
 * @default "↑がOFFの時だけ有効"
 * 
 * @param ↓標準スピード倍率
 * @desc 以下は、このゲーム固有の、標準速度を設定します。ゲーム中は変更できません。制御文字「\.」や「\|」、ウェイトには無効です。
 * @default "↓整数を入力"
 * 
 * @param マップスピード
 * @desc 初期値=1。ツクールデフォルトに対する、イベント速度倍率です。ゲーム中は変更不可。制御文字「\.」などには無効。
 * @default 1
 * 
 * @param 戦闘ログスピード
 * @desc 初期値=2。ツクールデフォルトに対する、戦闘ログ一行毎の表示速度です。早いと感じる場合は1か0にしてみてください。
 * @default 2
 * 
 * @param 戦闘敵スプライトスピード
 * @desc 初期値=2。ツクールデフォルトに対する、敵キャラの状態異常や倒れエフェクト速度です。ゲーム中は変更不可。
 * @default 2
 * 
 * @param 戦闘武器モーションスピード
 * @desc 初期値=1。ツクールデフォルトに対する、サイドビューキャラの武器・戦闘モーション速度です。ゲーム中は変更不可。
 * @default 1
 * 
 * @param 戦闘移動スピード
 * @desc 初期値=1。ツクールデフォルトに対する、サイドビューキャラの移動速度です。ゲーム中は変更不可。
 * @default 1
 * 
 * @param 戦闘アニメーションスピード
 * @desc 初期値=1。ツクールデフォルトに対する、スキルエフェクトのアニメーション倍率です。ゲーム中は変更不可。
 * @default 1
 * 
 * 
 * @param ↓早送りスピード倍率
 * @desc 早送りボタンの押し中時の、各種スピード倍率。ゲーム中は変更不可。制御文字「\.」や「\|」、ウェイトは早送り無効。
 * @default "↓整数を入力"
 * 
 * @param 早送りマップスピード
 * @desc 初期値=2。ツクールデフォルトに対する、早送り時のイベント速度を調整します。制御文字「\.」などには無効。
 * @default 2
 * 
 * @param 早送り戦闘ログスピード
 * @desc 初期値=20。ツクールデフォルトに対する、早送り時の戦闘ログ一行毎の表示速度です。早いと感じる場合は2か1にしてみてください。
 * @default 20
 * 
 * @param 早送り戦闘敵スプライトスピード
 * @desc 初期値=6。ツクールデフォルトに対する、早送り時の敵キャラの状態異常や倒れエフェクト速度です。
 * @default 6
 * 
 * @param 早送り戦闘武器モーションスピード
 * @desc 初期値=2。ツクールデフォルトに対する、早送り時のサイドビューキャラの武器モーション速度です。
 * @default 2
 * 
 * @param 早送り戦闘移動スピード
 * @desc 初期値=2。ツクールデフォルトに対する、早送り時のサイドビューキャラの移動速度です。
 * @default 2
 * 
 * @param 早送り戦闘アニメーションスピード
 * @desc 初期値=1。ツクールデフォルトに対する、早送り時のスキルエフェクトのアニメーション倍率です。
 * @default 2
 * 
 * 
 * @param ↓早送りボタンの有効/無効化
 * @desc 以下は、各種ボタンの押しっぱなしで、ゲームが早送りできるかを設定します。ゲーム中は変更不可。
 * @default "↓ON/OFFを入力"
 * 
 * @param 決定ボタンでマップ早送り可能か
 * @desc 初期値=ON。整数で入力。決定ボタン押しっぱなしで、マップの移動やイベントを早送りするかです。
 * @default ON
 * 
 * @param ダッシュボタンでマップ早送り可能か
 * @desc 初期値=ON。ダッシュ(SHIFT)ボタン押しっぱなしで、マップの移動やイベントを早送りするかです。
 * @default ON
 *
 * @param 決定ボタンで戦闘早送り可能か
 * @desc 初期値=ON。整数で入力。決定ボタン押しっぱなしで、戦闘を早送りするかです。
 * @default ON
 * 
 * @param ダッシュボタンで戦闘早送り可能か
 * @desc 初期値=ON。ダッシュ(SHIFT)ボタン押しっぱなしで、戦闘を早送りするかです。
 * @default ON
 * 
 * 
 * @param ダッシュボタンでスキップ可能か
 * @desc 初期値=ON。ダッシュ(Shift)ボタンで、ユーザが任意でスキップできるかです。※早送りと同時実行可能です。
 * @default ON
 *
 * @param ↓スキップ機能詳細
 * @desc スキップ時の有効/無効化と、スキップ倍率です。ゲーム中に変更可能。制御文字「\.」や「\|」、ウェイトもすっ飛ばします。
 * @default "↓整数を入力"
 * 
 * @param デフォルトスキップ倍数
 * @desc 初期値=10。早送り時に掛け算する、スキップ倍率が見つからなかった時の初期値です。制御文字「\.」、「\|」、ウェイトはすっ飛ばします。
 * @default 10
 *  
 * @param スキップ中かを格納するスイッチ番号
 * @desc 初期値=0（無効）。8（\V[8]）などが使いやすいです。スキップ中に自動的にON/OFFするスイッチ番号です。
 * @default 0
 * 
 * @param スキップ禁止中かを格納するスイッチ番号
 * @desc 初期値=0（無効）。9（\V[9]）などが使いやすいです。このスイッチをONだと、スキップボタンによるユーザのスキップを禁止します。
 * @default 0
 *
 * 
 * @param ↓ゲームスピードの動的な変更
 * @desc 以下は、ゲーム中に変更可能な、スピードを格納する、変数番号を入れます。設定しなくても構いません。
 * @default "↓変数番号を入力"
 * 
 * @param 戦闘スピードを格納する変数番号
 * @desc 初期値=0。15（\V[15]）など。変数値は戦闘の速さで、1-9。未定義か0の場合、デフォルトスピード倍率(前述)が入ります。
 * @default 0
 * 
 * @param メッセージウェイト制御文字スピードを格納する変数番号
 * @desc 初期値=0。16（\V[16]）など。変数値は「\.」、「\|」の速さで、1-9。未定義か0の場合、デフォルト値(前述)が入ります。
 * @default 0
 * 
 * @param マップ早送り倍数を格納する変数番号
 * @desc 初期値=0。301（\V[301]）などが使いやすいです。未定義や0だと各種スピード倍率（前述）になります。
 * @default 0
 *
 * @param 戦闘早送り倍数を格納する変数番号
 * @desc 初期値=0。302（\V[302]）などが使いやすいです。未定義や0だと各種スピード倍率（前述）になります。
 * @default 0
 *
 * @param スキップ倍数を格納する変数番号
 * @desc 初期値=0。303（\V[303]）などが使いやすいです。未定義や0だと「デフォルトスキップ倍数」（前述）になります。
 * @default 0
 * 
 * @param ＜スピードの変更、終わり＞
 * @desc 
 * @default 
 * 
 * 
 * @param ■パラメータの変更
 * @desc 
 * @default 
 *  
 * @param パラメータ限界値変更を禁止するか
 * @desc 初期値=ON。競合対策。このプラグインで、パラメータ限界値を変更するかを設定します。他のプラグインを使う場合はONにしてください。
 * @default ON
 * 
 * @param ↓パラメータ限界値の変更
 * @desc 以下は、パラメータの限界値を変えたい時に使ってください。デフォルトから変更したくなければ、そのままでOKです。
 * @default "↑がOFFの時だけ有効"
 * 
 * @param 最大HPの限界値
 * @desc 初期値=99999。最大HPの限界値です。敵味方共通。エディタで10万以上を設定したい場合は、他プラグインを使ってください。
 * @default 99999
 * 
 * @param 最大MPの限界値
 * @desc 初期値=999。最大MPの限界値です。敵味方共通。エディタで1000以上を設定したい場合、他プラグインを使ってください。
 * @default 999
 * 
 * @param 攻撃力などの限界値
 * @desc 初期値=999。攻撃力などその他能力値の限界値です。エディタで1000以上を設定したい場合、他プラグインを使ってください。
 * @default 999
 * 
 * @param ＜パラメータの変更、終わり＞
 * @desc 
 * @default 
 * 
 * @param ■その他の変更
 * @desc 
 * @default 
 * 
 * @param 戦闘全滅後もゲームを継続するか
 * @desc 初期値=OFF。競合対策。OFFだと、デフォルトのようにゲームオーバになります。他のプラグインを使用する場合は、OFFにしてください。
 * @default OFF
 * 
 * @param ランダムエンカウント時にスイッチをONにするか
 * @desc 初期値=OFF。競合対策。OFFだと、ランダムエンカウント時は何もしません。他のプラグインを使用する場合は、OFFにしてください。
 * @default OFF
 * 
 * 
 * @param ↓戦闘時の変数制御
 * @desc 以下は、戦闘時に自動に値が入る、変数番号を入れます。スクリプトによる変数更新が面倒な場合などに使ってください。
 * @default "↓変数番号を入力"
 * 
 * @param ランダムエンカウント敵グループIDを格納する変数番号
 * @desc 初期値=0。（5。\V[5]が使いやすいです)。イベント戦闘では無効です。適時、敵グループイベントでこの変数番号の値を更新してね。
 * @default 0
 * 
 * @param ↓戦闘時のスイッチ制御
 * @desc 以下は、戦闘時に自動にONになる、スイッチ番号。コモンイベントの自動実行などで使う場合、最後に必ずOFFにしてね。
 * @default "↓スイッチ番号を入力"
 * 
 * @param ランダムエンカウント時にONになるスイッチ番号
 * @desc 初期値=0。（3が使いやすいです)。イベント戦闘では無効です。適時、敵グループイベントでこのスイッチをONにしてね。
 * @default 0
 * 
 * @param 戦闘勝利時にONになるスイッチ番号
 * @desc 初期値=0。（4が使いやすいです)。イベント戦闘でも有効ですが、「勝った時」のイベントが総て終わった後に実行されます。
 * @default 0
 * 
 * @param 戦闘全滅時にONになるスイッチ番号
 * @desc 初期値=0。（2が使いやすいです)。イベント戦闘でも有効ですが、「負けた時」のイベントが総て終わった後に実行されます。
 * @default 0
 *
 * @param 吸収技もダメージエフェクトをつけるか
 * @desc 初期値=ON。吸収技もダメージエフェクトをつけるかです。他のプラグインを使用する場合は、OFFにしてください。
 * @default ON
 * 
 * @param 身代わり条件を変えるか
 * @desc 初期値=OFF。ツクールデフォルト（HPが25％以下だと必ずかばう）にしたい場合は、OFFにしてください。
 * @default OFF
 * 
 * @param ↓身代わり条件の変更
 * @desc 以下は、身代わり条件を変えたい時に使ってください。デフォルトから変更したくなければ、そのままでOKです。
 * @default "↑がONの時だけ有効"
 *
 * @param かばわれる側の最大HP％0-100
 * @desc 初期値=75。「HPが何％以下の仲間がかばわれるか」の条件を追加します。100なら必ず満たします。
 * @default 75
 * 
 * @param かばわれる側の最大MP％0-100
 * @desc 初期値=75。「MPが何％以下の仲間がかばわれるか」の条件を追加します。100なら必ず満たします。
 * @default 75
 * 
 * @param かばう側の最小HP％0-100
 * @desc 初期値=25。「HPが何％以上の仲間がかばうか」の条件を追加します。0なら、はじめにかばったキャラが死ぬまでかばいます。
 * @default 25
 * 
 * @param かばう側の最小MP％0-100
 * @desc 初期値=10。「MPが何％以上の仲間がかばうか」の条件を追加します。0なら必ず満たします。
 * @default 10
 * 
 * @param 身代わり率％0-100
 * @desc 初期値=99。整数で入力。かばう条件を満たした時に、かばう確率です。100でも、条件を満たしていなければかばいません。
 * @default 99
 *
 * 
 * @param 最後にかばわれたアクターIDを格納する変数番号
 * @desc 初期値=0。（281。\V[281]が使いやすいです)。※一度の戦闘で二回以上身代わりが起こると、最後のものに更新されます。
 * @default 0
 *
 * @param 最後にかばったアクターIDを格納する変数番号
 * @desc 初期値=0。（282。\V[282]が使いやすいです)。※一度の戦闘で二回以上身代わりが起こると、最後のものに更新されます。
 * @default 0
 *
 * @param 最後にかばわれた敵キャラIDを格納する変数番号
 * @desc 初期値=0。（283。\V[283]が使いやすいです)。※一度の戦闘で二回以上身代わりが起こると、最後のものに更新されます。
 * @default 0
 *
 * @param 最後にかばった敵キャラIDを格納する変数番号
 * @desc 初期値=0。（284。\V[284]が使いやすいです)。※一度の戦闘で二回以上身代わりが起こると、最後のものに更新されます。
 * @default 0
 * 
 * @param 味方の身代わり成功時に呼び出すコモンイベント番号
 * @desc 初期値=0。（280が使いやすいです)。アクター同士がかばう直前に自動実行されるコモンイベント番号です。
 * @default 0
 *
 * @param 敵の身代わり成功時に呼び出すコモンイベント番号
 * @desc 初期値=0。（281が使いやすいです)。敵キャラ同士がかばう直前に自動実行されるコモンイベント番号です。
 * @default 0
 *
 * @param ＜その他の変更、終わり＞
 * @desc 
 * @default 
 * 
 * 
 */

(function () {
    'use strict'; // javascriptの構文チェックを少しだけ厳密にします。効果があるのなら、変数宣言varの省略もエラーになるはずだが…？ http://analogic.jp/use-strict/

    //=============================================================================
    // ローカル関数
    //=============================================================================

    // ==============================================================================
    // パラメータに制御文字"\V[n]"が使える変数・スイッチを実現するためのメソッド。
    // ※mankindさんのMKR_ControlCharacterEx.jsを参考にしています。感謝。
    // ==============================================================================
    // ■制御文字"\V[n]"が入っている時、その変数の値を返すメソッド
    /** 引数のtextに、'\V[n]'（nは整数）という表記が見つかったら、ゲーム内変数の値に置き換えます。それ以外はtextをそのまま返します。 */
    var ConvertEscapeCharacters = function (text) {
        text = String(text);                    // textは文字列型に治すよ。次の２行は、'\\'を'\'にするための保険の処理（？）だよ。
        text = text.replace(/\\/g, '\x1b');     // '\'というのが見つかったら、'\x1b'というエスケープシーケンスに置き換えるよ。
        text = text.replace(/\x1b\x1b/g, '\\'); // エスケープシーケンスが２つつながってたら、'\'におきかえるよ。

        text = text.replace(/\x1bV\[(\d+)\]/gi, function () {     // '\V[n]'(nは整数)というのが見つかったら、変数値に変えるよ。
            return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));

        text = text.replace(/\x1bV\[(\d+)\]/gi, function () {     // '\V[\V[n]]'みたいなのがあるから、もう一回やっとくよ。
            return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));

        return text;                            // じゃなかったら、そのままの文字列を返してね。
    };
    // ■制御文字"\V[n]"が入っている可能性がある変数を、中身を見て、Boolean型で評価して返すメソッド。
    /** 引数のparamに、tureを意味する値が入っているかどうかを返します。
     * ・paramにtrueやfalseのBoolean型、1や0の数値、"1"などの文字列、"V[n]"の制御文字が入っている際もその変数の値を取得して判定します。 
     * ・trueを返す条件は、値が"ON"か"On"か"on"、"TRUE"とか"True"とか"true"とか、"1"(文字列)や1(数値)もtrue。それ以外、"オン"や"0"や0以下の数値、2以上の数値はfalseを返します。*/
    var getVarAsBool = function (param) {
        // 大文字に変更する処理や正規表現が重いかもしれないので、型を見てすぐ判定できるやつはreturnで返して、消去法に持ち込む。
        var isON = false;
        // paramが""やnullやundefinedなら、falseを返すよ。
        if (param === '' || param === null || param === undefined) return false;
        // paramが配列の時、全部falseになる。たぶんparam[index]を忘れているので、一応デバッグ中だけアラートする。
        if (Array.isArray(param)) {
            if (_isDebugMode() === true) {
                alert('getVarAsBool(param)の引数に、配列を渡しています。a[i]などを忘れている可能性が高いです。  falseを返します。');
            }
            return false;
        }
        // paramがBoolean型の時
        if (param === true) return true; // trueなら、大文字に変更する必要はないよ。
        if (param === false) return false; // falseでも、大文字に変更する必要はないよ。
        // paramがNumber型の時
        if (param === 1) return true; // 数値の1ならtrueだよ。
        if (Number.isNaN(param) || param === Infinity || param === -Infinity) return false; // NaN(数えられない数)でも、±Infinity（∞）でも、falseだよ。
        // paramがString型の時
        if (param instanceof String) {              // paramがString型なら、初めて、大文字に変換して、文字列として値を見るよ。
            var upperParam = param.toUpperCase(); // 大文字小文字を分けてみるのが面倒だから、大文字化しちゃうよ。
            isON = (upperParam === 'ON' || upperParam === 'TRUE' || param === '1');
            if (isON === false) { // falseなら、"\V[n]"などが入っている可能性があるから、変数の値を見るよ。
                var varValue = ConvertEscapeCharacters(param); // 変数の値を代入してるよ。
                var upperValue = varValue.toUpperCase();       // 大文字化しちゃうよ。
                isON = (upperValue === 'ON' || upperValue === 'TRUE' || varValue === '1');
            }
        }
        return isON;
    };
    // ■制御文字"\V[n]"が入っている可能性がある変数を、中身を見て、Number型で評価して返すメソッド。
    /** 引数のparamに制御文字"\V[n]"が入っている可能性がある変数を、中身を見て数値で返します。
     * ・paramにtrueやfalseのBoolean型、1や0の数値、"1"などの文字列、"V[n]"の制御文字が入っている際もその変数の値を数値として判定します。 
     * ・trueは1、falseは0、"1"(数字の文字列)は1(数値)、nullやundefinedは0に置き換えられます。
     * ・NaNやInfinity、-Infinityはそのまま返します。*/
    var getVarAsNumber = function (param) {
        // 大文字に変更する処理や正規表現が重いかもしれないので、型を見てすぐ判定できるやつはreturnで返して、消去法に持ち込む。
        var value = 0;
        // paramが""やnullやundefinedなら、0を返すよ。
        if (param === '' || param === null || param === undefined) return 0;
        // paramが配列の時、全部falseになる。たぶんparam[index]を忘れているので、一応デバッグ中だけアラートする。
        if (Array.isArray(param)) {
            if (_isDebugMode() === true) {
                alert('getVarAsNumber(param)の引数に、配列を渡しています。a[i]などを忘れている可能性が高いです。  0を返します。');
            }
            return 0;
        }
        // paramがBoolean型の時
        if (param === true) return 1;   // trueなら、大文字に変更する必要はないよ。
        if (param === false) return 0; // falseでも、大文字に変更する必要はないよ。
        // paramがNumber型の時
        if (Number.isNaN(param) || param === Infinity || param === -Infinity) return param; // NaN(数えられない数)でも、±Infinity（∞）は、そのまま返す。
        // paramがNumber型もしくはString型の数値のみの時
        if (isFinite(param)) return parseInt(param, 10); // 数値に変換できるなら、数値にして返すよ。isFinite("1")はtrue、となります。Number.isFinite("1")はfalseですので、きをつけて。
        // paramがString型の時
        if (param instanceof String) {              // paramがString型なら、初めて、大文字に変換して、文字列として値を見るよ。
            var upperParam = param.toUpperCase(); // 大文字小文字を分けてみるのが面倒だから、大文字化しちゃうよ。
            if (upperParam === 'ON' || upperParam === 'TRUE' || param === '1') return 1;
            // ここまで来ても値が決まらないなら、"\V[n]"などが入っている可能性があるから、変数の値を見て、代入するよ。
            value = Number(ConvertEscapeCharacters(param)); // 変数の値を代入して、数値に変換してるよ。
            if (Number.isNaN(value)) {                        // 変換できない場合はNaNが入るよ。
                value = 0;                                  // 変換できない場合は、一律、0。
            }
        }
        return value;
    };
    // ■制御文字"\V[n]"が入っている可能性がある変数を、中身を見て、String型で評価して返すメソッド。
    /** 引数のparamに制御文字"\V[n]"が入っている可能性がある変数を、中身を見て、その値を文字列で返します。
     * ・paramにtrueやfalseのBoolean型、1や0の数値、"1"などの文字列、"V[n]"の制御文字が入っている際もその変数の値を文字列として判定します。 
     * ・trueは"ON"、falseは"OFF"、1は"1"(数字の文字列)、nullやundefinedは""に置き換えられます。
     * ・NaNやInfinity、-Infinityは""を返します。*/
    var getVarAsString = function (param) {
        // 大文字に変更する処理や正規表現が重いかもしれないので、型を見てすぐ判定できるやつはreturnで返して、消去法に持ち込む。
        var str = '';
        // paramが""やnullやundefinedなら、""を返すよ。
        if (param === '' || param === null || param === undefined) return '';
        // paramが配列の時、全部falseになる。たぶんparam[index]を忘れているので、一応デバッグ中だけアラートする。
        if (Array.isArray(param)) {
            if (_isDebugMode() === true) {
                alert('getVarAsString(param)の引数に、配列を渡しています。a[i]などを忘れている可能性が高いです。  ブランク””を返します。');
            }
            return '';
        }
        // paramがBoolean型の時
        if (param === true) return 'ON';   // trueなら、大文字に変更する必要はないよ。
        if (param === false) return 'OFF'; // falseでも、大文字に変更する必要はないよ。
        // paramがNumber型の時
        if (Number.isNaN(param) || param === Infinity || param === -Infinity) return ''; // NaN(数えられない数)でも、±Infinity（∞）は、""を返す。
        // paramがNumber型もしくはString型の数値のみの時
        if (isFinite(param)) return String(param); // 数値に変換できるなら、文字列にして返すよ。isFinite("1")はtrue、となります。Number.isFinite("1")はfalseですので、きをつけて。
        // paramがString型の時
        if (param instanceof String) {              // paramがString型なら、初めて、大文字に変換して、文字列として値を見るよ。
            var upperParam = param.toUpperCase(); // 大文字小文字を分けてみるのが面倒だから、大文字化しちゃうよ。
            if (upperParam === 'ON' || upperParam === 'TRUE' || param === '1') return 1;
            // ここまで来ても値が決まらないなら、"\V[n]"などが入っている可能性があるから、変数の値を見て、代入するよ。
            str = ConvertEscapeCharacters(param); // 変数の値を代入してるよ。
        }
        return str;
    };
    // ■パラメータに制御文字が入っている時は、そのままおいておく、パラメータ代入メソッド (呼び出す毎にgetVarAs***を呼び出す必要がある)。
    /** パラメータの値paramを厳格に型typeを指定して、代入します。
     * ・'\V[n]'という文字列が入っていたら、'\x1bV[n]'という、エスケープシーケンスを使った表記に置きかえます。こうすることで、変数参照時にgetVarAs***(param)を呼び出すと、"\V[n]"の値を見れます。
     * ・'\V[n]'が見つからなかったら、typeが"bool"の場合は、"ON"か"On"か"on"だけtrue。それ以外はfalseです。paramが定義されてなかったら、defの値、defが定義されていなかったら0です。 
     * ・'\V[n]'が見つからなかったら、typeが"num"の場合は、数値なら十進数に直します。数値でなかったら、defの値、defが定義されていなかったら0です。 
     * */
    var CheckParam = function (type, param, def) {
        var regExp;
        regExp = /^\x1bV\[\d+\]$/i;           // 引数paramの中に、'\V[n]'（nは整数）という文字列がないか、正規表現で探すよ。
        param = param.replace(/\\/g, '\x1b'); // 引数paramの中に、'\'というのが見つかったら、'\x1b'というエスケープシーケンスに置き換えるよ。
        if (regExp.test(param)) {              // 引数paramの中に、'\V[n]'というのがみつかったら、
            return param;                     // paramをそのままを返すよ。値の代入は、あとで、ConvertEscapeCharactersでやるからね。
        }
        // この下の処理は、paramに'\V[n]'というのが見つからなかった時の処理だよ。
        switch (type) {
            case 'bool':     // typeが"bool"なら、trueかfalseをboolean型で返すよ。それもダメなら、def（第三引数）。それも定義されてなかったら、falseを返すよ。
                var isON = false;
                // paramが""かnullかundefinedだったら、paramをdef（デフォルト）に置き換えるよ。
                if (param === '' || param == null) {
                    param = (def) ? def : false; // デフォルトが定義されてなかったら（もしくはfalseだったら）、falseを返すよ。
                }
                // paramが配列の時、全部falseになる。bool[]ではなくここはboolのチェックなので、param[index]を忘れている。必ずアラートする。
                if (Array.isArray(param)) {
                    alert('CheckParam (type, param, def)の引数paramに、配列を渡しています。a[i]などを忘れている可能性が高いです。  falseを返します。');
                    return false;
                }
                // paramがBoolean型の時
                if (param === true) return true;   // trueなら、大文字に変更する必要はないよ。
                if (param === false) return false; // falseでも、大文字に変更する必要はないよ。
                // paramがNumber型の時
                if (param === 1) return true; // 数値の1ならtrueだよ。
                if (Number.isNaN(param) || param === Infinity || param === -Infinity) return false; // NaN(数えられない数)でも、±Infinity（∞）でも、falseだよ。
                // paramがString型の時
                if (param instanceof String) {              // paramがString型なら、初めて、大文字に変換して、文字列として値を見るよ。
                    var upperParam = param.toUpperCase(); // 大文字小文字を分けてみるのが面倒だから、大文字化しちゃうよ。
                    isON = (upperParam === 'ON' || upperParam === 'TRUE' || param === '1');
                }
                return isON;
            case 'num':      // typeが"num"なら、paramがnullか数えられる数値(※nullでもisFiniteはtrue)だったら十進数に置き換えたもの、でなかったら、def（デフォルト値）が設定されていたらデフォルト値、なかったら0を返すよ。
                // paramが配列の時、全部falseになる。Number[]ではなくここはNumberのチェックなので、param[index]を忘れている。必ずアラートする。
                if (Array.isArray(param)) {
                    alert('CheckParam (type, param, def)の引数paramに、配列を渡しています。a[i]などを忘れている可能性が高いです。  0を返します。');
                    return 0;
                }
                return (isFinite(param)) ? parseInt(param, 10) : (def) ? def : 0;
            default:         // typeがそれ以外なら、paramをそのまま返すよ。
                return param;
        }
    };
    // (b)制御文字"\V[n]"が使えるようにした、パラメータ代入メソッド
    /** 引数のparamNames([英語表記名, 日本語表記名]の配列)のパラメータの値を、
     * type（"bool"や"num"やそれ以外のString型やオブジェクト型）を考慮して、代入します。
     * ・エディタのパラメータ値に変な値が入っていると、defaultParam(デフォルト値)が入ります。
     * ・値に"V[n]"などの変数が入っている際は、そのままその文字列を返します。 
     *   →  変数参照時にgetVarAs***(param)と呼び出すと、"\V[n]"の値を任意の型に変換して、返せます。 */
    var getParam_IncludeEscapeCharactors = function (type, paramNames, defaultParam) {
        var value = getParamOther(paramNames);
        return CheckParam(type, value, defaultParam);
    };
    /** 引数のparamNames([英語表記名, 日本語表記名]の配列)のパラメータの値を、
     * Boolean型で、代入します。
     * ・エディタのパラメータ値に変な値が入っていると、defaultParam(デフォルト値)が入ります。
     * ・値に"V[n]"などの変数が入っている際は、そのままその文字列を返します。 
     *  → 変数参照時にgetVarAsBool(param)と呼び出すと、"\V[n]"の値を任意の型に変換して、返せます。 */
    var getParamBool_IncludeEscapeCharactors = function (paramNames, defaultParam) {
        var value = getParamOther(paramNames);
        return CheckParam('bool', value, defaultParam);
    };
    /** 引数のparamNames([英語表記名, 日本語表記名]の配列)のパラメータの値を、
     * Number型で、代入します。
     * ・エディタのパラメータ値に変な値が入っていると、defaultParam(デフォルト値)が入ります。
     * ・値に"V[n]"などの変数が入っている際は、そのままその文字列を返します。 
     *  → 変数参照時にgetVarAsBool(param)と呼び出すと、"\V[n]"の値を任意の型に変換して、返せます。 */
    var getParamNumber_IncludeEscapeCharactors = function (paramNames, defaultParam, min, max) {
        var value = getParamOther(paramNames);
        value = CheckParam('num', value, defaultParam);
        if(value instanceof Number){
            if (arguments.length < 3) min = -Infinity;
            if (arguments.length < 4) max = Infinity;
            value = (parseInt(value, 10) || 0).clamp(min, max); // parseIntできない時は0になるので、valueにnullやundefinedやNaNが入っていても0になるよ。
        }
        return value;
    };
    // ==============================================================================
    // パラメータに制御文字"\V[n]"が使える変数・スイッチを実現するためのメソッド、終わり。
    // ==============================================================================


    //=============================================================================
    // ツクールエディタ上で編集できる、プラグインのパラメータを取得や、プラグインコマンドの取得時に使うメソッド群です。
    // プラグインパラメータやプラグインコマンドパラメータの整形やチェックをします。
    // トリアコンタンさん(http://triacontane.blogspot.jp/)のソースを参考に使わせていただいてます。感謝。
    //=============================================================================
    // ■数値変換出来ない時にエラーを出すメソッド
    /** 引数valueの値を10進数に変換して、その結果がNaN（数値変換できないもの）だったら、エラーを吐きます。
     *  ※引数valueに文字列やオブジェクト型を許容する場合は、使わないでください。 */
    var parseIntStrict = function(value, errorMessage) {
        var result = parseInt(value, 10); // parseIntできない時はNaNになるので、valueにnullやundefinedや±Infinity（！）や文字列が入っていてもNaNになるよ。
        if (isNaN(result)) throw Error('指定した値[' + value + ']が数値ではありません。' + errorMessage);
        return result;
    };
    // ■プラグインのパラメータの基本メソッド
    /** 全てのgetParam***が、このメソッドを呼びます。
      * パラメータをを取得する際、複数言語に対応したパラメータ名を参照して、エラーが出ないように、その値を取得します。
      */
    var getParamOther = function (paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];          // 配列じゃないなら、一旦、配列化する。
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]]; // 配列の全ての要素に対して、パラメータ名が存在していれば、
            if (name) return name;                                          // その名前の値を取ってくる。
        }
        return null;
    };
    // ■String型のパラメータ
    /** パラメータが文字列型（String型）の時のチェックです。引数1がnullかundefinedなら空白""とし、引数2がtrueなら大文字に変換して渡します。
      * 引数2がない場合は、大文字に変換せずそのまま渡します。
      */
    var getParamString = function (paramNames, upperFlg) {
        var value = getParamOther(paramNames);
        return value == null ? '' : upperFlg ? value.toUpperCase() : value;
    };
    // ■Number型のパラメータ
    /**  パラメータが数値型（Number型）の時のチェックです。文字列を、引数2～引数3の範囲（min以上～max以下)に収めて、取得します。
      * 引数2や3がない場合は、-InfinityやInfinityまで許容します。
      * ただし、初期値に±Infinityが入っていると、エラーになります。
      * parseIntできない時はエラーになるので、初期値にnullやundefinedや±Infinityや文字列が入っていてもエラーになります。
      * ただ、範囲にはclamp関数を使っているので、
      * もしmaxにminより小さい値を入れてしまってもエラーにならないから、そこも注意してくださいね。
      * clamp関数の中身は、if (x < min) { x = min; return x; } else if (x > max) { x = max; return x; } となります。
      * 
      *（※補足： Infinity は無限を意味し、掛けたものは全て Infinity となり、Infinity で割ったものは全て 0 となります。
      * 0割り時のエラーは防げますが、足し引きや乗除時にどれかが±Infinityだと、計算結果によって±Infinityか0かNaNになり、
      * 後の検出が非常に困難になります。注意してください。）
    */
    var getParamNumber = function (paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseIntStrict(value, 10) || 0).clamp(min, max); // parseIntできない時はエラーになるので、valueにnullやundefinedや±Infinity（！）や文字列が入っていてもエラーになるよ。
    };
    // ■bool型のパラメータ
    /**  パラメータがtrue/falseかのチェック型。"ON"か"On"や"on"、"TRUE"や"True"や"true"、1"や1ならtrue。それ以外だとfalseになります。
      * */
    var getParamBoolean = function (paramNames) {
        var value = getParamOther(paramNames);
        // return (value || '').toUpperCase() == 'ON'; // トリアコンタンさんの元ソース。 "true"や"1"だとfalseになるので、変更しました。
        value = (value || '');                // 空文字''.toUpperCase()をやると、落ちるので。
        var upperValue = value.toUpperCase(); // 大文字小文字を分けてみるのが面倒だから、大文字化しちゃうよ。
        var isON = (upperValue === 'ON' || upperValue === 'TRUE' || value === '1');
        return isON;
    };
    // ■String[]型のパラメータ
    /**  複数の文字列パラメータを配列で持つparamNames（例：{"one", "two", "tree"}）を、半角カンマ','で分割して配列にして取得します。
      * （例：getParamArrayString(["one", "two", "tree"], }）
      */
    var getParamArrayString = function (paramNames) {
        var values = getParamString(paramNames);
        return (values || '').split(',');
    };
    // ■Number[]型のパラメータ
    /**  複数の数値パラメータを配列で持つparamNamesを、引数2～引数3の範囲（min以上～max以下)に収めて、取得します。
      * 使用例： var _v1 = getParamArrayNumber(['ParameterEnglishName', 'パラメータ日本語名'], 0, 9999);
      */
    var getParamArrayNumber = function (paramNames, min, max) {
        var values = getParamArrayString(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        for (var i = 0; i < values.length; i++) values[i] = (parseInt(values[i], 10) || 0).clamp(min, max);
        return values;
    };

    /**  ■getCommandName()メソッドについて注意点。
      * ※プラグインコマンドを英字で入力する場合は、スペルミスを防ぐため、名前を必ず大文字にしてチェックします。
      *  新しいプラグインコマンドを作る場合は、英字表記は必ず「全て大文字」にしてください。
      */
    var getCommandName = function (command) { // 例: プラグインコマンドが「initVariables 1 10」なら、command="initVariables"
        // 引数commandが無効な値（NaNやnullやundefined）なら空白""にし、日本語ならそのまま、英語なら大文字化して取得します。
        // （例： getCommandName("変数の初期化")→"変数の初期化"。 getCommandName("initVariables") → "INITVARIABLES"）
        return (command || '').toUpperCase();
    };
    /** 任意の引数textがnullかundefinedなら空白""に、環境で変換できるものは変換して取得します。■→後で消します■…このメソッド宣言順番、大丈夫？*/
    var convertEscapeCharactersAndEval = function(text, evalFlg) {
        if (text === null || text === undefined) {
            text = evalFlg ? '0' : '';
        }
        var windowLayer = SceneManager._scene._windowLayer;
        if (windowLayer) {
            var result = windowLayer.children[0].convertEscapeCharacters(text);
            return evalFlg ? eval(result) : result;
        } else {
            return text;
        }
    };
    /** 任意の引数argをチェックして取得します。小文字が入っていないかのチェックも可能です。*/
    var getArgString = function (arg, upperFlg) {
        arg = convertEscapeCharactersAndEval(arg, false);
        return upperFlg ? arg.toUpperCase() : arg;
    };
    /** 任意の引数argを整数値に変換し、引数2～引数3の範囲（min以上～max以下)に収めて、取得します。
     * parseIntできない時は0になるので、valueにnullやundefinedや±Infinity（！）やNaNや文字列が入っていても0になるよ。注意してね。
    */
    var getArgNumber = function (arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(convertEscapeCharactersAndEval(arg), 10) || 0).clamp(min, max);  // parseIntできない時は0になるので、valueにnullやundefinedや±Infinity（！）やNaNや文字列が入っていても0になるよ。
    };
    /** 任意の引数配列args[]のargs[start]～args[end]までを半角スペース" "で区切って取得します。*/
    var concatArgs = function (args, start, end) {
        if (!start) start = 0;
        if (!end) end = args.length;
        var result = '';
        for (var i = start, n = end; i < n; i++) {
            result += args[i] + (i < n - 1 ? ' ' : '');
        }
        return result;
    };
    // ============ プラグインのパラメータを取得や、プラグインコマンドの取得時に使うメソッドの追加、終 ==========================

    // ============ 任意の変数の値を、値や型を制限して取ってくるメソッド ===============================================
    /** 任意の引数argを整数値に変換し、引数2～引数3の範囲（min以上～max以下)に収めて、取得します。
     * parseIntできない時は0になるので、valueにnullやundefinedや±Infinity（！）やNaNや文字列が入っていても0になるよ。注意してね。
    */
    var getArgNumber = function (arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(convertEscapeCharactersAndEval(arg), 10) || 0).clamp(min, max);  // parseIntできない時は0になるので、valueにnullやundefinedや±Infinity（！）やNaNや文字列が入っていても0になるよ。
    };
    // ============ 任意の変数の値を、値や型を制限して取ってくるメソッド、終わり。 ===============================================

    // ============ 以下、テストプレイ時や、デバッグ出力するかどうかを判定するメソッド （by メルサイア）====================
    /** テストプレイ中ならtrue、本番プレイ中ならfalseを返します。*/
    var isTestPlaying = function () {
        return (Utils.isOptionValid('test') && Utils.isNwjs());
    };
    // =============================================================================

    // このローカル変数。わかりやすい名前をつけてください。
    // ●開発者用メモ： javascriptの無名関数(function(){...})内に書く変数は、ローカル変数扱いなので、短い名前を使っても、他のプラグインとの競合はしません。
    // var hogehoge;
    /**  ↓プラグインのファイル名から取得したパラメータ。「***.js」を変更した時、ここを更新する忘れないようにしてください。*/
    var pluginName = 'Tachi3';

    // ↓エディタで編集可能な、このプラグインのパラメータ名を格納する変数群。
    // ※helpコメント欄の「＠param ***」を変更した時、ここを更新する忘れないように。(['英語のパラメータ名', 日本語のパラメータ名'], 最小値, 最大値)の変更も、忘れないでね。
    // デバッグ出力のON/OFF
    var _isDebugOut = getParamBoolean(['isDebugOut', 'デバッグ出力するか']);

    // スピード変更を禁止するかのON/OFF
    var _isNoChangeSpeed_inThisPlugin = getParamBoolean(['isNoChangeSpeed_inThisPlugin', 'スピード変更を禁止するか']);
    // このゲーム固有の、ツクールデフォルトスピードに対するスピード倍率
    var _MAPSPEED_DEFAULT = getParamNumber(['MAPSPEED_DEFAULT', 'マップスピード'], 1, 100); // 整数
    var _BATTLE_LOGSPEED_DEFAULT = getParamNumber(['BATTLE_LOGSPEED_DEFAULT', '戦闘ログスピード'], 1, 100); // 整数
    var _BATTLE_ANIMATIONSPEED_DEFAULT = getParamNumber(['BATTLE_ANIMATIONSPEED_DEFAULT', '戦闘アニメーションスピード'], 1, 100); // 整数
    var _BATTLE_ENEMYSPEED_DEFAULT = getParamNumber(['BATTLE_ANIMATIONSPEED_DEFAULT', '戦闘敵スプライトスピード'], 1, 100); // 整数
    var _BATTLE_MOTIONSPEED_DEFAULT = getParamNumber(['BATTLE_MOTIONSPEED_DEFAULT', '戦闘武器モーションスピード'], 1, 100); // 整数
    var _BATTLE_MOVESPEED_DEFAULT = getParamNumber(['BATTLE_MOVESPEED_DEFAULT', '戦闘移動スピード'], 1, 100); // 整数
    var _RAPID_MAPSPEED_DEFAULT = getParamNumber(['RAPID_MAPSPEED_DEFAULT', '早送りマップスピード'], 1, 100); // 整数
    var _RAPID_BATTLE_LOGSPEED_DEFAULT = getParamNumber(['RAPID_BATTLE_LOGSPEED_DEFAULT', '早送り戦闘ログスピード'], 1, 100); // 整数
    var _RAPID_BATTLE_ANIMATIONSPEED_DEFAULT = getParamNumber(['RAPID_BATTLE_ANIMATIONSPEED_DEFAULT', '早送り戦闘アニメーションスピード'], 1, 100); // 整数
    var _RAPID_BATTLE_ENEMYSPEED_DEFAULT = getParamNumber(['RAPID_BATTLE_ANIMATIONSPEED_DEFAULT', '早送り戦闘敵スプライトスピード'], 1, 100); // 整数
    var _RAPID_BATTLE_MOTIONSPEED_DEFAULT = getParamNumber(['RAPID_BATTLE_MOTIONSPEED_DEFAULT', '早送り戦闘武器モーションスピード'], 1, 100); // 整数
    var _RAPID_BATTLE_MOVESPEED_DEFAULT = getParamNumber(['RAPID_BATTLE_MOVESPEED_DEFAULT', '早送り戦闘移動スピード'], 1, 100); // 整数
    var _SKIPSPEED_DEFAULT = getParamNumber(['_SKIPSPEED_DEFAULT', 'デフォルトスキップ倍数'], 1, 100); // 整数

    // 各種早送りスピードを格納する、スイッチや変数番号
    var _VarNo_Rapid_BattleRate = getParamNumber(['VarNo_Rapid_BattleRate', '戦闘早送り倍数を格納する変数番号'], 1, 9999);
    var _VarNo_Rapid_MapRate = getParamNumber(['VarNo_Rapid_MapRate', 'マップ早送り倍数を格納する変数番号'], 1, 9999);
    // 各種スキップスピードを格納する、スイッチや変数番号
    var _SwitchNo_isSkip = getParamNumber(['SwitchNo_isSkip', 'スキップ中かを格納するスイッチ番号'], 1, 9999);
    var _SwitchNo_isNoSkip = getParamNumber(['SwitchNo_isNoSkip', 'スキップ禁止中かを格納するスイッチ番号'], 1, 9999);
    // ゲームスピードを持つ変数番号
    var _VarNo_BattleSpeed = getParamNumber(['VarNo_BattleSpeed', '戦闘スピードを格納する変数番号'], 1, 9999); // ツクール変数番号は、1～9999までのはず。
    var _VarNo_MessageWaitEscapeCharacterSpeed = getParamNumber(['VarNo_MessageWaitEscapeCharacterSpeed', 'メッセージウェイト制御文字スピードを格納する変数番号'], 1, 9999); // ツクール変数番号は、1～9999までのはず。
    var _VarNo_SkipRate = getParamNumber(['VarNo_SkipRate', 'スキップ倍数を格納する変数番号'], 1, 9999);
    
    // ランダムエンカウント時、敵グループIDを格納する変数番号
    var _VarNo_RandomEncountTroopID = getParamNumber(['VarNo_RandomEncountTroopID', 'ランダムエンカウント敵グループIDを格納する変数番号'], 1, 9999); // ツクール変数番号は、1～9999までのはず。
    // ランダムエンカウント時にONになるスイッチ番号
    var _SwitchNo_RandomEncount = getParamNumber(['SwitchNo_RandomEncount', 'ランダムエンカウント時にONになるスイッチ番号'], 1, 9999); // ツクールスイッチ番号は、1～9999までのはず。
    // 戦闘勝利時、全滅時にONになるスイッチ番号
    var _SwitchNo_BattleWin = getParamNumber(['SwitchNo_BattleWin', '戦闘勝利時にONになるスイッチ番号'], 1, 9999); // ツクールスイッチ番号は、1～9999までのはず。
    var _SwitchNo_BattleLose = getParamNumber(['SwitchNo_BattleLose', '戦闘全滅時にONになるスイッチ番号'], 1, 9999); // ツクールスイッチ番号は、1～9999までのはず。
    // 各種、早送りボタンを機能させるかの有無
    var _isRapid_MapButton_ok = getParamBoolean(['isRapid_MapButton_ok', '決定ボタンでイベント早送り可能か']);
    var _isRapid_MapButton_shift = getParamBoolean(['isRapid_MapButton_shift', 'ダッシュボタンでイベント早送り可能か']);
    var _isRapid_BattleButton_ok = getParamBoolean(['isRapid_BattleButton_ok', '決定ボタンで戦闘早送り可能か']);
    var _isRapid_BattleButton_shift = getParamBoolean(['isRapid_BattleButton_shift', 'ダッシュボタンで戦闘早送り可能か']);
    var _isSkip_Button_shift = getParamBoolean(['isSkipButton_shift', 'ダッシュボタンでスキップ可能か']);

    // 各種パラメータの限界値変更を禁止するかのON/OFF
    var _isNoChangeParamLimit_inThisPlugin = getParamBoolean(['isNoChangeParamLimit_inThisPlugin', 'パラメータ限界値変更を禁止するか']);
    // 吸収技もダメージエフェクトをつけるかのON/OFF
    var _isOnEffectDamageDrain = getParamBoolean(['isOnEffectDamageDrain', '吸収技もダメージエフェクトをつけるか']);
    // 戦闘全滅後もゲームを継続するかのON/OFF
    var _isOnContinueBattleEnd = getParamBoolean(['isOnContinueBattleEnd', '戦闘全滅後もゲームを継続するか']);
    // ランダムエンカウント時にスイッチをONにするかのON/OFF
    var _isOnSwitchBattleEncount = getParamBoolean(['isOnSwitchBattleEncount', 'ランダムエンカウント時にスイッチをONにするか']);
    // 各種パラメータの限界値
    var _Limit_MaxHP = getParamNumber(['MaxHPLimit', '最大HPの限界値'], 1); // 最小値1～最大値はinfinity
    var _Limit_MaxMP = getParamNumber(['MaxMPLimit', '最大MPの限界値'], 0); // 最小値0～最大値はinfinity
    var _Limit_MaxAttack_AndOtherParam = getParamNumber(['ATKetcLimit', '攻撃力などの限界値'], 1); // 最小値1～最大値はinfinity
    // 各種かばう条件
    var _isChangeDefault_Migawari = getParamBoolean(['isChangeDefault_Migawari', '身代わり条件を変えるか']);
    var _Migawawri_Sareru_MaxHPPercent = getParamNumber(['SubstiutedChara_MaxHPPercent', 'かばわれる側の最大HP％0-100'], 0, 100);
    var _Migawawri_Sareru_MaxMPPercent = getParamNumber(['SubstiutedChara_MaxMPPercent', 'かばわれる側の最大MP％0-100'], 0, 100);
    var _Migawawri_Suru_MinHPPercent = getParamNumber(['SubstiutingChara_MinHPPercent', 'かばう側の最小HP％0-100'], 0, 100);
    var _Migawawri_Suru_MinMPPercent = getParamNumber(['SubstiutingChara_MinMPPercent', 'かばう側の最小MP％0-100'], 0, 100);
    var _Migawawri_Suru_ActPercent = getParamNumber(['SubstiutingRate', '身代わり率％0-100'], 0, 100);
    // 最後にかばったキャラ・かばわれたキャラのIDを格納する変数番号
    var _VarNo_Migawari_Sareta_AcorID = getParamNumber(['VarNo_Migawari_Sareta_AcorID', '最後にかばわれたアクターIDを格納する変数番号'], 1, 9999); // ツクールスイッチ番号は、1～9999までのはず。
    var _VarNo_Migawari_Shita_AcorID = getParamNumber(['VarNo_Migawari_Shita_AcorID', '最後にかばったアクターIDを格納する変数番号'], 1, 9999); // ツクールスイッチ番号は、1～9999までのはず。
    var _VarNo_Migawari_Sareta_EnemyID = getParamNumber(['VarNo_Migawari_Sareta_EnemyID', '最後にかばわれた敵キャラIDを格納する変数番号'], 1, 9999); // ツクールスイッチ番号は、1～9999までのはず。
    var _VarNo_Migawari_Shita_EnemyID = getParamNumber(['VarNo_Migawari_Shita_EnemyID', '最後にかばった敵キャラIDを格納する変数番号'], 1, 9999); // ツクールスイッチ番号は、1～9999までのはず。
    // 身代わり成功した（かばった）瞬間だけONになるスイッチ番号
    var _CommonEventNo_Migawari_Success_Actor = getParamNumber(['CommonEventNo_Migawari_Success_Actor', '味方の身代わり成功時に呼び出すコモンイベント番号'], 1, 1000); // ツクールコモンイベント番号は、1～1000までのはず。
    var _CommonEventNo_Migawari_Success_Enemy = getParamNumber(['CommonEventNo_Migawari_Success_Enemy', '敵の身代わり成功時に呼び出すコモンイベント番号'], 1, 1000); // ツクールコモンイベント番号は、1～1000までのはず。
    // 各種メッセージ中の制御文字、ピリオド「\.」、ライン「\|」で待つ時間
    var _WaitPeriodDef = getParamNumber_IncludeEscapeCharactors(['Default_Wait_Period', '「＼.」の待ちフレーム数'], 15, 0, 150);
    var _WaitLineDef = getParamNumber_IncludeEscapeCharactors(['Default_Wait_Line', '「＼|」の待ちフレーム数'], 60, 0, 600);
    // パラメータ変数、終わり。

    // その他、このjsファイル内だけで使う、ローカル変数。
    /** =1。これは変数に代入しないので、少数でも構いません。「\.」や「\|」の待ち時間に割り算します。ウェイトには影響しません。*/
    var _MESSAGESPEED_DEFAULT = 1.0; 
    /** スキップ中はtrue、そうでない場合はfalseを返す、スキップを制御するBoolean型変数です。*/
    var _isSkipMode = false;
    //デバッグ用。メソッドが呼ばれた回数を記録。テストプレイ中だけ、200回に一回だけ、デバッグ出力を実行。
    var _calledNum_plugin_Tachi_isFastRapidButton = 0;
    /** デバッグ出力するならtrue、本番プレイ中ならfalseを返します。テストプレイ中は、デバッグ出力パラメータがONならtrueです。*/
    var _isDebugMode = function () {
        return (isTestPlaying() && _isDebugOut);
    };
    /** デバッグ出力用変数。デバッグ中だと、値がNaNになるときに、警告を出します。*/
    var _debaguVar = 10;
                

    // 以下、ローカルメソッド宣言
    // （という名の、無名関数の値を返す変数宣言。必ず、これらの変数を呼び出す前に、宣言すること。出ないと無効になるよ。エラーは出ない…。）
    // 

    /** 0や±InfinityやNaNではない、メッセージスピードの倍率を0.1～99.0で返します。変数の値を見て、不正な値が入っていれば、調度よいデフォルト値に修正して返します。*/
    var getMessageWaitEscapeCharacterSpeed = function () {
        var _speed = _MESSAGESPEED_DEFAULT;
        // 何の変数番号の値を使うか。
        var _varNo = _VarNo_MessageWaitEscapeCharacterSpeed;
        // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。変な値が入っていたら、デフォルトスピードで。
        if (_varNo != null && _varNo >= 1 && _varNo < $dataSystem.variables.length) {
            // 倍数は、 変数値/2.0 でいきましょう。変数値=1のとき0.5倍(1/2の速さ)、変数=9のとき約4倍(9/2の速さ)。
            _speed = $gameVariables.value(_varNo) / 2.0;
            // 変数の値に変な値が入っていないか、随時チェック。.valueメソッド内で、「|| 0」の判定があるので、undefined、null、NaNはすでに0になっています。
            if (_speed === Infinity || _speed === -Infinity) { _speed = _MESSAGESPEED_DEFAULT; } // 無限だったら、デフォルトスピードで。
            if (_speed === 0) { _speed = _MESSAGESPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
        }
        // 0でないことを保証するために、こうしておきましょう。
        if (_speed < 0.1) { _speed = 0.1; } // 0.1未満なら0.1に。最高は1/10のスピードで。
        if (_speed > 99) { _speed = 99.0; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
        return _speed;
    };
    /** スキップモードの倍率を返します。*/
    var getSkipRate = function () {
        var _skipRate = 1;
        // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。変な値が入っていたら、デフォルトスピードで。
        if (_VarNo_SkipRate != null && _VarNo_SkipRate >= 1 && _VarNo_SkipRate < $dataSystem.variables.length) {
            _skipRate = $gameVariables.value(_VarNo_SkipRate);
            // 変数の値に変な値が入っていないか、随時チェック。
            if (_skipRate === Infinity || _skipRate === -Infinity) { _skipRate = _SKIPSPEED_DEFAULT; } // 無限だったら、デフォルトスピードで。
            if (_skipRate === 0) { _skipRate = _SKIPSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
            if (_skipRate < 1) { _skipRate = 1; } // 1未満なら1に。
            if (_skipRate > 99) { _skipRate = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
        }
        return _skipRate;
    };
    /** スキップモードが、ONかどうかを返します。*/
    var isSkipMode = function () {
        // // (a)スキップ中かを格納するスイッチの値を返す。ただ、これだと、スイッチ番号が無効（マイナスや、変数の数の最大値を超えていたら）、判定できないので、怖い。ので、やめる。
        // var _isSkipModeON = false;
        // if ($gameSwitches && _SwitchNo_isSkip > 0) {
        //     if ($gameSwitches.value(_SwitchNo_isSkip) === true) {
        //         _isSkipModeON = true;
        //     }
        // }
        // return _isSkipModeON;

        // (b)すなおに、ローカル関数を返す。これだと、確実に制御できる。
        return _isSkipMode;
    };
    /** スキップモードをONします。*/
   var SkipModeOn = function () {
        // スキップ禁止中かどうかを調べる。
        var _canSkip = true;
        if ($gameSwitches && _SwitchNo_isNoSkip > 0) {
            if ($gameSwitches.value(_SwitchNo_isNoSkip) === true) {
                _canSkip = false;
            }
        }
        // スキップ禁止中なら、スイッチを自動的にOFFにする。
        if (_canSkip === false) {
            // スキップ中スイッチがONになっているときだけ。でないと、ずっと実行される。
            if ($gameSwitches.value(_SwitchNo_isSkip) === true) {
                // スキップ中スイッチをOFFにする。
                _isSkipMode = false;
                $gameSwitches.setValue(_SwitchNo_isSkip, false);
                if (_isDebugMode()) { // テストプレイ中のみ、デバッグ出力します。
                    console.log('plugin_Tachi_SkipModeOn: スキップモードを実行しようとしましたが、スキップ禁止中ですので、自動的にOFFになりました。');
                }
            }
        }
        else {
            // スキップ中スイッチがOFFになっているときだけ。でないと、ずっと実行される。
            if ($gameSwitches.value(_SwitchNo_isSkip) === false) {
                // スキップ禁止中じゃないので、スキップ中スイッチをONにする。
                _isSkipMode = true;
                $gameSwitches.setValue(_SwitchNo_isSkip, true);
                if (_isDebugMode()) { // テストプレイ中のみ、デバッグ出力します。
                    console.log('plugin_Tachi_SkipModeOn: スキップモードがONになりました。');
                }
            }
        }
    };
    /** スキップモードをOFFします。*/
    var SkipModeOff = function () {
        // スキップ中スイッチがONになっているときだけ。でないと、ずっと実行される。
        if ($gameSwitches.value(_SwitchNo_isSkip) === true) {
            // スキップ中スイッチをOFFにする。
            _isSkipMode = false;
            $gameSwitches.setValue(_SwitchNo_isSkip, false);
            if (_isDebugMode()) { // テストプレイ中のみ、デバッグ出力します。
                console.log('plugin_Tachi_SkipModeOff: スキップモードがOFFになりました。');
            }
        }
    };
    // ●開発者用メモ： 
    // isFastForward()は、マップ専用で、イベントを早送り中かを判定するメソッドです。
    // 条件は、マップのイベントが動いていて、シーン切替中じゃなくって、かつ決定ボタンか画面タッチ 「長押し」 されているか、で判定します。
    // 実際のデフォルトのソースは、rpg_scenes.jsにあり、以下です。
    // =========================================================================
    // Scene_Map.prototype.isFastForward = function() {
    //    return ($gameMap.isEventRunning() && !SceneManager.isSceneChanging() &&
    //            (Input.isLongPressed('ok') || TouchInput.isLongPressed()));
    //};
    // ==========================================================================
    // つまり、「戦闘中は必ずfalse」ですので、戦闘中の早送りの判定には使えません。
    // また、マップ中でも、「長押し」しか判定しないので、何百ミリ秒かかかりますし、ボタンや画面の短い押しなどは、早送りと判定されません。
    // そのため、tachiさんは、もっと快適な操作を考え、短い押しでも早送りできるように、
    // if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed())などを直打ちしています。
    // ただこれだと、パラメータにより複数のボタンを有効／無効にする際に、
    // ソースが煩雑になりがちですし、更新し忘れる可能性もあります。
    //
    // そこで、複数の箇所で同じ処理を書くのを省略するため、
    // merusaiaは、isRapid_MapButtonOn()と、isRapid_BattleButtonOn()、
    // それらを呼び出す、isFastRapidButton()、という新しいメソッドを作成しています。
    // 
    // ↓ 以下、追加メソッド。
    /**  早送りモードに移行する条件の、早送りボタンが短く押しっぱなしされているかの早送り判定。マップ中、戦闘中問わず、使えます。
      * ・merusaiaによって、各種ボタン（決定ボタン/shiftボタン/画面タッチ）の早送りを有効/無効にする機能が追加されています。
    */
    var isFastRapidButton = function () {
        // merusaiaが、戦闘中、マップ中、タッチ、に分けて、わかりやすく整理して変更。
        var _isFastRapid = false;
        if ($gameMap.isEventRunning()) {
            // マップ中は、シーン切替中ではなくて、かつ、
            // 各種ボタンの早送りが有効で、かつ短い押しがされていたら、早送りモードとする。
            if (!SceneManager.isSceneChanging() && isRapid_MapButtonOn() === true) {
                _isFastRapid = true;
            }
        } else {
            // 戦闘中は、各種ボタンの早送りが有効で、かつ短い押しがされていたら、早送りモードとする。
            if (isRapid_BattleButtonOn() === true) {
                _isFastRapid = true;
            }
        }

        // 加えて、merusaiaが、スキップモード判定を追加。スキップボタンは、ゲームパッドのダッシュボタン（shiftキー）
        if (_isSkip_Button_shift === true && Input.isPressed('shift')) {
            // スキップボタンが押されていたら、スキップモードONへ移行。スキップ禁止でなければの判定は、このメソッドの内部でやっていますので、不要です。
            SkipModeOn();
        } else {
            // スキップボタンが押されていなかったら、スキップモードOFFへ移行。スキップ禁止であっても、この処理はされます。
            SkipModeOff();
        }

        // undefinedになるチェック中。
        // 4.2. 計算元のthis._waitCountの例外チェック
        if(Number.isNaN(_debaguVar) || _debaguVar == null || _debaguVar === Infinity ||_debaguVar === -Infinity){
            // フリーズする原因を調査するために、デバッグ。
            if (_isDebugMode()) {
                console.log('○ this._waitCount：' + (_debaguVar) + ' がおかしいで。');
            }
        }
        //デバッグ用。テストプレイ中だけ。200回に一回だけ、実行
        _calledNum_plugin_Tachi_isFastRapidButton++;
        if (_calledNum_plugin_Tachi_isFastRapidButton % 200 === 0) {
            if (_isDebugMode()) {
                var _gameSpeed = $gameVariables.value(_VarNo_BattleSpeed);
                var _speed = $gameVariables.value(_VarNo_Rapid_BattleRate);
                if (_isFastRapid) {
                    console.log('●早送り中: ' + _speed + '倍: this._waitCount：' + (_debaguVar) + ' 戦闘スピードV[' + _VarNo_BattleSpeed + ']: ' + _gameSpeed
                     + ' 戦闘早送り倍数V[' + _VarNo_Rapid_BattleRate + ']:' + $gameVariables.value(_VarNo_Rapid_BattleRate)
                     + ' スキップ倍数V[' + _VarNo_SkipRate + ']:' + $gameVariables.value(_VarNo_SkipRate));
                } else {
                    if(_isSkipMode){
                        console.log('○スキップ中: ' + getSkipRate() + ':倍: this._waitCount：' + (_debaguVar) + ' ゲームスピードV[' + _VarNo_BattleSpeed + ']: ' + _gameSpeed
                        + ' 戦闘早送り倍数V[' + _VarNo_Rapid_BattleRate + ']:' + $gameVariables.value(_VarNo_Rapid_BattleRate)
                        + ' スキップ倍数V[' + _VarNo_SkipRate + ']:' + $gameVariables.value(_VarNo_SkipRate)+'→修正後'+getSkipRate());
                    }else{
                        console.log('○速度:1倍: this._waitCount：' + (_debaguVar) + ' ゲームスピードV[' + _VarNo_BattleSpeed + ']: ' + _gameSpeed
                        + ' 戦闘早送り倍数V[' + _VarNo_Rapid_BattleRate + ']:' + $gameVariables.value(_VarNo_Rapid_BattleRate)
                        + ' スキップ倍数V[' + _VarNo_SkipRate + ']:' + $gameVariables.value(_VarNo_SkipRate)+'→修正後'+getSkipRate());
                    }
                }
            }
        }
        return _isFastRapid;
    };
    /** マップ上で、それぞれの早送りボタンが有効で、かつそのボタンが「短く」押されていたら、trueを返します。
     * Tachi3.jsでしか機能しない、新しくつくったメソッドです。
     */
    var isRapid_MapButtonOn = function () {
        var _isRaid = false; // デフォルトはfalse。

        // それぞれの早送りボタンが有効で、かつそのボタンの、いずれかが、「短く」押されていたら、true。
        if (_isRapid_MapButton_ok === true && Input.isPressed('ok')) { // 決定ボタン（ok/Enter/zキーなど）
            _isRaid = true;
        }
        else if (_isRapid_MapButton_shift === true && Input.isPressed('shift')) { // ダッシュボタン（Shiftキー）
            _isRaid = true;
        }
        // タッチ操作で短く押しなら、問答無用で早送りtrueにする（スマホユーザはそういう仕様のほうが助かる、と考えたため）
        // ※短く押しにすると、二本指のキャンセルや、フリック操作と誤作動を起こしやすいかもしれません。必要に応じてisLongPressedに変更してね。
        else if (TouchInput.isPressed()) {
            _isRaid = true;
        }
        return _isRaid;
    };
    /** 戦闘中に、それぞれの早送りボタンが有効で、かつそのボタンが「短く」押されていたら、trueを返します。
     *  Tachi3.jsでしか機能しない、新しくつくったメソッドです。
     */
    var isRapid_BattleButtonOn = function () {
        var _isRaid = false; // デフォルトはfalse。

        // それぞれの早送りボタンが有効で、かつそのボタンの、いずれかが、「短く」押されていたら、true。
        if (_isRapid_BattleButton_ok === true && Input.isPressed('ok')) { // 決定ボタン（ok/Enter/zキーなど）
            _isRaid = true;
        }
        else if (_isRapid_BattleButton_shift === true && Input.isPressed('shift')) { // ダッシュボタン（Shiftキー）
            _isRaid = true;
        }
        // タッチ操作で短く押しなら、問答無用で早送りtrueにする（スマホユーザはそういう仕様のほうが助かる、と考えたため）
        // ※短く押しにすると、二本指のキャンセルや、フリック操作と誤作動を起こしやすいかもしれません。必要に応じてisLongPressedに変更してね。
        else if (TouchInput.isPressed()) {
            _isRaid = true;
        }
        return _isRaid;
    };
    //============ ローカル変数（という名の無名関数の値を返すメソッド）の追加、終 ================================================


    // ↓上記のメソッドを、プラグインコマンドとして実装します。
    // トリアコンタンさんのソースを参考に使わせていただいてます。感謝。
    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    // ●ここのメソッド名を、上記の■部分 Game_Interpreter.prototype.pluginCommand_***メソッド名と同じにしてください。
    Game_Interpreter.prototype.pluginCommandAddRead_Tachi = function (command, args) {
        switch (getCommandName(command)) {
            // 表記例:
            //case 'NEW_PLUGINCOMMAND_NAME' :
            //case '新しいプラグインコマンド名':
            //    // 呼び出すメソッド名は、Game_System.prototype.plugin_***の、.prototypeを抜いたものになっています。
            //    //$gameSystem.plugin_***(); // 引数を取りたい時は、右を参考にしてください。ただし、プラグインコマンドはエラーを自動的にスキップするので、なるべく引数を取らないほうが、ユーザには親切になります。 (getArgNumber(args[0]), getArgString(concatArgs(args, 1)));
            //    break;

            // ■getCommandName()メソッドについて注意点。
            // ※プラグインコマンドを英字で入力する場合は、スペルミスを防ぐため、名前を必ず大文字にしてチェックします。
            //   新しいプラグインコマンドを作る場合は、英字表記は必ず「全て大文字」にしてください。
            case 'SKIPMODE_ON':
            case 'スキップモードON':
                SkipModeOn(); // 引数を取りたい時は、右を参考にしてください。 (getArgNumber(args[0]), getArgString(concatArgs(args, 1)));
                break;
            case 'SKIPMODE_OFF':
            case 'スキップモードOFF':
                SkipModeOff(); // 引数を取りたい時は、右を参考にしてください。 (getArgNumber(args[0]), getArgString(concatArgs(args, 1)));
                break;
        }

    };
    // 下記三行の説明：
    //      競合対策のため、(1)デフォルトのGame_Interpreter.prototype.pluginCommandメソッドを別名_***メソッドに置き換え、
    //      それを(2)上書き後のメソッドの中で、(3)applyやcallを使って呼び出すことで、
    //      このプラグインより上でONにされている、同じメソッドを上書きするプラグインとの競合を回避できます。
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand; // (1)
    Game_Interpreter.prototype.pluginCommand = function (command, args) {                // (2)
        _Game_Interpreter_pluginCommand.apply(this, arguments);                          // (3)
        // ↓  この行から、上書き後のメソッドの処理を実行。 
        try {
            // ■ここのメソッド名を、下記の●部分 Game_Interpreter.prototype.pluginCommandAddRead_***メソッド名と同じにしてください。
            this.pluginCommandAddRead_Tachi(command, args);
        } catch (e) {
            if ($gameTemp.isPlaytest() && Utils.isNwjs()) {
                var window = require('nw.gui').Window.get();
                if (!window.isDevToolsOpen()) {
                    var devTool = window.showDevTools();
                    devTool.moveTo(0, 0);
                    devTool.resizeTo(Graphics.width, Graphics.height);
                    window.focus();
                }
            }
            console.log('プラグインコマンドの実行中にエラーが発生しました。');
            console.log('- コマンド名   : ' + command);
            console.log('- コマンド引数 : ' + args);
            console.log('- エラー原因   : ' + e.toString());
        }
    };
    //============ プラグインコマンドの追加定義、終 ============================================

    //===================================================================================
    //■Game_Interpreter.command230 : ウェイトコマンドの追加定義。
    // スキップ中だと、ウェイトを待たないようにする機能を追加しています。（merusaia）
    //====================================================================================
    var _Game_Interpreter_command230 = Game_Interpreter.prototype.command230;
    Game_Interpreter.prototype.command230 = function() {
        // スキップ中は、「ウェイト●●フレーム」の命令を無視します。
        var _ret = true;
        if(isSkipMode() === false){
            _ret = _Game_Interpreter_command230.apply(this, arguments);
        }
        return _ret; // [メモ]この一行が抜けていたせいで、ウェイトが一つでも入ると無限ループしていた。Trbさんに感謝。
    };
    // =========== ウェイトコマンドの追加定義、終 ===============================================

    //============ 以下、tachiさん & merusaia による追記 ======================================

    // ※コメント
    //// アイテム数の表示を調整（デフォルトの２桁→３桁に表示を変更している。後にやっている、同じアイテム最大所持数を99→999にするため。）
    //Window_ItemList.prototype.numberWidth = function() {
    //    return this.textWidth('0000');
    //};
    //
    //Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
    //    if (this.needsNumber()) {
    //        this.drawText(':', x, y, width - this.textWidth('000'), 'right');
    //        this.drawText($gameParty.numItems(item), x, y, width, 'right');
    //    }
    //};

    // ※コメント
    //// アイテム所持数（デフォルトの99→999にしている）
    //Game_Party.prototype.maxItems = function(item) {
    //    return 999;
    //};


    // ※コメント
    //// 位置調整（ゲーム開始時のタイトル画像がよく見えるように、タイトルウィンドウの幅を調整している。）
    //Window_TitleCommand.prototype.windowWidth = function() {
    //    return 190;
    //};
    //
    //Window_TitleCommand.prototype.updatePlacement = function() {
    //    this.x = (Graphics.boxWidth - this.width) / 2;
    //    this.y = Graphics.boxHeight - this.height - 96 + 50;
    //};

    // ★オプションを触るプラグインとの競合に注意！！  他のオプションを触るプラグインでやっているならば、ここではできるだけやらないほうがいいいよ。
    // コメント
    //// デフォルトのオプション項目（例えば、「常時ダッシュ」や「コマンド記憶」）を非表示にしたいとき、ここをコメントアウトしてください。
    // merusaiaがコメント：
    //   この書き方だと、このプラグインの下にWindow_Options.prototype.addGeneralOptions = function()を上書きするプラグイン
    //   があると、競合してしまう。トリアコンタンさんのソースを参考に、競合しないように編集。
    // ※プラグインのデフォルトでは、これらはコメントされていた。つまり、オプション項目の中の、「常時ダッシュ」と「コマンド記憶」を隠している‥どうしてこうなった！のかは不明。たぶん、TP足りない時に変な挙動になるのが嫌だったのかな‥）
    //Window_Options.prototype.addGeneralOptions = function() {
    //    this.addCommand(TextManager.alwaysDash, 'alwaysDash');
    //    this.addCommand(TextManager.commandRemember, 'commandRemember');
    //};
    // ↓ 上記の代わりに、merusaiaが追記:
    //   トリアコンタンさんのソースを参考に、「新規メソッド.apply(this, arguments)」を使い、同名メソッドが競合しないように改良。
    //=============================================================================
    //  オプション項目に、様々な項目を追加できます。
    //  ※他のプラグインと競合しないように、上書き前に元のメソッドを新しい変数名に代入し、上書き後のメソッド内で最初に呼び出してします。
    //=============================================================================
    //var _Tachi_Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
    //Window_Options.prototype.addGeneralOptions = function() {
    //	_Tachi_Window_Options_addGeneralOptions.apply(this, arguments); // 上書き後メソッドの最初に、上書き前メソッドを呼び出す。
    //	// この行から、上書き後のメソッドの処理を実行。 
    //    // 例: this.addCommand('ほげほげ',   'hogehoge'); // 第一引数の表示名で、第二引数の項目を追加。ただし、'hogehoge'のオプション項目をConfigManager.applyDataに認識させないと、意味ないよ。
    //};

    // ★タイトルメニューを触るプラグインとの競合に注意！！
    // タイトルメニュー項目の設定・追加・隠し（追加されていないコマンドは、非表示になる。現時点では、全てが表示されている。）
    // ここでプロトタイプ宣言を上書きすれば、タイトル画面に表示する項目を変更できる。
    // 例えば、普段はメニューからいける「オプション（メニュー名:options）」メニューを消したければ、三行目をコメントアウトすれば良い）
    //Window_TitleCommand.prototype.makeCommandList = function() {
    //    this.addCommand(TextManager.newGame,   'newGame');
    //    this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
    //    this.addCommand(TextManager.options,   'options');
    //};

    // ★メニュー画面を触るプラグインとの競合に注意！！
    //// メニューコマンド隠し（追加されていないコマンドは、非表示になる。例えば、ここでは「セーブ」「設定」「ステータス」などが非表示にされている？）
    //Window_MenuCommand.prototype.makeCommandList = function() {
    //    this.addMainCommands();
    //    this.addFormationCommand();
    //    this.addOriginalCommands();
    //};

    // ★バトルコマンドを触る競合に注意！！  他のプラグインでやっているならば、ここではできるだけやらないほうがいいいよ。
    // ※コメント
    //// バトルコマンド隠し（コメントされたコマンドは、非表示になる。例えば、ここでは「防御」コマンドを非表示にしようとしている。防御コマンドいらない子、て人用。）
    //Window_ActorCommand.prototype.makeCommandList = function() {
    //    if (this._actor) {
    //        this.addAttackCommand();
    //        this.addSkillCommands();
    //        //this.addGuardCommand();
    //        this.addItemCommand();
    //    }
    //};

    var _Game_BattlerBase_paramMax = Game_BattlerBase.prototype.paramMax; // 元のメソッドを別変数で宣言して退避。
    /** Tachi3.jsの、ステータス限界値の変更。追加宣言で、競合対策済み。
      * ・Ver.1.0（Tachiさん初版）：  限界値（HPやMPの限界値を、HPのデフォルト9999→999999、MPのデフォルト999→9999、その他のパラメータを999→9999に変更している。
      * ・Ver.1.1（現行）：           パラメータ化。開発者が、プラグインのエディタ時で設定できるように。
      * ・今後の課題：               指定した変数番号に持たせて、ストーリーが進むに従って動的に限界突破していくとか面白そうかも…（でもこれ常に呼べるのかよくわからないから、一旦保留）。
      * ※気をつけてください。ダメージ計算式が引き算形式「a.atk-b.def」や割り算形式「a.atk/b.def」だと、他のゲームバランスがむちゃくちゃになる可能性だって有ります‥。運も‥。）
      */
    Game_BattlerBase.prototype.paramMax = function (paramId) {
        if(_isNoChangeParamLimit_inThisPlugin === true){              // このプラグインのパラメータ限界値変更を禁止するなら、
            return _Game_BattlerBase_paramMax.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            if (paramId === 0) {
                return _Limit_MaxHP;    // MaxHP
            } else if (paramId === 1) {
                return _Limit_MaxMP;    // MaxMP
            } else {
                return _Limit_MaxAttack_AndOtherParam; // その他、攻撃力や運などのパラメータ
            }
        }
    };

    // =============================================================================
    // ゲームスピード調整
    // Tachiさんによる、マップ・戦闘メッセージ・戦闘エフェクト・エンカウントエフェクトなど、様々な高速化調整です。一部、merusaiaがコメント＆改変。
    // =============================================================================
    // 
    //
    // ↓ 以下、実際にデフォルトのソース（rpg_***.js）を追加宣言しているメソッド。
    // 
    var _Scene_Map_updateMainMultiply = Scene_Map.prototype.updateMainMultiply;
    /** マップのゲームスピード調整
      * this.updateMain()が書かれてある行数分だけ、何倍にも高速化されます。デフォルトは２倍→ここでは５倍。
      * マップ時のキャラ移動やアニメーションの速さなどに影響します。メッセージ中の制御文字「\.」や「\|」などの待ち時間には影響しません。
      */
    Scene_Map.prototype.updateMainMultiply = function () {        // 元メソッドにreturnはないよ。
        if(_isNoChangeSpeed_inThisPlugin === true){               // このプラグインのスピード変更を禁止するなら、
            _Scene_Map_updateMainMultiply.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            // デフォルトはこの一行。
            this.updateMain(); // 更新処理を一回だけ呼び出す。

            // // tachiさんの追加はこの一行。
            // if (this.isFastForward()) { this.updateMain(); this.updateMain();} // マップ時に早送り状態（決定ボタンや画面が「長押し」）だったら。  ※ダッシュ状態（Shiftボタンおしっぱなし）は判定に含まれていないので注意。

            // merusaiaの追加行は下。
            // 1. スピードのデフォルトは1。マップの移動スピードは、キャラ移動やアニメーションの速さのみ。戦闘スピードやメッセージスピードでは変更しない。
            var _speed = _MAPSPEED_DEFAULT;
            // 2. 早送りボタンが押されていたら、_speedを更新
            if (isFastRapidButton() === true) {
                _speed = _RAPID_MAPSPEED_DEFAULT;
                // // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                if (_VarNo_Rapid_MapRate != null && _VarNo_Rapid_MapRate >= 1 && _VarNo_Rapid_MapRate < $dataSystem.variables.length) {
                    _speed = Number.parseInt($gameVariables.value(_VarNo_Rapid_MapRate));
                    // 変数の値に変な値が入っていないか、随時チェック。
                    if (_speed === Infinity || _speed === -Infinity) { _speed = _RAPID_MAPSPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                    else if (_speed === 0) { _speed = _RAPID_MAPSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
                    else if (_speed < 1) { _speed = 0; }   // 1未満なら0に。
                    else if (_speed > 99) { _speed = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
                }else{
                    _speed = _RAPID_MAPSPEED_DEFAULT;
                }
            }
            // 3. スキップ中だったら、_speedをスキップ倍率で掛け算する。
            if (isSkipMode() === true) {
                _speed *= getSkipRate();
            }
            // 4. _speed回だけ、更新処理を呼び出す。（体感ゲームスピードが_speed倍になる）
            for (var i = 2; i <= _speed; i++) {
                this.updateMain();
            }
            // merusaiaによる追加行、終。
        }
    };
    // 戦闘メッセージ（バトルログ）の表示スピード高速化です。追加定義で競合対策済み。
    var _Window_BattleLog_updateWaitCount = Window_BattleLog.prototype.updateWaitCount;
    Window_BattleLog.prototype.updateWaitCount = function () {   // 元メソッドの返り値は、this._waitCount>0ならtrue、それ以外ならfalseだよ。
        if(_isNoChangeSpeed_inThisPlugin === true){              // このプラグインのスピード変更を禁止するなら、
            return _Window_BattleLog_updateWaitCount.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else if (this._waitCount > 0) {
            // // Tachiさんによる追加行、始まり。ここの5行が追加されている。
            // if (Input.isPressed('shift') || this.isFastForward()) // ダッシュ状態（Shiftボタンおしっぱなし）や、早送り状態（決定ボタン押しっぱなし）だったら
            // {
            //    this._waitCount -= 20; // tachiさんのデフォルト。なぜ-20なのかは不明。早過ぎると、ログが目で終えないほど小さくなってしまう可能性があるからです。
            // }
            // else { this._waitCount -= 2; }  // Tachiさんデフォルト。早送りでない場合を、だいぶ早く調整したかったみたいで、2だけ減らす。
            // Tachiさんによる追加行、終。

            // merusaiaの改変後は下。
            // 1. _waitCountを減らすデフォルトは、2。戦闘スピード1-9が設定してあれば、それに2を割ったもの。
            var _reduceCount = _BATTLE_LOGSPEED_DEFAULT;
            // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
            if (_VarNo_BattleSpeed != null && _VarNo_BattleSpeed >= 1 && _VarNo_BattleSpeed < $dataSystem.variables.length) {
                var _gameSpeed = $gameVariables.value(_VarNo_BattleSpeed);
                // 変数の値に変な値が入っていないか、随時チェック。.valueで || 0 としているため、nullやundefinedやNaNは0になる。判定は±Infinityだけで十分
                _reduceCount = Number.parseInt(_gameSpeed / 2);
                if (_gameSpeed === Infinity || _gameSpeed === -Infinity) { _reduceCount = _BATTLE_LOGSPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                else if (_gameSpeed === 0) { _reduceCount = _BATTLE_LOGSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピード(-2)で。
                else if (_gameSpeed === 5) { _reduceCount = _BATTLE_LOGSPEED_DEFAULT; } // 5が入っていたら、デフォルトスピード(-2)で。
                else if (_gameSpeed < 1) { _reduceCount = 0; } // 1未満なら0に。
                else if (_gameSpeed > 99) { _reduceCount = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
            }
            // 2. 早送りボタンが押されていたら、ゲーム内変数を取得し、_speedの値を更新。
            if (isFastRapidButton()) {
                // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                if (_VarNo_Rapid_BattleRate != null && _VarNo_Rapid_BattleRate >= 1 && _VarNo_Rapid_BattleRate < $dataSystem.variables.length) {
                    _reduceCount = Number.parseInt($gameVariables.value(_VarNo_Rapid_BattleRate));
                    // 変数の値に変な値が入っていないか、随時チェック。
                    if (_reduceCount === Infinity || _reduceCount === -Infinity) { _reduceCount = _RAPID_BATTLE_LOGSPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                    else if (_reduceCount === 0) { _reduceCount = _RAPID_BATTLE_LOGSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピード(-2カウント)で。
                    else if (_reduceCount < 1) { _reduceCount = 1; }   // ここだけ、0は許可しない。1未満なら1に。ボタン長押しでゆっくりにしたい時に。
                    else if (_reduceCount > 99) { _reduceCount = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、高速化されない。
                }else{
                    _reduceCount = _RAPID_BATTLE_LOGSPEED_DEFAULT;
                }
            }
            // 3. スキップ中だったら、_speedをスキップ倍率で掛け算する。
            if (isSkipMode() === true) {
                _reduceCount *= getSkipRate();
            }
            if(this._waitCount == null){
                console.log('■this._waitCount：' + (this._waitCount) + ' がnullかundefinedになってるから、 初期値に戻すで。');
                this._waitCount = 16;
            }
            // 4. _speedだけ、this._waitCount(次の処理まで待つカウント数。0になったら次へ。)を引く。（体感ゲームスピードが早くなる）。
            // ただし、_speedは1以上を保証する。0だとthis._waitCountがずっと減らず、無限ループするから、注意だよ！。
            // 4.1. speedの例外チェック
            if(Number.isNaN(_reduceCount) || _reduceCount == null || _reduceCount === Infinity || _reduceCount === -Infinity){
                if(_isDebugOut){ console.log('■_reduceCount：' + (_reduceCount) + ' がおかしいで。 デフォルト'+ _BATTLE_LOGSPEED_DEFAULT +'に戻します。');}
                _reduceCount = _BATTLE_LOGSPEED_DEFAULT;
            }
            if(_reduceCount <= 0){
                if(_isDebugOut){ console.log('■_reduceCount：' + (_reduceCount) + ' が0以下です。0だと止まってしまうので、 1にします。');}
                _reduceCount = 1; // 必ず1以上は引く。
            }
            // 4.2. 計算元のthis._waitCountの例外チェック
            // ただし、this._waitCountが以下の値になった場合、this._waitCount=0とする。
            // ・0未満:            この変数の意味は「ゲームを再開するまで待つフレーム数」なので、-1とか-2が入っても、意味はない。なので、元のソースでも if(this._waitCount < 0){ this._waitCount = 0; } としている。
            // ・NaN:              数えられない数。や、0/0などで発生する。計算式にundefinedのものが一つでもあると、this._waitCountにNaNが入る。
            // ・Infinity          超小さい値や+∞を使った計算。ゼロ除算などで発生する。ちなみに、Number.isNaN(Infinity)はfalse。Number.isFinite(Infinity)もfalse。isInfinityメソッドは存在しないので、「=== Infinity」と「===-Inifinity」で判定する。
            // ・nullやundefined:  計算式にundefinedやnull、数値に変換できないもの（文字列）が一つでもあると、計算結果にNaNが入る。「==null」でチェックできる。
            if(Number.isNaN(this._waitCount) || this._waitCount == null || this._waitCount === Infinity || this._waitCount === -Infinity){
                if(_isDebugOut){ console.log('■this._waitCount：' + this._waitCount + ' がおかしいから、 '+_reduceCount+' 引いてもNaNになるで。 0に初期化します。');}
                this._waitCount = 0;
                return false; // もう待たない。
            }else{
                // フリーズする原因を調査するために、デバッグ。
                //if(_isDebugOut){ console.log('■安全確保後：' + (this._waitCount - _reduceCount) + ' = 元のthis._waitCount: ' + this._waitCount + ' - speed' + _reduceCount + '');}
                // ここで、残りウェイトカウントを引く。
                this._waitCount -= _reduceCount;
            }
            // フリーズする原因を調査するために、デバッグ。
            if (_isDebugMode()) {
                console.log('' + (this._waitCount - _reduceCount) + ' = 元のthis._waitCount: ' + this._waitCount + ' - ' + _reduceCount + '');
                _debaguVar = this._waitCount;
                if(_debaguVar < 0){
                    _debaguVar = 0;
                }
            }
            // merusaiaによる追加行、終。
            
            // 元メソッドのソースにもある処理。0未満なら、0にする。ただし、この場合も返り値はtrue（元メソッドとしように合わせる）
            if (this._waitCount < 0) {
                this._waitCount = 0;
            }
            return true; // 元メソッドの返り値は、this._waitCount>0ならtrue、それ以外ならfalseだよ。

        }else{
            // 0以下なら、もう待たない。
            // フリーズする原因を調査するために、デバッグ。
            if (_isDebugMode()) {
                console.log('_waitCountが0以下になったよ（ウェイト終了）');
            }
            return false; // 元メソッドの返り値は、this._waitCount>0ならtrue、それ以外ならfalseだよ。
        }
    };
    // 敵エンカウントエフェクトのスピードをあげています。ここはスピード倍率では変化しません。デフォルトは60フレーム(1秒)。追加定義で競合対策済み。
    var _Scene_Map_encounterEffectSpeed = Scene_Map.prototype.encounterEffectSpeed;
    Scene_Map.prototype.encounterEffectSpeed = function () {
        if(_isNoChangeSpeed_inThisPlugin === true){              // このプラグインのスピード変更を禁止するなら、
            return _Scene_Map_encounterEffectSpeed.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            return 20; // デフォルトのソースは60;
        }
    };
    // 敵エンカウント時の画面ズームの処理を省いて、高速化しています。追加定義で競合対策済み。
    var _Scene_Map_updateEncounterEffect = Scene_Map.prototype.updateEncounterEffect;
    Scene_Map.prototype.updateEncounterEffect = function () {    // 元メソッドにreturnはないよ。
        if(_isNoChangeSpeed_inThisPlugin === true){              // このプラグインのスピード変更を禁止するなら、
            _Scene_Map_updateEncounterEffect.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            if (this._encounterEffectDuration > 0) {
                this._encounterEffectDuration--;
                var speed = this.encounterEffectSpeed();
                var n = speed - this._encounterEffectDuration; // ここが、上で設定したエフェクトスピードに影響されます。ここはデフォルトと一緒。調整されていない。
                var p = n / speed;
                var q = ((p - 1) * 20 * p + 5) * p + 1;  // ここはデフォルトと一緒。調整されていない。
                var zoomX = $gamePlayer.screenX();
                var zoomY = $gamePlayer.screenY() - 24;
                if (n === 2) {
                    //$gameScreen.setZoom(zoomX, zoomY, 1); // デフォルトと違うのは、ここをコメントしている所。画面ズームの処理を省いて、高速化したかったのかな。
                    this.snapForBattleBackground();
                    this.startFlashForEncounter(speed / 2);
                }
                //$gameScreen.setZoom(zoomX, zoomY, q); // デフォルトと違うのは、ここをコメントしている所。画面ズームの処理を省いて、高速化したかったのかな。
                if (n === Math.floor(speed / 6)) {
                    this.startFlashForEncounter(speed / 2);
                }
                if (n === Math.floor(speed / 2)) {
                    BattleManager.playBattleBgm();
                    this.startFadeOut(10);// this.fadeSpeed()); // デフォルトと違うのは、ここをthis.fadeSpeed()→10としているところ。フェードアウトを早くしたかったんですね。
                }
            }
        }
    };
    //  エンカウントスピードの調整（キャラクターを消すエフェクトを無しにして、エンカウントスピードを上げている）。追加定義で競合対策済み。
    var _Scene_Map_startEncounterEffect = Scene_Map.prototype.startEncounterEffect;
    Scene_Map.prototype.startEncounterEffect = function () {     // 元メソッドにreturnはないよ。
        if(_isNoChangeSpeed_inThisPlugin === true){              // このプラグインのスピード変更を禁止するなら、
            _Scene_Map_startEncounterEffect.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            //this._spriteset.hideCharacters(); // ここだけデフォルトから変更。コメントアウト。マップ敵エンカウント時のキャラクターを消すエフェクトを無効にしている。
            this._encounterEffectDuration = this.encounterEffectSpeed();
        }
    };
    // 以下、戦闘の高速化。スキルエフェクトのアニメーション、敵スプライト、移動速度、武器モーションのスピードを、それぞれ個別に調整。追加定義で競合対策済み。
    // スキルエフェクト、つまり、戦闘アニメーションの高速化。サイドビュー時は、敵味方共通。
    var _Sprite_Animation_update = Sprite_Animation.prototype.update;
    Sprite_Animation.prototype.update = function () {           // 元メソッドにreturnはないよ。
        if(_isNoChangeSpeed_inThisPlugin === true){              // このプラグインのスピード変更を禁止するなら、
            _Sprite_Animation_update.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            Sprite.prototype.update.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
            this.updateMain();

            // // Tachiさんによる追加行、始まり。  ここの6行が追加されている。
            // if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){ // ダッシュ状態（Shiftボタンおしっぱなし）や、早送り状態（決定ボタン押しっぱなし）だったら、
            //     this.updateMain(); // ここまでだと２倍
            //     this.updateMain(); // ここまでだと３倍
            //     this.updateMain(); // ここまでだと４倍
            // }
            // // Tachiさんによる追加行、終。

            // merusaiaの追加行は下。
            // 1. 戦闘スピードのデフォルトは1。戦闘スピード1-9が設定してあれば、それに4を割ったもの。
            var _speed = _BATTLE_ANIMATIONSPEED_DEFAULT;
            // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
            if (_VarNo_BattleSpeed != null && _VarNo_BattleSpeed >= 1 && _VarNo_BattleSpeed < $dataSystem.variables.length) {
                var _gameSpeed = $gameVariables.value(_VarNo_BattleSpeed);
                _speed = Number.parseInt(_gameSpeed / 4);
                // 変数の値に変な値が入っていないか、随時チェック。
                if (_gameSpeed === Infinity || _gameSpeed === -Infinity) { _speed = _BATTLE_ANIMATIONSPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                else if (_gameSpeed === 0) { _speed = _BATTLE_ANIMATIONSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
                else if (_gameSpeed === 5) { _speed = _BATTLE_ANIMATIONSPEED_DEFAULT; } // 5が入っていたら、デフォルトスピードで。
                else if (_gameSpeed < 1) { _speed = 0; } // 1未満なら0に。
                else if (_gameSpeed > 99) { _speed = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
            }
            // 2. 早送りボタンが押されていたら、_speedを更新
            if (isFastRapidButton() === true) {
                // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                if (_VarNo_Rapid_BattleRate != null && _VarNo_Rapid_BattleRate >= 1 && _VarNo_Rapid_BattleRate < $dataSystem.variables.length) {
                    _speed = Number.parseInt($gameVariables.value(_VarNo_Rapid_BattleRate));
                    // 変数の値に変な値が入っていないか、随時チェック。
                    if (_speed === Infinity || _speed === -Infinity) { _speed = _RAPID_BATTLE_ANIMATIONSPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                    else if (_speed === 0) { _speed = _RAPID_BATTLE_ANIMATIONSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
                    else if (_speed < 1) { _speed = 0; } // 1未満なら0に。
                    else if (_speed > 99) { _speed = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
                }else{
                    _speed = _RAPID_BATTLE_ANIMATIONSPEED_DEFAULT;
                }
            }
            // 3. スキップ中だったら、_speedをスキップ倍率で掛け算する。
            if (isSkipMode() === true) {
                _speed *= getSkipRate();
            }
            // 4. _speed回だけ、更新処理を呼び出す。（体感ゲームスピードが_speed倍になる）
            for (var i = 2; i < _speed; i++) {
                this.updateMain();
            }
            // merusaiaによる追加行、終。

            this.updateFlash();
            this.updateScreenFlash();
            this.updateHiding();
            Sprite_Animation._checker1 = {};
            Sprite_Animation._checker2 = {};
        }
    };
    // Tachiさんによる敵スプライト高速化。敵の状態異常付加・解除や、倒れエフェクトなどが高速化される（？）。敵全体攻撃の爽快感に重要（？）。
    var _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function () {               // 元メソッドにreturnはないよ。
        if(_isNoChangeSpeed_inThisPlugin === true){              // このプラグインのスピード変更を禁止するなら、
            _Sprite_Enemy_update.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            Sprite_Battler.prototype.update.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
            if (this._enemy) {

                this.updateEffect();

                // // Tachiさんによる追加行、始まり。ここの4行が追加されている。高速モード時は戦闘エフェクトも高速化。まぁ…同じですよね。ただしここは三倍。
                // if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){
                //     this.updateEffect(); // ここまでだと２倍
                //     this.updateEffect(); // ここまでだと３倍
                // }
                // // Tachiさんによる追加行、終。

                // merusaiaの追加行は下。
                // 1. 戦闘スプライトスピードのデフォルトは2。戦闘スピード1-9が設定してあれば、それに3を割ったもの。
                var _speed = _BATTLE_ENEMYSPEED_DEFAULT;
                // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                if (_VarNo_BattleSpeed != null && _VarNo_BattleSpeed >= 1 && _VarNo_BattleSpeed < $dataSystem.variables.length) {
                    var _gameSpeed = $gameVariables.value(_VarNo_BattleSpeed);
                    _speed = Number.parseInt(_gameSpeed / 3);
                    // 変数の値に変な値が入っていないか、随時チェック。
                    if (_gameSpeed === Infinity || _gameSpeed === -Infinity) { _speed = _BATTLE_ENEMYSPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                    else if (_gameSpeed === 0) { _speed = _BATTLE_ENEMYSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
                    else if (_gameSpeed === 5) { _speed = _BATTLE_ENEMYSPEED_DEFAULT; } // 5が入っていたら、デフォルトスピードで。
                    else if (_gameSpeed < 1) { _speed = 0; } // 1未満なら0に。
                    else if (_gameSpeed > 99) { _speed = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
                }
                // 2. 早送りボタンが押されていたら、_speedを更新
                if (isFastRapidButton() === true) {
                    // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                    if (_VarNo_Rapid_BattleRate != null && _VarNo_Rapid_BattleRate >= 1 && _VarNo_Rapid_BattleRate < $dataSystem.variables.length) {
                        _speed = Number.parseInt($gameVariables.value(_VarNo_Rapid_BattleRate));
                        // 変数の値に変な値が入っていないか、随時チェック。
                        if (_speed === Infinity || _speed === -Infinity) { _speed = _RAPID_BATTLE_ENEMYSPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                        else if (_speed === 0) { _speed = _RAPID_BATTLE_ENEMYSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピード(2倍)で。
                        else if (_speed < 1) { _speed = 0; } // 1未満なら0に。
                        else if (_speed > 99) { _speed = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
                    }else{
                        _speed = _RAPID_BATTLE_ENEMYSPEED_DEFAULT;
                    }
                }
                // 3. スキップ中だったら、_speedをスキップ倍率で掛け算する。
                if (isSkipMode() === true) {
                    _speed *= getSkipRate();
                }
                // 4. _speed回だけ、更新処理を呼び出す。（体感ゲームスピードが_speed倍になる）
                for (var i = 2; i < _speed; i++) {
                    this.updateEffect();
                }
                // merusaiaによる追加行、終。


                this.updateStateSprite(); // デフォルトソースの最後の一行。ステートのスプライトを更新。
            }
        }
    };
    // 武器モーションアニメ高速化。サイドビュー時は、この倍率が、通常攻撃時の爽快感にまずまず影響する。
    var _Sprite_Weapon_animationWait = Sprite_Weapon.prototype.animationWait;
    Sprite_Weapon.prototype.animationWait = function () {        // 元メソッドは待ち回数の整数を返すよ。
        if(_isNoChangeSpeed_inThisPlugin === true){              // このプラグインのスピード変更を禁止するなら、
            return _Sprite_Weapon_animationWait.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            // // Tachiさんによる追加は以下の一行。高速モード時は4倍。デフォルトは return 12;のみ。
            // if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){return 3;}else{return 12;}

            // merusaiaの追加行は下。
            // 1. 武器モーションスピードのデフォルトは1。ここが早いとサイドビューのモーションが見れない。戦闘スピード1-9が設定してあれば、それに4を割ったもの。
            var _speed = 1;
            // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
            if (_VarNo_BattleSpeed != null && _VarNo_BattleSpeed >= 1 && _VarNo_BattleSpeed < $dataSystem.variables.length) {
                var _gameSpeed = $gameVariables.value(_VarNo_BattleSpeed);
                _speed = Number.parseInt(_gameSpeed / 4);
                // 変数の値に変な値が入っていないか、随時チェック。
                if (_gameSpeed === Infinity || _gameSpeed === -Infinity) { _speed = _BATTLE_MOTIONSPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                else if (_gameSpeed === 0) { _speed = _BATTLE_MOTIONSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
                else if (_gameSpeed === 5) { _speed = _BATTLE_MOTIONSPEED_DEFAULT; } // 5が入っていたら、デフォルトスピードで。
                else if (_gameSpeed < 1) { _speed = 1; } // 1未満なら1に。
                else if (_gameSpeed > 99) { _speed = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
            }
            // 2. 早送りボタンが押されていたら、_speedを更新
            if (isFastRapidButton() === true) {
                // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                if (_VarNo_Rapid_BattleRate != null && _VarNo_Rapid_BattleRate >= 1 && _VarNo_Rapid_BattleRate < $dataSystem.variables.length) {
                    _speed = Number.parseInt($gameVariables.value(_VarNo_Rapid_BattleRate));
                    // 変数の値に変な値が入っていないか、随時チェック。
                    if (_speed === Infinity || _speed === -Infinity) { _speed = _RAPID_BATTLE_MOTIONSPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                    else if (_speed === 0) { _speed = _RAPID_BATTLE_MOTIONSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
                    else if (_speed < 1) { _speed = 1; } // 1未満なら1に。
                    else if (_speed > 99) { _speed = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
                }else{
                    _speed = _RAPID_BATTLE_MOTIONSPEED_DEFAULT;
                }
            }
            // 3. スキップ中だったら、_speedをスキップ倍率で掛け算する。
            if (isSkipMode() === true) {
                _speed *= getSkipRate();
            }
            // 4. _speed回だけ、12を割る。
            var _waitNum = 12 / Math.max(1, _speed); // 1～_speedにすることで、ゼロ割を防いでいる。
            if (_waitNum < 1) _waitNum = 1;
            return _waitNum; // 元メソッドは待ち回数の整数を返すよ。
            // merusaiaによる追加行、終。
        }
    };
    // アクターステートスピード高速化。味方の状態異常付加・解除や、倒れエフェクトなどが高速化される。これは全体攻撃の爽快感に重要。
    var _Sprite_Actor_motionSpeed = Sprite_Actor.prototype.motionSpeed;
    Sprite_Actor.prototype.motionSpeed = function () {           // 元メソッドは待ち回数の整数を返すよ。
        if(_isNoChangeSpeed_inThisPlugin === true){              // このプラグインのスピード変更を禁止するなら、
            return _Sprite_Actor_motionSpeed.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            // // Tachiさんによる追加は以下の一行。高速モード時は4倍。デフォルトは return 12;のみ。
            // if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){return 3;}else{return 12;}

            // merusaiaの追加行は下。
            // 1. アクターステートスピードのデフォルトは3。個人的に、ここは、ツクールのデフォルトの1でもいいと思う（ほんと？ 要検証）。
            //    戦闘スピード1-9が設定してあれば、それに2を割ったもの。
            var _speed = _BATTLE_MOTIONSPEED_DEFAULT;
            // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
            if (_VarNo_BattleSpeed != null && _VarNo_BattleSpeed >= 1 && _VarNo_BattleSpeed < $dataSystem.variables.length) {
                var _gameSpeed = $gameVariables.value(_VarNo_BattleSpeed);
                _speed = Number.parseInt(_gameSpeed / 2);
                // 変数の値に変な値が入っていないか、随時チェック。
                if (_gameSpeed === Infinity || _gameSpeed === -Infinity) { _speed = _BATTLE_MOTIONSPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                else if (_gameSpeed === 0) { _speed = _BATTLE_MOTIONSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
                else if (_gameSpeed === 5) { _speed = _BATTLE_MOTIONSPEED_DEFAULT; } // 5が入っていたら、デフォルトスピードで。
                else if (_gameSpeed < 1) { _speed = 1; } // 1未満なら1に。
                else if (_gameSpeed > 99) { _speed = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
            }
            // 2. 早送りボタンが押されていたら、_speedを更新
            if (isFastRapidButton() === true) {
                // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                if (_VarNo_Rapid_BattleRate != null && _VarNo_Rapid_BattleRate >= 1 && _VarNo_Rapid_BattleRate < $dataSystem.variables.length) {
                    _speed = Number.parseInt($gameVariables.value(_VarNo_Rapid_BattleRate));
                    // 変数の値に変な値が入っていないか、随時チェック。
                    if (_speed === Infinity || _speed === -Infinity) { _speed = _RAPID_BATTLE_MOTIONSPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                    else if (_speed === 0) { _speed = _RAPID_BATTLE_MOTIONSPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
                    else if (_speed < 1) { _speed = 1; } // 1未満なら1に。
                    else if (_speed > 99) { _speed = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
                }else{
                    _speed = _RAPID_BATTLE_MOTIONSPEED_DEFAULT;
                }
            }
            // 3. スキップ中だったら、_speedをスキップ倍率で掛け算する。
            if (isSkipMode() === true) {
                _speed *= getSkipRate();
            }
            // 4. _speed回だけ、12を割る。
            var _waitNum = 12 / Math.max(1, _speed); // 1～_speedにすることで、ゼロ割を防いでいる。;
            if (_waitNum < 1) _waitNum = 1;
            return _waitNum; // 元メソッドは待ち回数の整数を返すよ。
            // merusaiaによる追加行、終。
        }
    };
    // 戦闘中キャラクターの移動と動作速度。アクターが、前に出る動作、後ろに下がる動作、息継ぎ、全てを担う。ここの高速化は、アクターの行動の爽快感に重要。だが、息継ぎが早いと変。
    var _Sprite_Actor_updateMove = Sprite_Actor.prototype.updateMove;
    Sprite_Actor.prototype.updateMove = function () {            // 元メソッドにreturnはないよ。
        if(_isNoChangeSpeed_inThisPlugin === true){              // このプラグインのスピード変更を禁止するなら、
            _Sprite_Actor_updateMove.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            var bitmap = this._mainSprite.bitmap;
            if (!bitmap || bitmap.isReady()) {
                Sprite_Battler.prototype.updateMove.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
                Sprite_Battler.prototype.updateMove.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。

                // // Tachiさんによる追加行、始まり。ここの4行が追加されている。高速モード時は戦闘エフェクトも高速化。まぁ…同じですよね。ただしここは3倍。
                // if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){
                //     Sprite_Battler.prototype.updateMove.call(this); // ここまでだと２倍
                //     Sprite_Battler.prototype.updateMove.call(this); // ここまでだと３倍
                // }
                // // Tachiさんによる追加行、終わり。

                // merusaiaの追加行は下。
                // 1. スピードのデフォルトは1。個人的には、1.5の間がほしい。ツクールデフォルトの1か、ヘイストみたいな倍速の2しかないのは痛い。
                //    戦闘スピード1-9が設定してあれば、それに1を割ったもの。
                var _speed = _BATTLE_MOVESPEED_DEFAULT;
                // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                if (_VarNo_BattleSpeed != null && _VarNo_BattleSpeed >= 1 && _VarNo_BattleSpeed < $dataSystem.variables.length) {
                    var _gameSpeed = $gameVariables.value(_VarNo_BattleSpeed);
                    _speed = Number.parseInt(_gameSpeed / 4);
                    // 変数の値に変な値が入っていないか、随時チェック。
                    if (_gameSpeed === Infinity || _gameSpeed === -Infinity) { _speed = _BATTLE_MOVESPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                    else if (_gameSpeed === 0) { _speed = _BATTLE_MOVESPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
                    else if (_gameSpeed === 5) { _speed = _BATTLE_MOVESPEED_DEFAULT; } // 5が入っていたら、デフォルトスピードで。
                    else if (_gameSpeed < 1) { _speed = 0; } // 1未満なら0に。
                    else if (_gameSpeed > 9) { _speed = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
                }
                // 2. 早送りボタンが押されていたら、_speedを更新
                if (isFastRapidButton() === true) {
                    // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                    if (_VarNo_Rapid_BattleRate != null && _VarNo_Rapid_BattleRate >= 1 && _VarNo_Rapid_BattleRate < $dataSystem.variables.length) {
                        _speed = Number.parseInt($gameVariables.value(_VarNo_Rapid_BattleRate));
                        // 変数の値に変な値が入っていないか、随時チェック。
                        if (_speed === Infinity || _speed === -Infinity) { _speed = _RAPID_BATTLE_MOVESPEED_DEFAULT; } // 無限大なら、デフォルトスピードで。
                        else if (_speed === 0) { _speed = _RAPID_BATTLE_MOVESPEED_DEFAULT; } // 0が入っていたら、デフォルトスピードで。
                        else if (_speed < 1) { _speed = 0; } // 1未満なら0に。
                        else if (_speed > 99) { _speed = 99; } // 100以上になっても意味ないと思う。100倍なんて目に見えないし、updateを100回呼んでも処理は高速化されない。
                    }else{
                        _speed = _RAPID_BATTLE_MOVESPEED_DEFAULT;
                    }
                }
                // 3. スキップ中だったら、_speedをスキップ倍率で掛け算する。
                if (isSkipMode() === true) {
                    _speed *= getSkipRate();
                }
                // 4. _speed回だけ、更新処理を呼び出す。（体感ゲームスピードが_speed倍になる）
                for (var i = 2; i < _speed; i++) {
                    Sprite_Battler.prototype.updateMove.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
                }
                // merusaiaによる追加行、終。
            }
        }
    };
    var Scene_Map_isFastForward = Scene_Map.prototype.isFastForward;
    /**  Scene_Map.prototype.isFastForwardの上書き。早送りモードに移行する条件の追加。
      * ・tachiさんによって、デフォルトの決定ボタン押しっぱなしだけでなく、shiftボタン/タッチ画面が押しっぱなし、が追加されています。
      * ・merusaiaによって、各種ボタン（決定ボタン/shiftボタン）の早送りを有効/無効にする機能が追加されています。
      * 
      * ※プラグインパラメータ「スピード変更を禁止するか」がONだと、上記の効果は無効となり、元のメソッドを呼び出しますので、注意してください。
    */
    Scene_Map.prototype.isFastForward = function () {            // 元メソッドは早送り中かどうかを返すよ。
        if(_isNoChangeSpeed_inThisPlugin === true){              // このプラグインのスピード変更を禁止するなら、
            return  Scene_Map_isFastForward.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            // tachiさんのデフォルトは次の二行。
            //   return (  $gameMap.isEventRunning() && !SceneManager.isSceneChanging() &&
            //            (Input.isLongPressed('ok') || Input.isLongPressed('shift') || TouchInput.isLongPressed()));

            // merusaiaが、マップ中、タッチ、に分けて、わかりやすく整理して変更。
            var _isFastForwardButtonPressed = false;
            // マップ中で（シーン切替中ではなくて）、かつ、
            // 各種ボタンの早送りが有効で、かつそのボタンが長押しされていたら、早送りモードとする。
            _isFastForwardButtonPressed =
                ($gameMap.isEventRunning() && !SceneManager.isSceneChanging() &&
                    (
                        (_isRapid_BattleButton_ok === true && Input.isLongPressed('ok'))      // 決定ボタン早送りモードが有効＆長押し
                        || // または
                        (_isRapid_BattleButton_shift === true && Input.isLongPressed('shift')) // ダッシュボタン早送りモードが有効＆長押し
                        || // または
                        TouchInput.isLongPressed()                                             // タッチ画面の長押し
                    )
                );
            return _isFastForwardButtonPressed; // 元メソッドは早送り中かどうかを返すよ。
        }
    };
    // =============================================================================
    // Tachiさんによる、早送りモード時のゲームスピード高速化、終。
    // =============================================================================



    // 吸収技にもダメージエフェクトをつける。
    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function (target) {      // 元メソッドにreturnはないよ。
        if(_isOnEffectDamageDrain === false){              // このプラグインで吸収技にもダメージエフェクトをつけるがOFFなら、
            _Game_Action_apply.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            var result = target.result();
            this.subject().clearResult();
            result.clear();
            result.used = this.testApply(target);
            result.missed = (result.used && Math.random() >= this.itemHit(target));
            result.evaded = (!result.missed && Math.random() < this.itemEva(target));
            result.physical = this.isPhysical();
            //result.drain = this.isDrain(); // 元のソースrpg_objects.jsから、ここだけ変更されているよ。
            if (result.isHit()) {
                if (this.item().damage.type > 0) {
                    result.critical = (Math.random() < this.itemCri(target));
                    var value = this.makeDamageValue(target, result.critical);
                    this.executeDamage(target, value);
                }
                this.item().effects.forEach(function (effect) {
                    this.applyItemEffect(target, effect);
                }, this);
                this.applyItemUserEffect(target);
            }
        }
    };

    // ※コメント
    // クリティカルダメージ率調整（２倍になっているが、コメントしてあるので、デフォルトは３倍）
    //Game_Action.prototype.applyCritical = function(damage) {
    //    return damage * 2; // デフォルトは * 3;
    //};


    // ※コメント
    //// TP制御（バトル開始時の初期値を100にしている。0～100のスキな数字にすることが出来る。デフォルトは、ランダムで0～25位になります。
    //// ※ただし、これを有効にすると、特殊フラグ：「TP持ち越し」がONのキャラも、戦闘開始時にTPをこれにリセットされてしまうので注意！）
    //Game_Battler.prototype.initTp = function() {
    //    //// (デフォルト):0～25のいずれかになる。
    //    this.setTp(Math.randomInt(25));
    //    // (パターンa):初期値は必ず満タンの100から始まる、にする
    //    this.setTp(100);
    //    //// (パターンb):初期値は0～100のどれかで始まる、にする
    //    //this.setTp( Math.floor( Math.random() * 101 ) );
    //};


    // ゲームオーバー制御。追加定義で競合対策済み。
    // ※パラメータで指定した変数番号に代入を行っているので、気をつけてください。
    // ゲームオーバーになった時、デフォルトのゲームオーバーに遷移させず、戦闘不能になったバトルメンバーを全員復活させてシナリオを継続させている。
    var _BattleManager_updateBattleEnd = BattleManager.updateBattleEnd;
    BattleManager.updateBattleEnd = function () {          // 元メソッドにreturnはないよ。
        if(_isOnContinueBattleEnd === false){              // このプラグインで吸収技にもダメージエフェクトをつけるがOFFなら、
            _BattleManager_updateBattleEnd.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            if (this.isBattleTest()) {
                AudioManager.stopBgm();
                SceneManager.exit();                  // なお、バトルテストならそこでシナリオ強制終了（ツクールデフォルト設定））
            } else if ($gameParty.isAllDead()) {
                // 味方キャラが全員戦闘不能になっていたら、この戦闘が負けた時の分岐があるか、ないかを調べる。
                if (this._canLose) {
                    $gameParty.reviveBattleMembers();
                    SceneManager.pop();               // 負けた時の分岐が在る戦闘（負けても大丈夫なボス戦等）だったら、そのまま、シナリオを継続。
                } else {
                    // (a)SceneManager.goto(Scene_Gameover); // デフォルトはゲームオーバーに遷移する（シナリオは継続しない）をコメント
                    // (b)負けた時の分岐が無い戦闘（ランダムエンカウント、もしくはボス戦等）だったら、_SwitchNo_BattleLose(戦闘全滅時にONになるスイッチ番号)をONにして、シナリオ継続。
                    // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                    if (_SwitchNo_BattleLose != null && _SwitchNo_BattleLose >= 1 && _SwitchNo_BattleLose < $dataSystem.switches.length) {
                        $gameSwitches.setValue(_SwitchNo_BattleLose, true);
                    } else {
                        alert('Tachi3: パラメータ「戦闘全滅時にONになるスイッチ番号」に変な値が入ってます。: ' + _SwitchNo_BattleLose);
                    }
                    $gameParty.reviveBattleMembers();
                    SceneManager.pop();
                }
            } else {
                // 味方キャラが一人は生きている、すなわち、戦闘に勝ったと判断する（もしかしたら、麻痺とかで全滅ってのも在るかもしれないが‥そこは要検証かも）
                // 勝った時の分岐が無い戦闘（通常エンカウント、もしくはボス戦等）だったら、_SwitchNo_BattleWin(戦闘全滅時にONになるスイッチ番号)をONにして、シナリオ継続。
                // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                if (_SwitchNo_BattleWin != null && _SwitchNo_BattleWin >= 1 && _SwitchNo_BattleWin < $dataSystem.variables.length) {
                    $gameSwitches.setValue(_SwitchNo_BattleWin, true);
                } else {
                    alert('Tachi3: パラメータ「戦闘勝利時にONになるスイッチ番号」に変な値が入ってます。: ' + _SwitchNo_BattleWin);
                }
                SceneManager.pop();
            }
            this._phase = null;
        }
    };

    // 敵にエンカウントした後の処理。追加定義で競合対策済み。
    // 元のソースから、エンカウント後、戦闘画面にて、自動的にスイッチ3番がオンされるように変更されている。
    // 元のソースから、エンカウント後、戦闘画面にて、自動的に変数5番に最後に戦った敵グループIDが格納されるように変更している。
    // ※イベント戦闘（ボス敵）はこのイベントは呼ばれないので、これらの変数を更新したい場合は、敵グループイベントで処理してください。
    var _Game_Player_executeEncounter = Game_Player.prototype.executeEncounter;
    Game_Player.prototype.executeEncounter = function () {   // 元メソッドは、エンカウントしたかを返すよ。
        if(_isOnSwitchBattleEncount === false){              // このプラグインで吸収技にもダメージエフェクトをつけるがOFFなら、
            return  _Game_Player_executeEncounter.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            var _ret = false; // 元メソッドは、エンカウントしたかを返すよ。
            if (!$gameMap.isEventRunning() && this._encounterCount <= 0) {
                this.makeEncounterCount();
                var troopId = this.makeEncounterTroopId();
                if ($dataTroops[troopId]) {
                    // スイッチ番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                    if (_SwitchNo_RandomEncount != null && _SwitchNo_RandomEncount >= 1 && _SwitchNo_RandomEncount < $dataSystem.switches.length) {
                        $gameSwitches.setValue(_SwitchNo_RandomEncount, true);  // 元のソースから、追加。_SwitchNo_RandomEncount(ランダムエンカウント時にONになるスイッチ番号)をオン
                    } else {
                        alert('Tachi3: パラメータ「ランダムエンカウント時にONになるスイッチ番号」に変な値が入っています。: ' + _SwitchNo_RandomEncount);
                    }
                    // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                    if (_VarNo_RandomEncountTroopID != null && _VarNo_RandomEncountTroopID >= 1 && _VarNo_RandomEncountTroopID < $dataSystem.variables.length) {
                        $gameVariables.setValue(_VarNo_RandomEncountTroopID, troopId); // merusaiaが追加。_VarNo_RandomEncountTroopID(Tachi用:最後に戦った敵グループIDを格納する変数番号)を更新。
                    } else {
                        alert('Tachi3: パラメータ「ランダムエンカウント敵グループIDを格納する変数番号」に変な値が入っています。: ' + _VarNo_RandomEncountTroopID);
                    }
                    BattleManager.setup(troopId, true, false);
                    BattleManager.onEncounter();
                    _ret = true; // エンカウントした
                } else {
                    _ret = false; // エンカウントしなかった
                }
            } else {
                _ret = false; // エンカウントしなかった
            }
            return _ret; // 元メソッドは、エンカウントしたかを返すよ。
        }
    };

    // =================================================================================
    // 身代わり時(substitute:代わり、代替という意味)の条件変更
    // 特殊フラグ：身代わり時で、味方をかばう際の条件の変更、効果音を追加しています。
    // =================================================================================
    // かばわれる側（target）の身代わり条件の変更を、追加定義。競合対策済。
    var _BattleManager_checkSubstitute = BattleManager.checkSubstitute;
    BattleManager.checkSubstitute = function (target) {
        // (a)デフォルトはこれ一行。idDying()がHP25％以下（this.isAlive() && this._hp < this.mhp / 4）。で、かつ、相手の攻撃が必中でない時。
        // return target.isDying() && !this._action.isCertainHit(); // HP25％以下で生きていて、かつ必中攻撃じゃなかったらかばう。

        // (b)Tachiさんの元のやつはこれ。idDying()が消えたので、必中じゃなかったら、確実にかばう。
        //return !this._action.isCertainHit(); // 必中じゃなかったらtrue。つまり、必中攻撃だったらfalseで、かばえない。

        // (a)や(b)では、以下の点において、不便。
        // ・対象を見ていない。
        //     つまり、対象が「自分自身」の、MP割合ダメージを受けるHP回復スキル（例えば使用効果に「MP-50%」と書いたHP回復スキル）でも、
        //    「かばった味方が代わりにHPを回復し、MPダメージを受ける」。なんか変。
        //     →  対象を相手側だけに絞ったほうが良いかも。一旦保留。
        // ・ステートを見ていない。
        //     反撃率が高いステート中、回避率が高いステート中でも、反撃率が低い・回避率が低い仲間に、かばわれてしまう。がっかり。
        //     →  かばられる側が特定のステートIDだったら、かばわない、て条件付けがいるかも。一旦保留。
        // ・かばわれる対象の回避率が飛躍的に高い状態（例えば100％回避ステート中）でも、かばう。
        //     自分より回避率が低い味方にかばわれると、ある意味がっかり‥かも。
        //     →  かばられる側の回避率が一定以上だったら、かばわない、て条件付けがいるかも。一旦保留。
        // ・防御力・魔法防御力を見ていない。
        //     つまり、かばう方がダメージが大きくても、かばう。自分より守備力が低い仲間にかばわれると、ある意味残念‥かも。
        //     →  かばられる側の防御力や魔法防御力 - かばう側の防御力や魔法防御力が一定以上だったら、かばわない、て条件付けがいるかも。一旦保留。
        // ・HPを見ていない。
        //     かばわれる側のHP > かばう側のHP でも、かばってかばう側死んでしまう。まぁ、自己犠牲の精神もなんとやら…ですが、なんだかアホくさい…。
        //     →  かばう側(target.hp)・かばわれる側()の残りHPを見るオプションを付ける（パラメータで変更可能）
        // ・MPを見ていない。
        //     これは残りMPが受けるダメージに関係しているシステムでしか使わないと思うが、
        //     HPが少なくMPが高い仲間はその攻撃を受けても無事なのに、
        //     MPが少ない味方がかばうと、代わりに大ダメージを受けて倒れてしまう。なんだか残念…。
        //     →  かばう側・かばわれる側のMPを見るオプションを付ける（パラメータで変更可能）

        // 以下がデフォルトからの変更点。
        // パラメータ「身代わり条件を変更するか」がfalseだったら、デフォルトのものを呼び出すよ。
        if(_isChangeDefault_Migawari === false){
            
            // エラー: このプラグインをONにしているとき、ここでなぜかtargetがundefinedになってしまっており .isDying が呼び出されてしまいます）
            return _BattleManager_checkSubstitute.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            // かばわないといけない状況か（targetがピンチか）
            var _isTargetPinch = false;
            // 条件1. 必中攻撃じゃなかったら（スキルの命中率が「必中」だと、どうあがいても、かばえない）
            if (!this._action.isCertainHit()) {
                // 条件2. かばわれる側(target)が生きていて、HPが指定％以下だったら、
                if (target != null && target.isAlive() && target._hp <= target.mhp * _Migawawri_Sareru_MaxHPPercent / 100) {
                    // 条件2. かばわれる側(target)のMPが指定％以下だったら、
                    if (target._mp <= target.mmp * _Migawawri_Sareru_MaxMPPercent / 100) {
                        _isTargetPinch = true;
                    }
                }
            }
            return _isTargetPinch; // かばわないといけない状況か（targetがピンチか）を返す。
        }
    };
    // かばう側（substitute）の身代わりする条件の変更を、追加定義。競合対策済。
    var _BattleManager_applySubstitute = BattleManager.applySubstitute;
    BattleManager.applySubstitute = function (target) {
        // 以下がrpg_managers.jsに書いてあるデフォルト。がばられる側の身代わり条件がtrueなら（1行目）、
        // かばう側（パーティ番号1番、2番、..の順）は自分が死ぬまで１００％かばう。
        // if (this.checkSubstitute(target)) {
        //     var substitute = target.friendsUnit().substituteBattler();
        //     if (substitute && target !== substitute) {
        //         this._logWindow.displaySubstitute(substitute, target);
        //         return substitute;
        //     }
        // }
        // return target;

        // 以下がデフォルトからの変更点。
        // パラメータ_isChangeDefault_Migawariがfalseだったら、デフォルトのものを呼び出すよ。
        if(_isChangeDefault_Migawari === false){
            return _BattleManager_applySubstitute.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        }else{
            // 元メソッドの返り値の、ダメージを受けるバトラー。デフォルトは、かばわれる側（target）
            var _DamageHitBattler = target;
            // かばう側（パーティ番号1番、2番、..の順）は自分のHP率・MP率が一定以下で、かつ乱数が一定以下であれば、かばう。1番がかばわないなら、2番もかばう可能性がある。
            if (target != null && target.friendsUnit() != null && target.friendsUnit().substituteBattler() != null && this.checkSubstitute(target)) {
                // ここから、かばう側（substitute）の条件
                var substitute = target.friendsUnit().substituteBattler(); // 制御フラグ:身代わりがついている、パーティ番号が1番若い仲間
                // 制御フラグ:身代わりがついている仲間を、パーティ番号が若い順から、１つずつ見ていく。
                var _isDamagedCharaActor = target.isActor();
                var _members = target.isActor() ? $gameParty.members() : $gameTroop.members();
                if(_members != null){
                    for (var i = 0; i < _members.length; i++) {
                        if (_members[i]!= null && _members[i].isSubstitute()) {
                            substitute = _members[i]; // 制御フラグ:身代わりがついている、パーティ番号が i 番目に若い仲間。

                            // 条件1. かばう側(substitute)が生きていて、HPが指定％以上だったら、
                            if (substitute.isAlive() && substitute._hp >= substitute.mhp * _Migawawri_Suru_MinHPPercent / 100) {
                                // 条件2. かばう側(substitute)のMPが指定％以上だったら、
                                if (substitute._mp >= substitute.mmp * _Migawawri_Suru_MinMPPercent / 100) {
                                    // 条件3. 乱数が一定以下だったら、
                                    if (Math.random() * 100 <= _Migawawri_Suru_ActPercent) {
                                        // ダメージを受けるバトラーを、かばう側とする
                                        _DamageHitBattler = substitute;

                                        // かばわれた・かばったバトラーのキャラID(アクターID、または敵キャラID）を、パラメータで指定した変数に格納
                                        if(_isDamagedCharaActor){  // 敵なのか、味方なのかで、格納する変数を分岐
                                            // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                                            if (_VarNo_Migawari_Sareta_AcorID != null && _VarNo_Migawari_Sareta_AcorID >= 1 && _VarNo_Migawari_Sareta_AcorID < $dataSystem.variables.length) {
                                                $gameVariables.setValue(_VarNo_Migawari_Sareta_AcorID, substitute.actorId());
                                            } else {
                                                alert('Tachi3: パラメータ「身代わりされたアクターIDを格納する変数番号」に変な値が入っています。: ' + _VarNo_Migawari_Sareta_AcorID);
                                            }
                                            // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                                            if (_VarNo_Migawari_Shita_AcorID != null && _VarNo_Migawari_Shita_AcorID >= 1 && _VarNo_Migawari_Shita_AcorID < $dataSystem.variables.length) {
                                                $gameVariables.setValue(_VarNo_Migawari_Shita_AcorID, target.actorId());
                                            } else {
                                                alert('Tachi3: パラメータ「身代わりしたアクターIDを格納する変数番号」に変な値が入っています。: ' + _VarNo_Migawari_Shita_AcorID);
                                            }
                                            
                                            // 成功時、パラメータで指定したコモンイベント番号を実行する。
                                            var _commonEventNo = _CommonEventNo_Migawari_Success_Actor;
                                            if (_commonEventNo != null && _commonEventNo >= 1 && _commonEventNo < $dataCommonEvents.length) {
                                                this.setupChild($dataCommonEvents[_CommonEventNo_Migawari_Success_Actor].list, 0); // コモンイベントを呼び出します。
                                            } else {
                                                alert('Tachi3: パラメータ「味方の身代わり成功時に呼び出すコモンイベント番号」に変な値が入っています。: ' + _CommonEventNo_Migawari_Success_Actor);
                                            }
                                        }else{
                                            // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                                            if (_VarNo_Migawari_Sareta_EnemyID != null && _VarNo_Migawari_Sareta_EnemyID >= 1 && _VarNo_Migawari_Sareta_EnemyID < $dataSystem.variables.length) {
                                                $gameVariables.setValue(_VarNo_Migawari_Sareta_EnemyID, substitute.enemyId());
                                            } else {
                                                alert('Tachi3: パラメータ「身代わりされた敵キャラIDを格納する変数番号」に変な値が入っています。: ' + _VarNo_Migawari_Sareta_EnemyID);
                                            }
                                            // 変数番号を格納している、パラメータに変な値が入っていないか、随時チェック。
                                            if (_VarNo_Migawari_Shita_EnemyID != null && _VarNo_Migawari_Shita_EnemyID >= 1 && _VarNo_Migawari_Shita_EnemyID < $dataSystem.variables.length) {
                                                $gameVariables.setValue(_VarNo_Migawari_Shita_EnemyID, target.enemyId());
                                            } else {
                                                alert('Tachi3: パラメータ「身代わりした敵キャラIDを格納する変数番号」に変な値が入っています。: ' + _VarNo_Migawari_Shita_EnemyID);
                                            }

                                            // 成功時、パラメータで指定したコモンイベント番号を実行する。
                                            var _commonEventNo = _CommonEventNo_Migawari_Success_Enemy;
                                            if (_commonEventNo != null && _commonEventNo >= 1 && _commonEventNo < $dataCommonEvents.length) {
                                                this.setupChild($dataCommonEvents[_CommonEventNo_Migawari_Success].list, 0); // コモンイベントを呼び出します。
                                            } else {
                                                alert('Tachi3: パラメータ「敵の身代わり成功時に呼び出すコモンイベント番号」に変な値が入っています。: ' + _CommonEventNo_Migawari_Success_Enemy);
                                            }
                                        }
                                        break; // かばう仲間が決まったので、forループを抜ける
                                    }
                                }
                            }

                        }
                    }
                }
                // かばう側とかばわれる側が違えば、「～はかばった」みたいな戦闘ログメッセージを表示して、かばう側のGame_Battlerを返す。
                if (substitute && target !== substitute) {
                    this._logWindow.displaySubstitute(substitute, target);
                }
            }
            // ダメージを受けるバトラーを返す。
            return _DamageHitBattler;
        }
    };

    // 身代わり時に音を鳴らす（Reflection音を鳴らしているだけ。これ、個人的には結構重要だと思う。誰がダメージを受けたか、わかりやすい。）
    var _Tachi_Game_Battler_performSubstitute = Game_Battler.prototype.performSubstitute;// 元メソッドにreturnはないよ。
    Game_Battler.prototype.performSubstitute = function (target) {    // 元メソッドにreturnはないよ。
        _Tachi_Game_Battler_performSubstitute.apply(this, arguments); // 上書き後メソッドの最初に、上書き前メソッドを呼び出す。
        // この行から、上書き後のメソッドの処理を実行。 
        SoundManager.playReflection(); // Reflectionの音を鳴らす。なぜこの効果音だけ専用メソッドがあるのかは謎。要調査かも。
    };
    // =================================================================================
    // 身代わり時の変更、終
    // =================================================================================

    
    //=========================================================================
    // Window_Messge
    //=========================================================================
    //  エスケープコマンドを追加定義して、メッセージスピードによって、「\.」や「\|」の待ち時間を動的に変更できるようにしています。
    //  ※mankind_roboさんのMKR_ControlCharacterEx.jsを参考にしています。感謝。(merusaiaが追記)
    var _Window_Message_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter; // 元メソッドにreturnはないよ。
    Window_Message.prototype.processEscapeCharacter = function (code, textState) {
        // メッセージ中の文字列に、「\.」や「\|」がないか調べる。
        var _waitFrameNum = (Number.parseInt(_WaitPeriodDef) || 0); // 早送りスピードで早くしたい場合はこうしてね→ // var _waitFrameNum = (Number.parseInt(_WaitPeriodDef/getMessageWaitEscapeCharacterSpeed()) || 0);
        switch (code) {
            case '.':
                if(isSkipMode() === false){                                   // スキップ中だと、待ちません。
                    _waitFrameNum = ConvertEscapeCharacters(_WaitPeriodDef);  // 制御文字\N[n]も、変数値にします。
                    // 以下、デバッグ用。制御文字\N[n]も、変数値にきちんと変換されているかどうか。
                    if(_isDebugMode()){
                       console.log('_WaitPeriodDef:'+_WaitPeriodDef +' → 変換後:'+_waitFrameNum);
                    }
                    _waitFrameNum = (Number.parseInt(_waitFrameNum)  || 0); // NaNや数値にならない場合も、0になります。±Infinityだけ例外処理が必要です。
                    if(_waitFrameNum === Infinity || _waitFrameNum === -Infinity) _waitFrameNum = 15; // ±Infinityになる理由は、0割りでもしたのかな。とりあえずデフォルト値にします。
                    this.startWait(_waitFrameNum); // 独自の方法で、このパラメータ分だけウェイトするよ（元のツクールもともとの待ち時間は無視するよ）
                }
                break;
            case '|':
                if(isSkipMode() === false){                                   // スキップ中だと、待ちません。
                    _waitFrameNum = ConvertEscapeCharacters(_WaitLineDef);    // 制御文字\N[n]も、変数値にします。
                    _waitFrameNum = (Number.parseInt(_waitFrameNum)  || 0); // NaNや数値にならない場合も、0になります。±Infinityだけ例外処理が必要です。
                    if(_waitFrameNum === Infinity || _waitFrameNum === -Infinity) _waitFrameNum = 60; // ±Infinityになる理由は、0割りでもしたのかな。とりあえずデフォルト値にします。
                    this.startWait(ConvertEscapeCharacters(Number.parseInt(_WaitLineDef) ));   // 独自の方法で、このパラメータ分だけウェイトするよ（元のツクールもともとの待ち時間は無視するよ）
                }
                break;
            default:
                // それ以外の制御文字が付いている場合は、元のメソッドを呼び出すよ。（追加定義するけど、消さない。これ、すごい競合対策だよ）
                _Window_Message_processEscapeCharacter.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
                break;
        }
    };
    // 以下、メッセージ表示スピードの調整です。
    // ※T.AkatsukiさんのUTA_MessageSkip.jsを参考にしています。感謝。
    // スキップ中だけ、メッセージの文字列を即全表示します。
    var _Window_Message_updateShowFast = Window_Message.prototype.updateShowFast;
    Window_Message.prototype.updateShowFast = function() { // 元メソッドにreturnはないよ。
        _Window_Message_updateShowFast.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        // ここから、メソッドの追加処理。スキップ中は、すぐに全表示してね。
        if(isSkipMode() === true){
            this._showFast = true;
            this._pauseSkip = true;
        }
    };
    // 次のメッセージ送りの入力
    var _Window_Message_updateInput = Window_Message.prototype.updateInput;
    Window_Message.prototype.updateInput = function() {   // 元のメソッドのreturnは複雑だから、返り値をそのまま使うよ。
        var ret = _Window_Message_updateInput.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        // ここから、メソッドの追加処理。メッセージ送りの入力待ちの場合でも、スキップ中はそれを飛ばしてどんどん全表示してね。
        if(this.pause && isSkipMode() === true){
            this.pause = false;
            if (!this._textState) {
                this.terminateMessage();
            }
            return true; // 元のメソッドのreturnは複雑だけど、メッセージをすっ飛ばす場合は返り値はtrueだよ。
        }
        return ret; // 元のメソッドのreturnは複雑だから、返り値をそのまま使うよ。
    };
    //-----------------------------------------------------------------------------
    // Window_ScrollText
    //-----------------------------------------------------------------------------
    // スキップ中は、スクロールメッセージは一瞬で流れるようにしてね。
    var Window_ScrollText_scrollSpeed = Window_ScrollText.prototype.scrollSpeed;
    Window_ScrollText.prototype.scrollSpeed = function() {  // 元メソッドはスクロールスピードを返すよ。
        var ret = Window_ScrollText_scrollSpeed.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        // ここからが、メソッドの追加処理。スキップ中だったら、スクロールスピードを100倍に上げてね。
        if(isSkipMode() === true){
            ret *= 100;
        }
        return ret; // 元メソッドはスクロールスピードを返すよ。
    };
    //-----------------------------------------------------------------------------
    // Window_BattleLog
    //-----------------------------------------------------------------------------
    // スキップ中は、バトルログも一瞬で流れるようにしてね。
    var _Window_BattleLog_messageSpeed = Window_BattleLog.prototype.messageSpeed;
    Window_BattleLog.prototype.messageSpeed = function() {   // 元メソッドはバトルログ表示後の待ち時間を返すよ。
        var ret = _Window_BattleLog_messageSpeed.apply(this, arguments); // 元のメソッドを呼び出すよ。.call(this, 引数1, 引数2, ...)よりapplyの方がコピペミスを防げていいよ。
        // ここからが、メソッドの追加処理。スキップ中だったら、バトルログの待ち時間を1フレームにしてね。
        if(isSkipMode() === true){
            ret = 1;
        }
        return ret; // 元メソッドはバトルログ表示後の待ち時間を返すよ。
    };


    // ================ tachiさん & merusaia追記、終================================================


})();
