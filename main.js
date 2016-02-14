$(document).ready(function(){
   // create new editor and append it to the body element
   var testPlayer = Test_Player.init();
   var editor = MIDI_Editor.init("body", testPlayer);
});

// TODO: add global color palette
// TODO: script to compile all js files into one