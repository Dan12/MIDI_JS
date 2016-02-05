// Setup editor namespace
// can have private and public methods/functions/classes
var MIDI_Editor = new function() {
    
    // editor height and width sub from window dims
    var widthSub = 60;
    var heightSub = 160;
    
    // available keys for editor
    var keys = ["1","2","3","4","5","6","7","8","9","0","-","=",
                "Q","W","E","R","T","Y","U","I","O","P","[","]",
                "A","S","D","F","G","H","J","K","L",";","'","\\n",
                "Z","X","C","V","B","N","M",",",".","/","\\s"];
    
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
        this.contex = this.canvas.getContext("2d");
        console.log("New editor created");
        this.setDimensions();
        this.canvasLayout = Canvas_Layout.init(this.contex);
        
        var editorObject = this;
        $(window).resize(function(){
            editorObject.setDimensions();
        });
    }
    
    // sets dimensions of editor according to window size
    Editor.prototype.setDimensions = function(){
        this.width = window.innerWidth-widthSub;
        this.height = window.innerHeight-heightSub;
        $(this.canvas).css({"width":this.width+"px","height":this.height+"px"});
        this.contex.width = this.width;
        this.contex.height - this.height;
    }
}