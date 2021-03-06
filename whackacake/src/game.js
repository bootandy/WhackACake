// http://www.tutorialspoint.com/javascript/array_foreach.htm
if (!Object.prototype.forEach)
{
    Object.prototype.forEach = function(fun /*, thisp*/)
    {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();

        var thisp = arguments[1];
        for (var i = 0; i < len; i++)
        {
            if (i in this)
                fun.call(thisp, this[i], i, this);
        }
    };
}

/*
 * * Recursively merge properties of two objects 
 * */
function merge(obj1, obj2) {

    for (var p in obj2) {
        try {
            //Property in destination object set; update its value.
            if ( obj2[p].constructor==Object ) {
                obj1[p] = MergeRecursive(obj1[p], obj2[p]);

            } else {
                obj1[p] = obj2[p];

            }

        } catch(e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];

        }
    }

    return obj1;
}




var whackacake = function all() {
    my = {};
    my.config = {
        spawnProbability:3/100,
        gameTime:41,
        ingredientStaysTimeRandom:50,
        ingredientstaysTimeConstant:250,
        goodScore:100,
        badScore:-100,
        
        gameOverCallback:function(score){}
    };

    /*my.init = function() {
        
        }*/


    my.init = function(config) {
        var findPosition =function(obj){
            var curleft = curtop = 0;
            if (obj.offsetParent) {
              do {
                  curleft += obj.offsetLeft;
                  curtop += obj.offsetTop;
                 } while (obj = obj.offsetParent);
            return [curleft,curtop];
          }
        }
        my.config = merge(my.config, config);
        my.canvas = document.getElementById("main_canvas");
        my.canvas_cake_stack = document.getElementById("cake_stack");
        var screenWidth = 640;
        var screenHeight = 500;
        var cakeStackWidth = 160;

        var style = my.canvas.getAttribute("style");
        my.canvas.setAttribute("style", style + "; height:" + screenHeight + "; width:" + screenWidth + ";");
        my.canvas_cake_stack.setAttribute("style", style + "; height:" + screenHeight + "; width:" + cakeStackWidth + ";");

        my.canvas.height = screenHeight;
        my.canvas.width = screenWidth;
        my.canvas.x = findPosition(my.canvas)[0];
        my.canvas.y = findPosition(my.canvas)[1];
        my.canvas_cake_stack.height = screenHeight;
        my.canvas_cake_stack.width = cakeStackWidth;

				/**
				* User agent matching to detect iOS devices and Android devices
				* Currently used to adjust animation duration
				**/
				
				my.isRunningOnIos = false;
				my.isRunningOnAndroid = false;
				if (navigator.userAgent.match(/like Mac OS X/i)) {
				   my.isRunningOnIos = true;
				}
				
							if (navigator.userAgent.match(/Android/i)) {
							   my.isRunningOnAndroid = true;
							}

    }

    my.start = function(){
        my.game = new Game();
        my.game.init();
        my.loop = setInterval("my.game.loop()", my.game.loopInterval);
    }

    my.setSpawnProb = function(value){
        my.config.spawnProbability = value;
    }
    my.setGoodScore = function(value){
        my.config.goodScore = value;
    }
    my.setBadScore = function(value){
        my.config.badScore = value;
    }


    /**
     * Returns the number of frames required for a delay of a given time
		 * Adjusts according to device type
     */

    my.getDurationInFrames = function(milliseconds){
		if (my.isRunningOnIos)
        return milliseconds / my.game.loopInterval/2;
		else if (my.isRunningOnAndroid)
			return milliseconds/my.game.loopInterval/5;
		else
			return milliseconds/my.game.loopInterval;
    }

    my.getMousePosition = function(e) {
      e = e || window.event;
      var cursor = {x:0, y:0};
      if (e.pageX || e.pageY) {
          cursor.x = e.pageX;
          cursor.y = e.pageY;
      } 
      else {
          var de = document.documentElement;
          var b = document.body;
          cursor.x = e.clientX + 
              (de.scrollLeft || b.scrollLeft) - (de.clientLeft || 0);
          cursor.y = e.clientY + 
              (de.scrollTop || b.scrollTop) - (de.clientTop || 0);
      }
      return cursor;
    }

    ///---------------- objects ----------------

    var Game = function() {
        var $this = this;

        this.init = function() {
            $this.score = 0;
            $this.cakesFinished = 0;
            $this.loopInterval = 30;
            $this.startTime = new Date().getTime();
            // 1 per second - Actually, this is the expectation of the number of ingredients that should spawn in a frame.
            my.frameCount = 0;
            $this.loadSounds();
            $this.loadImages();
            $this.cakeStack = new my.CakeStack($this.images.cakeLayers);
            $this.cups = this.createCups();
            $this.animatedText = [];
            $this.scoreDisplay = document.getElementById("game_score");
            $this.frameDisplay = document.getElementById("frames");
            $this.cakesDisplay = document.getElementById("cakes");
            
            //horrible hack to allow multiple games without refresh
            $this.timerDisplay = document.getElementById("timer");
            my.gameDiv = document.getElementById("game");
            $this.timerDisplay.setAttribute("style", ""); 

            $this.ctx = my.canvas.getContext('2d');
            $this.ctx_cake_stack = my.canvas_cake_stack.getContext('2d');
            $this.cursor = new my.Cursor(60, 62, $this.images.cursor_down);
            $this.background_left = new my.Background(my.canvas_cake_stack.width,my.canvas_cake_stack.height,$this.images.background_left);
            $this.background_right = new my.Background(my.canvas.width,my.canvas.height,$this.images.background_right);
            my.canvas.addEventListener('click', $this.mouseDown,false);
            my.canvas.addEventListener("touchstart", $this.touchDown, false);
            my.canvas.addEventListener("touchmove", $this.touchMove, true);
            my.canvas.addEventListener("touchend", $this.touchUp, false);
            my.canvas.addEventListener("touchcancel", $this.touchUp, false);
            my.canvas.addEventListener('mousemove', $this.cursor.setPosition);
        }


        //Main game loop
        this.loop = function() {
            my.frameCount++;
            $this.updateState();
            $this.drawAll();

            if (this.getTime() >= 0) {
            } else {
                clearInterval(my.loop);
                this.gameOver();
            }
        }

        this.updateState = function(){

            if (Math.random() < my.config.spawnProbability) {
                var cup = $this.getRandomCup()
                    if (!cup.hasIngredient()) {
                        cup.setIngredient(this.getRandomIngredient()); // Choose a random ingredient
                    }
            }
            $this.cups.forEach(function(c) { c.updateState(); });
            $this.cursor.updateState();
            // Look at the first animatedText element - if it has finished we remove it.
            if ($this.animatedText.length > 0 && $this.animatedText[0].isFinished()) {
                $this.animatedText.shift();
            }
        }

        this.mouseDown = function(e) {
            var mousePosition = my.getMousePosition(e);
            var mouseX = mousePosition.x;
            var mouseY = mousePosition.y;
            mouseX -= my.canvas.offsetLeft;
            mouseY -= my.canvas.offsetTop;
            $this.cursor.down()
            $this.canvasPressed(mouseX, mouseY);
        }

        this.touchDown = function(e) {
            if (!e) {
                var e = event;
            }
            e.preventDefault();
            touchX = e.targetTouches[0].pageX - my.canvas.offsetLeft;
            touchY = e.targetTouches[0].pageY - my.canvas.offsetTop;

            $this.canvasPressed(touchX,touchY);

        }

        this.getTime = function() {
            return my.config.gameTime - (new Date().getTime() - $this.startTime) /1000;
        }


        /** 
          This function determines which sprite was clicked
          and takes relevant action. The x,y parameters are passed by
          touchDown or mouseDown functions.
         **/

        this.canvasPressed = function(x,y) {        
            var i;
            for (i = 0; i < $this.cups.length; i++) {
                if ($this.cups[i].sprite.isClickedOn(x, y) && $this.cups[i].hasIngredient()) {
                    $this.clickedIngredient($this.cups[i], x, y);
                }
            }
        }


        this.clickedIngredient = function(cup,x, y) {
            //var type = cup.hasIngredient().getType();
            //$this.cakeStack.addToCakeStack(type);
            var scoreToAdd = cup.hit();

            var messageX = x - 50;
            var messageY = y - 50;
            var scoreMessage;
            if (scoreToAdd > 0) {
                scoreMessage = "+"+scoreToAdd
            } else {
                scoreMessage = scoreToAdd
            }
            //animate score message popping up
            var textAnimation = new my.TransAnimation(new my.Coords(messageX, messageY),
                    new my.Coords(messageX, messageY - 50),
                    my.getDurationInFrames(1000));

            $this.animatedText.push( new my.AnimatedText( messageX, messageY, textAnimation, scoreToAdd ));

            $this.score += scoreToAdd;
        }

        this.loadImages = function() {
            var addImage = function(src, width, height) {
                var im = new Image();
                im.src = src;
                im.width = width;
                im.height = height;
                return im;
            }
            $this.images={}
            $this.images.cup = addImage("images/bowl_back.png", 150, 100);
            $this.images.cupFront = addImage("images/bowl_front.png", 150, 100);
            $this.images.ingredients = addImage("images/ingredients.png", 150, 150);
            $this.images.choc = new Image();
            $this.images.choc.src = "images/chocolate.jpg";
            for (i=0; i<10; i++) {
                $this.images["ingredient_"+i] = addImage("images/ing_"+i+".png", 130, 90);
                $this.images["cake_layer_"+i] = addImage("images/cl_"+i+".png", 100, 50);
            }
            $this.images.cursor_down =  addImage("images/bat_down.png");
        }
        
        
        this.loadSounds = function() {
            var addSound = function(src) {
                var aud = document.createElement("audio");
                // Set source files for audio
                [".mp3", ".ogg"].forEach(function(ext) {
                    var src_el = document.createElement("source");
                    src_el.setAttribute("src", src+ext);
                    aud.appendChild(src_el);
                });
                aud.addEventListener('ended', function() {
                    this.currentTime=0;
                    this.pause();
                });
                return aud;
            }
            $this.sounds = {}
            $this.sounds.good_hit = addSound("sound/good_hit");
            $this.sounds.bad_hit = addSound("sound/bad_hit");
        }

        this.incrementCakes = function() {
            $this.cakesFinished++;
        }


        this.createCups = function() {
            var screenWidth = my.canvas.width;
            var screenHeight = my.canvas.height;

            positions = [[screenWidth / 4 + 20, screenHeight / 4 + 50],
                      [3 * screenWidth / 4 - 20, screenHeight / 4 + 50],
                      [screenWidth / 2, screenHeight / 2 + 20],
                      [screenWidth / 4, 3 * screenHeight / 4],
                      [3 * screenWidth / 4, 3 * screenHeight / 4]]

                          var result = new Array;
            for(var i = 0; i < positions.length; i++){
                frontSprite = new my.Sprite(positions[i][0], positions[i][1], $this.images.cupFront);
                backSprite = new my.Sprite(positions[i][0], positions[i][1], $this.images.cup);
                result.push(new my.Cup(frontSprite, backSprite));
            }
            return result;
        }

        this.getRandomCup = function() {
            cup_idx = Math.floor(Math.random()*$this.cups.length)
                return $this.cups[cup_idx];
        }

        this.getRandomIngredient = function() {
            return new my.Ingredient(Math.floor(Math.random()*10));
        }


        this.drawAll = function() {

            $this.ctx.clearRect(0, 0, my.canvas.width, my.canvas.height);
            //$this.background_right.draw($this.ctx);
            this.scoreDisplay.innerHTML = $this.score;
            this.frameDisplay.innerHTML = my.frameCount;
            this.cakesDisplay.innerHTML = $this.cakesFinished;

            var timeLeft = parseInt($this.getTime());

            // If < 10 seconds - bigger timer text & red color
            if (timeLeft <= 10) {
                var fontSize = parseInt( (100) - (timeLeft*7) );
                var style = "color:#F00;"
                    + " font-size:"+ fontSize +";";
                this.timerDisplay.setAttribute("style", style);
            }
            this.timerDisplay.innerHTML = timeLeft;

            var i;
            for (i = 0; i < $this.cups.length; i++) {
                $this.cups[i].draw($this.ctx);
            }
            $this.cursor.draw($this.ctx);
            $this.ctx_cake_stack.clearRect(0, 0, my.canvas_cake_stack.width, my.canvas_cake_stack.height);
            $this.ctx.font = "40pt ARia";
            for (i = 0; i < $this.animatedText.length; i++) {
                $this.animatedText[i].draw($this.ctx);
            }

            $this.ctx_cake_stack.clearRect(0, 0, my.canvas_cake_stack.width, my.canvas_cake_stack.height);
            //$this.background_left.draw($this.ctx_cake_stack);
            $this.cakeStack.draw($this.ctx_cake_stack);
        }

        this.gameOver = function() {
            var oldScore = $this.score;
            if ($this.cakesFinished > 0) {
                $this.score = $this.score * $this.cakesFinished
            }
            my.config.gameOverCallback($this.score);
        }
    }

    objects(my);

    return my;

}();
