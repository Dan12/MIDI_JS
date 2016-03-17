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
        // tell the editor that the song has been save with the unique song id equal to 1
        editor.notesSaved(1);
    }
    
    BackendComm.prototype.loadSongs = function(editor, song_number){
        console.log("Load songs");
        // tell the editor that a song has been loaded with the unique song id equal to 1
        // and the notes specified in the notes array
        var notes = [{"note":2,"beat":3,"length":1},{"note":3,"beat":6,"length":1}];
        editor.notesLoaded(notes,1);
    }

}