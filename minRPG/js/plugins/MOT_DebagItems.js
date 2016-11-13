//=============================================================================
// DebagItems.js
//=============================================================================
 
/*:
 * @plugindesc アイテム全取得コマンド
 * 使用法はプラグインのヘルプを参照してください。 
 * @author 翠
 * @help プラグインコマンドから実行してください
 * 
 * ■プラグインコマンド
 * Debag all     gain / lose
 * Debag item    gain / lose
 * Debag weapon  gain / lose
 * Debag armor   gain / lose
 *  
 * 例:
 *  Debag all gain 
 *  全てのアイテムを設定分増加する
 *  
 * ■分類などの除外用に
 * データベースのメモ欄に
 * <d_exce>と記述すればその項目は
 * コマンドの増減対象から外れます
 *  
 * @param 増加減少数
 * @desc アイテムの増減数
 * @default 99
*/
 
(function(){
	var parameters = PluginManager.parameters('DebagItems');
	var item_num   = Number(parameters['増加減少数']);
	var Debag_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		Debag_Interpreter_pluginCommand.call(this, command, args);
			if (command === 'Debag') {
				switch (args[0]) {
				case 'all':
				var ibox = [$dataItems,$dataWeapons,$dataArmors]    
				for (i = 0; i < 3; i++) {
					ibox[i].forEach(function(item) {
						if (item && item.name.length > 0 && !item.meta.d_exce) {
							if (args[1] == 'gain'){$gameParty.gainItem(item,item_num)};
							if (args[1] == 'lose'){$gameParty.loseItem(item,item_num)};
						};
					}, this);
				};
				break;
			case 'item':
				$dataItems.forEach(function(item) {
					if (item && item.name.length > 0 && !item.meta.d_exce) {
					console.log(item.name);
						if (args[1] == 'gain'){$gameParty.gainItem(item,item_num)};
						if (args[1] == 'lose'){$gameParty.loseItem(item,item_num)};
					};
				}, this);
				break;
			case 'weapon':
				$dataWeapons.forEach(function(item) {
					if (item && item.name.length > 0 && !item.meta.d_exce) {
						if (args[1] == 'gain'){$gameParty.gainItem(item,item_num)};
						if (args[1] == 'lose'){$gameParty.loseItem(item,item_num)};
					};
				}, this);
				break;
			case 'armor':
				$dataArmors.forEach(function(item) {
					if (item && item.name.length > 0 && !item.meta.d_exce) {
						if (args[1] == 'gain'){$gameParty.gainItem(item,item_num)};
						if (args[1] == 'lose'){$gameParty.loseItem(item,item_num)};
					};
				}, this);
				break;
			};
		};
	};
})();