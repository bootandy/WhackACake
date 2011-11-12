objects = function(gameobj){
    gameobj.CakeStack = function(cakeImage) {
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

                var y = gameobj.canvas_cake_stack.height - 100;
                y = y - cakeLayerHeightOverlay * $this.height;

                ctx_cake_stack.drawImage(cakeImage,
                        0, cakeLayerSourceHeight * $this.cakeTypeToDraw, cakeLayerSourceWidth, cakeLayerSourceHeight,
                        x, y, 100, cakeLayerHeight);

                $this.height++;
                $this.cakeTypeToDraw = -1;
            }
        };

        this.cleanCakeStack = function() {
            $this.ctx_cake_stack.clearRect(0, 0, gameobj.ctx_cake_stack.width, gameobj.ctx_cake_stack.height);
        };

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

    // Named Sprite constructors
    gameobj.SpriteFromImage = function(spriteImage) {
        return new gameobj.Sprite(null, null, spriteImage.width, spriteImage.height, spriteImage, 0, 0, null, null)
    }
    
    gameobj.SpriteFromWidthHeightAndImage = function(width, height, spriteImage) {
        return new gameobj.Sprite(null, null, width, height, spriteImage);
    }
    
    gameobj.SpriteAtXYFromImage = function(x, y, spriteImage) {
        return new gameobj.Sprite(x, y, spriteImage.width, spriteImage.height, spriteImage, 0, 0, null, null);
    }
    
    gameobj.SpriteAtXYWithWidthHeightFromImage = function(x, y, width, height, spriteImage) {
        return new gameobj.Sprite(x, y, width, height, spriteImage, 0, 0, null, null);
    }

    gameobj.Sprite = function(x, y, width, height, spriteImage, img_x, img_y, img_width, img_height) {
        var $this = this;
        this.coord = new gameobj.Coords(x, y);
        this.img_coords = new gameobj.Coords(img_x, img_y);
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

    gameobj.TransAnimation = function(startCoord, endCoord, duration){
        var $this = this;
        this.startCoord = startCoord;
        this.endCoord = endCoord;
        this.diff = endCoord.difference(startCoord);
        this.duration = duration;
        console.log("start time is: " + gameobj.frameCount);
        console.log("duration is: " + this.duration);
        this.startTime = gameobj.frameCount

        this.getLocation = function(){
            currentDuration = gameobj.frameCount - $this.startTime
            newX = startCoord.x + ($this.diff.x/$this.duration)*currentDuration;
            newY = startCoord.y + ($this.diff.y/$this.duration)*currentDuration;
            return new gameobj.Coords(newX, newY);
        }

        this.hasFinished = function(){
            return ($this.startTime + $this.duration) < gameobj.frameCount;
        }
    }


    /**
     * Takes a list of animations and repeats them in order.
     */
    gameobj.RepeatingAnimation = function(animations){
    }
    
    
    
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
    		ingredient.sprite.coord = this.sprite.coord.clone();
            ingredient.sprite.animation = new gameobj.TransAnimation($this.sprite.coord, 
                                                             $this.sprite.coord.add(new gameobj.Coords(0, -10)),
                                                             gameobj.getDurationInFrames(500));
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


    gameobj.Ingredient = function(sprite){
    	var $this = this;
    	this.sprite = sprite;
    	this.visible = false;
    	this.expiryTime = gameobj.frameCount + (2*1000.0)/gameobj.game.loopInterval;
    	this.wasHit = false;
    	
    	this.isExpired = function(){
    		if(this.wasHit || (this.expiryTime > 0 && gameobj.frameCount - this.expiryTime > 0)){
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
            this.expiryTime = gameobj.frameCount + value;
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

}
