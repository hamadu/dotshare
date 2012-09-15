Painter.Canvas = function(){
  var _SIZE = 512;
  var _PREVIEW_SIZE = 128;
  var _scaling = 8;
  
  var _mainCanvas;
  var _previewCanvas;

  var _backupList = [];
  var _backupIndex = -1;
  
  var _offset_x = 0;
  var _offset_y = 0;
  
  var _setupGrid = function(scaling) {
    var dotSize = scaling;
    var size = _SIZE;
    var gridCanvas = $('#gridcanvas')[0];
    var ctx = gridCanvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(127, 127, 127, 0.5)';
    for (var y = 0 ; y < size / dotSize ; y++) {
      for (var x = 0 ; x < size / dotSize ; x++) {
        ctx.beginPath();
      
        // holizonal
        ctx.moveTo(x * dotSize, y * dotSize);
        ctx.lineTo(x * dotSize + (dotSize - 1), y * dotSize);
      
        // vertical
        ctx.moveTo(x * dotSize, y * dotSize);
        ctx.lineTo(x * dotSize, y * dotSize + (dotSize - 1));
      
        ctx.stroke();
      }
    }
  };
  
  //
  // Painter.Canvas.PaintCanvas
  //
  var PaintCanvas = function(element, width, height, options) {
    this.element = element;
    this.$element = $(element);

    this.width = width;
    this.height = height;
    this.options = options;

    this.context = element.getContext('2d');
    if (this.options.containData) {
      this.data = new Array();
      for (var i = 0 ; i < height ; i++) {
        this.data.push(new Array(width));
      }
      for (var i = 0 ; i < height ; i++) {
        for (var j = 0 ; j < width ; j++) {
          this.data[i][j] = Painter.Palette.getPaletteList(0);
        }
      }
    }
  };
  
  //
  // Painter.Canvas.PaintCanvas.prototype
  //
  PaintCanvas.prototype = {
    constructor: PaintCanvas,
    
    getColorPalette: function(x, y) {
      return this.data[y][x];
    },
  
    drawDot: function(x, y, palette) {
      this.drawRect(x, y, 1, 1, palette);
    },
  
    drawRect: function(x, y, w, h, palette) {
      this.context.fillStyle = palette.color.toRGBAString();
      this.context.fillRect(x, y, w, h);
      if (this.options.containData) {
        for (var i = y ; i < y + h ; i++) {
          for (var j = x ; j < x + w ; j++) {
            this.data[i][j] = palette;
          }
        }
      }
    },
  
    drawLine: function(fx, fy, tx, ty, palette) {
      if (tx == fx) {
        for (var y = fy ; ; y += (ty > fy) ? 1 : -1) {
          this.drawDot(fx, y, palette);
          if (y == ty) {
            break;
          }
        }    
      } else {
        var dy = 1.0 * (ty - fy) / (Math.abs(tx - fx) + 1);
        var nowy = fy;
        for (var x = fx ; ; x += (tx > fx) ? 1 : -1) {
          var tty = fy+dy*(Math.abs(x-fx)+1)-((ty > fy) ? 0.5 : -0.5);
          this.drawDot(x, nowy, palette);
          while (true) {
            if (dy > 0) {
              if (nowy >= tty) {
                break;
              }
              this.drawDot(x, nowy, palette);
              nowy++;
            } else {
              if (nowy <= tty) {
                break;
              }
              this.drawDot(x, nowy, palette);
              nowy--;
            }
          }
          if (x == tx) {
            break;
          }
        }
      }
    },
  
    drawOval: function(fx, fy, tx, ty, palette) {
      if (fx > tx) {
        var tmp = tx;
        tx = fx;
        fx = tmp;
      }
      if (fy > ty) {
        var tmp = ty;
        ty = fy;
        fy = tmp;
      }
      if (tx == fx) {
        for (var y = fy ; y <= ty ; y++) {
          this.drawDot(fx, y, palette);
        }    
      } else {
        var a = (tx - fx) / 2;
        var b = (ty - fy) / 2;
        var cx = fx + a;
        var cy = fy + b;
        var prevy1 = Math.floor(cy+0.5);
        var prevy2 = Math.floor(cy-0.5);
        for (var x = fx ; x <= cx ; x++) {
          var dy = b*Math.sqrt(1.0-((0.5+x-cx)*(0.5+x-cx)/(a*a)));
          this.drawDot
          this.drawDot(x, prevy1, palette);
          this.drawDot(tx-(x-fx), prevy1, palette);
          this.drawDot(x, ty-(prevy1-fy), palette);
          this.drawDot(tx-(x-fx), ty-(prevy1-fy), palette);
          while (prevy1 < ty) {
            if (prevy1 > Math.floor(cy+dy)) {
              break;
            }
            this.drawDot(x, prevy1, palette);
            this.drawDot(tx-(x-fx), prevy1, palette);
            this.drawDot(x, ty-(prevy1-fy), palette);
            this.drawDot(tx-(x-fx), ty-(prevy1-fy), palette);
            prevy1++;
          }
        }
      }
    },
  
    drawBucket: function(cx, cy, palette) {
      var dx = [1, 0, -1, 0];
      var dy = [0, 1, 0, -1];
      var flagArray = Array(this.width * this.height);
      var queueArray = Array(this.width * this.height * 2);
      var queueFront = 0;
      var queueEnd = 0;
    
      var paletteIdx = this.data[cy][cx].idx;
    
      queueArray[queueEnd++] = cx;
      queueArray[queueEnd++] = cy;
      this.drawDot(cx, cy, palette);
      flagArray[cy*this.width+cx] = true;
      while (queueFront < queueEnd) {
        var x = queueArray[queueFront++];
        var y = queueArray[queueFront++];
        for (var d = 0 ; d < 4 ; d++) {
          var tx = x + dx[d];
          var ty = y + dy[d];
          if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) {
            continue;
          }
          if (!flagArray[ty*this.width+tx] && this.data[ty][tx].idx == paletteIdx) {
            flagArray[ty*this.width+tx] = true;
            queueArray[queueEnd++] = tx;
            queueArray[queueEnd++] = ty;
            this.drawDot(tx, ty, palette);
          }
        }
      }
    },

    copyRectTo: function(fx, fy, fw, fh, toCanvas, tx, ty) {
      if (!toCanvas) {
        return;
      }
      toCanvas.context.drawImage(this.element, fx, fy, fw, fh, tx, ty, fw, fh);
      if (this.options.containData && toCanvas.options.containData) {
        for (var i = fy ; i < fy + fh ; i++) {
          for (var j = fx ; j < fx + fw ; j++) {
            toCanvas.data[ty+i][tx+j] = this.data[i][j];
          }
        }
      }
    },

    clearRect: function() {
      this.context.clearRect(0, 0, this.width, this.height);
    },
  
    remapColor: function(palette) {
      for (var i = 0 ; i < this.height ; i++) {
        for (var j = 0 ; j < this.width ; j++) {
          if (this.data[i][j].idx == palette.idx) {
            this.drawDot(j, i, palette);
          }
        }
      }
    }
  }
  //==
  
  //
  // Painter.Canvas(public)
  //
  return {
    getScaling: function() {
      return _scaling;
    },

    getMainCanvas: function() {
      return _mainCanvas;
    },
    
    getPreviewCanvas: function() {
      return _previewCanvas;
    },
    
    getOffsetX: function() {
      return _offset_x;
    },
    
    getOffsetY: function() {
      return _offset_y;
    },
    
    setScale: function(scaling) {
      if (scaling <= 2 || scaling >= 64) {
        return;
      }
      $("#zoom_rate").html(scaling);
      this.clipToMainCanvas(0, 0, scaling);
      this.setupCliprect(scaling);
      _setupGrid(scaling);
      _scaling = scaling;
    },
    
    setup: function() {
      _mainCanvas = new PaintCanvas($('#dotcanvas')[0], _SIZE, _SIZE, {});
  
      _previewCanvas = new PaintCanvas($('#previewcanvas')[0], _PREVIEW_SIZE, _PREVIEW_SIZE,
        {containData: true}
      );
  
      this.setScale(8);
    },
    
    scaleUp: function() {
      this.setScale(_scaling * 2);
    },

    scaleDown: function() {
      this.setScale(_scaling / 2);
    },
  
    dot: function(x, y, offsetx, offsety, color) {
      _mainCanvas.drawRect(x * _scaling, y * _scaling, _scaling, _scaling, Painter.Palette.getCurrentPalette());
      _previewCanvas.drawDot(offsetx+x, offsety+y, Painter.Palette.getCurrentPalette());
    },
  
    dotCurrentColor: function(x, y) {
      var currentColor = $(".colorbox.selected").css("background-color");
      this.dot(x, y, _offset_x, _offset_y, currentColor);
    },
  
    // clip: function(fx, fy, scaling) {
    //   _mainCanvas.clearRect();
    //   var lengthPerLine = Math.floor(_SIZE / scaling);
    //   var dataArray = _previewCanvas.context.getImageData(fx, fy, lengthPerLine, lengthPerLine).data;
    //   for (var i = 0 ; i < lengthPerLine ; i++) {
    //     for (var j = 0 ; j < lengthPerLine ; j++) {
    //       var r = dataArray[(i*lengthPerLine*4)+j*4];
    //       var g = dataArray[(i*lengthPerLine*4)+j*4+1];
    //       var b = dataArray[(i*lengthPerLine*4)+j*4+2];
    //       var a = dataArray[(i*lengthPerLine*4)+j*4+3];
    //       dot(j, i, fx, fy, Color.toRGBAString(r,g,b,a));
    //     }
    //   }
    // },
    
    clip: function() {
      this.clipToMainCanvas(_offset_x, _offset_y, _scaling);
    },

    clipToMainCanvas: function(fx, fy, scaling) {
      _mainCanvas.clearRect();
      var lengthPerLine = Math.floor(_SIZE / scaling);
      for (var i = 0 ; i < lengthPerLine ; i++) {
        for (var j = 0 ; j < lengthPerLine ; j++) {
          _mainCanvas.drawRect(j * scaling, i * scaling, scaling, scaling, _previewCanvas.data[i+fy][j+fx]);
        }
      }
    },
  
    setupCliprect: function(scaling) {
      $("#cliprect").css("width", _SIZE / scaling).css("height", _SIZE / scaling);
      $("#cliprect").draggable({
        containment: "#previewcanvas",
        drag: function(e) {
          var leftpx = $("#cliprect").css("left");
          var toppx = $("#cliprect").css("top");
          _offset_x = leftpx.substr(0, leftpx.length-2)-1;
          _offset_y = toppx.substr(0, toppx.length-2)-1;
          Painter.Canvas.clipToMainCanvas(_offset_x, _offset_y, _scaling);
        }
      });
    },

    backupCurrent: function() {
      var backupCanvas = $("<canvas/>").addClass("backupcanvas").attr("width", _PREVIEW_SIZE).attr("height", _PREVIEW_SIZE)[0];
      _backupIndex++;
      _backupList[_backupIndex] = new PaintCanvas(backupCanvas, _PREVIEW_SIZE, _PREVIEW_SIZE,
        {containData: true}
      );
      _previewCanvas.copyRectTo(0, 0, _PREVIEW_SIZE, _PREVIEW_SIZE, _backupList[_backupIndex], 0, 0);
      $("#backupcanvas_container").append(backupCanvas);
    },

    restoreWithCanvas: function(canvas) {
      _previewCanvas.clearRect();
      canvas.copyRectTo(0, 0, _PREVIEW_SIZE, _PREVIEW_SIZE, _previewCanvas, 0, 0);
    },

    restoreCurrentBackup: function() {
      if (_backupIndex >= 0) {
        this.restoreWithCanvas(_backupList[_backupIndex]);
      }
    },

    removeLastBackup: function() {
      $("canvas.backupcanvas :last").remove();
    },
    
    undo: function(){
      if (_backupIndex >= 1) {
        _backupIndex--;
        this.restoreCurrentBackup();
        this.clipToMainCanvas(_offset_x, _offset_y, _scaling);
      }
    },
    
    redo: function(){
      if (_backupIndex < _backupList.length - 1) {
        _backupIndex++;
        this.restoreCurrentBackup();
        this.clipToMainCanvas(_offset_x, _offset_y, _scaling);
      }
    }
  }
}();













