window.onload = function() {
  Palette.setup();

  Canvas.setup();
  
  Picker.setup();
  
  IO.setup();
  
  Tool.setup();
  
  Shortcuts.setup();

  Painter.setupPaintEvent();

  Painter.backupCurrent();
}

_is_drawing = false;
_draw_from = [];
_offset_x = 0;
_offset_y = 0;

Painter = {
  getClickPosition: function(e){
    var offsetX = e.pageX - 160;
    var offsetY = e.pageY - 64;
    return [Math.floor(offsetX / Canvas.scaling), Math.floor(offsetY / Canvas.scaling)];
  },
  
  scaleUp: function() {
    setupScale(Canvas.scaling * 2);
  },

  scaleDown: function() {
    setupScale(Canvas.scaling / 2);
  },
  
  dot: function(x, y, offsetx, offsety, color) {
    Canvas.mainCanvas.drawRect(x * Canvas.scaling, y * Canvas.scaling, Canvas.scaling, Canvas.scaling, Palette.currentPalette);
    Canvas.previewCanvas.drawDot(offsetx+x, offsety+y, Palette.currentPalette);
  },
  
  dotCurrentColor: function(x, y) {
    var currentColor = $(".colorbox.selected").css("background-color");
    Painter.dot(x, y, _offset_x, _offset_y, currentColor);
  },
  
  setupPaintEvent: function() {
    $('#gridcanvas').mousedown(function(e) {
      Painter.preDraw(Painter.getClickPosition(e));
    });

    $('#gridcanvas').mousemove(function(e) {
      if (_is_drawing) {
        Painter.draw(Painter.getClickPosition(e));
      }
    });

    $('#gridcanvas').mouseup(function(e) {
      if (_is_drawing) {
        Painter.afterDraw(Painter.getClickPosition(e));
      }
    });
  },


  preDraw: function(position) {
    var tool = Tool.getCurrentTool();
    if (!tool.preDraw(position[0], position[1])) {
      return;
    }
    _is_drawing = true;
    _draw_from = position;
  },

  draw: function(position) {
    var tool = Tool.getCurrentTool();
    tool.draw(_offset_x + _draw_from[0], _offset_y + _draw_from[1], _offset_x + position[0], _offset_y + position[1]);
  },

  afterDraw: function(position) {
    var tool = Tool.getCurrentTool();
    _is_drawing = false;
    tool.afterDraw(position[0], position[1]);
    Painter.backupCurrent();
  },
  
  clip: function(fx, fy, scaling) {
    var previewCanvas = $("#previewcanvas")[0];
    var previewCtx = previewCanvas.getContext('2d');

    var dotCanvas = $('#dotcanvas')[0];
    var dotCtx = dotCanvas.getContext('2d');

    dotCtx.clearRect(0, 0, Canvas.CANVAS_SIZE, Canvas.CANVAS_SIZE);
    var lengthPerLine = Math.floor(Canvas.CANVAS_SIZE / scaling);
    var dataArray = previewCtx.getImageData(fx, fy, lengthPerLine, lengthPerLine).data;
    for (var i = 0 ; i < lengthPerLine ; i++) {
      for (var j = 0 ; j < lengthPerLine ; j++) {
        var r = dataArray[(i*lengthPerLine*4)+j*4];
        var g = dataArray[(i*lengthPerLine*4)+j*4+1];
        var b = dataArray[(i*lengthPerLine*4)+j*4+2];
        var a = dataArray[(i*lengthPerLine*4)+j*4+3];
        dot(j, i, fx, fy, Color.toRGBAString(r,g,b,a));
      }
    }
  },

  clipToMainCanvas: function(fx, fy, scaling) {
    Canvas.mainCanvas.clearRect();
    var lengthPerLine = Math.floor(Canvas.mainCanvas.width / scaling);
    for (var i = 0 ; i < lengthPerLine ; i++) {
      for (var j = 0 ; j < lengthPerLine ; j++) {
        Canvas.mainCanvas.drawRect(j * Canvas.scaling, i * Canvas.scaling, Canvas.scaling, Canvas.scaling, Canvas.previewCanvas.data[i+fy][j+fx]);
      }
    }
  },
  
  setupCliprect: function(scaling) {
    $("#cliprect").css("width", Canvas.CANVAS_SIZE / scaling).css("height", Canvas.CANVAS_SIZE / scaling);
    $("#cliprect").draggable({
      containment: "#previewcanvas",
      drag: function(e) {
        var leftpx = $("#cliprect").css("left");
        var toppx = $("#cliprect").css("top");
        _offset_x = leftpx.substr(0, leftpx.length-2)-1;
        _offset_y = toppx.substr(0, toppx.length-2)-1;
        Painter.clipToMainCanvas(_offset_x, _offset_y, Canvas.scaling);
      }
    });
  },

  backupCurrent: function() {
    var currentCanvas = $("#previewcanvas")[0];
    var backupCanvas = $("<canvas/>").addClass("backupcanvas").attr("width", Canvas.PREVIEW_SIZE).attr("height", Canvas.PREVIEW_SIZE)[0];
    var backupCtx = backupCanvas.getContext('2d');
    Canvas.backupIndex++;
    Canvas.backupList[Canvas.backupIndex] = new Canvas(backupCanvas, Canvas.PREVIEW_SIZE, Canvas.PREVIEW_SIZE,
      {containData: true}
    );
    Canvas.previewCanvas.copyRectTo(0, 0, Canvas.PREVIEW_SIZE, Canvas.PREVIEW_SIZE, Canvas.backupList[Canvas.backupIndex], 0, 0);
    $("#backupcanvas_container").append(backupCanvas);
  },

  restoreWithCanvas: function(canvas) {
    Canvas.previewCanvas.clearRect();
    canvas.copyRectTo(0, 0, Canvas.PREVIEW_SIZE, Canvas.PREVIEW_SIZE, Canvas.previewCanvas, 0, 0);
  },

  restoreCurrentBackup: function() {
    if (Canvas.backupIndex >= 0) {
      Painter.restoreWithCanvas(Canvas.backupList[Canvas.backupIndex]);
    }
  },

  removeLastBackup: function() {
    $("canvas.backupcanvas :last").remove();
  }
}
