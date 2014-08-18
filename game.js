/*
----------------------------------------------------------------------------

    P1X, Krzysztof Jankowski
    TRIBES LIFE

    abstract: Game for the js13k compo
    created: 17-08-2014
    license: do what you want and dont bother me

    webpage: http://p1x.in
    twitter: @w84death

----------------------------------------------------------------------------
*/

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();


// ENTITIES

var Tribe = function(params){
    this.energy = params.energy;
    this.makeNewLife = params.makeNewLife;
    this.follow = params.follow;
    this.speed = params.speed;
    this.renderSpeed = 0.01;
    this.pos = {
        x: params.pos.x,
        y: params.pos.y
    };
    this.renderPos = {
        x: params.pos.x * game.spriteSize,
        y: params.pos.y * game.spriteSize
    }
};

Tribe.prototype.renderMove = function(dTime){
    var screenX = this.pos.x*game.spriteSize,
        screenY = this.pos.y*game.spriteSize;

    if(screenX !== this.renderPos.x || screenY !== this.renderPos.y){
        if(screenX < this.renderPos.x){
            this.renderPos.x -= dTime * this.renderSpeed;
        }
        if(screenX > this.renderPos.x){
            this.renderPos.x += dTime * this.renderSpeed;
        }
        if(screenY < this.renderPos.y){
            this.renderPos.y -= dTime * this.renderSpeed;
        }
        if(screenY > this.renderPos.y){
            this.renderPos.y += dTime * this.renderSpeed;
        }
    }
}

Tribe.prototype.AIMove = function(){

    var empty = [],
        bestRoute = 0,
        friends = 0;

    if(Math.random() < this.speed){

        for (var x = this.pos.x-1; x <= this.pos.x+1; x++) {
            for (var y = this.pos.y-1; y <= this.pos.y+1; y++) {
                if(game.world[x] && game.world[x][y] && game.world[x][y] > 0){
                    if(!game.isThereATribe({x:x,y:y})){
                        empty.push({x:x,y:y});
                    }else{
                        friends++;
                    }
                }
            }
        }

        if(empty.length>0){

            // to many tribes!
            if(friends >= 5){
                this.energy = ((this.energy*0.5)<<0)-1;
            }

            // good vibe for sex :>
            if(friends > 1 && empty.length>2 && this.energy >= 10 && (Math.random() < this.makeNewLife)){
                var random = (Math.random()*empty.length)<<0;
                game.spawnNewTribe({
                    x:empty[random].x,
                    y:empty[random].y
                });
            }

            // folow the god's way?
            if(game.flag && Math.random() < this.follow){


                if(game.flag.x < this.pos.x){
                    for (var i = 0; i < empty.length; i++) {
                        if(empty[i].x < empty[bestRoute].x){
                            bestRoute = i;
                        }
                    };
                }

                if(game.flag.x > this.pos.x){
                    for (var i = 0; i < empty.length; i++) {
                        if(empty[i].x > empty[bestRoute].x){
                            bestRoute = i;
                        }
                    };
                }

                if(game.flag.x === this.pos.x){
                   for (var i = 0; i < empty.length; i++) {
                        if(game.flag.y > this.pos.y && empty[i].y > this.pos.y){
                            bestRoute = i;
                        }
                        if(game.flag.y < this.pos.y && empty[i].y < this.pos.y){
                            bestRoute = i;
                        }
                    };
                }

                if(game.flag.y < this.pos.y){
                    for (var i = 0; i < empty.length; i++) {
                        if(empty[i].y < empty[bestRoute].y){
                            bestRoute = i;
                        }
                    };
                }
                if(game.flag.y > this.pos.y){
                    for (var i = 0; i < empty.length; i++) {
                        if(empty[i].y > empty[bestRoute].y){
                            bestRoute = i;
                        }
                    };
                }

                if(game.flag.y === this.pos.y){
                   for (var i = 0; i < empty.length; i++) {
                        if(empty[i].y === game.flag.y){
                            if(game.flag.x > this.pos.x && empty[i].x > this.pos.x){
                                bestRoute = i;
                            }
                            if(game.flag.x < this.pos.x && empty[i].x < this.pos.x){
                                bestRoute = i;
                            }
                        }
                    };
                }

                this.pos.x = empty[bestRoute].x;
                this.pos.y = empty[bestRoute].y;
            }else{
                // or move free
                var random = (Math.random()*empty.length)<<0;
                this.pos.x = empty[random].x;
                this.pos.y = empty[random].y;
            }
        }
    }
};

// GAME


var game = {
    STATE: 'intro',
    timer: 0,
    _W: null,
    _H: null,
    canvas: null,
    ctx: null,
    worldW: null,
    worldH: null,
    world: [],
    randomSpritesMask: [],
    screenScale: 6,
    spriteSize: 6,
    spritesVariants: 8,
    sprites: [],
    tribesOnStart: 3,
    tribeSprite: null,
    flagSprite: null,
    flag: false,
    fps: 0,
    renderScreen: true,
    lastMouse: {x:0,y:0},
    pointer: {x:0,y:0},
    tribes: [],

    init: function(){
        this._W = (window.innerWidth/this.spriteSize)<<0;
        this._H = (window.innerHeight/this.spriteSize)<<0;
        this.canvas = document.getElementById('canvas');
        this.canvas.width = this._W;
        this.canvas.height = this._H;
        this.ctx = this.canvas.getContext('2d');

        this.worldW = (this._W/this.spriteSize) <<0;
        this.worldH = (this._H/this.spriteSize) <<0;

        this.world = [this.worldW];
        for (var x = 0; x < this.worldW; x++){
            this.world[x] = [this.worldH];
        }

        for (var i = 0; i < this.worldW * this.worldH; i++) {
            this.randomSpritesMask.push((Math.random()*this.spritesVariants)<<0 );
        };

        this.generateSprites();
        this.generateWorld();

        window.setInterval(game.simulateLife,500);

        this.canvas.addEventListener('mousedown', enable_pointer, false);
        this.canvas.addEventListener('mouseup', disable_pointer, false);
        this.canvas.addEventListener('mousemove', track_pointer, false);

        this.canvas.addEventListener('touchstart', enable_pointer, false);
        this.canvas.addEventListener('touchend', disable_pointer, false);
        this.canvas.addEventListener('touchcancel', disable_pointer, false);
        this.canvas.addEventListener('touchmove', track_pointer, false);

        this.canvas.addEventListener("contextmenu", function(e){
            e.preventDefault();
        }, false);

        function enable_pointer(e){
            e.preventDefault();
            var x,y;
            if(e.touches){
                x = e.touches[0].pageX;
                y = e.touches[0].pageY;
            }else{
                x = e.pageX;
                y = e.pageY;
            }
            game.pointerDraw = true;
            game.putFlag(x, y);
        }
        function disable_pointer(){
            game.pointerDraw = false;
        }
        function track_pointer(e){
            e.preventDefault();
            var x,y;
            if(e.touches){
                x = e.touches[0].pageX;
                y = e.touches[0].pageY;
            }else{
                x = e.pageX;
                y = e.pageY;
            }
            game.pointer.x = x;
            game.pointer.y = y;
            if(game.pointerDraw){

                game.makeNewLand(x,y, event.which == 1 ? 1 : 0 );
            }
        }
    },

    generateSprites: function(){
        // water
        for (var i = 0; i < this.spritesVariants; i++) {
            this.sprites.push(this.offSprite({
                colorA: [49,162,242],
                colorB: [178,220,239]
            }));
        };

        // earth
        for (var i = 0; i < this.spritesVariants; i++) {
            this.sprites.push(this.offSprite({
                colorA: [164,100,34],
                colorB: [235,137,49]
            }));
        };

        // forest
        for (var i = 0; i < this.spritesVariants; i++) {
            this.sprites.push(this.offSprite({
                colorA: [68,137,26],
                colorB: [163,206,39]
            }));
        };

        // tribe
        this.tribeSprite = this.offTribeSprite({
            colorHead: [0,0,0],
            colorBody: [73,60,43],
            colorBG: [235,137,49]
        });

        // flag
        this.flagSprite = this.offFlagSprite({
            colorA: [190,38,51],
            colorB: [73,60,43],
            colorBG: [235,137,49]
        });
    },

    offSprite: function(params){
        var imageData = this.ctx.getImageData(0, 0, this.spriteSize, this.spriteSize),
            pixels = imageData.data,
            n = pixels.length,
            i = 0,
            colors = [params.colorA, params.colorB];

        while (i <= n) {
            var c =  Math.random()>0.3 ? 1 : 0;
            pixels[i++] = colors[c][0];
            pixels[i++] = colors[c][1];
            pixels[i++] = colors[c][2];
            pixels[i++] = 255;
        }

        return imageData;
    },

    offTribeSprite: function(params){
        var imageData = this.ctx.getImageData(0, 0, this.spriteSize, this.spriteSize),
            pixels = imageData.data,
            n = pixels.length,
            i = 0;

        while (i <= n) {
            if(i == 15*4){
                pixels[i++] = params.colorHead[0];
                pixels[i++] = params.colorHead[1];
                pixels[i++] = params.colorHead[2];
                pixels[i++] = 255;
            }else
            if(i==20*4 || i==21*4 || i==22*4 || i==27*4 || i ==32*4 || i==34*4){
                pixels[i++] = params.colorBody[0];
                pixels[i++] = params.colorBody[1];
                pixels[i++] = params.colorBody[2];
                pixels[i++] = 255;
            }else{
                pixels[i++] = params.colorBG[0];
                pixels[i++] = params.colorBG[1];
                pixels[i++] = params.colorBG[2];
                pixels[i++] = 255;
            }
        }

        return imageData;
    },


    offFlagSprite: function(params){
        var imageData = this.ctx.getImageData(0, 0, this.spriteSize, this.spriteSize),
            pixels = imageData.data,
            n = pixels.length,
            i = 0;

        while (i <= n) {
            if( (i > 7*4 && i < 12*4) || (i > 13*4 && i < 17*4) || (i > 19*4 && i < 24*4) ){
                pixels[i++] = params.colorA[0];
                pixels[i++] = params.colorA[1];
                pixels[i++] = params.colorA[2];
                pixels[i++] = 255;
            }else
            if(i==7*4 || i==13*4 || i==19*4 || i==25*4 || i ==31*4){
                pixels[i++] = params.colorB[0];
                pixels[i++] = params.colorB[1];
                pixels[i++] = params.colorB[2];
                pixels[i++] = 255;
            }else{
                pixels[i++] = params.colorBG[0];
                pixels[i++] = params.colorBG[1];
                pixels[i++] = params.colorBG[2];
                pixels[i++] = 255;
            }
        }

        return imageData;
    },

    generateWorld: function(){
        var deep = 4,
            islands = 0.02,
            ground = 0.2,
            forest = 0.05;


        for (var x = 0; x < this.worldW; x++) {
            for (var y = 0; y < this.worldH; y++) {
                if(Math.random()<= islands && x>4 && x < this.worldW - 4 && y > 4 && y < this.worldH - 4){
                    this.world[x][y] = 1;
                }else{
                    this.world[x][y] = 0;
                }
            }
        }

        for (var i = 0; i < deep; i++) {
            for (var x = 1; x < this.worldW-1; x++) {
                for (var y = 1; y < this.worldH-1; y++) {
                    if(this.world[x][y] == 1){
                        this.world[x-1][y] = Math.random()<ground ? 1 : this.world[x-1][y];
                        this.world[x+1][y] = Math.random()<ground ? 1 : this.world[x+1][y];
                        this.world[x][y-1] = Math.random()<ground ? 1 : this.world[x][y-1];
                        this.world[x][y+1] = Math.random()<ground ? 1 : this.world[x][y+1];

                        this.world[x-1][y-1] = Math.random()<ground ? 1 : this.world[x-1][y-1];
                        this.world[x+1][y-1] = Math.random()<ground ? 1 : this.world[x+1][y-1];
                        this.world[x-1][y+1] = Math.random()<ground ? 1 : this.world[x-1][y+1];
                        this.world[x+1][y+1] = Math.random()<ground ? 1 : this.world[x+1][y+1];
                    }
                }
            }
        };

        this.initNewLife(2, forest);
        this.grownTrees(ground*2);

        this.initTribes();
    },

    initTribes: function(){
        var empty = [],
            random;

        for (var x = 1; x < this.worldW-1; x++) {
            for (var y = 1; y < this.worldH-1; y++) {
                if(this.world[x][y] + this.world[x-1][y] + this.world[x+1][y] + this.world[x][y-1] + this.world[x][y+1] == 5){
                        empty.push({x:x, y:y});
                }
            }
        }

        for (var i = 0; i < this.tribesOnStart; i++) {
            if(empty.length > 0){
                random = (Math.random()*empty.length)<<0;
                this.spawnNewTribe({
                    x: empty[random].x,
                    y: empty[random].y
                });
                empty = empty.splice(random,1);
            }
        };
    },

    spawnNewTribe: function(params){
        this.tribes.push(new Tribe({
            energy: 50,
            makeNewLife: 0.05,
            follow: (7+(Math.random()*3)<<0) * 0.1,
            speed: (5+(Math.random()*5)<<0) * 0.1,
            pos: {
                x: params.x,
                y: params.y
            }
        }));
    },

    isThereATribe: function(params){
        for (var i = 0; i < this.tribes.length; i++) {
            if(this.tribes[i] && this.tribes[i].pos.x === params.x && this.tribes[i].pos.y === params.y){
                return true;
            }
        };
        return false;
    },

    initNewLife: function(type, pobability){
        for (var x = 1; x < this.worldW-1; x++) {
            for (var y = 1; y < this.worldH-1; y++) {
                if(this.world[x][y] + this.world[x-1][y] + this.world[x+1][y] + this.world[x][y-1] + this.world[x][y+1] == 5 && Math.random()<pobability){
                        this.world[x][y] = type;
                }
            }
        }
    },

    grownTrees: function(ground){
        for (var x = 1; x < this.worldW-1; x++) {
            for (var y = 1; y < this.worldH-1; y++) {
                if(this.world[x][y] == 2){
                    if(this.world[x-1][y] == 1) this.world[x-1][y] = Math.random()<ground ? 2 : this.world[x-1][y];
                    if(this.world[x+1][y] == 1) this.world[x+1][y] = Math.random()<ground ? 2 : this.world[x+1][y];
                    if(this.world[x][y-1] == 1) this.world[x][y-1] = Math.random()<ground ? 2 : this.world[x][y-1];
                    if(this.world[x][y+1] == 1) this.world[x][y+1] = Math.random()<ground ? 2 : this.world[x][y+1];

                    if(this.world[x-1][y-1] == 1) this.world[x-1][y-1] = Math.random()<ground ? 2 : this.world[x-1][y-1];
                    if(this.world[x+1][y-1] == 1) this.world[x+1][y-1] = Math.random()<ground ? 2 : this.world[x+1][y-1];
                    if(this.world[x-1][y+1] == 1) this.world[x-1][y+1] = Math.random()<ground ? 2 : this.world[x-1][y+1];
                    if(this.world[x+1][y+1] == 1) this.world[x+1][y+1] = Math.random()<ground ? 2 : this.world[x+1][y+1];
                }
            }
        }
    },

    makeNewLand: function(x,y, type){
        var x = (x / game.screenScale / game.spriteSize) << 0,
            y = (y / game.screenScale / game.spriteSize) << 0;

        if(game.world[x] && game.world[x][y] === (type == 1 ? 0 : 1)) {
            if(game.lastMouse.x !== x || game.lastMouse.y !== y){
                game.world[x][y] = type;
                game.lastMouse.x = x;
                game.lastMouse.y = y;
            }
        }
    },

    putFlag: function(x,y){
        var x = (x / game.screenScale / game.spriteSize) << 0,
            y = (y / game.screenScale / game.spriteSize) << 0;

        if(game.flag && game.flag.x === x && game.flag.y === y){
            game.flag = false;
        }else
        if(game.world[x] && game.world[x][y] > 0) {
            game.flag = {
                x:x,
                y:y
            };
        }
    },

    simulateLife: function(){
        game.timer++;

        if(game.STATE == 'game'){
            game.grownTrees(0.005);
            game.initNewLife(2, 0.001);
            var terrain;
            for (var i = 0; i < game.tribes.length; i++) {
                if(game.tribes[i]){
                    terrain = game.world[game.tribes[i].pos.x][game.tribes[i].pos.y];
                    if( terrain === 1){
                       game.tribes[i].energy--;
                    }
                    if( terrain === 2 && game.tribes[i].energy < 50){
                       game.tribes[i].energy += 20;
                       game.world[game.tribes[i].pos.x][game.tribes[i].pos.y] = 1;
                    }
                    if(game.tribes[i].energy > 0){
                        game.tribes[i].AIMove();
                    }else{
                        game.tribes[i] = false;
                        game.tribes.splice(i,1);
                    }
                }
            }
        }
    },

    drawFPS: function(){
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 0.5em sans-serif';
        this.ctx.textBaseline = 'bottom';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('FPS:'+this.fps, 6, 12);
    },

    drawCursor: function(){
        var x = (this.pointer.x / game.screenScale) << 0 ,
            y = (this.pointer.y / game.screenScale) << 0;


        this.ctx.beginPath();
        this.ctx.moveTo(x,0);
        this.ctx.lineTo(x,this._H);
        this.ctx.strokeStyle = '#fff';
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0,y);
        this.ctx.lineTo(this._W,y);
        this.ctx.stroke();
    },

    drawGUI: function(){

        this.ctx.textBaseline = 'bottom';
        this.ctx.textAlign = 'center';

        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 0.5em sans-serif';
        this.ctx.fillText('Tribes: '+this.tribes.length, this._W*0.5 << 0, 12);

        this.ctx.textAlign = 'right';
        this.ctx.fillText('Time: '+this.timer, this._W - 12, 12);
    },

    draw: function(dTime){
        var sprite = 0,
         i, x, y;
        this.dTime = dTime;

        this.ctx.clearRect(0, 0, this._W, this._H);

        if( this.STATE == 'intro'){
            this.ctx.textBaseline = 'bottom';
            this.ctx.textAlign = 'center';

            this.ctx.fillStyle = '#eb8931';
            this.ctx.font = 'bold 1em sans-serif';
            this.ctx.fillText('Tribes Life', this._W*0.5 << 0, this._H*0.5 << 0);

            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 0.7em sans-serif';
            this.ctx.fillText('A game of life for js13kgames', this._W*0.5 << 0, (this._H*0.5 << 0) + 12);

            if(this.timer % 2 == 1){
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 0.7em sans-serif';
                this.ctx.fillText('click to start', this._W*0.5 << 0, (this._H*0.5 << 0) + 36);
            }

            if(this.pointerDraw){
                this.STATE = 'game';
                this.pointerDraw = false;
            }

        }

        if(this.STATE == 'game'){
            for (x = 0; x < this.world.length; x++) {
                for (y = 0; y < this.world[x].length; y++) {
                        if(this.world[x][y]> 0){
                            sprite = this.sprites[this.spritesVariants * this.world[x][y] + (this.randomSpritesMask[x*y+x+y])];

                            var step = 0;
                            if(y<this.worldH-1){
                                step = this.world[x][y+1] === 0 ? -1 : 0;
                            }
                            this.ctx.putImageData(sprite,x*this.spriteSize, y*this.spriteSize+step);
                        }else{
                            sprite = this.sprites[this.spritesVariants * this.world[x][y] + (Math.random()*(this.spritesVariants))<<0];
                            this.ctx.putImageData(sprite,x*this.spriteSize, y*this.spriteSize);
                        }


                }
            }

            for (i = 0; i < this.tribes.length; i++) {
                if(this.tribes[i]){
                    this.tribes[i].renderMove(dTime);
                    this.ctx.putImageData(this.tribeSprite, (this.tribes[i].renderPos.x)<<0,(this.tribes[i].renderPos.y)<<0);

                    /*this.ctx.beginPath();
                    this.ctx.moveTo(this.tribes[i].renderPos.x*game.spriteSize,this.tribes[i].renderPos.y*game.spriteSize);
                    this.ctx.lineTo(this.tribes[i].pos.x*game.spriteSize,this.tribes[i].pos.y*game.spriteSize - (this.tribes[i].energy/10)<<0);
                    this.ctx.strokeStyle = '#be2633';
                    this.ctx.stroke();*/
                }
            };

            this.drawGUI();

            if(this.flag){
                this.ctx.putImageData(this.flagSprite, this.flag.x*this.spriteSize,this.flag.y*game.spriteSize);
            }
            this.drawFPS();
        }


        this.drawCursor();
    }
};

game.init();

var time,
    fps = 0,
    lastUpdate = (new Date)*1 - 1,
    fpsFilter = 30;

(function animloop() {
    requestAnimFrame(animloop);

    var now = new Date().getTime(),
        dTime = now - (time || now);
    time = now;

    var thisFrameFPS = 1000 / ((now=new Date) - lastUpdate);
    fps += (thisFrameFPS - fps) / fpsFilter;
    lastUpdate = now;

    game.fps = fps.toFixed(1);
    game.draw(dTime);

})();