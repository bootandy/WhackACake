var game = function all() {
    my = {};


    my.init = function() {
        my.canvas = document.getElementById("c");
        my.canvas_cake_stack = document.getElementById("cake_stack");
        var screenWidth = 500;
        var screenHeight = 400;
        var cakeStackWidth = 100;

        var style = my.canvas.getAttribute("style");
        my.canvas.setAttribute("style", style + "; height:" + screenHeight + "; width:" + screenWidth + ";");
        my.canvas_cake_stack.setAttribute("style", style + "; height:" + cakeStackWidth + "; width:" + screenWidth + ";");

        my.canvas.height = screenHeight;
        my.canvas.width = screenWidth;
        my.canvas_cake_stack.height = screenHeight;
        my.canvas_cake_stack.width = screenWidth;

        console.debug("canvas: " + style);

        my.gameLoop = new GameLoop();
        my.gameLoop.init();
        my.gameLoop.main();
    }


    ///---------------- objects ----------------

    var GameLoop = function() {
        var $this = this;

        this.init = function() {
            $this.score = 0;
            $this.timer = 0;
            $this.cups = this.createCups();
            $this.scoreDisplay = document.getElementById("game_score");
            $this.ctx = my.canvas.getContext('2d');
            my.canvas.addEventListener('click', $this.checkClicks);
        }


        //Main game loop
        this.main = function() {

            $this.score++;
            //moveSprite(player);
            $this.drawAll();
            setTimeout("game.gameLoop.main()", 15);
        }

        this.checkClicks = function(e) {
            var i;
            console.log($this.cups);
            for (i = 0; i < $this.cups.length; i++) {
                if ($this.cups[i].isClickedOn(e.x, e.y)) {
                    //alert(' hit! ' + i);
                    console.log("clicked on "+i);
                }
            }
        }


        this.createCups = function() {
            var screenWidth = my.canvas.width;
            var screenHeight = my.canvas.height;

            var cupImage = new Image();
            cupImage.src = "images/cup.jpeg";

            var result = [];
            result.push(new Cup(screenWidth / 4, screenHeight / 4, cupImage));
            result.push(new Cup(3 * screenWidth / 4, screenHeight / 4, cupImage));
            result.push(new Cup(screenWidth / 2, screenHeight / 2, cupImage));
            result.push(new Cup(screenWidth / 4, 3 * screenHeight / 4, cupImage));
            result.push(new Cup(3 * screenWidth / 4, 3 * screenHeight / 4, cupImage));
            console.debug(result);
            return result;
        }

        this.drawAll = function() {

            $this.ctx.clearRect(0, 0, my.canvas.width, my.canvas.height);

            this.scoreDisplay.innerHTML = $this.score;
            //this.ctx.fillStyle = "rgb(200,0,0)";

            var i;
            for (i = 0; i < $this.cups.length; i++) {
                $this.cups[i].draw($this.ctx);
            }
        }

        this.drawCakeStack = function() {
            
        }
    }

    var Coords = function(xParam, yParam) {
        this.x = xParam;
        this.y = yParam;
    }

    var Cup = function(x, y, imageSource) {
        this.coord = new Coords(x, y);
        this.spriteWidth = 40;
        this.spriteHeight = 40;
        this.cupImage = imageSource;

        this.draw = function(ctx) {
            ctx.drawImage(this.cupImage,
                    this.coord.x - this.spriteWidth,
                    this.coord.y - this.spriteHeight,
                    this.spriteWidth * 2,
                    this.spriteHeight * 2
            );
        }

        this.isClickedOn = function(x, y) {
            if (( this.coord.x - this.spriteWidth < x && this.coord.x + this.spriteWidth > x )
                    && ( this.coord.y - this.spriteHeight < y && this.coord.y + this.spriteHeight > y )) {
                return true;
            }
            return false;
        }

    }

    return my;

}();