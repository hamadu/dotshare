
Tool = function(element, preDraw, draw, afterDraw) {
  this.element = element;
  this.$element = $(element);

  this.preDraw = preDraw;
  this.draw = draw;
  this.afterDraw = afterDraw;
}

Tool.getCurrentTool = function() {
  return Tool[$("#toolbox_mainmenu .active").attr("name")];
}

Tool.setup = function() {
  $("#toolbox_mainmenu a.btn").click(function(){
    $("#toolbox_mainmenu a.btn").removeClass("active btn-info");
    $(this).addClass("active btn-info");
  });
};

Tool.pencil = new Tool($("#toolbox a[name=pencil]")[0], 
  function(fx, fy){
    Painter.dotCurrentColor(fx, fy);
    this.px = fx;
    this.py = fy;
    return true;
  },
  function(fx, fy, tx, ty){
    Canvas.previewCanvas.drawLine(this.px, this.py, tx, ty, Palette.currentPalette);
    this.px = tx;
    this.py = ty;
    Painter.clipToMainCanvas(_offset_x, _offset_y, Canvas.scaling);
  },
  function(fx, fy){
  }
);

Tool.line = new Tool($("#toolbox a[name=line]")[0], 
  function(fx, fy){
    Painter.dotCurrentColor(fx, fy);
    return true;
  },
  function(fx, fy, tx, ty){
    Painter.restoreCurrentBackup();
    Canvas.previewCanvas.drawLine(fx, fy, tx, ty, Palette.currentPalette);
    Painter.clipToMainCanvas(_offset_x, _offset_y, Canvas.scaling);
  },
  function(fx, fy){
  }
);


// 
// 
// preDraw: function(position) {
//   var tool = getCurrentTool();
//   if (tool == "spoit") {
//     drawSpoit(position[0], position[1]);
//     return;
//   }
//   
//   if (tool == "pencil") {
//     dotCurrentColor(position[0], position[1]);
//   } else if (tool == "bucket") {
//     drawBucket(position[0], position[1]);
//   }
// 
//   _is_drawing = true;
//   _draw_from = position;
// },
// 
// draw: function(position) {
//   var tool = getCurrentTool();
//   if (tool == "pencil") {
//     dotCurrentColor(position[0], position[1]);
//   } else if (tool == "line") {
//     restoreCurrentBackup();
//     drawLine(_offset_x + _draw_from[0], _offset_y + _draw_from[1], _offset_x + position[0], _offset_y + position[1]);
//   } else if (tool == "rect") {
//     restoreCurrentBackup();
//     drawRect(_offset_x + _draw_from[0], _offset_y + _draw_from[1], _offset_x + position[0], _offset_y + position[1]);    
//   } else if (tool == "oval") {
//     restoreCurrentBackup();
//     drawOval(_offset_x + _draw_from[0], _offset_y + _draw_from[1], _offset_x + position[0], _offset_y + position[1]);    
//   }
// },
// 
// afterDraw: function() {
//   _is_drawing = false;
//   var tool = getCurrentTool();
//   if (tool == "pencil") {
//   } else if (tool == "line") { 
//   } else if (tool == "rect") { 
//   }
//   backupCurrent();
//   return _is_drawing;
// }
// 
// var drawLine = function(fx, fy, tx, ty) {
//   _previewCanvas.drawLine(fx, fy, tx, ty, Palette.currentPalette);
//   clipToMainCanvas(_offset_x, _offset_y, _scaling);
// }
// 
// var drawRect = function(fx, fy, tx, ty) {
//   _previewCanvas.drawRect(Math.min(fx,tx), Math.min(fy,ty), Math.abs(tx-fx)+1, Math.abs(ty-fy)+1, Palette.currentPalette);
//   clipToMainCanvas(_offset_x, _offset_y, _scaling);
// }
// 
// var drawOval = function(fx, fy, tx, ty) {
//   _previewCanvas.drawOval(fx, fy, tx, ty, Palette.currentPalette);
//   clipToMainCanvas(_offset_x, _offset_y, _scaling);
// }
// 
// var drawBucket = function(cx, cy) {
//   _previewCanvas.drawBucket(cx, cy, Palette.currentPalette);
//   clipToMainCanvas(_offset_x, _offset_y, _scaling);
// }
// 
// var drawSpoit = function(cx, cy) {
// }
// 
// var undo = function() {
//   if (_backupIndex >= 1) {
//     _backupIndex--;
//     restoreWithCanvas(_backupCanvas[_backupIndex]);
//     clipToMainCanvas(_offset_x, _offset_y, _scaling);
//   }
// }
// 
// var redo = function() {
//   var nextBackupCanvas = $("canvas.backupcanvas.current").next()[0];
//   if (_backupIndex < _backupCanvas.length - 1) {
//     _backupIndex++;
//     restoreWithCanvas(_backupCanvas[_backupIndex]);
//     clipToMainCanvas(_offset_x, _offset_y, _scaling);
//   }
// }
