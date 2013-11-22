/**
 * Created by JetBrains WebStorm.
 * User: sheridap
 * Date: 8/29/13
 * Time: 6:25 PM
 * To change this template use File | Settings | File Templates.
 */
function LineManager() {
    this.cellChain      = [];
    this.state          = 'NOLINE'; // 'NOLINE', 'LINE', 'CLEARING'
    this.lineActive     = false;
    this.clearing       = false;
    this.prevCell       = null;
    this.activeCell     = null;
    this.endCell        = null;
    this.activeColor    = null;
    this.events         = amplify.subscribe( "cellEvent", this, this.handleCellEvent);
    this.game           = null;
    return this;
};

LineManager.prototype.init = function(){
    // when the board is populated
};

LineManager.prototype.handleCellEvent = function(data){

    if(this.state === 'CLEARING'){
//  DO NOTHING AND RETURN
        return;
    }

    this.activeCell = data.cell;

    this.updateCellChain(data); // data.cell

//    if(data.event === 'mouseup'){
//        this.lineActive = false;
//        this.state      = 'NOLINE';
//    };

    /*
    handle the mouse events on the cells
    mouseover and lineActive is false: do nothing
    mousedown: first cell has been tapped
    mouseover and LineActive: update chain
    mouseup and line active: clear line
     */
};

LineManager.prototype.updateCellChain = function(data){

//      if the CHAIN has more than one CELL and the CELL is in a valid position
//      clear the line
    if(data.event == 'mouseup' && this.cellChain.length > 1 ){
        this.clearLine();
    }


    this.lineActive = (this.lineActive || data.event == 'mousedown');


    if(this.lineActive){
        this.state = 'LINE';
        var cell  = data.cell;
        var chain = this.cellChain;
        var brd   = this.game.board;
        var firstLink =  null, lastCell = null, endPoint = null;
        var cellVaLid = false, colorMatch = false, validEndPoint = false;

        console.log("[[[[[[     "+cell.id+" PASS    ]]]]");

//        LineManager rules:
//      - if the chain is empty, add cell to chain (first link)
        firstLink = (chain.length == 0);

//      - if the chain isn't empty, grab a reference to the last cell in the Chain
        lastCell    = (chain.length > 0)? chain[chain.length -1] : null; // returns last Cell

//      - confirm color match exists between the last two cells in the chain
        colorMatch  = (lastCell != null && cell.dot.color === lastCell.dot.color);

//      confirm new cell position is adjacent to the last cell
//      prevent the same cell from being added twice
        if(lastCell != cell && lastCell !== null){
            cellVaLid =
                (lastCell.index -6 == cell.index) ||  // cell above is valid
                (lastCell.index -1 == cell.index) ||  // cell left is valid
                (lastCell.index +1 == cell.index) ||  // cell right is valid
                (lastCell.index +6 == cell.index);     // cell below is valid
        }

//        confirm cell is not already in the chain
        var cellInChain = (jQuery.inArray(cell, chain) !== -1);

//      if the cell is in a valid position and not already in the chain, add it to the chain
        if(firstLink || (cellVaLid && colorMatch && !cellInChain)) { //&& notDupe
            chain.push(cell);
            cell.el.addClass('black');
        }

//      if the cell IS in a valid position AND it is already in the chain
//      THEN a valid square has been made
        if(chain.length > 3 && cellVaLid && cellInChain){
            console.log("[[[[[  SQUARE  ]]]]]");
            this.clearLine();
        }

        console.log('chain: ');
        console.log(chain);

    }
};

LineManager.prototype.clearLine = function(){
    console.log("[[[[[  CLEARING LINE ]]]]]");
//          block further events from firing until the cleanup is done
    this.state = 'CLEARING';

//          remove all cells in the chain
//          reset the cell border
//          then create new dots for each cell
//          and ideally animate the new dots in
//
    var chain = this.cellChain;
    chain.forEach(function(cell){
        console.log('[[[[[  DESTROYING DOTS     ]]]');
        cell.removeDot();
    });

    chain = null;
    this.cellChain = [];

//            reset lineActive to null
    this.lineActive = false;
    this.state = 'NOLINE';

//    now shift all the dots down
//    starting at the bottom row for every cell in the board
    var board = this.board;
//  check the first row of the board
//  and iterate for each 'column' and then shift dots down
    for(var i = 0; i < 6; i++){
        var colIndex = i;
//        build an array for the column
        var col = [];
//        0,6,12,18,24,30
        for(var j = 0; j < 6; j++){
            var index = i + (j * 6);
            col.push(board[index]);
        }

//        now go through the column and collapse down the dots
        for(var k = 0; k < col.length; k++){
            
        }

    }

};

/*

 create an array of color matches
        var colorMatches = $.map(brd, function(element, index){
            return element.color == link.color;
        });

        now match valid cells by physical location (index)

        rules for cell location matches:
         -6: x > 5
         -1: !(x = 0 || x%6 = 0)
         +1: !(x = 5 || x%6 = 5)
         +6: x < 30

         define the valid x and y values for matching
        [0, 01, 02, 03, 04, 05,
        06, 07, 08, 09, 10, 11,
        12, 13, 14, 15, 16, 17,
        18, 19, 20, 21, 22, 23,
        24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 35]

        adjoining cell rules

        if 00 - 01, 06          : _,  _,  +1, +6    0
        if 03 - 02, 04, 09      : _,  -1, +1, +6    01 - 04
        if 05 - 04, 11          : _,  -1, _,  +6    05
        if 06 - 00, 07, 12      : -6,  _, +1, +6    06, 12, 18, 24
        if 14 - 08, 13, 15, 20  : -6, -1, +1, +6    13 - 16, 19 - 22, 25 - 28
        if 11 - 05, 10, 17      : -6, -1, _,  +6    11, 17, 23, 29
        if 30 - 24, 31          : -6,  _, +1, _,    30
        if 33 - 27, 32, 34      : -6, -1, +1, _,    31 - 34
        if 35 - 29, 34          : -6, -1,  _, _,    35

        what rules generically define a valid cube?
        2x2
        3x3
        4x4
        5x5
        6x6



*/


