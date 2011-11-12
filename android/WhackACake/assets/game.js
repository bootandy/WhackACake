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
        var screenWidth = 500;
        var screenHeight = 400;
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
            $this.loopInterval = 15
            // 1 per second - Actually, this is the expectation of the number of ingredients that should spawn in a frame.
            $this.spawnProbability =   $this.loopInterval / 1000
            my.frameCount = 0;
            $this.images = {};
            $this.loadImages();
            $this.cakeStack = new my.CakeStack($this.images.cakeLayers);
            $this.cups = this.createCups();
            $this.ingredients = $this.createIngredients();
            $this.scoreDisplay = document.getElementById("game_score");
            $this.frameDisplay = document.getElementById("frames");
            $this.ctx = my.canvas.getContext('2d');
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
            setTimeout("whackacake.game.loop()", $this.loopInterval);
        }
        
        this.updateState = function(){
            
            if (Math.random() < $this.spawnProbability) {
                var cup = $this.getRandomCup()
                if (!cup.hasIngredient()) {
       	   	         cup.setIngredient(new my.Ingredient(new my.SpriteFromWidthHeightAndImage(50, 50, $this.images.choc))); // Choose a random ingredient
       	   	    }
       		}
			$this.cups.forEach(function(c) { c.updateState(); });
       }
        		
        this.mouseDown = function(e) {
            var mouseX = e.pageX;
            var mouseY = e.pageY;
            mouseX -= my.canvas.offsetLeft;
            mouseY -= my.canvas.offsetTop;

        	$this.canvasPressed(mouseX, mouseY);
        }
        
        this.touchDown = function(e) {
          if (!e) var e = event;
          e.preventDefault();
          touchX = e.targetTouches[0].pageX - my.canvas.offsetLeft;
          touchY = e.targetTouches[0].pageY - my.canvas.offsetTop;
          
          $this.canvasPressed(touchX,touchY);

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
        	        $this.clickedIngredient($this.cups[i]);
        	    }
        	}
        }
        
 

        this.clickedIngredient = function(cup) {
            var type = cup.hasIngredient().getType();
            $this.cakeStack.addToCakeStack(type);
            $this.score += cup.hit();
        }

        this.loadImages = function() {
            $this.images.cup = new Image();
            $this.images.cup.src = "file:///android_asset/images/cup.jpeg";
            $this.images.choc = new Image();
            $this.images.choc.src = "file:///android_asset/images/chocolate.jpg";
            $this.images.cakeLayers = new Image();
            $this.images.cakeLayers.src = "file:///android_asset/images/cake_layers.png";
        }


        this.createIngredients = function() {
            var screenWidth = my.canvas.width;
            var screenHeight = my.canvas.height;

            var result = [];
        	var ingredient = new my.Ingredient(new my.SpriteFromWidthHeightAndImage($this.images.choc));
            result.push(ingredient);
        	return result;

        }


        this.createCups = function() {
            var screenWidth = my.canvas.width;
            var screenHeight = my.canvas.height;

            console.log('here');

            var result = new Array;
            result.push(new my.Cup(new my.SpriteAtXYWithWidthHeightFromImage (screenWidth / 4, screenHeight / 4, 50, 50, $this.images.cup)));
            result.push(new my.Cup(new my.SpriteAtXYWithWidthHeightFromImage(3 * screenWidth / 4, screenHeight / 4, 50, 50, $this.images.cup)));
            result.push(new my.Cup(new my.SpriteAtXYWithWidthHeightFromImage(screenWidth / 2, screenHeight / 2, 50, 50, $this.images.cup)));
            result.push(new my.Cup(new my.SpriteAtXYWithWidthHeightFromImage(screenWidth / 4, 3 * screenHeight / 4, 50, 50, $this.images.cup)));
            result.push(new my.Cup(new my.SpriteAtXYWithWidthHeightFromImage(3 * screenWidth / 4, 3 * screenHeight / 4, 50, 50, $this.images.cup)));
            console.log(result);
            return result;
        }

        this.getRandomCup = function() {
          cup_idx = Math.floor(Math.random()*$this.cups.length)
          return $this.cups[cup_idx];
        }

        this.drawAll = function() {

            $this.ctx.clearRect(0, 0, my.canvas.width, my.canvas.height);

            this.scoreDisplay.innerHTML = $this.score;
            this.frameDisplay.innerHTML = my.frameCount;

            var i;
            for (i = 0; i < $this.cups.length; i++) {
                $this.cups[i].draw($this.ctx);
            }

            $this.cakeStack.draw($this.ctx_cake_stack);
        }
    }
    
    objects(my);

    return my;

}();
