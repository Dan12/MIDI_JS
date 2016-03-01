## Requirements for the player object
### It needs to contain the following methods:
- linkEditor(editor), editor is the midi editor the player is conneted to
- midiKeyUp(kc), kc is the keycode of the key released
- midiKeyDown(kc), kc is the keycode of the key pushed
- saveNotes(notes,pid), notes is a notes array of the midi notes, pid is the unique project id
    - call this.editor.notesSaved(pid) to pass the project id to the editor, where it is persited
    - a pid of -1 means a new project
- loadNotes(), calls editor.notesLoaded(notes) when notes are loaded

### To send keys to the editor, use the following methods
-  this.editor.recordKeyDown(keyCode)
-  this.editor.recordKeyUp(keyCode)

### Performance Test
- About 2000 notes, playback was fine, usually ~ 8 milliseconds of delay
- scrolling while playing went up to ~ 35 milliseconds of delay and there was a clear delay in the sound