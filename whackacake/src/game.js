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



var whackacake = function all() {
    my = {};


    my.init = function() {
        my.canvas = document.getElementById("c");
        my.canvas_cake_stack = document.getElementById("cake_stack");
        var screenWidth = 700;
        var screenHeight = 600;
        var cakeStackWidth = 100;

        var style = my.canvas.getAttribute("style");
        my.canvas.setAttribute("style", style + "; height:" + screenHeight + "; width:" + screenWidth + ";");
        my.canvas_cake_stack.setAttribute("style", style + "; height:" + screenHeight + "; width:" + cakeStackWidth + ";");

        my.canvas.height = screenHeight;
        my.canvas.width = screenWidth;
        my.canvas_cake_stack.height = screenHeight;
        my.canvas_cake_stack.width = cakeStackWidth;


        console.debug("canvas: " + style);

        my.game = new Game();
        my.game.init();
        my.game.loop();
    }

    /**
     * Returns the number of frames required for a delay of a given time
     */
    my.getDurationInFrames = function(milliseconds){
        return milliseconds / my.game.loopInterval;
    }



    ///---------------- objects ----------------

    var Game = function() {
        var $this = this;

        this.init = function() {
            $this.score = 0;
            $this.cakesFinished = 0;
            $this.loopInterval = 15;
            $this.startTime = new Date().getTime();
            // 1 per second - Actually, this is the expectation of the number of ingredients that should spawn in a frame.
            $this.spawnProbability = 3/100;
            my.frameCount = 0;
            $this.images = {};
            $this.loadImages();
            $this.cakeStack = new my.CakeStack($this.images.cakeLayers);
            $this.cups = this.createCups();
            $this.animatedText = [];
            $this.scoreDisplay = document.getElementById("game_score");
            $this.frameDisplay = document.getElementById("frames");
            $this.cakesDisplay = document.getElementById("cakes");
            $this.timerDisplay = document.getElementById("timer");
            $this.ctx = my.canvas.getContext('2d');
            $this.background = new my.Background(my.canvas.width,my.canvas.height,$this.images.background);
            my.canvas.addEventListener('click', $this.mouseDown);
            my.canvas.addEventListener("touchstart", $this.touchDown, false);
            my.canvas.addEventListener("touchmove", $this.touchMove, true);
            my.canvas.addEventListener("touchend", $this.touchUp, false);
            my.canvas.addEventListener("touchcancel", $this.touchUp, false);

            $this.ctx_cake_stack = my.canvas_cake_stack.getContext('2d');

        }


        //Main game loop
        this.loop = function() {
            my.frameCount++;
            $this.updateState();
            $this.drawAll();
            
            if (this.getTime() >= 0) {
                setTimeout("whackacake.game.loop()", $this.loopInterval);
            } else {
                this.gameOver();
            }
        }
        
        this.updateState = function(){
            
            if (Math.random() < $this.spawnProbability) {
                var cup = $this.getRandomCup()
                if (!cup.hasIngredient()) {
       	   	         cup.setIngredient(this.getRandomIngredient()); // Choose a random ingredient
       	   	    }
       		}
            $this.cups.forEach(function(c) { c.updateState(); });

            // Look at the first animatedText element - if it has finished we remove it.
            if ($this.animatedText.length > 0 && $this.animatedText[0].isFinished()) {
                $this.animatedText.shift();
            }
       }
        		
        this.mouseDown = function(e) {
            var mouseX = e.pageX;
            var mouseY = e.pageY;
            mouseX -= my.canvas.offsetLeft;
            mouseY -= my.canvas.offsetTop;

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
            return 41 - (new Date().getTime() - $this.startTime) /1000;
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
            var type = cup.hasIngredient().getType();
            $this.cakeStack.addToCakeStack(type);
            var scoreToAdd = cup.hit();

            var messageX = x - 50;
            var messageY = y - 50;
            var scoreMessage
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
            $this.images.cup = addImage("images/cup.jpeg", 50, 50);
            $this.images.ingredients = addImage("images/ingredients.png", 50, 50);
            $this.images.choc = new Image();
            $this.images.choc.src = "images/chocolate.jpg";
            for (i=0; i<10; i++) {
                $this.images["ingredient_"+i] = addImage("images/ing_"+i+".png", 50, 50);
                $this.images["cake_layer_"+i] = addImage("images/cl_"+i+".png", 100, 50);
            }
            $this.images.background = new Image;
            $this.images.background.src = "images/background.png";
        }


        this.incrementCakes = function() {
            $this.cakesFinished++;
        }


        this.createCups = function() {
            var screenWidth = my.canvas.width;
            var screenHeight = my.canvas.height;

            console.log('here');

            var result = new Array;
            result.push(new my.Cup(new my.Sprite(screenWidth / 4, screenHeight / 4, $this.images.cup)));
            result.push(new my.Cup(new my.Sprite(3 * screenWidth / 4, screenHeight / 4, $this.images.cup)));
            result.push(new my.Cup(new my.Sprite(screenWidth / 2, screenHeight / 2, $this.images.cup)));
            result.push(new my.Cup(new my.Sprite(screenWidth / 4, 3 * screenHeight / 4, $this.images.cup)));
            result.push(new my.Cup(new my.Sprite(3 * screenWidth / 4, 3 * screenHeight / 4, $this.images.cup)));
            console.log(result);
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
            $this.background.draw($this.ctx);
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

            $this.ctx.font = "40pt Calibri";
            for (i = 0; i < $this.animatedText.length; i++) {
                $this.animatedText[i].draw($this.ctx);
            }

            $this.ctx_cake_stack.clearRect(0, 0, my.canvas_cake_stack.width, my.canvas_cake_stack.height);
            
            $this.cakeStack.draw($this.ctx_cake_stack);
        }

        this.gameOver = function() {
            var oldScore = $this.score;
            if ($this.cakesFinished > 0) {
                $this.score = $this.score * $this.cakesFinished
            }
            alert("Game Over: Score: "+oldScore + " X Cakes Made: "+$this.cakesFinished+" = Final Score: "+ $this.score);
        }
    }
    
    objects(my);

    return my;

}();
