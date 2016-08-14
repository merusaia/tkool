//=============================================================================
// liply_WinChrome_scroll_patch.js
// ----------------------------------------------------------------------------
// Copyright (c) 2016 liply
// This plugin is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// [Blog]   : http://liply.net/
// [Twitter]: https://twitter.com/liplynet/
// [GitHub] : https://github.com/liply/
//=============================================================================
/*:
 * @plugindesc Windows Chrome scroll patch
 * @author liply
 *
 * @help There is rendering problem on 2016/4/6 Windows Chrome.
 * MV Core creates large canvas garbage. This patch fix it.
 * 
 * Special Thanks
 * @o_ggy
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc Windows Chrome scroll patch
 * @author liply
 * 
 * @help 
 *  このプラグインは、Windows Chrome scroll patch パッチです。
 *  2016/4/6 時点の Windows Chrome にて、ツクールMVコアが不要なメモリを使うのを修正するプラグインです。
 * 
 * 【競合について】
 * rpg_core.jsの Tilemap.prototype._createLayers を上書きしています。
 *   → このメソッドを宣言しているプラグインと一緒に使うと競合しますので、注意してください。
 * ・その他、特に見つかっていません。見つかりましたら、下記まで報告願います。
 *
 * （日本語ヘルプは、merusaiaが追記しました。
 *  内容のご質問は https://twitter.com/liplynet/ 
 *  ヘルプの誤字脱字・その他要望は https://twitter.com/merusaia/ まで。）
 * 
 * 【利用規約】
 * MITライセンスです。詳細: http://wisdommingle.com/mit-license/
 */
 
 //License: MIT
(function(){
Tilemap.prototype._createLayers = function() {
    var width = this._width;
    var height = this._height;
    var margin = this._margin;
    var tileCols = Math.ceil(width / this._tileWidth) + 1;
    var tileRows = Math.ceil(height / this._tileHeight) + 1;
    var layerWidth = tileCols * this._tileWidth;
    var layerHeight = tileRows * this._tileHeight;
    
    if(!this._lowerBitmap || (this._lowerBitmap.width !== layerWidth || this._lowerBitmap.height !== layerHeight)){
        if( Tilemap._lowerBitmapCache && 
            layerWidth === Tilemap._lowerBitmapCache.width && 
            layerHeight === Tilemap._lowerBitmapCache.height){
            
            this._lowerBitmap = Tilemap._lowerBitmapCache;
            this._upperBitmap = Tilemap._upperBitmapCache;
        }else{
            this._lowerBitmap = new Bitmap(layerWidth, layerHeight);
            this._upperBitmap = new Bitmap(layerWidth, layerHeight);
        }
        Tilemap._lowerBitmapCache = this._lowerBitmap;
        Tilemap._upperBitmapCache = this._upperBitmap;
    }
    this._layerWidth = layerWidth;
    this._layerHeight = layerHeight;

    /*
     * Z coordinate:
     *
     * 0 : Lower tiles
     * 1 : Lower characters
     * 3 : Normal characters
     * 4 : Upper tiles
     * 5 : Upper characters
     * 6 : Airship shadow
     * 7 : Balloon
     * 8 : Animation
     * 9 : Destination
     */

    this._lowerLayer = new Sprite();
    this._lowerLayer.move(-margin, -margin, width, height);
    this._lowerLayer.z = 0;

    this._upperLayer = new Sprite();
    this._upperLayer.move(-margin, -margin, width, height);
    this._upperLayer.z = 4;

    for (var i = 0; i < 4; i++) {
        this._lowerLayer.addChild(new Sprite(this._lowerBitmap));
        this._upperLayer.addChild(new Sprite(this._upperBitmap));
    }

    this.addChild(this._lowerLayer);
    this.addChild(this._upperLayer);
};
})();