//=============================================================================
// MOT_ScriptCommandExtension_old.js (プラグインパラメータはないので、ファイル名は好きに変更してもらって構いません)
//=============================================================================
// MOTplugin - イベントのスクリプト拡張
// 作者: 翠 (http://midori.wp.xdomain.jp/)
// Version: 1.0
// 最終更新日: 2016/03/11
//=============================================================================
//■更新履歴
/*
  2016/03/11 - 公開
  2016/06/06 merusaiaがエラー時の画面遷移に対応
*/
//=============================================================================
/*■利用規約
 *-クレジットの表記
 *  クレジットの表記は基本的に不要です。
 *  表記する場合はホームページを参照してください。
 *  営利目的での使用する場合は表記してください。
 *
 *  表記例
 *  スクリプト素材 翠 (http://midori.wp.xdomain.jp/)
 *  または
 *  スクリプト素材 HM Project (http://midori.wp.xdomain.jp/)
 *
 *-スクリプトの改変/配布
 *  スクリプトの改変はご自由に行ってください。
 *  改変を行って発生したバグ等には対処しません。
 *
 *-スクリプトの再配布
 *  そのままの再配布は禁止とさせていただきます。
 *  改造した物を配布する場合、オリジナルのクレジットを残してもらえれば
 *  配布することを可能とします。
 *  ※改造の有無に関わらず素材を有料で配布する場合は禁止とさせていただきます。
 *  ※ゲームに含まれる場合のみ再配布可能とします。
 *
 *-使用可能なゲームのジャンル
 *  エログロなんでも使用可能です。
 *
*/
//=============================================================================
/*:
 * @plugindesc イベントのスクリプト拡張
 * @author 翠、merusaia（エラー時の画面遷移に対応）
 * @help
 * ■利用規約
 * 本プラグインの中に記述してある物、または配布サイト
 * の利用規約をご確認ください。
 *
 * ■プラグイン概要
 *　スクリプト連続で配置した場合、一つの
 *　スクリプトとして判別しますので行数制限が気にならなくなります。
 * ■使用方法
 *　イベントのスクリプトを連続で配置してください。
 *　
 * ↓以下、merusaiaが追記。
 * 
 * ・翠さんが作成された、エディタ上でスクリプト命令を２個以上並べて使える、超便利なプラグインです。
 *   スクリプトを多用する人は、是非使ってみてください。
 * ・エラー遷移にも対応し、本番プレイ中は強制終了を防ぐ（try～catchでエラー箇所のeval(script)をすっ飛ばす）機能を付けました。
 *  このパラメータがONの時は、強制終了によりユーザさんの大事なプレイデータが消える心配が、少しだけ少なくなります。
 *  テストプレイ中強制終了も、予期せぬプレイデータの喪失はストレスになるため、同じく飛ばしています。
 *  （パラメータがONであれ、OFFであれ、スタックトレースはデバッグに出力します）
 * ・merusaiaが追記したものについては、著作権は放棄しますので、ご自由に使ってください。バグ報告などは、ツイッター ＠merusaia まで。
 * 
 * ■競合について
 * ・Game_Interpreter.prototype.command355 を上書きしています。競合にご注意ください。
 *  スクリプト命令の実行時に何かしらの処理を行うプラグインとは、併用できません。
 *  どうしても併用したい場合は、このソースの中に追記してください。
 * 
 */
//============================================================
//■Game_Interpreter
//============================================================
Game_Interpreter.prototype.command355 = function() {
    var script = this.currentCommand().parameters[0] + '\n';
    while (this.nextEventCode() === 655) {
        this._index++;
        script += this.currentCommand().parameters[0] + '\n';
    }
    while (this.nextEventCode() === 355) {
        this._index++;
        script += this.currentCommand().parameters[0] + '\n';
        while (this.nextEventCode() === 655) {
            this._index++;
            script += this.currentCommand().parameters[0] + '\n';
        }
    }
    // 以下、eval(script);だけだと、スクリプトによっては「undefined is not function」エラーになる時があるので、try-catchで原因を調べられるようにしました（merusaia）。
    try{
      eval(script);
    } catch (e) {
      // 本番時は、例外発生時は極力スルーします（エラーで強制終了して、ユーザさんがせっかく遊んだプレイデータ喪失を防ぐため）。
      if (!Utils.isOptionValid('test')) {
        // (i)本番時は、例外が発生したことだけを、consoleに出力し、例外が発生したスクリプトは飛ばします（複数行にまたがるのを一気に飛ばすこともあるので注意）。
        console.error(e.message);
        console.error(e.filename, e.lineno);
        console.log("★例外発生箇所: "+script);
      }else{
        // (ii)テストプレイ時は、該当のスクリプトの先頭3行を、alertして画面に表示します。（これで原因を特定しやすくなります）
        console.error(e.message);
        console.error(e.filename, e.lineno);
        alert("★例外発生箇所: "+script);
        //eval(script); // もっかい実行して、わざとエラーにして落ちます。（テストプレイ時も強制終了を無視したい場合、この行をコメント）。
      }
    }
    return true;
};