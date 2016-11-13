//=============================================================================
// Tachi.js
//=============================================================================

/*:
 * @plugindesc foooooo
 * @author tachi
 *
 * @help 気をつけろ！( ・´ｰ・｀)
 *  …（※メルサイア追記）：判る範囲内で、コメントを追加しています。。でも、気をつけてください‥競合が怖いです‥。
 */

(function() {





// アイテム数の表示を調整（デフォルトの２桁→３桁に表示を変更している。後にやっている、同じアイテム最大所持数を99→999にするため。）
Window_ItemList.prototype.numberWidth = function() {
    return this.textWidth('0000');
};

Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
    if (this.needsNumber()) {
        this.drawText(':', x, y, width - this.textWidth('000'), 'right');
        this.drawText($gameParty.numItems(item), x, y, width, 'right');
    }
};


// 位置調整（ゲーム開始時のタイトル画像がよく見えるように、タイトルウィンドウの幅を調整している。）
Window_TitleCommand.prototype.windowWidth = function() {
    return 190;
};

Window_TitleCommand.prototype.updatePlacement = function() {
    this.x = (Graphics.boxWidth - this.width) / 2;
    this.y = Graphics.boxHeight - this.height - 96 + 50;
};

// 限界値（HPやMPの限界値を、HPのデフォルト9999→999999、MPのデフォルト999→9999、に変更している。気をつけてください。攻撃力／守備力を変更していないのなら、他のゲームバランスがむちゃくちゃになる可能性だって有ります‥）
Game_BattlerBase.prototype.paramMax = function(paramId) {
    if (paramId === 0) {
        return 999999;  // MHP
    } else if (paramId === 1) {
        return 9999;    // MMP
    } else {
        return 9999;
    }
};

// =============================================================================
// ゲームスピード調整　this.updateMain()が書かれてある行数分だけ、何倍にも高速化されます。デフォルトは２倍？→ここでは５倍。ボタン長押しで高速化したくなければ、全てコメントアウトすることだってできます。
// =============================================================================
Scene_Map.prototype.updateMainMultiply = function() {
    this.updateMain();
    if (this.isFastForward()) {
        this.updateMain();
        this.updateMain();
        this.updateMain();
        this.updateMain();
    }
};
Window_BattleLog.prototype.updateWaitCount = function() {
    if (this._waitCount > 0) {
        if (Input.isPressed('shift') || this.isFastForward())
        {
           this._waitCount -= 20; // ここは倍率によって調整されているのかどうかは、不明。
        }
        else { this._waitCount -= 2; }  // ここは調整されているのかどうかは、不明。
        
        if (this._waitCount < 0) {
            this._waitCount = 0;
        }
        return true;
    }
    return false;
};

Scene_Map.prototype.encounterEffectSpeed = function() {
    return 20;
};
Scene_Map.prototype.updateEncounterEffect = function() {
    if (this._encounterEffectDuration > 0) {
        this._encounterEffectDuration--;
        var speed = this.encounterEffectSpeed();
        var n = speed - this._encounterEffectDuration;
        var p = n / speed;
        var q = ((p - 1) * 20 * p + 5) * p + 1;
        var zoomX = $gamePlayer.screenX();
        var zoomY = $gamePlayer.screenY() - 24;
        if (n === 2) {
            //$gameScreen.setZoom(zoomX, zoomY, 1);
            this.snapForBattleBackground();
            this.startFlashForEncounter(speed / 2);
        }
        //$gameScreen.setZoom(zoomX, zoomY, q);
        if (n === Math.floor(speed / 6)) {
            this.startFlashForEncounter(speed / 2);
        }
        if (n === Math.floor(speed / 2)) {
            BattleManager.playBattleBgm();
            this.startFadeOut(10)// this.fadeSpeed());
        }
    }
};

Sprite_Animation.prototype.update = function() {
    Sprite.prototype.update.call(this);
    
    this.updateMain();
    if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){ this.updateMain(); this.updateMain(); this.updateMain(); }
    
    this.updateFlash();
    this.updateScreenFlash();
    this.updateHiding();
    Sprite_Animation._checker1 = {};
    Sprite_Animation._checker2 = {};
};
Sprite_Enemy.prototype.update = function() {
    Sprite_Battler.prototype.update.call(this);
    if (this._enemy) {
        
        this.updateEffect();
        if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){this.updateEffect(); this.updateEffect();}
        
        this.updateStateSprite();
    }
};
Sprite_Weapon.prototype.animationWait = function() {
    if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){return 3;}else{return 12;}
};
Sprite_Actor.prototype.motionSpeed = function() {
    if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){return 3;}else{return 12;}
};
Sprite_Actor.prototype.updateMove = function() {
    var bitmap = this._mainSprite.bitmap;
    if (!bitmap || bitmap.isReady()) {
        Sprite_Battler.prototype.updateMove.call(this); Sprite_Battler.prototype.updateMove.call(this);
        if(Input.isPressed('ok') || Input.isPressed('shift') || TouchInput.isPressed()){Sprite_Battler.prototype.updateMove.call(this); Sprite_Battler.prototype.updateMove.call(this);}
    }
};
Scene_Map.prototype.isFastForward = function() {
    return ($gameMap.isEventRunning() && !SceneManager.isSceneChanging() &&
            (Input.isLongPressed('ok') || Input.isLongPressed('shift') || TouchInput.isLongPressed()));
};
// =============================================================================

// オプション　コマンド隠し（設定の中の、コマンド記憶を隠している‥どうしてこうなった！のかは不明。たぶん、TP足りない時に変な挙動になるのが嫌だったのかな‥）
Window_Options.prototype.addGeneralOptions = function() {
    this.addCommand(TextManager.alwaysDash, 'alwaysDash');
    //this.addCommand(TextManager.commandRemember, 'commandRemember');
};

// 吸収技にもダメージエフェクトをつける
Game_Action.prototype.apply = function(target) {
    var result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = this.testApply(target);
    result.missed = (result.used && Math.random() >= this.itemHit(target));
    result.evaded = (!result.missed && Math.random() < this.itemEva(target));
    result.physical = this.isPhysical();
    //result.drain = this.isDrain();
    if (result.isHit()) {
        if (this.item().damage.type > 0) {
            result.critical = (Math.random() < this.itemCri(target));
            var value = this.makeDamageValue(target, result.critical);
            this.executeDamage(target, value);
        }
        this.item().effects.forEach(function(effect) {
            this.applyItemEffect(target, effect);
        }, this);
        this.applyItemUserEffect(target);
    }
};

// クリティカルダメージ率調整（２倍になっているが、コメントアウトしてあるので、デフォルトは３倍）
//Game_Action.prototype.applyCritical = function(damage) {
//    return damage * 2;
//};


// 身代わり時に音を鳴らす（デフォルトがどうなっていたのかは不明。音を鳴らしているだけ。）
Game_Battler.prototype.performSubstitute = function(target) {
    SoundManager.playReflection();
};

// TP制御（バトル開始時の初期値を100にしている）
Game_Battler.prototype.initTp = function() {
    this.setTp(100);
};

//　？？（マップ時の敵エンカウントエフェクトを無しにして、エンカウントスピードを上げている？）
Scene_Map.prototype.startEncounterEffect = function() {
    //this._spriteset.hideCharacters();
    this._encounterEffectDuration = this.encounterEffectSpeed();
};

// アイテム所持数（デフォルトの99→999にしている）
Game_Party.prototype.maxItems = function(item) {
    return 999;
};

// ゲームオーバー制御（ゲームオーバーになった時、デフォルトのゲームオーバーに遷移させず、戦闘不能になったバトルメンバーを全員復活させてシナリオを継続させている。勝ったらswitch2番をオン。なお、バトルテストならそこで終了（たぶんデフォルト設定））
BattleManager.updateBattleEnd = function() {
    if (this.isBattleTest()) {
        AudioManager.stopBgm();
        SceneManager.exit();
    } else if ($gameParty.isAllDead()) {
        if (this._canLose) {
            $gameParty.reviveBattleMembers();
            SceneManager.pop();
        } else {
            //SceneManager.goto(Scene_Gameover);
	    $gameSwitches.setValue(2, true); 
            $gameParty.reviveBattleMembers();
            SceneManager.pop();
        }
    } else {
        SceneManager.pop();
    }
    this._phase = null;
};

// エンカウントしたかどうか。エンカウントすると、自動的にスイッチ3番がオンされるように変更されている。
Game_Player.prototype.executeEncounter = function() {
    if (!$gameMap.isEventRunning() && this._encounterCount <= 0) {
        this.makeEncounterCount();
        var troopId = this.makeEncounterTroopId();
        if ($dataTroops[troopId]) {
	    $gameSwitches.setValue(3, true);  // 変更箇所。スイッチ3番をオン
            BattleManager.setup(troopId, true, false);
            BattleManager.onEncounter();
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

// HP関係なく身代わり（デフォルトがどうなっていたのかは不明）
BattleManager.checkSubstitute = function(target) {
    return !this._action.isCertainHit();
};

// バトルコマンド隠し（コメントアウトされたコマンドは、非表示になる。例えば、ここでは「防御」コマンドが非表示にされている）
Window_ActorCommand.prototype.makeCommandList = function() {
    if (this._actor) {
        this.addAttackCommand();
        this.addSkillCommands();
        //this.addGuardCommand();
        this.addItemCommand();
    }
};

// タイトルコマンド隠し（追加されていないコマンドは、非表示になる。ここでは、全てが表示されている。例えば、「設定」を消したければ、三行目をコメントアウトすれば良い）
Window_TitleCommand.prototype.makeCommandList = function() {
    this.addCommand(TextManager.newGame,   'newGame');
    this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
    this.addCommand(TextManager.options,   'options');
};

// メニューコマンド隠し（追加されていないコマンドは、非表示になる。例えば、ここでは「セーブ」「設定」「ステータス」などが非表示にされている？）
Window_MenuCommand.prototype.makeCommandList = function() {
    this.addMainCommands();
    this.addFormationCommand();
    this.addOriginalCommands();
};

})();
