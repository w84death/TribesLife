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
var Tribe = function(params){
    this.energy = params.energy;
    this.makeNewLife = params.makeNewLife;
    this.follow = params.follow;
    this.speed = params.speed;
    this.pos = {
        x: params.pos.x,
        y: params.pos.y
    }
};

Tribe.prototype.AIMove = function(params){

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
            if(friends >= 5){
                this.energy = ((this.energy*0.5)<<0)-1;
            }else
            // firend 1 is the same tribe
            if(friends > 1 && empty.length>2 && this.energy >= 10 && (Math.random() < this.makeNewLife)){
                var random = (Math.random()*empty.length)<<0;
                game.spawnNewTribe({
                    x:empty[random].x,
                    y:empty[random].y
                });
            }else
            if(Math.random() < this.follow && game.flag){

                if(Math.abs(game.flag.x-this.pos.x) > Math.abs(game.flag.y-this.pos.y)){
                    if(game.flag.x < this.pos.x){
                        for (var i = 0; i < empty.length; i++) {
                            if(empty[i].x < empty[bestRoute].x){
                                bestRoute = i;
                            }
                        };
                    }
                    if(game.flag.x >= this.pos.x){
                        for (var i = 0; i < empty.length; i++) {
                            if(empty[i].x >= empty[bestRoute].x){
                                bestRoute = i;
                            }
                        };
                    }
                }else{
                    if(game.flag.y < this.pos.y){
                        for (var i = 0; i < empty.length; i++) {
                            if(empty[i].y < empty[bestRoute].y){
                                bestRoute = i;
                            }
                        };
                    }
                    if(game.flag.y >= this.pos.y){
                        for (var i = 0; i < empty.length; i++) {
                            if(empty[i].y >= empty[bestRoute].y){
                                bestRoute = i;
                            }
                        };
                    }
                }
                this.pos.x = empty[bestRoute].x;
                this.pos.y = empty[bestRoute].y;
            }else{
                var random = (Math.random()*empty.length)<<0;
                this.pos.x = empty[random].x;
                this.pos.y = empty[random].y;
            }
        }
    }
};