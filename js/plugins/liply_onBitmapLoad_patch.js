/*:
 * @plugindesc onBitmapLoad_patch
 * @author liply
 *
 * @help 
 *  put on plugin list "upper" than "ParallelPreload.js".
 */
/*:ja
 * @plugindesc onBitmapLoad_patch
 * @author liply
 * 
 * @help 
 *  このプラグインは、onBitmapLoad_patch パッチです。
 *  bitmap形式でサポートされた画像読み込みエラーを防止します（たぶん）。
 *
 *  ※トリアコンタンさんのBugFixImageOnLoad.jsプラグインがあれば、このパッチは必要ありません。機能が重複しています。
 * 
 *　【競合について】
 * トリアコンタンさんのプリロードプラグイン"ParallelPreload.js"と競合します。
 * 上記プラグインと併用する際は、必ず、このプラグインを、
 * "ParallelPreload.js"の上、においてください。
 * でないと、マップ上のキャラや宝箱など、複数の画像が透明になる不具合が発生します。
 *
 * （編集：ヘルプは、merusaiaが追記しました。ご質問などはtwitter @merusaia まで。）
 *
 * MITライセンスです！
 */
 
 //License: MIT
Sprite.prototype._onBitmapLoad = function() {
    if (!!this._bitmap && this._frame.width === 0 && this._frame.height === 0) {
        this._frame.width = this._bitmap.width;
        this._frame.height = this._bitmap.height;
    }
    this._refresh();
};