//=============================================================================
// SAN_ActorGraphicsReactor.js
//=============================================================================
// Copyright (c) 2016 Sanshiro
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc アクターグラフィクスリアクター ver2.04
 * 職業、装備、スキル、ステートをグラフィックに反映させます。
 * @author サンシロ https://twitter.com/rev2nym
 * @version 2.04 2016/08/13 ツクールMV ver1.3.0 対応、画像キャッシュ処理の変更。
 * 2.03 2016/07/16 ディレクトリパスに'www'が含まれるとエディタシーン開始時にエラー終了する不具合を修正。
 * 2.02 2016/06/23 分割有無が反映されない不具合を修正。分割有無とインデックスにnullを選択可能とし、null以外はマージされるよう変更。
 * 2.01 2016/06/23 イベントコマンドの全回復で回復したときグラフィックが反映されない不具合を修正。
 * 2.00 2016/06/23 ver2.00 公開
 * @help
 * このプラグインには以下の2つの機能を実装しています。
 *
 * 1. グラフィック反映機能
 * アクターの歩行、顔、サイドビューバトルグラフィックに
 * 職業、装備、スキル、ステートを反映する機能です。
 *
 * 2. データ編集機能
 * グラフィック反映機能のデータを編集する機能です。
 *
 * プロジェクトのdataフォルダに以下のJSONファイルを保存してください。
 *   SAN_ActorGraphicsReactor.json
 * このJSONファイルはプラグインと併せて公開されます。
 *
 * 1. グラフィック反映機能
 * アクター、職業、装備、スキル、ステートに対応したグラフィックを積層表示します。
 * それぞれの画像の不透明度の変更、HLS（色相・彩度・明度）変換が可能です。
 * またイベントのグラフィックにアクターのグラフィックを反映することが可能です。
 * 表示優先度は アクター < 職業 < 装備 < スキル < ステート の順です。
 *
 * RPGツクールMVのデータベース編集画面のアクター、職業、装備、スキル、ステートの
 * メモ欄に以下の書式で読み込むデータの設定を行います。
 *   <SAN_ActorGraphicsReactor:[
 *     {"type":"characters", "name":"レイヤーセット名称"},
 *     {"type":"faces",      "name":"レイヤーセット名称"},
 *     {"type":"sv_actors",  "name":"レイヤーセット名称"}
 *   ]>
 *   "type" : グラフィックのタイプです。
 *            "characters"、"faces"、"sv_actors"のいずれかを設定してください。
 *   "name" : レイヤーセット名称です。
 * データが未設定の場合はデフォルト設定のグラフィックが使用されます。
 * 
 * アクターのグラフィックをイベントに反映させるには
 * 以下のプラグインコマンドを実行してください。
 *   SAN_ActorGraphicsReactor SetActorId イベントID アクターID
 * イベントIDが 0 の場合は実行したイベント（このイベント）が対象になります。
 * 例 : SAN_ActorGraphicsReactor SetActorId 0 1
 *      このイベントにアクター1のグラフィックを反映します。
 *
 * 2. データ編集機能
 * グラフィック反映機能で使用するデータをゲーム上で編集します。
 * 以下のプラグインコマンドを実行してください。
 *   SAN_ActorGraphicsReactor CallEditor
 * 使用する画像ファイルはimg/characters、img/faces、img/sv_actorsフォルダに
 * それぞれ保存してください。
 * これらのフォルダ内であれば更に深いフォルダ内の画像ファイルも使用可能です。
 * データの保存や削除はローカルモード時（テスト実行時やexe実行時）のみ可能です。
 * 
 * プラグインパラメータはありません。
 * 
 * MITライセンスのもと、商用利用、改変、再配布が可能です。
 * ただし冒頭のコメントは削除や改変をしないでください。
 * よかったらクレジットに作者名を記載してください。
 * 
 * これを利用したことによるいかなる損害にも作者は責任を負いません。
 * サポートは期待しないでください＞＜。
 */

var Imported = Imported || {};
Imported.SAN_ActorGraphicsReactor = true;

var Sanshiro = Sanshiro || {};
Sanshiro.ActorGraphicsReactor = Sanshiro.ActorGraphicsReactor || {};
Sanshiro.ActorGraphicsReactor.version = '2.04';

(function (SAN) {
'use strict';

//-----------------------------------------------------------------------------
// DataManager
//
// データマネージャ

// データベースファイル
DataManager._databaseFiles.push(
    { name: '$dataActorGraphicsReactor', src: 'SAN_ActorGraphicsReactor.json' }
);

// セーブファイルインフォ作成
SAN.ActorGraphicsReactor.DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
DataManager.makeSavefileInfo = function () {
    var info = SAN.ActorGraphicsReactor.DataManager_makeSavefileInfo.call(this);
    info.actorGraphicsReactorInfo = $gameParty.actorGraphicsReactorsSavefileInfo();
    return info;
};

//-----------------------------------------------------------------------------
// SceneManager
//
// シーンマネージャ

// シーン判定
SceneManager.scene = function () {
    return this._scene;
};

//-----------------------------------------------------------------------------
// ActorGraphicsReactor
//
// アクターグラフィクスリアクター

function ActorGraphicsReactor() {
    this.initialize.apply(this, arguments);
}

// プラグインバージョン一致判定
ActorGraphicsReactor.prototype.isCurrentVersion = function () {
    return this._version === SAN.ActorGraphicsReactor.version;
};

// オブジェクト初期化
ActorGraphicsReactor.prototype.initialize = function (type, name) {
    this._version = SAN.ActorGraphicsReactor.version;
    this._type = type || 'faces';
    this._name = name || 'new';
    this._serialCount = 0;
    this.clearLayers();
};

// レイヤーのクリア
ActorGraphicsReactor.prototype.clearLayers = function () {
    var effectParameters = {}
    this._effectLayer = new ActorGraphicsLayer(this._type, this._name);
    this._effectLayer.setup({label: 'Effect'});
    this._graphicLayers = [];
};

// リアクターパラメータによるセットアップ
ActorGraphicsReactor.prototype.setupByParameters = function (parameters) {
    this.clearLayers();
    this.mergeParameters(parameters);
    this.progressSerialCount();
};

// リアクターネームによるセットアップ
ActorGraphicsReactor.prototype.setupByName = function (name) {
    this._name = name;
    var parameters = parametersFromDatabase(name);
    this.setupByParameters(parameters);
};

// データベースからのリアクターパラメータ
ActorGraphicsReactor.prototype.parametersFromDatabase = function (name) {
    var parameters = $dataActorGraphicsReactor.reactors.filter(function (parameters) {
        return (parameters.type === this._type && parameters.name === name);
    }, this);
    return parameters;
};

// アクターIDによるセットアップ
ActorGraphicsReactor.prototype.setupByActorId = function (actorId) {
    var parameters = []
    var items = this.items(actorId);
    var names = this.namesFromItems(items);
    names.forEach(function (name){
        parameters = parameters.concat(this.parametersFromDatabase(name));
    }, this);
    this.setupByParameters(parameters);
};

// アイテムリストからのリアクター名称
ActorGraphicsReactor.prototype.namesFromItems = function (items) {
    var names = [];
    items.forEach(function(item) {
        var name = this.nameFromItem(item);
        if (!!name) {
            names.push(name);
        }
    }, this);
    return names;
};

// アイテムからのリアクター名称
ActorGraphicsReactor.prototype.nameFromItem = function (item) {
    var note = item.meta.SAN_ActorGraphicsReactor;
    if (!note) {
        return undefined;
    }
    var meta = JSON.parse(note);
    for (var i = 0; i < meta.length; i++) {
        if (meta[i].type === this._type) {
            return meta[i].name;
        }
    }
    return undefined;
};

// アイテムリスト
ActorGraphicsReactor.prototype.items = function (actorId) {
    var actor = $gameActors.actor(actorId);
    var items = [];
    items.push(actor.actor());
    items.push(actor.currentClass());
    items = items.concat(actor.equips());
    items = items.concat(actor.skills());
    items = items.concat(actor.states());
    items = items.filter(function (item) {
        return !!item;
    });
    return items;
};

// リアクターのマージ
ActorGraphicsReactor.prototype.mergeParameters = function (reactorParameters) {
    reactorParameters.forEach(function (layerParameters) {
        var layer = this.graphicLayerByDepthZ(layerParameters.depthZ);
        if (!!layer) {
            layer.mergeParameters(layerParameters);
        } else {
            this.addLayer(layerParameters);
        }
    }, this);
    this.sortLayers();
};

// キャッシュキー
ActorGraphicsReactor.prototype.cacheKey = function () {
    var cacheKey = 'reactor'
    cacheKey += (':' + this._effectLayer.cacheKey());
    this._graphicLayers.forEach(function (graphicLayer) {
        cacheKey += (':' + graphicLayer.cacheKey());
    }, this);
    return cacheKey;
};

// ビットマップ取得 (ビットマップ積層処理)
ActorGraphicsReactor.prototype.bitmap = function () {
    // キャッシュからビットマップを取得
    if (!!ImageManager.cache.getItem(this.cacheKey())) {
        return ImageManager.cache.getItem(this.cacheKey());
    }
    if (!this.isReady() || this.isEmpty()) {
        return new Bitmap(1, 1);
    }
    // パターン一時転送先ビットマップリスト
    var ptnBitmaps = [];
    for (var ptnIndex = 0; ptnIndex < this.ptnNumX() * this.ptnNumY(); ptnIndex++) {
        ptnBitmaps[ptnIndex] = new Bitmap(Graphics.width, Graphics.height);
    }
    // 一時転送先矩形の中心
    var ptnCx = Graphics.width / 2;
    var ptnCy = Graphics.height / 2;
    // パターン毎のビットマップの矩形 (最終転送時に使用)
    var ptnRect = new Rectangle(ptnCx, ptnCy, 1, 1);
    var baseLayer = null;
    // グラフィック毎の積層処理
    for (var graIndex = 0; graIndex < this._graphicLayers.length; graIndex++) {
        var srcLayer = this._graphicLayers[graIndex];
        // 転送元ビットマップ (1人単位)
        var srcBitmap = srcLayer.bitmap();
        // 転送元矩形の幅と高さ
        var srcWidth = srcBitmap.width / this.ptnNumX();
        var srcHeight = srcBitmap.height / this.ptnNumY();
        // パターン毎に一時転送先ビットマップに転送
        for (var ptnIndex = 0; ptnIndex < this.ptnNumX() * this.ptnNumY(); ptnIndex++) {
            // 転送元矩形の原点
            var srcOx = Math.floor(ptnIndex % this.ptnNumX()) * srcWidth;
            var srcOy = Math.floor(ptnIndex / this.ptnNumX()) * srcHeight;
            // 一時転送先矩形の原点
            var ptnOx = ptnCx - srcWidth / 2 + srcLayer.offsetX();
            var ptnOy = ptnCy - srcHeight / 2 + srcLayer.offsetY();
            // 一時転送先ビットマップに転送元のビットマップを転送
            ptnBitmaps[ptnIndex].blt(srcBitmap, srcOx, srcOy, srcWidth, srcHeight, ptnOx, ptnOy);
        }
        // 一時転送先ビットマップの矩形 (全パターン共通) を記録
        ptnRect.width = Math.max(ptnRect.width, (srcWidth / 2 + Math.abs(srcLayer.offsetX())) * 2);
        ptnRect.height = Math.max(ptnRect.height, (srcHeight / 2 + Math.abs(srcLayer.offsetY())) * 2);
        ptnRect.x = Math.min(ptnRect.x, ptnCx - ptnRect.width / 2);
        ptnRect.y = Math.min(ptnRect.y, ptnCy - ptnRect.height / 2);
        // 表示Yオフセットの基準となるグラフィックの更新
        // 表示優先度が0.0に近いグラフィックを基準とする
        baseLayer = !!baseLayer ? baseLayer : srcLayer;
        baseLayer = Math.abs(baseLayer.parameters().depthZ) < Math.abs(srcLayer.parameters().depthZ) ? baseLayer : srcLayer;
    }
    // 表示Yオフセットの更新
    this._effectLayer.parameters().offsetY = (ptnRect.height - baseLayer.bitmap().height / this.ptnNumY()) / 2;
    // 最終転送ビットマップ
    var destBitmap = new Bitmap(ptnRect.width * this.ptnNumX(), ptnRect.height * this.ptnNumY());
    // 一時転送ビットマップ毎に最終転送先ビットマップに転送
    for (var ptnIndex = 0; ptnIndex < this.ptnNumX() * this.ptnNumY(); ptnIndex++) {
        var ptnBitmap = ptnBitmaps[ptnIndex];
        var destOx = Math.floor(ptnIndex % this.ptnNumX()) * ptnRect.width;
        var destOy = Math.floor(ptnIndex / this.ptnNumX()) * ptnRect.height;
        destBitmap.blt(ptnBitmap, ptnRect.x, ptnRect.y, ptnRect.width, ptnRect.height, destOx, destOy);
    }
    // 積層後グラフィックのHSL変換
    if (this._effectLayer.parameters().hslValid) {
        destBitmap.hslTransform(
            this._effectLayer.parameters().hslH,
            this._effectLayer.parameters().hslS,
            this._effectLayer.parameters().hslL
        );
    }
    // 積層後グラフィックの不透明度変更
    if (this._effectLayer.alpha() !== 1.0) {
        destBitmap.alphaTransform(this._effectLayer.alpha());
    }
    // キャッシュにビットマップを登録
    if (SceneManager.scene().constructor !== Scene_ActorGraphicsEditor) {
        ImageManager.cache.setItem(this.cacheKey(), destBitmap);
    }
    return destBitmap;
};

// パターン列数
ActorGraphicsReactor.prototype.ptnNumX = function () {
    return (
        this._type === 'faces'      ? 1 :
        this._type === 'characters' ? 3 :
        this._type === 'sv_actors'  ? 9 :
        undefined
    );
};

// パターン行数
ActorGraphicsReactor.prototype.ptnNumY = function () {
    return (
        this._type === 'faces'      ? 1 :
        this._type === 'characters' ? 4 :
        this._type === 'sv_actors'  ? 6 :
        undefined
    );
};

// オフセット X
ActorGraphicsReactor.prototype.offsetX = function () {
    return this._effectLayer.offsetX();
};

// オフセット Y
ActorGraphicsReactor.prototype.offsetY = function () {
    return this._effectLayer.offsetY();
};

// リアクター名称
ActorGraphicsReactor.prototype.name = function () {
    return this._name;
};

// リアクター名称の設定
ActorGraphicsReactor.prototype.setName = function (name) {
    this._name = name;
    this._effectLayer.parameters().name = name;
    this._graphicLayers.forEach(function (layer) {
        layer.parameters().name = name;
    });
};

// パラメータ
ActorGraphicsReactor.prototype.parameters = function () {
    var parameters = [this._effectLayer.parameters()];
    for (var i = 0; i < this._graphicLayers.length; i++) {
        parameters.push(this._graphicLayers[i].parameters());
    }
    return parameters;
};

// グラフィックレイヤーリスト
ActorGraphicsReactor.prototype.graphicLayers = function () {
    return this._graphicLayers;
};

// グラフィックレイヤー
ActorGraphicsReactor.prototype.graphicLayer = function (index) {
    return this._graphicLayers[index];
};

// 表示優先度Zによるグラフィックレイヤー
ActorGraphicsReactor.prototype.graphicLayerByDepthZ = function (depthZ) {
    var index = -1;
    for (var i = 0; i < this._graphicLayers.length; i++) {
        if (this._graphicLayers[i].parameters().depthZ === depthZ) {
            index = i;
            break;
        }
    }
    if (depthZ === null) {
        return this._effectLayer;
    } else if (index !== -1) {
        return this._graphicLayers[index];
    } else {
        return undefined;
    }
};

// エフェクトレイヤー
ActorGraphicsReactor.prototype.effectLayer = function () {
    return this._effectLayer;
};

// レイヤーのソート
ActorGraphicsReactor.prototype.sortLayers = function () {
    this._graphicLayers.sort(function (layer1, layer2) {
        if (layer1.parameters().depthZ < layer2.parameters().depthZ) { return -1; }
        if (layer1.parameters().depthZ > layer2.parameters().depthZ) { return  1; }
        if (layer1.parameters().label  < layer2.parameters().label ) { return -1; }
        if (layer1.parameters().label  > layer2.parameters().label ) { return  1; }
        return 0;
    });
};

// レイヤーの追加
ActorGraphicsReactor.prototype.addLayer = function (layerParameters) {
    if (this._graphicLayers.length < 100) {
        var layer = new ActorGraphicsLayer(this._type, this._name);
        layer.parameters().depthZ = 0.0;
        layer.setup(layerParameters);
        this.serializeLabel(layer);
        this._graphicLayers.push(layer);
    }
    this.sortLayers();
};

// レイヤーの削除
ActorGraphicsReactor.prototype.deleteLayer = function (index) {
    var isDifferentIndex = function (layer, index) { return index !== Number(this); };
    this._graphicLayers = this._graphicLayers.filter(isDifferentIndex, index);
    this.sortLayers();
};

// レイヤーを一つ上に移動
ActorGraphicsReactor.prototype.moveUpLayer = function (index) {
    if (index < 0) {
        return;
    }
    var index2 = index + 1;
    this.swapLayers(index, index2);
};

// レイヤーを一つ下に移動
ActorGraphicsReactor.prototype.moveDownLayer = function (index) {
    if (index >= this._graphicLayers.length) {
        return;
    }
    var index2 = index - 1;
    this.swapLayers(index, index2);
};

// レイヤーの表示深度を交換
ActorGraphicsReactor.prototype.swapLayers = function (index1, index2) {
    var layer1 = this._graphicLayers[index1];
    var layer2 = this._graphicLayers[index2];
    var depthZ1 = layer1.parameters().depthZ;
    var depthZ2 = layer2.parameters().depthZ;
    this._graphicLayers[index1].parameters().depthZ = depthZ2;
    this._graphicLayers[index2].parameters().depthZ = depthZ1;
    this._graphicLayers[index1] = layer2;
    this._graphicLayers[index2] = layer1;
};

// ラベルシリアライズ
ActorGraphicsReactor.prototype.serializeLabel = function (layer) {
    var isOverlapLabelLayer = function (layer) {
        var labels = [];
        if (layer !== this._effectLayer) {
            labels.push(this._effectLayer.parameters().label);
        }
        this._graphicLayers.forEach(function (graphicLayer) {
            if (layer !== graphicLayer) {
                labels.push(graphicLayer.parameters().label);
            }
        }, this);
        return labels.some(function (label) {
            return label === layer.parameters().label;
        });
    };
    var relabelLayer = function (layer, suffix) {
        layer.parameters().label =
            layer.parameters().label.replace(/\(\d*\)/, '') +
            '(' + ('0' + String(suffix)).slice(-2) + ')';
    };
    if (isOverlapLabelLayer.call(this, layer)) {
        var suffix = 1;
        relabelLayer(layer, suffix);
        while (isOverlapLabelLayer.call(this, layer)) {
            suffix++;
            relabelLayer(layer, suffix);
        }
    }
};

// リアクターの準備完了判定
ActorGraphicsReactor.prototype.isReady = function () {
    return this.isEmpty() || this._graphicLayers.every(function (layer) {
        return layer.isReady();
    });
};

// レイヤーの有無判定
ActorGraphicsReactor.prototype.isEmpty = function () {
    return this._graphicLayers.length === 0;
};

// 更新通し番号の進行
ActorGraphicsReactor.prototype.progressSerialCount = function () {
    this._serialCount = (this._serialCount + 1) % 100;
};

// 更新通し番号の進行
ActorGraphicsReactor.prototype.serialCount = function () {
    return this._serialCount;
};

//-----------------------------------------------------------------------------
// ActorGraphicsLayer
//
// アクターグラフィックレイヤー

function ActorGraphicsLayer() {
    this.initialize.apply(this, arguments);
}

// オブジェクト初期化
ActorGraphicsLayer.prototype.initialize = function (type, name) {
    this.initParameters();
    this._parameters.type = type;
    this._parameters.name = name;
};

// セットアップ
ActorGraphicsLayer.prototype.setup = function (parameters) {
    this.mergeParameters(parameters);
};

// パラメータ初期化
ActorGraphicsLayer.prototype.initParameters = function () {
    this._parameters = {
        type:     null,
        name:     null,
        label:    null,
        path:     null,
        isBig:    null,
        index:    null,
        depthZ:   null,
        offsetX:  null,
        offsetY:  null,
        alpha:    null,
        hslValid: null,
        hslH:        0,
        hslS:      0.5,
        hslL:      0.5
    };
};

// レイヤーパラメータ
ActorGraphicsLayer.prototype.parameters = function () {
    return this._parameters;
};

// レイヤーのマージ
ActorGraphicsLayer.prototype.mergeParameters = function (parameters) {
    for (var key in parameters) {
        if (parameters[key] === null ||
            key === 'name' ||
            (!parameters.hslValid && (key === 'hslH' || key === 'hslS' || key === 'hslL')))
        {
            continue;
        }
        this._parameters[key] = parameters[key];
    }
    this.loadBitmap();
};

// キャッシュキー
ActorGraphicsLayer.prototype.cacheKey = function () {
    var cacheKey = 'layer'
    for(var key in this._parameters) {
        cacheKey += (':' + this._parameters[key]);
    }
    return cacheKey;
};

// ビットマップロード
ActorGraphicsLayer.prototype.loadBitmap = function () {
    if (!this._parameters.path || this._parameters.path === '') {
        return new Bitmap(1, 1);
    }
    var type = this._parameters.type;
    var path = this._parameters.path;
    var folder = 'img/' + type + '/' + (path.match(/^.*\//)||[''])[0];
    var filename = path.match(/[^\/]*$/)[0].match(/^[^\.]*/)[0];
    return ImageManager.loadBitmap(folder, filename, 0, this.smooth());
};

// ビットマップ取得 (1人分に加工)
ActorGraphicsLayer.prototype.bitmap = function () {
    // キャッシュからビットマップを取得
    if (!!ImageManager.cache.getItem(this.cacheKey())) {
        return ImageManager.cache.getItem(this.cacheKey());
    }
    var srcBitmap = this.loadBitmap();
    var srcWidth = srcBitmap.width / this.splitX();
    var srcHeight = srcBitmap.height / this.splitY();
    var srcOx = Math.floor(this.index() % this.splitX()) * srcWidth;
    var srcOy = Math.floor(this.index() / this.splitX()) * srcHeight;
    var destBitmap = new Bitmap(srcWidth, srcHeight);
    destBitmap.blt(srcBitmap, srcOx, srcOy, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);
    if (this._parameters.hslValid) {
        destBitmap.hslTransform(this._parameters.hslH, this._parameters.hslS, this._parameters.hslL);
    }
    if (this.alpha() !== 1.0) {
        destBitmap.alphaTransform(this.alpha());
    }
    // キャッシュにビットマップを登録
    if (SceneManager.scene().constructor !== Scene_ActorGraphicsEditor) {
        ImageManager.cache.setItem(this.cacheKey(), destBitmap);
    }
    return destBitmap;
};

// インデックス
ActorGraphicsLayer.prototype.index = function () {
    return (
        this._parameters.isBig === null ? 0 :
        this._parameters.isBig === true ? 0 :
        this._parameters.index === null ? 0 :
        this._parameters.index
    );
};

// 素材の X 分割数
ActorGraphicsLayer.prototype.splitX = function () {
    return (
        this._parameters.isBig === null         ? 1 :
        this._parameters.isBig === true         ? 1 :
        this._parameters.type  === 'faces'      ? 4 :
        this._parameters.type  === 'characters' ? 4 :
        this._parameters.type  === 'sv_actors'  ? 1 :
        undefined
    );
};

// 素材の Y 分割数
ActorGraphicsLayer.prototype.splitY = function () {
    return (
        this._parameters.isBig === null         ? 1 :
        this._parameters.isBig === true         ? 1 :
        this._parameters.type  === 'faces'      ? 2 :
        this._parameters.type  === 'characters' ? 2 :
        this._parameters.type  === 'sv_actors'  ? 1 :
        undefined
    );
};

// ビットマップのスムース
ActorGraphicsLayer.prototype.smooth = function () {
    return (
        this._parameters.type  === 'faces'      ? true  :
        this._parameters.type  === 'characters' ? false :
        this._parameters.type  === 'sv_actors'  ? false :
        undefined
    );
};

// オフセット X
ActorGraphicsLayer.prototype.offsetX = function () {
    return (
        this._parameters.offsetX === null ? 0 :
        this._parameters.offsetX
    );
};

// オフセット Y
ActorGraphicsLayer.prototype.offsetY = function () {
    return (
        this._parameters.offsetY === null ? 0 :
        this._parameters.offsetY
    );
};

// 不透明度アルファ
ActorGraphicsLayer.prototype.alpha = function () {
    return (
        this._parameters.alpha === null ? 1.0 :
        this._parameters.alpha
    );
};

// ビットマップ準備完了判定
ActorGraphicsLayer.prototype.isReady = function () {
    return this.loadBitmap().isReady();
};

//-----------------------------------------------------------------------------
// Bitmap
//
// ビットマップ

Bitmap.hslCache = {};

// HSL変換
Bitmap.prototype.hslTransform = function (h, s, l) {
    // RGB→HSL変換
    function rgbToHsl(r, g, b) {
        var cmin = Math.min(r, g, b);
        var cmax = Math.max(r, g, b);
        var h = 0;
        var s = 0;
        var l = (cmin + cmax) / 2;
        var delta = cmax - cmin;

        if (delta > 0) {
            if (r === cmax) {
                h = 60 * (((g - b) / delta + 6) % 6);
            } else if (g === cmax) {
                h = 60 * ((b - r) / delta + 2);
            } else {
                h = 60 * ((r - g) / delta + 4);
            }
            s = delta / (255 - Math.abs(2 * l - 255));
        }
        return [h, s, l];
    }

    // HSL→RGB変換
    function hslToRgb(h, s, l) {
        var c = (255 - Math.abs(2 * l - 255)) * s;
        var x = c * (1 - Math.abs(h / 60 % 2 - 1));
        var m = l - c / 2;
        var cm = c + m;
        var xm = x + m;

        if (h < 60) {
            return [cm, xm, m];
        } else if (h < 120) {
            return [xm, cm, m];
        } else if (h < 180) {
            return [m, cm, xm];
        } else if (h < 240) {
            return [m, xm, cm];
        } else if (h < 300) {
            return [xm, m, cm];
        } else {
            return [cm, m, xm];
        }
    }
    
    // ビットマップのHSL変更
    if (this.width > 0 && this.height > 0) {
        var context = this._context;
        var imageData = context.getImageData(0, 0, this.width, this.height);
        var pixels = imageData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] !== 0) {
                var hsl = rgbToHsl(pixels[i + 0], pixels[i + 1], pixels[i + 2]);
                hsl[0] = h;
                hsl[1] = Math.min(hsl[1] * s * 2, 255);
                hsl[2] = Math.min(hsl[2] * l * 2, 255);
                var rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
                pixels[i + 0] = rgb[0];
                pixels[i + 1] = rgb[1];
                pixels[i + 2] = rgb[2];
            }
        }
        context.putImageData(imageData, 0, 0);
        this._setDirty();
    }
};

// アルファ変換
Bitmap.prototype.alphaTransform = function (alpha) {
    if (this.width > 0 && this.height > 0) {
        var context = this._context;
        var imageData = context.getImageData(0, 0, this.width, this.height);
        var pixels = imageData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            pixels[i + 3] = Math.min(pixels[i + 3] * alpha, 255);
        }
        context.putImageData(imageData, 0, 0);
        this._setDirty();
    }
};

//-----------------------------------------------------------------------------
// Game_CharacterBase
//
// キャラクターベース

// 対応するアクターの取得
Game_CharacterBase.prototype.actor = function () {
    return undefined;
};

//-----------------------------------------------------------------------------
// Game_Player
//
// プレイヤー

// 対応するアクターの取得
Game_Player.prototype.actor = function () {
    return $gameParty.battleMembers()[0];
};

//-----------------------------------------------------------------------------
// Game_Event
//
// イベント

// オブジェクト初期化
SAN.ActorGraphicsReactor.Game_Event_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function (mapId, eventId) {
    SAN.ActorGraphicsReactor.Game_Event_initialize.call(this, mapId, eventId);
    this._actorId = undefined;
};

// 対応するアクターの取得
Game_CharacterBase.prototype.actor = function () {
    if (!!this._actorId && this._actorId > 0) {
        return $gameActors.actor(this._actorId);
    }
    return undefined;
};

// アクターIDの設定
Game_CharacterBase.prototype.setActorId = function (actorId) {
    if (!!actorId && actorId > 0) {
        this._actorId = actorId;
        var actor = $gameActors.actor(this._actorId);
        if (!!actor) {
            actor.refreshReactors();
        }
    } else {
        this._actorId = undefined;
    }
};

//-----------------------------------------------------------------------------
// Game_Actor
//
// アクター

// オブジェクト初期化
SAN.ActorGraphicsReactor.Game_Actor_initialize = Game_Actor.prototype.initialize;
Game_Actor.prototype.initialize = function (actorId) {
    SAN.ActorGraphicsReactor.Game_Actor_initialize.call(this, actorId);
};

// グラフィクスリアクター (顔グラフィック)
Game_Actor.prototype.faceReactor = function () {
    if (!this._faceReactor ||
        !this._faceReactor.isCurrentVersion ||
        !this._faceReactor.isCurrentVersion())
    {
        this._faceReactor = new ActorGraphicsReactor('faces');
        this._faceReactor.setupByActorId(this._actorId);
    }
    return this._faceReactor;
};

// グラフィクスリアクター (歩行グラフィック)
Game_Actor.prototype.characterReactor = function () {
    if (!this._characterReactor ||
        !this._characterReactor.isCurrentVersion ||
        !this._characterReactor.isCurrentVersion())
    {
        this._characterReactor = new ActorGraphicsReactor('characters');
        this._characterReactor.setupByActorId(this._actorId);
    }
    return this._characterReactor;
};

// グラフィクスリアクター (サイドビュー戦闘グラフィック)
Game_Actor.prototype.battlerReactor = function () {
    if (!this._battlerReactor ||
        !this._battlerReactor.isCurrentVersion ||
        !this._battlerReactor.isCurrentVersion())
    {
        this._battlerReactor = new ActorGraphicsReactor('sv_actors');
        this._battlerReactor.setupByActorId(this._actorId);
    }
    return this._battlerReactor;
};

// グラフィクスリアクターのリフレッシュ
Game_Actor.prototype.refreshReactors = function () {
    this.faceReactor().setupByActorId(this._actorId);
    this.characterReactor().setupByActorId(this._actorId);
    this.battlerReactor().setupByActorId(this._actorId);
};

// 職業の変更
SAN.ActorGraphicsReactor.Game_Actor_changeClass = Game_Actor.prototype.changeClass;
Game_Actor.prototype.changeClass = function (classId, keepExp) {
    SAN.ActorGraphicsReactor.Game_Actor_changeClass.call(this, classId, keepExp);
    this.refreshReactors();
};

// 装備の変更
SAN.ActorGraphicsReactor.Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
Game_Actor.prototype.changeEquip = function (slotId, item) {
    SAN.ActorGraphicsReactor.Game_Actor_changeEquip.call(this, slotId, item);
    this.refreshReactors();
};

// 装備の強制変更
SAN.ActorGraphicsReactor.Game_Actor_forceChangeEquip = Game_Actor.prototype.forceChangeEquip;
Game_Actor.prototype.forceChangeEquip = function (slotId, item) {
    SAN.ActorGraphicsReactor.Game_Actor_forceChangeEquip.call(this, slotId, item);
    this.refreshReactors();
};

// ステート情報をクリア
SAN.ActorGraphicsReactor.Game_Actor_clearStates = Game_Actor.prototype.clearStates;
Game_Actor.prototype.clearStates = function () {
    SAN.ActorGraphicsReactor.Game_Actor_clearStates.call(this);
    if (SceneManager.scene().constructor !== Scene_Boot &&
        SceneManager.scene().constructor !== Scene_Title)
    {
        this.refreshReactors();
    }
};

// ステートの消去
SAN.ActorGraphicsReactor.Game_Actor_eraseState = Game_Actor.prototype.eraseState;
Game_Actor.prototype.eraseState = function (stateId) {
    SAN.ActorGraphicsReactor.Game_Actor_eraseState.call(this, stateId);
    this.refreshReactors();
};

// ステートの付加
SAN.ActorGraphicsReactor.Game_Actor_addState = Game_Actor.prototype.addState;
Game_Actor.prototype.addState = function (stateId) {
    SAN.ActorGraphicsReactor.Game_Actor_addState.call(this, stateId);
    this.refreshReactors();
};

// 歩行グラフィックの設定
SAN.ActorGraphicsReactor.Game_Actor_setCharacterImage = Game_Actor.prototype.setCharacterImage;
Game_Actor.prototype.setCharacterImage = function (characterName, characterIndex) {
    SAN.ActorGraphicsReactor.Game_Actor_setCharacterImage.call(this, characterName, characterIndex);
    this.refreshReactors();
};

// 顔グラフィックの設定
SAN.ActorGraphicsReactor.Game_Actor_setFaceImage = Game_Actor.prototype.setFaceImage;
Game_Actor.prototype.setFaceImage = function (faceName, faceIndex) {
    SAN.ActorGraphicsReactor.Game_Actor_setFaceImage.call(this, faceName, faceIndex);
    this.refreshReactors();
};

// サイドビューグラフィックの設定
SAN.ActorGraphicsReactor.Game_Actor_setBattlerImage = Game_Actor.prototype.setBattlerImage;
Game_Actor.prototype.setBattlerImage = function (battlerName) {
    SAN.ActorGraphicsReactor.Game_Actor_setBattlerImage.call(this, battlerName);
    this.refreshReactors();
};

// -----------------------------------------------------------------------------
// Game_Party
//
// パーティ

// リアクターのグローバルセーブファイル情報
Game_Party.prototype.actorGraphicsReactorsSavefileInfo = function () {
    var version = SAN.ActorGraphicsReactor.version;
    var parameters = this.battleMembers().map(function (actor) {
        return actor.characterReactor().parameters();
    });
    var info = {version: version, parameters: parameters};
    return info;
};

// -----------------------------------------------------------------------------
// Sprite_Character
//
// キャラクタースプライト

// オブジェクト初期化
SAN.ActorGraphicsReactor.Sprite_Character_initialize = Sprite_Character.prototype.initialize;
Sprite_Character.prototype.initialize = function (character) {
    SAN.ActorGraphicsReactor.Sprite_Character_initialize.call(this, character);
    this._actorId = undefined;
    this._reactorSerialCount = undefined;
    this._reactorState = ['stable', 'waiting'][0];
};

// ビットマップの更新
SAN.ActorGraphicsReactor.Sprite_Character_updateBitmap = Sprite_Character.prototype.updateBitmap;
Sprite_Character.prototype.updateBitmap = function () {
    if (!!this._character.actor()) {
        var graphicsReactor = this._character.actor().characterReactor();
        if (this.isImageChanged()) {
            this._tilesetId = $gameMap.tilesetId();
            this._tileId = this._character.tileId();
            this._characterName = this._character.characterName();
            this._characterIndex = this._character.characterIndex();
            this._actorId = this._character.actor().actorId();
            this.bitmap = new Bitmap(1, 1);
            this._isBigCharacter = true;
        }
        if (this._reactorState === 'stable') {
            if (this._reactorSerialCount !== graphicsReactor.serialCount()) {
                this._reactorState = 'waiting';
            }
        }
        if (this._reactorState === 'waiting') {
            if (graphicsReactor.isReady()) {
                this.bitmap = graphicsReactor.bitmap();
                this._isBigCharacter = true;
                this._reactorSerialCount = graphicsReactor.serialCount();
                this._reactorState = 'stable';
            }
        }
        return;
    }
    SAN.ActorGraphicsReactor.Sprite_Character_updateBitmap.call(this);
    this._graphicsActorId = undefined;
};

// 画像変更判定
SAN.ActorGraphicsReactor.Sprite_Character_isImageChanged = Sprite_Character.prototype.isImageChanged;
Sprite_Character.prototype.isImageChanged = function () {
    return SAN.ActorGraphicsReactor.Sprite_Character_isImageChanged.call(this) || this.isActorChanged();
};

// アクター変更判定
Sprite_Character.prototype.isActorChanged = function () {
    if (this._actorId === undefined) {
        return this._character.actor() !== undefined;
    } else {
        return this._character.actor() === undefined || this._actorId !== this._character.actor().actorId();
    }
};

// 表示位置の更新
SAN.ActorGraphicsReactor.Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
Sprite_Character.prototype.updatePosition = function () {
    if (!!this._character.actor()) {
        var graphicsReactor = this._character.actor().characterReactor();
        this.x = this._character.screenX() + graphicsReactor.offsetX();
        this.y = this._character.screenY() + graphicsReactor.offsetY();
        this.z = this._character.screenZ();
        return;
    }
    SAN.ActorGraphicsReactor.Sprite_Character_updatePosition.call(this);
};

//-----------------------------------------------------------------------------
// Sprite_Actor
//
// アクタースプライト (サイドビュー)

// オブジェクト初期化
SAN.ActorGraphicsReactor.Sprite_Actor_initialize = Sprite_Actor.prototype.initialize;
Sprite_Actor.prototype.initialize = function (battler) {
    SAN.ActorGraphicsReactor.Sprite_Actor_initialize.call(this, battler);
    this._reactorSerialCount = -1;
    this._reactorState = ['stable', 'waiting'][0];
};

// ビットマップ更新
Sprite_Actor.prototype.updateBitmap = function () {
    Sprite_Battler.prototype.updateBitmap.call(this);
    var graphicsReactor = this._actor.battlerReactor();
    if (this._battlerName !== this._actor.battlerName()) {
        this._battlerName = this._actor.battlerName();
        this._mainSprite.bitmap = new Bitmap(1, 1);
    }
    if (this._reactorState === 'stable') {
        if (this._reactorSerialCount !== graphicsReactor.serialCount()) {
            this._reactorState = 'waiting';
        }
    }
    if (this._reactorState === 'waiting') {
        if (graphicsReactor.isReady()) {
            this._mainSprite.bitmap = graphicsReactor.bitmap();
            this._reactorSerialCount = graphicsReactor.serialCount();
            this._reactorState = 'stable';
        }
    }
};

// 表示位置の更新
SAN.ActorGraphicsReactor.Sprite_Actor_updatePosition = Sprite_Actor.prototype.updatePosition;
Sprite_Actor.prototype.updatePosition = function () {
    SAN.ActorGraphicsReactor.Sprite_Actor_updatePosition.call(this);
    var graphicsReactor = this._actor.battlerReactor();
    this.x += graphicsReactor.offsetX();
    this.y += graphicsReactor.offsetY();
};

//-----------------------------------------------------------------------------
// Window_Base
//
// ベースウィンドウ

// アクター顔グラフィック描画
Window_Base.prototype.drawActorFace = function (actor, x, y, width, height) {
    width = width || Window_Base._faceWidth;
    height = height || Window_Base._faceHeight;
    var graphicsReactor = actor.faceReactor();
    var bitmap = graphicsReactor.bitmap();
    var pw = Window_Base._faceWidth;
    var ph = Window_Base._faceHeight;
    var sw = Math.min(width, pw);
    var sh = Math.min(height, ph);
    var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
    var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
    var sx = 0;
    var sy = 0;
    this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
};

//-----------------------------------------------------------------------------
// Window_SavefileList
//
// セーブファイルリストウィンドウ

// オブジェクト初期化
SAN.ActorGraphicsReactor.Window_SavefileList_initialize = Window_SavefileList.prototype.initialize;
Window_SavefileList.prototype.initialize = function (x, y, width, height) {
    SAN.ActorGraphicsReactor.Window_SavefileList_initialize.call(this, x, y, width, height);
    this._graphicsReactorsXy = [];
    this._gameTitlesXyw = [];
};

// フレーム更新
SAN.ActorGraphicsReactor.Window_SavefileList_update = Window_SavefileList.prototype.update;
Window_SavefileList.prototype.update = function () {
    this.updatePartyCharacters();
    this.updateGameTitles();
    SAN.ActorGraphicsReactor.Window_SavefileList_update.call(this);
};

// パーティキャラクターグラフィック描画準備
SAN.ActorGraphicsReactor.Window_SavefileList_drawPartyCharacters = Window_SavefileList.prototype.drawPartyCharacters;
Window_SavefileList.prototype.drawPartyCharacters = function (info, x, y) {
    if (info.actorGraphicsReactorInfo &&
        info.actorGraphicsReactorInfo.version === SAN.ActorGraphicsReactor.version)
    {
        for (var i = 0; i < info.actorGraphicsReactorInfo.parameters.length; i++) {
            var graphicsReactor = new ActorGraphicsReactor('characters');
            graphicsReactor.setupByParameters(info.actorGraphicsReactorInfo.parameters[i]);
            this._graphicsReactorsXy.push([graphicsReactor, x + 48 * i, y]);
        }
        return;
    }
    SAN.ActorGraphicsReactor.Window_SavefileList_drawPartyCharacters.call(this, info, x, y);
};

// パーティキャラクターグラフィック描画更新
Window_SavefileList.prototype.updatePartyCharacters = function () {
    var drewIndexes = [];
    for (var index = 0; index < this._graphicsReactorsXy.length; index++) {
        var graphicsReactor = this._graphicsReactorsXy[index][0];
        if (graphicsReactor.isReady()) {
            var bitmap = graphicsReactor.bitmap();
            var x = this._graphicsReactorsXy[index][1] + graphicsReactor.offsetX();
            var y = this._graphicsReactorsXy[index][2] + graphicsReactor.offsetY();
            var pw = bitmap.width / 3;
            var ph = bitmap.height / 4;
            var sx = pw;
            var sy = 0;
            this.changePaintOpacity(true);
            this.contents.blt(bitmap, sx, sy, pw, ph, x - pw / 2, y - ph);
            drewIndexes.push(index);
        }
    }
    this._graphicsReactorsXy = this._graphicsReactorsXy.filter(function (graphicsReactorXy, index) {
        return !drewIndexes.contains(index);
    });
};

// ゲームタイトル描画準備
Window_SavefileList.prototype.drawGameTitle = function (info, x, y, width) {
    if (info.title) {
        this._gameTitlesXyw.push([info.title, x, y, width]);
    }
};

// ゲームタイトル描画更新
Window_SavefileList.prototype.updateGameTitles = function () {
    if (!this._graphicsReactorsXy.length === 0) {
        return;
    }
    var drewIndexes = [];
    for (var index = 0; index < this._gameTitlesXyw.length; index++) {
        var title = this._gameTitlesXyw[index][0];
        var x = this._gameTitlesXyw[index][1];
        var y = this._gameTitlesXyw[index][2];
        var width = this._gameTitlesXyw[index][3];
        this.drawText(title, x, y, width);
        drewIndexes.push(index);
    }
    this._gameTitlesXyw = this._gameTitlesXyw.filter(function (gameTitleXyw, index) {
        return !drewIndexes.contains(index);
    });
};

//-----------------------------------------------------------------------------
// Scene_ActorGraphicsEditor
//
// アクターグラフィクスエディターシーン

function Scene_ActorGraphicsEditor() {
    this.initialize.apply(this, arguments);
}

Scene_ActorGraphicsEditor.prototype = Object.create(Scene_MenuBase.prototype);
Scene_ActorGraphicsEditor.prototype.constructor = Scene_ActorGraphicsEditor;

// オブジェクト初期化
Scene_ActorGraphicsEditor.prototype.initialize = function () {
    Scene_MenuBase.prototype.initialize.call(this);
    this._graphicsTypes = ['characters', 'sv_actors', 'faces'];
};

// 文字列行高さ
Scene_ActorGraphicsEditor.lineHeight = function () {
    return 22;
};

// 標準フォントサイズ
Scene_ActorGraphicsEditor.standardFontSize = function() {
    return 12;
};

// 標準パディング
Scene_ActorGraphicsEditor.standardPadding = function() {
    return 12;
};

// 文字列パディング
Scene_ActorGraphicsEditor.textPadding = function() {
    return 6;
};

// グラフィクスのタイプ一覧
Scene_ActorGraphicsEditor.prototype.graphicsTypes = function () {
    return this._graphicsTypes;
};

// データファイルセーブ
Scene_ActorGraphicsEditor.prototype.saveDatabaseFile = function(name, json) {
    if (StorageManager.isLocalMode()) {
        var fs = require('fs');
        var dirPath = this.databaseDirectoryPath();
        var filePath = name + '.json';
        fs.writeFileSync(dirPath + filePath, JSON.stringify(json, null, '    '));
    }
};

// データファイルディレクトリ
Scene_ActorGraphicsEditor.prototype.databaseDirectoryPath = function() {
    var path = window.location.pathname.replace(/\/[^\/]*$/, '/data/');
    if (path.match(/^\/([A-Z]\:)/)) {
        path = path.slice(1);
    }
    return decodeURIComponent(path);
};

// 画像ファイルディレクトリパス
Scene_ActorGraphicsEditor.prototype.imageDirectoryPath = function () {
    var path = window.location.pathname.replace(/\/[^\/]*$/, '/img/');
    if (path.match(/^\/([A-Z]\:)/)) {
        path = path.slice(1);
    }
    return decodeURIComponent(path);
};

// ディレクトリ内ファイル探索
Scene_ActorGraphicsEditor.prototype.walkDirectry = function (directoryPath, pathList) {
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

// 画像素材ファイルリストデータ初期化
Scene_ActorGraphicsEditor.prototype.initDataAssets = function() {
    if (StorageManager.isLocalMode()) {
        $dataActorGraphicsReactor.assets = [];
        this._graphicsTypes.forEach(function (type) {
            var pathList = [];
            this.walkDirectry(this.imageDirectoryPath() + '/' + type, pathList);
            pathList.forEach(function (path) {
                path = path.replace(this.imageDirectoryPath() + '/' + type + '/', '');
                $dataActorGraphicsReactor.assets.push({ type: type, path: path });
            }, this);
        }, this);
        this.saveDatabaseFile('SAN_ActorGraphicsReactor', $dataActorGraphicsReactor);
    }
};

// 画像素材ファイルパスリスト
Scene_ActorGraphicsEditor.prototype.dataAssetPathList = function (type) {
    return $dataActorGraphicsReactor.assets.filter(function (assets) {
        return assets.type === type;
    }).map(function (assets) {
        return assets.path;
    });
};

// リアクターデータの保存
Scene_ActorGraphicsEditor.prototype.saveDataReactors = function () {
    if (StorageManager.isLocalMode()) {
        $dataActorGraphicsReactor.reactors = $dataActorGraphicsReactor.reactors.filter(function(parameters) {
            return (
                parameters.type !== this.currentType() ||
                parameters.name !== this.currentReactor().name()
            );
        }, this);
        this.currentReactor().parameters().forEach(function (layerParameters) {
            var dataParameters = {};
            for(var key in layerParameters) {
                dataParameters[key] = layerParameters[key];
            }
            $dataActorGraphicsReactor.reactors.push(dataParameters);
        }, this);
        this.sortDataReactors();
        this.saveDatabaseFile('SAN_ActorGraphicsReactor', $dataActorGraphicsReactor);
    }
};

// リアクターデータの削除
Scene_ActorGraphicsEditor.prototype.deleteDataReactor = function (name) {
    if (StorageManager.isLocalMode()) {
        $dataActorGraphicsReactor.reactors = $dataActorGraphicsReactor.reactors.filter(function(parameters) {
            return (
                parameters.type !== this.currentType() ||
                parameters.name !== name
            );
        }, this);
        this.sortDataReactors();
        this.saveDatabaseFile('SAN_ActorGraphicsReactor', $dataActorGraphicsReactor);
    }
};

// リアクターデータのソート
Scene_ActorGraphicsEditor.prototype.sortDataReactors = function () {
    var keys = ['type', 'name', 'depthZ'];
    for(var i = 0; i < keys.length; i++) {
        $dataActorGraphicsReactor.reactors.sort(function (parameters1, parameters2) {
            if (parameters1.type < parameters2.type) { return -1; }
            if (parameters1.type > parameters2.type) { return  1; }
            if (parameters1.name < parameters2.name) { return -1; }
            if (parameters1.name > parameters2.name) { return  1; }
            if (parameters1.depthZ === null ) { return -1; }
            if (parameters2.depthZ === null ) { return  1; }
            return parameters1.depthZ - parameters2.depthZ;
        });
    }
};

// リアクターデータの名称リスト
Scene_ActorGraphicsEditor.prototype.dataReactorNames = function () {
    var names = [];
    $dataActorGraphicsReactor.reactors.forEach(function (parameters) {
        if (parameters.type === this.currentType() &&
            names.indexOf(parameters.name) === -1)
        {
            names.push(parameters.name);
        }
    }, this);
    return names;
};

// リアクターパラメータ
Scene_ActorGraphicsEditor.prototype.dataReactorParameters = function (name) {
    return $dataActorGraphicsReactor.reactors.filter(function (parameters) {
        return (
            parameters.type === this.currentType() &&
            parameters.name === name
        );
    }, this);
};

// リアクター初期化
Scene_ActorGraphicsEditor.prototype.initReactors = function () {
    this._reactors = {
        upper:   {
            faces:      new ActorGraphicsReactor('faces'),
            characters: new ActorGraphicsReactor('characters'),
            sv_actors:  new ActorGraphicsReactor('sv_actors'),
        },
        lower:   {
            faces:      new ActorGraphicsReactor('faces'),
            characters: new ActorGraphicsReactor('characters'),
            sv_actors:  new ActorGraphicsReactor('sv_actors'),
        },
        preview: {
            faces:      new ActorGraphicsReactor('faces'),
            characters: new ActorGraphicsReactor('characters'),
            sv_actors:  new ActorGraphicsReactor('sv_actors'),
        }
    };
};

// リアクターリフレッシュ
Scene_ActorGraphicsEditor.prototype.refreshPreviewReactor = function () {
    for (var type in this._reactors['preview']) {
        this._reactors['preview'][type].clearLayers();
        this._reactors['preview'][type].mergeParameters(this._reactors['lower'][type].parameters());
        this._reactors['preview'][type].mergeParameters(this._reactors['upper'][type].parameters());
    }
};

// リアクター
Scene_ActorGraphicsEditor.prototype.reactor = function (reactorType) {
    return this._reactors[reactorType][this.currentType()];
};

// レイヤーテーブルリフレッシュ
Scene_ActorGraphicsEditor.prototype.refreshLayerTable = function () {
    this._layerTable = [];
    var lowerReactor = this._reactors['lower'][this.currentType()];
    var lowerLayers = [].concat(lowerReactor.graphicLayers());
    lowerLayers.push(lowerReactor.effectLayer());
    var upperReactor = this._reactors['upper'][this.currentType()];
    var upperLayers = [].concat(upperReactor.graphicLayers());
    upperLayers.push(upperReactor.effectLayer());
    while (lowerLayers.length > 0 || upperLayers.length > 0) {
        var lowerLayer = lowerLayers.pop();
        var upperLayer = upperLayers.pop();
        if (!!lowerLayer && !!upperLayer) {
            if (lowerLayer.parameters().depthZ === upperLayer.parameters().depthZ) {
                this._layerTable.push({ lower: lowerLayer, upper: upperLayer });
            } else if (lowerLayer.parameters().depthZ > upperLayer.parameters().depthZ) {
                this._layerTable.push({ lower: lowerLayer, upper: null });
                upperLayers.push(upperLayer);
            } else if (lowerLayer.parameters().depthZ < upperLayer.parameters().depthZ) {
                this._layerTable.push({ lower: null, upper: upperLayer });
                lowerLayers.push(lowerLayer);
            }
        } else if (!!lowerLayer) {
            this._layerTable.push({ lower: lowerLayer, upper: null });
        } else if (!!upperLayer) {
            this._layerTable.push({ lower: null, upper: upperLayer });
        }
    }
};

// レイヤーテーブル
Scene_ActorGraphicsEditor.prototype.layerTable = function () {
    return this._layerTable;
};

// シーン構成要素作成
Scene_ActorGraphicsEditor.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);
    this.initDataAssets();
    this.initReactors();
    this.refreshLayerTable();
    this.createHelpWindow();                // ヘルプウィンドウ
    this.createMenuWindow();                // メニューウィンドウ
    this.createReactorChoiceWindow();       // リアクター選択ウィンドウ
    this.createLowerNameWindow();           // 下位名称ウィンドウ
    this.createUpperNameWindow();           // 上位名称ウィンドウ
    this.createLowerLayerChoiceWindow();    // 下位レイヤー選択ウィンドウ
    this.createUpperLayerChoiceWindow();    // 上位レイヤー選択ウィンドウ
    this.createTypeWindow();                // タイプウィンドウ
    this.createPreviewWindow();             // プレビューウィンドウ
    this.createLayerEditWindow();           // レイヤー編集ウィンドウ
    this.createNameEditWindow();            // 名称編集ウィンドウ
    this.createNameInputWindow();           // 名称入力ウィンドウ
    this.createLayerCommandWindow();        // レイヤー操作ウィンドウ
    this.createNullChoiceWindow();          // NULL選択ウィンドウ
    this.createIntegerInputWindow();        // 整数入力ウィンドウ
    this.createDecimalInputWindow();        // 小数入力ウィンドウ
    this.createBooleanChoiceWindow();       // ブール選択ウィンドウ
    this.createDataReactorChoiceWindow();   // リアクターデータ選択ウィンドウ
    this.createAssetChoiceWindow();         // 画像素材ファイル選択ウィンドウ
    this.createQuitConfirmWindow();         // 終了確認ウィンドウ
};

// シーン開始
Scene_ActorGraphicsEditor.prototype.start = function () {
    Scene_MenuBase.prototype.start.call(this);
    this._menuWindow.activate();
};

// ヘルプウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createHelpWindow = function () {
    this._helpWindow = new Window_AGEHelp();
    this.addWindow(this._helpWindow);
};

// ヘルプウィンドウ
Scene_ActorGraphicsEditor.prototype.helpWindow = function () {
    return this._helpWindow;
};

// メニューウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createMenuWindow = function () {
    var x = 0
    var y = this._helpWindow.y + this._helpWindow.height;
    this._menuWindow = new Window_AGEMenu(x, y, this);
    this.addWindow(this._menuWindow);
};

// メニューウィンドウ
Scene_ActorGraphicsEditor.prototype.menuWindow = function () {
    return this._menuWindow;
};

// リアクター選択ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createReactorChoiceWindow = function () {
    var x = 0;
    var y = this._menuWindow.y + this._menuWindow.height;
    this._reactorChoiceWindow = new Window_AGEReactorChoice(x, y, this);
    this.addWindow(this._reactorChoiceWindow);
};

// リアクター選択ウィンドウ
Scene_ActorGraphicsEditor.prototype.reactorChoiceWindow = function () {
    return this._reactorChoiceWindow;
};

// 下位名称ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createLowerNameWindow = function () {
    var x = 0;
    var y = this._reactorChoiceWindow.y + this._reactorChoiceWindow.height;
    this._lowerNameWindow = new Window_AGEName(x, y, this, 'lower');
    this.addWindow(this._lowerNameWindow);
};

// 下位名称ウィンドウ
Scene_ActorGraphicsEditor.prototype.lowerNameWindow = function () {
    return this._lowerNameWindow;
};

// 上位名称ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createUpperNameWindow = function () {
    var x = this._lowerNameWindow.x + this._lowerNameWindow.width;
    var y = this._reactorChoiceWindow.y + this._reactorChoiceWindow.height;
    this._upperNameWindow = new Window_AGEName(x, y, this, 'upper');
    this.addWindow(this._upperNameWindow);
};

// 上位名称ウィンドウ
Scene_ActorGraphicsEditor.prototype.upperNameWindow = function () {
    return this._upperNameWindow;
};

// 下位レイヤー選択ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createLowerLayerChoiceWindow = function () {
    var x = 0;
    var y = this._lowerNameWindow.y + this._lowerNameWindow.height;
    this._lowerLayerChoiceWindow = new Window_AGELayerChoice(x, y, this, 'lower');
    this.addWindow(this._lowerLayerChoiceWindow);
};

// 下位レイヤー選択ウィンドウ
Scene_ActorGraphicsEditor.prototype.lowerLayerChoiceWindow = function () {
    return this._lowerLayerChoiceWindow;
};

// 上位レイヤー選択ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createUpperLayerChoiceWindow = function () {
    var x = this._lowerLayerChoiceWindow.x + this._lowerLayerChoiceWindow.width;
    var y = this._upperNameWindow.y + this._upperNameWindow.height;
    this._upperLayerChoiceWindow = new Window_AGELayerChoice(x, y, this, 'upper');
    this.addWindow(this._upperLayerChoiceWindow);
};

// 上位レイヤー選択ウィンドウ
Scene_ActorGraphicsEditor.prototype.upperLayerChoiceWindow = function () {
    return this._upperLayerChoiceWindow;
};

// タイプウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createTypeWindow = function () {
    var x = this._reactorChoiceWindow.x + this._reactorChoiceWindow.width;
    var y = this._menuWindow.y + this._menuWindow.height;
    this._typeWindow = new Window_AGEType(x, y, this);
    this.addWindow(this._typeWindow);
};

// タイプウィンドウ
Scene_ActorGraphicsEditor.prototype.typeWindow = function () {
    return this._typeWindow;
};

// プレビューウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createPreviewWindow = function () {
    var x = this._typeWindow.x;
    var y = this._typeWindow.y + this._typeWindow.height;
    this._previewWindow = new Window_AGEGraphicPreview(x, y, this);
    this.addWindow(this._previewWindow);
};

// プレビューウィンドウ
Scene_ActorGraphicsEditor.prototype.previewWindow = function () {
    return this._previewWindow;
};

// 素材ファイル選択ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createAssetChoiceWindow = function () {
    var x = this._layerEditWindow.x;
    var y = this._layerEditWindow.y;
    this._assetChoiceWindow = new Window_AGEAssetChoice(x, y, this);
    this.addWindow(this._assetChoiceWindow);    
};

// 素材ファイル選択ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.assetChoiceWindow = function () {
    return this._assetChoiceWindow;
};

// レイヤー編集ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createLayerEditWindow = function () {
    var x = this._previewWindow.x + this._previewWindow.width;
    var y = this._menuWindow.y + this._menuWindow.height;
    this._layerEditWindow = new Window_AGELayerEdit(x, y, this);
    this.addWindow(this._layerEditWindow);
};

// レイヤー編集ウィンドウ
Scene_ActorGraphicsEditor.prototype.layerEditWindow = function () {
    return this._layerEditWindow;
};

// 名称編集ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createNameEditWindow = function () {
    this._nameEditWindow = new Window_AGENameEdit(this);
    this.addWindow(this._nameEditWindow);
};

// 名称編集ウィンドウ
Scene_ActorGraphicsEditor.prototype.nameEditWindow = function () {
    return this._nameEditWindow;
};

// 名称入力ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createNameInputWindow = function() {
    this._nameInputWindow = new Window_AGENameInput(this);
    this.addWindow(this._nameInputWindow);
};

// 名称入力ウィンドウ
Scene_ActorGraphicsEditor.prototype.nameInputWindow = function() {
    return this._nameInputWindow;
};

// レイヤー操作ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createLayerCommandWindow = function () {
    var x = this._upperLayerChoiceWindow.x;
    var y = this._upperLayerChoiceWindow.y;
    this._layerCommandWindow = new Window_AGELayerCommand(x, y, this);
    this.addWindow(this._layerCommandWindow);
};

// レイヤー操作ウィンドウ
Scene_ActorGraphicsEditor.prototype.layerCommandWindow = function () {
    return this._layerCommandWindow;
};

// NULL選択ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createNullChoiceWindow = function () {
    this._nullChoiceWindow = new Window_AGENullChoice(this);
    this.addWindow(this._nullChoiceWindow);
};

// NULL選択ウィンドウ
Scene_ActorGraphicsEditor.prototype.nullChoiceWindow = function () {
    return this._nullChoiceWindow;
};

// 整数入力ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createIntegerInputWindow = function () {
    this._integerInputWindow = new Window_AGEIntegerInput(this);
    this.addWindow(this._integerInputWindow);
};

// 整数入力ウィンドウ
Scene_ActorGraphicsEditor.prototype.integerInputWindow = function () {
    return this._integerInputWindow;
};

// 小数入力ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createDecimalInputWindow = function () {
    this._decimalInputWindow = new Window_AGEDecimalInput(this);
    this.addWindow(this._decimalInputWindow);
};

// 小数入力ウィンドウ
Scene_ActorGraphicsEditor.prototype.decimalInputWindow = function () {
    return this._decimalInputWindow;
};

// ブール選択ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createBooleanChoiceWindow = function () {
    this._booleanChoiceWindow = new Window_AGEBooleanChoice(this);
    this.addWindow(this._booleanChoiceWindow);
};

// ブール選択ウィンドウ
Scene_ActorGraphicsEditor.prototype.booleanChoiceWindow = function () {
    return this._booleanChoiceWindow;
};

// リアクターデータ選択ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createDataReactorChoiceWindow = function () {
    var x = this._layerEditWindow.x;
    var y = this._layerEditWindow.y;
    this._dataReactorChoiceWindow = new Window_AGEDataReactorChoice(x, y, this);
    this.addWindow(this._dataReactorChoiceWindow);
};

// リアクターデータ選択ウィンドウ
Scene_ActorGraphicsEditor.prototype.dataReactorChoiceWindow = function () {
    return this._dataReactorChoiceWindow;
};

// 終了確認ウィンドウ作成
Scene_ActorGraphicsEditor.prototype.createQuitConfirmWindow = function () {
    this._quitConfirmWindow = new Window_AGEQuitConfirmWindow(this);
    this.addWindow(this._quitConfirmWindow);
};

// 終了確認ウィンドウ
Scene_ActorGraphicsEditor.prototype.quitConfirmWindow = function () {
    return this._quitConfirmWindow;
};

// 名称入力ウィンドウ呼び出し
Scene_ActorGraphicsEditor.prototype.callNameInputWindow = function () {
    this._nameEditWindow.open();
    this._nameInputWindow.setOriginal();
    this._nameInputWindow.refresh();
    this._nameInputWindow.open();
    this._nameInputWindow.activate();
};

// 画像素材ファイル選択ウィンドウ呼び出し
Scene_ActorGraphicsEditor.prototype.callAssetChoiceWindow = function () {
    var key = this._layerEditWindow.currentSymbol();
    this._assetChoiceWindow.refresh();
    this._assetChoiceWindow.setOriginal(this.currentLayer().parameters()[key]);
    this._assetChoiceWindow.open();
    this._assetChoiceWindow.activate();
};

// ブール選択ウィンドウ呼び出し
Scene_ActorGraphicsEditor.prototype.callBooleanChoiceWindow = function () {
    var key = this._layerEditWindow.currentSymbol();
    this._booleanChoiceWindow.setOriginal(this.currentLayer().parameters()[key]);
    this._booleanChoiceWindow.updatePlacement()
    this._booleanChoiceWindow.open();
    this._booleanChoiceWindow.activate();
};

// 整数入力ウィンドウ呼び出し
Scene_ActorGraphicsEditor.prototype.callIntegerInputWindow = function (maxValue, minValue, maxDigits) {
    var key = this._layerEditWindow.currentSymbol();
    this._integerInputWindow.setOriginal(this.currentLayer().parameters()[key]);
    this._integerInputWindow.setMaxValue(maxValue);
    this._integerInputWindow.setMinValue(minValue);
    this._integerInputWindow.setMaxDigits(maxDigits);
    this._integerInputWindow.start();
};

// 小数入力ウィンドウ呼び出し
Scene_ActorGraphicsEditor.prototype.callDecimalInputWindow = function (maxValue, minValue, maxDigits, maxDecimal) {
    var key = this._layerEditWindow.currentSymbol();
    this._decimalInputWindow.setOriginal(this.currentLayer().parameters()[key]);
    this._decimalInputWindow.setMaxValue(maxValue);
    this._decimalInputWindow.setMinValue(minValue);
    this._decimalInputWindow.setMaxDigits(maxDigits);
    this._decimalInputWindow.setMaxDecimal(maxDecimal);
    this._decimalInputWindow.start();
};

// NULL選択ウィンドウ呼び出し
Scene_ActorGraphicsEditor.prototype.callNullChoiceWindow = function () {
    var key = this._layerEditWindow.currentSymbol();
    this._nullChoiceWindow.setOriginal(this.currentLayer().parameters()[key]);
    this._nullChoiceWindow.updatePlacement()
    this._nullChoiceWindow.open();
    this._nullChoiceWindow.activate();
};

// リアクターデータ選択ウィンドウ呼び出し
Scene_ActorGraphicsEditor.prototype.callDataReactorChoiceWindow = function () {
    this._dataReactorChoiceWindow.setOriginal(this.currentReactor().parameters());
    this._dataReactorChoiceWindow.onCursorMove();
    this._dataReactorChoiceWindow.open()
    this._dataReactorChoiceWindow.activate();
};

// 処理中のグラフィクスのタイプをシフト
Scene_ActorGraphicsEditor.prototype.shiftType = function (down) {
    if (down) {
        this._graphicsTypes.push(this._graphicsTypes.shift());
    } else {
        this._graphicsTypes.unshift(this._graphicsTypes.pop());
    }
    this._lowerNameWindow.refresh();
    this._upperNameWindow.refresh();
    this._lowerLayerChoiceWindow.refresh();
    this._upperLayerChoiceWindow.refresh();
    this._lowerLayerChoiceWindow.selectLast();
    this._upperLayerChoiceWindow.selectLast();
    this.currentLayerChoiceWindow().updateScrollY();
    this.currentLayerChoiceWindow().refresh();
    this._layerEditWindow.refresh();
    this._previewWindow.refresh();
    this._dataReactorChoiceWindow.refresh();
    this._typeWindow.refresh();
};

// 処理中のグラフィクスのタイプ
Scene_ActorGraphicsEditor.prototype.currentType = function () {
    return this._graphicsTypes[0];
};

// 選択中の名称ウィンドウ
Scene_ActorGraphicsEditor.prototype.currentNameWindow = function () {
    switch (this._reactorChoiceWindow.currentSymbol()) {
    case 'lower':
        return this._lowerNameWindow;
    case 'upper':
        return this._upperNameWindow;
    };
};

// 選択中ではない名称ウィンドウ
Scene_ActorGraphicsEditor.prototype.anotherNameWindow = function () {
    switch (this._reactorChoiceWindow.currentSymbol()) {
    case 'lower':
        return this._upperNameWindow;
    case 'upper':
        return this._lowerNameWindow;
    };
};

// 選択中のレイヤー選択ウィンドウ
Scene_ActorGraphicsEditor.prototype.currentLayerChoiceWindow = function () {
    switch (this._reactorChoiceWindow.currentSymbol()) {
    case 'lower':
        return this._lowerLayerChoiceWindow;
    case 'upper':
        return this._upperLayerChoiceWindow;
    };
};

// 選択中ではないレイヤー選択ウィンドウ
Scene_ActorGraphicsEditor.prototype.anotherLayerChoiceWindow = function () {
    switch (this._reactorChoiceWindow.currentSymbol()) {
    case 'lower':
        return this._upperLayerChoiceWindow;
    case 'upper':
        return this._lowerLayerChoiceWindow;
    };
};

// 選択中のリアクター
Scene_ActorGraphicsEditor.prototype.currentReactor = function () {
    switch (this._reactorChoiceWindow.currentSymbol()) {
    case 'lower':
        return this.reactor('lower');
    case 'upper':
        return this.reactor('upper');
    };
};

// 選択中ではないリアクター
Scene_ActorGraphicsEditor.prototype.anotherReactor = function () {
    switch (this._reactorChoiceWindow.currentSymbol()) {
    case 'lower':
        return this.reactor('upper');
    case 'upper':
        return this.reactor('lower');
    };
};

// 選択中のレイヤー
Scene_ActorGraphicsEditor.prototype.currentLayer = function () {
    return this.currentLayerChoiceWindow().currentLayer();
};

// 表示中のリアクター
Scene_ActorGraphicsEditor.prototype.previewReactor = function () {
    return this.reactor('preview');
};

//-----------------------------------------------------------------------------
// Window_AGEHelp
//
// ヘルプウィンドウ

function Window_AGEHelp() {
    this.initialize.apply(this, arguments);
}

Window_AGEHelp.prototype = Object.create(Window_Help.prototype);
Window_AGEHelp.prototype.constructor = Window_AGEHelp;

// 文字列行高さ
Window_AGEHelp.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGEHelp.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGEHelp.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGEHelp.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

//-----------------------------------------------------------------------------
// Window_AGEMenu
//
// メニューウィンドウ

function Window_AGEMenu() {
    this.initialize.apply(this, arguments);
}

Window_AGEMenu.prototype = Object.create(Window_HorzCommand.prototype);
Window_AGEMenu.prototype.constructor = Window_AGEMenu;

// オブジェクト初期化
Window_AGEMenu.prototype.initialize = function(x, y, scene) {
    this._scene = scene;
    Window_HorzCommand.prototype.initialize.call(this, x, y);
    this._helpWindow = this._scene.helpWindow();
    this.setHandler('ok', this.onOk.bind(this));
    this.setHandler('cancel', this.onCancel.bind(this));
    this.setHandler('pagedown', this.onPagedown.bind(this));
    this.setHandler('pageup', this.onPageup.bind(this));
};

// ウィンドウ幅
Window_AGEMenu.prototype.windowWidth = function () {
    return Graphics.boxWidth;
};

// 文字列行高さ
Window_AGEMenu.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGEMenu.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGEMenu.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGEMenu.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 最大列数
Window_AGEMenu.prototype.maxCols = function () {
    return this.commandList().length;
};

// コマンドリスト
Window_AGEMenu.prototype.commandList = function () {
    return [
        { name: "レイヤー編集", symbol: 'layer',  enabled: true,
          ext:  "レイヤーセットのレイヤーを編集します。\"null\"を設定した場合はマージ時に上書きされません。" },
        { name: "名称編集",     symbol: 'name',   enabled: true,
          ext:  "レイヤーセットの名称を編集します。" },
        { name: "マージ",       symbol: 'merge',  enabled: true,
          ext:  "選択したレイヤーセットをもう一方のレイヤーセットにマージします。" },
        { name: "クリア",       symbol: 'clear',  enabled: true,
          ext:  "選択したレイヤーセットをクリアします。" },
        { name: "ロード",       symbol: 'load',   enabled: true,
          ext:  "データベースファイルからレイヤーセットをロードします。" },
        { name: "セーブ",       symbol: 'save',   enabled: StorageManager.isLocalMode(),
          ext:  "レイヤーセットをデータベースファイルにセーブします。" +
            (StorageManager.isLocalMode() ? "" : "\nローカルモード時のみ可能です。") },
        { name: "データ削除",   symbol: 'delete', enabled: StorageManager.isLocalMode(),
          ext:  "データベースファイルからレイヤーセットを削除します。" +
            (StorageManager.isLocalMode() ? "" : "\nローカルモード時のみ可能です。") },
        { name: "タイプ切替",   symbol: 'type',   enabled: true,
          ext:  "編集する画像のタイプを切り替えます。PageDown/PageUp操作でも切り替え可能です。" }
    ];
};

// コマンドリストの作成
Window_AGEMenu.prototype.makeCommandList = function () {
    this.commandList().forEach(function (command) {
        this.addCommand(command.name, command.symbol, command.enabled, command.ext);
    }, this);
};

// ヘルプウィンドウの更新
Window_AGEMenu.prototype.updateHelp = function () {
    this._scene.helpWindow().setText(this.currentData().ext);
};

// ページダウン処理
Window_AGEMenu.prototype.onPagedown = function () {
    this._scene.shiftType(true);
    this.activate();
};

// ページアップ処理
Window_AGEMenu.prototype.onPageup = function () {
    this._scene.shiftType(false);
    this.activate();
};

// カーソルの下移動
Window_AGEMenu.prototype.cursorDown = function(wrap) {
    Window_HorzCommand.prototype.cursorDown.call(this, wrap);
    if (this.isCurrentItemEnabled() && this.currentSymbol() !== 'type') {
        this.deactivate();
        if (this.currentSymbol() === 'save') {
            this._scene.dataReactorChoiceWindow().refresh();
            this._scene.dataReactorChoiceWindow().deselect();
            this._scene.dataReactorChoiceWindow().open();
        }
        this._scene.reactorChoiceWindow().selectLast();
        this._scene.reactorChoiceWindow().activate();
        SoundManager.playCursor();
    }
};

// カーソルの右移動
Window_AGEMenu.prototype.cursorRight = function (wrap) {
    Window_HorzCommand.prototype.cursorRight.call(this, wrap);
    this.callUpdateHelp();
};

// カーソルの左移動
Window_AGEMenu.prototype.cursorLeft = function (wrap) {
    Window_HorzCommand.prototype.cursorLeft.call(this, wrap);
    this.callUpdateHelp();
};

// 決定処理
Window_AGEMenu.prototype.onOk = function () {
    switch (this.currentSymbol()) {
    case 'type':
        this._scene.shiftType(true);
        this.activate();
        break;
    case 'save':
        this.deactivate();
        this._scene.reactorChoiceWindow().activate();
        this._scene.dataReactorChoiceWindow().refresh();
        this._scene.dataReactorChoiceWindow().deselect();
        this._scene.dataReactorChoiceWindow().open();
    default:
        this.deactivate();
        this._scene.reactorChoiceWindow().activate();
        break;
    }
};

// キャンセル処理
Window_AGEMenu.prototype.onCancel = function () {
    this.deactivate();
    this._scene.quitConfirmWindow().open();
    this._scene.quitConfirmWindow().refresh();
    this._scene.quitConfirmWindow().activate();
};

//-----------------------------------------------------------------------------
// Window_AGEReactorChoice
//
// リアクター選択ウィンドウ

function Window_AGEReactorChoice() {
    this.initialize.apply(this, arguments);
}

Window_AGEReactorChoice.prototype = Object.create(Window_HorzCommand.prototype);
Window_AGEReactorChoice.prototype.constructor = Window_AGEReactorChoice;

// オブジェクト初期化
Window_AGEReactorChoice.prototype.initialize = function (x, y, scene) {
    this._scene = scene;
    this._lastSymbol = null;
    Window_HorzCommand.prototype.initialize.call(this, x, y);
    this._helpWindow = this._scene._helpWindow;
    this.setHandler('ok', this.onOk.bind(this));
    this.setHandler('cancel', this.onCancel.bind(this));
    this.setHandler('pagedown', this.onPagedown.bind(this));
    this.setHandler('pageup', this.onPageup.bind(this));
    this.select(0);
    this.deactivate();
};

// ウィンドウ幅
Window_AGEReactorChoice.prototype.windowWidth = function () {
    return Graphics.boxWidth * (4 / 10);
};

// 文字列行高さ
Window_AGEReactorChoice.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGEReactorChoice.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGEReactorChoice.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGEReactorChoice.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 最大列数
Window_AGEReactorChoice.prototype.maxCols = function () {
    return this.commandList().length;
};

// ヘルプテキスト
Window_AGEReactorChoice.prototype.helpText = function () {
    return this._scene.menuWindow().currentExt() + "\nレイヤーセットを選択してください。";
};

// コマンドリスト
Window_AGEReactorChoice.prototype.commandList = function () {
    return [
        { name: "下位レイヤーセット", symbol: 'lower', enabled: true },
        { name: "上位レイヤーセット", symbol: 'upper', enabled: true }
    ];
};

// コマンドリストの作成
Window_AGEReactorChoice.prototype.makeCommandList = function () {
    this.commandList().forEach(function (command) {
        this.addCommand(command.name, command.symbol, command.enable);
    }, this);
};

// ヘルプウィンドウの更新
Window_AGEReactorChoice.prototype.updateHelp = function () {
    this._helpWindow.setText(this.helpText());
};

// 前回の選択位置に復帰
Window_AGEReactorChoice.prototype.selectLast = function () {
    this.selectSymbol(this._lastSymbol);
};

// ページダウン処理
Window_AGEReactorChoice.prototype.onPagedown = function () {
    this._scene.shiftType(true);
    this.activate();
};

// ページアップ処理
Window_AGEReactorChoice.prototype.onPageup = function () {
    this._scene.shiftType(false);
    this.activate();
};

// カーソルの上移動
Window_AGEReactorChoice.prototype.cursorUp = function(wrap) {
    Window_HorzCommand.prototype.cursorUp.call(this, wrap);
    this.onCancel();
    SoundManager.playCursor();
};

// カーソルの右移動
Window_AGEReactorChoice.prototype.cursorRight = function (wrap) {
    Window_HorzCommand.prototype.cursorRight.call(this, wrap);
    this._scene.lowerLayerChoiceWindow().refresh();
    this._scene.upperLayerChoiceWindow().refresh();
};

// カーソルの左移動
Window_AGEReactorChoice.prototype.cursorLeft = function (wrap) {
    Window_HorzCommand.prototype.cursorLeft.call(this, wrap);
    this._scene.lowerLayerChoiceWindow().refresh();
    this._scene.upperLayerChoiceWindow().refresh();
};

// 決定処理
Window_AGEReactorChoice.prototype.onOk = function () {
    switch (this._scene.menuWindow().currentSymbol()) {
    case 'layer':
        this._scene.currentLayerChoiceWindow().select(0);
        this._scene.currentLayerChoiceWindow().selectLast();
        this._scene.layerEditWindow().refresh();
        this._scene.currentLayerChoiceWindow().activate();
        break;
    case 'name':
        this._scene.callNameInputWindow();
        break;
    case 'merge':
        this._scene.anotherReactor().mergeParameters(this._scene.currentReactor().parameters());
        this._scene.refreshLayerTable();
        this._scene.lowerLayerChoiceWindow().refresh();
        this._scene.upperLayerChoiceWindow().refresh();
        this._scene.lowerLayerChoiceWindow().selectLast();
        this._scene.upperLayerChoiceWindow().selectLast();
        this._scene.currentNameWindow().refresh();
        this._scene.previewWindow().refresh();
        this.activate();
        break;
    case 'clear':
        this._scene.currentReactor().initialize(this._scene.currentType());
        this._scene.refreshLayerTable();
        this._scene.lowerLayerChoiceWindow().refresh();
        this._scene.upperLayerChoiceWindow().refresh();
        this._scene.lowerLayerChoiceWindow().selectLast();
        this._scene.upperLayerChoiceWindow().selectLast();
        this._scene.currentNameWindow().refresh();
        this._scene.previewWindow().refresh();
        this.activate();
        break;
    case 'load':
        this._scene.callDataReactorChoiceWindow();
        break;
    case 'save':
        this._scene.saveDataReactors();
        this._scene.dataReactorChoiceWindow().refresh();
        this.activate();
        break;
    case 'delete':
        this._scene.callDataReactorChoiceWindow();
        break;
    };
};

// キャンセル処理
Window_AGEReactorChoice.prototype.onCancel = function () {
    this._lastSymbol = this.currentSymbol();
    this.deactivate();
    if (this._scene.menuWindow().currentSymbol() === 'save') {
        this._scene.dataReactorChoiceWindow().close();
    }
    this._scene.menuWindow().activate();
};

//-----------------------------------------------------------------------------
// Window_AGEName
//
// 名称ウィンドウ

function Window_AGEName() {
    this.initialize.apply(this, arguments);
}

Window_AGEName.prototype = Object.create(Window_Base.prototype);
Window_AGEName.prototype.constructor = Window_AGEName;

// オブジェクト初期化
Window_AGEName.prototype.initialize = function(x, y, scene, reactorType) {
    this._scene = scene;
    this._reactorType = reactorType;
    this._text = '';
    var width = Graphics.boxWidth * (2 / 10);
    var height = this.fittingHeight(1);
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
};

// 文字列行高さ
Window_AGEName.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGEName.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGEName.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGEName.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 文字列クリア
Window_AGEName.prototype.clear = function() {
    this.contents.clear();
};

// リフレッシュ
Window_AGEName.prototype.refresh = function() {
    var reactor = this._scene.reactor(this._reactorType, this._scene.currentType());
    this._text = reactor.name();
    this.contents.clear();
    this.drawText(this._text, 0, 0, this.contents.width, 'center');
};

//-----------------------------------------------------------------------------
// Window_AGELayerChoice
//
// レイヤー選択ウィンドウ

function Window_AGELayerChoice() {
    this.initialize.apply(this, arguments);
}

Window_AGELayerChoice.prototype = Object.create(Window_Command.prototype);
Window_AGELayerChoice.prototype.constructor = Window_AGELayerChoice;

// オブジェクト初期化
Window_AGELayerChoice.prototype.initialize = function (x, y, scene, reactorType) {
    this._scene = scene;
    this._reactorType = reactorType;
    this._lastNames = {}
    Window_Command.prototype.initialize.call(this, x, y);
    this._helpWindow = this._scene.helpWindow();
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.setHandler('ok', this.onOk.bind(this));
    this.setHandler('cancel', this.onCancel.bind(this));
    this.setHandler('pagedown', this.onPagedown.bind(this));
    this.setHandler('pageup', this.onPageup.bind(this));
    this.refresh();
    this.select(0);
    this.deactivate();
};

// ウィンドウ幅
Window_AGELayerChoice.prototype.windowWidth = function () {
    return Graphics.boxWidth * (2 / 10);
};

// ウィンドウ高さ
Window_AGELayerChoice.prototype.windowHeight = function () {
    return !!this.height ? Graphics.boxHeight - this.y : 1;
};

// ウィンドウX座標
Window_AGELayerChoice.prototype.windowX = function () {
    return (
        this._reactorType === 'lower' ? 0 :
        this._reactorType === 'upper' ? Graphics.boxWidth * (2 / 10) :
        undefined
    );
};

// ウィンドウY座標
Window_AGELayerChoice.prototype.windowY = function () {
    return this.y;
};

// 文字列行高さ
Window_AGELayerChoice.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGELayerChoice.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGELayerChoice.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGELayerChoice.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 表示行数
Window_AGELayerChoice.prototype.numVisibleRows = function () {
    return this.maxItems();
};

// ヘルプテキスト
Window_AGELayerChoice.prototype.helpText = function () {
    return this._scene.menuWindow().currentExt() + "\n編集するレイヤーを選択してください。";
};

// コマンドリストの作成
Window_AGELayerChoice.prototype.makeCommandList = function () {
    var layerTable = this._scene.layerTable();
    for (var i = 0; i < layerTable.length; i++) {
        if (!!layerTable[i][this._reactorType]) {
            this.addCommand(
                layerTable[i][this._reactorType].parameters().label,
                layerTable[i][this._reactorType].parameters().depthZ
            );
        }
    }
};

// 項目の描画
Window_AGELayerChoice.prototype.drawItem = function (index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    var text = "";
    if (index === 0) {
        text = " " + "----" + " ";
    } else {
        text = this.commandSymbol(index) >= 0 ? " " : "-";
        text = text + Math.abs(this.commandSymbol(index)).toFixed(1).padZero(4);
        text = text + " ";
    }
    text = text + this.commandName(index);
    this.resetFontSettings();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(text, rect.x, rect.y, Graphics.boxWidth, align);
};

// 項目の矩形
Window_AGELayerChoice.prototype.itemRect = function(index) {
    var layerTable = this._scene.layerTable();
    var lineCount = 0;
    var itemCount = 0;
    while (lineCount < layerTable.length && itemCount !== index) {
        lineCount++;
        if (!!layerTable[lineCount] && !!layerTable[lineCount][this._reactorType]) {
            itemCount++;
        }
    }
    var rect = new Rectangle();
    rect.width = this.itemWidth();
    rect.height = this.itemHeight();
    rect.x = 0;
    rect.y = lineCount * rect.height - this._scrollY;
    return rect;
};

// 矢印表示のフレーム更新
Window_AGELayerChoice.prototype.updateArrows = function() {
    this.downArrowVisible =
        this._scene.lowerLayerChoiceWindow().isNeedDownArrow() ||
        this._scene.upperLayerChoiceWindow().isNeedDownArrow();
    this.upArrowVisible =
        this._scene.lowerLayerChoiceWindow().isNeedUpArrow() ||
        this._scene.upperLayerChoiceWindow().isNeedUpArrow();
};

// 要下矢印判定
Window_AGELayerChoice.prototype.isNeedDownArrow = function() {
    var bottomRect = this.itemRect(this.maxItems() - 1);
    return bottomRect.y + bottomRect.height > this.contents.height;
};

// 要上矢印判定
Window_AGELayerChoice.prototype.isNeedUpArrow = function() {
    var topRect = this.itemRect(0);
    return topRect.y < 0;
};

// スクロールの更新
Window_AGELayerChoice.prototype.updateScrollY = function() {
    var top = this.itemRect(this.index()).y;
    if (top < 0) {
        this._scrollY += top;
    }
    var bottom = this.itemRect(this.index()).y + this.itemRect(this.index()).height;
    if (bottom > this.contents.height) {
        this._scrollY += (bottom - this.contents.height);
    }
    this.anotherLayerChoiceWindow().setScrollY(this._scrollY);
};

// スクロールの設定
Window_AGELayerChoice.prototype.setScrollY = function(scrollY) {
    this._scrollY = scrollY;
};

// リフレッシュ
Window_AGELayerChoice.prototype.refresh = function () {
    this._scene.refreshLayerTable();
    if (!this.currentLayer()) {
        this.select(this.index() - 1);
    }
    Window_Command.prototype.refresh.call(this);
    this.updateCursor();
};

// 他方のレイヤー選択ウィンドウ
Window_AGELayerChoice.prototype.anotherLayerChoiceWindow = function () {
    switch (this._reactorType) {
    case 'lower':
        return this._scene.upperLayerChoiceWindow();
    case 'upper':
        return this._scene.lowerLayerChoiceWindow();
    }
};

// リアクター
Window_AGELayerChoice.prototype.reactor = function () {
    return this._scene.reactor(this._reactorType, this._scene.currentType());
};

// 選択レイヤー
Window_AGELayerChoice.prototype.currentLayer = function () {
    if (this.index() <= 0) {
        return this.reactor().effectLayer();
    } else {
        var layerIndex = this.reactor().graphicLayers().length - this.index();
        return this.reactor().graphicLayer(layerIndex);
    }
};

// 選択レイヤーインデックス
Window_AGELayerChoice.prototype.currentLayerIndex = function () {
    return this.maxItems() - this.index() - 1;
};

// 選択レイヤー名
Window_AGELayerChoice.prototype.currentName = function () {
    return this.currentData() ? this.currentData().name : null;
};

// 指定した名前のレイヤーにカーソルを移動
Window_AGELayerChoice.prototype.selectName = function (name) {
    this._list.forEach( function (item, index) {
        if (this._list[index].name === name) {
            this.select(index);
        }
    }, this);
};

// 前回の選択位置に復帰
Window_AGELayerChoice.prototype.selectLast = function () {
    this.selectName(this._lastNames[this._scene.currentType()]);
    while (!this.currentLayer() && this.index() > 0) {
        this.select(this.index() - 1);
    }
};

// ヘルプウィンドウの更新
Window_AGELayerChoice.prototype.updateHelp = function () {
    this._helpWindow.setText(this.helpText());
};

// ページダウン処理
Window_AGELayerChoice.prototype.onPagedown = function () {
    this._lastNames[this._scene.currentType()] = this.currentName();
    this._scene.shiftType(true);
    this.activate();
};

// ページアップ処理
Window_AGELayerChoice.prototype.onPageup = function () {
    this._lastNames[this._scene.currentType()] = this.currentName();
    this._scene.shiftType(false);
    this.activate();
};

// カーソルの下移動
Window_AGELayerChoice.prototype.cursorDown = function (wrap) {
    Window_Command.prototype.cursorDown.call(this, wrap);
    this.updateScrollY();
    this.refresh();
    this.anotherLayerChoiceWindow().refresh();
    this._scene.layerEditWindow().refresh();
};

// カーソルの上移動
Window_AGELayerChoice.prototype.cursorUp = function (wrap) {
    Window_Command.prototype.cursorUp.call(this, wrap);
    this.updateScrollY();
    this.refresh();
    this.anotherLayerChoiceWindow().refresh();
    this._scene.layerEditWindow().refresh();
};

// カーソルの右移動
Window_AGELayerChoice.prototype.cursorRight = function (wrap) {
    Window_Command.prototype.cursorRight.call(this, wrap);
    if (this._reactorType === 'lower') {
        this._lastNames[this._scene.currentType()] = this.currentName();
        this.deactivate();
        this._scene.reactorChoiceWindow().selectSymbol('upper');
        this._scene.layerEditWindow().refresh();
        this.anotherLayerChoiceWindow().updateScrollY();
        this.anotherLayerChoiceWindow().refresh();
        this.anotherLayerChoiceWindow().activate();
        this.refresh();
        SoundManager.playCursor();
    }
};

// カーソルの左移動
Window_AGELayerChoice.prototype.cursorLeft = function (wrap) {
    Window_Command.prototype.cursorLeft.call(this, wrap);
    if (this._reactorType === 'upper') {
        this._lastNames[this._scene.currentType()] = this.currentName();
        this.deactivate();
        this._scene.reactorChoiceWindow().selectSymbol('lower');
        this._scene.layerEditWindow().refresh();
        this.anotherLayerChoiceWindow().updateScrollY();
        this.anotherLayerChoiceWindow().refresh();
        this.anotherLayerChoiceWindow().activate();
        this.refresh();
        SoundManager.playCursor();
    }
};

// 決定処理
Window_AGELayerChoice.prototype.onOk = function () {
    this._lastNames[this._scene.currentType()] = this.currentName();
    this.deactivate();
    this._scene.layerCommandWindow().x = this.x + this.width;
    this._scene.layerCommandWindow().y = this.y;
    this._scene.layerCommandWindow().refresh();
    this._scene.layerCommandWindow().open();
    this._scene.layerCommandWindow().activate();
};

// キャンセル処理
Window_AGELayerChoice.prototype.onCancel = function () {
    this._lastNames[this._scene.currentType()] = this.currentName();
    this.deactivate();
    this._scene.reactorChoiceWindow().refresh();
    this._scene.reactorChoiceWindow().activate();
};

//-----------------------------------------------------------------------------
// Window_AGEType
//
// タイプウィンドウ

function Window_AGEType() {
    this.initialize.apply(this, arguments);
}

Window_AGEType.prototype = Object.create(Window_Base.prototype);
Window_AGEType.prototype.constructor = Window_AGEType;

// オブジェクト初期化
Window_AGEType.prototype.initialize = function(x, y, scene) {
    this._scene = scene;
    this._text = '';
    var width = Graphics.boxWidth * (3 / 10);
    var height = this.fittingHeight(1);
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
};

// 文字列行高さ
Window_AGEType.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGEType.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGEType.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGEType.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 表示のクリア
Window_AGEType.prototype.clear = function() {
    this.contents.clear();
};

// リフレッシュ
Window_AGEType.prototype.refresh = function() {
    this._text = "タイプ：" + this._scene.currentType();
    this.contents.clear();
    this.drawTextEx(this._text, this.textPadding(), 0);
};

//-----------------------------------------------------------------------------
// Window_AGEGraphicPreview
//
// プレビューウィンドウ

function Window_AGEGraphicPreview () {
    this.initialize.apply(this, arguments);    
}

Window_AGEGraphicPreview.prototype = Object.create(Window_Base.prototype);
Window_AGEGraphicPreview.prototype.constructor = Window_AGEGraphicPreview;

// オブジェクト初期化
Window_AGEGraphicPreview.prototype.initialize = function (x, y, scene) {
    this._scene = scene;
    this._needsDraw = true;
    Window_Base.prototype.initialize.call(this, x, y, 0, 0);
    this.width = this.windowWidth();
    this.height = this.windowHeight();
};

// ウィンドウ幅
Window_AGEGraphicPreview.prototype.windowWidth = function () {
    return Graphics.boxWidth * (3 / 10);
};

// ウィンドウ高さ
Window_AGEGraphicPreview.prototype.windowHeight = function () {
    return Graphics.boxHeight - this.y;
};

// 文字列行高さ
Window_AGEGraphicPreview.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGEGraphicPreview.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGEGraphicPreview.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGEGraphicPreview.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// リフレッシュ
Window_AGEGraphicPreview.prototype.refresh = function () {
    this._scene.refreshPreviewReactor();
    this._needsDraw = true;
};

// フレーム更新
Window_AGEGraphicPreview.prototype.update = function () {
    var reactor = this._scene.previewReactor();
    if (this._needsDraw && reactor.isReady()) {
        this.createContents();
        var bitmap = reactor.bitmap();
        var x = Math.floor((this.contents.width  - bitmap.width) / 2);
        var y = Math.floor((this.contents.height - bitmap.height) / 2);
        this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, x, y);
        this._needsDraw = false;
    }
    Window_Base.prototype.update.call(this);
};

//-----------------------------------------------------------------------------
// Window_AGELayerEdit
//
// レイヤー編集ウィンドウ

function Window_AGELayerEdit() {
    this.initialize.apply(this, arguments);
}

Window_AGELayerEdit.prototype = Object.create(Window_Command.prototype);
Window_AGELayerEdit.prototype.constructor = Window_AGELayerEdit;

// オブジェクト初期化
Window_AGELayerEdit.prototype.initialize = function (x, y, scene) {
    this._scene = scene;
    this._lastSymbol = 'label';
    Window_Command.prototype.initialize.call(this, x, y);
    this._helpWindow = this._scene.helpWindow();
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.setHandler('ok',     this.onOk.bind(this));
    this.setHandler('cancel', this.onCancel.bind(this));
    this.deactivate();
    this.deselect();
};

// ウィンドウ幅
Window_AGELayerEdit.prototype.windowWidth = function () {
    return !!this.width  ? Graphics.boxWidth  - this.x : 1;
};

// ウィンドウ高さ
Window_AGELayerEdit.prototype.windowHeight = function () {
    return !!this.height ? Graphics.boxHeight - this.y : 1;
};

// 文字列行高さ
Window_AGELayerEdit.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGELayerEdit.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGELayerEdit.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGELayerEdit.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 表示行数
Window_AGELayerEdit.prototype.numVisibleRows = function () {
    return this.maxItems();
};

// コマンドリスト
Window_AGELayerEdit.prototype.commandList = function () {
    var ext = this._scene.menuWindow().currentExt();
    return [
        {   name: "",             symbol:'label',     enabled: false,
            ext:  ext + "\nレイヤーの名称を編集します。" },
        {   name: "",             symbol:'path',      enabled: true,
            ext:  ext + "\n素材画像を選択します。" },
        {   name: "分割なし",     symbol:'isBig',     enabled: true,
            ext:  ext + "\n素材画像の分割の有無です。" +
                  "\"null\"を設定した場合は分割なしとして扱われます。" },
        {   name: "インデックス", symbol:'index',     enabled: true,
            ext:  ext + "\n素材画像のインデックスです。" +
                  "\"null\"を設定した場合は0として扱われます。" },
        {   name: "オフセットX",  symbol:'offsetX',   enabled: true,
            ext:  ext + "\n横方向のオフセットを編集します。プラス方向は画面右方向です。" +
                  "\"null\"を設定した場合は0として扱われます。" },
        {   name: "オフセットY",  symbol:'offsetY',   enabled: true,
            ext:  ext + "\n縦方向のオフセットを編集します。プラス方向は画面下方向です。" +
                  "\"null\"を設定した場合は0として扱われます。" },
        {   name: "表示優先度Z",  symbol:'depthZ',    enabled: true,
            ext:  ext + "\n表示優先度Zを編集します。数値が大きいほど優先的に表示されます。" },
        {   name: "アルファ",     symbol:'alpha',     enabled: true,
            ext:  ext + "\nアルファ(透過率)を設定します。0.00から1.00までの範囲で設定可能です。" +
                  "\"null\"を設定した場合は1.00として扱われます。" },
        {   name: "HSL変換有効",  symbol: 'hslValid', enabled: true,
            ext:  ext + "\nHSL変換の有無です。\"true\"を設定した場合は以下のパラメータが有効になります。" +
                  "無効の場合は以下のパラメータはマージされません。" },
        {   name: "色相",         symbol: 'hslH',     enabled: true,
            ext:  ext + "\n色相を設定します。0から360までの範囲で設定可能です。" +
                  "\"null\"を設定した場合は0として扱われます。" },
        {   name: "彩度",         symbol: 'hslS',     enabled: true,
            ext:  ext + "\n彩度(あざやかさ)を設定します。0.00から9.99までの範囲で設定可能です。" +
                  "\"null\"を設定した場合は0.50として扱われます。" },
        {   name: "輝度",         symbol: 'hslL',     enabled: true,
            ext:  ext + "\n輝度(明るさ)を設定します。0.00から9.99までの範囲で設定可能です。" +
                  "\"null\"を設定した場合は0.50として扱われます。" },
    ];
};

// コマンドリストの作成
Window_AGELayerEdit.prototype.makeCommandList = function () {
    var isSameSymbol = function (symbol) { return String(this) === symbol; };
    var reactor = this._scene.currentReactor();
    var layer = this._scene.currentLayer();
    if (!layer) {
        return;
    }
    this.commandList().forEach(function (command) {
        var enable = command.enable
        if ((layer === reactor.effectLayer() &&
             ['label', 'path', 'isBig', 'index', 'offsetX', 'offsetY', 'depthZ'].some(isSameSymbol, command.symbol)) || 
            (!layer.parameters().hslValid &&
             ['hslH', 'hslS', 'hslL'].some(isSameSymbol, command.symbol)))
        {
            enable = false;
        }
        this.addCommand(command.name, command.symbol, enable, command.ext);
    }, this);
};

// 項目の描画
Window_AGELayerEdit.prototype.drawItem = function (index) {
    var layer = this._scene.currentLayer();
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    var key = this.commandSymbol(index);
    var text = String(layer.parameters()[key]);
    if (key !== 'label' && key !== 'path') {
        text = this.commandName(index) + "：" + text;
    }
    this.resetFontSettings();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(text, rect.x, rect.y, rect.width, align);
};

// ヘルプウィンドウの更新
Window_AGELayerEdit.prototype.updateHelp = function () {
    this._helpWindow.setText(this.currentData().ext);
};

// 指定した名前のレイヤーにカーソルを移動
Window_AGELayerEdit.prototype.selectName = function (name) {
    this._list.forEach( function (item, index) {
        if (this._list[index].name === name) {
            this.select(index);
        }
    }, this);
};

// 前回の選択位置に復帰
Window_AGELayerEdit.prototype.selectLast = function () {
    this.select(0);
    this.selectSymbol(this._lastSymbol);
};

// 選択レイヤー名
Window_AGELayerEdit.prototype.currentName = function () {
    return !!this.currentData() ? this.currentData().name : null;
};

// カーソルの下移動
Window_AGELayerEdit.prototype.cursorDown = function (wrap) {
    Window_Command.prototype.cursorDown.call(this, wrap);
};

// カーソルの上移動
Window_AGELayerEdit.prototype.cursorUp = function (wrap) {
    Window_Command.prototype.cursorUp.call(this, wrap);
};

// 決定処理
Window_AGELayerEdit.prototype.onOk = function () {
    this._lastSymbol = this.currentSymbol();
    switch (this._scene.layerEditWindow().currentSymbol()) {
    case 'label':
        this._scene.callNameInputWindow();
        break;
    case 'depthZ':
        this._scene.callDecimalInputWindow(99.9, -99.9, 2, 1);
        break;
    default:
        this._scene.callNullChoiceWindow();
        break;
    }
};

// キャンセル処理
Window_AGELayerEdit.prototype.onCancel = function () {
    this._lastSymbol = 'label';
    this.deactivate();
    this.deselect();
    this._scene.currentLayerChoiceWindow().activate();
};

//-----------------------------------------------------------------------------
// Window_AGENameEdit
//
// 名称編集ウィンドウ

function Window_AGENameEdit() {
    this.initialize.apply(this, arguments);
}

Window_AGENameEdit.prototype = Object.create(Window_Help.prototype);
Window_AGENameEdit.prototype.constructor = Window_AGENameEdit;

// オブジェクト初期化
Window_AGENameEdit.prototype.initialize = function(scene) {
    this._scene = scene;
    Window_Help.prototype.initialize.call(this);
    this.width = this._scene.previewWindow().width;
    this.height = this.fittingHeight(1);
    this.x = this._scene.previewWindow().x;
    this.y = this._scene.previewWindow().y;
    this.openness = 0;
};

// 文字列行高さ
Window_AGENameEdit.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGENameEdit.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGENameEdit.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGENameEdit.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// リフレッシュ
Window_AGENameEdit.prototype.refresh = function () {
    this.setText(this._scene.nameInputWindow() ? this._scene.nameInputWindow().currentName() : '');
    Window_Help.prototype.refresh.call(this);
};

//-----------------------------------------------------------------------------
// Window_AGENameInput
//
// 名称入力ウィンドウ

function Window_AGENameInput() {
    this.initialize.apply(this, arguments);
}

Window_AGENameInput.prototype = Object.create(Window_NameInput.prototype);
Window_AGENameInput.prototype.constructor = Window_AGENameInput;

// オブジェクト初期化
Window_AGENameInput.prototype.initialize = function(scene) {
    this._scene = scene;
    this._currentName = '';
    this._originalName = '';
    this._nameIndex = 0;
    this._maxLength = 32;
    Window_Selectable.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
    this.x = this._scene.nameEditWindow().x;
    this.y = this._scene.nameEditWindow().y + this._scene.nameEditWindow().height;
    this.openness = 0;
    this._page = 0;
    this._index = 0;
    this.refresh();
    this.updateCursor();
};

// ウィンドウ幅
Window_AGENameInput.prototype.windowWidth = function() {
    return Graphics.boxWidth * (3 / 10);
};

// ウィンドウ高さ
Window_AGENameInput.prototype.windowHeight = function() {
    return this.fittingHeight(9);
};

// 文字列行高さ
Window_AGENameInput.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGENameInput.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGENameInput.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGENameInput.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 文字テーブル
Window_AGENameInput.prototype.table = function() {
    return [Window_NameInput.LATIN1,
            Window_NameInput.LATIN2];
};

// 項目の矩形
Window_AGENameInput.prototype.itemRect = function(index) {
    var width = Math.floor((this.windowWidth() - this.standardPadding()) / 11);
    return {
        x: index % 10 * width + Math.floor(index % 10 / 5) * Math.floor(width / 2),
        y: Math.floor(index / 10) * this.lineHeight(),
        width: width,
        height: this.lineHeight()
    };
};

// 元の名前の設定
Window_AGENameInput.prototype.setOriginal = function () {
    if (this._scene.menuWindow().currentSymbol() === 'name') {
        this._originalName = this._scene.currentReactor().name();
    } else if (this._scene.layerEditWindow().currentSymbol() === 'label') {
        this._originalName = this._scene.currentLayer().parameters().label;
        this._scene.currentLayer().parameters().label = '';
    }
    this._currentName = this._originalName;
    this._nameIndex = this._originalName.length;
};

// リフレッシュ
Window_AGENameInput.prototype.refresh = function() {
    Window_NameInput.prototype.refresh.call(this);
    this._scene.nameEditWindow().refresh();
};

// 名前の取得
Window_AGENameInput.prototype.currentName = function () {
    return this._currentName;
};

// キャンセル処理
Window_AGENameInput.prototype.processCancel = function() {
    this.processBack();
};

// 後退処理
Window_AGENameInput.prototype.processBack = function() {
    if (this._nameIndex > 0) {
        this._nameIndex--;
        this._currentName = this._currentName.slice(0, this._nameIndex);
    } else {
        this._nameIndex = this._originalName.length;
        this._currentName = this._originalName;
        this._index = 89;
    }
    this.refresh();
    SoundManager.playCancel();
};

// 決定処理
Window_AGENameInput.prototype.processOk = function() {
    if (this.character()) {
        this.onNameAdd();
    } else if (this.isPageChange()) {
        SoundManager.playOk();
        this.cursorPagedown();
    } else if (this.isOk()) {
        this.onNameOk();
    }
};

// 名前追加処理
Window_AGENameInput.prototype.onNameAdd = function() {
    if (this._nameIndex < this._maxLength) {
        this._nameIndex++;
        this._currentName = this._currentName + this.character();
        this.refresh();
        SoundManager.playOk();
    } else {
        SoundManager.playBuzzer();
    }
};

// 名前確定処理
Window_AGENameInput.prototype.onNameOk = function() {
    if (this._currentName === '') {
        this._currentName = this._originalName;
        this.refresh();
        SoundManager.playOk();
    } else {
        this._scene.nameEditWindow().close();
        this.close();
        this.deactivate();
        if (this._scene.menuWindow().currentSymbol() === 'name') {
            this._scene.currentReactor().setName(this._currentName);
            this._scene.currentNameWindow().refresh();
            this._scene.reactorChoiceWindow().activate();
        } else if (this._scene.menuWindow().currentSymbol() === 'layer') {
            this._scene.currentLayer().parameters().label = this._currentName;
            this._scene.currentReactor().serializeLabel(this._scene.currentLayer());
            this._scene.currentLayerChoiceWindow().refresh();
            this._scene.layerEditWindow().refresh();
            this._scene.layerEditWindow().activate();
        }
        SoundManager.playOk();
    }
};

//-----------------------------------------------------------------------------
// Window_AGELayerCommand
//
// レイヤー操作ウィンドウ

function Window_AGELayerCommand() {
    this.initialize.apply(this, arguments);
}

Window_AGELayerCommand.prototype = Object.create(Window_Command.prototype);
Window_AGELayerCommand.prototype.constructor = Window_AGELayerCommand;

// オブジェクト初期化
Window_AGELayerCommand.prototype.initialize = function (x, y, scene) {
    this._scene = scene;
    Window_Command.prototype.initialize.call(this, x, y);
    this.openness = 0;
    this._helpWindow = this._scene.helpWindow();
    this.setHandler('ok', this.onOk.bind(this));
    this.setHandler('cancel', this.onCancel.bind(this));
    this.deactivate();
};

// ウィンドウ幅
Window_AGELayerCommand.prototype.windowWidth = function () {
    return Graphics.boxWidth * (1 / 10);
};

// ウィンドウ高さ
Window_AGELayerCommand.prototype.windowHeight = function () {
    return this.fittingHeight(this.commandList().length);
};

// 文字列行高さ
Window_AGELayerCommand.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGELayerCommand.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGELayerCommand.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGELayerCommand.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 表示行数
Window_AGELayerCommand.prototype.numVisibleRows = function () {
    return this.maxItems();
};

// コマンドリスト
Window_AGELayerCommand.prototype.commandList = function () {
    var ext = this._scene.menuWindow().currentExt();
    return [
        { name: "編集",   symbol: 'edit',   enabled: true,
          ext:  ext + "\nレイヤーを編集します。" },
        { name: "新規",   symbol:'new',     enabled: true,
          ext:  ext + "\n新規レイヤーを挿入します。" },
        { name: "コピー", symbol: 'copy',  enabled: true,
          ext:  ext + "\nレイヤーを複製して挿入します。" },
        { name: "マージ", symbol: 'merge',  enabled: true,
          ext:  ext + "\nレイヤーをもう一方のレイヤーセットにマージします。" },
        { name: "削除",   symbol: 'delete', enabled: true,
          ext:  ext + "\nレイヤーを削除します。" },
        { name: "移動↑", symbol: 'up',     enabled: true,
          ext:  ext + "\nレイヤーを一つ上層へ移動します。（表示優先度を入れ替えます。）"},
        { name: "移動↓", symbol: 'down',   enabled: true,
          ext:  ext + "\nレイヤーを一つ下層へ移動します。（表示優先度を入れ替えます。）"}
    ];
};

// コマンドリストの作成
Window_AGELayerCommand.prototype.makeCommandList = function () {
    if (!this._scene.lowerLayerChoiceWindow() || !this._scene.upperLayerChoiceWindow()) {
        return;
    }
    var reactor = this._scene.currentReactor();
    var layer = this._scene.currentLayer();
    this.commandList().forEach(function (command) {
        var enable = command.enable
        if (command.symbol === 'delete') {
            if (layer === reactor.effectLayer()) {
                enable = false;
            }
        }
        if (command.symbol === 'down') {
            if (reactor.isEmpty() ||
                layer === reactor.effectLayer() ||
                layer === reactor.graphicLayer(0))
            {
                enable = false;
            }
        }
        if (command.symbol === 'up') {
            if (reactor.isEmpty() ||
                layer === reactor.effectLayer() ||
                layer === reactor.graphicLayer(reactor.graphicLayers().length - 1))
            {
                enable = false;
            }
        }
        this.addCommand(command.name, command.symbol, enable, command.ext);
    }, this);
};

// ヘルプウィンドウの更新
Window_AGELayerCommand.prototype.updateHelp = function () {
    this._scene.helpWindow().setText(this.currentData().ext);
};

// リフレッシュ
Window_AGELayerCommand.prototype.refresh = function () {
    this._scene.lowerLayerChoiceWindow().refresh();
    this._scene.upperLayerChoiceWindow().refresh();
    this._scene.currentLayerChoiceWindow().selectLast();
    this._scene.layerEditWindow().refresh();
    this._scene.previewWindow().refresh();
    Window_Command.prototype.refresh.call(this);
};

// 決定処理
Window_AGELayerCommand.prototype.onOk = function () {
    switch (this.currentSymbol()) {
    case 'edit':
        this.deactivate();
        this.close();
        this._scene.layerEditWindow().select(0);
        this._scene.layerEditWindow().activate();
        break;
    case 'new':
        var depthZ = this._scene.currentLayer().parameters().depthZ;
        var layerParameters = { label: 'new', depthZ: depthZ || 0.0 }
        this._scene.currentReactor().addLayer(layerParameters);
        this.refresh();
        this.activate();
        break;
    case 'copy':
        var layerParameters = this._scene.currentLayer().parameters();
        this._scene.currentReactor().addLayer(layerParameters);
        this.refresh();
        this.activate();
        break;
    case 'merge':
        var layerParameters = this._scene.currentLayer().parameters();
        this._scene.anotherReactor().mergeParameters([layerParameters]);
        this.refresh();
        this.deactivate();
        this.close();
        this._scene.currentLayerChoiceWindow().activate();
        break;
    case 'delete':
        var index = this._scene.currentLayerChoiceWindow().currentLayerIndex();
        this._scene.currentReactor().deleteLayer(index);
        this.refresh();
        this.deactivate();
        this.close();
        this._scene.currentLayerChoiceWindow().activate();
        break;
    case 'up':
        var index = this._scene.currentLayerChoiceWindow().currentLayerIndex();
        this._scene.currentReactor().moveUpLayer(index);
        this.refresh();
        this.activate();
        break;
    case 'down':
        var index = this._scene.currentLayerChoiceWindow().currentLayerIndex();
        this._scene.currentReactor().moveDownLayer(index);
        this.refresh();
        this.activate();
        break;
    }
};

// キャンセル処理
Window_AGELayerCommand.prototype.onCancel = function () {
    this.deactivate();
    this.close();
    this._scene.currentLayerChoiceWindow().activate();
};

//-----------------------------------------------------------------------------
// Window_AGENullChoice
//
// NULL選択ウィンドウ

function Window_AGENullChoice() {
    this.initialize.apply(this, arguments);
}

Window_AGENullChoice.prototype = Object.create(Window_Command.prototype);
Window_AGENullChoice.prototype.constructor = Window_AGENullChoice;

// オブジェクト初期化
Window_AGENullChoice.prototype.initialize = function (scene) {
    this._scene = scene;
    this._originalValue = true;
    Window_Command.prototype.initialize.call(this, 0, 0);
    this.openness = 0;
    this.deactivate();
};

// ウィンドウ幅
Window_AGENullChoice.prototype.windowWidth = function() {
    return Graphics.boxWidth * (1 / 10);
};

// 文字列行高さ
Window_AGENullChoice.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGENullChoice.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGENullChoice.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGENullChoice.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 表示行数
Window_AGENullChoice.prototype.numVisibleRows = function() {
    return this.maxItems();
};

// 最大項目数
Window_AGENullChoice.prototype.maxItems = function() {
    return this._list.length;
};

// 次ウィンドウの初期値の設定
Window_AGENullChoice.prototype.setOriginal = function (value) {
    this._originalValue = value;
};

// 位置の更新
Window_AGENullChoice.prototype.updatePlacement = function () {
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.x = this._scene.previewWindow().x + this._scene.previewWindow().width - this.width;
    this.y = Graphics.boxHeight - this.height;
};

// コマンドリストの作成
Window_AGENullChoice.prototype.makeCommandList = function() {
    this.addCommand('input', 'input', true);
    this.addCommand('null', null, true);
};

// キャンセル許可判定
Window_AGENullChoice.prototype.isCancelEnabled = function () {
    return true;
};

// カーソルの下移動
Window_AGENullChoice.prototype.cursorDown = function(wrap) {
    Window_Command.prototype.cursorDown.call(this, wrap);
    this.onCursorMove();
};

// カーソルの上移動
Window_AGENullChoice.prototype.cursorUp = function(wrap) {
    Window_Command.prototype.cursorUp.call(this, wrap);
    this.onCursorMove();
};

// カーソル移動による更新
Window_AGENullChoice.prototype.onCursorMove = function() {
    var layer = this._scene.currentLayer();
    var key = this._scene.layerEditWindow().currentSymbol();
    layer.parameters()[key] = (this.currentSymbol() === null ? null : this._originalValue);
    this._scene.currentLayerChoiceWindow().refresh();
    this._scene.previewWindow().refresh();
};

// 決定処理
Window_AGENullChoice.prototype.processOk = function () {
    Window_Command.prototype.processOk.call(this);
    this.deactivate();
    this.close();
    var layer = this._scene.currentLayer();
    var key = this._scene.layerEditWindow().currentSymbol();
    if (this.currentSymbol() === null) {
        layer.parameters()[key] = null;
        this._scene.currentLayerChoiceWindow().refresh();
        this._scene.previewWindow().refresh();
        this._scene.layerEditWindow().refresh();
        this._scene.layerEditWindow().activate();
    } else {
        switch (key) {
        case 'path':
            this._scene.callAssetChoiceWindow();
            break;
        case 'isBig':
            this._scene.callBooleanChoiceWindow()
            break;
        case 'index':
            this._scene.callIntegerInputWindow(7, 0, 1);
            break;
        case 'offsetX':
            this._scene.callIntegerInputWindow(240, -240, 3);
            break;
        case 'offsetY':
            this._scene.callIntegerInputWindow(240, -240, 3);
            break;
        case 'alpha':
            this._scene.callDecimalInputWindow(1.00, 0.00, 1, 2);
            break;
        case 'hslValid':
            this._scene.callBooleanChoiceWindow()
            break;
        case 'hslH':
            this._scene.callIntegerInputWindow(360, 0, 3);
            break;
        case 'hslS':
            this._scene.callDecimalInputWindow(9.99, 0.00, 1, 2);
            break;
        case 'hslL':
            this._scene.callDecimalInputWindow(9.99, 0.00, 1, 2);
            break;
        }
    }
};

// キャンセル処理
Window_AGENullChoice.prototype.processCancel = function () {
    Window_Command.prototype.processCancel.call(this);
    var layer = this._scene.currentLayer();
    var key = this._scene.layerEditWindow().currentSymbol();
    layer.parameters()[key] = this._originalValue;
    this.deactivate();
    this.close();
    this._scene.currentLayerChoiceWindow().refresh();
    this._scene.previewWindow().refresh();
    this._scene.layerEditWindow().activate();
};

//-----------------------------------------------------------------------------
// Window_AGEAssetChoice
//
// 画像素材ファイル選択ウィンドウ

function Window_AGEAssetChoice() {
    this.initialize.apply(this, arguments);
}

Window_AGEAssetChoice.prototype = Object.create(Window_Command.prototype);
Window_AGEAssetChoice.prototype.constructor = Window_AGEAssetChoice;

// オブジェクト初期化
Window_AGEAssetChoice.prototype.initialize = function (x, y, scene) {
    this._scene = scene;
    this._originalAsset = null;
    Window_Command.prototype.initialize.call(this, x, y);
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.openness = 0;
    this.setHandler('ok', this.onOk.bind(this));
    this.setHandler('cancel', this.onCancel.bind(this));
};

// ウィンドウ幅
Window_AGEAssetChoice.prototype.windowWidth = function () {
    return Graphics.boxWidth * (3/ 10);
};

// ウィンドウ高さ
Window_AGEAssetChoice.prototype.windowHeight = function () {
    return !!this.height ? Graphics.boxHeight - this.y: 1;
};

// 文字列行高さ
Window_AGEAssetChoice.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGEAssetChoice.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGEAssetChoice.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGEAssetChoice.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// コマンドリストの作成
Window_AGEAssetChoice.prototype.makeCommandList = function() {
    var paths = this._scene.dataAssetPathList(this._scene.currentType());
    paths.forEach(function (path) {
        this.addCommand(path, path, true);
    }, this);
};

// 画像素材ファイルの設定
Window_AGEAssetChoice.prototype.setOriginal = function (asset) {
    this.selectSymbol(asset);
    this._originalAsset = asset;
};

// キャンセル許可判定
Window_AGEAssetChoice.prototype.isCancelEnabled = function () {
    return true;
};

// カーソルの下移動
Window_AGEAssetChoice.prototype.cursorDown = function(wrap) {
    Window_Command.prototype.cursorDown.call(this, wrap);
    this.onCursorMove();
};

// カーソルの上移動
Window_AGEAssetChoice.prototype.cursorUp = function(wrap) {
    Window_Command.prototype.cursorUp.call(this, wrap);
    this.onCursorMove();
};

// カーソルの右移動
Window_AGEAssetChoice.prototype.cursorRight = function(wrap) {
    Window_Command.prototype.cursorRight.call(this, wrap);
    this.select(this.index() + Math.floor(this.contents.height / this.lineHeight()));
    if (this.index() >= this.maxItems()) {
        this.select(this.maxItems() - 1);
    }
    SoundManager.playCursor();
    this.onCursorMove();
};

// カーソルの左移動
Window_AGEAssetChoice.prototype.cursorLeft = function(wrap) {
    Window_Command.prototype.cursorLeft.call(this, wrap);
    this.select(this.index() - Math.floor(this.contents.height / this.lineHeight()));
    if (this.index() < 0) {
        this.select(0);
    }
    SoundManager.playCursor();
    this.onCursorMove();
};

// カーソル移動による更新
Window_AGEAssetChoice.prototype.onCursorMove = function() {
    var layer = this._scene.currentLayer();
    var key = this._scene.layerEditWindow().currentSymbol();
    layer.parameters()[key] = this.currentSymbol();
    this._scene.previewWindow().refresh();
};

// タッチ処理
Window_AGEAssetChoice.prototype.onTouch = function(triggered) {
    Window_Command.prototype.onTouch.call(this, triggered);
    this.onCursorMove();
};

// 決定処理
Window_AGEAssetChoice.prototype.onOk = function () {
    this.close();
    this.deactivate();
    this._scene.layerEditWindow().refresh();
    this._scene.layerEditWindow().activate();
};

// キャンセル処理
Window_AGEAssetChoice.prototype.onCancel = function () {
    var layer = this._scene.currentLayer();
    var key = this._scene.layerEditWindow().currentSymbol();
    layer.parameters()[key] = this._originalAsset;
    this.close();
    this.deactivate();
    this._scene.previewWindow().refresh();
    this._scene.layerEditWindow().activate();
};

//-----------------------------------------------------------------------------
// Window_AGEIntegerInput
//
// 整数入力ウィンドウ

function Window_AGEIntegerInput () {
    this.initialize.apply(this, arguments);
}

Window_AGEIntegerInput.prototype = Object.create(Window_NumberInput.prototype);
Window_AGEIntegerInput.prototype.constructor = Window_AGEIntegerInput;

// オブジェクト初期化
Window_AGEIntegerInput.prototype.initialize = function (scene) {
    this._scene = scene;
    this._maxDigits = 1;
    this._maxValue = 0;
    this._minValue = 0;
    this._originalValue = 0;
    this._currentValue = 0;
    Window_Selectable.prototype.initialize.call(this, 0, 0, 0, 0);
    this.openness = 0;
    this.createButtons();
    this.deactivate();
};

// 文字列行高さ
Window_AGEIntegerInput.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGEIntegerInput.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGEIntegerInput.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGEIntegerInput.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 項目の幅
Window_AGEIntegerInput.prototype.itemWidth = function() {
    return this.standardFontSize() + this.textPadding();
};

// 数値の設定
Window_AGEIntegerInput.prototype.setOriginal = function (value) {
    this._originalValue = value;
    this._currentValue = value || 0;
};

// 最大値の設定
Window_AGEIntegerInput.prototype.setMaxValue = function (maxValue) {
    this._maxValue = maxValue;
};

// 最小値の設定
Window_AGEIntegerInput.prototype.setMinValue = function (minValue) {
    this._minValue = minValue;
};

// 最大桁数の設定
Window_AGEIntegerInput.prototype.setMaxDigits = function (maxDigits) {
    this._maxDigits = maxDigits;
};

// ウィンドウ処理開始
Window_AGEIntegerInput.prototype.start = function () {
    this.updatePlacement();
    this.placeButtons();
    this.updateButtonsVisiblity();
    this.createContents();
    this.refresh();
    this.open();
    this.activate();
    this.select(this.maxItems() - 1);
};

// 位置の更新
Window_AGEIntegerInput.prototype.updatePlacement = function () {
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.x = this._scene.previewWindow().x + this._scene.previewWindow().width - this.width;
    this.y = Graphics.boxHeight - this.height;
};

// 最大桁数
Window_AGEIntegerInput.prototype.maxCols = function () {
    return this._maxDigits + 1;
};

// 最大項目数
Window_AGEIntegerInput.prototype.maxItems = function () {
    return this._maxDigits + 1;
};

// 項目描画
Window_AGEIntegerInput.prototype.drawItem = function (index) {
    var rect = this.itemRect(index);
    var align = 'center';
    var c = '';
    var s = Math.abs(this._currentValue).padZero(this._maxDigits);
    if (index === 0) {
        c = this._currentValue < 0 ? '-' : this._currentValue > 0 ? '+' : '±';
    } else  {
        c = s.slice(index - 1, index);
    }
    this.resetTextColor();
    this.drawText(c, rect.x, rect.y, rect.width, align);
};

// リフレッシュ
Window_AGEIntegerInput.prototype.refresh = function () {
    Window_NumberInput.prototype.refresh.call(this);
    this._scene.refreshLayerTable();
    this._scene.lowerLayerChoiceWindow().refresh();
    this._scene.upperLayerChoiceWindow().refresh();
    this._scene.lowerLayerChoiceWindow().selectLast();
    this._scene.upperLayerChoiceWindow().selectLast();
    this._scene.previewWindow().refresh();
};

// 数値変更
Window_AGEIntegerInput.prototype.changeDigit = function (up) {
    var index = this.index();
    var place = Math.pow(10, this._maxDigits - 1 - index + 1);
    if (index === 0) {
        if (this._currentValue * -1 >= this._minValue && this._currentValue * -1 <= this._maxValue) {
            this._currentValue *= -1;
        }
    } else if (up) {
        this._currentValue = Math.min(this._currentValue + place, this._maxValue);
    } else {
        this._currentValue = Math.max(this._currentValue - place, this._minValue);
    }
    var layer = this._scene.currentLayer();
    var key = this._scene.layerEditWindow().currentSymbol();
    layer.parameters()[key] = this._currentValue;
    this._scene.currentReactor().sortLayers();
    this.refresh();
    SoundManager.playCursor();
};

// タッチボタンY座標
Window_AGEIntegerInput.prototype.buttonY = function () {
    var spacing = 8;
    return 0 - this._buttons[0].height - spacing;
};

// キャンセル許可判定
Window_AGEIntegerInput.prototype.isCancelEnabled = function () {
    return true;
};

// 決定入力判定
Window_AGEIntegerInput.prototype.isOkTriggered = function () {
    return Input.isTriggered('ok');
};

// 決定処理
Window_AGEIntegerInput.prototype.processOk = function () {
    Window_Selectable.prototype.processOk.call(this);
    var layer = this._scene.currentLayer();
    var key = this._scene.layerEditWindow().currentSymbol();
    layer.parameters()[key] = this._currentValue;
    this.refresh();
    this.close();
    this.deactivate();
    this._scene.layerEditWindow().refresh();
    this._scene.layerEditWindow().activate();
};

// キャンセル処理
Window_AGEIntegerInput.prototype.processCancel = function () {
    var layer = this._scene.currentLayer();
    var key = this._scene._layerEditWindow.currentSymbol();
    layer.parameters()[key] = this._originalValue;
    Window_Selectable.prototype.processCancel.call(this);
    this.refresh();
    this.close();
    this.deactivate();
    this._scene.layerEditWindow().refresh();
    this._scene.layerEditWindow().activate();
};

//-----------------------------------------------------------------------------
// Window_AGEDecimalInput
//
// 小数入力ウィンドウ

function Window_AGEDecimalInput () {
    this.initialize.apply(this, arguments);    
}

Window_AGEDecimalInput.prototype = Object.create(Window_AGEIntegerInput.prototype);
Window_AGEDecimalInput.prototype.constructor = Window_AGEDecimalInput;

// オブジェクト初期化
Window_AGEDecimalInput.prototype.initialize = function (scene) {
    Window_AGEIntegerInput.prototype.initialize.call(this, scene);
    this._maxDecimal = 1;
};

// 有効数字の設定
Window_AGEDecimalInput.prototype.setMaxDecimal = function (maxDecimal) {
    this._maxDecimal = maxDecimal;
};

// 最大桁数
Window_AGEDecimalInput.prototype.maxCols = function () {
    return this._maxDigits + 1 + this._maxDecimal;
};

// 最大項目数
Window_AGEDecimalInput.prototype.maxItems = function () {
    return this._maxDigits + 1 + this._maxDecimal;
};

// 全ての項目描画
Window_AGEDecimalInput.prototype.drawAllItems = function() {
    Window_AGEIntegerInput.prototype.drawAllItems.call(this);
    var rect = this.pointRect();
    var align = 'center';
    this.resetTextColor();
    this.drawText('.', rect.x, rect.y, rect.width, align);
};

// 項目描画
Window_AGEDecimalInput.prototype.drawItem = function (index) {
    var rect = this.itemRect(index);
    var align = 'center';
    var c = '';
    var s = Math.abs(this._currentValue).toFixed(this._maxDecimal).padZero(this._maxDigits + this._maxDecimal + 1);
    if (index === 0) {
        c = this._currentValue < 0 ? '-' : this._currentValue > 0 ? '+' : '±';
    } else if (index <= this._maxDigits) {
        c = s.slice(index - 1, index);
    } else if (index > this._maxDigits) {
        c = s.slice(index, index + 1);
    }
    this.resetTextColor();
    this.drawText(c, rect.x, rect.y, rect.width, align);
};

// 項目の矩形
Window_AGEDecimalInput.prototype.itemRect = function(index) {
    var rect = new Rectangle();
    var maxCols = this.maxCols();
    rect.width = this.itemWidth();
    rect.height = this.itemHeight();
    rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
    rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
    return rect;

};

// 小数点の矩形
Window_AGEDecimalInput.prototype.pointRect = function() {
    var rect = new Rectangle();
    rect.width = this.itemWidth();
    rect.height = this.itemHeight();
    rect.x = (this._maxDigits + 0.5) * (rect.width + this.spacing());
    rect.y = 0;
    return rect;
};

// 数値変更
Window_AGEDecimalInput.prototype.changeDigit = function (up) {
    var index = this.index();
    var place = Math.pow(10, this._maxDigits - 1 - index + 1);
    if (index === 0) {
        this._currentValue *= -1;
    } else if (up) {
        this._currentValue += place;
    } else {
        this._currentValue -= place;
    }
    this._currentValue = Math.min(this._currentValue, this._maxValue);
    this._currentValue = Math.max(this._currentValue, this._minValue);
    this._currentValue = Number(this._currentValue.toFixed(this._maxDecimal));
    var layer = this._scene.currentLayer();
    var key = this._scene.layerEditWindow().currentSymbol();
    layer.parameters()[key] = this._currentValue;
    this._scene.currentReactor().sortLayers();
    this.refresh();
    SoundManager.playCursor();
};

//-----------------------------------------------------------------------------
// Window_AGEBooleanChoice
//
// ブール選択ウィンドウ

function Window_AGEBooleanChoice() {
    this.initialize.apply(this, arguments);
}

Window_AGEBooleanChoice.prototype = Object.create(Window_Command.prototype);
Window_AGEBooleanChoice.prototype.constructor = Window_AGEBooleanChoice;

// オブジェクト初期化
Window_AGEBooleanChoice.prototype.initialize = function (scene) {
    this._scene = scene;
    this._originalBoolean = true;
    Window_Command.prototype.initialize.call(this, 0, 0);
    this.openness = 0;
    this.deactivate();
};

// ウィンドウ幅
Window_AGEBooleanChoice.prototype.windowWidth = function() {
    return Graphics.boxWidth * (1 / 10);
};

// 文字列行高さ
Window_AGEBooleanChoice.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGEBooleanChoice.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGEBooleanChoice.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGEBooleanChoice.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 表示行数
Window_AGEBooleanChoice.prototype.numVisibleRows = function() {
    return this.maxItems();
};

// 最大項目数
Window_AGEBooleanChoice.prototype.maxItems = function() {
    return this._list.length;
};

// 初期値の設定
Window_AGEBooleanChoice.prototype.setOriginal = function (boolean) {
    this._originalBoolean = boolean;
    this.selectSymbol(boolean);
};

// 位置の更新
Window_AGEBooleanChoice.prototype.updatePlacement = function () {
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.x = this._scene.previewWindow().x + this._scene.previewWindow().width - this.width;
    this.y = Graphics.boxHeight - this.height;
};

// コマンドリストの作成
Window_AGEBooleanChoice.prototype.makeCommandList = function() {
    this.addCommand('true',  true,  true);
    this.addCommand('false', false, true);
};

// キャンセル許可判定
Window_AGEBooleanChoice.prototype.isCancelEnabled = function () {
    return true;
};

// カーソルの下移動
Window_AGEBooleanChoice.prototype.cursorDown = function(wrap) {
    Window_Command.prototype.cursorDown.call(this, wrap);
    this.onCursorMove();
};

// カーソルの上移動
Window_AGEBooleanChoice.prototype.cursorUp = function(wrap) {
    Window_Command.prototype.cursorUp.call(this, wrap);
    this.onCursorMove();
};

// カーソル移動による更新
Window_AGEBooleanChoice.prototype.onCursorMove = function() {
    var layer = this._scene.currentLayer();
    var key = this._scene.layerEditWindow().currentSymbol();
    layer.parameters()[key] = this.currentSymbol();
    this._scene.currentLayerChoiceWindow().refresh();
    this._scene.previewWindow().refresh();
};

// 決定処理
Window_AGEBooleanChoice.prototype.processOk = function () {
    Window_Command.prototype.processOk.call(this);
    var layer = this._scene.currentLayer();
    var key = this._scene.layerEditWindow().currentSymbol();
    layer.parameters()[key] = this.currentSymbol();
    this.deactivate();
    this.close();
    this._scene.currentLayerChoiceWindow().refresh();
    this._scene.previewWindow().refresh();
    this._scene.layerEditWindow().refresh();
    this._scene.layerEditWindow().activate();
};

// キャンセル処理
Window_AGEBooleanChoice.prototype.processCancel = function () {
    Window_Command.prototype.processCancel.call(this);
    var layer = this._scene.currentLayer();
    var key = this._scene.layerEditWindow().currentSymbol();
    layer.parameters()[key] = this._originalBoolean;
    this.deactivate();
    this.close();
    this._scene.currentLayerChoiceWindow().refresh();
    this._scene.previewWindow().refresh();
    this._scene.layerEditWindow().activate();
};

//-----------------------------------------------------------------------------
// Window_AGEDataReactorChoice
//
// リアクターデータ選択ウィンドウ

function Window_AGEDataReactorChoice() {
    this.initialize.apply(this, arguments);
}

Window_AGEDataReactorChoice.prototype = Object.create(Window_Command.prototype);
Window_AGEDataReactorChoice.prototype.constructor = Window_AGEDataReactorChoice;

// オブジェクト初期化
Window_AGEDataReactorChoice.prototype.initialize = function (x, y, scene) {
    this._scene = scene;
    this._originalParameters = null;
    this._originalName = null;
    Window_Command.prototype.initialize.call(this, x, y);
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.openness = 0;
    this.setHandler('ok', this.onOk.bind(this));
    this.setHandler('cancel', this.onCancel.bind(this));
    this.refresh();
    this.deselect();
    this.deactivate();
};

// ウィンドウ幅
Window_AGEDataReactorChoice.prototype.windowWidth = function () {
    return Graphics.boxWidth * (3 / 10)
};

// ウィンドウ高さ
Window_AGEDataReactorChoice.prototype.windowHeight = function () {
    return !!this.height ? Graphics.boxHeight - this.y : 1;
};

// 文字列行高さ
Window_AGEDataReactorChoice.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGEDataReactorChoice.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGEDataReactorChoice.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGEDataReactorChoice.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 初期値の設定
Window_AGEDataReactorChoice.prototype.setOriginal = function (parameters) {
    this._originalParameters = parameters;
    this._originalName = this._scene.currentReactor().name();
    this.selectName(this._originalName);
};

// コマンドリストの作成
Window_AGEDataReactorChoice.prototype.makeCommandList = function() {
    var dataReactorNames = this._scene.dataReactorNames();
    dataReactorNames.forEach(function (name) {
        this.addCommand(name, name, true);
    }, this);
};

// 指定した名称のデータにカーソルを移動
Window_AGEDataReactorChoice.prototype.selectName = function (name) {
    this.select(0);
    this._list.forEach( function (item, index) {
        if (this._list[index].name === name) {
            this.select(index);
        }
    }, this);
};

// リフレッシュ
Window_AGEDataReactorChoice.prototype.refresh = function() {
    Window_Command.prototype.refresh.call(this);
    this._scene.refreshLayerTable();
    this._scene.currentNameWindow().refresh();
    this._scene.lowerLayerChoiceWindow().refresh();
    this._scene.upperLayerChoiceWindow().refresh();
    this._scene.lowerLayerChoiceWindow().selectLast();
    this._scene.upperLayerChoiceWindow().selectLast();
    this._scene.previewWindow().refresh();
};

// 元の値に戻す
Window_AGEDataReactorChoice.prototype.restoreOriginal = function () {
    var reactorParameters = this._originalParameters;
    var name = this._originalName;
    this._scene.currentReactor().setupByParameters(reactorParameters);
    this._scene.currentReactor().setName(name);
    this.refresh();
};

// カーソルの下移動
Window_AGEDataReactorChoice.prototype.cursorDown = function(wrap) {
    Window_Command.prototype.cursorDown.call(this, wrap);
    this.onCursorMove();
};

// カーソルの上移動
Window_AGEDataReactorChoice.prototype.cursorUp = function(wrap) {
    Window_Command.prototype.cursorUp.call(this, wrap);
    this.onCursorMove();
};

// カーソルの右移動
Window_AGEDataReactorChoice.prototype.cursorRight = function(wrap) {
    Window_Command.prototype.cursorRight.call(this, wrap);
    this.select(this.index() + Math.floor(this.contents.height / this.lineHeight()));
    if (this.index() >= this.maxItems()) {
        this.select(this.maxItems() - 1);
    }
    this.onCursorMove();
};

// カーソルの左移動
Window_AGEDataReactorChoice.prototype.cursorLeft = function(wrap) {
    Window_Command.prototype.cursorLeft.call(this, wrap);
    this.select(this.index() - Math.floor(this.contents.height / this.lineHeight()));
    if (this.index() < 0) {
        this.select(0);
    }
    this.onCursorMove();
};

// カーソル移動による更新
Window_AGEDataReactorChoice.prototype.onCursorMove = function () {
    var reactorParameters = this._scene.dataReactorParameters(this.currentSymbol());
    var name = this.currentSymbol();
    this._scene.currentReactor().setupByParameters(reactorParameters);
    this._scene.currentReactor().setName(name);
    this.refresh();
};

// タッチ処理
Window_AGEDataReactorChoice.prototype.onTouch = function(triggered) {
    Window_Command.prototype.onTouch.call(this, triggered);
    this.onCursorMove();
};

// 決定処理
Window_AGEDataReactorChoice.prototype.onOk = function () {
    if (this._scene.menuWindow().currentSymbol() === 'delete') {
        this._scene.deleteDataReactor(this.currentSymbol());
        this.restoreOriginal();
        this.activate();
    } else {
        this.close();
        this.deactivate();
        this._scene.lowerLayerChoiceWindow().selectLast();
        this._scene.upperLayerChoiceWindow().selectLast();
        this._scene.reactorChoiceWindow().activate();
    }
};

// キャンセル処理
Window_AGEDataReactorChoice.prototype.onCancel = function () {
    this.restoreOriginal();
    this.close();
    this.deactivate();
    this._scene.reactorChoiceWindow().activate();
};

//-----------------------------------------------------------------------------
// Window_AGEQuitConfirmWindow
//
// 終了確認ウィンドウ

function Window_AGEQuitConfirmWindow() {
    this.initialize.apply(this, arguments);
}

Window_AGEQuitConfirmWindow.prototype = Object.create(Window_Command.prototype);
Window_AGEQuitConfirmWindow.prototype.constructor = Window_AGEQuitConfirmWindow;

// オブジェクト初期化
Window_AGEQuitConfirmWindow.prototype.initialize = function (scene) {
    this._scene = scene;
    Window_Command.prototype.initialize.call(this, 0, 0);
    this.openness = 0;
    this._helpWindow = this._scene.helpWindow();
    this.updatePlacement();
    this.deactivate();
};

// ウィンドウ幅
Window_AGEQuitConfirmWindow.prototype.windowWidth = function() {
    return Graphics.boxWidth * (1 / 10);
};

// 文字列行高さ
Window_AGEQuitConfirmWindow.prototype.lineHeight = function () {
    return Scene_ActorGraphicsEditor.lineHeight();
};

// 標準フォントサイズ
Window_AGEQuitConfirmWindow.prototype.standardFontSize = function () {
    return Scene_ActorGraphicsEditor.standardFontSize();
};

// 標準パディング
Window_AGEQuitConfirmWindow.prototype.standardPadding = function () {
    return Scene_ActorGraphicsEditor.standardPadding();
};

// 文字列パディング
Window_AGEQuitConfirmWindow.prototype.textPadding = function () {
    return Scene_ActorGraphicsEditor.textPadding();
};

// 表示行数
Window_AGEQuitConfirmWindow.prototype.numVisibleRows = function() {
    return this.maxItems();
};

// 最大項目数
Window_AGEQuitConfirmWindow.prototype.maxItems = function() {
    return this._list.length;
};

// ヘルプテキスト
Window_AGEQuitConfirmWindow.prototype.helpText = function () {
    return "編集画面を終了します。\nよろしいですか？"
}

// ヘルプウィンドウの更新
Window_AGEQuitConfirmWindow.prototype.updateHelp = function () {
    this._helpWindow.setText(this.helpText());
}

// 位置の更新
Window_AGEQuitConfirmWindow.prototype.updatePlacement = function () {
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.x = (Graphics.boxWidth - this.width) / 2;
    this.y = (Graphics.boxHeight - this.height) / 2;
};

// コマンドリストの作成
Window_AGEQuitConfirmWindow.prototype.makeCommandList = function() {
    this.addCommand('OK', 'ok', true);
    this.addCommand('Cancel', 'cancel', true);
};

// キャンセル許可判定
Window_AGEQuitConfirmWindow.prototype.isCancelEnabled = function () {
    return true;
};

// 決定処理
Window_AGEQuitConfirmWindow.prototype.processOk = function () {
    Window_Command.prototype.processOk.call(this);
    switch(this.currentSymbol()) {
    case 'ok':
        this.close();
        this.deactivate();
        $gameParty.battleMembers().forEach(function (actor) {
            actor.refreshReactors();
        });
        this._scene.popScene();
        break;
    case 'cancel':
        this.close();
        this.deactivate();
        this._scene.menuWindow().activate();
        break;
    }
};

// キャンセル処理
Window_AGEQuitConfirmWindow.prototype.processCancel = function () {
    Window_Command.prototype.processCancel.call(this);
    this.selectSymbol('cancel');
    this.activate();
};

//-----------------------------------------------------------------------------
// Game_Interpreter
//
// インタープリター

// プラグインコマンド
SAN.ActorGraphicsReactor.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
    SAN.ActorGraphicsReactor.Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'SAN_ActorGraphicsReactor') {
        switch (args[0]) {
        case 'CallEditor':
            SceneManager.push(Scene_ActorGraphicsEditor);
            break;
        case 'SetActorId':
            var eventId = Number(args[1]) || this._eventId;
            var actorId = Number(args[2]);
            $gameMap.event(eventId).setActorId(actorId);
            break;
        }
    }
};

}) (Sanshiro);
