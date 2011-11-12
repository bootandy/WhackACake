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
            $this.loopInterval = 15
            my.frameCount = 0;
            $this.images = {};
            $this.loadImages();
            $this.cups = this.createCups();
            $this.ingredients = $this.createIngredients();
            $this.scoreDisplay = document.getElementById("game_score");
            $this.ctx = my.canvas.getContext('2d');
            my.canvas.addEventListener('click', $this.canvasClicked);
        }


        //Main game loop
        this.loop = function() {
			my.frameCount++;
            $this.score++;
            $this.updateState();
            $this.drawAll();
            setTimeout("whackacake.game.loop()", $this.loopInterval);
        }
        
        this.updateState = function(){
       		$this.cups[2].setIngredient($this.ingredients[0]); 
        }

        this.canvasClicked = function(e) {
            var i;
            for (i = 0; i < $this.cups.length; i++) {
                if ($this.cups[i].sprite.isClickedOn(e.x, e.y)) {
                    console.log("clicked on "+i);
                }
            }
        }

        this.loadImages = function(){
            $this.images.cup = new Image();
            $this.images.cup.src = "images/cup.jpeg";
            $this.images.choc = new Image();
            $this.images.choc.src = "images/chocolate.jpg";
        }

        
        this.createIngredients = function(){
        	var screenWidth = my.canvas.width;
            var screenHeight = my.canvas.height;
            
            var result = [];
        	result.push(new Ingredient(new Sprite(null, null, $this.images.choc)));
        	return result;
        }
        

        this.createCups = function() {
            var screenWidth = my.canvas.width;
            var screenHeight = my.canvas.height;

			console.log('here');

            var result = [];
            result.push(new Cup(new Sprite(screenWidth / 4, screenHeight / 4, $this.images.cup)));
            result.push(new Cup(new Sprite(3 * screenWidth / 4, screenHeight / 4, $this.images.cup)));
            result.push(new Cup(new Sprite(screenWidth / 2, screenHeight / 2, $this.images.cup)));
            result.push(new Cup(new Sprite(screenWidth / 4, 3 * screenHeight / 4, $this.images.cup)));
            result.push(new Cup(new Sprite(3 * screenWidth / 4, 3 * screenHeight / 4, $this.images.cup)));
            console.log(result);
            return result;
        }


        this.drawAll = function() {

            $this.ctx.clearRect(0, 0, my.canvas.width, my.canvas.height);

            this.scoreDisplay.innerHTML = my.frameCount;
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
        
        this.clone = function(){
        	return new Coords(this.x, this.y);
        }
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
        
        this.setXPos = function(value) {
        	this.coord.x = value;
        }
        
        this.setYPos = function(value) {
        	this.coord.y = value;
        }

        this.isClickedOn = function(x, y) {
            if (( this.coord.x - this.width < x && this.coord.x + this.width > x )
                    && ( this.coord.y - this.height < y && this.coord.y + this.height > y )) {
                return true;
            }
            return false;
        }
        

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
    		$this.ingredient = ingredient;
    	}
    	
    	this.updateState = function(){
    		if(this.ingredient.isExpired()){
    			this.ingredient = null;
    		}
    	}
    	
    	this.draw = function(ctx){
	    	if(this.ingredient){
    			this.ingredient.draw(ctx);
    		}
    		this.sprite.draw(ctx);		
    	}

    }
    
    
    
    /**
 	 *
 	 *	The cup object, holds a sprite for the rendering of the cup
 	 *	and an ingredient to draw
 	 *
 	 **/
    var Ingredient = function(sprite){
    	var $this = this;
    	this.sprite = sprite;
    	this.visible = false;
    	this.expiryTime = (2*1000.0)/my.game.loopInterval;
    	
    	this.isExpired = function(){
    		if(this.expiryTime > 0 && my.frameCount - this.expiryTime > 0){
    			return true;
    		}
    		return false;
    	}
    	
    	this.draw = function(ctx){
    		if(!this.isExpired()){
    			console.log("we expired");
    			this.sprite.draw(ctx);
    		}
    	}
    	
        this.setMaxDisplayTime = function(value){
            this.expiryTime = my.frameCount + value;
        }
    }

    return my;

}();
