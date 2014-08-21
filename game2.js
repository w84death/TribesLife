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
Gfx.prototype.init = function(){
    this.loaded = 0;
    this.sprites = {
        logo: new Image(),
        pointer: new Image(),
        tileset: new Image()
    }
    this.sprites.logo.src = 'sprites/tribes_logo.png';
    this.sprites.pointer.src = 'sprites/pointer.png';
    this.sprites.tileset.src = 'sprites/tileset.png';

    this.sprites.logo.onload = function(){
        game.gfx.loaded++;
    };
    this.sprites.pointer.onload = function(){
        game.gfx.loaded++;
    };
    this.sprites.tileset.onload = function(){
        game.gfx.loaded++;
    };
};
Gfx.prototype.load = function(){
    var size = 0, key;
    for (key in this.sprites) {
        if (this.sprites.hasOwnProperty(key)) size++;
    }
    if(this.loaded >= size){
        return true;
    }
    return false;
};

/*
*
*   gui functions
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var Gui = function(){};
Gui.prototype.draw_logo = function(params){
    game.ctx.textBaseline = 'bottom';
    game.ctx.textAlign = 'center';


    game.ctx.fillStyle = '#fff';
    game.ctx.font = 'bold 0.7em sans-serif';
    game.ctx.fillText('P1X PRESENTS',
        game.screen.width*0.5 << 0,
        (game.screen.height*0.5 << 0) - 36
    );

    game.ctx.beginPath();
    game.ctx.moveTo(24,(game.screen.height*0.5 << 0) - 32);
    game.ctx.lineTo(game.screen.width-24,(game.screen.height*0.5 << 0) - 32);
    game.ctx.strokeStyle = '#2F484E';
    game.ctx.stroke();

    /*game.ctx.fillStyle = '#eb8931';
    game.ctx.font = 'bold 1em sans-serif';
    game.ctx.fillText('Tribes Life',
        game.screen.width*0.5 << 0,
        game.screen.height*0.5 << 0
    );*/

    game.ctx.drawImage(game.gfx.sprites.logo,
        (game.screen.width*0.5 << 0)-96,
        (game.screen.height*0.5 << 0)-32
    );

    game.ctx.beginPath();
    game.ctx.moveTo(24,(game.screen.height*0.5 << 0) + 32);
    game.ctx.lineTo(game.screen.width-24,(game.screen.height*0.5 << 0) + 32);
    game.ctx.strokeStyle = '#2F484E';
    game.ctx.stroke();

    if(game.timer % 2 == 1){
        game.ctx.fillStyle = '#fff';
        game.ctx.font = 'bold 0.7em sans-serif';
        game.ctx.fillText('CLICK TO START',
            game.screen.width*0.5 << 0,
            (game.screen.height*0.5 << 0) + 48);
    }
};
Gui.prototype.draw_fps = function(){
    game.ctx.fillStyle = '#fff';
    game.ctx.font = 'bold 0.5em sans-serif';
    game.ctx.textBaseline = 'bottom';
    game.ctx.textAlign = 'left';
    game.ctx.fillText('FPS:'+game.fps, 6, 12);
};

var Input = function(){};
Input.prototype.init = function(canvas){
    canvas.addEventListener('mousedown', this.enable_pointer, false);
    canvas.addEventListener('mouseup', this.disable_pointer, false);
    canvas.addEventListener('mousemove', this.track_pointer, false);
    canvas.addEventListener("contextmenu", function(e){
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
    canvas: null,
    ctx: null,
    screen: {
        width: null,
        height: null
    },
    world: {
        sprite_size: 8,
        scale: 4,
        width: null,
        height: null
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
        this.screen.width = ((window.innerWidth/this.world.sprite_size)*this.world.scale)<<0;
        this.screen.height = ((window.innerHeight/this.world.sprite_size)*this.world.scale)<<0;
        this.canvas = document.getElementById('canvas');
        this.canvas.width = this.screen.width;
        this.canvas.height = this.screen.height;
        this.ctx = this.canvas.getContext('2d');

        // game world size (for now as big as screen)
        this.world.width = (this.screen.width/this.world.sprite_size)<<0;
        this.world.height = (this.screen.height/this.world.sprite_size)<<0;

        // mouse events
        this.input.init(this.canvas);

        // init game timer
        window.setInterval(game.inc_timer,500);

        // graphics init
        this.gfx.init();
    },

    /*
    *   procedural island generation
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    generate_island: function(params){

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
        this.timer = 0;
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
        this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);

        switch(this.state){
            case 'intro':
                this.gui.draw_logo();
            break;
            case 'game':
                this.gui.draw_fps();
            break;
            case 'game_over':
                this.gui.draw_game_over();
            break;
        }

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