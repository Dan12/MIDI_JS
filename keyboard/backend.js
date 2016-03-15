var BackendSpace = new function(){

    // sample backend for keyboard
    this.init = function(){
        return new BackendComm();
    }
    
    var BackendComm = function(){
        console.log("New Backend Object");
    }
    
    BackendComm.prototype.saveSong = function(notes, pid, editor, song_number){
        console.log("Save song");
    }
    
    BackendComm.prototype.loadSongs = function(editor, song_number){
        console.log("Load songs");
    }

}