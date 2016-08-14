
//=============================================================================
// SAN_IndexedSaveTEST.js
//=============================================================================
// Copyright (c) 2016 Sanshiro
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

var Imported = Imported || {};
Imported.SAN_IndexedSave = true;

var Sanshiro = Sanshiro || {};
Sanshiro.IndexedSave = Sanshiro.IndexedSave || {};
Sanshiro.IndexedSave.version = '0.00';

(function (SAN) {

//-----------------------------------------------------------------------------
// StorageManager
//
// ストレージマネージャ

// セーブ
StorageManager.save = function(savefileId, json) {
    if (savefileId > 0) {
        console.log(LZString.compressToBase64(json).length);
        IndexManager.indexing(JSON.parse(json));
        IndexManager.save();
        json = IndexManager.encode(json);
        console.log(LZString.compressToBase64(json).length);
    }
    if (this.isLocalMode()) {
        this.saveToLocalFile(savefileId, json);
    } else {
        this.saveToWebStorage(savefileId, json);
    }
};

// ロード
StorageManager.load = function(savefileId) {
    if (savefileId > 0) {
        IndexManager.load();
    }
    if (this.isLocalMode()) {
        return IndexManager.decode(this.loadFromLocalFile(savefileId));
    } else {
        return IndexManager.decode(this.loadFromWebStorage(savefileId));
    }
};

// セーブファイルローカルパス
StorageManager.localFilePath = function(savefileId) {
    var name;
    if (savefileId === -2) {
        name = 'index.rpgsave';
    } else if (savefileId === -1) {
        name = 'config.rpgsave';
    } else if (savefileId === 0) {
        name = 'global.rpgsave';
    } else {
        name = 'file%1.rpgsave'.format(savefileId);
    }
    return this.localFileDirectoryPath() + name;
};

// セーブファイルウェブストレージキー
StorageManager.webStorageKey = function(savefileId) {
    if (savefileId === -2) {
        return 'RPG Index';
    } else if (savefileId === -1) {
        return 'RPG Config';
    } else if (savefileId === 0) {
        return 'RPG Global';
    } else {
        return 'RPG File%1'.format(savefileId);
    }
};

//-----------------------------------------------------------------------------
// IndexManager
//
// インデックスマネージャ

var IndexManager = {};

// キーインデックスリスト
IndexManager._list = [];

// キーインデックス化
IndexManager.indexing = function (data) {
    var type = Object.prototype.toString.call(data);
    switch (type) {
    case '[object Array]':
        for (var i = 0; i < data.length; i++) {
            this.indexing(data[i]);
        }
    break;
    case '[object Object]':
        for (var key in data) {
            if (this._list.indexOf(key) === -1) {
                this._list.push(key);
            }
            this.indexing(data[key]);
        }
    break;
    }
};

// エンコード（JSON文字列のキーをインデックスで置換）
IndexManager.encode = function (json) {
    for (var i = 0; i < this._list.length; i++) {
        var key = '\"' + this._list[i] + '\"\:';
        var index = '\"@' + i.toString(16) + '\"\:';
        var regExp = new RegExp(this.escapeRegExp(key), 'g');
        console.log(key, index);
        json = json.replace(regExp, index);
    }
    return json;
};

// デコード（JSON文字列のインデックスをキーで置換）
IndexManager.decode = function (json) {
    for (var i = 0; i < this._list.length; i++) {
        var key = '\"' + this._list[i] + '\"\:';
        var index = '\"@' + i.toString(16) + '\"\:';
        var regExp = new RegExp(this.escapeRegExp(index), 'g');
        json = json.replace(regExp, key);
    }
    return json;
};

// 正規表現エスケープ文字の置換
IndexManager.escapeRegExp = function (string) {
  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
}

// インデックスファイルのロード
IndexManager.load = function() {
    var json = null;
    try {
        json = StorageManager.load(-2);
    } catch (e) {
        console.error(e);
    }
    if (!!json) {
        this._list = JSON.parse(json);
    }
};

// インデックスファイルのセーブ
IndexManager.save = function () {
    StorageManager.save(-2, JSON.stringify(this._list));
};

// インデックスリスト
IndexManager.list = function () {
    return this._list;
};

}) (Sanshiro);