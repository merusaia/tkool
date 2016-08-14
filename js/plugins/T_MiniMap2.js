//=============================================================================
// T_MiniMap.js
//=============================================================================
//Copyright (c) 2016 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
//twitter https://twitter.com/Trb_surasura
/*:
 * @plugindesc ミニマップ表示プラグイン
 * @author Trb
 * @version 1.00 2016/5/14 初版
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
 * ・フレーム画像
 * ミニマップの縁に画像を設定したい場合、ここに画像の名前を入力し
 * img/systemフォルダに入れて下さい。
 * 画像は、ミニマップの中心と画像の中心が合わさる位置に表示されます。
 * 
 * 
 * @param データ保存用変数
 * @desc ミニマップのデータを保存するのに使う変数
 * @default 1
 * 
 * @param 表示の切り替え用変数
 * @desc ミニマップ表示のオンオフ、表示倍率の変更に使う変数の番号
 * @default 2
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

//=============================================================================
//カスタマイズする場合、主にここから下の値を書き換えます。

var minimapX = 200;//表示位置
var minimapY = 200;

var minimapWidth = 200;//円の直径
var minimapOpacity = 160;//ミニマップの透明度
var radius = 7;//一度にチェックする半径(プレイヤーの位置から半径radius分の地形が塗られる)

var regionWall = 255;//ミニマップ上で壁扱いにするリージョン(下記のcheckTile2 内で使用)

var minimapTileColors = [];
    minimapTileColors[0] = '#333377';//背景、壁マスの色
    minimapTileColors[1] = '#0000ff';//通常マスの色
  //minimapTileColors[2] = 
  //minimapTileColors[3] = 
  
/*色分けについて
Sprite_MiniMap.prototype.checkTile2 メソッド内で
「指定座標のリージョンIDがいくつの時」、「地形タグがいくつの時」、など任意の条件を指定して
タイルに色を割り振る事ができます。
(ある程度JavaScriptの知識が必要です)
該当メソッドの方にも説明を書いてあるのでそちらを御覧ください。
*/    

var playerSymbolColor = '#ff8800'//ミニマップ上に表示させるプレイヤーシンボルの色

//==============================================================================


//マップのスプライトにミニマップを追加する
Spriteset_Map.prototype.createUpperLayer2 = function() {
    Spriteset_Base.prototype.createUpperLayer.call(this);
    this.createMiniMap2();
};

Spriteset_Map.prototype.createMiniMap2 = function(){
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
        this._miniMapFrame.x = minimapX + minimapWidth / 2;
        this._miniMapFrame.y = minimapY + minimapWidth / 2;
        this._miniMapFrame.anchor.x = 0.5;
        this._miniMapFrame.anchor.y = 0.5;
        this.addChild(this._miniMapFrame);
    }
    //表示位置等の設定
    this._miniMapSprites.x = minimapX;
    this._miniMapSprites.y = minimapY;
    this._miniMapSprites.opacity = minimapOpacity;

};

var SMupdate = Spriteset_Map.prototype.update2;
Spriteset_Map.prototype.update2 = function() {
    SMupdate.call(this);
    this.updateMiniMap();
};

//表示、非表示の切り替え
Spriteset_Map.prototype.updateMiniMap2 = function() {
    this._miniMapSprites.visible = $gameVariables.value(v2) > 0;
    if(frameImg.length > 0){
        this._miniMapFrame.visible = $gameVariables.value(v2) > 0;
    }    
};

//ミニマップクラス
function Sprite_MiniMap() {
    this.initialize2.apply(this, arguments);
}

Sprite_MiniMap.prototype = Object.create(Sprite.prototype);
Sprite_MiniMap.prototype.constructor = Sprite_MiniMap;

Sprite_MiniMap.prototype.initialize2 = function() {
    Sprite.prototype.initialize.call(this);
    this.tileSize = 12;
    this.createBitmap2();
    if(typeof $gameVariables._data[v1][$gameMap.mapId()] !== "object"){
        //現在のマップのデータがない場合初期化(配列型にする)
        $gameVariables._data[v1][$gameMap.mapId()] = [];
    }
    this.checkNearTiles2();
    this.drawMap2();
};

Sprite_MiniMap.prototype.createBitmap2 = function() {
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


Sprite_MiniMap.prototype.update2 = function() {
    Sprite.prototype.update.call(this);
    if(this.visible == true){
        this.updateTileSize2();
        this.checkNearTiles2();
        this.updateFrame2();
        this.updateSymbols2();
    }
};

//タイルサイズが変更されたら、自キャラのシンボルとマップを描画し直す
Sprite_MiniMap.prototype.updateTileSize2 = function() {
    if($gameVariables.value(v2) > 0 && this.tileSize != $gameVariables.value(v2)){
        this.tileSize = $gameVariables.value(v2);
        this.symbol_p.bitmap.clear();
        var r = this.tileSize / 2;
        this.symbol_p.bitmap.drawCircle(r,r,r,playerSymbolColor);
        this.bitmap.clear();
        this.drawMap2();
    }
}


//プレイヤーの周囲の地形を調べる
Sprite_MiniMap.prototype.checkNearTiles2 = function() {
    for(var i = -radius; i <= radius; i ++){
        var y = Math.floor(Math.sqrt(radius * radius - i * i));
        for(var j = -y; j <= y; j ++){
            var i2 = i + Math.floor($gamePlayer.x);
            var j2 = j + Math.floor($gamePlayer.y);
            if($gameMap.isValid(i2,j2)){
                this.checkTile2(i2,j2);
            }
        }
    }
};


//==================================================================================================
//指定座標の地形を調べて色番号を割り振る
//マップを細かく色分けしたい場合、ここに条件を追加していってください。

Sprite_MiniMap.prototype.checkTile2 = function(x,y){
    if($gameVariables._data[v1][$gameMap.mapId()][y * $gameMap.width() + x] != null){
        return;
    }    
    /*書き方
    if(     任意の条件     ){
        setTile2(x,y,色番号);      //色番号はminimapTileColors[]で設定した色に対応
        return;
    }
    */
    if($gameMap.regionId(x,y) == regionWall){//指定マスのリージョンがregionWallの値だった場合
        this.setTile2(x,y,0);
        return;
    }
    if($gameMap.isPassable(x,y,2) || $gameMap.isPassable(x,y,4) || 
                $gameMap.isPassable(x,y,6) || $gameMap.isPassable(x,y,8)){//指定マスが通行可能の時
        this.setTile2(x,y,1);
        return;
    }
    //何も該当しなかった時
    this.setTile2(x,y,0);
    return;
};

/*条件の書き方例
if($gameMap.terrainTag(x,y) == 2)  座標x,yの地形タグが2の時
if($gameMap.isDamageFloor(x,y))　座標x,yがダメージ床の時
その他、指定マスの情報を調べるメソッドは rpg_object.js の Game_Mapクラスを探すと見つかると思います
*/
//==================================================================================================


Sprite_MiniMap.prototype.setTile2 = function(x,y,No){
    $gameVariables._data[v1][$gameMap.mapId()][y * $gameMap.width() + x] = No;
};

Sprite_MiniMap.prototype.updateFrame2 = function() {
    if(this._lastX != $gamePlayer._realX || this._lastY != $gamePlayer._realY){
        this.bitmap.clear();
        this.drawMap2();
        this._lastX = $gamePlayer._realX;
        this._lastY = $gamePlayer._realY;
    }
};

Sprite_MiniMap.prototype.drawMap2 = function(){
    var sx = Math.floor($gamePlayer.x - (minimapWidth / this.tileSize) / 2) - 1;
    sx = sx.clamp(0,$gameMap.width());
    var ex = Math.floor($gamePlayer.x + (minimapWidth / this.tileSize) / 2) + 2;
    ex = ex.clamp(0,$gameMap.width());
    var sy = Math.floor($gamePlayer.y - (minimapWidth / this.tileSize) / 2) - 1;
    sy = sy.clamp(0,$gameMap.height());
    var ey = Math.floor($gamePlayer.y + (minimapWidth / this.tileSize) / 2) + 2;
    ey = ey.clamp(0,$gameMap.height());
    for(var i = sx; i < ex; i ++){
        for(var j = sy; j < ey; j ++){
            if(this.drawTile2(i,j)){
                this.drawLine2(i,j);
            }
        }
    }
}

//タイルの描画
Sprite_MiniMap.prototype.drawTile2 = function(x,y){
    var colorNo = $gameVariables._data[v1][$gameMap.mapId()][y * $gameMap.width() + x];
    if(colorNo > 0){
        var mx = x - $gamePlayer._realX;
        var my = y - $gamePlayer._realY;
        this.bitmap.fillRect(Math.floor(mx * this.tileSize) + (minimapWidth - this.tileSize) / 2, Math.floor(my * this.tileSize) + (minimapWidth - this.tileSize) / 2, this.tileSize, this.tileSize,minimapTileColors[colorNo]);
        return true;
    }else{
        return false;
    }
};

//タイルとタイルの間の仕切り
Sprite_MiniMap.prototype.drawLine2 = function(x,y){
    var mx = x - $gamePlayer._realX;
    var my = y - $gamePlayer._realY;
    if(!$gameMap.isPassable(x,y,2) || !$gameMap.isPassable(x,y+1,8)){
        this.bitmap.clearRect(Math.floor(mx * this.tileSize) + (minimapWidth - this.tileSize) / 2 - 1, Math.floor((my + 1) * this.tileSize) + (minimapWidth - this.tileSize) / 2 - 1, this.tileSize + 1, 1);
    }
    if(!$gameMap.isPassable(x,y,6) || !$gameMap.isPassable(x+1,y,4)){
        this.bitmap.clearRect(Math.floor((mx + 1) * this.tileSize) + (minimapWidth - this.tileSize) / 2 - 1, Math.floor(my * this.tileSize) + (minimapWidth - this.tileSize) / 2 - 1, 1, this.tileSize + 1);
    }
};

//自キャラシンボルの位置更新(現仕様では中心で固定)
Sprite_MiniMap.prototype.updateSymbols2 = function() {
    this.symbol_p.x = (minimapWidth - this.tileSize) / 2;
    this.symbol_p.y = (minimapWidth - this.tileSize) / 2;
};

})();