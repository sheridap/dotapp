/**
 * Created by JetBrains WebStorm.
 * User: sheridap
 * Date: 8/28/13
 * Time: 8:40 PM
 * To change this template use File | Settings | File Templates.
 */

$.app = function App() {
    this.game  = new Game();
    this.init();
};


/*

 Game   - the game instance
 Board  - 6x6 game board; two dimensional array containing Cells
 Cell   - the grid unit inside the Board that holds the Dot
 Dot    - the colored circle
 LineManager - listens for mouse events on Dots and manages the Line
 Line   - the connector between Dots [and maybe Cells?]

 Board  = [
            [ [g],[r],[p],[y],[b],[b] ],
            [ [],[],[],[],[],[] ],
            [ [],[],[],[],[],[] ],
            [ [],[],[],[],[],[] ],
            [ [],[],[],[],[],[] ],
            [ [],[],[],[],[],[] ]
          ]




    gameboard cells that have to be monitored
    has gamepiece?
    gamepiece id

  define dots
     id
     color
     cell position index [x, y]
     hasActiveLineConnection?
     init()
     destroy()
     drop()

   define active selector Line Singleton
     startPosition  : cellIndex[x,y]
     thumbPosition  : [x,y]
     endPosition    : cellIndex[x,y]
     initialWidth   : 5px


  define global game resources
   colors array [green, yellow, red, purple, blue]

  define Factory for creating dots
    new Dot
    color        : randomColor
    cellPosition :

 */
