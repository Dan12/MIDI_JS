// Setup namespace
var Note_Handler = new function() {
    
    // return new note handler
    this.init = function(editor, x, y, w, h, p, mk, m){
        return new NoteHandler(editor, x, y, w, h, p, mk, m);
    }
    
    /**
     * NoteHandler-creates and handles all of the notes as well 
     *      as being the parent object for all note activities
     * editor-html element of editor where input events are sent to
     * x-x position of note handler window
     * y-y position of note handler window
     * w-width of note handler window
     * h-height of note handler window
     * p-Pixels Per Section, constant set by parent
     * mn-maximun number of keys
     * m-midi editor to make calls for max width and midi playing
     *
     */
    var NoteHandler = function(editor, x, y, w, h, p, mk, m){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.PixelsPerSection = p;
        this.maxKeys = mk;
        this.midiEditor = m;
        
        // array of all notes in order by the beat that they start on
        this.notes = [];
        /* array of visible notes, containing references to the notes in the note array
         * used to eliminate searching through notes not on the screen for note actions
         * updated every time view window chanes (scrolling and resizing) 
         */
        this.visibleNotes = [];
        // beat at, used when playing and sets midi workspace scrub bar on play
        this.beatAt = 0;
        // resolution in beats per section
        this.resolution = 1;
        // pixels per note is keysize from midi workspace, which is the x position of the note handler window
        this.PixelsPerNote = x;
        // pixels per beat
        this.PixelsPerBeat = this.PixelsPerSection/this.resolution;
        
        // mirror midi workspace offsets
        this.verticalOffset = 0;
        this.horizontalOffset = 0;
        
        // array of references to selected notes
        this.selected = [];
        // object for drag window selector
        this.multiSelect = Multi_Select_Space.init();
        /* is the mouse up after a selection was made?, used to deselect on next click 
         * if none of the currently selected items is clicked
         * also used to make sure a new note isn't created when a selection 
         * is deselected by clicking on empty space
         */
        this.selectedMouseUp = true;
        // possible new note, only created if no mouse drag 
        // as that would indicate a drag window selctor
        this.possibleNewNote = null;
        
        // set to true when mouse down, set to false if mouse drag
        this.possibleDoubleClick = false;
        
        // -1-no resizing initialized, 0-no resizing, just draggin, 1-left edge resizing, 2-right edge resizing
        this.resizing = -1;
        // farthest note, used to set midi maximum width
        this.farthestNote = 0;
        // set to true to avoid going through selected notes every time there is a mouse move,
        // set to false for initial mouse down check
        this.selectedSet = false;
        
        // set generalInput function for note handler
        // moved to a sperate file due to size
        Set_Note_Handler_Input.init(NoteHandler);
        
        // save reference for changing the cursor
        // add event listener to editor and call local method to process input data
        this.editor = editor;
        var thisObj = this;
        this.editor.addEventListener('InputEvent', function (e) {thisObj.generalInput(e);}, false);
        
        // recording variables
        // interval for record update
        this.recordInterval = null;
        // start time to reset cursor to
        this.recordStartTime = 0;
        // keep track of beat start
        this.recordBeatStart = 0;
        // keep track of notes that have been pressed down but not released
        this.recordNoteStart = [];
        // store conversion unit so that it doesn't always have to be calculated
        this.MSToBeats = 0;
        // resolution, smallest unit editor is capable of handleing (1/128th of a beat)
        this.recordResolution = 128;
        
        // playing variables
        // interval for playing update
        this.playInterval = null;
        // number of milliseconds between play interval update
        this.playResolution = 4;
        // current notes playing but not finished
        this.notesPlaying = [];
        
        // redraw time in milliseconds during intervals
        this.intervalRedrawResolution = 40;
        
        // clipboard for copy and paste
        this.clipboard = [];
        this.clipboardStart = 0;
        
        // fast visible note search variables
        // beat of first note in view
        this.viewStartBeat = 0;
        // index of first note in view
        this.viewStartInd = 0;
        
        console.log("New Note Handler created");
    }
    
    // on mouse scroll
    NoteHandler.prototype.scroll = function(mx,my,ho, vo){
        // set offsets and change in offsets
        var dx = this.horizontalOffset-ho;
        var dy = this.verticalOffset-vo;
        this.horizontalOffset = ho;
        this.verticalOffset = vo;
        
        /* when dragging selected notes move them by the change in the offsets
         * change in offset used because absolute note positions are changing
         * make sure multiselect is not active because it adds notes to selected while dragging
         * make sure that selectedMouseUp is false, meaning that user is dragging and not just scrolling
         */
        if(!this.multiSelect.isActive && !this.selectedMouseUp)
            for(var note in this.selected)
                this.selected[note].moveNote(dx,dy);
                
        if(this.multiSelect.isActive)
            this.updateMulitSelect(mx,my);
        
        // reset visible notes array
        this.visibleNotes = [];
        
        // find the first beat in view
        var curBeat = -1*this.horizontalOffset/this.PixelsPerBeat;
        // if the index no longer matches up, something was deleted or moved
        if(this.viewStartInd >= this.notes.length)
            this.viewStartInd = this.notes.length == 0 ? 0 : this.notes.length-1;
            
        if(this.notes.length != 0){
            // if view has moved backwards, iterate backwards
            if(curBeat < this.viewStartBeat){
                while(this.viewStartInd >= 0){
                    // if we found a note behind the view, set it to the next note
                    if(this.notes[this.viewStartInd].beat+this.notes[this.viewStartInd].length < curBeat){
                        this.viewStartInd++;
                        break;
                    }
                    this.viewStartInd--;
                }
            }
            // view moved forwards
            else if(curBeat > this.viewStartBeat){
                while(this.viewStartInd <= this.notes.length-1){
                    // if we found a note in the view, set it to the next note
                    if(this.notes[this.viewStartInd].beat+this.notes[this.viewStartInd].length >= curBeat){
                        this.viewStartInd--;
                        break;
                    }
                    this.viewStartInd++;
                }
            }
            this.viewStartInd = Math.min(this.viewStartInd, this.notes.length-1);
            this.viewStartInd = Math.max(this.viewStartInd, 0);
            if(this.notes.length != 0)
                this.viewStartBeat = this.notes[this.viewStartInd].beat+this.notes[this.viewStartInd].length;
            // console.log(this.viewStartInd+","+this.viewStartBeat);
            
            
            // go through notes from begining of view window and add those in the note handler window to visibleNotes
            for(var note = this.viewStartInd; note < this.notes.length; note++){
                if(this.notes[note].isVisible(this.x, this.y, this.width, this.height, this.horizontalOffset, this.verticalOffset))
                    this.visibleNotes.push(this.notes[note]);
                // stop when out of window; can do this because we know that notes are in order by beats
                if(this.notes[note].beat >= curBeat+this.width/this.PixelsPerBeat);
            }
        }
    }
    
    NoteHandler.prototype.updateMulitSelect = function(mx, my){
        // update the drag selector object
        this.multiSelect.update(mx, my, this.horizontalOffset, this.verticalOffset);
        
        // put the notes in the selected area into the selected array
        for(var note in this.notes)
            // if a note is visible and was not yet selected, check if it is selected now
            if(!this.notes[note].selected && this.multiSelect.noteInMulti(this.notes[note])){
                this.selected.push(this.notes[note]);
                this.notes[note].selected = true;
            }
            
        for(var note in this.selected)
            // if a note was selected but is no longer in the selected area, remove it from the selected array
            if(this.selected[note].selected && !this.multiSelect.noteInMulti(this.selected[note])){
                this.selected[note].selected = false;
                this.selected.splice(note,1);
            }
    }
    
    // draw all visible notes and multiselect
    NoteHandler.prototype.draw = function(ctx){
        for(var note in this.visibleNotes)
            this.visibleNotes[note].draw(ctx, this.horizontalOffset, this.verticalOffset);
        this.multiSelect.draw(ctx, this.horizontalOffset, this.verticalOffset, this.y);
    }
    
    // adjust height and with on window resize
    NoteHandler.prototype.windowResize = function(w,h){
        this.width = w;
        this.height = h;
    }
    
    // resolution changed, update note pixel lengths and positions
    NoteHandler.prototype.changeResolution = function(r){
        this.resolution = r;
        this.PixelsPerBeat = this.PixelsPerSection/this.resolution;
        for(var note in this.notes)
            this.notes[note].adjustLength(this.PixelsPerBeat, this.x);
    }
    
    /* binary search to either find the index of the item in the array if findInsert is false
     * or finds the aporpriate insert position for the item in the array to keep the array
     * ordered by beat
     */
    NoteHandler.prototype.findNote = function(array, item, findInsert){
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
                if(findInsert)
                    return currentIndex;
                else{
                    for(var i = minIndex; i <= maxIndex; i++)
                        if(array[i] == item)
                            return i;
                    // stops infinite recursion if note is not found
                    minIndex++;
                }
            }
        }
        
        if(!findInsert){
            // this is bad
            console.log("Didn't find note");
            console.log(array);
            console.log(item);
            console.log(currentIndex+","+minIndex+","+maxIndex);
            console.log("***************** Critical Error! Didn't find note *****************");
        }
        return minIndex;
    }
    
    // start recording with given BPM and starting from beatAt
    // call redraw every 100ms
    NoteHandler.prototype.startRecording = function(BPM, beatAt){
        this.MSToBeats = BPM/60000;
        this.recordStartTime = new Date().getTime();
        this.recordBeatStart = beatAt;
        var thisObj = this;
        this.recordInterval = setInterval(function(){
            thisObj.beatAt = thisObj.recordBeatStart+thisObj.MSToBeats*(new Date().getTime()-thisObj.recordStartTime);
            
            // auto scroll screen
            var pixelsAt = thisObj.beatAt*thisObj.PixelsPerBeat;
            if(pixelsAt+thisObj.horizontalOffset >= thisObj.width/2 || pixelsAt+thisObj.horizontalOffset < 0)
                thisObj.midiEditor.canvasScroll(-1,-1,pixelsAt+thisObj.horizontalOffset-thisObj.width/2,0);
            
            thisObj.midiEditor.redrawAll();
        },thisObj.intervalRedrawResolution);
    }
    
    // stop recording interval, clear any started notes, and reset beatAt
    NoteHandler.prototype.stopRecording = function(){
        clearInterval(this.recordInterval);
        this.beatAt = this.recordBeatStart;
        this.recordNoteStart = [];
        return this.beatAt;
    }
    
    // check if note has already started to be recorded
    // if not, create a new temporary note
    NoteHandler.prototype.recordNoteDown = function(nInd){
        var noteStarted = false;
        
        for(var note in this.recordNoteStart)
            if(this.recordNoteStart[note].note == nInd)
                noteStarted = true;
        
        if(!noteStarted)
            this.recordNoteStart.push({"note":nInd,"sTime":new Date().getTime()});
    }
    
    // find the note, create a new note and add it to the editor,
    // then remove the note from the recordNoteStart array
    NoteHandler.prototype.recordNoteUp = function(nInd){
        var curTime = new Date().getTime();
        for(var n = 0; n < this.recordNoteStart.length; n++)
            if(this.recordNoteStart[n].note == nInd){
                // beat accuracy up to 1/32 of a beat
                this.addNewNote(Note_Space.createNote(nInd,Math.round((this.recordBeatStart+(this.recordNoteStart[n].sTime-this.recordStartTime)*this.MSToBeats)*this.recordResolution)/this.recordResolution,Math.max(Math.round((curTime-this.recordNoteStart[n].sTime)*this.MSToBeats*this.recordResolution)/this.recordResolution, 1/this.recordResolution), this.PixelsPerNote, this.PixelsPerBeat, this.x, this.y, this.maxKeys))
                this.recordNoteStart.splice(n,1);
                n--;
                break;
            }
    }
    
    // start playing interval
    NoteHandler.prototype.startPlaying = function(BPM, beatAt){
        this.MSToBeats = BPM/60000;
        var thisObj = this;
        var redrawCounter = 0;
        var startTime = new Date().getTime();
        var prevTime = new Date().getTime();
        var startBeat = beatAt;
        
        // find the start index of the player
        // works because notes are sorted by beat
        var playIndex = -1;
        for(var note in this.notes)
            if(this.notes[note].beat >= startBeat){
                playIndex = note;
                break;
            }
            
        // if the beat is after any current note starts
        // start from the begining
        if(playIndex == -1){
            playIndex = 0;
            startBeat = 0;
        }
        
        this.playInterval = setInterval(function(){
            // if no key needs to be set to up and all of the notes have started to play
            // beatAt is at the end of the song so stop playing
            if(thisObj.notesPlaying.length == 0 && playIndex >= thisObj.notes.length)
                thisObj.stopPlaying(true);
            
            // get the current time to be as accurate as possible
            var curTime = new Date().getTime();
            // set beatAt based on difference between start and end time
            thisObj.beatAt = startBeat+thisObj.MSToBeats*(new Date().getTime()-startTime);
            
            // auto scroll screen
            var pixelsAt = thisObj.beatAt*thisObj.PixelsPerBeat;
            if(pixelsAt+thisObj.horizontalOffset >= thisObj.width/2 || pixelsAt+thisObj.horizontalOffset < 0)
                thisObj.midiEditor.canvasScroll(-1,-1,pixelsAt+thisObj.horizontalOffset-thisObj.width/2,0);
            
            // go through all of the notes that have started to play and check if any of them 
            // have stopped playing (their beat+length is behind or at the player bar)
            // do this first in case of back to back notes, the key is released before it is pressed again
            for(var n = 0; n < thisObj.notesPlaying.length; n++)
                // if the note has stopped playing, send a key up message to player and remove note from playing notes
                if(thisObj.notes[thisObj.notesPlaying[n]].beat+thisObj.notes[thisObj.notesPlaying[n]].length <= thisObj.beatAt){
                    thisObj.midiEditor.playKeyUp(thisObj.notes[thisObj.notesPlaying[n]].note);
                    thisObj.notesPlaying.splice(n,1);
                    n--;
                }
            
            // increment through the notes array until the next note is after the position of the player
            while(playIndex < thisObj.notes.length){
                // only play note if player bar is on or past the note
                if(thisObj.notes[playIndex].beat <= thisObj.beatAt){
                    // keep track of notes that have started to play
                    thisObj.notesPlaying.push(playIndex);
                    thisObj.midiEditor.playKeyDown(thisObj.notes[playIndex].note);
                    
                    playIndex++;
                }
                // if the next note hasn't been played, break and wait for the next cycle
                else
                    break;
                    
                // // probably don't need
                // if(playIndex >= thisObj.notes.length || thisObj.notes[playIndex].beat > thisObj.beatAt)
                //     break;
            }
            
            // use this to redraw about every 100ms
            redrawCounter+=curTime-prevTime;
            prevTime = curTime;
            if(redrawCounter > thisObj.intervalRedrawResolution){
                redrawCounter-=thisObj.intervalRedrawResolution;
                thisObj.midiEditor.redrawAll();
            }
        },this.playResolution);
    }
    
    // stop playing interval and clear all of the currently playing notes
    NoteHandler.prototype.stopPlaying = function(end){
        clearInterval(this.playInterval);
        for(var note in this.notesPlaying)
            this.midiEditor.playKeyUp(this.notes[this.notesPlaying[note]].note);
        this.notesPlaying = [];
        if(end)
            this.midiEditor.stopPlaying({"text":"Stop","isDown":false});
    }
    
    // clear all notes
    NoteHandler.prototype.resetNotes = function(){
        this.selected = [];
        this.notes = [];
        this.visibleNotes = [];
    }
    
    // return all notes to save
    NoteHandler.prototype.getNotes = function(){
        return this.notes;
    }
    
    NoteHandler.prototype.setNotes = function(n){
        //console.log(n);
        this.notes = []
        for(var i in n)
            this.addNewNote(Note_Space.createNote(n[i].note, n[i].beat, n[i].length, this.PixelsPerNote, this.PixelsPerBeat, this.x, this.y, this.maxKeys));
        this.selected = [];
        this.visibleNotes = [];
        this.scroll(0,0,this.horizontalOffset,this.verticalOffset);
        this.midiEditor.redrawAll();
    }
    
    // create a new note and add it to visibleNotes and notes array
    NoteHandler.prototype.addNewNote = function(note){
        this.insertNote(note);
        this.visibleNotes.push(note);
    }
    
    // add note to notes array and check for new max width
    NoteHandler.prototype.insertNote = function(note){
        // this adds it at an index where, when added, the notes array will still be in order by beats
        this.notes.splice(this.findNote(this.notes, note, true), 0, note);
        if(note.px+note.pw > this.farthestNote){
            this.farthestNote = note.px+note.pw;
            this.midiEditor.setMaxWidth(this.farthestNote*this.resolution);
        }
    }
}