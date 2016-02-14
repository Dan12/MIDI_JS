// Setup namespace
var Note_Handler = new function() {
    
    this.init = function(editor, x, y, w, h, p, m){
        return new NoteHandler(editor, x, y, w, h, p, m);
    }
    
    var NoteHandler = function(editor, x, y, w, h, p, m){
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
        this.multiSelect = Multi_Select_Space.init();
        this.selectedMouseUp = true;
        this.editor = editor;
        this.resizing = -1;
        this.midiEditor = m;
        this.farthestNote = 0;
        this.selectedSet = false;
        
        var thisObj = this;
        this.editor.addEventListener('InputEvent', function (e) {thisObj.generalInput(e);}, false);
        
        console.log("New Note Handler created");
    }
    
    NoteHandler.prototype.generalInput = function(e){
        if(e.detail.mouseDown){
            var exit = false;
            if(!this.multiSelect.isActive){
                if(this.selected.length == 0){
                    for(var note = this.visibleNotes.length-1; note >= 0; note--)
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
                        if(this.resizing == -1)
                            for(var note in this.selected){
                                if(this.selected[note].overLeftEdge(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                                    this.resizing = 1;
                                    break
                                }
                                else if(this.selected[note].overRightEdge(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                                    this.resizing = 2;
                                    break;
                                }
                            }
                            
                        if(this.resizing == -1)
                            this.resizing = 0;
                        
                        for(var note in this.selected){
                            if(this.resizing == 1)
                                this.selected[note].leftResize(e.detail.deltaX)
                            else if(this.resizing == 2)
                                this.selected[note].rightResize(e.detail.deltaX)
                            else
                                this.selected[note].moveNote(e.detail.deltaX, e.detail.deltaY);
                        }
                        this.selectedSet = false;
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
                
                this.multiSelect.update(e.detail.mouseX, e.detail.mouseY, this.horizontalOffset, this.verticalOffset);
                
                // put selected ones into selected
                for(var note in this.visibleNotes){
                    if(!this.visibleNotes[note].selected && this.multiSelect.noteInMulti(this.visibleNotes[note])){
                        this.selected.push(this.visibleNotes[note]);
                        this.visibleNotes[note].selected = true;
                    }
                    if(this.visibleNotes[note].selected && !this.multiSelect.noteInMulti(this.visibleNotes[note])){
                        this.selected.splice(this.selected.indexOf(this.visibleNotes[note]),1);
                        this.visibleNotes[note].selected = false;
                    }
                }
                exit = true;
            }
            
            if(!exit && this.selectedMouseUp && this.selected.length != 0){
                for(var note in this.selected)
                    this.selected[note].selected = false;
                this.selected = [];
                exit = true;
            }
            
            if(!exit && this.selectedMouseUp && e.detail.mouseX > this.x && e.detail.mouseX < this.x+this.width && e.detail.mouseY > this.y && e.detail.mouseY < this.y+this.height)
                this.possibleNewNote = Note_Space.createNote(Math.floor((e.detail.mouseY-this.y-this.verticalOffset)/this.PixelsPerNote), Math.floor((e.detail.mouseX-this.x-this.horizontalOffset)/this.PixelsPerSection)*this.resolution, this.resolution, this.PixelsPerNote, this.PixelsPerBeat, this.x, this.y);
                //this.possibleNewNote = Note_Space.createNote(Math.floor((e.detail.mouseY-this.y-this.verticalOffset-5)/this.PixelsPerNote), Math.floor((e.detail.mouseX-this.x-this.horizontalOffset-4)/this.PixelsPerSection)*this.resolution, this.resolution, this.PixelsPerNote, this.PixelsPerBeat, this.x, this.y);
        }
        else{
            if(this.possibleNewNote != null){
                this.notes.splice(this.findNoteInsert(this.notes, this.possibleNewNote), 0, this.possibleNewNote);
                this.visibleNotes.push(this.possibleNewNote);
                if(this.possibleNewNote.px+this.possibleNewNote.pw > this.farthestNote){
                    this.farthestNote = this.possibleNewNote.px+this.possibleNewNote.pw;
                    this.midiEditor.setMaxWidth(this.farthestNote*this.resolution);
                }
                this.possibleNewNote = null;
            }
            this.selectedMouseUp = true;
            this.multiSelect.isActive = false;
            this.resizing = -1;
            
            var changeCursor = false;
            for(var i = this.selected.length-1; i >= 0; i--)
                if(this.selected[i].mouseOver(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                    if(this.selected[i].overLeftEdge(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset) || this.selected[i].overRightEdge(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                        $(this.editor).css("cursor","col-resize");
                        changeCursor = true;
                    }
                    break;
                }
            if(!changeCursor)
                $(this.editor).css("cursor","default");
        }
        
        if(e.detail.keyDown == 27){
            for(var note in this.selected)
                this.selected[note].selected = false;
            this.selected = [];
        }
        else if(e.detail.keyDown == 8){
            for(var note in this.selected){
                this.notes.splice(this.notes.indexOf(this.selected[note]),1);
                var visInd = this.visibleNotes.indexOf(this.selected[note]);
                if(visInd != -1)
                    this.visibleNotes.splice(visInd,1);
            }
            this.selected = [];
        }
        
        if(e.detail.mouseDrag){
            this.possibleNewNote = null;
            if(this.selected.length == 0 && !this.multiSelect.isActive && e.detail.mouseY > this.y){
                this.multiSelect.startNew(e.detail.mouseX, e.detail.mouseY, this.horizontalOffset, this.verticalOffset);
            }
        }
        
        if(!e.detail.mouseDown || e.detail.mouseX < this.x || e.detail.mouseY < this.y || e.detail.mouseY > this.y+this.height){
            if(!this.selectedSet){
                for(var note in this.selected)
                    this.notes.splice(this.findNote(this.notes,this.selected[note]),1);
                
                // TODO: check for new max width
                for(var note in this.selected){
                    this.selected[note].mouseUp(this.resolution, this.PixelsPerNote, this.PixelsPerSection, this.PixelsPerBeat);
                    this.notes.splice(this.findNoteInsert(this.notes,this.selected[note]),0,this.selected[note]);
                }
                this.selectedSet = true;
            }
        }
        
        if(e.detail.doubleClickConsumes > 0){
            for(var note = this.visibleNotes.length-1; note >= 0; note--)
                if(this.visibleNotes[note].mouseOver(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                    this.notes.splice(this.notes.indexOf(this.visibleNotes[note]),1);
                    this.visibleNotes.splice(note,1);
                    this.selected.splice(this.selected.indexOf(this.visibleNotes[note]),1);
                    break;
                }
            e.detail.doubleClickConsumes--;
        }
        
        // use this to make sure that the notes array is in order
        // var arrStr = "";
        // for(var note in this.notes)
        //     arrStr+=this.notes[note].beat+",";
        // console.log(arrStr);
    }
    
    NoteHandler.prototype.scroll = function(ho, vo){
        var dx = this.horizontalOffset-ho;
        var dy = this.verticalOffset-vo;
        this.horizontalOffset = ho;
        this.verticalOffset = vo;
        
        if(!this.multiSelect.isActive && !this.selectedMouseUp)
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
        // if(this.multiSelect.isActive){
        //     ctx.globalAlpha=0.3;
        //     ctx.fillStyle = "rgb(50,50,240)";
        //     var multiY = this.multiSelect.y+this.verticalOffset;
        //     var multiH = this.multiSelect.h;
        //     if(multiY < this.y){
        //         multiH-=this.y-multiY;
        //         multiY = this.y;
        //     }
        //     ctx.fillRect(this.multiSelect.x+this.horizontalOffset, multiY, this.multiSelect.w, multiH);
        //     ctx.globalAlpha=1;
        // }
        this.multiSelect.draw(ctx, this.horizontalOffset, this.verticalOffset, this.y);
    }
    
    NoteHandler.prototype.windowResize = function(w,h){
        this.width = w;
        this.height = h;
    }
    
    NoteHandler.prototype.play = function(bpm, scrubAt){
        
    }
    
    NoteHandler.prototype.pause = function(){
        
    }
    
    NoteHandler.prototype.changeResolution = function(r){
        this.resolution = r;
        this.PixelsPerBeat = this.PixelsPerSection/this.resolution;
        for(var note in this.notes)
            this.notes[note].adjustLength(this.PixelsPerBeat, this.x);
    }
    
    // binary search method
    NoteHandler.prototype.findNote = function(array, item) {
 
        var minIndex = 0;
        var maxIndex = array.length - 1;
        var currentIndex;
        var currentElement;
     
        while (minIndex <= maxIndex) {
            currentIndex = (minIndex + maxIndex) / 2 | 0;
            currentElement = array[currentIndex];
     
            if (currentElement.beat < item.beat) {
                minIndex = currentIndex + 1;
            }
            else if (currentElement.beat > item.beat) {
                maxIndex = currentIndex - 1;
            }
            else {
                for(var i = minIndex; i <= maxIndex; i++)
                    if(array[i] == item)
                        return i;
                minIndex++;
            }
        }
     
        console.log("Didn't find");
        return minIndex;
    }
    
    // binary search method
    NoteHandler.prototype.findNoteInsert = function(array, item) {
 
        var minIndex = 0;
        var maxIndex = array.length - 1;
        var currentIndex;
        var currentElement;
     
        while (minIndex <= maxIndex) {
            currentIndex = (minIndex + maxIndex) / 2 | 0;
            currentElement = array[currentIndex];
     
            if (currentElement.beat < item.beat) {
                minIndex = currentIndex + 1;
            }
            else if (currentElement.beat > item.beat) {
                maxIndex = currentIndex - 1;
            }
            else {
                return currentIndex;
            }
        }
     
        return minIndex;
    }
}