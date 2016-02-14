// Setup namespace
var Set_Note_Handler_Input = new function() {
    
    this.init = function(nh){
        // processes keyboard and mouse inputs
        nh.prototype.generalInput = function(e){
            // if the mouse is down
            if(e.detail.mouseDown){
                // this variable tells later if statments if they should execute
                var exit = false;
                // if not doing drag select
                if(!this.multiSelect.isActive){
                    // if the selected array is empty
                    if(this.selected.length == 0){
                        // go through visible notes in reverse order because the ones on top were likely added later
                        for(var note = this.visibleNotes.length-1; note >= 0; note--)
                            /* if the mouse is down on a visible note, add that note to the selected array
                             * set the note to selected, set exit to true so that we don't create a new note
                             * set selectedMouseUp to false to indicate that we are dragging
                             */
                            if(this.visibleNotes[note].mouseOver(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                                this.visibleNotes[note].selected = true;
                                this.selected.push(this.visibleNotes[note]);
                                this.selectedMouseUp = false;
                                exit = true;
                                break;
                            }
                    }
                    // the selected array is not empty
                    else{
                        // if we are dragging what we have selected
                        if(!this.selectedMouseUp){
                            // if we haven't decided if we are dragging or resizing
                            if(this.resizing == -1)
                                // check if we are resizing
                                for(var note in this.selected){
                                    if(this.selected[note].overLeftEdge(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                                        this.resizing = 1;
                                        break
                                    }
                                    else if(this.selected[note].overRightEdge(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                                        this.resizing = 2;
                                        break;
                                    }
                                }
                                
                            // if we are not resizing, we are dragging
                            if(this.resizing == -1)
                                this.resizing = 0;
                            
                            // update all notes in selected by either moving them or resizing them
                            for(var note in this.selected){
                                if(this.resizing == 1)
                                    this.selected[note].leftResize(e.detail.deltaX)
                                else if(this.resizing == 2)
                                    this.selected[note].rightResize(e.detail.deltaX)
                                else
                                    this.selected[note].moveNote(e.detail.deltaX, e.detail.deltaY);
                            }
                            
                            // we have modified the notes and must remember to make them snap into place when we are done  
                            this.selectedSet = false;
                            
                            // prevent the creation of a new note
                            exit = true;
                        }
                        // the mouse was just pressed down, make sure we are still selecting an object in the selected array
                        else{
                            for(var note in this.selected)
                                if(this.selected[note].mouseOver(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                                    this.selectedMouseUp = false;
                                    break;
                                }
                        }
                    }
                }
                // doing drag select
                else{
                    // update the drag selector object
                    this.multiSelect.update(e.detail.mouseX, e.detail.mouseY, this.horizontalOffset, this.verticalOffset);
                    
                    // put the notes in the selected area into the selected array
                    for(var note in this.visibleNotes)
                        // if a note is visible and was not yet selected, check if it is selected now
                        if(!this.visibleNotes[note].selected && this.multiSelect.noteInMulti(this.visibleNotes[note])){
                            this.selected.push(this.visibleNotes[note]);
                            this.visibleNotes[note].selected = true;
                        }
                        
                    for(var note in this.selected)
                        // if a note was selected but is no longer in the selected area, remove it from the selected array
                        if(this.selected[note].selected && !this.multiSelect.noteInMulti(this.selected[note])){
                            this.selected[note].selected = false;
                            this.selected.splice(note,1);
                        }
                        
                    // not new note creation
                    exit = true;
                }
                
                // if not single selecting or dragg selecting and clicked on empty space
                // with something selected, empty the selected aray
                if(!exit && this.selectedMouseUp && this.selected.length != 0){
                    for(var note in this.selected)
                        this.selected[note].selected = false;
                    this.selected = [];
                    exit = true;
                }
                
                // if nothing is selected, create a potential new note, only confirmed if we don't drag (indicating a drag select)
                if(!exit && this.selectedMouseUp && e.detail.mouseX > this.x && e.detail.mouseX < this.x+this.width && e.detail.mouseY > this.y && e.detail.mouseY < this.y+this.height)
                    // get mouse pixel position in terms of input handler window, convert to notes and beats, pass a few other parameters to help set up note
                    this.possibleNewNote = Note_Space.createNote(Math.floor((e.detail.mouseY-this.y-this.verticalOffset)/this.PixelsPerNote), Math.floor((e.detail.mouseX-this.x-this.horizontalOffset)/this.PixelsPerSection)*this.resolution, this.resolution, this.PixelsPerNote, this.PixelsPerBeat, this.x, this.y);
                    
                    // this version takes into account mouse offsets but you can place a note over another one without knowing it in edge cases
                    // this.possibleNewNote = Note_Space.createNote(Math.floor((e.detail.mouseY-this.y-this.verticalOffset-5)/this.PixelsPerNote), Math.floor((e.detail.mouseX-this.x-this.horizontalOffset-4)/this.PixelsPerSection)*this.resolution, this.resolution, this.PixelsPerNote, this.PixelsPerBeat, this.x, this.y);
            }
            // if the mouse is not down
            else{
                // if the possible new note is still around, create it, add it to the arrays
                // and check if it's the new farthest note
                if(this.possibleNewNote != null){
                    this.notes.splice(this.findNoteInsert(this.notes, this.possibleNewNote), 0, this.possibleNewNote);
                    this.visibleNotes.push(this.possibleNewNote);
                    if(this.possibleNewNote.px+this.possibleNewNote.pw > this.farthestNote){
                        this.farthestNote = this.possibleNewNote.px+this.possibleNewNote.pw;
                        this.midiEditor.setMaxWidth(this.farthestNote*this.resolution);
                    }
                    this.possibleNewNote = null;
                }
                
                // if we click on empty space next time, empty selected array
                this.selectedMouseUp = true;
                // hide dragging selector highlighter
                this.multiSelect.isActive = false;
                // reset selected action
                this.resizing = -1;
                
                // check if we should change the cursor to let the user know that they can resize the selected notes
                // only makes sense if we have something selected
                if(this.selected.length > 0){
                    var changeCursor = false;
                    for(var i = this.selected.length-1; i >= 0; i--)
                        if(this.selected[i].mouseOver(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                            if(this.selected[i].overLeftEdge(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset) || this.selected[i].overRightEdge(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                                $(this.editor).css("cursor","col-resize");
                                changeCursor = true;
                            }
                            break;
                        }
                    if(!changeCursor)
                        $(this.editor).css("cursor","default");
                }
            }
            
            // if escape key pressed, deselect everything
            if(e.detail.keyDown == 27){
                for(var note in this.selected)
                    this.selected[note].selected = false;
                this.selected = [];
            }
            // if delete key pressed, remove all selected notes from workspace
            else if(e.detail.keyDown == 8){
                for(var note in this.selected){
                    this.notes.splice(this.notes.indexOf(this.selected[note]),1);
                    var visInd = this.visibleNotes.indexOf(this.selected[note]);
                    if(visInd != -1)
                        this.visibleNotes.splice(visInd,1);
                }
                this.selected = [];
            }
            // TODO: add functionality for space bar to play and pause
            
            // if mouse dragged, remove possible new note
            if(e.detail.mouseDrag){
                this.possibleNewNote = null;
                // if we do not have something selected, start a new dragging selector if one is not yet created
                if(this.selected.length == 0 && !this.multiSelect.isActive && e.detail.mouseY > this.y){
                    this.multiSelect.startNew(e.detail.mouseX, e.detail.mouseY, this.horizontalOffset, this.verticalOffset);
                }
            }
            
            // if the mouse is up or the mouse goes out of bounds of the note handler window, place all currently selected notes
            if(!e.detail.mouseDown || e.detail.mouseX < this.x || e.detail.mouseY < this.y || e.detail.mouseY > this.y+this.height){
                // check so that this isn't done every single time there is a mouse movement
                if(!this.selectedSet){
                    // remove the selected notes from the notes array because they could have changed position
                    // and the notes array needs to remain ordered
                    for(var note in this.selected)
                        this.notes.splice(this.findNote(this.notes,this.selected[note]),1);
                    
                    // TODO: check for new max width
                    for(var note in this.selected){
                        this.selected[note].mouseUp(this.resolution, this.PixelsPerNote, this.PixelsPerSection, this.PixelsPerBeat, this.maxKeys);
                        // reinsert selected notes into notes array in their correct place
                        this.notes.splice(this.findNoteInsert(this.notes,this.selected[note]),0,this.selected[note]);
                    }
                    this.selectedSet = true;
                }
            }
            
            // if there was a double click, go through notes 
            // if the double click was on that note, delete it 
            if(e.detail.doubleClickConsumes > 0){
                for(var note = this.visibleNotes.length-1; note >= 0; note--)
                    if(this.visibleNotes[note].mouseOver(e.detail.mouseX-this.horizontalOffset, e.detail.mouseY-this.verticalOffset)){
                        this.notes.splice(this.notes.indexOf(this.visibleNotes[note]),1);
                        this.visibleNotes.splice(note,1);
                        this.selected.splice(this.selected.indexOf(this.visibleNotes[note]),1);
                        break;
                    }
                e.detail.doubleClickConsumes--;
            }
            
            // use this to make sure that the notes array is in order
            // var arrStr = "";
            // for(var note in this.notes)
            //     arrStr+=this.notes[note].beat+",";
            // console.log(arrStr);
        }
        
        console.log("Added input function to Note Handler object")
    }
}