//=============================================================================
// FixisLearn.js
//=============================================================================

/*:ja
 * @plugindesc ver1.10 本体ver1.3.2のスキル習得バグ修正
 * @author まっつＵＰ
 * 
 * @help
 * 
 * RPGで笑顔を・・・
 * 
 * このヘルプとパラメータの説明をよくお読みになってからお使いください。
 *  
 * パラメータとプラグインコマンドともにありません。
 * 
 * ver1.10 特徴により習得したスキルも参照できるようになりました。
 * 
 * 免責事項：
 * このプラグインを利用したことによるいかなる損害も制作者は一切の責任を負いません。
 * 
 */

(function() {
    
    //var parameters = PluginManager.parameters('FixisLearn');
    
    /*ver1.3.1の記述Game_Actor.prototype.isLearnedSkill = function(skillId) {
    return this._skills.contains(skillId);
    };*/

    /*ver1.3.2の記述Game_Actor.prototype.isLearnedSkill = function(skillId) {
    return this._skills.contains(skillId) || this.addedSkills().contains(skillId);
    };*/

    Game_Actor.prototype.learnSkill = function(skillId) {
    if (!this._skills.contains(skillId)) { //元々はisLearnedSkillを参照している。
     this._skills.push(skillId);
     this._skills.sort(function(a, b) {
      return a - b;
     });
    }
    };
      
})();
