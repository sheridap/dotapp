/**
 * Created by JetBrains WebStorm.
 * User: sheridap
 * Date: 8/29/13
 * Time: 1:30 AM
 * To change this template use File | Settings | File Templates.
 */
function Cell(config) {
    this.id         = config.id     || null;
    this.row        = config.row;
    this.col        = config.col;
    this.index      = config.index || null;
    this.dot        = config.dot    || null;
    this.el         = $("<div id="+ config.id +" class=cell />");
    this.above      = null; // tracks the cell above if it exists
    this.below      = null; // tracks the cell below if it exists
    this.events     = amplify.subscribe( "cellEvent", this, this.handleCellEvent);

    this.init();
};

Cell.prototype.addDot = function(){
    var dot = new Dot({
        "cellIndex" : this.index
    });

    this.dot = dot;
    this.el.append(dot.el);

//    this.el.append(this.dot.el);
//    this.el.addClass(this.dot.color);
};

Cell.prototype.removeDot = function(){
    this.el[0].innerHTML = "";
    this.el.removeClass('black');
    this.dot = null;
//    this.dot.destroy();

    amplify.publish( "cellEvent", {
        'cell' : this,
        'event': 'remove'
    });

};

Cell.prototype.makeDOM = function(){
    this.el = $("<div id="+this.id+"/>");
    this.el.addClass("cell");
    this.el.className += this.id;
    this.el = $(this.id);
};

Cell.prototype.init = function(){
    // attach events for monitoring
    var data = 'test';

    // preserve Cell scope
    var me = this;

    // attach event to Cell DOM to trigger the chain construction
    this.el.on('mousedown', function(){
        amplify.publish( "cellEvent", {
            'cell' : me,
            'event': 'mousedown'
        });
    });
    
    // fire event to let chain manager know
    this.el.on('mouseover', function(){
        amplify.publish( "cellEvent", {
            'cell' : me,
            'event': 'mouseover'
        });
    });

    // stop adding cells on mouseup
    this.el.on('mouseup', function(){
        amplify.publish( "cellEvent", {
            'cell' : me,
            'event': 'mouseup'
        });
    });

};

Cell.prototype.handleCellEvent = function(data){
    // handle empty cells in the first row
    if(data.event === "remove" && this.dot ===null && this.above === null){
        console.log("trying to add dot to first row cell");
        this.addDot();
    }

    //handle all other empty cells
    if(data.event === "remove" && this.dot === null && this.above !== null){
        this.dot = this.above.dot;
        this.el.append(this.above.dot.el);
        this.above.removeDot();
    }

};

Cell.prototype.move = function(){
//    moves the cell's dot down to the lowest available empty cell
    amplify.subscribe()
};

Cell.prototype.notifyLineManager = function(){
    // make yourself know to the line manager
    LineManager.notify(this);
};
