$(document).ready(function(){
   // create a new player
   var testPlayer = Test_Player.init();
   // create new editor and append it to the body element
   var editor = MIDI_Editor.init("body", testPlayer);
});

// TODO: add global color palette