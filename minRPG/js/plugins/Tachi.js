//=============================================================================
// Tachi.js
//=============================================================================

/*:
 * @plugindesc foooooo
 * @author tachi
 *
 * @help �C������I( �E�L��E�M)
 *  �c�i�������T�C�A�ǋL�j�F����͈͓��ŁA�R�����g��ǉ����Ă��܂��B�B�ł��A�C�����Ă��������d�������|���ł��d�B
 */

(function() {





// �A�C�e�����̕\���𒲐��i�f�t�H���g�̂Q�����R���ɕ\����ύX���Ă���B��ɂ���Ă���A�����A�C�e���ő及������99��999�ɂ��邽�߁B�j
Window_ItemList.prototype.numberWidth = function() {
    return this.textWidth('0000');
};

Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
    if (this.needsNumber()) {
        this.drawText(':', x, y, width - this.textWidth('000'), 'right');
        this.drawText($gameParty.numItems(item), x, y, width, 'right');
    }
};


// �ʒu�����i�Q�[���J�n���̃^�C�g���摜���悭������悤�ɁA�^�C�g���E�B���h�E�̕��𒲐����Ă���B�j
Window_TitleCommand.prototype.windowWidth = function() {
    return 190;
};

Window_TitleCommand.prototype.updatePlacement = function() {
    this.x = (Graphics.boxWidth - this.width) / 2;
    this.y = Graphics.boxHeight - this.height - 96 + 50;
};

// ���E�l�iHP��MP�̌��E�l���AHP�̃f�t�H���g9999��999999�AMP�̃f�t�H���g999��9999�A�ɕύX���Ă���B�C�����Ă��������B�U���́^����͂�ύX���Ă��Ȃ��̂Ȃ�A���̃Q�[���o�����X���ނ��Ⴍ����ɂȂ�\�������ėL��܂��d�j
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
// �Q�[���X�s�[�h�����@this.updateMain()��������Ă���s���������A���{�ɂ�����������܂��B�f�t�H���g�͂Q�{�H�������ł͂T�{�B�{�^���������ō������������Ȃ���΁A�S�ăR�����g�A�E�g���邱�Ƃ����Ăł��܂��B
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
           this._waitCount -= 20; // �����͔{���ɂ���Ē�������Ă���̂��ǂ����́A�s���B
        }
        else { this._waitCount -= 2; }  // �����͒�������Ă���̂��ǂ����́A�s���B
        
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

// �I�v�V�����@�R�}���h�B���i�ݒ�̒��́A�R�}���h�L�����B���Ă���d�ǂ����Ă����Ȃ����I�̂��͕s���B���Ԃ�ATP����Ȃ����ɕςȋ����ɂȂ�̂����������̂��ȁd�j
Window_Options.prototype.addGeneralOptions = function() {
    this.addCommand(TextManager.alwaysDash, 'alwaysDash');
    //this.addCommand(TextManager.commandRemember, 'commandRemember');
};

// �z���Z�ɂ��_���[�W�G�t�F�N�g������
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

// �N���e�B�J���_���[�W�������i�Q�{�ɂȂ��Ă��邪�A�R�����g�A�E�g���Ă���̂ŁA�f�t�H���g�͂R�{�j
//Game_Action.prototype.applyCritical = function(damage) {
//    return damage * 2;
//};


// �g���莞�ɉ���炷�i�f�t�H���g���ǂ��Ȃ��Ă����̂��͕s���B����炵�Ă��邾���B�j
Game_Battler.prototype.performSubstitute = function(target) {
    SoundManager.playReflection();
};

// TP����i�o�g���J�n���̏����l��100�ɂ��Ă���j
Game_Battler.prototype.initTp = function() {
    this.setTp(100);
};

//�@�H�H�i�}�b�v���̓G�G���J�E���g�G�t�F�N�g�𖳂��ɂ��āA�G���J�E���g�X�s�[�h���グ�Ă���H�j
Scene_Map.prototype.startEncounterEffect = function() {
    //this._spriteset.hideCharacters();
    this._encounterEffectDuration = this.encounterEffectSpeed();
};

// �A�C�e���������i�f�t�H���g��99��999�ɂ��Ă���j
Game_Party.prototype.maxItems = function(item) {
    return 999;
};

// �Q�[���I�[�o�[����i�Q�[���I�[�o�[�ɂȂ������A�f�t�H���g�̃Q�[���I�[�o�[�ɑJ�ڂ������A�퓬�s�\�ɂȂ����o�g�������o�[��S�����������ăV�i���I���p�������Ă���B��������switch2�Ԃ��I���B�Ȃ��A�o�g���e�X�g�Ȃ炻���ŏI���i���Ԃ�f�t�H���g�ݒ�j�j
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

// �G���J�E���g�������ǂ����B�G���J�E���g����ƁA�����I�ɃX�C�b�`3�Ԃ��I�������悤�ɕύX����Ă���B
Game_Player.prototype.executeEncounter = function() {
    if (!$gameMap.isEventRunning() && this._encounterCount <= 0) {
        this.makeEncounterCount();
        var troopId = this.makeEncounterTroopId();
        if ($dataTroops[troopId]) {
	    $gameSwitches.setValue(3, true);  // �ύX�ӏ��B�X�C�b�`3�Ԃ��I��
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

// HP�֌W�Ȃ��g����i�f�t�H���g���ǂ��Ȃ��Ă����̂��͕s���j
BattleManager.checkSubstitute = function(target) {
    return !this._action.isCertainHit();
};

// �o�g���R�}���h�B���i�R�����g�A�E�g���ꂽ�R�}���h�́A��\���ɂȂ�B�Ⴆ�΁A�����ł́u�h��v�R�}���h����\���ɂ���Ă���j
Window_ActorCommand.prototype.makeCommandList = function() {
    if (this._actor) {
        this.addAttackCommand();
        this.addSkillCommands();
        //this.addGuardCommand();
        this.addItemCommand();
    }
};

// �^�C�g���R�}���h�B���i�ǉ�����Ă��Ȃ��R�}���h�́A��\���ɂȂ�B�����ł́A�S�Ă��\������Ă���B�Ⴆ�΁A�u�ݒ�v������������΁A�O�s�ڂ��R�����g�A�E�g����Ηǂ��j
Window_TitleCommand.prototype.makeCommandList = function() {
    this.addCommand(TextManager.newGame,   'newGame');
    this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
    this.addCommand(TextManager.options,   'options');
};

// ���j���[�R�}���h�B���i�ǉ�����Ă��Ȃ��R�}���h�́A��\���ɂȂ�B�Ⴆ�΁A�����ł́u�Z�[�u�v�u�ݒ�v�u�X�e�[�^�X�v�Ȃǂ���\���ɂ���Ă���H�j
Window_MenuCommand.prototype.makeCommandList = function() {
    this.addMainCommands();
    this.addFormationCommand();
    this.addOriginalCommands();
};

})();
