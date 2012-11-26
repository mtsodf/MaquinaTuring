    var fita = new Array();
    var directionDir = new Array();
    var writeDir = new Array();
    var newStateDir = new Array();
    
    var BLANKS_LEFT = 100;
    var BLANKS_RIGHT = BLANKS_LEFT;
    var BLANK_CHAR = '?';
    var current = BLANKS_LEFT;
    var LEFT = 'L';
    var RIGHT = 'R';
    var LAST_STATE = 'L'
    var stop_flag = 0;

    function onload(){
        //add empty chars
        for(var i = 0; i < BLANKS_LEFT; i++){
            $('#fita').append("<div>" + BLANK_CHAR + "</div>");
            fita[i] = '?';
        }

        deltaLeft = (BLANKS_LEFT - 12) * 32;
        $('#fita').attr('style','left: -'+ deltaLeft + 'px');

        for (var i = 0; i < 3; i++) {
            fita[i] = 1 +'';
            if(i == 0){
                $("#fita").append("<div id = current>"+1+"</div>");
            } else{
                $("#fita").append("<div>"+1+"</div>");
            }
        }

        setState('s1');

        directionDir['s1&1'] = RIGHT;
        directionDir['s2&1'] = RIGHT;
        directionDir['s2&?'] = RIGHT;
        directionDir['s3&?'] = LEFT;
        directionDir['s3&1'] = RIGHT;
        directionDir['s4&1'] = LEFT;
        directionDir['s4&?'] = LEFT;
        directionDir['s5&1'] = LEFT;
        directionDir['s5&?'] = RIGHT;

        writeDir['s1&1'] = '?';
        writeDir['s2&1'] = '1';
        writeDir['s2&?'] = '?';
        writeDir['s3&?'] = '1';
        writeDir['s3&1'] = '1';
        writeDir['s4&1'] = '1';
        writeDir['s4&?'] = '?';
        writeDir['s5&1'] = '1';
        writeDir['s5&?'] = '1';

        newStateDir['s1&1'] = 's2';
        newStateDir['s2&1'] = 's2';
        newStateDir['s2&?'] = 's3';
        newStateDir['s3&?'] = 's4';
        newStateDir['s3&1'] = 's3';
        newStateDir['s4&1'] = 's4';
        newStateDir['s4&?'] = 's5';
        newStateDir['s5&1'] = 's5';
        newStateDir['s5&?'] = 's1';


        //add empty 
        for(var i = 0; i < BLANKS_RIGHT; i++){
            $('#fita').append("<div>" + BLANK_CHAR + "</div>");
            fita[i] = '?';
        }
    }

    function move(delta){
        $('#fita').animate({
            left: '-=' + delta + 'px'
        });
    }
    
    function prev(){
        $('#fita').children()[current].id = 'idle' + current;
        current -= 1;
        $('#fita').children()[current].id = 'current';
        move(-32);
    }

    function next(){
        $('#fita').children()[current].id = 'idle' + current;
        current += 1;
        $('#fita').children()[current].id = 'current';
        move(32);
    }

    function playStep(){
        key = dictKey();
        writeInTap(writeDir[key]);
        setState(newStateDir[key]);

        direction = directionDir[key];

        if(direction == LEFT){
            prev();
        } else{
            next();
        }
    }

    function dictKey(){
        return getState() + '&' + readTap();
    }

    function getState(){
        return $("#estado").html().trim();
    }

    function setState(estado){
        $('#estado').html(estado);
    }

    function writeInTap(w){
        $('#current').html(w);

    }

    function readTap(){
        return $('#current').html().trim();
    }

    chamou = 0;
    
    function play(){
        stop_flag = 0;

        recursivePlay();

        $("#playStep_button")[0].disabled = true;
        $("#play_button")[0].disabled = true;
        $("#init_button")[0].disabled = true;
        $('#stop_button')[0].disabled = false;
    }

    function recursivePlay(){
        setTimeout( function(){
                playStep()

               if( getState() != LAST_STATE && stop_flag != 1){
                    recursivePlay();
               }
                
            }, 500);

    }
    
    function stop(){
        stop_flag = 1;
        $("#playStep_button")[0].disabled = false;
        $("#play_button")[0].disabled = false;
        $("#init_button")[0].disabled = false;
        $("#stop_button")[0].disabled = true;
    }

    function init(){
        
        $('#fita').empty();

        fita = new Array();
        for(var i = 0; i < BLANKS_LEFT; i++){
            $('#fita').append("<div>" + BLANK_CHAR + "</div>");
            fita[i] = '?';
        }

        deltaLeft = (BLANKS_LEFT - 12) * 32;
        $('#fita').attr('style','left: -'+ deltaLeft + 'px');

        fita_string = document.getElementById('fita_text').value;

        for(var i = 0; i < fita_string.length; i++ ){
            fita[i] = fita_string[i] +'';
            if(i == 0){
                $("#fita").append("<div id = current>" + fita_string[i] + "</div>");
            } else{
                $("#fita").append("<div>" + fita_string[i] + "</div>");
            }
        }

        //add empty 
        for(var i = 0; i < BLANKS_RIGHT; i++){
            $('#fita').append("<div>" + BLANK_CHAR + "</div>");
            fita[i] = '?';
        }

        directionDir = new Array();
        writeDir = new Array();
        newStateDir = new Array();

        program = document.getElementById('program').value + '';

        lines = program.split("\n");

        for( var i = 0 ; i < lines.length; i++){
          
            columns = lines[i].split(/[\s,]+/);
            currentState = columns[0];
            readSimb = columns[1];
            writeSimb = columns[2];
            moveTo = columns[3];
            newState = columns[4];

            key = currentState + '&' + readSimb;

            directionDir[key] = moveTo;
            writeDir[key] = writeSimb;
            newStateDir[key] = newState;

        }

        setState(document.getElementById('initialState').value +'');

    }
