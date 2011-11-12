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
            $this.cakeStack = new CakeStack($this.images.cakeLayers);
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
       	   	         cup.setIngredient(new Ingredient(new SpriteFromWidthHeightAndImage(50, 50, $this.images.choc))); // Choose a random ingredient
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
            $this.images.cup.src = "images/cup.jpeg";
            $this.images.choc = new Image();
            $this.images.choc.src = "images/chocolate.jpg";
            $this.images.cakeLayers = new Image();
            $this.images.cakeLayers.src = "images/cake_layers.png";
        }


        this.createIngredients = function() {
            var screenWidth = my.canvas.width;
            var screenHeight = my.canvas.height;

            var result = [];
        	var ingredient = new Ingredient(new SpriteFromWidthHeightAndImage($this.images.choc));
            result.push(ingredient);
        	return result;

        }


        this.createCups = function() {
            var screenWidth = my.canvas.width;
            var screenHeight = my.canvas.height;

            console.log('here');

            var result = new Array;
            result.push(new Cup(new SpriteAtXYWithWidthHeightFromImage (screenWidth / 4, screenHeight / 4, 50, 50, $this.images.cup)));
            result.push(new Cup(new SpriteAtXYWithWidthHeightFromImage(3 * screenWidth / 4, screenHeight / 4, 50, 50, $this.images.cup)));
            result.push(new Cup(new SpriteAtXYWithWidthHeightFromImage(screenWidth / 2, screenHeight / 2, 50, 50, $this.images.cup)));
            result.push(new Cup(new SpriteAtXYWithWidthHeightFromImage(screenWidth / 4, 3 * screenHeight / 4, 50, 50, $this.images.cup)));
            result.push(new Cup(new SpriteAtXYWithWidthHeightFromImage(3 * screenWidth / 4, 3 * screenHeight / 4, 50, 50, $this.images.cup)));
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

    var CakeStack = function(cakeImage) {
        $this = this;
        this.cakeImage = cakeImage;
        this.height = 0;
        this.cakeTypeToDraw = -1;

        this.addToCakeStack = function(type) {
            $this.cakeTypeToDraw = type;
        };

        this.draw = function(ctx_cake_stack) {
            // If we have a new layer to draw
            if ($this.cakeTypeToDraw != -1) {

                var x = 0;
                var cakeLayerHeight = 50;
                var cakeLayerHeightOverlay = 31; //we cover up the previous cake layer slightly
                var cakeLayerSourceHeight = 154;
                var cakeLayerSourceWidth = 300;

                var y = my.canvas_cake_stack.height - 100;
                y = y - cakeLayerHeightOverlay * $this.height;

                ctx_cake_stack.drawImage(cakeImage,
                        0, cakeLayerSourceHeight * $this.cakeTypeToDraw, cakeLayerSourceWidth, cakeLayerSourceHeight,
                        x, y, 100, cakeLayerHeight);

                $this.height++;
                $this.cakeTypeToDraw = -1;
            }
        };

        this.cleanCakeStack = function() {
            $this.ctx_cake_stack.clearRect(0, 0, my.ctx_cake_stack.width, my.ctx_cake_stack.height);
        };

    };

    var Coords = function(xParam, yParam) {
        this.x = xParam;
        this.y = yParam;

        this.clone = function() {
            return new Coords(this.x, this.y);
        }

        /**
         *returns the vector difference between this coord and other.
         */
        this.difference = function(other){
            return new Coords(this.x - other.x, this.y - other.y);
        }

        /**
         * Returns vector sum of this coord with other
         */
        this.add = function(other){
            return new Coords(other.x + this.x, other.y + this.y);
        }
    }

    // Named Sprite constructors
    var SpriteFromImage = function(spriteImage) {
        return new Sprite(null, null, spriteImage.width, spriteImage.height, spriteImage, 0, 0, null, null)
    }
    
    var SpriteFromWidthHeightAndImage = function(width, height, spriteImage) {
        return new Sprite(null, null, width, height, spriteImage);
    }
    
    var SpriteAtXYFromImage = function(x, y, spriteImage) {
        return new Sprite(x, y, spriteImage.width, spriteImage.height, spriteImage, 0, 0, null, null);
    }
    
    var SpriteAtXYWithWidthHeightFromImage = function(x, y, width, height, spriteImage) {
        return new Sprite(x, y, width, height, spriteImage, 0, 0, null, null);
    }

    var Sprite = function(x, y, width, height, spriteImage, img_x, img_y, img_width, img_height) {
        var $this = this;
        this.coord = new Coords(x, y);
        this.img_coords = new Coords(img_x, img_y);
        this.width = width;
        this.height = height;
        this.image_width = width;
        this.image_height = height;
        this.spriteImage = spriteImage;
        this.animation = null;

        this.draw = function(ctx) {
            var xPos = 0;
            var yPos = 0;
            if(this.animation){
                drawCoord = this.animation.getLocation();
                this.coord.x = drawCoord.x;
                this.coord.y = drawCoord.y;
                if(this.animation.hasFinished()){
                    this.animation = null;
                    console.log("finished");
                }
            }
            if (this.img_coords.x && this.img_coords.y) {
                ctx.drawImage(this.spriteImage,
                            this.img_coords.x, this.img_coords.y, this.image_width, this.image_height,
                            this.coord.x-this.width/2,
                            this.coord.y-this.height/2,
                            this.width,
                            this.height);
            } else {
                ctx.drawImage(this.spriteImage,
                        this.coord.x - this.width/2,
                        this.coord.y - this.height/2,
                        this.width,
                        this.height);
            }
        }

        this.isClickedOn = function(x, y) {
            if (( $this.coord.x - $this.width < x && $this.coord.x + $this.width > x )
                    && ( $this.coord.y - $this.height < y && $this.coord.y + $this.height > y )) {
                return true;
            }
            return false;
        }


    }

    var TransAnimation = function(startCoord, endCoord, duration){
        var $this = this;
        this.startCoord = startCoord;
        this.endCoord = endCoord;
        this.diff = endCoord.difference(startCoord);
        this.duration = duration;
        console.log("start time is: " + my.frameCount);
        console.log("duration is: " + this.duration);
        this.startTime = my.frameCount

        this.getLocation = function(){
            currentDuration = my.frameCount - $this.startTime
            newX = startCoord.x + ($this.diff.x/$this.duration)*currentDuration;
            newY = startCoord.y + ($this.diff.y/$this.duration)*currentDuration;
            return new Coords(newX, newY);
        }

        this.hasFinished = function(){
            return ($this.startTime + $this.duration) < my.frameCount;
        }
    }


    /**
     * Takes a list of animations and repeats them in order.
     */
    var RepeatingAnimation = function(animations){
    }
    
    
    
    /**
 	 *
 	 *	The cup object, holds a sprite for the rendering of the cup
 	 *	and an ingredient to draw
 	 *
 	 **/
    var Cup = function(sprite){
    	var $this = this;
    	this.sprite = sprite;
    	this.ingredient = null;
    	
    	this.setIngredient = function(ingredient){
    		ingredient.sprite.coord = this.sprite.coord.clone();
            ingredient.sprite.animation = new TransAnimation($this.sprite.coord, 
                                                             $this.sprite.coord.add(new Coords(0, -10)),
                                                             my.getDurationInFrames(500));
    		ingredient.sprite.coord = $this.sprite.coord.clone();
    		$this.ingredient = ingredient;
    	}
    	
    	this.updateState = function(){
    		if($this.ingredient && $this.ingredient.isExpired()){
    			$this.ingredient = null;
    		}
    	}
    	
    	this.draw = function(ctx){
    		this.sprite.draw(ctx);
	    	if(this.ingredient){
    			this.ingredient.draw(ctx);
    		}		
    	}
    	
    	this.hit = function() {
			score = $this.ingredient.getScore();
			this.ingredient.hit();
			return score;
    	}
    	
    	this.hasIngredient = function(){
    		return $this.ingredient;
    	}

    }


    var Ingredient = function(sprite){
    	var $this = this;
    	this.sprite = sprite;
    	this.visible = false;
    	this.expiryTime = my.frameCount + (2*1000.0)/my.game.loopInterval;
    	this.wasHit = false;
    	
    	this.isExpired = function(){
    		if(this.wasHit || (this.expiryTime > 0 && my.frameCount - this.expiryTime > 0)){
    			return true;
    		}
    		return false;
    	}
    	
    	this.draw = function(ctx){
    		if(!this.isExpired()){
    			this.sprite.draw(ctx);
    		}
    	}
    	
        this.setMaxDisplayTime = function(value){
            this.expiryTime = my.frameCount + value;
        }

        this.getScore = function() {
            // TODO
            return 5;
        }

        this.hit = function() {
            this.wasHit = true;
        }

        this.getType = function() {
            return 0;
        }
    }

    return my;

}();
