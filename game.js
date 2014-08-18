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



var game = {
    render: false,
    _W: null,
    _H: null,
    canvas: null,
    ctx: null,
    worldW: null,
    worldH: null,
    world: [],
    screenScale: 6,
    spriteSize: 6,
    spritesVariants: 12,
    sprites: [],
    tribesOnStart: 4,
    tribeSprite: null,
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


        function enable_pointer(e){
            game.mouseDraw = true;
        }
        function disable_pointer(){
            game.mouseDraw = false;
        }
        function track_pointer(e){
            game.pointer.x = e.pageX;
            game.pointer.y = e.pageY;
            if(game.mouseDraw){
                game.makeNewLand(e.pageX, e.pageY, 1);
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
            colorBody: [73,60,43]
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
                pixels[i++] = 255;
                pixels[i++] = 255;
                pixels[i++] = 255;
                pixels[i++] = 255;
            }
        }

        return imageData;
    },

    generateWorld: function(){
        var deep = 3,
            islands = 0.01,
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
        this.grownTrees(ground);

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

                this.tribes.push(new Tribe({
                    energy: 100,
                    makeNewLife: 0.05,
                    follow: (7+(Math.random()*3)<<0) * 0.1,
                    speed: (5+(Math.random()*5)<<0) * 0.1,
                    pos: {
                        x: empty[random].x,
                        y: empty[random].y
                    }
                }));
                empty = empty.slice(random);
            }
        };
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

        if(game.world[x] && game.world[x][y] > -1) {
            if(game.lastMouse.x !== x || game.lastMouse.y !== y){
                game.world[x][y] = type;
                game.lastMouse.x = x;
                game.lastMouse.y = y;
            }
        }

    },

    simulateLife: function(){
        game.grownTrees(    0.005);
        game.initNewLife(2, 0.001);
        for (var i = 0; i < game.tribes.length; i++) {
            if(game.tribes[i].energy > 0){
                game.tribes[i].AIMove();
            }else{
                game.tribes[i] = false;
                game.tribes.slice(i);
            }
        };
    },

    drawFPS: function(){
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 0.5em sans-serif';
        this.ctx.textBaseline = 'bottom';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('FPS: '+this.fps, this._W*0.9 << 0, this._H*0.9 << 0);
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

    draw: function(dTime){
        var sprite = 0;

        this.ctx.clearRect(0, 0, this._W, this._H);

        for (var x = 0; x < this.world.length; x++) {
            for (var y = 0; y < this.world[x].length; y++) {
                    sprite = this.sprites[this.spritesVariants * this.world[x][y] + (Math.random()*(this.spritesVariants))<<0];
                this.ctx.putImageData(sprite,x*this.spriteSize, y*this.spriteSize);
            }
        }

        for (var i = 0; i < this.tribes.length; i++) {
            if(this.tribes[i]){
                this.ctx.putImageData(this.tribeSprite, this.tribes[i].pos.x*this.spriteSize,this.tribes[i].pos.y*game.spriteSize);
            }
        };

        this.drawFPS();
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