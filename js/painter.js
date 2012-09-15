window.onload = function() {
  Painter.Palette.setup();

  Painter.Canvas.setup();
  
  Painter.Palette.Picker.setup();
  
  Painter.IO.setup();
  
  Painter.Toolbox.setup();
  
  Painter.Shortcuts.setup();

  Painter.Core.setupPaintEvent();

  Painter.Canvas.backupCurrent();
}


Painter.Core = function() {
  var _is_drawing = false;
  var _draw_from = [];
  
  var _getClickPosition = function(e){
    var offsetX = e.pageX - 160;
    var offsetY = e.pageY - 64;
    return [Math.floor(offsetX / Painter.Canvas.getScaling()), Math.floor(offsetY / Painter.Canvas.getScaling())];
  };
  
  var _preDraw = function(position) {
    var tool = Painter.Toolbox.getCurrentTool();
    tool.preDraw(position[0], position[1]);
    _is_drawing = true;
    _draw_from = position;
  };

  var _draw = function(position) {
    var tool = Painter.Toolbox.getCurrentTool();
    var _offset_x = Painter.Canvas.getOffsetX();
    var _offset_y = Painter.Canvas.getOffsetY();
    tool.draw(_offset_x + _draw_from[0], _offset_y + _draw_from[1], _offset_x + position[0], _offset_y + position[1]);
  };

  var _afterDraw = function(position) {
    var tool = Painter.Toolbox.getCurrentTool();
    _is_drawing = false;
    tool.afterDraw(position[0], position[1]);
    Painter.Canvas.backupCurrent();
  };
  
  return {
    setupPaintEvent: function() {
      $('#gridcanvas').mousedown(function(e) {
        _preDraw(_getClickPosition(e));
      });

      $('#gridcanvas').mousemove(function(e) {
        if (_is_drawing) {
          _draw(_getClickPosition(e));
        }
      });

      $('#gridcanvas').mouseup(function(e) {
        if (_is_drawing) {
          _afterDraw(_getClickPosition(e));
        }
      });
    },
  }
}();
