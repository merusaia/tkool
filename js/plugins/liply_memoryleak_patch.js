//=============================================================================
// liply_memoryleak_patch.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 liply
// This plugin is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// 2016/02/01 Canvasモード起動時や特定状況で落ちるバグを修正
// 2015/12/05 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://liply.net/
// [Twitter]: https://twitter.com/liplynet/
// [GitHub] : https://github.com/liply/
//=============================================================================

/*:
 * @plugindesc memory leak patch
 * @author liply
 *
 * @help Tiling_Sprite leaks memory. this patch fix it.
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc メモリリークパッチ
 * @author liply
 * 
 * @help Tiling_Spriteのメモリリークパッチです。
 * 
 * ※Ver.1.2.0以降は、このプラグインは必要ありません。rpg_core.jsに含まれてます（ver.1.3.0ではrpg_core.jsからこの処理自体が消えたようです）。
 * 
 * 
 * 【競合について】
 * ・トリアコンタンさんのデバッグ支援プラグイン"DevToolsManage.js"と競合します。理由はよくわかっていません。
 * 上記プラグインと併用する際は、必ず、このプラグインを、
 * "DevToolsManage.js"の上、においてください。
 * でないと、戦闘中など、画像の読み込み時に、時々エラーで落ちる不具合が発生することがあります。
 *
 * （日本語ヘルプは、merusaiaが追記しました。
 *  内容のご質問は https://twitter.com/liplynet/ 
 *  ヘルプの誤字脱字・その他要望は https://twitter.com/merusaia/ まで。）
 * 
 * 【利用規約】
 * MITライセンスです。詳細: http://wisdommingle.com/mit-license/
 */

(function(){
    var TilingSprite_prototype_generateTilingTexture = TilingSprite.prototype.generateTilingTexture;
    TilingSprite.prototype.generateTilingTexture = function(arg){
        TilingSprite_prototype_generateTilingTexture.call(this, arg);
        // purge from Pixi's cache
        // Originally, we must call TilingSprite's destroy method, but RPG Maker doesn't use destroy methods and relies on GC.
        // This means TilingSprite's inner tilingTexture is never removed from the cache (PIXI.BaseTextureCache).
        // As long as we don't use destroy, we have to call removeTextureFromCache explicitly after generating TilingSprite.
        if (this.tilingTexture.canvasBuffer)
            PIXI.Texture.removeTextureFromCache(this.tilingTexture.canvasBuffer.canvas._pixiId);
    }
})();