(function(){
    'use strict';
    var Graphics = PIXI.Graphics;
    var RenderTexture = PIXI.RenderTexture;
    var Sprite = PIXI.Sprite;

    Graphics.prototype._renderSpriteRect = function (renderer)
    {
        var rect = this.graphicsData[0].shape;
        if(!this._spriteRect)
        {
            if(!Graphics._SPRITE_TEXTURE)
            {
                Graphics._SPRITE_TEXTURE = RenderTexture.create(10, 10);

                var currentRenderTarget = renderer._activeRenderTarget;
                renderer.bindRenderTexture(Graphics._SPRITE_TEXTURE);
                renderer.clear([1,1,1,1]);
                renderer.bindRenderTarget(currentRenderTarget);
            }

            this._spriteRect = new Sprite(Graphics._SPRITE_TEXTURE);
        }
        this._spriteRect.tint = this.graphicsData[0].fillColor;
        this._spriteRect.alpha = this.graphicsData[0].fillAlpha;

        this._spriteRect.worldAlpha = this.worldAlpha * this._spriteRect.alpha;

        Graphics._SPRITE_TEXTURE._frame.width = rect.width;
        Graphics._SPRITE_TEXTURE._frame.height = rect.height;

        this._spriteRect.transform.worldTransform = this.transform.worldTransform;

        this._spriteRect.anchor.set(-rect.x / rect.width, -rect.y / rect.height);
        this._spriteRect.onAnchorUpdate();

        this._spriteRect._renderWebGL(renderer);
    };
})();