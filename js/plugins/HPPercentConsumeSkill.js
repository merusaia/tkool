//=============================================================================
// HPPercentSkill.js
//=============================================================================

/*:
 * @plugindesc make the skill that consumes HP xx% of MaxHP, not only MP and/or TP
 * @author Sasuke KANNAZUKI, merusaia
 *
 * @help This plugin does not provide plugin commands.
 *
 * write following format at skill's note:
 *  <hp_cost:30>  # the skill consumes 30 HP.
 *
 *  The skill can use even if subject's HP is less than skill's HP Cost.
 *  In that case, let the subject's HP be 1.
 *  (i.e. subject won't die by the skill.)
 */

/*:ja
 * @plugindesc 最大HPの◯◯％を消費して使うHP割合消費技。スキルのメモ欄に「<hp_costPercent:30>」の形式で記述。
 * @author 神無月サスケ、メルサイア
 *
 * @param IsDeadOnLowHP
 * @desc 現在HPが消費HPより少ない場合（例えば、現在HP=1で、消費HP=100の時）、その技を使用したらHPが0になるかです。
 *       デフォルトはtrueです。
 *       falseの時は、HPは1になります（自爆技は作成できません）。
 * @default true
 * 

 * @help このプラグインには、プラグインコマンドはありません。
 *
 * ※神無月サスケさんのHP消費技プラグインを、メルサイアが「HP割合」消費技に改変しています。
 * ★LastUpdate: 2016/01/07
 * 
 * HPの一定割合を消費して使う技が作れないので、作ってみました。
 * つまり、このプラグインで、ドラ◯エの「メガンテ」「メガザル」自らの身を犠牲にする技が作れます。
 *
 * 主な仕様：
 * 
 * スキルのメモ欄に「<hp_costPercent:30>」といった書式で書いてください。
 * この場合、HPを30％消費します。
 * 
 * 入力時や術使用時のHPが、消費HPより低い場合には、実行可能ですが、即死にます。
 * （この技を使ったとたん、戦闘不能になる）。
 * ただし、HPが1でも使えてしまうので、ゲームバランスには十分気をつけてください。
 * ※HP消費技プラグインで多い認識は「HPは1になる」なので、他のプラグインの仕様と混同しないよう、注意してください。
 *
 * その他注意事項：
 * - HPの消費は、技を使う前になされます。
 * - HPと同時に、MPやTPを消費する技も作成可能ですが、
 *   ウィンドウでは消費HPのみが表示されます。
 * - このプラグインを、HPを固定値消費するスキルを実装しているプラグインと一緒に使うと、競合するかもしれません。注意してください（要確認）。
 */

(function() {

  // --------------------
  // Process Data in item.note
  // *for efficiency, note is processed at first.
  // --------------------

  var _Scene_Boot_start = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function() {
    _Scene_Boot_start.call(this);
    DataManager.processHpCost();
  };

  // スキルHP消費コストの計算式を上書きしています。
  DataManager.processHpCost = function() {
    for (var i = 1; i < $dataSkills.length; i++) {
      var skill = $dataSkills[i];
      var result = (int)((double)(skill.meta.hp_costPercent) * (double)(this.mhp/100.0)); //  ここに「 * this._mhp/100.0」があると、HPを最大HP割合で消費する
      if (result){
        skill.hpCost = Number(result);
      } else {
        skill.hpCost = 0;
      }
    }
  };

  // --------------------
  // exec consume HP cost
  // --------------------

  // スキルHP割合消費コストを取得する命令を作っています。
  Game_BattlerBase.prototype.skillHpCostPercent = function(skill) {
    return skill.hpCostPercent;
  };

  // 実際に、HP割合を消費する命令を上書きしています。
  var _Game_BattlerBase_paySkillCost =
    Game_BattlerBase.prototype.paySkillCost;
  Game_BattlerBase.prototype.paySkillCost = function(skill) {
    _Game_BattlerBase_paySkillCost.call(this, skill);
    
    // プラグイン中の変数を宣言
    var IsDeadOnLowHP = Boolean(parameters['IsDeadOnLowHP'] || true);
    
    // 現在HPより、消費HP割合が多いか、判定
    if (this._hp > (int)((double)(this.skillHpCostPercent(skill)) * (double)(this.mhp/100.0)) ) { //  ここに「 * this.mhp/100.0」があると、HPを最大HP割合で消費する
      // (i)現在HPが消費HPより多い（死なない）
      this._hp -=  (int)((double)(this.skillHpCostPercent(skill)) * (double)(this.mhp/100.0));    //  ここに「 * this.mhp/100.0」があると、HPを最大HP割合で消費する
    } else {
      // (ii)現在HPが消費HPより多い（使ったら速攻、死ぬ。・・つまり、その後、攻撃はできなくなったりしない？かはテストプレイ済み）
      if(IsDeadOnLowHP == true){
        this._hp = 0; // (ii-1)消費HPが現在HPより多い場合でも、使用可能とする。その場合HPは０（戦闘不能）になる。
      }else{
        this._hp = 1; // (ii-2)消費HPが現在HPより多い場合でも、使用可能とする。その場合HPは１（死なない）になる。        
      }
    }
  };

  // --------------------
  // draw HP cost // スキル選択画面の、HP消費技の描画方法
  // --------------------

  var _Window_SkillList_drawSkillCost = 
   Window_SkillList.prototype.drawSkillCost;
  Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
    if (this._actor.skillHpCostPercent(skill) > 0) {
      this.changeTextColor(this.textColor(17));
      this.drawText((int)((double)(this._actor.skillHpCostPercent(skill)) * (double)(this._actor.mhp/100.0)), x, y, width, 'right'); //  ここに「 * this._actor.mhp/100.0」があると、消費HPを最大HP割合で描画する
      return;
    }
    _Window_SkillList_drawSkillCost.call(this, skill, x, y, width);
  };

})();
