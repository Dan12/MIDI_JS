// Setup editor namespace
// can have private and public methods/functions/classes
var MIDI_Editor = new function() {
    
    // editor height and width subtract from window dims
    var widthSub = 100;
    var heightSub = 160;
    
    // minimum width and height
    var minHeight = 200;
    var minWidth = 900;
    
    // height of header
    var headerHeight = 80;
    
    // init function for namespace
    // returns a new editor
    this.init = function(append_to, player){
        return new Editor(append_to, player);
    }
    
    /**
     * editor constructor
     * append_to-html element to append new editor canvas to
     * player-player object linked to editor, must have methods called midiKeyUp, midiKeyDown, and linkEditor
     *      and invokes editor methods recordKeyDown and recordKeyUp
     */
    var Editor = function(append_to, player){
        // store reference to player object
        this.player = player;
        
        // create editor canvas
        $(append_to).append('<div class="editor_container"><canvas class="editor_canvas">Your browser does not support the HTML5 canvas tag.</canvas></div>');
        var editors = document.getElementsByClassName("editor_canvas");
        this.canvas = editors[editors.length-1];
        this.context = this.canvas.getContext("2d");
        
        // initialize Input Events object
        Input_Events.init(this.canvas);
        
        // set the dimensions
        this.setDimensions();
        
        // initialize a new midi workspace
        this.midiWorkspace = MIDI.init(this.canvas, this.width, this.height, headerHeight, this);
        
        // setup window resize function
        var thisObj = this;
        $(window).resize(function(){
            thisObj.setDimensions();
        });
        
        // add listener for input events, always redraw canvas
        this.canvas.addEventListener('InputEvent', function (e) {thisObj.draw();}, false);
        
        // check if images are loaded every 300ms
        var readyInterval = setInterval(function(){
            if(thisObj.isReady){
             thisObj.draw();
             clearInterval(readyInterval);
            }
        },300);

        // send reference of this editor to player to link them together
        this.player.linkEditor(this);
        
        // project id, unique id for each midi recording, 
        // -1 is unsaved/blank project
        this.projectId = -1;
        
        console.log("New Editor created");
    }
    
    // sets dimensions of editor according to window size
    // and calls window resize on all items, then redraws
    Editor.prototype.setDimensions = function(){
        this.width = Math.max(window.innerWidth-widthSub, minWidth);
        this.height = Math.max(window.innerHeight-heightSub, minHeight);
        $(this.canvas).css({"width":this.width+"px","height":this.height+"px"});
        this.context.width = this.width;
        this.context.height = this.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        if(this.midiWorkspace)
            this.midiWorkspace.windowResize(this.width, this.height);
        this.draw();
    }
    
    // clears canvas and draw midiworkspace
    Editor.prototype.draw = function(){
        var t0 = performance.now();
        this.context.clearRect(0,0,this.width, this.height);
        this.context.font = "16px arial";
        if(this.midiWorkspace)
            this.midiWorkspace.draw(this.context);
        var t1 = performance.now();
        //console.log("Call took " + (t1 - t0) + " milliseconds.")
    }
    
    // is the editor ready (right now ask have all images loaded)
    Editor.prototype.isReady = function(){
        return this.midiWorkspace.ready();
    }
    
    // called from player, send key code down to midi workspace
    Editor.prototype.recordKeyDown = function(kc){
        this.midiWorkspace.recordKeyDown(kc);
    }
    
    // called from player, send key code down to midi workspace
    Editor.prototype.recordKeyUp = function(kc){
        this.midiWorkspace.recordKeyUp(kc);
    }
    
    // called from midi workspace, send key code up to player
    Editor.prototype.midiKeyDown = function(kc){
        this.player.midiKeyDown(kc);
    }
    
    // called from midi workspace, send key code up to player
    Editor.prototype.midiKeyUp = function(kc){
        this.player.midiKeyUp(kc);
    }
    
    // send notes to keyboard to be saved by keyboard's mechanism
    Editor.prototype.sendNotes = function(notes){
        this.player.saveNotes(notes, this.projectId);
    }
    
    // keyboard confirms that notes have been saved and passes down projectId 
    Editor.prototype.notesSaved = function(pid){
        this.projectId = pid;
        //console.log(pid);
    }
    
    // load button was pressed, so ask keyboard to load
    Editor.prototype.loadNotes = function(){
        return this.player.loadNotes();
    }
    
    // keyboard sends back the loaded notes and projectId
    Editor.prototype.notesLoaded = function(notes, pid){
        this.midiWorkspace.notesLoaded(notes);
        this.projectId = pid;
        //console.log(this.projectId);
    }
    
    // new project was created so reset the project id
    Editor.prototype.newProject = function(){
        this.projectId = -1;
    }
    
    // Set BPM from keyboard
    Editor.prototype.setBPM = function(bpm){
        this.midiWorkspace.setBPM(bpm);
    }
}

// Global Variables

// ascii key mappings to array index
var keyPairs = [49,50,51,52,53,54,55,56,57,48,189,187,
            81,87,69,82,84,89,85,73,79,80,219,221,
            65,83,68,70,71,72,74,75,76,186,222,13,
            90,88,67,86,66,78,77,188,190,191,16,-1];
          
// alternate keys for firefox
var backupPairs = [49,50,51,52,53,54,55,56,57,48,173,61,
               81,87,69,82,84,89,85,73,79,80,219,221,
               65,83,68,70,71,72,74,75,76,59,222,13,
               90,88,67,86,66,78,77,188,190,191,16,-1];
                       
// letter to show in each button
var letterPairs = ["1","2","3","4","5","6","7","8","9","0","-","=",
               "Q","W","E","R","T","Y","U","I","O","P","[","]",
               "A","S","D","F","G","H","J","K","L",";","'","\\n",
               "Z","X","C","V","B","N","M",",",".","/","\\s","NA"];