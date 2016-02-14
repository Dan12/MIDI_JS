// Setup namespace
var Note_Space = new function() {
    
    // return a new note
    this.createNote = function(note,beat,length,h,ppb,xs,ys){
        return new Note(note,beat,length,h,ppb,xs,ys);
    }
    
    // TODO: make sure that note is created in bounds
    /**
     * A note
     * note-index of key code
     * beat-beat that note starts on
     * length-length in beats of note
     * h-height of note (midi keysize)
     * ppb-pixels per beat
     * xs-x start position of input handler window
     * ys-y start position of input handler window
     */
    var Note = function(note,beat,length,h,ppb,xs,ys){
        this.note = note;
        this.beat = beat;
        this.length = length;
        this.height = h;
        
        // set absolute pixel positions for the note's x and y position
        this.px = ppb*this.beat+xs;
        this.py = h*this.note+ys;
        
        // used to gauge relative changes to pixel values so that
        // the notes can snap to their correct positions
        this.deltaX = 0;
        this.deltaY = 0;
        this.deltaWidth = 0;
        
        // length in pixels
        this.pw = ppb*this.length;
        
        // is this pixel selected?
        this.selected = false;
        
        // minimum pixle length to be able to resize
        this.minResizePadding = 15;
        
        // radius of corner of the note
        this.radius = 6;
    }
    
    // draw note
    Note.prototype.draw = function(ctx, ho, vo){
        //darker color if selected
        if(this.selected)
            ctx.fillStyle = "rgb(100,140,200)";
        else
            ctx.fillStyle = "rgb(168,214,238)";
        ctx.stokeStyle = "rgb(190,235,255)";
        
        // adjust x and y for offsets
        var x = this.px+ho;
        var y = this.py+vo;
        
        // draw a rounded rect from x,y to x+width,y+height with a corner radius of radius
        ctx.beginPath();
        ctx.moveTo(x + this.radius, y);
        ctx.lineTo(x + this.pw - this.radius, y);
        ctx.quadraticCurveTo(x + this.pw, y, x + this.pw, y + this.radius);
        ctx.lineTo(x + this.pw, y + this.height - this.radius);
        ctx.quadraticCurveTo(x + this.pw, y + this.height, x + this.pw - this.radius, y + this.height);
        ctx.lineTo(x + this.radius, y + this.height);
        ctx.quadraticCurveTo(x, y + this.height, x, y + this.height - this.radius);
        ctx.lineTo(x, y + this.radius);
        ctx.quadraticCurveTo(x, y, x + this.radius, y);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
    
    // is the mouse over the note?
    Note.prototype.mouseOver = function(mx, my){
        if(mx > this.px && mx < this.px+this.pw && my > this.py && my < this.py+this.height)
            return true;
        return false;
    }
    
    // adjust the length and position of the note due to zooming (resolution change)
    Note.prototype.adjustLength = function(ppb, xs){
        this.pw = ppb*this.length;
        this.px = this.beat*ppb+xs;
    }
    
    // move the note because it is being dragged
    Note.prototype.moveNote = function(dx,dy){
        this.deltaX+=dx;
        this.deltaY+=dy;
        this.px+=dx;
        this.py+=dy;
    }
    
    // resize from the right by changing the length
    Note.prototype.rightResize = function(dx){
        if(this.pw+dx > 1){
            this.deltaWidth+=dx;
            this.pw+=dx;
        }
    }
    
    // resize from the left by changing the x position 
    // and the length by opposite amounts
    Note.prototype.leftResize = function(dx){
        if(this.pw-dx > 1){
            this.deltaX+=dx;
            this.px+=dx;
            this.deltaWidth-=dx;
            this.pw-=dx;
        }
    }
    
    // check if the mouse if over the left 3rd of the note
    Note.prototype.overLeftEdge = function(mx, my){
        if(this.pw > this.minResizePadding && mx > this.px && mx < this.px+this.pw/3 && my > this.py && my < this.py+this.height)
            return true;
        return false;
    }
    
    // check if th mouse if over the right 3rd of the note
    Note.prototype.overRightEdge = function(mx, my){
        if(this.pw > this.minResizePadding && mx > this.px+this.pw-this.pw/3 && mx < this.px+this.pw && my > this.py && my < this.py+this.height)
            return true;
        return false;
    }
    
    // if the mouse is up, the note has to snap and adjust its position
    Note.prototype.mouseUp = function(r,ppn,pps,ppb,mk){
        // calculate the change in the amount of section, rounded to one 4th of a section
        var beatChange = Math.round(4*this.deltaX/pps)/4;
        // calculate the note change (rounding means that if more that half was over, it would snap to that side)
        var noteChange = Math.round(this.deltaY/ppn);
        
        // adjust the x and y positions by adding the difference between the desired pixel change and the acutall pixel change
        this.px+=beatChange*pps-this.deltaX;
        this.py+=noteChange*ppn-this.deltaY;
        
        // reset the deltas
        this.deltaX = 0;
        this.deltaY = 0;
        
        // update the beat and the note
        // multiply beat change by resolution because beat change is in sections
        this.beat+=beatChange*r;
        this.note+=noteChange;
        
        // if the note is outside of its bounds, set its position to the bounds
        // note: no beat maximum bounds because editor resizes as more notes are added
        if(this.beat < 0){
            this.px+=-this.beat*pps;
            this.beat = 0;
        }
        if(this.note < 0){
            this.py+=-this.note*ppn;
            this.note = 0;
        }
        if(this.note >= mk){
            this.py+=(mk-1-this.note)*ppn;
            this.note = mk-1;
        }
        
        // calculate the change in length to one 4th of a section
        var lengthChange = Math.round(4*this.deltaWidth/pps)/4;
        this.pw+=lengthChange*pps-this.deltaWidth;
        this.deltaWidth = 0;
        // multiply by resolution because lengthChange is in sections
        this.length+=lengthChange*r;
        // length can't be less than 0 so make it 1/4 of the resolution
        if(this.length <= 0){
            this.length = r/4;
            this.pw = ppb*this.length;
        }
    }
    
    // is the note visible in the current note handler window
    Note.prototype.isVisible = function(x,y,w,h,ho,vo){
        if(this.px+this.pw+ho > x && this.px+ho < x+w && this.py+this.height+vo > y && this.py+vo < y+h)
            return true;
        return false;
    }
}