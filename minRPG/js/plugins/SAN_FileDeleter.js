//=============================================================================
// SAN_FileDeleter.js
//=============================================================================
// Copyright (c) 2016 Sanshiro
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc SAN_FileDeleter ver1.01
 * @author Sanshiro https://twitter.com/rev2nym
 * 
 * @help
 * It's possible to commercial use, distribute, and modify under the MIT license.
 * But, don't eliminate and don't alter a comment of the beginning.
 * If it's good, please indicate an author name on credit.
 * 
 * Author doesn't shoulder any responsibility in all kind of damage by using this.
 * And please don't expect support. X(
 *
 */

/*:ja
 * @plugindesc 未使用素材ファイル削除 ver1.01
 * 使用前に必ずバックアップを取ってください。
 * @author サンシロ https://twitter.com/rev2nym
 * @version 1.01 2016/07/06 '$'や'!'等を含む名前のファイルを削除する不具合を修正。その他リファクタリング。
 * 1.00 2016/07/05 公開。
 * 
 * @help
 * 未使用と推定される画像ファイルと音声ファイルを削除します。
 * ローカルモード起動時において、audioフォルダとimgフォルダ内のファイル名を
 * dataフォルダとjsフォルダ内のファイル内容から検索し、未検出なら削除します。
 * 
 * ！！注意！！
 * このプラグインはプロジェクト内のファイルを削除します。
 * 使用前に必ずバックアップを取ってください。
 * 
 * ファイル削除を実行するには以下のプラグインコマンドを実行します。
 *   SAN_FileDeleter DeleteFiles
 * 
 * ローカルモード時以外では何も起きません。
 * 
 * MITライセンスのもと、商用利用、改変、再配布が可能です。
 * ただし冒頭のコメントは削除や改変をしないでください。
 * よかったらクレジットに作者名を記載してください。
 * 
 * これを利用したことによるいかなる損害にも作者は責任を負いません。
 * サポートは期待しないでください＞＜。
 */


var Imported = Imported || {};
Imported.SAN_FileDeleter = true;

var Sanshiro = Sanshiro || {};
Sanshiro.FileDeleter = Sanshiro.FileDeleter || {};
Sanshiro.FileDeleter.version = '1.01';

(function (SAN) {
'use strict';

//-----------------------------------------------------------------------------
// FileDeleter
//
// ファイルデリータ

function FileDeleter () {};

// インデックスファイルディレクトリパス
FileDeleter.indexDirectoryPath = function () {
    var path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, '');
    if (path.match(/^\/([A-Z]\:)/)) {
        path = path.slice(1);
    }
    return decodeURIComponent(path);
};

// データベースファイルディレクトリパス
FileDeleter.dataDirectoryPath = function () {
    return this.indexDirectoryPath() + '/data';
};

// スクリプトファイルディレクトリパス
FileDeleter.jsDirectoryPath = function () {
    return this.indexDirectoryPath() + '/js';
};

// 画像ファイルディレクトリパス
FileDeleter.imgDirectoryPath = function () {
    return this.indexDirectoryPath() + '/img';
};

// 音声ファイルディレクトリパス
FileDeleter.audioDirectoryPath = function () {
    return this.indexDirectoryPath() + '/audio';
};

// ディレクトリ内ファイル探索
FileDeleter.walkDirectry = function (directoryPath, pathList) {
    if (StorageManager.isLocalMode()) {
        var fs = require('fs');
        var paths = fs.readdirSync(directoryPath);
        paths.forEach(function (path) {
            path = directoryPath + '/' + path;
            if (fs.statSync(path).isDirectory()) {
                this.walkDirectry(path, pathList);
            } else {
                pathList.push(path);
                return;
            }
        }, this);
    }
};

// 素材ファイルリスト
FileDeleter.asettFileList = function () {
    var fileList = [];
    this.walkDirectry(this.imgDirectoryPath(), fileList);
    this.walkDirectry(this.audioDirectoryPath(), fileList);
    return fileList;
};

// 制御ファイルリスト
FileDeleter.controlFileList = function() {
    var fileList = [];
    this.walkDirectry(this.dataDirectoryPath(), fileList);
    this.walkDirectry(this.jsDirectoryPath(), fileList);
    return fileList;
};

// 削除ファイルリスト
FileDeleter.deleteFileList = function() {
    var assetFileList = this.asettFileList();
    var usedFileList = [];
    var deleteFileList = [];
    var controlFileList = this.controlFileList();
    for (var i = 0; i < assetFileList.length; i++) {
        for (var j = 0; j < controlFileList.length; j++) {
            if (this.isFound(assetFileList[i], controlFileList[j])) {
                usedFileList.push(assetFileList[i]);
                break;
            }
        }
    }
    deleteFileList = assetFileList.filter(function(assetFilePath) {
        return usedFileList.indexOf(assetFilePath) === -1
    });
    /*
    deleteFileList.forEach(function(FilePath) {
        console.log(FilePath);
    });
    */
    console.log('files asset   : ', assetFileList.length);
    console.log('files used    : ', usedFileList.length);
    console.log('files deleted : ', deleteFileList.length);
    return deleteFileList;
};

// 制御ファイル内容のキャッシュ
FileDeleter.controlFileCache = {};

// 素材ファイル名が制御ファイルに含まれるか
FileDeleter.isFound = function (assetFilePath, controlFilePath) {
    if (StorageManager.isLocalMode()) {
        var assetFilename = assetFilePath.split('/').pop().split('.').shift();
        var regExp = new RegExp(assetFilename.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1"));
        var controlFileText = "";
        if (!!this.controlFileCache[controlFilePath]) {
            controlFileText = this.controlFileCache[controlFilePath];
        } else {
            var fs = require('fs');
            controlFileText = fs.readFileSync(controlFilePath, 'utf-8');
            this.controlFileCache[controlFilePath] = controlFileText;
        }
        return controlFileText.search(regExp) !== -1;
    }
};

// 未使用素材ファイルの削除
FileDeleter.deleteFiles = function () {
    if (StorageManager.isLocalMode()) {
        var deleteFileList = this.deleteFileList();
        var fs = require('fs');
        deleteFileList.forEach(function (deleteFilePath) {
            fs.unlinkSync(deleteFilePath);
        });
    } else {
        console.log("It is not LocalMode.")
    }
};

//-----------------------------------------------------------------------------
// Game_Interpreter
//
// インタープリター

// プラグインコマンド
SAN.FileDeleter.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
    SAN.FileDeleter.Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'SAN_FileDeleter') {
        switch (args[0]) {
        case 'DeleteFiles':
            FileDeleter.deleteFiles();
            break;
        }
    }
};

}) (Sanshiro);