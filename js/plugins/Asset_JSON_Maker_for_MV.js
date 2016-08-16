//=============================================================================
// Asset_JSON_Maker_for_MV
// ----------------------------------------------------------------------------
// Copyright (c) 2016 fftfantt
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 0.1.0 2016/7/12 β版
// 0.5.0 2016/7/15 ファイルの書き出し方法やエラー処理などを変更
// ----------------------------------------------------------------------------
// [HomePage]: https://googledrive.com/host/0BxiSZT-B8lvFOUFhVTF6VjNnUGc/index.html 
// [Twitter] : https://twitter.com/fftfantt/
// [GitHub]  : https://github.com/fftfantt/
//=============================================================================
/*:
 * @plugindesc 使用素材一覧JSON作成
 * @author fftfantt
 * 
 * @param nameJSON
 * @desc 書き出すJSONのファイル名
 * @default MV_Project.json
 * 
 * @param extension
 * @desc 素材名を拡張子付きで書き出すか YES or NO
 * @default NO
 * @help
 * 
 * ■注意
 *  このプラグインはローカルファイルの削除および上書き(作成)を行います。
 *  使用前にバックアップを取ることを強く推奨します。
 *  MITライセンスの記載どおり、当プラグインにより必要なファイルが削除
 *  されてしまっても責任は負いかねますので、あらかじめご了承ください。
 *
 * ■説明
 * このプラグインは使用素材一覧のJSON素材を生成します。
 * プラグインコマンド「MakeAssetJSON」を実行すると現行のプロジェクト
 * フォルダを解析して素材一覧のJSONファイルを作成します。
 * プラグインコマンド「DeleteAssetJSON」を実行すると素材一覧のJSON
 * ファイルを削除します。
 *  JSONの内容を解析して不要ファイルを削除するようなプラグインとの連携
 * を行う場合、「DeleteAssetJSON」で素材一覧のJSONがあらかじめ削除して、
 * 削除プラグイン実行後に「MakeAssetJSON」でJSONを再作成してください。
 * 
 * ■利用規約
 * 当プラグインはMITライセンスのもとで公開されています。
 * https://osdn.jp/projects/opensource/wiki/licenses%2FMIT_license
 * ヘッダーのライセンス表記のみ残してください。
 * 商用利用、年齢制限のあるゲームへの使用、改変が可能です。
 * クレジットは不要です。
 * 当プラグインの不具合に損害の責任についても、MITライセンスの表記どおりです。 
*/
 
(function() {
'use strict';

// プロジェクトディレクトリー
  DataManager.databaseDirectoryPath = function() {
    var path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, "");
    if (path.match(/^\/([A-Z]\:)/)) {
        path = path.slice(1);
    }
    return decodeURIComponent(path);
  };

//拡張子除外
 function   excludExtension(files){
    for (var i=0 ; i< files.length ; i++){
      if  (extension.toUpperCase() === 'NO') {
        files[i]=files[i].match(/(.*)(?:\.([^.]+$))/)[1] ;
      }
    };
    return files;
  };

//ファイルリスト
  function outFileList(kind,dir) {
    try{
    var files = fs.readdirSync(dir);
    files = excludExtension(files);
    strJSON[kind] = files;
    } catch(e) { 
      if (e.code === "ENOENT"  && e.errno === -4058 && e.syscall === "scandir"){
        strJSON[kind] = [];
      } else {
        console.log(e)
      }
    };
  };

//フォルダリスト
  function outDirList(dir){
  fs.readdirSync(dir).forEach(function (file){
    if(fs.statSync( dir + file + '/').isDirectory())
      outFileList( file ,dir + file + '/');
    });
  };

// 変数宣言
  var parameters = PluginManager.parameters('Asset_JSON_Maker_for_MV');
  var nameJSON = parameters['nameJSON'];
  var extension = parameters['extension'];
  var dir = DataManager.databaseDirectoryPath();
  var fs = require('fs');
  var strJSON = {};

// コマンド実行
  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (!StorageManager.isLocalMode()) return;
    if (command.toUpperCase() === "MAKEASSETJSON" ) {
      outDirList(dir + '/audio/');
      outDirList(dir + '/img/');
      outFileList('moves' , dir + '/moves/');
      fs.writeFileSync(dir + '/data/' + nameJSON , JSON.stringify(strJSON, null));
      console.log('JSON Maked');
    } else if  (command.toUpperCase() === "DELETEASSETJSON" ) {
      try{
        fs.unlinkSync(dir + '/data/' + nameJSON);
        console.log('JSON deleted');
      } catch(e){console.log(e)}
    };
  };

})();