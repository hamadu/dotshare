
Painter.Tool = function(element, preDraw, draw, afterDraw) {
  this.element = element;
  this.$element = $(element);

  this.preDraw = preDraw;
  this.draw = draw;
  this.afterDraw = afterDraw;
};

Painter.Tool.pencil = new Painter.Tool($("#toolbox a[name=pencil]")[0], 
  function(fx, fy){
    Painter.Canvas.dotCurrentColor(fx, fy);
    this.px = fx;
    this.py = fy;
    return true;
  },
  function(fx, fy, tx, ty){
    Painter.Canvas.getPreviewCanvas().drawLine(this.px, this.py, tx, ty, Painter.Palette.getCurrentPalette());
    this.px = tx;
    this.py = ty;
    Painter.Canvas.clip();
  },
  function(fx, fy){
  }
);

Painter.Tool.line = new Painter.Tool($("#toolbox a[name=line]")[0], 
  function(fx, fy){
    return true;
  },
  function(fx, fy, tx, ty){
    Painter.Canvas.restoreCurrentBackup();
    Painter.Canvas.getPreviewCanvas().drawLine(fx, fy, tx, ty, Painter.Palette.getCurrentPalette());
    Painter.Canvas.clip();
  },
  function(fx, fy){
  }
);

Painter.Tool.rect = new Painter.Tool($("#toolbox a[name=rect]")[0], 
  function(fx, fy){
    return true;
  },
  function(fx, fy, tx, ty){
    Painter.Canvas.restoreCurrentBackup();
    Painter.Canvas.getPreviewCanvas().drawRect(Math.min(fx,tx), Math.min(fy,ty), Math.abs(fx-tx)+1, Math.abs(fy-ty)+1, Painter.Palette.getCurrentPalette());
    Painter.Canvas.clip();
  },
  function(fx, fy){
  }
);

Painter.Tool.oval = new Painter.Tool($("#toolbox a[name=oval]")[0], 
  function(fx, fy){
    return true;
  },
  function(fx, fy, tx, ty){
    Painter.Canvas.restoreCurrentBackup();
    Painter.Canvas.getPreviewCanvas().drawOval(fx, fy, tx, ty, Painter.Palette.getCurrentPalette());
    Painter.Canvas.clip();
  },
  function(fx, fy){
  }
);

Painter.Tool.bucket = new Painter.Tool($("#toolbox a[name=bucket]")[0], 
  function(fx, fy){
    Painter.Canvas.getPreviewCanvas().drawBucket(fx, fy, Painter.Palette.getCurrentPalette());
    Painter.Canvas.clip();
  },
  function(fx, fy, tx, ty){
  },
  function(fx, fy){
  }
);

Painter.Tool.spoit = new Painter.Tool($("#toolbox a[name=spoit]")[0], 
  function(fx, fy){
  },
  function(fx, fy, tx, ty){
  },
  function(fx, fy){
  }
);

Painter.Toolbox = function() {
  return {
    getCurrentTool: function() {
      return Painter.Tool[$("#toolbox_mainmenu .active").attr("name")];
    },

    setup: function() {
      $("#toolbox_mainmenu a.btn").click(function(){
        $("#toolbox_mainmenu a.btn").removeClass("active btn-info");
        $(this).addClass("active btn-info");
      });
      $("#toolbox a[name=pencil]").click();
    }
  };
}();

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
