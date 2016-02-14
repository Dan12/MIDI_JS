// Setup namespace
var Note_Handler = new function() {
    
    // return new note handler
    this.init = function(editor, x, y, w, h, p, mk, m){
        return new NoteHandler(editor, x, y, w, h, p, mk, m);
    }
    
    var getNoteHandler = function(){
        return NoteHandler;
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
        
        console.log("New Note Handler created");
    }
    
    // on mouse scroll
    NoteHandler.prototype.scroll = function(ho, vo){
        // set offsets and change in offsets
        var dx = this.horizontalOffset-ho;
        var dy = this.verticalOffset-vo;
        this.horizontalOffset = ho;
        this.verticalOffset = vo;
        
        /* when dragging selected notes move them by the change in the offsets
         * change in offset used because absolute note positions are changing
         * make sure multiselect is not active because it adds notes to selected while dragging
         * make sure that selectedMouseUp is false, meaning that we are dragging and not just scrolling
         */
        if(!this.multiSelect.isActive && !this.selectedMouseUp)
            for(var note in this.selected)
                this.selected[note].moveNote(dx,dy);
        
        // TODO: make this run faster by initially checking by beat range of window
        // reset visible notes array
        this.visibleNotes = [];
        // go through notes and add those in the note handler window to visibleNotes
        for(var note in this.notes)
            if(this.notes[note].isVisible(this.x, this.y, this.width, this.height, this.horizontalOffset, this.verticalOffset))
                this.visibleNotes.push(this.notes[note]);
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
    
    // TODO: add functionality
    NoteHandler.prototype.play = function(bpm, scrubAt){
        
    }
    
    // TODO: add functionality
    NoteHandler.prototype.pause = function(){
        
    }
    
    // resolution changed, update note pixel lengths and positions
    NoteHandler.prototype.changeResolution = function(r){
        this.resolution = r;
        this.PixelsPerBeat = this.PixelsPerSection/this.resolution;
        for(var note in this.notes)
            this.notes[note].adjustLength(this.PixelsPerBeat, this.x);
    }
    
    // binary search for index of note based on the fact that the array should be in order
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
                // stops infinite recursion if note is not found
                minIndex++;
            }
        }
     
        // this is bad
        console.log("Didn't find");
        console.log(array);
        console.log(item);
        console.log(currentIndex+","+minIndex+","+maxIndex);
        alert("Critical Error! Didn't find note");
        return minIndex;
    }
    
    // binary search for note insertion index so that their beats are in numerical order
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