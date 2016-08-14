//=============================================================================
// liply_LoopPointPatch.js
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
 * @plugindesc BGM Loop Point BugFix Patch
 * @author liply
 *
 * @help There is BGM Loop Point problem on 2016/8/10 MV 1.3.0 Update.
 * This patch fix it.
 * 
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc 一部BGMのループが正常に動かない不具合修正パッチ
 * @author liply
 * 
 * @help 
 *  このプラグインは、2016/8/10のツクールMV ver 1.3.0にて、
 *  一部BGMのループが正常に動かない不具合を修正するプラグインです。
 *  
 * 【競合について】
 * ・rpg_core.js内の、WebAudio.prototype._onXhrLoadを上書きしています。
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
    'use strict';
    WebAudio.prototype._onXhrLoad = function(xhr) {
        var array = xhr.response;
        if(Decrypter.hasEncryptedAudio) array = Decrypter.decryptArrayBuffer(array);
        this._readLoopComments(new Uint8Array(array));
        WebAudio._context.decodeAudioData(array, function(buffer) {
            this._buffer = buffer;
            this._totalTime = buffer.duration;
            if (this._loopLength > 0 && this._sampleRate > 0) {
                this._loopStart /= this._sampleRate;
                this._loopLength /= this._sampleRate;
            } else {
                this._loopStart = 0;
                this._loopLength = this._totalTime;
            }
            this._onLoad();
        }.bind(this));
    };
})();