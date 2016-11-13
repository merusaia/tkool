//=============================================================================
// Tachi_editByMerusaia.js
//=============================================================================

/*:
 * @plugindesc tachiさんによる、ツクールのデフォルト機能を様々に変更・拡張できるようにされたプラグインです。※競合に注意してください。
 * @author tachi(edit by merusaia。著作表示はTachiさん)
 *
 * @help 気をつけろ！( ・´ｰ・｀) by Tachiさん
 * 
 *  ※以下、メルサイアが追記
 * 
 * ・ゲームスピード高速化（エンカウントエフェクトなどの高速化）
 * ・高速モードの多様化（shiftボタンや画面タッチ長押しでも高速モードに）
 * ・高速モードの高速化（デフォルトの2倍から、3倍～100倍まで設定可能）
 * ・常時高速モードの追加（プラグインコマンドでON/OFFが可能）
 * ・パラメーター最大値限界突破（デフォルトの力：999などを、99億などに設定可能）
 * ・吸収技にもダメージエフェクトをつける
 * ・かばう（制御フラグ：身代わり）の条件変更
 * 
 * などなど、デフォルトの様々な箇所を改変して使うプラグインです。
 * ユーザさんに極力ストレスが掛からないように、何度もテストプレイをされて調整された後があり、
 * 快適操作に最適化されたTachiさんの高速化ノウハウを即導入できる、有能なプラグインかもしれません。
 * タッチ操作にも対応しています。
 * 
 * 判る範囲内で、一部機能をコメントアウト＆内容の編集＆日本語コメントを追加しています。
 * でも、競合にはほんとうに気をつけてください。。
 * 数多くのメソッドを上書き（※callなどで元メソッドを呼び出す追記ではなく、完全に上書き）しています。でもそうしないと実現できない機能が多い‥。
 * 使う前は、メソッド名チェックをして、他のプラグインと競合していないか確かめて使ってください。
 * 
 * 
 * 【プラグインコマンド】
 * エディタ上で、プラグインコマンド「スキップモードON」、もしくは「SKIPMODE_ON」
 * と書くと、常時高速モードになります。
 * プラグインコマンド「スキップモードOFF」、もしくは「SKIPMODE_OFF」
 * と書くと、元に戻ります。
 * ※常時高速モードとは、高速化されるボタン（決定ボタン・shitボタン・画面タッチ押しっぱなし）を押さなくても、
 * 　ゲームスピードをあっという間に過ぎさせるボタンです。シナリオスキップや戦闘スキップなどに使えるかもしれません。
 * 　高速モード時のスピードとは、別に設定します。
 * ※プラグインコマンドのスペルミスを防ぐため、名前を必ず大文字にしてチェックします。プラグインコマンドの英字表記は、必ず全て大文字にしてください。
 * 
 * 【謝辞】
 * トリアコンタンさん (http://triacontane.blogspot.jp/)さんのIconDescription.jsのソースを参考に使わせていただいてます。感謝！
 * 
 * 【競合について】
 * ・rpg_objects.jsの、Game_Interpreter.prototype.pluginCommandを追記（一度元のメソッドを別の名前にして呼び出し、その後に上書き）しています。
 *    → 上記メソッドを丸ごと上書きしているプラグインとの競合に注意してください。
 * ・他、このプラグインは、丸ごと上書きしているメソッドがあり過ぎて、列挙しにくいです・・・くわしくはそーすをみてくださいm(_ _)m。
 *
 * 【メモ】
 * プラグイン競合スクリプトの書き方：
 *   ・プラグイン作成時は、他のプラグインとの競合に注意が必要です。
 *   　　競合とは、同名メソッド（例えばオプション項目を追加する、Window_Options.prototype.addGeneralOptions = function()など）
 *　　　　を上書きするプラグインの下に、「まったくおなじ名前の」同名メソッドを上書きするプラグインが定義されている場合、
 *　　　　複数のプラグインをONにしても、「一番下に定義されているプラグインの同名メソッドしか機能しない」ことにより、
 *       ゲーム中に意図しない動作を引き起こすことです。
 *   ・出来る限り競合を避けるためにも、以下の様な、競合に強い書き方をしましょう。
 *       同名メソッドを上書きする前に、新規メソッドに代入し、
 *       その中で、新規メソッド.call(this)や、新規メソッド.apply(this, argments)を呼ぶことで、
 *       複数のプラグインをONにしても、「全てのプラグインの同名メソッドが順に実行される」ように出来ます。
 *   ・ただし、この方法は、「元のメソッドに処理を追加する」場合にしか使えません。
 *       元のメソッドの処理の一部を「削除する」場合や「内容そのものを置き換える」場合は、元のメソッドを呼ぶわけにはいかないので。。。
 *       なにかいい方法を知っている方、教えてください・・・m(_ _)m。
 *
 *   ・記述例：　Window_Options_addGeneralOptionsで、オプション項目を追加する同名メソッドを上書きする場合の書き方。
 *=============================================================================
 * var _プラグインファイル名などのユニークな文字列_上書きするメソッド名 = 上書きするメソッド名;
 * 上書きするメソッド名 = function() {
 *   _プラグインファイル名などのユニークな文字列_上書きするメソッド名.apply(this, arguments); // 上書き後メソッドの最初に、上書き前メソッドを呼び出す。
 *   追加したい処理; * この行から、上書き後のメソッドの処理を実行。 
 * };
 *=============================================================================
 * ↓ 実際の記述例
 *var _KeyboardConfig_Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
 *Window_Options.prototype.addGeneralOptions = function() {
 *	_KeyboardConfig_Window_Options_addGeneralOptions.apply(this, arguments);      // 上書き後メソッドの最初に、上書き前メソッドを呼び出す。
 *	this.addKeyConfigCommand();                                                   // この行から、上書き後のメソッドの処理を実行。 
 *};
 *
 * 【著作権フリーについて】
 * このプラグインはMITライセンスです。
 * 　　・出来れば、「地球の共有物（パブリックドメイン）」として扱いたいですが、MITライセンスは、著作権情報の明記以外、ほとんど変わりありません。
 * 　　・無償・有償問わず、あらゆる作品に使用でき、また自由に改変・改良・二次配布できます。
 * 　　・著作表示のわずらわしさを回避するため、merusaiaの著作権は放棄します。事後報告、クレジット記載は「Tachi」とだけ入れてください。
 * 　　・もちろんクローズドに使っていただいてもOKです。是非、自分好みに改造してお使いください。
 * 　　・改変・再配布時は、上記の著作情報と、以下のMITライセンス全文は消さないでください。よろしくお願いします。
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 *
 *
 *
 */

(function() {

//=============================================================================
// ツクールエディタ上で編集できる、プラグインのパラメータを取得や、プラグインコマンドの取得時に使うメソッド群です。
// トリアコンタンさん(http://triacontane.blogspot.jp/)のソースを参考に使わせていただいてます。感謝。
//=============================================================================
// このローカル変数。わかりやすい名前をつけてください。
// 開発者用メモ： javascriptの無名関数(function(){...})内に書く変数は、ローカル変数扱いなので、短い名前を使っても、他のプラグインとの競合はしません。
// var hogehoge;
/*
// ↓プラグインのファイル名。「***.js」を変更した時、ここを変更する忘れないようにしてください。
var parameter = PluginManager.parameters('Tachi_editByMerusaia');
// ↓エディタで編集可能な、このプラグインのパラメータ名を格納する変数群。
// ※helpコメント欄の「アットマープparam ***」を変更した時、ここを変更する忘れないようにしてください。
var _HighSpeed_MapRate = Number(parameter['高速モード時のマップ倍率1-100']);
var _HighSpeed_BattleRate = Number(parameter['高速モード時の戦闘倍率1-100']);
var _SkipRate = Number(parameter['スキップ倍率2-1000']);
var _Limit_MaxHP = Number(parameter['最大HPの限界値']);
var _Limit_MaxMP = Number(parameter['最大MPの限界値']);
var _Limit_MaxAttack_AndOtherParam = Number(parameter['攻撃力などの限界値']);
var _Migawawri = Number(parameter['身代わりする仲間のHP％1-100']);
 * @param 攻撃力などの限界値
 * @desc 整数で入力。攻撃力などのその他能力値の限界値です。デフォルトは999→99億9999万9999。
 * 　　　エディタで設定したい場合、DynamicDatabase.jsなどのタグで設定するプラグインを使ってください。
 * @default 9999999999
 * 
 * @param 身代わりする仲間のHP％1-100
 * @desc HPの少ない仲間をかばう際、HPが何％以下ならかばうか、です。デフォルトは25。
 * @default 25
 * 
 * @param 身代わりする仲間のHP％1-100
 * @desc HPの少ない仲間をかばう際、HPが何％以下ならかばうか、です。デフォルトは25。
 * @default 25
*/
// 以下、プラグインのパラメータを指定した方で取得するメソッド群です。
var getParamString = function(paramNames) { // パラメータが文字列型。
    var value = getParamOther(paramNames);
    return value == null ? '' : value;
};

var getParamBoolean = function(paramNames) { // パラメータがtrue/falseのチェック型。「ON」か「OFF」かで記述しないとダメです。
    var value = getParamOther(paramNames);
    return (value || '').toUpperCase() == 'ON';
};

var getParamOther = function(paramNames) { // パラメータがその他（配列型やオブジェクト型やnull許容型？）
    if (!Array.isArray(paramNames)) paramNames = [paramNames];
    for (var i = 0; i < paramNames.length; i++) {
        var name = PluginManager.parameters(pluginName)[paramNames[i]];
        if (name) return name;
    }
    return null;
};

// プラグインコマンドのスペルミスを防ぐため、名前を必ず大文字にしてチェックします。プラグインコマンドの英字表記は、必ず全て大文字にしてください。
var getCommandName = function (command) { // プラグインコマンドの名前commandを空白化をチェックしてから、英語なら大文字化して取得します。
    return (command || '').toUpperCase();
};

var getArgString = function (arg, upperFlg) { // 任意の引数argをチェックして取得します。小文字が入っていないかのチェックも可能です。
    arg = convertEscapeCharacters(arg);
    return upperFlg ? arg.toUpperCase() : arg;
};

var getArgNumber = function (arg, min, max) { // 任意の引数argが指定範囲かどうかをチェックして取得します。
    if (arguments.length < 2) min = -Infinity;
    if (arguments.length < 3) max = Infinity;
    return (parseInt(convertEscapeCharacters(arg), 10) || 0).clamp(min, max);
};

var convertEscapeCharacters = function(text) { // 任意の引数textがnullなら空白""に、環境で変換できるものは変換して取得します。
    if (text == null) text = '';
    var window = SceneManager._scene._windowLayer.children[0];
    return window ? window.convertEscapeCharacters(text) : text;
};

var concatArgs = function (args, start, end) { // 任意の引数配列args[]のargs[start]～args[end]までを半角スペース" "で区切って取得します。
    if (!start) start = 0;
    if (!end) end = args.length;
    var result = '';
    for (var i = start, n = end; i < n; i++) {
        result += args[i] + (i < n - 1 ? ' ' : '');
    }
    return result;
};
// ============ プラグインのパラメータを取得や、プラグインコマンドの取得時に使うメソッドの追加、終 ==========================



//=============================================================================
// Game_System
//  $gameSystem.で呼び出せる、新しい静的メソッドを追加します。
//=============================================================================
// 常時スキップモード（高速モードのボタンを押していなくとも、高速化される状態）をONします。
Game_System.prototype.plugin_Tachi_edit_SkipModeOn = function(){
    alert("Tachi_edit.js: スキップモード（SkipMode）がONになりました。");
}
// 常時スキップモード（高速モードのボタンを押していなくとも、高速化される状態）をOFFします。
Game_System.prototype.plugin_Tachi_edit_SkipModeOff = function(){
    alert("Tachi_edit.js: スキップモード（SkipMode）がOFFになりました。");
}
//============ メソッドの追加、終 ================================================


// ↓上記のメソッドを、プラグインコマンドとして実装します。
//=============================================================================
// Game_Interpreter
//  プラグインコマンドを追加定義します。
//=============================================================================
var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.apply(this, arguments);
    try {
        // ※ここのメソッド名を、下記の
        // Game_Interpreter.prototype.pluginCommandAddRead_***メソッド名と同じにしてください。
        this.pluginCommandAddRead_pluginErrorCheck(command, args);
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
        console.log('- コマンド名 　: ' + command);
        console.log('- コマンド引数 : ' + args);
        console.log('- エラー原因   : ' + e.toString());
    }
};
// トリアコンタンさんのソースを参考に使わせていただいてます。感謝。
// ※ここのメソッド名を、上記の※の部分の
// Game_Interpreter.prototype.pluginCommand_***メソッド名と同じにしてください。
Game_Interpreter.prototype.pluginCommandAddRead_pluginErrorCheck = function (command, args) {
    switch (getCommandName(command)) {
        case 'SKIPMODE_ON' :
        case 'スキップモードON':
            // 呼び出すメソッド名は、上記の★プラグイン競合チェック用メソッドの、.prototypeを抜いたものになっています。
            $gameSystem.plugin_Tachi_edit_SkipModeOn(); // 引数を取りたい時は、右を参考にしてください。 (getArgNumber(args[0]), getArgString(concatArgs(args, 1)));
            break;
    }
};
//============ プラグインコマンドの追加定義、終 ============================================


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

// ★オプションを触るプラグインとの競合に注意！！　他のオプションを触るプラグインでやっているならば、ここではできるだけやらないほうがいいいよ。
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
//   トリアコンタンさんのソースを参考に、「新規メソッド.apply(this, argments)」を使い、同名メソッドが競合しないように改良。
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

// ★バトルコマンドを触る競合に注意！！　他のプラグインでやっているならば、ここではできるだけやらないほうがいいいよ。
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

// Tachi_editByMerusaia.jsの、ステータス限界値の変更。rpg_object.jsを上書きしています。気をつけてください。
// 例１（Tachiさん初版）：　限界値（HPやMPの限界値を、HPのデフォルト9999→999999、MPのデフォルト999→9999、その他のパラメータを999→9999に変更している。
// 例２（現行）：　限界値（HPやMPの限界値を、HPのデフォルト9999→99億9999万9999、MPのデフォルト999→99億9999万9999、その他全てのパラメータをデフォルト999→99億9999万9999に変更している。
// ※気をつけてください。ダメージ計算式を割り算形式「a.atk/b.def」などに変更していないのなら、他のゲームバランスがむちゃくちゃになる可能性だって有ります‥。運も‥。）
Game_BattlerBase.prototype.paramMax = function(paramId) {
    if (paramId === 0) {
        return 9999999999;    // MaxHP
    } else if (paramId === 1) {
        return 9999999999;    // MaxMP
    } else {
        return 9999999999; // その他、攻撃力や運などのパラメータ
    }
};

// =============================================================================
// ゲームスピード調整
// Tachiさんによる、マップ・戦闘メッセージ・戦闘エフェクト・エンカウントエフェクトなど、様々な高速化調整です。一部、merusaiaが改変。
// =============================================================================
// マップのゲームスピード調整
// this.updateMain()が書かれてある行数分だけ、何倍にも高速化されます。デフォルトは２倍→ここでは５倍。
// マップ時のメッセージ送りスピードや、自動移動のスピードなどに影響します。メッセージ中の制御文字「\.」や「\|」などの待ち時間には影響しません。
// ボタン長押しで高速化したくなければ、パラメータを1にするか、全てコメントアウトすることで実現できます。
Scene_Map.prototype.updateMainMultiply = function() {
    this.updateMain();
    if (this.isFastForward()) {
        this.updateMain(); // ここまでだと２倍
        this.updateMain(); // ここまでだと３倍
        this.updateMain(); // ここまでだと４倍
        this.updateMain(); // ここまでだと５倍。Tachiさんのデフォルトは５倍。
    }
};
// 戦闘メッセージ（バトルログ）の表示スピード高速化です。
Window_BattleLog.prototype.updateWaitCount = function() {
    if (this._waitCount > 0) {
        // Tachiさんによる追加行、始まり。ここの5行が追加されている。早送り中（決定ボタン押しっぱなし）だったら、バトルログの待ち時間を20減ら（ほぼ超早く）します。また、shiftボタン押しっぱなし時も高速モードにする。
        if (Input.isPressed('shift') || this.isFastForward())
        {
           // 『早送りボタン押しっぱなし時』の効果。次の中から一つをコメントアウトして選ぶ。
           // 全部コメントすると、早送りボタン効果なし。
           this._waitCount -= 20; // tachiさんのデフォルト。なぜ-20なのかは不明。早過ぎると、ログが目で終えないほど小さくなってしまう可能性があるからです。デフォルトの_waitCountは不明。
           //this._waitCount -= 100; // これだともうほほほぼ読めないと思ったら‥そんなことはないです。読めます。状態異常以外は‥。
           //this._waitCount -= 10;// -= 10 にすると、だいぶ遅くなる。これじゃあ、ちょっとやれないかも。
           //this._waitCount /=2;// にすると、ボタン押しっぱなしにした時だけメッセージが止まる。//this._waitCount = this._waitCount / 2;///=2;   // /=2 とすると、ボタン押しっぱなしにした時だけ、タイミングを止めます。
        }
        // 以下、早送り中でなくても早くしたい場合、else{}内の次の中から一つをコメントアウトして選ぶ。
        else {
            this._waitCount -= 2;   // Tachiさんデフォルト。早送りでない場合を、だいぶ早く調整したかったみたいで、2だけ減らす。
            //this._waitCount -= 3; // -3にしても読めるくらいのスピード。ただし、ちょっと読み飛ばしも多いかも・
            //this._waitCount -= 1; // -1はまだ試してないです。
        }
        // Tachiさんによる追加行、終。
        
        if (this._waitCount < 0) {
            this._waitCount = 0;
        }
        return true;
    }
    return false;
};
// 敵エンカウントエフェクトのスピードをあげています。デフォルトは60フレーム(1秒)。
Scene_Map.prototype.encounterEffectSpeed = function() {
    return 20; // 60;
};
Scene_Map.prototype.updateEncounterEffect = function() {
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
            this.startFadeOut(10)// this.fadeSpeed()); // デフォルトと違うのは、ここをthis.fadeSpeed()→10としているところ。フェードアウトを早くしたかったんですね。
        }
    }
};
//　エンカウントスピードの調整（マップ敵エンカウント時のキャラクターを消すエフェクトを無しにして、エンカウントスピードを上げている？）
Scene_Map.prototype.startEncounterEffect = function() {
    //this._spriteset.hideCharacters(); // ここだけデフォルトから変更。コメントアウト。マップ敵エンカウント時のキャラクターを消すエフェクトを無効にしている。
    this._encounterEffectDuration = this.encounterEffectSpeed();
};
// 以下、戦闘アニメーションの高速化。武器モーションや、スキルエフェクトのアニメーションスピードなども調整されています。
Sprite_Animation.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateMain();
    
    // Tachiさんによる追加行、始まり。ここの6行が追加されている。
    // 高速モード（決定ボタン/shiftボタン/タッチ画面が押しっぱなし）ら、バトルログの待ち時間を20フレーム減らします。
    if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){
        this.updateMain(); // ここまでだと２倍
        this.updateMain(); // ここまでだと３倍
        this.updateMain(); // ここまでだと４倍 // tachiさんのデフォルトは４倍。
        //this.updateMain(); // ここまでだと５倍
    }
    // Tachiさんによる追加行、終。
    
    this.updateFlash();
    this.updateScreenFlash();
    this.updateHiding();
    Sprite_Animation._checker1 = {};
    Sprite_Animation._checker2 = {};
};
Sprite_Enemy.prototype.update = function() {
    Sprite_Battler.prototype.update.call(this);
    if (this._enemy) {
        
        this.updateEffect();
        
        // Tachiさんによる追加行、始まり。ここの4行が追加されている。高速モード時は戦闘エフェクトも高速化。まぁ…同じですよね。ただしここは三倍。
        if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){
            this.updateEffect(); // ここまでだと２倍
            this.updateEffect(); // ここまでだと３倍 //tachiさんのデフォルトは３倍。
        }
        // Tachiさんによる追加行、終。
        
        this.updateStateSprite();
    }
};
// Tachiさんによるアニメ高速化。高速モード時は4倍。デフォルトは return 12;のみ。
Sprite_Weapon.prototype.animationWait = function() {
    if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){return 3;}else{return 12;}
};
// Tachiさんによるモーション高速化。高速モード時は4倍。デフォルトは return 12;のみ。
Sprite_Actor.prototype.motionSpeed = function() {
    if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){return 3;}else{return 12;}
};
Sprite_Actor.prototype.updateMove = function() {
    var bitmap = this._mainSprite.bitmap;
    if (!bitmap || bitmap.isReady()) {
        Sprite_Battler.prototype.updateMove.call(this); Sprite_Battler.prototype.updateMove.call(this);
        
        // Tachiさんによる追加行、始まり。ここの4行が追加されている。高速モード時は戦闘エフェクトも高速化。まぁ…同じですよね。ただしここは3倍。
        if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){
            Sprite_Battler.prototype.updateMove.call(this); // ここまでだと２倍
            Sprite_Battler.prototype.updateMove.call(this); // ここまでだと３倍
        }
    }
};
// 高速モードに移行する条件の追加。
// デフォルトの決定ボタン押しっぱなしだけでなく、shiftボタン/タッチ画面が押しっぱなし、が追加されています。
Scene_Map.prototype.isFastForward = function() {
    return ($gameMap.isEventRunning() && !SceneManager.isSceneChanging() &&
            (Input.isLongPressed('ok') || Input.isLongPressed('shift') || TouchInput.isLongPressed()));
};
// =============================================================================
// Tachiさんによる、高速モード時のゲームスピード高速化、終。
// =============================================================================



// 吸収技にもダメージエフェクトをつける。デフォルトから一行削除なので、競合対策不可。
Game_Action.prototype.apply = function(target) {
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
        this.item().effects.forEach(function(effect) {
            this.applyItemEffect(target, effect);
        }, this);
        this.applyItemUserEffect(target);
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


// ゲームオーバー制御。
// ※パラメータで指定した変数番号に代入を行っているので、気をつけてください。
// ゲームオーバーになった時、デフォルトのゲームオーバーに遷移させず、戦闘不能になったバトルメンバーを全員復活させてシナリオを継続させている。
BattleManager.updateBattleEnd = function() {
    if (this.isBattleTest()) {
        AudioManager.stopBgm();
        SceneManager.exit();     // なお、バトルテストならそこでシナリオ強制終了（たぶんデフォルト設定））
    } else if ($gameParty.isAllDead()) {
        // 味方キャラが全員戦闘不能になっていたら、この戦闘が負けた時の分岐があるか、ないかを調べる。
        if (this._canLose) {
            $gameParty.reviveBattleMembers();
            SceneManager.pop();               // 負けた時の分岐が在る戦闘（負けても大丈夫なボス戦等）だったら、そのまま、シナリオを継続。
        } else {
            //SceneManager.goto(Scene_Gameover); // デフォルトはゲームオーバーに遷移する（シナリオは継続しない）
	        $gameSwitches.setValue(2, true);      // 負けた時の分岐が無い戦闘（通常エンカウント、もしくはボス戦等）だったら、スイッチ2番をONにして、シナリオ継続。
            $gameParty.reviveBattleMembers();
            SceneManager.pop();
        }
    } else {
        // 味方キャラが一人は生きている、すなわち、戦闘に勝ったと判断する（もしかしたら、麻痺とかで全滅ってのも在るかもしれないが‥そこは要検証かも）
        $gameSwitches.setValue(4, true);      // 勝った時の分岐が無い戦闘（通常エンカウント、もしくはボス戦等）だったら、スイッチ4番をONにして、シナリオ継続。
        SceneManager.pop();
    }
    this._phase = null;
};

// 敵にエンカウントした後の処理を上書き。
// 条件分岐内の処理追加なので、競合対策不可。デキる人、よかったら競合対策して公開してもらえると助かります。。
// 元のソースから、エンカウント後、戦闘画面にて、自動的にスイッチ3番がオンされるように変更されている。
// 元のソースから、エンカウント後、戦闘画面にて、自動的に変数5番に最後に戦った敵グループIDが格納されるように変更している。
// ※イベント戦闘（ボス敵）はこのイベントは呼ばれないので、これらの変数を更新したい場合は、敵グループイベントで処理してください。
Game_Player.prototype.executeEncounter = function() {
    if (!$gameMap.isEventRunning() && this._encounterCount <= 0) {
        this.makeEncounterCount();
        var troopId = this.makeEncounterTroopId();
        if ($dataTroops[troopId]) {
	        $gameSwitches.setValue(3, true);  // 元のソースから、この行だけ追加。スイッチ3番をオン
	        $gameVariables.setValue(5, troopId); // merusaiaが追加。元のソースから、この行だけ追加。変数5「Tachi用:最後に戦った敵グループID」を更新。
            BattleManager.setup(troopId, true, false);
            BattleManager.onEncounter();
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

// =================================================================================
// 身代わり時(substitute:代わり、代替という意味)の条件変更
// 特殊フラグ：身代わり時で、味方をかばう際の条件の変更、効果音を追加しています。
// =================================================================================
// デフォルトはreturnで書いてしまっているので、完全に上書き。競合対策不可。
BattleManager.checkSubstitute = function(target) {
    // (a)デフォルトはこれ一行。idDying()がHP25％以下（this.isAlive() && this._hp < this.mhp / 4）。で、かつ、相手の攻撃が必中でない時。
    // return target.isDying() && !this._action.isCertainHit(); // HP25％以下で生きていて、かつ必中攻撃じゃなかったらかばう。
    // (b)Tachiさんの元のやつはこれ。idDying()が消えたので、必中じゃなかったら、確実にかばう。
    return !this._action.isCertainHit(); // 必中じゃなかったらtrue。つまり、必中攻撃だったら、かばえない。戦闘不能の味方への攻撃も…かばう。
    // (a)や(b)では、以下の点において、不便。
    // ・対象を見ていない。
    // 　　つまり、対象が「自分自身」の、MP割合ダメージを受けるHP回復スキル（例えば使用効果に「MP-50%」と書いたHP回復スキル）でも、
    //　　「かばった味方が代わりにHPを回復し、MPダメージを受ける」。なんか変。
    //   　→　対象を相手側だけに絞ったほうが良いかも。
    // ・ステートを見ていない。
    // 　　反撃率が高いステート中、回避率が高いステート中でも、反撃率が低い・回避率が低い仲間に、かばわれてしまう。がっかり。
    // ・かばわれる対象の回避率が飛躍的に上がっている状態でも、かばう。
    // 　　つまり、自分より回避率が低い味方にかばわれると、ある意味がっかり‥かも。
    // ・防御力・魔法防御力を見ていない。
    // 　　つまり、かばう方がダメージが大きくても、かばう。自分より守備力が低い仲間にかばわれると、ある意味残念‥かも。
    // ・かばう側のHPを見ていない。
    // 　　かばわれる側のHP > かばう側のHP でも、かばって死んでしまう。まぁ、犠牲の覚悟もなんとやら…ですが、なんだかアホくさい…。
    //   　→　かばう側(target.hp)・かばわれる側()のHPを見るオプションを付ける（パラメータで変更可能）
    // ・MPを見ていない。
    // 　　これは残りMPが受けるダメージに関係しているシステムでしか使わないと思うが、
    //　　 HPが少なくMPが高い仲間はその攻撃を受けても無事なのに、
    //     MPが少ない味方がかばうと、代わりに大ダメージを受けて倒れてしまう。なんだか残念…。
    //   　→　かばう側・かばわれる側のMPを見るオプションを付ける（パラメータで変更可能）
    //if(target.hp)
};

// 身代わり時に音を鳴らす（Reflection音を鳴らしているだけ。これ、個人的には結構重要だと思う。誰がダメージを受けたか、わかりやすい。）
var _Tachi_Game_Battler_performSubstitute = Game_Battler.prototype.performSubstitute;
Game_Battler.prototype.performSubstitute = function(target) {
    _Tachi_Game_Battler_performSubstitute.apply(this, arguments); // 上書き後メソッドの最初に、上書き前メソッドを呼び出す。
    // この行から、上書き後のメソッドの処理を実行。 
    SoundManager.playReflection(); // Reflectionの音を鳴らす。なぜこの効果音だけ専用メソッドがあるのかは謎。要調査かも。
};
// =================================================================================
// 身代わり時の変更、終
// =================================================================================




})();
