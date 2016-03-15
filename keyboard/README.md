## Requirements for the player object
### It needs to contain the following methods:
- `linkEditor(editor)`, editor is the midi editor the player is conneted to
- `midiKeyUp(kc)`, kc is the keycode of the key released
- `midiKeyDown(kc)`, kc is the keycode of the key pushed
- `saveNotes(notes,pid)`, notes is a notes array of the midi notes, pid is the unique project id
    - call this.editor.notesSaved(pid) to pass the project id to the editor, where it is persited
    - a pid of -1 means a new project
- `loadNotes()`, called by editor when load button pressed

### To send keys to the editor, use the following methods
-  `this.editor.recordKeyDown(keyCode)`
-  `this.editor.recordKeyUp(keyCode)`

### Miscelaneous Functions
-  `this.editor.setBPM(BPM)`, maunally set the editor's bpm from the keyboard for the song
-  `this.editor.notesSaved(project id)` , called after the backend has saved the notes and gotten the project id
-  `this.editor.notesLoaded(notes,project id)`, called after the song has been loaded from the server


### A note on notes
-  The notes array that editor sends has more information than needed per note. This line of code will push all of the necessary data  to an array, which can be passed to the saveNotes method 
    ```javascript    
        var saveNote = [];
        for(var n in notes)
            saveNote.push({"note":notes[n].note, "beat":notes[n].beat, "length":notes[n].length});
    ```
- This is also the object format that `editor.notesLoaded()` will expect

### Performance Test
- Nearly constant time to play back no matter the amount of notes
- Slight stutteryness at some intervals, so there is room for imporvment