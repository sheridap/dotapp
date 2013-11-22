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
//    this.x = this.el.style.left;
//    this.y = this.el.style.top;
    this.init();
    return;
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

Cell.prototype.notifyLineManager = function(){
    // make yourself know to the line manager
    LineManager.notify(this);
};
