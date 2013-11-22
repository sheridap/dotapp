/**
 * Created by JetBrains WebStorm.
 * User: sheridap
 * Date: 8/29/13
 * Time: 1:31 AM
 * To change this template use File | Settings | File Templates.
 */
function Dot(config) {
    this.id         = config.id || null;
    this.cellIndex  = config.cellIndex || null;
    this.color      = config.color || null;
    this.el         = config.el || null; //id="+ this.id +"

    this.init();
    return;
};

Dot.prototype.init = function(){
    this.el = $("<div class=dot />");
    var color = this.getColor();
    this.color = color;
//    console.log(this.el);
    this.el.addClass(color);
};

Dot.prototype.getRandom = function(config){
  return Math.floor(Math.random() * (config.max - config.min + 1) + config.min);
};

Dot.prototype.getColor = function(){
    var color = this.getRandom({
          "min" : 0,
          "max" : 4
    });

//    jQuery.data('body').colors;

    var colors = $('body').data('colors');

    return colors[color];

};

Dot.prototype.destroy = function(){
//  turns out this doesn't actually do anything
    
    console.log("in Dot.prototype.destroy(): ");
    console.log("this.el: ");
    console.log(this.el);
    this.el.empty();//parentNode.removeChild(0)
//    this.el.parentNode.removeChild(0);
}
