// Setup namespace
var Multi_Select_Space = new function(){
    
    this.init = function(){
        return new MultiSelect();
    }
    
    var MultiSelect = function(){
        this.isActive = false;
        this.x = 0;
        this.y = 0;
        this.sx = 0;
        this.sy = 0;
        this.w = 0;
        this.h = 0;
    }
    
    MultiSelect.prototype.startNew = function(mx, my, ho, vo){
        this.isActive = true;
        this.sx = mx-ho;
        this.sy = my-vo;
        this.x = this.sx;
        this.y = this.sy;
        this.w = 0;
        this.h = 0;
    }
    
    MultiSelect.prototype.update = function(mx, my, ho, vo){
        if(mx-ho > this.sx){
            this.x=this.sx;
            this.w=mx-(this.x+ho);
        }
        else{
            this.x=mx-ho;
            this.w=this.sx-this.x;
        }
        if(my-vo > this.sy){
            this.y=this.sy;
            this.h=my-(this.y+vo);
        }
        else{
            this.y=my-vo;
            this.h=this.sy-this.y;
        }
    }
    
    MultiSelect.prototype.noteInMulti = function(n){
        return (n.px+n.pw > this.x && n.px < this.x+this.w && n.py+n.height > this.y && n.py < this.y+this.h)
    }
    
    MultiSelect.prototype.draw = function(ctx, ho, vo, y){
        if(this.isActive){
            ctx.globalAlpha=0.3;
            ctx.fillStyle = "rgb(50,50,240)";
            var multiY = this.y+vo;
            var multiH = this.h;
            if(multiY < y){
                multiH-=y-multiY;
                multiY = y;
            }
            ctx.fillRect(this.x+ho, multiY, this.w, multiH);
            ctx.globalAlpha=1;
        }
    }
}