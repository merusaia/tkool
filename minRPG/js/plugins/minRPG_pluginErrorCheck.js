//=============================================================================
// minRPG_pluginErrorCheck.js
//=============================================================================

/*:
 * @plugindesc プラグイン「競合チェック」プラグイン
 * @author 地球のみんな（クレジット記載不要）
 * @version 1.0 更新日時:2016/5/14 初版
 * 
 * 【更新履歴:  詳細（更新者 連絡先）】
 * 2016/05/14: 初版公開（merusaia http://merusaia.higoyomi.com/)が雛形を作成しました。バグ報告などはtwitter:@merusaiaまでお気軽に。）
 * 
 * @help 自分のゲーム用の、プラグインチェック用のプラグインです。
 * プラグイン競合で苦しんだ人以外は何を言ってるかわからないと思いますが、
 * ・他のプラグインで、任意のメソッドが上書きされていないかのチェックや、
 * ・他のプラグインとかで、同じ変数が使用されていないかを、適時プラグインコマンドでチェックするとか、
 * に使います。
 * テキトーに改変して使ってください。
 * 
 *【使い方】
 * <はじめに>. このプラグインを触る前に、以下をチェックしておくといいです。
 * ・他のプラグインを導入する前に、VisualStudioCodeなどで自分のゲームの「js」フォルダ内で、導入プラグインの.prototype.***メソッドを全文検索。
 *   → 他のプラグインと被ったら、その同名メソッドをWinMergeなどで見比べながら、競合箇所をチェック。
 * 　→ これでもさっぱりわからない場合、このプラグインでいろいろチェックしてみてください…。
 * 
 * 1. このプラグインのパラメータもしくはソース内に、他のプラグインとかで上書きされている可能性のある変数もしくはメソッドを追加。
 * 2. エディタ　→　プラグイン一覧リストの「一番上」にこのプラグインをおき、右クリックで「更新」し、このプラグインを「ON」にしてテストプレイ。
 * 3. 意図した挙動かどうかを確認。
 * 4. 意図した挙動でなかったら、気になるプラグイン以外の、他のプラグインを「OFF」にしたりして、いろいろチェック（1～4を繰り返す）。
 * 
 * <後片付>. 見事原因がわかった！ら、このプラグインを「OFF」にする。
 * 
 * 必要に応じて、このソース中のメソッド minRPG_pluginErrorCheckTools.prototype.checkErrors1()内に、
 * 競合チェックしたい、好きな処理を追加して、プラグインコマンドで適時実行してください。
 * 
 * 
 *【プラグインコマンド】
 * エディタ上で、プラグインコマンド「競合チェック」、もしくは「PLUGIN_ERROR_CHECK」
 * と書くと、minRPG_pluginErrorCheckTools.prototype.checkErrors1()内に書いた処理が実行されます。
 * プラグインコマンドのスペルミスを防ぐため、名前を必ず大文字にしてチェックします。プラグインコマンドの英字表記は、必ず全て大文字にしてください。
 * 
 * 【謝辞】
 * トリアコンタンさん (http://triacontane.blogspot.jp/)さんのIconDescription.jsのソースを参考に使わせていただいてます。感謝！
 * 
 * 【競合について】
 *  rpg_objects.jsの、Game_Interpreter.prototype.pluginCommandを追記（一度元のメソッドを別の名前にして呼び出し、その後に上書き）しています。
 *    → 上記メソッドを丸ごと上書きしているプラグインとの競合に注意してください。
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
 * このプラグインは「地球の共有物（パブリックドメイン）」です。
 * 　　・無償・有償問わず、あらゆる作品に使用でき、また自由に改変・改良・二次配布できます。
 * 　　・著作表示のわずらわしさを回避するため、著作権は放棄します。事後報告、クレジット記載も不要です。
 * 　　・もちろんクローズドに使っていただいてもOKです。是非、自分好みに改造してお使いください。
 *
 *
 * @param 競合チェック変数番号1
 * @desc プラグインコマンド「競合チェック」で表示したい変数番号を指定してください。デフォルトは1（つまり\V[1]）が表示されます。
 * @default 1

 */
(function () {

    //=============================================================================
    // ツクールエディタ上で編集できる、プラグインのパラメータを取得や、プラグインコマンドの取得時に使うメソッド群です。
    // トリアコンタンさん(http://triacontane.blogspot.jp/)のソースを参考に使わせていただいてます。感謝。
    //=============================================================================
    // プラグインのファイル名「***.js」を変更した時、ここを変更する忘れないようにしてください。
    var parameter = PluginManager.parameters('minRPG_pluginErrorCheck');
    // 上記のコメンた欄のパラメータ名「アットマープparam ***」を変更した時、ここを変更する忘れないようにしてください。
    var _v1 = Number(parameter['競合チェック変数番号1']) || 1; // デフォルトで0だと\V[0]はエラーにナッてまずいので、1とする。
    
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
    //  $gameSystem.で呼び出せる、新しい静的メソッドを追加します。トリアコンタンさんのソースを参考に使わせていただいてます。感謝。
    //=============================================================================
    Game_System.prototype.plugin_error_check = function(){
      // ★プラグイン競合チェック用メソッドです。中身を好きに改変して使ってください。
      
      // ここに、他のプラグインで上書きされている可能性のある変数名をチェックしてください。
      // 例: プラグインのパラメータで指定した、任意の変数番号の値v1と、その変数値\V[v1]をチェックしたい場合。
      alert("minRPG_pluginErrorCheck.js: 競合チェック: "
        +"_v1="+_v1+", \V[_v1]=\V["+Math.max(1, _v1)+"]="
        +$gameVariables.value(Math.max(1, _v1))+"");
      // ここに、他のプラグインで上書きされている可能性のあるメソッドを呼び出せば、このプラグインコマンドを実行した瞬間に内容のチェックが可能です。
      // 例: Window_Options.prototype.addGeneralOptions（オプション項目を追加する、デフォルトのメソッド）の競合をチェックしたい場合。
      // alert("minRPG_pluginErrorCheck.js: 競合チェック: メソッドを呼び出すよ。");
      // Window_Options.prototype.addGeneralOptions();
    }
    //============ メソッドの追加、終 ================================================


    // ↓上記のメソッドを、プラグインコマンドとして実装します。
    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。トリアコンタンさんのソースを参考に使わせていただいてます。感謝。
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
            case 'PLUGIN_ERROR_CHECK' :
            case '競合チェック':
                // 呼び出すメソッド名は、上記の★プラグイン競合チェック用メソッドの、.prototypeを抜いたものになっています。
                $gameSystem.plugin_error_check(); // 引数を取りたい時は、右を参考にしてください。 (getArgNumber(args[0]), getArgString(concatArgs(args, 1)));
                break;
        }
    };
    //============ プラグインコマンドの追加定義、終 ============================================

    //=============================================================================
    // プラグイン競合の可能性の在るメソッドの洗い出し。
    //=============================================================================
    // ↓ここに、上書きされる前の「rpg_***.js」内にある、デフォルトのメソッドを貼り付けてください。
    //  その後、alert("私は◯◯。元のメソッドやよ"); など、テストの出力結果を追記してください。
    // このメソッドが、このプラグインより下に定義されている、他のプラグインで上書きされる場合、ここに書いた内容が消されるはずです。
    // 　→　これによって、このメソッドが他のプラグインと競合しているか、を確認できます。
    // 
    // 例: Window_Options.prototype.addGeneralOptions（オプション項目を追加する、デフォルトのメソッド）の競合をチェックしたい場合。
    //Window_Options.prototype.addGeneralOptions = function() {
    //    this.addCommand(TextManager.alwaysDash, 'alwaysDash');
    //    this.addCommand(TextManager.commandRemember, 'commandRemember');
    //    alert("私の名前はオプション項目追加メソッド。元のメソッドやよ。");
    //};
    
    
})();