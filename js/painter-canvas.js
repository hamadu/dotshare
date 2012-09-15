Canvas = function(element, width, height, options) {
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
        this.data[i][j] = Palette.paletteList[0];
      }
    }
  }
  Canvas.list.push(this);
}

Canvas.CANVAS_SIZE = 512;
Canvas.PREVIEW_SIZE = 128;
Canvas.scaling = 8;

Canvas.list = [];
Canvas.backupList = [];
Canvas.backupIndex = -1;

Canvas.setup = function() {
  Canvas.mainCanvas = new Canvas($('#dotcanvas')[0], Canvas.CANVAS_SIZE, Canvas.CANVAS_SIZE, {});
  
  Canvas.previewCanvas = new Canvas($('#previewcanvas')[0], Canvas.PREVIEW_SIZE, Canvas.PREVIEW_SIZE,
    {containData: true}
  );  
  
  Canvas.setupScale(8);
}

Canvas.setupGrid = function(scaling) {
  var dotSize = scaling;
  var size = Canvas.CANVAS_SIZE;
  
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
}

Canvas.setupScale = function(scaling) {
  if (scaling <= 2 || scaling >= 64) {
    return;
  }

  $("#zoom_rate").html(scaling);
  Canvas.scaling = scaling;
  Canvas.setupGrid(scaling);
  
  Painter.clipToMainCanvas(0, 0, scaling);
  Painter.setupCliprect(scaling);
}

Canvas.prototype = {
  constructor: Canvas,
  
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
