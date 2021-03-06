/**
 * Created by JetBrains WebStorm.
 * User: sheridap
 * Date: 9/2/13
 * Time: 11:03 PM
 * To change this template use File | Settings | File Templates.
 */

function Game(config) {
    this.board  = [];
    this.init();
};

Game.prototype.init = function() {
    console.log('init the Game obj');
    //get reference to gameboard div
    this.boardEl = $('.board');
    this.rows   = [1,2,3,4,5,6];
    this.cols   = [1,2,3,4,5,6];
    this.colors = ['red','yellow','blue','green','purple'];
    this.lineManager = new LineManager();
    this.lineManager.game = this;

    // make the board cells
    this.initBoard();

    // make the first batch of dots and add them to cells
    this.createDots();

    //


    // monitor the Board
    // start game timer
    //

};

/*
    create the Cells
 */
Game.prototype.initBoard = function() {
  console.log('init the board cells');
  for(var i = 1; i < 7; i++ ){
      for(var j = 1; j < 7; j++){
          var cell = new Cell({
              "id"  : i + "-" + j,
              "row" : i,
              "col" : j,
              "index" : (i * 6) - 6 + j -1
          });
          //set cell above reference
          var aboveIndex =  cell.index - 6;
          cell.above =  (cell.index > 5)? this.board[aboveIndex]: null;
          // set current cell as 'below cell' to it's 'above cell'
          var cellAbove = this.board[aboveIndex];
          if(cell.above) cellAbove.below = cell;

          this.board.push(cell);
          this.boardEl.append(cell.el);
      }
  }
};


/*
    create a Dot for each cell that is empty
 */

Game.prototype.createDots = function() {

    console.log("[[[[[      creating dots for empty cells   ]]]]]");
    var board = this.board;

    board.forEach( function(cell){
        if( cell.dot == null){
            cell.addDot();
        }
    });
    amplify.publish( "boardUpdated");
};