objects = function(gameobj){
    gameobj.CakeStack = function(cakeImage) {
        $this = this;
        this.cakeImage = cakeImage;
        // we have a 2D array of cake slicers: ie we save all our old cakes
        this.cakeSlices = [];
        $this.cakeSlices[0] = [];

        this.addToCakeStack = function(type) {

            // If we have finished a cake - 5 cake slices
            if ($this.cakeSlices[gameobj.game.cakesFinished].length == 5) {
                // slide cakes away
                $this.slideAway($this.cakeSlices[gameobj.game.cakesFinished]);

                gameobj.game.incrementCakes();
                $this.cakeSlices[gameobj.game.cakesFinished] = [];
            }

            var cakeLayerHeightOverlay = 31;

            var cakeLayerHeight = 50;
            var cakeLayerWidth = 100; // TODO
            var x = 50;
            var y = gameobj.canvas_cake_stack.height - 100;
            y = y - cakeLayerHeightOverlay * $this.cakeSlices[gameobj.game.cakesFinished].length;

            var s = new gameobj.Sprite(
                    x, y,
                    gameobj.game.images["cake_layer_"+type]
            );

            $this.cakeSlices[gameobj.game.cakesFinished].push(new gameobj.CakeSlice(s));
        };

        this.draw = function(ctx_cake_stack) {
            var i;
            for(i =0; i < $this.cakeSlices.length; i++) {
                for(j =0; j < $this.cakeSlices[i].length; j++) {
                    $this.cakeSlices[i][j].draw(ctx_cake_stack);
                }
            }
        };

        this.slideAway = function(cake_list) {
            for(j =0; j < cake_list.length; j++) {
                cake_list[j].slideAway();
            }
        }

    };

    gameobj.Coords = function(xParam, yParam) {
        this.x = xParam;
        this.y = yParam;

        this.clone = function() {
            return new gameobj.Coords(this.x, this.y);
        }

        /**
         *returns the vector difference between this coord and other.
         */
        this.difference = function(other){
            return new gameobj.Coords(this.x - other.x, this.y - other.y);
        }

        /**
         * Returns vector sum of this coord with other
         */
        this.add = function(other){
            return new gameobj.Coords(other.x + this.x, other.y + this.y);
        }
    }


    gameobj.AnimatedText = function(x, y, animation, str) {
        var $this = this;
        this.coord = new gameobj.Coords(x, y);
        this.animation = animation;
        this.animation.start();
        this.str = str;

        this.draw = function(ctx) {
            drawCoord = this.animation.getLocation();
            this.coord.x = drawCoord.x;
            this.coord.y = drawCoord.y;

            // If the animation has finished we dont draw it
            if (this.animation.hasFinished()){
                return true;
            }

            ctx.fillText($this.str, $this.coord.x, $this.coord.y );
            return false;
        }

        // if the animation is finished mark this object for removal
        this.isFinished = function() {
            return this.animation.hasFinished();
        }
    }

    gameobj.Sprite = function(x, y, spriteImage) {
        var $this = this;
        this.coord = new gameobj.Coords(x, y);
        this.width = spriteImage.width;
        this.height = spriteImage.height;
        this.spriteImage = spriteImage;
        this.animation = null;

        this.draw = function(ctx) {
        
            // If we have moved off the left of the screen dont draw anything
            if ($this.coord.x + $this.width/2 < 0) {
                return;
            }

            if(this.animation){
                drawCoord = this.animation.getLocation();
                this.coord.x = drawCoord.x;
                this.coord.y = drawCoord.y;
                if(this.animation.hasFinished()){
                    this.animation = null;
                    console.log("finished");
                }
            }


            ctx.drawImage(this.spriteImage,
                    Math.floor(this.coord.x - this.width/2),
                    Math.floor(this.coord.y - this.height/2),
                    this.width,
                    this.height);
        }

        this.isClickedOn = function(x, y) {
            if (( $this.coord.x - $this.width < x && $this.coord.x + $this.width > x )
                    && ( $this.coord.y - $this.height < y && $this.coord.y + $this.height > y )) {
                return true;
            }
            return false;
        }


    }

    gameobj.TransAnimation = function(startCoord, endCoord, duration, interpolator){
        var $this = this;
        this.startCoord = startCoord;
        this.endCoord = endCoord;
        this.diff = endCoord.difference(startCoord);
        this.duration = duration;
        this.startTime = 0;
        if(typeof(interpolator) == 'undefined'){
            this.interpolator = function(currentTime, duration){return currentTime/duration;}
        }else{
            this.interpolator = interpolator;
        }

        /**
         * Starts the animation at the current time unless start time is passed in,
         * in which case the animation is started at startTime.
         */
        this.start = function(startTime){
            if(typeof(startTime) == 'undefined'){
                this.startTime = gameobj.frameCount;
            }
            else $this.startTime = startTime;
        }

        this.getLocation = function(){
            currentDuration = gameobj.frameCount - $this.startTime
            newX = startCoord.x + $this.diff.x * $this.interpolator(currentDuration, $this.duration); //($this.diff.x/$this.duration)*currentDuration;
            newY = startCoord.y + $this.diff.y * $this.interpolator(currentDuration, $this.duration); //($this.diff.y/$this.duration)*currentDuration;
            return new gameobj.Coords(newX, newY);
        }

        this.hasFinished = function(){
            return ($this.startTime + $this.duration) < gameobj.frameCount;
        }
    }


    /**
     * Takes an array of animations and executes them in order,
     * every animation must have a positive duration property.
     */
    gameobj.AnimationCollection = function(animations){
        var $this = this;
        this.animations = animations;
        this.startTime = 0;

        this.start = function(startTime){
            $this.activeIndex = 0;
            $this.animations[$this.activeIndex].start(startTime);
        }

        this.hasFinished = function(){
            var currentDuration = gameobj.frameCount - $this.startTime;
            if($this.activeIndex == $this.animations.length - 1
                    && $this.animations[$this.activeIndex].hasFinished()){
                return true;
            } 
            return false;
        }

        this.getLocation = function(){
            if($this.activeIndex == $this.animations.length - 1){
                return $this.animations[$this.activeIndex].getLocation();
            }
            if($this.animations[$this.activeIndex].hasFinished()){
                $this.activeIndex += 1;
                //Add one loopinterval to starttime because we are behind by one timestep
                $this.animations[$this.activeIndex].start()//.start(gameobj.frameCount + gameobj.game.loopInterval);
            } 
            return $this.animations[$this.activeIndex].getLocation();
        }
    }


    /**
     * Takes an animation and repeats i indefinitely.
     */
    gameobj.RepeatingAnimation = function(animation){
        var $this = this;
        $this.animation = animation;

        this.start = function(startTime){
            $this.animation.start(startTime);
        }

        this.getLocation = function(){
            if($this.animation.hasFinished()){
                $this.animation.start(gameobj.frameCount + gameobj.game.loopInterval);
            }
            return $this.animation.getLocation();
        }
    }
    
    gameobj.CakeSlice = function(sprite){
    	var $this = this;
        this.sprite = sprite;
        this.sprite.animation = new gameobj.TransAnimation(new gameobj.Coords(50, 0),
                                                             $this.sprite.coord,
                                                             gameobj.getDurationInFrames(500));
        this.sprite.animation.start();
        
        this.draw = function(ctx){
            this.sprite.draw(ctx);
        }

        this.slideAway = function() {
            this.sprite.animation = new gameobj.TransAnimation($this.sprite.coord,
                                                                    new gameobj.Coords(-100, $this.sprite.coord.y),
                                                                    gameobj.getDurationInFrames(1000));
            this.sprite.animation.start();
        }
    };

    
    /**
 	 *
 	 *	The cup object, holds a sprite for the rendering of the cup
 	 *	and an ingredient to draw
 	 *
 	 **/
    gameobj.Cup = function(sprite){
    	var $this = this;
    	this.sprite = sprite;
    	this.ingredient = null;
    	
    	this.setIngredient = function(ingredient){
            ingredient.setAnimation($this.getIngredientAnimation());
            $this.ingredient = ingredient;
   	    }

        this.getIngredientAnimation = function(){
            var interpolator = function(currentTime, duration){return Math.pow(currentTime/duration, 3);};
            var startPoint = $this.sprite.coord.clone();
            var endPoint = $this.sprite.coord.add(new gameobj.Coords(0, -10));
            var duration = gameobj.getDurationInFrames(250);
            var upAnimation = new gameobj.TransAnimation(startPoint, endPoint, duration, interpolator);
            var downAnimation = new gameobj.TransAnimation(endPoint, startPoint, duration, interpolator);
            return new gameobj.AnimationCollection([upAnimation, downAnimation]);
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
			return this.ingredient.hit();
    	}
    	
    	this.hasIngredient = function(){
    		return $this.ingredient;
    	}

    }


    gameobj.Ingredient = function(type_no){
    	var $this = this;
    	this.type_no = type_no;
    	console.log(type_no);
    	this.sprite = new gameobj.Sprite(null, null, gameobj.game.images["ingredient_"+type_no]);
    	this.visible = false;

        // getTime returns 40 - 0
        // expiryTime is in range: random(2000) + 2250 ->  250
        this.createTime = new Date().getTime();
        this.expiryTime = new Date().getTime()
                + parseInt(Math.random() * (gameobj.game.getTime() * 50)) + gameobj.game.getTime() * 50 + 250;
        
    	this.wasHit = false;
    	
    	this.isExpired = function(){
    		if(this.wasHit || (this.expiryTime <  new Date().getTime())) {
    			return true;
    		}
    		return false;
    	}
    	
    	this.draw = function(ctx){
    		if(!this.isExpired()){
    			this.sprite.draw(ctx);
    		}
    	}

        this.setAnimation = function(animation){
            $this.sprite.animation = animation;
            $this.sprite.animation.start();
        }
    	

        this.hit = function() {
            this.wasHit = true;
            gameobj.game.cakeStack.addToCakeStack(type_no);
            if (type_no > 4) {
                return 100 + $this.hitFastBonus();
            } else {
                return - 50;
            }
        }
        
        this.hitFastBonus = function() {
            // up to a 100 point bonus for being quick
            return parseInt( Math.max(this.createTime - new Date().getTime()  + 4000, 0) / 40 );
        }

    }
    
    gameobj.Background = function(width,height,backgroundImage){
    	var $this = this;
      $this.width = width;
      $this.height = height;
      $this.backgroundImage = backgroundImage;
      $this.draw = function(ctx) {
            var xPos = 0;
            var yPos = 0;
            ctx.drawImage(this.backgroundImage,
            1,
            1,
            this.width,
            this.height);
      }
    }
    gameobj.Cursor = function(canvasX,canvasY,width,height,cursorImage){
    	var $this = this;
      $this.x = 0;
      $this.y = 0;
      $this.canvasX = canvasX;
      $this.canvasY = canvasY;
      $this.width = width;
      $this.height = height;
      $this.cursorImage = cursorImage;
      $this.getCursorPosition = function(e) {
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

      $this.draw = function(ctx, ctx_cakes) {
            if( this.x < $this.canvasX ) { 
              ctx_cakes.drawImage(this.cursorImage,
              this.x,
              this.y,
              this.width,
              this.height);
            } else {
              ctx.drawImage(this.cursorImage,
              this.x - $this.canvasX,
              this.y - $this.canvasY,
              this.width,
              this.height);
            }
      }

      $this.setPosition = function(e) {
        var $mousePostion = $this.getCursorPosition(e);
        $this.x = $mousePostion.x ;
        $this.y = $mousePostion.y - $this.canvasY;
      }
    }
}

