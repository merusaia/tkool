//=============================================================================
// liply_onBitmapLoad_patch.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 liply
// This plugin is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// [Blog]   : http://liply.net/
// [Twitter]: https://twitter.com/liplynet/
// [GitHub] : https://github.com/liply/
//=============================================================================
/*:
 * @plugindesc onBitmapLoad_patch
 * @author liply
 *
 * @help 
 *  If you use this plugin, put on this plugin list "upper" than "ParallelPreload.js".
 *  This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc onBitmapLoad_patch
 * @author liply
 * 
 * @help 
 *  このプラグインは、onBitmapLoad_patch パッチです。
 *  bitmap形式でサポートされた画像読み込みエラーを防止します。
 *
 *  ※トリアコンタンさんのBugFixImageOnLoad.jsプラグインと、機能が重複しています。どちらか一つをONにしてください。
 * 
 * 【競合について】
 * ・rpg_core.jsの Sprite.prototype._onBitmapLoad を上書きしています。
 *   → このメソッドを宣言しているプラグインと一緒に使うと競合しますので、注意してください。
 * ・具体例：
 * トリアコンタンさんのプリロードプラグイン"ParallelPreload.js"と競合します。
 * 上記プラグインと併用する際は、必ず、このプラグインを、"ParallelPreload.js"の上、においてください。
 * でないと、マップ上のキャラや宝箱など、複数の画像が透明になる不具合が発生します。
 *
 * （日本語ヘルプは、merusaiaが追記しました。
 *  内容のご質問は https://twitter.com/liplynet/ 
 *  ヘルプの誤字脱字・その他要望は https://twitter.com/merusaia/ まで。）
 *
 * 【利用規約】
 * MITライセンスです。詳細: http://wisdommingle.com/mit-license/
 */
 
 //License: MIT
Sprite.prototype._onBitmapLoad = function() {
    if (!!this._bitmap && this._frame.width === 0 && this._frame.height === 0) {
        this._frame.width = this._bitmap.width;
        this._frame.height = this._bitmap.height;
    }
    this._refresh();
};