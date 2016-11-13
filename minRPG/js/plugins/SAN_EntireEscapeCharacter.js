//=============================================================================
// SAN_EntireEscapeCharacter.js
//=============================================================================
// Copyright (c) 2016 Sanshiro
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc SAN_EntireEscapeCharacter ver1.10
 * Apply changing string display by escape character to all window.
 * @author Sanshiro https://twitter.com/rev2nym
 * 
 * @help
 * Apply changing string display by escape character to all window.
 * 
 * There is no plugin commands.
 * 
 * It's possible to commercial use, distribute, and modify under the MIT license.
 * But, don't eliminate and don't alter a comment of the beginning.
 * If it's good, please indicate an author name on credit.
 * 
 * Author doesn't shoulder any responsibility in all kind of damage by using this.
 * And please don't expect support. X(
 * 
 * @param DontApplyWindowList
 * @desc Dont apply escape character window list.
 * Set names of window that shouldn't apply escape character. Separate with commas.
 * @default Window_TitleCommand, Window_ItemCategory
 * 
 * @param TitleTextX
 * @desc X coordinate of title text.
 * When don't set, it use default value.
 * @default 
 * 
 * @param TitleTextY
 * @desc Y coordinate of title text.
 * When don't set, it use default value.
 * @default 
 */

/*:ja
 * @plugindesc 広範制御文字 ver1.10
 * 制御文字による文字列の表示変更をすべてのウィンドウに適用します。
 * @author サンシロ https://twitter.com/rev2nym
 * @version 1.10 2016/04/02 タイトル画面テキストの制御文字に対応、適用外ウィンドウの制御文字除去の不具合を修正
 * 1.00 2016/04/02 公開
 * 
 * @help
 * 制御文字による文字列の表示変更をすべてのウィンドウに適用します。
 * 
 * プラグインコマンドはありません。
 * 
 * MITライセンスのもと、商用利用、改変、再配布が可能です。
 * ただし冒頭のコメントは削除や改変をしないでください。
 * よかったらクレジットに作者名を記載してください。
 * 
 * これを利用したことによるいかなる損害にも作者は責任を負いません。
 * サポートは期待しないでください＞＜。
 * 
 * @param DontApplyWindowList
 * @desc 制御文字を適用しないウィンドウのリストです。
 * ウィンドウのクラス名をコンマ区切りで記述してください（複数指定可能）。
 * @default Window_TitleCommand, Window_ItemCategory
 * 
 * @param TitleTextX
 * @desc タイトルテキスト表示のX座標です。
 * 未設定の場合デフォルトの値が適用されます。
 * @default 
 * 
 * @param TitleTextY
 * @desc タイトルテキスト表示のY座標です。
 * 未設定の場合デフォルトの値が適用されます。
 * @default 
 */

var Imported = Imported || {};
Imported.SAN_EntireEscapeCharacter = true;

var Sanshiro = Sanshiro || {};
Sanshiro.EntireEscapeCharacter = Sanshiro.EntireEscapeCharacter || {};

// プラグインパラメータ : 制御文字を適用しないウィンドウのクラス名のリスト
Sanshiro.EntireEscapeCharacter.dontApplyWindowList =
    PluginManager.parameters('SAN_EntireEscapeCharacter')["DontApplyWindowList"].split(',');
Sanshiro.EntireEscapeCharacter.dontApplyWindowList.forEach( function(name, index, list) {
    list[index] = name.trim();
});

//-----------------------------------------------------------------------------
// Window_Base
//
// ベースウィンドウ

Sanshiro.EntireEscapeCharacter.Window_Base_drawText = Window_Base.prototype.drawText;
Window_Base.prototype.drawText = function(text, x, y, maxWidth, align) {
    var regex = /(\\[VNPCI](\[\d+\]))|(\\[G{}\\|$.|!><^])/g;
    if (regex.test(text.toString())) {
        if (!Sanshiro.EntireEscapeCharacter.dontApplyWindowList.contains(this.constructor.name)) {
            this.drawTextEx(text.toString(), x, y);
            return;
        } else {
            text = text.replace(regex, '');
        }
    }
    Sanshiro.EntireEscapeCharacter.Window_Base_drawText.call(this, text, x, y, maxWidth, align);
};

//-----------------------------------------------------------------------------
// Window_GameTitle
//
// ゲームタイトルウィンドウ

function Window_GameTitle() {
    this.initialize.apply(this, arguments);
}

Window_GameTitle.prototype = Object.create(Window_Base.prototype);
Window_GameTitle.prototype.constructor = Window_GameTitle;

Window_GameTitle.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.opacity = 0;
};

//-----------------------------------------------------------------------------
// Scene_Boot
//
// ブートシーン

Scene_Boot.prototype.updateDocumentTitle = function() {
    var regex = /(\\[VNPCI](\[\d+\]))|(\\[G{}\\|$.|!><^])/g;
    document.title = $dataSystem.gameTitle.replace(regex, '');
    console.log(document.title);
};

//-----------------------------------------------------------------------------
// Scene_Title
//
// タイトルシーン

Scene_Title.prototype.createForeground = function() {};

Scene_Title.prototype.createGameTitleWindow = function() {
    this._gameTieleWindow = new Window_GameTitle(0, 0, Graphics.width, Graphics.height);
    this.addWindow(this._gameTieleWindow);
    if ($dataSystem.optDrawTitle) {
        var titleTextX = PluginManager.parameters('SAN_EntireEscapeCharacter')["TitleTextX"];
        var x = Number(titleTextX);
        if (titleTextX.length === 0 || Number.isNaN(x)) {
            x = 20;
        }
        var titleTextY = PluginManager.parameters('SAN_EntireEscapeCharacter')["TitleTextY"];
        var y = Number(titleTextY);
        if (titleTextY.length === 0 || Number.isNaN(y)) {
            y = Graphics.height / 4;
        }
        var maxWidth = Graphics.width - x * 2;
        var text = $dataSystem.gameTitle;
        this._gameTieleWindow.contents.outlineColor = 'black';
        this._gameTieleWindow.contents.outlineWidth = 8;
        this._gameTieleWindow.contents.fontSize = 72;
        this._gameTieleWindow.drawText($dataSystem.gameTitle, x, y, maxWidth, 'center');
    }
};

Scene_Title.prototype.create = function() {
    this.createBackground();
    this.createForeground();
    this.createWindowLayer();
    this.createGameTitleWindow();
    this.createCommandWindow();
};
