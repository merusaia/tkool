//=============================================================================
// liply_TileMapPatch.js
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
 * @plugindesc TileMap Chipped BugFix Patch
 * @author liply
 *
 * @help There is TileMap Chipped problem on 2016/8/10 MV 1.3.0 Update.
 * This patch fix it.
 * 
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc タイルマップが欠ける不具合修正パッチ
 * @author liply
 * 
 * @help 
 *  このプラグインは、2016/8/10のツクールMV ver 1.3.0にて、
 *  特定条件下でタイルマップの右端が欠ける不具合を修正するプラグインです。
 *  
 * 【競合について】
 * ・js\libs\pixi-tilemap.js内の、以下を上書きしています。
 *   TileRenderer.prototype.checkIndexBuffer
 *   TileRenderer.prototype.getVb
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
(function () {
    'use strict';
    var TileRenderer = PIXI.WebGLRenderer.__plugins.tile;
    TileRenderer.prototype.checkIndexBuffer = function(size) {
        // the total number of indices in our array, there are 6 points per quad.
        var totalIndices = size * 6;
        var indices = this.indices;
        if (totalIndices <= indices.length) {
            return;
        }
        var len = indices.length || totalIndices;
        while (len < totalIndices) {
            len <<= 1;
        }

        indices = new Uint16Array(len);
        this.indices = indices;

        // fill the indices with the quads to draw
        for (var i=0, j=0; i < len; i += 6, j += 4)
        {
            indices[i + 0] = j + 0;
            indices[i + 1] = j + 1;
            indices[i + 2] = j + 2;
            indices[i + 3] = j + 0;
            indices[i + 4] = j + 2;
            indices[i + 5] = j + 3;
        }

        this.indexBuffer.upload(indices);
    };

    TileRenderer.prototype.getVb = function(id) {
        this.checkLeaks();
        var vb = this.vbs[id];
        if (vb) {
            vb.lastTimeAccess = Date.now();
            return vb;
        }
        return null;
    };
})();