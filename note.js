// Setup namespace
var Note_Space = new function() {
    
    this.createNote = function(note,beat,length,h,ppb,xs,ys){
        return new Note(note,beat,length,h,ppb,xs,ys);
    }
    
    var Note = function(note,beat,length,h,ppb,xs,ys){
        this.note = note;
        this.beat = beat;
        this.length = length;
        this.height = h;
        this.px = ppb*this.beat+xs;
        this.py = h*this.note+ys;
        this.deltaX = 0;
        this.deltaY = 0;
        this.deltaWidth = 0;
        this.pw = ppb*this.length;
        this.selected = false;
        this.resizePadding = 5;
    }
    
    Note.prototype.draw = function(ctx, ho, vo){
        if(this.selected)
            ctx.fillStyle = "rgb(100,140,200)";
        else
            ctx.fillStyle = "rgb(168,214,238)";
        ctx.stokeStyle = "rgb(190,235,255)";
        
        var x = this.px+ho;
        var y = this.py+vo;
        var radius = 6;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + this.pw - radius, y);
        ctx.quadraticCurveTo(x + this.pw, y, x + this.pw, y + radius);
        ctx.lineTo(x + this.pw, y + this.height - radius);
        ctx.quadraticCurveTo(x + this.pw, y + this.height, x + this.pw - radius, y + this.height);
        ctx.lineTo(x + radius, y + this.height);
        ctx.quadraticCurveTo(x, y + this.height, x, y + this.height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
    
    Note.prototype.mouseOver = function(mx, my){
        if(mx > this.px && mx < this.px+this.pw && my > this.py && my < this.py+this.height)
            return true;
    }
    
    Note.prototype.adjustLength = function(ppb, xs){
        this.pw = ppb*this.length;
        this.px = this.beat*ppb+xs;
    }
    
    Note.prototype.moveNote = function(dx,dy){
        this.deltaX+=dx;
        this.deltaY+=dy;
        this.px+=dx;
        this.py+=dy;
    }
    
    Note.prototype.mouseUp = function(r,ppn,pps,ppb){
        var beatChange = Math.round(4*this.deltaX/pps)/4;
        var noteChange = Math.round(this.deltaY/ppn);
        this.px+=beatChange*pps-this.deltaX;
        this.py+=noteChange*ppn-this.deltaY;
        this.deltaX = 0;
        this.deltaY = 0;
        this.beat+=beatChange*r;
        this.note+=noteChange;
        if(this.beat < 0){
            this.px+=-this.beat*pps;
            this.beat = 0;
        }
        if(this.note < 0){
            this.py+=-this.note*ppn;
            this.note = 0;
        }
        
        var lengthChange = Math.round(4*this.deltaWidth/pps)/4;
        this.pw+=lengthChange*pps-this.deltaWidth;
        this.deltaWidth = 0;
        this.length+=lengthChange*r;
        if(this.length <= 0){
            this.length = r/4;
            this.pw = ppb*this.length;
        }
    }
    
    Note.prototype.rightResize = function(dx){
        if(this.pw+dx > 1){
            this.deltaWidth+=dx;
            this.pw+=dx;
        }
    }
    
    Note.prototype.leftResize = function(dx){
        if(this.pw-dx > 1){
            this.deltaX+=dx;
            this.px+=dx;
            this.deltaWidth-=dx;
            this.pw-=dx;
        }
    }
    
    Note.prototype.overLeftEdge = function(mx, my){
        if(this.pw > this.resizePadding*3 && mx > this.px && mx < this.px+this.resizePadding && my > this.py && my < this.py+this.height)
            return true;
        return false;
    }
    
    Note.prototype.overRightEdge = function(mx, my){
        if(this.pw > this.resizePadding*3 && mx > this.px+this.pw-this.resizePadding && mx < this.px+this.pw && my > this.py && my < this.py+this.height)
            return true;
        return false;
    }
    
    Note.prototype.isVisible = function(x,y,w,h,ho,vo){
        if(this.px+this.pw+ho > x && this.px+ho < x+w && this.py+this.height+vo > y && this.py+vo < y+h)
            return true;
        return false;
    }
}