// Setup namespace
var Multi_Select_Space = new function(){
    
    // return new multi select
    this.init = function(){
        return new MultiSelect();
    }
    
    /**
     * MulitSelect-allows you to drag on the note handler window 
     *      and select multiple notes
     * x-x position of top left corner
     * y-y position of top left corner
     * sx-start x position, used as a reference when dragging in the negative direction
     * sy-start y position, used as a reference when dragging in the negative direction
     * w-width
     * h-height
     */
    var MultiSelect = function(){
        this.isActive = false;
        this.x = 0;
        this.y = 0;
        this.sx = 0;
        this.sy = 0;
        this.w = 0;
        this.h = 0;
    }
    
    // create new multiselect at specified points
    MultiSelect.prototype.startNew = function(mx, my, ho, vo){
        this.isActive = true;
        this.sx = mx-ho;
        this.sy = my-vo;
        this.x = this.sx;
        this.y = this.sy;
        this.w = 0;
        this.h = 0;
    }
    
    // update positions
    // make sure that the width and height values aren't negative
    MultiSelect.prototype.update = function(mx, my, ho, vo){
        // if the mouse x is to the right of the start x
        // update the width
        if(mx-ho > this.sx){
            this.x=this.sx;
            this.w=mx-(this.x+ho);
        }
        // if the mouse x is to the left of the start x
        // update the x position and width so that the right edge of the area is at sx
        else{
            this.x=mx-ho;
            this.w=this.sx-this.x;
        }
        // if the mouse y is to the right of the start y
        // update the height
        if(my-vo > this.sy){
            this.y=this.sy;
            this.h=my-(this.y+vo);
        }
        // if the mouse y is to the left of the start y
        // update the y position and height so that the bottom edge of the area is at sy
        else{
            this.y=my-vo;
            this.h=this.sy-this.y;
        }
    }
    
    // check if a note n is intersecting the multiselect area
    MultiSelect.prototype.noteInMulti = function(n){
        return (n.px+n.pw > this.x && n.px < this.x+this.w && n.py+n.height > this.y && n.py < this.y+this.h)
    }
    
    // if the multiselect is active, draw it
    MultiSelect.prototype.draw = function(ctx, ho, vo, y){
        if(this.isActive){
            // make it transparent
            ctx.globalAlpha=0.3;
            ctx.fillStyle = "rgb(50,50,240)";
            var multiY = this.y+vo;
            var multiH = this.h;
            // if the area is outside of the input handler window
            // resize the visible portion of the area to fit inside of the input handler window
            if(multiY < y){
                multiH-=y-multiY;
                multiY = y;
            }
            if(multiH > 0)
                ctx.fillRect(this.x+ho, multiY, this.w, multiH);
            ctx.globalAlpha=1;
        }
    }
}