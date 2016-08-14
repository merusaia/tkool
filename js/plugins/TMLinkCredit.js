//=============================================================================
// TMVplugin - リンククレジット
// 作者: tomoaky (http://hikimoki.sakura.ne.jp/)
// Version: 1.11
// 最終更新日: 2016/03/18
//=============================================================================

/*:
 * @plugindesc タイトルコマンドにリンク機能付きクレジットを追加します。
 * 利用素材の配布元へユーザーを誘導することが容易になります。
 * 
 * @author tomoaky (http://hikimoki.sakura.ne.jp/)
 *
 * @param creditsCommand
 * @desc タイトルメニューに表示するコマンド名
 * 初期値: クレジット
 * @default クレジット
 *
 * @param helpLines
 * @desc サイト名の下に表示するヘルプの行数（ 0 で非表示）
 * 初期値: 2
 * @default 2
 *
 * @param helpHeight
 * @desc サイト名の下に表示するヘルプの１行の高さ
 * 初期値: 24
 * @default 24
 *
 * @param useHelpWindow
 * @desc ヘルプウィンドウを使うかどうか（ 0 で使わない、1 で使う）
 * 初期値: 1
 * @default 1
 *
 * @param helpWindowText
 * @desc ヘルプウィンドウに表示するテキスト（空なら自動ヘルプ）
 * 初期値: 選択したサイトを開くことができます。\n（ブラウザがポップアップを禁止していると機能しません）
 * @default 選択したサイトを開くことができます。\n（ブラウザがポップアップを禁止していると機能しません）
 *
 * @param nameColorId
 * @desc サイト名の文字色番号（文章の表示コマンドと同等）
 * 初期値: 16
 * @default 16
 *
 * @param urlFontSize
 * @desc アドレス表示のフォントサイズ（ 0 で非表示）
 * 初期値: 16
 * @default 16
 *
 * @param urlMaxLength
 * @desc アドレスの最大文字数
 * 初期値: 50
 * @default 50
 *
 * @param credit1
 * @desc クレジット１
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default <name:自分のサイト名><help:制作><url:自分のサイトアドレス>
 *
 * @param credit2
 * @desc クレジット２
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default <name:RPGツクールMV><help:制作ツール ©2015 KADOKAWA CORPORATION./YOJI OJIMA\nゲームデータの抽出、改変、二次利用(有償・無償問わず)は禁止されています。><url:https://tkool.jp/mv/>
 *
 * @param credit3
 * @desc クレジット３
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit4
 * @desc クレジット４
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit5
 * @desc クレジット５
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit6
 * @desc クレジット６
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit7
 * @desc クレジット７
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit8
 * @desc クレジット８
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit9
 * @desc クレジット９
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit10
 * @desc クレジット１０
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit11
 * @desc クレジット１１
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit12
 * @desc クレジット１２
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit13
 * @desc クレジット１３
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit14
 * @desc クレジット１４
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit15
 * @desc クレジット１５
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit16
 * @desc クレジット１６
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit17
 * @desc クレジット１７
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit18
 * @desc クレジット１８
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit19
 * @desc クレジット１９
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit20
 * @desc クレジット２０
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit21
 * @desc クレジット２１
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit22
 * @desc クレジット２２
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit23
 * @desc クレジット２３
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit24
 * @desc クレジット２４
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit25
 * @desc クレジット２５
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit26
 * @desc クレジット２６
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit27
 * @desc クレジット２７
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit28
 * @desc クレジット２８
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit29
 * @desc クレジット２９
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param credit30
 * @desc クレジット３０
 * 書式: <name:名前><help:説明><url:アドレス>
 * @default 
 *
 * @param titleCommandAlign
 * @desc タイトルコマンドのアライメント
 * 初期値: 0（0: 左寄せ / 1: 中央 / 2: 右寄せ）
 * @default 0
 *
 * @help <name:名前><help:説明><url:アドレス> のように
 * ３つのタグで１つの要素を設定します。
 *
 * helpタグの内容は \n があるところで改行されます。
 *
 * ブラウザ側でポップアップを制限している場合、
 * この機能は正しく動作しません。
 *
 * プラグインコマンドはありません。
 */

var Imported = Imported || {};
Imported.TMLinkCredit = true;

(function() {

  var parameters = PluginManager.parameters('TMLinkCredit');
  var creditsCommand = parameters['creditsCommand'];
  var helpLines      = +parameters['helpLines'];
  var helpHeight     = +parameters['helpHeight'];
  var useHelpWindow  = parameters['useHelpWindow'] === '1' ? true : false;
  var helpWindowText = parameters['helpWindowText'].replace(/\\n/g, '\n');
  var nameColorId    = +parameters['nameColorId'];
  var urlFontSize    = +parameters['urlFontSize'];
  var urlMaxLength   = +parameters['urlMaxLength'];
  var credits = [];
  for (var i = 0; i < 30; i++) {
    credits[i] = parameters['credit' + (i + 1)];
  }
  var titleCommandAlign = +parameters['titleCommandAlign'];

  //-----------------------------------------------------------------------------
  // Window_TitleCommand
  //

  var _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
  Window_TitleCommand.prototype.makeCommandList = function() {
    _Window_TitleCommand_makeCommandList.call(this);
    this.addCommand(creditsCommand,   'credits');
  };

  var _Window_TitleCommand_itemTextAlign = Window_TitleCommand.prototype.itemTextAlign;
  Window_TitleCommand.prototype.itemTextAlign = function() {
    if (titleCommandAlign === 1) return 'center';
    if (titleCommandAlign === 2) return 'right';
    _Window_TitleCommand_itemTextAlign.call(this);
  };

  //-----------------------------------------------------------------------------
  // Window_Credits
  //

  function Window_Credits() {
    this.initialize.apply(this, arguments);
  }

  Window_Credits.prototype = Object.create(Window_Selectable.prototype);
  Window_Credits.prototype.constructor = Window_Credits;

  Window_Credits.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._data     = [];
    this._dataHelp = [];
    this._dataUrl  = [];
    var re = /<name:(.+?)><help:(.+?)><url:(.+?)>/;
    for (var i = 0; i < credits.length; i++) {
      var match = re.exec(credits[i]);
      if (match) {
        this._data.push(match[1]);
        this._dataHelp.push(match[2].replace(/\\n/g, '\n'));
        this._dataUrl.push(match[3]);
      }
    }
    this.refresh();
    this.select(0);
    this.activate();
  };

  Window_Credits.prototype.lineHeight = function() {
    return Window_Selectable.prototype.lineHeight.call(this) +
           helpHeight * helpLines;
  };

  Window_Credits.prototype.maxItems = function() {
    return this._data ? this._data.length : 1;
  };

  Window_Credits.prototype.item = function() {
    var index = this.index();
    return this._data && index >= 0 ? this._data[index] : null;
  };

  Window_Credits.prototype.drawItem = function(index) {
    var item = this._data[index];
    if (item) {
      var rect = this.itemRect(index);
      var lineHeightOrigin = Window_Selectable.prototype.lineHeight();
      rect.x += this.textPadding();
      rect.width -= this.textPadding() * 2;
      this.contents.fontSize = this.standardFontSize();
      this.changeTextColor(this.textColor(nameColorId));
      this.contents.drawText(item, rect.x, rect.y, rect.width, lineHeightOrigin);
      this.resetTextColor();
      if (urlFontSize > 0) {
        this.contents.fontSize = urlFontSize;
        var len = this._dataUrl[index];
        for (var i = 0; i < Math.floor(this.lineHeight() / urlFontSize); i++) {
          var j = urlMaxLength * i;
          if (j >= this._dataUrl[index].length) break;
          this.contents.drawText(this._dataUrl[index].substr(urlMaxLength * i, urlMaxLength),
                                 rect.x, rect.y + urlFontSize * i, rect.width,
                                 lineHeightOrigin, 'right');
        }
        this.contents.drawText(this._dataUrl[index].substr(0, urlMaxLength),
                               rect.x, rect.y, rect.width, lineHeightOrigin, 'right');
      }
      if (helpLines > 0) {
        this.contents.fontSize = helpHeight - 8;
        var textArray = this._dataHelp[index].split('\n');
        for (var i = 0; i < helpLines; i++) {
          if (textArray[i]) {
            this.contents.drawText(textArray[i], rect.x, rect.y + lineHeightOrigin +
                                   helpHeight * i, rect.width, helpHeight);
          }
        }
      }
    }
  };

  Window_Credits.prototype.updateHelp = function() {
    var text = helpWindowText || this._dataHelp[this.index()];
    this._helpWindow.setText(text);
  };

  Window_Credits.prototype.urlOpen = function() {
    window.open(this._dataUrl[this.index()], '_blank');
  };

  //-----------------------------------------------------------------------------
  // Scene_Title
  //

  var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
  Scene_Title.prototype.createCommandWindow = function() {
    _Scene_Title_createCommandWindow.call(this);
    this._commandWindow.setHandler('credits', this.commandCredits.bind(this));
  };

  Scene_Title.prototype.commandCredits = function() {
    this._commandWindow.close();
    SceneManager.push(Scene_Credits);
  };

  //-----------------------------------------------------------------------------
  // Scene_Credits
  //

  function Scene_Credits() {
    this.initialize.apply(this, arguments);
  }

  Scene_Credits.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_Credits.prototype.constructor = Scene_Credits;

  Scene_Credits.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
  };

  Scene_Credits.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    if (useHelpWindow) this.createHelpWindow();
    this.createCreditsWindow();
  };

  Scene_Credits.prototype.createCreditsWindow = function() {
    if (useHelpWindow) {
      var wy = this._helpWindow.height;
      var wh = Graphics.boxHeight - this._helpWindow.height;
    } else {
      var wy = 0, wh = Graphics.boxHeight;
    }
    this._creditsWindow = new Window_Credits(0, wy, Graphics.boxWidth, wh);
    this._creditsWindow.setHandler('ok',     this.onCreditsOk.bind(this));
    this._creditsWindow.setHandler('cancel', this.popScene.bind(this));
    if (useHelpWindow) {
      this._creditsWindow.setHelpWindow(this._helpWindow);
    }
    this.addWindow(this._creditsWindow);
  };

  Scene_Credits.prototype.onCreditsOk = function() {
    this._creditsWindow.urlOpen();
    this._creditsWindow.activate();
  };

})();
