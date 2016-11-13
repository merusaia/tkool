//=============================================================================
// z_PluginCommandErrorCheck.js
//=============================================================================

/*:
 * @plugindesc ■必ず一番下に配置してください。プラグインコマンドのエラーを吐くプラグイン。プラグインコマンドを実行した時、その文字列と引数をデバッグ出力します。
 * @author 地球の公共物 （著作表示は不要です)
 *
 * @help 
 *  
 *  ※以下、メルサイアが追記しました。ヘルプ・誤字脱字・要望・バグ報告などはtwitter:(https://twitter.com/merusaia/)までお気軽に。
 * 
 *  【更新履歴:  詳細（更新者 連絡先）】
 * 2016/10/30: 公開。少しでも助けになれば。（merusaia）
 * 2016/10/31: エラーメッセージを修正。よりわかりやすく、エラーが出たらすぐ来づけるように。（merusaia）
 *
 * 【概要】
 * ツクールMVのプラグインコマンドは非常に便利ですが、
 * プラグインコマンドに入力した文字列は、タイプミスや引数ミスがあったり、例外が発生したとしても、ちゃんとエラーを吐かず、スルーしてしまうという問題点を抱えています。
 * 
 * このプラグインを入れると、プラグインコマンドの実行時に、文字列や引数をデバッグ出力し、何かしらのエラーが出た場合はエラーメッセージを出して警告しています。
 * これにより、なにかおかしい挙動をしたときに、どのプラグインコマンドのエラーがスルーされているのかを、目で追うことが出来、バグの特定に繋がります。
 * 
 * 【主な機能】
 * プラグインコマンドの文字列や引数を出力するメソッドを最後に追加定義し、
 * このプラグインより上のプラグインコマンドを判定するメソッドをtry～catch文で呼び出し、エラーが起こるとその文字列や引数を出力して警告します。
 * そうでない場合は、『プラグインコマンド　【コマンド文字列 引数1 引数2 ...】は正常に実行されました。』と表示します。
 * 
 * 
 * 【プラグインコマンド】
 * プラグインコマンドはありません。
 * 
 * 【謝辞】
 * トリアコンタンさん (http://triacontane.blogspot.jp/)さんのIconDescription.jsのソースを参考に使わせていただいてます。感謝！
 * 
 * 【競合について】
 * ・以下のメソッドを追加定義しています。
 * 　Game_Interpreter.prototype.pluginCommand
 * 
 * 【開発者用メモ （※ツクラーさんは読まなくて大丈夫です）】
 * ＜プラグインの競合について＞
 *   ・プラグイン作成時は、他のプラグインとの競合に注意が必要です。
 *       競合とは、同名メソッド（例えばオプション項目を追加する、Window_Options.prototype.addGeneralOptions = function()など）
 *        を上書きするプラグインの下に、「まったくおなじ名前の」同名メソッドを上書きするプラグインが定義されている場合、
 *        複数のプラグインをONにしても、「一番下に定義されているプラグインの同名メソッドしか機能しない」ことにより、
 *        ゲーム中に意図しない動作を引き起こすことです。
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
 * このプラグインは地球の公共物（パブリックドメイン）です。
 *     ・よくわからない方は、MITライセンスと思っていただいて、差支えありません。
 *     ・無償・有償問わず、あらゆる作品に使用でき、また自由に改変・改良・二次配布できます。
 *     ・著作権のわずらわしさを回避するため、merusaiaの著作権は放棄します。
 *     ・もちろんクローズドに使っていただいてもOKです。是非、自分好みに改造してお使いください。
 *
 *
 * 
 */

(function () {
    'use strict'; // javascriptの構文チェックを少しだけ厳密にします。効果があるのなら、変数宣言varの省略もエラーになるはずだが…？ http://analogic.jp/use-strict/

    //=============================================================================
    // ローカル関数
    //=============================================================================



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
    /**  ↓プラグインのファイル名から取得したパラメータ。「***.js」を変更した時、ここを「***」に更新する忘れないようにしてください。*/
    var pluginName = 'z_PluginCommandTypeMissCheck';

    // ↓エディタで編集可能な、このプラグインのパラメータ名を格納する変数群。
    // ※helpコメント欄にある「＠param ***」を変更した時、ここを更新する忘れないように。(['英語のパラメータ名', 日本語のパラメータ名'], 最小値, 最大値)の変更も、忘れないでね。
    // * @param デバッグ出力するか
    // * @desc 初期値=OFF。デバッグ情報を出力するかです。ONにしても、本番プレイ時は表示されません。
    // * @default OFF
    // 以下、ローカルメソッド宣言
    // （という名の、無名関数の値を返す変数宣言。必ず、これらの変数を呼び出す前に、宣言すること。出ないと無効になるよ。エラーは出ない…。）
    //============ ローカル変数（という名の無名関数の値を返すメソッド）の追加、始 ================================================
    // スイッチパラメータの例： var _isDebugOut = getParamBoolean(['isDebugOut', 'デバッグ出力するか']);
    // 変数パラメータの例:   var _VarNo_Rapid_BattleRate = getParamNumber(['VarNo_Rapid_BattleRate', '戦闘早送り倍数を格納する変数番号'], 1, 9999);
    //============ ローカル変数（という名の無名関数の値を返すメソッド）の追加、終 ================================================


    // ↓上記のメソッドを、プラグインコマンドとして実装します。
    // トリアコンタンさんのソースを参考に使わせていただいてます。感謝。
    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    // ●ここのメソッド名を、上記の■部分 Game_Interpreter.prototype.pluginCommand_***メソッド名と同じにしてください。
    // Game_Interpreter.prototype.pluginCommandAddRead_z_PluginCommandErrorCheck = function (command, args) {
    //     switch (getCommandName(command)) {
    //         // 表記例:
    //         //case 'NEW_PLUGINCOMMAND_NAME' :
    //         //case '新しいプラグインコマンド名':
    //         //    // 呼び出すメソッド名は、Game_System.prototype.plugin_***の、.prototypeを抜いたものになっています。
    //         //    //$gameSystem.plugin_***(); // 引数を取りたい時は、右を参考にしてください。ただし、プラグインコマンドはエラーを自動的にスキップするので、なるべく引数を取らないほうが、ユーザには親切になります。 (getArgNumber(args[0]), getArgString(concatArgs(args, 1)));
    //         //    break;
    //
    //         // ■getCommandName()メソッドについて注意点。
    //         // ※プラグインコマンドを英字で入力する場合は、スペルミスを防ぐため、名前を必ず大文字にしてチェックします。
    //         //   新しいプラグインコマンドを作る場合は、英字表記は必ず「全て大文字」にしてください。
    //
    //         // ■z_PluginCommandErrorCheck.jsの機能について
    //         // このプラグインでは、それ以外のプラグインの判定処理が終わった後で、「該当するプラグインコマンドが見つからない（該当なし or タイプミスがある）」場合だけを判定しています。
    //         // プラグインコマンドはありませんので、何も入れていません。
    //         default:
    //             break;
    //     }

    // };
    // 下記の説明：
    //      プラグインコマンド実行時のエラーをできるだけ判定するため、
    //      (1)これまでのGame_Interpreter.prototype.pluginCommandメソッドをtry～catch文で呼び出し、
    //      (2)実行したプラグインコマンドの文字列や引数を、console.logで出力しています（テストプレイ時のみ）。
    // 　　 (3-a)(3-b)また、もし例外をスルーされたり、エラーが出た時には、そのプラグインコマンドに入力された文字列や引数を出力しています。
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        // ↓  この行から、上書き後のメソッドの処理を実行。 
        
        //   普通はここで、元のメソッドをapplyしてから、コマンドを取得するメソッドを呼び出すのですが、
        //   このプラグインはコモンイベントを持たないので、コメントアウトします。
        // _Game_Interpreter_pluginCommand.apply(this, arguments);
        // ■ここのメソッド名を、下記の●部分 Game_Interpreter.prototype.pluginCommandAddRead_***メソッド名と同じにしてください。
        // this.pluginCommandAddRead_z_PluginCommandCheck(command, args);
        
        // テスト中だけですが、一応、実行時間を計ってみます。
        if(isTestPlaying()){ console.time('↑実行ミリ秒');}

        // その代わり、try～catch文の中で、元メソッドを呼び出すことで、エラーや例外処理の検出をはかっています。
        try {
            _Game_Interpreter_pluginCommand.apply(this, arguments);                           // (1)
            // 実行したプラグインコマンドをそのまま出力します。
            // 　→　この出力を目で見て、プラグインコマンドの文字列に間違いがないか、チェックをしてください。
            //      本番時は非表示。テストプレイ時はconsole.logにしておきます。
            var _pluglinCommandRunMessage = 
                'プラグインコマンド  【'+getCommandName(command) +' '+args+'】 が実行されました。';     // (2)
            // →　完璧な 正常実行 or エラー の判定は難しいので、実行時は出力しておきます（テストプレイ時のみ）。　あくまでもデバッグ一つの手段としてお使いください。
            if(isTestPlaying()){
                console.log(_pluglinCommandRunMessage);
            }
        } catch (e) {
            // 何らかの例外や、エラーが出たら、その文字列や引数を表示する
            //    （※ただし、ここはこれより上のプラグインで内部にtry～catchされている場合や、内部で例外を吐いてくれないプラグインコマンドの場合は、
            //       catchには遷移しないようです。　意図的にやるには、各プラグインで、エラー時にthrow new Error()をするくらいしか……）

            // テストプレイ中なら、guiを表示する。
            if ($gameTemp.isPlaytest() && Utils.isNwjs()) {
                var window = require('nw.gui').Window.get();
                if (!window.isDevToolsOpen()) {
                    var devTool = window.showDevTools();
                    devTool.moveTo(0, 0);
                    devTool.resizeTo(Graphics.width, Graphics.height);
                    window.focus();
                }
            }
            // (例外をスルーされたり、エラーが出た時に、そのプラグインコマンドに入力された文字列や引数を出力しています。
            var _typeMissCheckErrorMessage = '■■■エラー: プラグインコマンド  【'+getCommandName(command) +' '+args+'】 実行中に例外が発生しました。';
            _typeMissCheckErrorMessage += '\n- コマンド名   : ' + command;
            _typeMissCheckErrorMessage += '\n- コマンド引数 : ' + args;
            _typeMissCheckErrorMessage += '\n- エラー原因   : ' + e.toString();
            _typeMissCheckErrorMessage += '　→　文字列 【'+getCommandName(command) +' '+args+'】 が見つかりません。'
              +'\n       z_PluginCommandErrorCheck.jsをプラグインリストの一番下におくか、\nエディタ内のプラグインコマンドに記載した文字列にスペルミスがないかを確認してください。\n\n';

            // console.logだと、見落としがこわい。本番時はconsole.log。テストプレイ時はalertにしておきましょう。
            if(isTestPlaying()){
                alert(_typeMissCheckErrorMessage);       // (3-a)テストプレイ中はalert。 
            }else{
                console.log(_typeMissCheckErrorMessage); // (3-b)本番中はconsole.log
            }

        }
        // テスト中だけですが、一応、実行時間を計ってみます。
        if(isTestPlaying()){ console.timeEnd('↑実行ミリ秒');}

    };
    //============ プラグインコマンドの追加定義、終 ============================================


})();
