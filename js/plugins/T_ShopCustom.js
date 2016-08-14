//=============================================================================
// T_ShopCustom.js
//=============================================================================
//Copyright (c) 2016 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
//twitter https://twitter.com/Trb_surasura
/*:
 * @plugindesc 装備画面改変プラグイン
 * @author Trb
 * @version 1.00 2016/4/27 初版
 * 
 * @help ショップ画面の装備情報の部分を改変します。
 * また、装備品を買った時にその場で装備するかどうかの選択肢が出るようになります。
 * 
 * デフォルトの規格にしか対応していないので、アクター画像の大きさや画面サイズを
 * 変更していると、レイアウトが崩れてしまいます。ご注意下さい。
 * 
 * <パラメータの説明>
 * 装備の性能詳細に表示させるパラメータを設定できます。
 * 初期設定ではHPから運まで全て表示されますが、不要なステータスがある場合は変更して下さい。
 * 0･･･HP
 * 1･･･MP
 * 2･･･攻撃力
 * 3･･･防御力
 * 4･･･魔法力
 * 5･･･魔法防御
 * 6･･･敏捷性
 * 7･･･運
 * に対応していて、たとえば攻撃力、防御力、魔法力、魔法防御のみ表示させたければ
 * paramsの値を 2,3,4,5 にすればいいです。
 * 
 * @param params
 * @desc 表示させるパラメータ(詳しくはヘルプを見て下さい)
 * @default 0,1,2,3,4,5,6,7
 * 
 * @param text_soubi_simasuka
 * @desc その場で装備するかどうかのテキスト
 * @default 装備しますか？
 * 
 * @param text_yes
 * @desc 選択肢:装備する時のテキスト
 * @default はい
 * 
 * @param text_no
 * @desc 選択肢:装備しない時のテキスト
 * @default いいえ
 * 
 */
(function () {
	
	var parameter = PluginManager.parameters('T_ShopCustom');
	var param1 = String(parameter['params']).split(',');
    var text1 = String(parameter['text_soubi_simasuka']);
    var text2 = String(parameter['text_yes']);
    var text3 = String(parameter['text_no']);

//--------------------------------------------------
//ステータスウインドウの改変
Window_ShopStatus.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._item = null;
    this._pageIndex = 0;
    this._characterIndex = 0;
    this.refresh();
};

Window_ShopStatus.prototype.standardFontSize = function() {
    return 27;
};

Window_Base.prototype.lineHeight = function() {
    return 34;
};

Window_ShopStatus.prototype.pageSize = function() {
    return 4;
};

Window_ShopStatus.prototype.updatePage = function() {
    if(this.active && this.visible){
        this.updateIndex();
        this.updateIndex_touch();
    }
};

//左右キーでキャラ切り替え
Window_ShopStatus.prototype.updateIndex = function() {
    if(Input.isRepeated('right') && this._characterIndex < $gameParty.members().length - 1){
        this._characterIndex += 1;
        if(this._pageIndex <= this._characterIndex - this.pageSize()){
            this._pageIndex ++;
        }
        this.refresh();
        SoundManager.playCursor();
    }
    if(Input.isRepeated('left') && this._characterIndex > 0){
        this._characterIndex -= 1;
        if(this._pageIndex > this._characterIndex){
            this._pageIndex --;
        }
        this.refresh();
        SoundManager.playCursor();
    }
};

//タッチ操作でのキャラ切り替え
Window_ShopStatus.prototype.updateIndex_touch = function() {
    if(TouchInput.isTriggered() && TouchInput.x > this.x && TouchInput.x < this.x + this.width 
        && TouchInput.y > this.y && TouchInput.y < this.y + 100){//タッチした位置が範囲に収まってる時
        var div = Math.min($gameParty.members().length,4);
        var touch = Math.floor(((TouchInput.x - this.x) / this.width) * div);
        
        if(touch == 0 && this._pageIndex > 0 && this._characterIndex == this._pageIndex){
            this._characterIndex --;console.log('1');
            this._pageIndex --;
            this.refresh();
            SoundManager.playCursor();
        } else if(touch == 3 && this._pageIndex < $gameParty.members().length - 4 && this._characterIndex == this._pageIndex + 3){
            this._characterIndex ++;console.log('2');
            this._pageIndex ++;
            this.refresh();
            SoundManager.playCursor();
        }else{
            this._characterIndex = this._pageIndex + touch;
            this.refresh();console.log('3',this._pageIndex);
            SoundManager.playCursor();
        }
    }
};


	
Window_ShopStatus.prototype.refresh = function() {
    this.contents.clear();
    if (this._item) {
        var x = this.textPadding();
        this.drawPossession(0, this.lineHeight() * 3 - 4);
        this.drawActorIcon(x, 24);//アクター画像の表示を追加
        this.contents.paintOpacity = 60;
        this.contents.fillRect(0, 84, this.contents.width, 2, this.normalColor());
        this.contents.paintOpacity = 255;
        if (this.isEquipItem()) {
            this.drawEquipInfo(0, this.lineHeight() * 4);
        }
    }
};

Window_ShopStatus.prototype.drawPossession = function(x, y) {
    var width = this.contents.width - this.textPadding() - x;
    var possessionWidth = this.textWidth('0000');
    this.changeTextColor(this.textColor(12));
    this.drawText(TextManager.possession, x, y, width - possessionWidth);
    this.resetTextColor();
    this.drawText($gameParty.numItems(this._item), x, y, width, 'right');
};


Window_ShopStatus.prototype.drawEquipInfo = function(x, y) {
    var members = $gameParty.members();
    this.drawActorEquipInfo(x, y, members[this._characterIndex]);
};

Window_ShopStatus.prototype.drawActorEquipInfo = function(x, y, actor) {
    var enabled = actor.canEquip(this._item);
//    this.changePaintOpacity(enabled);
    this.resetTextColor();
    var item1 = this.currentEquippedItem(actor, this._item.etypeId);
    this.drawActorParamChange(this.textPadding(), y, actor, item1 ,enabled);
//    this.drawItemName(item1, this.textPadding(), y + this.lineHeight());
    this.changePaintOpacity(true);
};

//パラメータ変化の描画
Window_ShopStatus.prototype.drawActorParamChange = function(x, y, actor, item1, enabled) {
    var width = this.contents.width - this.textPadding() - x;
    for(var i = 0;i < param1.length;i ++){
        var dy = y + this.lineHeight() * i;
        var paramId = Number(param1[i]);
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.param(paramId),0, dy, 160);//パラメータ名（HP,攻撃力など）
        this.changeTextColor(this.normalColor());
        this.drawText(actor.param(paramId), x + 140, dy, 60, 'right');//現在の値
        this.changeTextColor(this.systemColor());
        this.drawText('\u2192', x + 198, dy, 32, 'right');//'\u2192'・・・右向きの矢印

        if(enabled){
            var change = this._item.params[paramId] - (item1 ? item1.params[paramId] : 0);
            this.changeTextColor(this.paramchangeTextColor(change));
            var min = paramId == 1 ? 0 : 1;
            this.drawText(Math.max(actor.param(paramId) + change, min), x, dy, width, 'right');//変化する値
        }else {
            this.changeTextColor(this.textColor(7));
            this.drawText('-', x, dy, width, 'right');

        }
    }
};

//アクター画像の表示。
//画像の規格を変更していると表示がおかしくなるので,その時はここを改変して下さい
Window_ShopStatus.prototype.drawActorIcon = function(x,y){
    actor = $gameParty.members();
    var max = Math.min(actor.length,this.pageSize());
    for(var i = this._pageIndex;i < max + this._pageIndex;i++){
        var bitmap = ImageManager.loadCharacter(actor[i].characterName());
        var pw = 48;
        var ph = 48;
        var sx = actor[i].characterIndex() % 4  * pw * 3  + pw;
        var sy = Math.floor(actor[i].characterIndex() / 4) * ph * 4;
        var ax = 48;//アクター画像の横幅
        var ay = 48;//アクター画像の縦幅
        var dx = (this.contents.width / max) * (i - this._pageIndex + 0.5) - 24;
        var dy = actor[i].canEquip(this._item) ? y - 16 : y;

        if(i == this._characterIndex){//選択中のキャラにだけ表示
            //四角いフィルター
            this.contents.paintOpacity = 60;
            this.contents.fillRect(dx, dy, ax, ax, 'white');
            this.contents.paintOpacity = 255;
            //左右のカーソル
            var arrow = ImageManager.loadSystem('Window');
            if(this._characterIndex > 0 )
                this.contents.blt(arrow,120,36,12,24,dx  - 12, dy + 12);//左カーソル
            if(this._characterIndex < $gameParty.members().length - 1)
                this.contents.blt(arrow,156,36,12,24,dx + ax, dy + 12);//右カーソル
        }

        this.contents.blt(bitmap, sx, sy, pw, ph, dx, dy);


        //同じ物を装備していたらEマークを表示させる
        this.contents.fontSize = 16;
        var item1 = this.currentEquippedItem(actor[i], this._item.etypeId);
        if(item1 && item1.id == this._item.id && item1.etypeId == this._item.etypeId){
            this.changeTextColor(this.systemColor());
            this.drawText('E', dx + ax - 6, dy + ay - 6, 16, 'left');
            
        //合計能力が上がる時はUP,下がる時はDOWNを表示させる
        }else if(actor[i].canEquip(this._item)){
            var change = 0;
            for(var j = 0; j < 8; j ++){
                var p2 = item1 ? item1.params[j] : 0;
                change += this._item.params[j] - p2;
            }
            this.changeTextColor(this.paramchangeTextColor(change));
            var upDownText = change >= 0 ? 'UP' : 'DOWN';
            this.drawText(upDownText, dx + ax - 12, dy + ay - 6, 60, 'left');
        }
        this.contents.fontSize = this.standardFontSize();
    }
};
//-----------------------------------------------------
//装備するかどうかの選択肢を表示させるウインドウ
function Window_ShopEquip() {
    this.initialize.apply(this, arguments);
}

Window_ShopEquip.prototype = Object.create(Window_Command.prototype);
Window_ShopEquip.prototype.constructor = Window_ShopEquip;

Window_ShopEquip.prototype.initialize = function(x,y,w,h) {
    this._windowWidth = w;
    this._windowHeight = h;
    Window_Command.prototype.initialize.call(this, x,y);
};

Window_ShopEquip.prototype.windowWidth = function() {
    return this._windowWidth;
};

Window_ShopEquip.prototype.maxCols = function() {
    return 1;
};

Window_ShopEquip.prototype.maxLows = function() {
    return 1;
};

Window_ShopEquip.prototype.playOkSound = function() {
};


Window_ShopEquip.prototype.makeCommandList = function() {
    this.addCommand(text2,    'equip');
    this.addCommand(text3,   'cancel');
};

//-----------------------------------------------------


var create = Scene_Shop.prototype.create;
Scene_Shop.prototype.create = function() {
    create.call(this);
    this.createECWindow();
};

Scene_Shop.prototype.createECWindow = function(){
    var y = this._buyWindow.y;
    var w = this._buyWindow.width;
    var h = this._buyWindow.height;
    this._ECWindow = new Window_ShopEquip(0,y,w,h);
    this._ECWindow.setHandler('equip',    this.commandEquip.bind(this));
    this._ECWindow.setHandler('cancel',   this.commandEquipCancel.bind(this));
    this._ECWindow.hide();
    this._ECWindow.deactivate();
    this.addWindow(this._ECWindow);
};

Scene_Shop.prototype.activateECWindow = function() {
    this._buyWindow.show();
    this._helpWindow.setText(text1);
    this._ECWindow.show();
    this._ECWindow.activate();
};



Scene_Shop.prototype.commandEquip = function(){
    var index = this._statusWindow._characterIndex;
    $gameParty.members()[index].changeEquip(this._item.etypeId - 1,this._item);
    this._ECWindow.hide();
    this._ECWindow.deactivate();
    this.activateBuyWindow();
    SoundManager.playEquip();
};

Scene_Shop.prototype.commandEquipCancel = function(){
    this._ECWindow.hide();
    this._ECWindow.deactivate();
    this.activateBuyWindow();
    SoundManager.playCancel();
};


//アイテムを売買した後の処理
Scene_Shop.prototype.onNumberOk = function() {
    SoundManager.playShop();
    switch (this._commandWindow.currentSymbol()) {
    case 'buy':
        this.doBuy(this._numberWindow.number());
        if($gameParty.members()[this._statusWindow._characterIndex].canEquip(this._item)){
            this._goldWindow.refresh();
            this._statusWindow.refresh();
            this._numberWindow.hide();
            this.activateECWindow();
            return;
        }

        break;
    case 'sell':
        this.doSell(this._numberWindow.number());
        break;
    }
    this.endNumberInput();
    this._goldWindow.refresh();
    this._statusWindow.refresh();
};


//購入リストに入る時
var activateBuyWindow = Scene_Shop.prototype.activateBuyWindow;
Scene_Shop.prototype.activateBuyWindow = function() {
    activateBuyWindow.call(this);
    this._statusWindow.activate();
};

//アイテムを選択した時
var onBuyOk = Scene_Shop.prototype.onBuyOk;
Scene_Shop.prototype.onBuyOk = function() {
    onBuyOk.call(this);
    this._statusWindow.deactivate();
};

var onSellOk = Scene_Shop.prototype.onSellOk;
Scene_Shop.prototype.onSellOk = function() {
    onSellOk.call(this);
    this._statusWindow.deactivate();
};


})();