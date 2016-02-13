// Setup editor namespace
// can have private and public methods/functions/classes
var MIDI_Editor = new function() {
    
    // editor height and width subtract from window dims
    var widthSub = 60;
    var heightSub = 160;
    // minimum width and height
    var minHeight = 200;
    var minWidth = 760;
    
    var headerHeight = 80;
    
    // init function for namespace
    // returns a new editor
    this.init = function(append_to){
        return new Editor(append_to);
    }
    
    // editor constructor
    // appends a new editor canvas to append_to and resizes it
    // initalize object variables
    var Editor = function(append_to){
        $(append_to).append('<div class="editor_container"><canvas class="editor_canvas">Your browser does not support the HTML5 canvas tag.</canvas></div>');
        var editors = document.getElementsByClassName("editor_canvas");
        this.canvas = editors[editors.length-1];
        this.context = this.canvas.getContext("2d");
        this.items = [];
        Input_Events.init(this.canvas);
        this.setDimensions();
        console.log("New editor created");
        
        this.items.push(Editor_Header.init(this.canvas, this.width, headerHeight));
        this.items.push(MIDI.init(this.canvas, this.width, this.height, headerHeight, this));
        
        var thisObj = this;
        $(window).resize(function(){
            thisObj.setDimensions();
        });
        this.canvas.addEventListener('InputEvent', function (e) {console.log(e.detail); thisObj.draw()}, false);
    }
    
    // sets dimensions of editor according to window size
    Editor.prototype.setDimensions = function(){
        this.width = Math.max(window.innerWidth-widthSub, minWidth);
        this.height = Math.max(window.innerHeight-heightSub, minHeight);
        $(this.canvas).css({"width":this.width+"px","height":this.height+"px"});
        this.context.width = this.width;
        this.context.height = this.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        for (var item in this.items)
            this.items[item].windowResize(this.width, this.height);
        this.draw();
    }
    
    Editor.prototype.draw = function(){
        this.context.clearRect(0,0,this.width, this.height);
        this.context.font = "16px arial";
        for (var item in this.items)
            this.items[item].draw(this.context);
    }
    
    Editor.prototype.isReady = function(){
        for (var item in this.items)
            if(!this.items[item].isReady())
                return false;
        return true;
    }
}