var whackacake = function all() {
    my = {};


    my.init = function() {
        my.canvas = document.getElementById("c");
        var screenWidth = 600;
        var screenHeight = 400;

        var style = my.canvas.getAttribute("style");
        my.canvas.setAttribute("style", style + "; height:" + screenHeight + "; width:" + screenWidth + ";");

        my.canvas.height = screenHeight;
        my.canvas.width = screenWidth;


        console.debug("canvas: " + style);

        my.game = new Game();
        my.game.init();
        my.game.loop();
    }


    ///---------------- objects ----------------

    var Game = function() {
        var $this = this;

        this.init = function() {
            $this.score = 0;
            $this.timer = 0;
            $this.images = {};
            $this.loadImages();
            $this.cups = this.createCups();
            $this.ingredients = $this.createIngredients();
            $this.scoreDisplay = document.getElementById("game_score");
            $this.ctx = my.canvas.getContext('2d');
            my.canvas.addEventListener('click', $this.checkClicks);
        }


        //Main game loop
        this.loop = function() {

            $this.score++;
            //moveSprite(player);
            $this.drawAll();
            setTimeout("whackacake.game.loop()", 15);
        }

        this.checkClicks = function(e) {
            var i;
            for (i = 0; i < $this.cups.length; i++) {
                console.log("clicked");
                if ($this.cups[i].isClickedOn(e.x, e.y)) {
                    //alert(' hit! ' + i);
                    console.log("clicked on "+i);
                }
            }
        }

        this.loadImages = function(){
            $this.images.cup = new Image();
            $this.images.cup.src = "images/cup.jpg";
        }

        
        this.createIngredients = function(){
            var chocImage = new Image
        }

        this.createCups = function() {
            var screenWidth = my.canvas.width;
            var screenHeight = my.canvas.height;

            var result = [];
            result.push(new Sprite(screenWidth / 4, screenHeight / 4, $this.images.cup));
            result.push(new Sprite(3 * screenWidth / 4, screenHeight / 4, $this.images.cup));
            result.push(new Sprite(screenWidth / 2, screenHeight / 2, $this.images.cup));
            result.push(new Sprite(screenWidth / 4, 3 * screenHeight / 4, $this.images.cup));
            result.push(new Sprite(3 * screenWidth / 4, 3 * screenHeight / 4, $this.images.cup));
            console.log(result);
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

    }

    var Coords = function(xParam, yParam) {
        this.x = xParam;
        this.y = yParam;
    }

    var Sprite = function(x, y, spriteImage) {
        this.coord = new Coords(x, y);
        this.width = 40;
        this.height = 40;
        this.spriteImage = spriteImage;

        this.draw = function(ctx) {
            ctx.drawImage(this.spriteImage,
                    this.coord.x - this.width,
                    this.coord.y - this.height,
                    this.width * 2,
                    this.height * 2
            );
        }

        this.isClickedOn = function(x, y) {
            if (( this.coord.x - this.width < x && this.coord.x + this.width > x )
                    && ( this.coord.y - this.height < y && this.coord.y + this.height > y )) {
                return true;
            }
            return false;
        }

    }

    return my;

}();
