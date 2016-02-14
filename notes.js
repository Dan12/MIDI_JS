// Setup namespace
var Note_Space = new function() {
    
    this.init = function(editor, x, y, w, h, p){
        return new NoteHandler(editor, x, y, w, h, p);
    }
    
    var NoteHandler = function(editor, x, y, w, h, p){
        this.notes = [];
        this.visibleNotes = [];
        this.beatAt = 0;
        this.resolution = 1;
        this.PixelsPerSection = p;
        this.PixelsPerNote = x;
        this.PixelsPerBeat = this.PixelsPerSection/this.resolution;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.verticalOffset = 0;
        this.horizontalOffset = 0;
        this.selected = [];
        this.possibleNewNote = null;
        this.multiSelect = {};
        this.multiSelect.isActive = false;
        this.multiSelect.x = 0;
        this.multiSelect.y = 0;
        this.multiSelect.sx = 0;
        this.multiSelect.sy = 0;
        this.multiSelect.w = 0;
        this.multiSelect.h = 0;
        this.selectedMouseUp = true;
        
        var thisObj = this;
        editor.addEventListener('InputEvent', function (e) {thisObj.generalInput(e);}, false);
        
        console.log("New Note Handler created");
    }
    
    NoteHandler.prototype.generalInput = function(e){
        if(e.detail.mouseDown){
            var exit = false;
            if(!this.multiSelect.isActive){
                if(this.selected.length == 0){
                    for(var note in this.visibleNotes)
                        if(this.visibleNotes[note].mouseOver(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                            this.visibleNotes[note].selected = true;
                            this.selected.push(this.visibleNotes[note]);
                            this.selectedMouseUp = false;
                            exit = true;
                            break;
                        }
                }
                else{
                    if(!this.selectedMouseUp){
                        for(var note in this.selected)
                            this.selected[note].moveNote(e.detail.deltaX, e.detail.deltaY);
                        exit = true;
                    }
                    else{
                        for(var note in this.selected)
                            if(this.selected[note].mouseOver(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset))
                                this.selectedMouseUp = false;
                    }
                }
            }
            else{
                if(e.detail.mouseX-this.horizontalOffset > this.multiSelect.sx){
                    this.multiSelect.x=this.multiSelect.sx;
                    this.multiSelect.w=e.detail.mouseX-(this.multiSelect.x+this.horizontalOffset);
                }
                else{
                    this.multiSelect.x=e.detail.mouseX-this.horizontalOffset;
                    this.multiSelect.w=this.multiSelect.sx-this.multiSelect.x;
                }
                if(e.detail.mouseY-this.verticalOffset > this.multiSelect.sy){
                    this.multiSelect.y=this.multiSelect.sy;
                    this.multiSelect.h=e.detail.mouseY-(this.multiSelect.y+this.verticalOffset);
                }
                else{
                    this.multiSelect.y=e.detail.mouseY-this.verticalOffset;
                    this.multiSelect.h=this.multiSelect.sy-this.multiSelect.y;
                }
                console.log(this.multiSelect);
                // put selected ones into selected
                for(var note in this.visibleNotes){
                    console.log();
                    if(!this.visibleNotes[note].selected && this.visibleNotes[note].px+this.visibleNotes[note].pw > this.multiSelect.x && this.visibleNotes[note].px < this.multiSelect.x+this.multiSelect.w && this.visibleNotes[note].py+this.visibleNotes[note].height > this.multiSelect.y && this.visibleNotes[note].py < this.visibleNotes[note].y+this.visibleNotes[note].h){
                        this.selected.push(this.visibleNotes[note]);
                        this.visibleNotes[note].selected = true;
                    }
                }
            }
            
            if(!exit && this.selectedMouseUp && this.selected.length != 0){
                for(var note in this.selected)
                    this.selected[note].selected = false;
                this.selected = [];
                exit = true;
            }
            
            if(!exit && e.detail.mouseX > this.x && e.detail.mouseX < this.x+this.width && e.detail.mouseY > this.y && e.detail.mouseY < this.y+this.height)
                this.possibleNewNote = new Note(Math.floor((e.detail.mouseY-this.y-this.verticalOffset-5)/this.PixelsPerNote), Math.floor((e.detail.mouseX-this.x-this.horizontalOffset-4)/this.PixelsPerSection)*this.resolution, this.resolution, this.PixelsPerNote, this.PixelsPerBeat, this.x, this.y);
        }
        else{
            if(this.possibleNewNote != null){
                this.notes.push(this.possibleNewNote);
                this.visibleNotes.push(this.possibleNewNote);
                this.possibleNewNote = null;
                console.log(this.notes);  
            }
            this.selectedMouseUp = true;
            this.multiSelect.isActive = false;
        }
        
        if(e.detail.keyDown == 27){
            for(var note in this.selected)
                this.selected[note].selected = false;
            this.selected = [];
        }
        
        if(e.detail.mouseDrag){
            this.possibleNewNote = null;
            if(this.selected.length == 0 && !this.multiSelect.isActive){
                this.multiSelect.isActive = true;
                this.multiSelect.sx = e.detail.mouseX-this.horizontalOffset;
                this.multiSelect.sy = e.detail.mouseY-this.verticalOffset;
                this.multiSelect.x = e.detail.mouseX-this.horizontalOffset;
                this.multiSelect.y = e.detail.mouseY-this.verticalOffset;
                this.multiSelect.w = 0;
                this.multiSelect.h = 0;
            }
        }
        
        if(!e.detail.mouseDown || e.detail.mouseX < this.x || e.detail.mouseY < this.y || e.detail.mouseY > this.y+this.height){
            for(var note in this.selected)
                this.selected[note].mouseUp(this.resolution, this.PixelsPerNote, this.PixelsPerSection);
        }
        
        if(e.detail.doubleClick){
            for(var note in this.visibleNotes)
                if(this.visibleNotes[note].mouseOver(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                    this.notes.splice(this.notes.indexOf(this.visibleNotes[note]),1);
                    this.visibleNotes.splice(note,1);
                    break;
                }
            e.detail.doubleClick = false;
        }
    }
    
    NoteHandler.prototype.scroll = function(ho, vo){
        var dx = this.horizontalOffset-ho;
        var dy = this.verticalOffset-vo;
        this.horizontalOffset = ho;
        this.verticalOffset = vo;
        
        for(var note in this.selected)
            this.selected[note].moveNote(dx,dy);
        
        this.visibleNotes = [];
        for(var note in this.notes)
            if(this.notes[note].isVisible(this.x, this.y, this.width, this.height, this.horizontalOffset, this.verticalOffset))
                this.visibleNotes.push(this.notes[note]);
    }
    
    NoteHandler.prototype.draw = function(ctx){
        for(var note in this.visibleNotes)
            this.visibleNotes[note].draw(ctx, this.horizontalOffset, this.verticalOffset);
        if(this.multiSelect.isActive){
            ctx.globalAlpha=0.3;
            ctx.fillStyle = "rgb(50,50,240)";
            var multiY = this.multiSelect.y+this.verticalOffset;
            var multiH = this.multiSelect.h;
            if(multiY < this.y){
                multiH-=this.y-multiY;
                multiY = this.y;
            }
            ctx.fillRect(this.multiSelect.x+this.horizontalOffset, multiY, this.multiSelect.w, multiH);
            ctx.globalAlpha=1;
        }
    }
    
    NoteHandler.prototype.windowResize = function(w,h){
        
    }
    
    NoteHandler.prototype.play = function(bpm, sa){
        
    }
    
    NoteHandler.prototype.pause = function(){
        
    }
    
    NoteHandler.prototype.changeResolution = function(r){
        this.resolution = r;
        this.PixelsPerBeat = this.PixelsPerSection/this.resolution;
        for(var note in this.notes)
            this.notes[note].adjustLength(this.PixelsPerBeat, this.x);
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
        this.pw = ppb*this.length;
        this.selected = false;
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
    
    Note.prototype.mouseUp = function(r,ppn,pps){
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
        console.log(this);
    }
    
    Note.prototype.isVisible = function(x,y,w,h,ho,vo){
        if(this.px+this.pw+ho > x && this.px+ho < x+w && this.py+this.height+vo > y && this.py+vo < y+h)
            return true;
        return false;
    }
}