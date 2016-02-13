$(document).ready(function(){
   var editor = MIDI_Editor.init("body");
   var readyInterval = setInterval(function(){
      if(editor.isReady){
         editor.draw();
         clearInterval(readyInterval);
      }
   },300);
});