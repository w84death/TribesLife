/*
*
*
*   P1X, Krzysztof Jankowski
*   TRIBES rev2
*
*   abstract: game for the js13kGames compo
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

var Gfx = function(){
    this.layers = [];
    this.screen = {
        width: null,
        height: null,
        scale: 4,
        sprite_size: 8,
    };
    this.screen.width = (window.innerWidth/this.screen.scale)<<0;
    this.screen.height = (window.innerHeight/this.screen.scale)<<0;
};
Gfx.prototype.init = function(params){
    this.loaded = 0;
    this.sprites = {
        logo: new Image(),
        pointer: new Image(),
        tileset: new Image()
    };
    this.sprites.logo.src = 'sprites/logo.png';
    this.sprites.pointer.src = 'sprites/pointer.png';
    this.sprites.tileset.src = 'sprites/tileset.png';

    for (var key in this.sprites) {
        this.sprites[key].onload = function(){
            game.gfx.loaded++;
        };
    }

    for (var i = 0; i < params.layers; i++) {
        var canvas = document.createElement('canvas');
        canvas.width = this.screen.width;
        canvas.height = this.screen.height;
        var ctx = canvas.getContext("2d");
        this.layers.push({
            canvas: canvas,
            ctx: ctx,
            render: false
        });
        canvas.style.webkitTransform = ' scale('+this.screen.scale+')';
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
    this.layers[layer].ctx.clearRect(
        0, 0,
        this.screen.width, this.screen.height
    );
};
Gfx.prototype.init_tileset = function(){
    var canvas = document.createElement('canvas');
    canvas.width = this.sprites.tileset.width;
    canvas.height = this.sprites.tileset.height;
    var ctx = canvas.getContext("2d");

    ctx.drawImage(this.sprites.tileset,0,0);

    this.tileset = [];
    for (var y = 0; y < canvas.height/this.screen.sprite_size; y++) {
        for (var x = 0; x < canvas.width/this.screen.sprite_size; x++) {
            this.tileset.push(
                ctx.getImageData(
                    game.gfx.screen.sprite_size * x,
                    game.gfx.screen.sprite_size * y,
                    game.gfx.screen.sprite_size,
                    game.gfx.screen.sprite_size
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
        this.gfx.layers[1].render = true;
    };
};
Gfx.prototype.put_tile = function(params){
    this.layers[params.layer].ctx.putImageData(
        this.tileset[params.id],
        params.x*this.screen.sprite_size,
        params.y*this.screen.sprite_size
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
    this.bubbles = [];
};
Gui.prototype.clear = function(){
    game.gfx.layers[this.layer].ctx.clearRect(
        0, 0,
        game.gfx.screen.width, game.gfx.screen.height
    );
};
Gui.prototype.draw_logo = function(params){
    game.gfx.layers[this.layer].ctx.drawImage(
        game.gfx.sprites.logo,
        (params.x*game.gfx.screen.sprite_size)-(game.gfx.sprites.logo.width*0.5),
        (params.y*game.gfx.screen.sprite_size)-(game.gfx.sprites.logo.height*0.5)
    );
};
Gui.prototype.draw_intro = function(params){
    var ctx = game.gfx.layers[this.layer].ctx;

    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = "900 11px 'Source Code Pro', monospace,serif";
    ctx.strokeStyle = '#fff';

    ctx.fillText('P1X PRESENTS',
        game.gfx.screen.width*0.5 << 0,
        (game.gfx.screen.height*0.5 << 0) - 36
    );

    ctx.drawImage(game.gfx.sprites.logo,
        (game.gfx.screen.width*0.5 << 0)-(game.gfx.sprites.logo.width*0.5),
        ((game.gfx.screen.height*0.5 << 0)-(game.gfx.sprites.logo.height*0.5))-20
    );

    ctx.beginPath();
    ctx.moveTo(24,(game.gfx.screen.height*0.5 << 0));
    ctx.lineTo(game.gfx.screen.width-24,(game.gfx.screen.height*0.5 << 0));
    ctx.stroke();

    ctx.fillText('8X8 SPRITES; 16 COLOUR PALETTE',
        game.gfx.screen.width*0.5 << 0,
        (game.gfx.screen.height*0.5 << 0)+18
    );

    game.gfx.layers[this.layer].ctx.fillText('P1X ENGINE V4; HTTP://P1X.IN',
        game.gfx.screen.width*0.5 << 0,
        (game.gfx.screen.height*0.5 << 0)+32
    );

    ctx.fillText('@W84DEATH',
        game.gfx.screen.width*0.5 << 0,
        (game.gfx.screen.height*0.5 << 0)+48
    );

    ctx.beginPath();
    ctx.moveTo(24,(game.gfx.screen.height*0.5 << 0) + 56);
    ctx.lineTo(game.gfx.screen.width-24,(game.gfx.screen.height*0.5 << 0) + 56);
    ctx.stroke();

    if(game.timer % 2 == 1){
        ctx.fillText('CLICK TO START',
            game.gfx.screen.width*0.5 << 0,
            (game.gfx.screen.height*0.5 << 0) + 74
        );
    }
};
Gui.prototype.draw_fps = function(){
    var ctx = game.gfx.layers[this.layer].ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(
        game.gfx.screen.width-(7*game.gfx.screen.sprite_size),
        game.gfx.screen.height-(2*game.gfx.screen.sprite_size),
        game.gfx.screen.sprite_size*6,
        game.gfx.screen.sprite_size);
    ctx.fillStyle = '#fff';
    ctx.font = "900 9px 'Source Code Pro', monospace,serif";
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';
    ctx.fillText('FPS '+game.fps,
        game.gfx.screen.width-game.gfx.screen.sprite_size-2,
        game.gfx.screen.height-game.gfx.screen.sprite_size+1
    );
};
Gui.prototype.draw_pointer = function(){
    var x = (game.input.pointer.pos.x / game.gfx.screen.scale) << 0,
        y = (game.input.pointer.pos.y / game.gfx.screen.scale) << 0;

    game.gfx.layers[this.layer].ctx.drawImage(
        game.gfx.sprites.pointer,
        game.input.pointer.enable? 8 : 0, // x cut
        0, // y cut
        8,8,x,y,8,8 // cut size, position, sprite size
    );
};
Gui.prototype.draw_message = function(params){
    var ctx = game.gfx.layers[this.layer].ctx,
        tile = 0, corner = {}, max_len = 0, len = 0,
        width, height, i,x,y;

    for (i = 0; i < params.msg.length; i++) {
        len = params.msg[i].length;
        if(len > max_len) max_len = len;
    };

    width = (((max_len/7.5)*4.8)<<0 )+1;
    height = i+1;
    if(width<2) width = 2;

    corner = {
        x: params.x - width + 1,
        y: params.y - height + 1
    };

    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {

            if(y===0){
                if(x===0) tile = 20;
                if(x===width-1) tile = 22;
                if(x>0 && x<width-1) tile = 21;
            }
            if(height > 2 && y>0){
                if(x===0) tile = 23;
                if(x===width-1) tile = 25;
                if(x>0 && x<width-1) tile = 24;
            }
            if(y===height-1){
                if(x===0) tile = 26;
                if(x===width-1) tile = 28;
                if(x>0 && x<width-1) tile = 27;
            }

            game.gfx.put_tile({
                layer: this.layer,
                id:tile,
                x: corner.x+x,
                y: corner.y+y
            })
        }
    };

    ctx.fillStyle = '#000';
    ctx.font = "900 8px 'Source Code Pro', monospace,serif";
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    for (var i = 0; i < params.msg.length; i++) {
        ctx.fillText(params.msg[i],
            corner.x*game.gfx.screen.sprite_size + 3,
            (corner.y+i)*game.gfx.screen.sprite_size + 2
        );
    };
};
Gui.prototype.conversation = function(params){
    for (var i = 0; i < params.bubbles.length; i++) {
        this.bubbles.push({
            msg: params.bubbles[i],
            pos: {
                x:params.pos.x,
                y:params.pos.y
            },
            delay: i===0 ? params.delay || false : false,
            time: game.settings.conversation_time
        });
    };
};
Gui.prototype.draw_conversation = function(){
    var msg;

    if(this.bubbles.length > 0){
        bubble = this.bubbles[0];
        if(bubble.delay && bubble.delay < 0){
            if(bubble.time < 0){
                this.draw_message({
                    msg: bubble.msg,
                    x: bubble.pos.x,
                    y: bubble.pos.y
                });
                if(game.input.pointer.enable){
                    this.bubbles.splice(0,1);
                }
            }else{
                bubble.time--;
            }
        }else{
            bubble.delay--;
        }
    }
};

/*
*
*   input function
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var Input = function(){
    this.pointer = {
        enable: false,
        pos: {
            x: null,
            y: null
        }
    };
};
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
    game.input.pointer.enable = true;
};
Input.prototype.disable_pointer = function(){
    game.input.pointer.enable = false;
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
    game.input.pointer.pos.x = x;
    game.input.pointer.pos.y = y;
};

/*
*
*   entities
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var Entity = function(){};


/*
*
*   main game mechanics
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


var game = {

    gfx: new Gfx(),
    gui: new Gui(),
    input: new Input(),

    fps: 0,
    world: {
        width: null,
        height: null,
        islands: [],
        entities: []
    },
    state: 'loading',
    timer: 0,

    settings:{
        water_animations: 36,
        conversation_time: 30
    },

    /*
    *   init the engine
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    init: function(){
        // game world size (for now as big as screen)
        this.world.width = (this.gfx.screen.width/this.gfx.screen.sprite_size)<<0;
        this.world.height = (this.gfx.screen.height/this.gfx.screen.sprite_size)<<0;

        // init game timer
        window.setInterval(game.inc_timer,500);

        // graphics init
        this.gfx.init({
            layers: 4
        });

        // gui init
        this.gui.init({
            layer: 3
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
                y: (this.world.height*0.5<<0)-3
            },
            data: [
                [6, 2, 3, 2, 3, 7, 0, 0],
                [3, 2,12,13,10, 2, 7, 0],
                [8,10,12,12,11,10, 2, 7],
                [0, 2,11,13,12, 3,10, 2],
                [6,10, 3,12,10,11, 3, 9],
                [2, 3, 2,11, 2, 2, 9, 0],
                [8, 4, 5, 4, 5, 9, 0, 0]
            ]
        });

        this.world.entities.push({
            sprite: 17,
            pos: {
                x: (this.world.width*0.5<<0)-1,
                y: (this.world.height*0.5<<0)+1
            },
        });

        this.world.entities.push({
            sprite: 15,
            pos: {
                x: (this.world.width*0.5<<0)+3,
                y: (this.world.height*0.5<<0)-1
            },
        });

        this.world.entities.push({
            sprite: 18,
            pos: {
                x: (this.world.width*0.5<<0)-2,
                y: (this.world.height*0.5<<0)+2
            },
        });

        this.world.entities.push({
            sprite: 14,
            pos: {
                x: (this.world.width*0.5<<0)+1,
                y: (this.world.height*0.5<<0)-3
            },
        });

        this.world.entities.push({
            sprite: 16,
            pos: {
                x: (this.world.width*0.5<<0)-2,
                y: (this.world.height*0.5<<0)-2
            },
        });
    },

    /*
    *   game logic
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    inc_timer: function(){
        game.timer++;
    },

    new_game: function(){
        this.input.pointer.enable = false;
        this.generate_island();
        this.gfx.layers[0].render = true;
        this.gfx.layers[1].render = true;
        this.gfx.layers[2].render = true;
        this.timer = 0;
        //this.gfx.draw_tileset();

        this.gui.conversation({
            bubbles: [

                ['Hello, there!'],

                ['Welcome to our',
                'little island.'],

            ],
            pos: {
                x: ((this.world.width*0.5)<<0)-2,
                y: ((this.world.height*0.5)<<0)-3
            },
            delay: 150
        });


        this.gui.conversation({
            bubbles: [

                ['We are low in',
                'food supply..'],

                ['We shoud go',
                'for hunting!'],

                ['Lead us to',
                'the animals.']
            ],
            pos: {
                x: ((this.world.width*0.5)<<0)-1,
                y: ((this.world.height*0.5)<<0)
            },
            delay: 80
        });

    },

    update: function(delta_time){

        switch(this.state){
            case 'loading':
                if(this.gfx.load()){
                    this.state = 'intro';
                }
            break;
            case 'intro':
                if(this.input.pointer.enable){
                    this.new_game();
                    this.state = 'game';
                }
            break;
            case 'game':

                // ?

            break;
            case 'game_over':
                if(this.input.pointer.enable){
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

                if(this.gfx.layers[0].render){
                    // render sea
                    for (x = 0; x < this.world.width; x++) {
                        for (y = 0; y < this.world.height; y++) {
                            this.gfx.put_tile({
                                id:Math.random()<0.5 ? 0 : 1,
                                x:x,y:y,
                                layer: 0
                            });
                        }
                    }
                    this.gfx.layers[0].render = false;
                }

                for (var i = 0; i < this.settings.water_animations; i++) {
                    this.gfx.put_tile({
                        id:Math.random()<0.5 ? 0 : 1,
                        x:(Math.random()*this.world.width)<<0,
                        y:(Math.random()*this.world.height)<<0,
                        layer: 0
                    });
                };


                if(this.gfx.layers[1].render){
                    // render island
                    for (i = 0; i < this.world.islands.length; i++) {
                        var island = this.world.islands[i];
                        for (y = 0; y < island.data.length; y++) {
                            for (x = 0; x < island.data[y].length; x++) {
                                if(island.data[y][x] > 0){
                                    this.gfx.put_tile({
                                        id:island.data[y][x],
                                        x:island.pos.x+x,
                                        y:island.pos.y+y,
                                        layer: 1
                                    });
                                }
                            }
                        }
                    }
                    this.gfx.layers[1].render = false;
                }

                // render entities
                if(this.gfx.layers[2].render){
                    for(i in this.world.entities){
                        var entity = this.world.entities[i];
                        this.gfx.put_tile({
                            id:entity.sprite,
                            x:entity.pos.x,
                            y:entity.pos.y,
                            layer: 2
                        });

                    }
                    this.gfx.layers[2].render = false;
                }

                // render gui
                this.gui.draw_fps();
                this.gui.draw_logo({
                    x:4,
                    y:this.world.height-2
                });
                this.gui.draw_conversation();
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