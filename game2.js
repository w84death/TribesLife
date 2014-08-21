/*
*
*
*   P1X, Krzysztof Jankowski
*   TRIBES rev2
*
*   abstract: game for the js13k compo
*   created: 21-08-2014
*   license: do what you want and dont bother me
*
*   webpage: http://p1x.in
*   twitter: @w84death
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */



/*
*
*   request animation, force 60fps rendering
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

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


/*
*
*   graphics functions
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var Gfx = function(){};
Gfx.prototype.init = function(params){
    this.loaded = 0;
    this.sprites = {
        logo: new Image(),
        logo_big: new Image(),
        pointer: new Image(),
        tileset: new Image()
    }
    this.sprites.logo.src = 'sprites/tribes_logo.png';
    this.sprites.logo_big.src = 'sprites/tribes_logo_big.png';
    this.sprites.pointer.src = 'sprites/pointer.png';
    this.sprites.tileset.src = 'sprites/tileset.png';

    for (var key in this.sprites) {
        this.sprites[key].onload = function(){
            game.gfx.loaded++;
        };
    }

    for (var i = 0; i < params.layers; i++) {
        var canvas = document.createElement('canvas');
        canvas.width = game.screen.width;
        canvas.height = game.screen.height;
        var ctx = canvas.getContext("2d");
        game.layers.push({
            canvas: canvas,
            ctx: ctx,
            render: false
        });
        document.getElementById('game').appendChild(canvas);
    };
};
Gfx.prototype.load = function(){
    var size = 0, key;
    for (key in this.sprites) {
        if (this.sprites.hasOwnProperty(key)) size++;
    }
    if(this.loaded >= size){
        game.gfx.init_tileset();
        return true;
    }
    return false;
};
Gfx.prototype.clear = function(layer){
    game.layers[layer].ctx.clearRect(
        0, 0,
        game.screen.width, game.screen.height
    );
};
Gfx.prototype.init_tileset = function(){
    var canvas = document.createElement('canvas');
    canvas.width = this.sprites.tileset.width;
    canvas.height = this.sprites.tileset.height;
    var ctx = canvas.getContext("2d");

    ctx.drawImage(this.sprites.tileset,0,0);

    this.tileset = [];
    for (var y = 0; y < canvas.height/game.world.sprite_size; y++) {
        for (var x = 0; x < canvas.width/game.world.sprite_size; x++) {
            this.tileset.push(
                ctx.getImageData(
                    game.world.sprite_size * x,
                    game.world.sprite_size * y,
                    game.world.sprite_size,
                    game.world.sprite_size
                )
            );
        }
    }
};
Gfx.prototype.draw_tileset = function(){
    for (var i = 0; i < this.tileset.length; i++) {
        this.put_tile({
            id:i, x:i, y:0, layer:1
        });
        game.layers[1].render = true;
    };
};
Gfx.prototype.put_tile = function(params){
    game.layers[params.layer].ctx.putImageData(
        this.tileset[params.id],
        params.x*game.world.sprite_size,
        params.y*game.world.sprite_size
    );
};

/*
*
*   gui functions
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var Gui = function(){};
Gui.prototype.init = function(params){
    this.layer = params.layer;
};
Gui.prototype.clear = function(){
    game.layers[this.layer].ctx.clearRect(
        0, 0,
        game.screen.width, game.screen.height
    );
};
Gui.prototype.draw_logo = function(params){
    game.layers[this.layer].ctx.drawImage(
        game.gfx.sprites.logo,
        (params.x*game.world.sprite_size)-24,
        (params.y*game.world.sprite_size)-8
    );
};
Gui.prototype.draw_intro = function(params){
    var ctx = game.layers[this.layer].ctx;

    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.strokeStyle = '#fff';

    ctx.fillText('P1X PRESENTS',
        game.screen.width*0.5 << 0,
        (game.screen.height*0.5 << 0) - 36
    );

    ctx.drawImage(game.gfx.sprites.logo_big,
        (game.screen.width*0.5 << 0)-96,
        (game.screen.height*0.5 << 0)-42
    );

    game.layers[this.layer].ctx.beginPath();
    game.layers[this.layer].ctx.moveTo(24,(game.screen.height*0.5 << 0) + 32);
    game.layers[this.layer].ctx.lineTo(game.screen.width-24,(game.screen.height*0.5 << 0) + 32);
    game.layers[this.layer].ctx.stroke();

    game.layers[this.layer].ctx.fillText('JS13KGAME COMPO',
        game.screen.width*0.5 << 0,
        (game.screen.height*0.5 << 0)+54
    );

    if(game.timer % 2 == 1){
        game.layers[this.layer].ctx.fillText('CLICK TO START',
            game.screen.width*0.5 << 0,
            (game.screen.height*0.5 << 0) + 70);
    }

    ctx.beginPath();
    ctx.moveTo(24,(game.screen.height*0.5 << 0) + 80);
    ctx.lineTo(game.screen.width-24,(game.screen.height*0.5 << 0) + 80);
    ctx.stroke();


};
Gui.prototype.draw_fps = function(){
    var ctx = game.layers[this.layer].ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(
        game.screen.width-(5*game.world.sprite_size),
        game.screen.height-(2*game.world.sprite_size),
        game.world.sprite_size*4,
        game.world.sprite_size);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';
    ctx.fillText('FPS:'+game.fps,
        game.screen.width-game.world.sprite_size+1,
        game.screen.height-game.world.sprite_size+1
    );
};
Gui.prototype.draw_pointer = function(){
    var x = (game.pointer.pos.x / game.screen.scale) << 0,
        y = (game.pointer.pos.y / game.screen.scale) << 0;

    game.layers[this.layer].ctx.drawImage(game.gfx.sprites.pointer,
        x,
        y
    );
};

/*
*
*   input function
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var Input = function(){};
Input.prototype.init = function(){
    document.body.addEventListener('mousedown', this.enable_pointer, false);
    document.body.addEventListener('mouseup', this.disable_pointer, false);
    document.body.addEventListener('mousemove', this.track_pointer, false);
    document.body.addEventListener("contextmenu", function(e){
        e.preventDefault();
    }, false);
};
Input.prototype.enable_pointer = function(e){
    e.preventDefault();
    var x,y;
    if(e.touches){
        x = e.touches[0].pageX;
        y = e.touches[0].pageY;
    }else{
        x = e.pageX;
        y = e.pageY;
    }
    game.pointer.enable = true;
    //game.putFlag(x, y);
};
Input.prototype.disable_pointer = function(){
    game.pointer.enable = false;
};
Input.prototype.track_pointer = function(e){
    e.preventDefault();
    var x,y;
    if(e.touches){
        x = e.touches[0].pageX;
        y = e.touches[0].pageY;
    }else{
        x = e.pageX;
        y = e.pageY;
    }
    game.pointer.pos.x = x;
    game.pointer.pos.y = y;
    if(game.pointer.enable){
        //game.makeNewLand(x,y, event.which == 1 ? 1 : 0 );
    }
};

/*
*
*   main game function
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


var game = {

    gfx: new Gfx(),
    gui: new Gui(),
    input: new Input(),

    fps: 0,
    layers: [],
    canvas: null,
    ctx: null,
    screen: {
        width: null,
        height: null,
        scale: 4
    },
    world: {
        sprite_size: 8,
        width: null,
        height: null,
        islands: []
    },
    pointer: {
        enable: false,
        pos: {
            x: null,
            y: null
        }
    },
    state: 'loading',
    timer: 0,

    /*
    *   init the engine
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    init: function(){
        // canvas sizes
        this.screen.width = (window.innerWidth/this.screen.scale)<<0;
        this.screen.height = (window.innerHeight/this.screen.scale)<<0;
        //this.canvas = document.getElementById('canvas');
        //this.canvas.width = this.screen.width;
        //this.canvas.height = this.screen.height;
        //this.ctx = this.canvas.getContext('2d');

        // game world size (for now as big as screen)
        this.world.width = (this.screen.width/this.world.sprite_size)<<0;
        this.world.height = (this.screen.height/this.world.sprite_size)<<0;

        // init game timer
        window.setInterval(game.inc_timer,500);

        // graphics init
        this.gfx.init({
            layers: 3
        });

        // gui init
        this.gui.init({
            layer: 2
        })

        // mouse events
        this.input.init();
    },

    /*
    *   procedural island generation
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    generate_island: function(params){
        this.world.islands.push({
            pos: {
                x: (this.world.width*0.5<<0)-3,
                y: (this.world.height*0.5<<0)-3,
            },
            data: [
                [2, 0, 0, 1, 0, 3],
                [0, 1,10,10, 0, 0],
                [1, 0,10,10, 1, 0],
                [0,10, 1,10,10, 1],
                [0, 1, 0, 1,10, 0],
                [4, 0, 1, 0, 0, 5],
            ]
        });
    },

    /*
    *   game logic
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    inc_timer: function(){
        game.timer++;
    },

    new_game: function(){
        this.pointer.enable = false;
        this.generate_island();
        this.layers[0].render = true;
        this.timer = 0;
        //this.gfx.draw_tileset();
    },

    update: function(delta_time){

        switch(this.state){
            case 'loading':
                if(this.gfx.load()){
                    this.state = 'intro';
                }
            break;
            case 'intro':
                if(this.pointer.enable){
                    this.new_game();
                    this.state = 'game';
                }
            break;
            case 'game':

                // ?

            break;
            case 'game_over':
                if(this.pointer.enable){
                    this.new_game();
                    this.state = 'game';
                }
            break;
        }

    },

    /*
    *   render game graphics
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    render: function(delta_time){
        this.gui.clear();
        var i,x,y;

        switch(this.state){
            case 'intro':
                this.gui.draw_intro();
            break;
            case 'game':
                // render background terrain
                if(this.layers[0].render){
                    // render sea
                    for (x = 0; x < this.world.width; x++) {
                        for (y = 0; y < this.world.height; y++) {
                            this.gfx.put_tile({
                                id:6,x:x,y:y,
                                layer: 0
                            });
                        }
                    }

                    // render island
                    for (i = 0; i < this.world.islands.length; i++) {
                        var island = this.world.islands[i];
                        for (x = 0; x < island.data.length; x++) {
                            for (y = 0; y < island.data[x].length; y++) {
                                this.gfx.put_tile({
                                    id:island.data[y][x],
                                    x:island.pos.x+x,
                                    y:island.pos.y+y,
                                    layer: 0
                                });
                            }
                        }
                    }
                    this.layers[0].render = false;
                }
                // render entities
                if(this.layers[1].render){
                    for (x = 0; x < this.world.width; x++) {
                        for (y = 0; y < this.world.height; y++) {

                        }
                    }
                    this.layers[1].render = false;
                }
                // render gui
                this.gui.draw_fps();
                this.gui.draw_logo({
                    x:(this.world.width*0.5)<<0,
                    y:2
                });
            break;
            case 'game_over':
                this.gui.draw_game_over();
            break;
        }

        this.gui.draw_pointer();


    },



    /*
    *   main loop
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    loop: function(delta_time){
        this.update(delta_time);
        this.render(delta_time);
    },

};


/*
*
*   init game/render loop
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


game.init();

var time,
    fps = 0,
    last_update = (new Date)*1 - 1,
    fps_filter = 30;

(function game_loop() {
    requestAnimFrame(game_loop);

    var now = new Date().getTime(),
        delta_time = now - (time || now);
    time = now;

    var temp_frame_fps = 1000 / ((now=new Date) - last_update);
    fps += (temp_frame_fps - fps) / fps_filter;
    last_update = now;

    game.fps = fps.toFixed(1);
    game.loop(delta_time);
})();