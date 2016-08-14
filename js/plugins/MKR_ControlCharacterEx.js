//=============================================================================
// MKR_ControlCharacterEx.js
//=============================================================================
// Copyright (c) 2016 mankind_robo
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.2 2016/07/29 パラメータのtypeが"bool"の時、"on"や"On"だけでなく、"true"や"True"や"1"や1(数値)もtrueになるように修正。また、"\V[n]"となっていても変数の値を見るように修正。主な機能をコメント。 (merusaia)
// 1.0.1 2016/07/22 一部制御文字が動作しなくなるバグを修正。
// 1.0.0 2016/07/21 初版公開。
// ----------------------------------------------------------------------------
// [Twitter] https://twitter.com/mankind_robo/
//=============================================================================

/*:
 *
 * @plugindesc メッセージ内で使用可能な制御文字を追加します。
 * @author mankind
 *
 * @help
 * メッセージ内で利用可能な制御文字を追加します。
 * 現在追加で使用可能な制御文字は以下の通りです。
 *
 * 制御文字:
 *    \SE[SE名,SE音量,SEピッチ,SE位相]
 *      ・メッセージ表示中にSEを演奏します。
 *        SE名は必須です。拡張子を抜いたSEファイル名を
 *        指定してください。
 *
 *        音量、ピッチ、位相は数値で指定、または
 *        制御文字の\v[n](変数n番の数値)を利用可能です。
 *
 *        なお、ここでの音量、ピッチ、位相設定は
 *        プラグインパラメータで指定できる
 *        初期値設定より優先されます。
 *
 *        音量、ピッチ、位相を初期設定値のまま利用する場合は、
 *        SE名のみ指定してください。
 *        (音量のみを指定して
 *         残りを初期設定値で再生させることも可能です)
 *
 *
 *
 *
 * 制御文字の設定例:
 *   \se[CAT,20,100,0]
 *     ・猫の効果音を音量20、ピッチ100、位相0で再生します。
 *
 *   \SE[BELL1]
 *     ・ベル1の効果音を初期値設定で再生します。
 *
 *   \SE[Coin,\v[20]]
 *     ・コインの効果音を音量[変数20番]、
 *       他は初期値設定を使い再生します。
 *
 *
 * プラグインコマンド:
 *    ありません。
 *
 *
 * スクリプトコマンド:
 *    ありません。
 *
 *
 * ※ プラグインのパラメータにおいて、数値を指定するパラメータには
 *    制御文字\v[n]が使用可能です。
 *    制御文字を指定したパラメータは、パラメータの使用時に
 *    変数の値を取得するため、リアルタイムにパラメータの変更が可能です。
 *
 *
 * 利用規約:
 *    ・作者に無断で本プラグインの改変、再配布が可能です。
 *      (ただしヘッダーの著作権表示部分は残してください。)
 *
 *    ・利用形態(フリーゲーム、商用ゲーム、R-18作品等)に制限はありません。
 *      ご自由にお使いください。
 *
 *    ・本プラグインを使用したことにより発生した問題について作者は一切の責任を
 *      負いません。
 *
 *    ・要望などがある場合、本プラグインのバージョンアップを行う
 *      可能性がありますが、
 *      バージョンアップにより本プラグインの仕様が変更される可能性があります。
 *      ご了承ください。
 *
 *
 * @param Default_SE_Volume
 * @desc [初期設定値] 制御文字でSE再生時に使われる音量です。制御文字\V[n]が使えます。
 * @default 90
 *
 * @param Default_SE_Pitch
 * @desc [初期設定値] 制御文字でSE再生時に使われるピッチです。制御文字\V[n]が使えます。
 * @default 100
 *
 * @param Default_SE_Pan
 * @desc [初期設定値] 制御文字でSE再生時に使われる位相です。制御文字\V[n]が使えます。
 * @default 0
 *
 * @param Default_Wait_Period
 * @desc [初期設定値] 制御文字「\.」利用時に待機するフレーム数です。(60フレーム=1秒)。制御文字\V[n]が使えます。
 * @default 15
 *
 * @param Default_Wait_Line
 * @desc [初期設定値] 制御文字「\|」利用時に待機するフレーム数です。(60フレーム=1秒)。制御文字\V[n]が使えます。
 * @default 60
 *
 *
 *
 * *
*/
(function () {
    'use strict';
    var Parameters, SeVolumeDef, SePitchDef, SePanDef,
        WaitPeriodDef, WaitLineDef;

    /** 引数のtextに、'\V[n]'（nは整数）という表記が見つかったら、ゲーム内変数の値に置き換えます。それ以外はtextをそのまま返します。 */
    var ConvertEscapeCharacters = function(text) {
        text = String(text);                    // textは文字列型に治すよ。次の２行は、'\\'を'\'にするための保険の処理（？）だよ。
        text = text.replace(/\\/g, '\x1b');     // '\'というのが見つかったら、'\x1b'というエスケープシーケンスに置き換えるよ。
        text = text.replace(/\x1b\x1b/g, '\\'); // エスケープシーケンスが２つつながってたら、'\'におきかえるよ。

        text = text.replace(/\x1bV\[(\d+)\]/gi, function() {     // '\V[n]'(nは整数)というのが見つかったら、変数値に変えるよ。
            return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));

        text = text.replace(/\x1bV\[(\d+)\]/gi, function() {     // '\V[\V[n]]'みたいなのがあるから、もう一回やっとくよ。
            return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));
        
        return text;                            // じゃなかったら、そのままの文字列を返してね。
        
    };
    /** 引数のparamに、tureを意味する値が入っているかどうかを返します。paramに"V[n]"などの変数が入っている際も、その値を考慮します。 
     * trueの条件は、値が"ON"か"On"か"on"、"TRUE"とか"True"とか"true"とか、"1"(文字列)や1(数値)もtrue。それ以外、"オン"や"0"や0以下の数値、2以上の数値はfalseを返します。*/
    var isParamTrue = function(param){
        // paramが""やnullやundefinedなら、falseを返すよ。
        if(param === "" || param === null || param === undefined) return false;
        var isON = false;                 // nullやundefinedなら、falseを返すよ。
        // paramが配列の時、全部falseになる。bool[]ではなくここはboolのチェックなので、param[index]を忘れている。必ずアラートする。
        if (Array.isArray(param)){
            alert("CheckParam(type, param, def)の引数paramに、配列を渡しています。a[i]などを忘れている可能性が高いです。　無条件でfalseを返します。");
            return false;
        }
        // paramがBoolean型の時
        if(param === true) return true;   // trueなら、大文字に変更する必要はないよ。
        if(param === false) return false; // falseでも、大文字に変更する必要はないよ。
        // paramがNumber型の時
        if(param === 1) return true; // 数値の1ならtrueだよ。
        if(Number.isNaN(param) || param === Infinity || param === -Infinity) return false; // NaN(数えられない数)でも、±Infinity（∞）でも、falseだよ。
        // paramがString型の時
        if(param instanceof String){              // paramがString型なら、初めて、大文字に変換して、文字列として値を見るよ。
            var upperParam = param.toUpperCase(); // 大文字小文字を分けてみるのが面倒だから、大文字化しちゃうよ。
            isON = (upperParam === "ON" || upperParam === "TRUE" || param === "1");
            if(isON === false){                   // falseなら、"\V[n]"などが入っている可能性があるから、変数の値を見るよ。
                var varValue = ConvertEscapeCharacters(param); // 変数の値を代入してるよ。
                var upperValue = varValue.toUpperCase();       // 大文字化しちゃうよ。
                isON = (upperValue === "ON" || upperValue === "TRUE" || varValue === "1" || varValue === 1);
            }
        }
        return isON;
    }
    // ChecParamメソッドの内部で、ConvertEscapeCharactersを呼び出すようにしたから、この２つのメソッドの定義順序を入れ替えたよ（宣言後の行でないとメソッドは使えない）。
    /** パラメータの値paramを厳格に代入します。
     * ・'\V[n]'（nは数値）という文字列が入っていたら、'\x1bV[n]'という、エスケープシーケンスを使った表記に置きかえます。こうすることで、変数参照時に、"\V[n]"の記述が見つけやすくなります。
     * ・'\V[n]'が見つからなかったら、typeが"bool"の場合は、"ON"か"On"か"on"だけtrue。それ以外はfalseです。
     * ・'\V[n]'が見つからなかったら、typeが"num"の場合は、数値なら十進数に直します。数値出なかったら、defの値、defが定義されていなかったら0です。 
     * */
    var CheckParam = function(type, param, def) {
        var regExp;
        regExp = /^\x1bV\[\d+\]$/i;           // 引数paramの中に、'\V[n]'（nは整数）という文字列がないか、正規表現で探すよ。
        param = param.replace(/\\/g, '\x1b'); // 引数paramの中に、'\'というのが見つかったら、'\x1b'というエスケープシーケンスに置き換えるよ。
        if(regExp.test(param)) {              // 引数paramの中に、'\V[n]'というのがみつかったら、
            return param;                     // paramをそのままを返すよ。値の代入は、あとで、ConvertEscapeCharactersでやるからね。
        }
        // この下の処理は、paramに'\V[n]'というのが見つからなかった時の処理だよ。
        switch(type) {
            case "bool":     // typeが"bool"なら、trueかfalseをboolean型で返すよ。それもダメなら、def（第三引数）。それも定義されてなかったら、falseを返すよ。
                var isON = false;
                // paramが""かnullかundefinedだったら、paramをdef（デフォルト）に置き換えるよ。
                if(param === "" || param == null){
                    param = (def)? def : false; // デフォルトが定義されてなかったら（もしくはfalseだったら）、falseを返すよ。
                }
                // paramが配列の時、全部falseになる。bool[]ではなくここはboolのチェックなので、param[index]を忘れている。必ずアラートする。
                if (Array.isArray(param)){
                    alert("CheckParam(type, param, def)の引数paramに、配列を渡しています。a[i]などを忘れている可能性が高いです。　無条件でfalseを返します。");
                    return false;
                }
                // paramがBoolean型の時
                if(param === true) return true;   // trueなら、大文字に変更する必要はないよ。
                if(param === false) return false; // falseでも、大文字に変更する必要はないよ。
                // paramがNumber型の時
                if(param === 1) return true; // 数値の1ならtrueだよ。
                if(Number.isNaN(param) || param === Infinity || param === -Infinity) return false; // NaN(数えられない数)でも、±Infinity（∞）でも、falseだよ。
                // paramがString型の時
                if(param instanceof String){              // paramがString型なら、初めて、大文字に変換して、文字列として値を見るよ。
                    var upperParam = param.toUpperCase(); // 大文字小文字を分けてみるのが面倒だから、大文字化しちゃうよ。
                    isON = (upperParam === "ON" || upperParam === "TRUE" || param === "1");
                }
                return  isON;
            case "num":      // typeが"num"なら、paramがnullか数えられる数値(※nullでもisFiniteはtrue)だったら十進数に置き換えたもの、でなかったら、def（デフォルト値）が設定されていたらデフォルト値、なかったら0を返すよ。
                return (isFinite(param))? parseInt(param, 10) : (def)? def : 0;
            default:         // typeがそれ以外なら、paramをそのまま返すよ。
                return param;
        }
    }

    Parameters = PluginManager.parameters('MKR_ControlCharacterEx');
    SeVolumeDef = CheckParam("num", Parameters['Default_SE_Volume'], 90);
    SePitchDef = CheckParam("num", Parameters['Default_SE_Pitch'], 100);
    SePanDef = CheckParam("num", Parameters['Default_SE_Pan']);
    WaitPeriodDef = CheckParam("num", Parameters['Default_Wait_Period'], 15);
    WaitLineDef = CheckParam("num", Parameters['Default_Wait_Line'], 60);

    //=========================================================================
    // Window_Base
    //  エスケープコマンドを追加定義します。
    //
    //=========================================================================

    var _Window_Base_obtainEscapeCode = Window_Base.prototype.obtainEscapeCode;
    Window_Base.prototype.obtainEscapeCode = function(textState) {
        var regExp, arr;

        textState.index++;                    // エスケープシーケンス"\"の認識が難しいから、"\SE"ではなく、"SE[...]"を探すためインデックスを1ずらすよ。2文字目から見るよ。
        regExp = /^SE\[.*?\]/i;
        arr = regExp.exec(textState.text.slice(textState.index));

        if (arr) { // テキスト状態(testState)の中に、"\SE[SE名,SE音量,SEピッチ,SE位相]"てやつがはいってたら、
            textState.index += arr[0].length; // その"\SE[SE名,SE音量,SEピッチ,SE位相]"の文字列分だけ、インデックスをずらすよ。
            return arr[0];                                              // 元のメソッドは呼び出さないよ。見つけたその文字列を返すよ。全て大文字にしないのは、ファイル名が含まれているからだよ。
        } else {
            textState.index--;                // インデックスを-1ずらすよ。これをしないと、1文字目に制御文字が入っていたら、飛ばされちゃうよ。
            return _Window_Base_obtainEscapeCode.call(this, textState); // 元のメソッドを呼び出すよ。他の制御文字が含まれているか調べるよ。
        }
    };

    //=========================================================================
    // Window_Messge
    //  エスケープコマンドを追加定義します。
    //
    //=========================================================================

    var _Window_Message_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
    Window_Message.prototype.processEscapeCharacter = function(code, textState) {
        var regExp, arr, res, se;
        se = {};

        regExp = /^(SE)\[(.*?)\]$/i;
        arr = regExp.exec(code);

        if (arr) { // "\SE[SE名,SE音量,SEピッチ,SE位相]"が見つかったよ。
            switch(arr[1].toUpperCase()) {
                case "SE":
                    res = arr[2].split(",");
                    se["name"] = (res[0])? res[0].trim() : ""; // "\SE[SE名,SE音量,SEピッチ,SE位相]"のうち、SE名が省略されていなければ、両端の空白を抜いた名前にするよ。（例:" namae "→"name"）
                    se["volume"] = (isFinite(res[1]))? parseInt(res[1],10) : ConvertEscapeCharacters(SeVolumeDef); // 省略されている(null)or数えられる数値だったら、十進数に直すよ。そうじゃなかったら、デフォルトのパラメータ値を使うけど、"\V[n]"とかの変数の値も考慮するよ。
                    se["pitch"] = (isFinite(res[2]))? parseInt(res[2],10) : ConvertEscapeCharacters(SePitchDef);
                    se["pan"] = (isFinite(res[3]))? parseInt(res[3],10) : ConvertEscapeCharacters(SePanDef);
                    AudioManager.playSe(se);                   // 指定した名前のSE名.oggかSE名.ma4を再生するよ。
                    break;
                default:
                    _Window_Message_processEscapeCharacter.call(this, code, textState); // "\SE"てのが使われてなかったら、通常のやつを呼び出すよ（これ、すごい競合対策だよ）
            }
        } else {
            switch(code) {
                case '.':
                    this.startWait(ConvertEscapeCharacters(WaitPeriodDef)); // 独自の方法で、このパラメータ分だけウェイトするよ（元のツクールもともとの待ち時間は無視するよ）
                    break;
                case '|':
                    this.startWait(ConvertEscapeCharacters(WaitLineDef));   // 独自の方法で、このパラメータ分だけウェイトするよ（元のツクールもともとの待ち時間は無視するよ）
                    break;
                default:
                    _Window_Message_processEscapeCharacter.call(this, code, textState); // それ以外の制御文字が付いている場合は、元のツクールもともとのメソッドを呼び出すよ（これ、すごい競合対策だよ）
            }
        }
    };

})();