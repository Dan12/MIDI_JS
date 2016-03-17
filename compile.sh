printf "var BasicMIDI = new function() {\n\n" > Compiled.js
printf "this.init = function(append_to, player){\n" >> Compiled.js
printf "return MIDI_Editor.init(append_to, player);\n" >> Compiled.js
printf "}\n\n" >> Compiled.js

for f in *.js; do
    if ( [ $f != 'Compiled.js' ] && [ $f != 'main.js' ] ); then
        cat "${f}" >> Compiled.js; 
        printf "\n\n" >> Compiled.js;
        echo "Concatenated ${f}"
    fi
done

printf "\n}" >> Compiled.js

minify Compiled.js --output Compiled.js