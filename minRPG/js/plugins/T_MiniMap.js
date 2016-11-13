//=============================================================================
// T_MiniMap.js
//=============================================================================
//Copyright (c) 2016 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
//twitter https://twitter.com/Trb_surasura
/*:
 * @plugindesc ミニマップ表示プラグイン　ver.1.2
 * @author Trb
 * @version 1.00 2016/5/14 初版
 *          1.2  2016/5/16 新しいマップに移動した時、エラーになることがある不具合を修正しました。
 * 
 * 
 * @help 画面の左上にミニマップを表示させます。
 * プレイヤーの歩いた周囲が自動的に塗られます。
 * 設定項目が多いのでパラメータでは最低限の設定しか出来ないようになっています。
 * 細かいカスタマイズをしたい場合はプラグインを開いて編集して下さい。
 * (どこを書き換えたらいいか分かりやすいようにはしてあるつもりです)
 * 
 * テストプレイ時、続きからのデータにこのプラグインを適用するとエラーになることがあります。
 * その場合、まずプラグインをoffにした状態で続きから始め、パラメータで設定した2つの変数に
 * 0以外の適当な整数を代入して下さい。
 * その状態でセーブしてプラグインをonにすれば読み込めると思います。
 * 
 * 
 * 
 * <パラメータでの設定項目について>
 * 
 * ・データ保存用変数
 * ここで設定した番号の変数にミニマップのデータが保存されます。
 * 
 * ・表示の切り替え用変数
 * ここで設定した番号の変数をイベントコマンドなどで操作することで
 * ミニマップの表示のオンオフや表示倍率を変更できます。
 * 変数の値が0の時非表示、1以上の値の時表示、
 * 表示させている時は変数の値がそのまま1マス辺りの大きさになります。
 * (例 変数の値が6の時、1マス6ピクセルのミニマップになる)
 * 奇数の値を入れるとタイルとタイルの間に隙間が生じることがあるので
 * 基本的に偶数の値を設定するようにして下さい。
 * 
 * ・通行不可リージョン
 * RPGツクールMVでは、天井タイルの上をキャラクターが歩けるようになっているため
 * ミニマップ上でも歩けるマスとして表示されてしまいます。
 * このパラメータで設定したリージョンのマスは、実際の通行判定に関わらず通行不可マスとして扱われます。
 * （キャラクターが歩けなくなるわけではなく、あくまでミニマップの表示上です）
 * 天井タイルに敷き詰めるほか、マップに表示されない隠し通路を作りたい時などにも使えます。
 * 
 * 
 * 
 * ・フレーム画像
 * ミニマップの縁に画像を設定したい場合、ここに画像の名前を入力し
 * img/systemフォルダに入れて下さい。
 * 画像は、ミニマップの中心と画像の中心が合わさる位置に表示されます。
 * 
 * 
 * <スクリプトコマンド>
 * mapComplete();   現在のマップを完成させます。
 * 
 * @param データ保存用変数
 * @desc ミニマップのデータを保存するのに使う変数
 * @default 1
 * 
 * @param 表示の切り替え用変数
 * @desc ミニマップ表示のオンオフ、表示倍率の変更に使う変数の番号
 * @default 2
 * 
 * @param 通行不可リージョン
 * @desc 通行不可マスとして表示されるようになるリージョンの番号
 * @default 255
 * 
 * @param フレーム画像
 * @desc フレーム画像を使いたい場合、ここに画像のファイル名を入れて下さい
 * @default

 */
(function () {

var parameter = PluginManager.parameters('T_MiniMap');
var v1 = Number(parameter['データ保存用変数']);
var v2 = Number(parameter['表示の切り替え用変数']);
var frameImg = String(parameter['フレーム画像']);
var regionWall = Number(parameter['通行不可リージョン']);

var flag_mapComplete = false;
//=============================================================================
//カスタマイズする場合、主にここから下の値を書き換えます。

var minimapX = 20;//表示位置
var minimapY = 20;

var minimapWidth = 200;//円の直径
var minimapOpacity = 160;//ミニマップの透明度
var radius = 7;//一度にチェックする半径(プレイヤーの位置から半径radius分の地形が塗られる)

var minimapTileColors = [];
    minimapTileColors[0] = '#333377';//背景、壁マスの色
    minimapTileColors[1] = '#0000ff';//通常マスの色
  //minimapTileColors[2] = 
  //minimapTileColors[3] = 
  
/*色分けについて
Sprite_MiniMap.prototype.checkTile メソッド内で
「指定座標のリージョンIDがいくつの時」、「地形タグがいくつの時」、など任意の条件を指定して
タイルに色を割り振る事ができます。
(ある程度JavaScriptの知識が必要です)
該当メソッドの方にも説明を書いてあるのでそちらを御覧ください。
*/    

var playerSymbolColor = '#ff8800'//ミニマップ上に表示させるプレイヤーシンボルの色

//==============================================================================


//マップのスプライトにミニマップを追加する
var SMcreateUpperLayer = Spriteset_Map.prototype.createUpperLayer;
Spriteset_Map.prototype.createUpperLayer = function() {
    SMcreateUpperLayer.call(this);
    this.createMiniMap();
};

Spriteset_Map.prototype.createMiniMap = function(){
    if(typeof $gameVariables._data[v1] !== "object"){
        //配列型にする
        $gameVariables._data[v1] = [];
    }
    this._miniMapSprites = new Sprite();
    this._miniMapSprites.back = new Sprite();//背景のビットマップ
    this._miniMapSprites.back.bitmap = new Bitmap(minimapWidth,minimapWidth);
    var ark = minimapWidth / 2;
    this._miniMapSprites.back.bitmap.drawCircle(ark,ark,ark,minimapTileColors[0]);
    this._miniMapSprites.addChild(this._miniMapSprites.back);
	this._miniMapSprites.miniMap = new Sprite_MiniMap();//マップ本体のビットマップ
    this._miniMapSprites.addChild(this._miniMapSprites.miniMap);
    this.addChild(this._miniMapSprites);
    if(frameImg.length > 0){//フレーム名が設定されてる時
        this._miniMapFrame = new Sprite();//フレームのビットマップ
        this._miniMapFrame.bitmap = ImageManager.loadSystem(frameImg);
        this.addChild(this._miniMapFrame);
        this._miniMapFrame.x = minimapX + minimapWidth / 2;
        this._miniMapFrame.y = minimapY + minimapWidth / 2;
        this._miniMapFrame.anchor.x = 0.5;
        this._miniMapFrame.anchor.y = 0.5;
    }
    //表示位置等の設定
    this._miniMapSprites.x = minimapX;
    this._miniMapSprites.y = minimapY;
    this._miniMapSprites.opacity = minimapOpacity;
};

var SMupdate = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function() {
    SMupdate.call(this);
    this.updateMiniMap();
};

//表示、非表示の切り替え
Spriteset_Map.prototype.updateMiniMap = function() {
    this._miniMapSprites.visible = $gameVariables.value(v2) > 0;
    if(frameImg.length > 0){
        this._miniMapFrame.visible = $gameVariables.value(v2) > 0;
    }    
};


//ミニマップクラス
function Sprite_MiniMap() {
    this.initialize.apply(this, arguments);
}

Sprite_MiniMap.prototype = Object.create(Sprite.prototype);
Sprite_MiniMap.prototype.constructor = Sprite_MiniMap;

Sprite_MiniMap.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this.waitCount = 0;
    this.tileSize = 12;
    this.createBitmap();
    if(typeof $gameVariables._data[v1][$gameMap.mapId()] !== "object" || $gameVariables._data[v1][$gameMap.mapId()] === null){
        //現在のマップのデータがない場合初期化(配列型にする)
        $gameVariables._data[v1][$gameMap.mapId()] = [];
    }
    this.checkNearTiles();
    this.drawMap();
};

Sprite_MiniMap.prototype.createBitmap = function() {
    this.bitmap = new Bitmap(minimapWidth,minimapWidth);
    //自キャラのシンボル
    this.symbol_p = new Sprite();
    this.symbol_p.bitmap = new Bitmap(100,100);
    var r = this.tileSize / 2;
    this.symbol_p.bitmap.drawCircle(r,r,r,playerSymbolColor);
    this.addChild(this.symbol_p);
    //円形のマスクをかける
    var maskSize = minimapWidth / 2;
    var context = this.bitmap._context;
    context.beginPath();
    context.arc(maskSize, maskSize, maskSize, 0, Math.PI * 2, false);
    context.closePath();
    context.clip();

};

//ミニマップの更新を2フレームに1回にすることで若干軽量化しました。(ver.1.10)
//不要な場合は★印の付いた行を削除して下さい。
Sprite_MiniMap.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.waitCount += 1;//★
    if(this.waitCount >= 2){//★
        if(this.visible == true){
            this.updateTileSize();
            this.checkNearTiles();
            this.updateFrame();
            this.updateSymbols();
        }
        if(flag_mapComplete == true){
            this.checkAllTiles();
            this.drawMap();
            frag_mapComplete = false;
        }
        this.waitCount = 0;//★
    }//★
};

//タイルサイズが変更されたら、自キャラのシンボルとマップを描画し直す
Sprite_MiniMap.prototype.updateTileSize = function() {
    if($gameVariables.value(v2) > 0 && this.tileSize != $gameVariables.value(v2)){
        this.tileSize = $gameVariables.value(v2);
        this.symbol_p.bitmap.clear();
        var r = this.tileSize / 2;
        this.symbol_p.bitmap.drawCircle(r,r,r,playerSymbolColor);
        this.bitmap.clear();
        this.drawMap();
    }
}


//プレイヤーの周囲の地形を調べる
Sprite_MiniMap.prototype.checkNearTiles = function() {
    for(var i = -radius; i <= radius; i ++){
        var y = Math.floor(Math.sqrt(radius * radius - i * i));
        for(var j = -y; j <= y; j ++){
            var i2 = $gameMap.roundX(i + Math.floor($gamePlayer.x));
            var j2 = $gameMap.roundY(j + Math.floor($gamePlayer.y));
            if($gameMap.isValid(i2,j2)){
                this.checkTile(i2,j2);
            }
        }
    }
};

Sprite_MiniMap.prototype.checkAllTiles = function() {
    for(var i = 0; i < $gameMap.width(); i ++){
        for(var j = 0; j < $gameMap.height(); j ++){
            this.checkTile(i,j);
        }
    }
};

//==================================================================================================
//指定座標の地形を調べて色番号を割り振る
//マップを細かく色分けしたい場合、ここに条件を追加していってください。

Sprite_MiniMap.prototype.checkTile = function(x,y){
    if($gameVariables._data[v1][$gameMap.mapId()][y * $gameMap.width() + x] != null){
        return;
    }    
    /*書き方
    if(     任意の条件     ){
        setTile(x,y,色番号);      //色番号はminimapTileColors[]で設定した色に対応
        return;
    }
    */
    if($gameMap.regionId(x,y) == regionWall){//指定マスのリージョンがregionWallの値だった場合
        this.setTile(x,y,0);
        return;
    }
    if($gameMap.isPassable(x,y,2) || $gameMap.isPassable(x,y,4) || 
                $gameMap.isPassable(x,y,6) || $gameMap.isPassable(x,y,8)){//指定マスが通行可能の時
        this.setTile(x,y,1);
        return;
    }
    //何も該当しなかった時
    this.setTile(x,y,0);
    return;
};

/*条件の書き方例
if($gameMap.terrainTag(x,y) == 2)  座標x,yの地形タグが2の時
if($gameMap.isDamageFloor(x,y))　座標x,yがダメージ床の時
その他、指定マスの情報を調べるメソッドは rpg_object.js の Game_Mapクラスを探すと見つかると思います
*/
//==================================================================================================


Sprite_MiniMap.prototype.setTile = function(x,y,No){
    $gameVariables._data[v1][$gameMap.mapId()][y * $gameMap.width() + x] = No;
};

Sprite_MiniMap.prototype.updateFrame = function() {
    if(this._lastX != $gamePlayer._realX || this._lastY != $gamePlayer._realY){
        this.bitmap.clear();
        this.drawMap();
        this._lastX = $gamePlayer._realX;
        this._lastY = $gamePlayer._realY;
    }
};

Sprite_MiniMap.prototype.drawMap = function(){
    var sx = Math.floor($gamePlayer.x - (minimapWidth / this.tileSize) / 2) - 1;
    var ex = Math.floor($gamePlayer.x + (minimapWidth / this.tileSize) / 2) + 2;
    var sy = Math.floor($gamePlayer.y - (minimapWidth / this.tileSize) / 2) - 1;
    var ey = Math.floor($gamePlayer.y + (minimapWidth / this.tileSize) / 2) + 2;

    if(!$gameMap.isLoopHorizontal()){
        sx = sx.clamp(0,$gameMap.width());
        ex = ex.clamp(0,$gameMap.width());
    }
    if(!$gameMap.isLoopVertical()){
        sy = sy.clamp(0,$gameMap.height());
        ey = ey.clamp(0,$gameMap.height());
    }
    for(var i = sx; i < ex; i ++){
        for(var j = sy; j < ey; j ++){
            if(this.drawTile(i,j)){
                this.drawLine(i,j);
            }
        }
    }
}

//タイルの描画
Sprite_MiniMap.prototype.drawTile = function(x,y){
    var x2 = $gameMap.roundX(x);
    var y2 = $gameMap.roundY(y);
    var colorNo = $gameVariables._data[v1][$gameMap.mapId()][y2 * $gameMap.width() + x2];
    if(colorNo > 0){
        var mx = x - $gamePlayer._realX;
        var my = y - $gamePlayer._realY;
        this.bitmap.fillRect(Math.floor(mx * this.tileSize) + Math.floor((minimapWidth - this.tileSize) / 2), Math.floor(my * this.tileSize) + Math.floor((minimapWidth - this.tileSize) / 2), this.tileSize, this.tileSize,minimapTileColors[colorNo]);
        return true;
    }else{
        return false;
    }
};

//タイルとタイルの間の仕切り
Sprite_MiniMap.prototype.drawLine = function(x,y){
    var x2 = $gameMap.roundX(x);
    var y2 = $gameMap.roundY(y);
    var mx = x - $gamePlayer._realX;
    var my = y - $gamePlayer._realY;
    if(!$gameMap.isPassable(x2,y2,2) || !$gameMap.isPassable(x2,$gameMap.roundY(y2+1),8)){
        this.bitmap.clearRect(Math.floor(mx * this.tileSize) + (minimapWidth - this.tileSize) / 2 - 1, Math.floor((my + 1) * this.tileSize) + (minimapWidth - this.tileSize) / 2 - 1, this.tileSize + 1, 1);
    }
    if(!$gameMap.isPassable(x2,y2,6) || !$gameMap.isPassable($gameMap.roundX(x2+1),y2,4)){
        this.bitmap.clearRect(Math.floor((mx + 1) * this.tileSize) + (minimapWidth - this.tileSize) / 2 - 1, Math.floor(my * this.tileSize) + (minimapWidth - this.tileSize) / 2 - 1, 1, this.tileSize + 1);
    }
};

//自キャラシンボルの位置更新(現仕様では中心で固定)
Sprite_MiniMap.prototype.updateSymbols = function() {
    this.symbol_p.x = (minimapWidth - this.tileSize) / 2;
    this.symbol_p.y = (minimapWidth - this.tileSize) / 2;
};


//現在のマップを完成させる関数(ver.1.10)
mapComplete = function(){
    flag_mapComplete = true;
}

})();