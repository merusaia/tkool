//=============================================================================
// Yanfly Engine Plugins - Base Troop Events
// YEP_BaseTroopEvents_reverse.js
//=============================================================================

var Imported = Imported || {};
Imported.YEP_BaseTroopEvents = true;

var Yanfly = Yanfly || {};
Yanfly.BTE = Yanfly.BTE || {};

//=============================================================================
/*:
 * @plugindesc v1.00 Enabling this plugin will cause all troops to have
 * events occur in every fight.
 * @author Yanfly Engine Plugins, merusaia
 *
 * @param Base Troop ID
 * @desc Change this value to the Troop ID you want all of the recurring
 * troop events to draw from.
 * 
 * A different from original YEP_BaseTroopEvents.js is base troop event is 
 * first than other events (merusaia edited).
 * 
 * @default 1
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * For all the eventers out there who love to customize their battles through
 * custom event pages, you can now save yourself some time by drawing all the
 * event pages from a base troop event to occur in every fight. All of the
 * events will be present in every single battle.
 */

/*:ja
 * @plugindesc 全ての敵グループに対して、
 * 毎回戦闘で発生するイベントを設定します。※BaseID→個別IDの順
 * 
 * @author Yanfly Engine Plugins, 著作表示不要:merusaia
 *
 * @param Base Troop ID
 * @desc 全イベントの参照元となる、敵グループのIDを指定してください。他のIDのグループイベントより先に実行されます。
 * @default 1
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * イベントページから、戦闘をカスタマイズしたい開発者向けのプラグインです。
 * ベースとなる敵グループへの登録で、全ての戦闘でそのイベントが実行されます。
 * 一括で反映ができるので、開発時間を短縮することが出来ます。
 * 
 * ↓　以下、merusaiaが編集しました。
 * オリジナルのEP_BaseTroopEvents.jsとの違いは、ベースとなる敵グループイベントが
 * 個別のものより、「先に実行される」点です。
 * 
 * 例えば、ベースとなる敵グループイベント(Base Troop ID)が1にした場合、
 * 共通のイベント1と、個別のイベント2で、条件を同じにした時の実行順が、
 * (i)オリジナルの場合:        2→1
 * となりますが、
 * (ii)このプラグインの場合:   1→2
 * となります。
 * 
 * 「0ターン開始時」や「ターン終了時」で、
 * ベースとなる敵グループイベントを実行してから、個別のイベントが実行されるようにしたい
 * 場合、このプラグインを使うと、想定した動作をするようになります。
 */



//=============================================================================

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('YEP_BaseTroopEvents_reverse');
Yanfly.Param = Yanfly.Param || {};

Yanfly.Param.BaseTroopID = Number(Yanfly.Parameters['Base Troop ID']);

//=============================================================================
// DataManager
//=============================================================================

Yanfly.BTE.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!Yanfly.BTE.DataManager_isDatabaseLoaded.call(this)) return false;
		this.processBTEPages();
		return true;
};

DataManager.processBTEPages = function() {
	for (var n = 1; n < $dataTroops.length; n++) {
		var base_troop = $dataTroops[Yanfly.Param.BaseTroopID];
		var troop = $dataTroops[n];
		if (n !== Yanfly.Param.BaseTroopID && Yanfly.Param.BaseTroopID > 0) {
			if (troop._baseTroopEventsMade) continue;
			
			// (i)オリジナルの場合、以下の一行
			// Yanfly.Util.extend(troop.pages, base_troop.pages);
			// (ii)このプラグインの場合、以下の一行
			Array.prototype.unshift.apply(troop.pages, base_troop.pages);

			troop._baseTroopEventsMade = true;
		}
	}
};



//=============================================================================
// New Function
//=============================================================================

Yanfly.Util = Yanfly.Util || {};

Yanfly.Util.extend = function (mainArray, otherArray) {
    otherArray.forEach(function(i) {
      mainArray.push(i)
    }, this);
}

//=============================================================================
// End of File
//=============================================================================
