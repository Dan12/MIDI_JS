// Setup namespace
var Test_Player = new function() {
    
    // return a new player
    this.init = function(){
        return new Player();
    }
    
    /**
     * A simple player that can link to the midi editor
     * it needs to contain the following methods:
     *      linkEditor
     *      midiKeyUp
     *      midiKeyDown
     * 
     * To send keys to the editor, use the following methods
     *      this.editor.recordKeyDown(keyCode)
     *      this.editor.recordKeyUp(keyCode)
     */
    var Player = function(){
        $("body").append('<div id="reciever"></div>');
        $("body").append('<div id="sender"></div>');
    }
    
    Player.prototype.linkEditor = function(editor){
        this.editor = editor;
        
        var thisObj = this;
        $(document).keydown(function(e){
            thisObj.editor.recordKeyDown(e.keyCode);
            $("#sender").append("<div class='message'>Keydown "+e.keyCode+"</div>");
            var elem = document.getElementById('sender');
            elem.scrollTop = elem.scrollHeight;
        });
        
        $(document).keyup(function(e){
            thisObj.editor.recordKeyUp(e.keyCode);
            $("#sender").append("<div class='message'>Keyup "+e.keyCode+"</div>");
            var elem = document.getElementById('sender');
            elem.scrollTop = elem.scrollHeight;
        });
        
        console.log("Linked Editor and Player");
    }
    
    Player.prototype.midiKeyUp = function(kc){
        $("#reciever").append("<div class='message'>Keyup "+kc+"</div>");
        var elem = document.getElementById('reciever');
        elem.scrollTop = elem.scrollHeight;
    }
    
    Player.prototype.midiKeyDown = function(kc){
        $("#reciever").append("<div class='message'>Keydown "+kc+"</div>");
        var elem = document.getElementById('reciever');
        elem.scrollTop = elem.scrollHeight;
    }
    
}