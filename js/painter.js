var CANVAS_SIZE = 512;
var PREVIEW_SIZE = 128;
var _scaling = 32;
var _is_drawing = false;
var _draw_from = [];
var _offset_x = 0;
var _offset_y = 0;
var _tool = "";

window.onload = function() {
  setupScale(8);
  
  setupPalette();

  setupPaintEvent();
  
  setupPicker();
  
  setupFileLoader();
  
  setupToolbox();
  
  setupShortcuts();

  backupCurrent();
}

var setupPalette = function() {
  addPalette(0, 0, 0).addClass("selected");
  addPalette(255, 255, 255);
  for (var r = 15 ; r <= 256 ; r += 16) {
    addPalette(r, 0, 0);
  }
  for (var r = 15 ; r <= 256 ; r += 16) {
    addPalette(0, r, 0);
  }
  for (var r = 15 ; r <= 256 ; r += 16) {
    addPalette(0, 0, r);
  }
  for (var em = 0 ; em < 32 ; em++) {
    addPalette(255, 255, 255);
  }
}

var isLikeBlack = function(r, g, b) {
  return (r + g + b) / 3 <= 127;
}

var addPalette = function(r, g, b) {
  var palette = $("<div/>").addClass("colorbox").css("background-color", rgb(r, g, b));
  if (isLikeBlack(r, g, b)) {
    palette.addClass("likeblack");
  }
  
  $("#palette_container").append(palette);
  palette.click(function(){
    $(".colorbox").removeClass("selected");
    $(this).addClass("selected");
    
    var rgb = $(".colorbox.selected").css("background-color");
    updatePicker(rgb);
  });
  
  return palette;
}

var rgb = function(r, g, b) {
  return "rgb(_r, _g, _b)".replace("_r", r).replace("_g", g).replace("_b", b);
}

var rgba = function(r, g, b, a) {
  return "rgba(_r, _g, _b, _a)".replace("_r", r).replace("_g", g).replace("_b", b).replace("_a", a);
}

var setupGrid = function(scaling) {
  var dotSize = scaling;
  
  var gridCanvas = $('#gridcanvas')[0];
  var ctx = gridCanvas.getContext('2d');
  
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  
  ctx.strokeStyle = 'rgba(127, 127, 127, 0.5)';
  for (var y = 0 ; y < CANVAS_SIZE / dotSize ; y++) {
    for (var x = 0 ; x < CANVAS_SIZE / dotSize ; x++) {
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

var getClickPosition = function(e) {
  var offsetX = e.pageX - 160;
  var offsetY = e.pageY - 64;
  return [Math.floor(offsetX / _scaling), Math.floor(offsetY / _scaling)];
}

var setupPaintEvent = function() {
  $('#gridcanvas').mousedown(function(e) {
    drawStart(getClickPosition(e));
  });

  $('#gridcanvas').mousemove(function(e) {
    if (_is_drawing) {
      drawing(getClickPosition(e));
    }
  });

  $('#gridcanvas').mouseup(function(e) {
    if (_is_drawing) {
      drawEnd();
    }
  });

  $('#gridcanvas').mouseout(function(e) {
    if (_is_drawing) {
      drawEnd();
    }
  });
}

var dot = function(x, y, offsetx, offsety, color) {
  var dotCanvas = $('#dotcanvas')[0];
  var ctx = dotCanvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(x * _scaling, y * _scaling, _scaling, _scaling);
  
  var previewCanvas = $('#previewcanvas')[0];
  ctx = previewCanvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(offsetx+x, offsety+y, 1, 1);
}

var dotCurrentColor = function(x, y) {
  var currentColor = $(".colorbox.selected").css("background-color");
  dot(x, y, _offset_x, _offset_y, currentColor);
}

var setupPicker = function() {
  $('#current_color').colorpicker().on('changeColor', function(ev){
    var rgb = ev.color.toRGB();
    updateColor(rgb.r, rgb.g, rgb.b);
  });
}

var updatePicker = function(rgb) {
  $("#current_color i").css("background-color", rgb);
  $("#current_color input").val(rgb);
  $("#current_color").data("color", rgb);
    
  var picker = $("#current_color").data("colorpicker");
  picker.update();
}

var updateColor = function(r, g, b) {
  $(".colorbox.selected").css("background-color", rgb(r, g, b));
}

var setupScale = function(scaling) {
  if (scaling <= 2 || scaling >= 64) {
    return;
  }
  
  $("#zoom_rate").html(scaling);
  _scaling = scaling;
  setupGrid(scaling);
  
  clip(0, 0, scaling);
  setupCliprect(scaling);
}

var clip = function(fx, fy, scaling) {
  var previewCanvas = $("#previewcanvas")[0];
  var previewCtx = previewCanvas.getContext('2d');

  var dotCanvas = $('#dotcanvas')[0];
  var dotCtx = dotCanvas.getContext('2d');

  dotCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  var lengthPerLine = Math.floor(CANVAS_SIZE / scaling);
  var dataArray = previewCtx.getImageData(fx, fy, lengthPerLine, lengthPerLine).data;
  for (var i = 0 ; i < lengthPerLine ; i++) {
    for (var j = 0 ; j < lengthPerLine ; j++) {
      var r = dataArray[(i*lengthPerLine*4)+j*4];
      var g = dataArray[(i*lengthPerLine*4)+j*4+1];
      var b = dataArray[(i*lengthPerLine*4)+j*4+2];
      var a = dataArray[(i*lengthPerLine*4)+j*4+3];
      if (a > 0) {
        dot(j, i, fx, fy, rgb(r,g,b));
      }
    }
  }
}

var scaleUp = function() {
  setupScale(_scaling * 2);
}

var scaleDown = function() {
  setupScale(_scaling / 2);
}


var setupFileLoader = function() {
  $("#files").change(loadDot);
}

var saveDot = function() {
  var previewCanvas = $('#previewcanvas')[0];
  var url = previewCanvas.toDataURL();
  window.open(url);
}

var loadDot = function(e) {
  var files = e.target.files;
  if (files.length == 1) {
    var reader = new FileReader;
    reader.onload = function(event) {
        var img = new Image;
        img.onload = function() {
          var previewCanvas = $('#previewcanvas')[0];
          var previewCtx = previewCanvas.getContext('2d');
          previewCtx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
          previewCtx.drawImage(img, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
          setupScale(8);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(files[0]);
  }
}

var stripPx = function(xpx) {
  return xpx.substr(0, xpx.length-2);
}

var setupCliprect = function(scaling) {
  $("#cliprect").css("width", CANVAS_SIZE / scaling).css("height", CANVAS_SIZE / scaling);
  $("#cliprect").draggable({
    containment: "#previewcanvas",
    drag: function(e) {
      var leftpx = $("#cliprect").css("left");
      var toppx = $("#cliprect").css("top");
      _offset_x = stripPx(leftpx)-1;
      _offset_y = stripPx(toppx)-1;
      clip(_offset_x, _offset_y, _scaling);
    }
  });
}

var setupToolbox = function() {
  $("#toolbox_mainmenu a.btn").click(function(){
    $("#toolbox_mainmenu a.btn").removeClass("active btn-info");
    $(this).addClass("active btn-info");
  });
}

var backupCurrent = function() {
  var currentCanvas = $("#previewcanvas")[0];
  var backupCanvas = $("<canvas/>").addClass("backupcanvas current").attr("width", PREVIEW_SIZE).attr("height", PREVIEW_SIZE)[0];
  var backupCtx = backupCanvas.getContext('2d');
  backupCtx.drawImage(currentCanvas, 0, 0);
  
  $("#backupcanvas_container canvas").removeClass("current");
  $("#backupcanvas_container").append(backupCanvas);
}

var restoreWithCanvas = function(canvas) {
  var previewCanvas = $('#previewcanvas')[0];
  var previewCtx = previewCanvas.getContext('2d');
  previewCtx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
  previewCtx.drawImage(canvas, 0, 0);  
}

var restoreCurrentBackup = function() {
  restoreWithCanvas($("canvas.backupcanvas.current")[0]);
}

var removeLastBackup = function() {
  $("canvas.backupcanvas :last").remove();
}

var getCurrentTool = function() {
  return $("#toolbox_mainmenu .active").attr("name");
}

var drawStart = function(position) {
  var tool = getCurrentTool();
  if (tool == "spoit") {
    drawSpoit(position[0], position[1]);
    return;
  }
  
  if (tool == "pencil") {
    dotCurrentColor(position[0], position[1]);
  } else if (tool == "bucket") {
    drawBucket(position[0], position[1]);
  }

  _is_drawing = true;
  _draw_from = position;
}

var drawing = function(position) {
  var tool = getCurrentTool();
  if (tool == "pencil") {
    dotCurrentColor(position[0], position[1]);
  } else if (tool == "line") {
    restoreCurrentBackup();
    drawLine(_offset_x + _draw_from[0], _offset_y + _draw_from[1], _offset_x + position[0], _offset_y + position[1]);
  } else if (tool == "rect") {
    restoreCurrentBackup();
    drawRect(_offset_x + _draw_from[0], _offset_y + _draw_from[1], _offset_x + position[0], _offset_y + position[1]);    
  } else if (tool == "oval") {
    restoreCurrentBackup();
    drawOval(_offset_x + _draw_from[0], _offset_y + _draw_from[1], _offset_x + position[0], _offset_y + position[1]);    
  }
}

var drawEnd = function() {
  _is_drawing = false;
  var tool = getCurrentTool();
  if (tool == "pencil") {
  } else if (tool == "line") { 
  } else if (tool == "rect") { 
  }
  
  backupCurrent();
  
  return _is_drawing;
}

var drawLine = function(fx, fy, tx, ty) {
  var previewCanvas = $('#previewcanvas')[0];
  var previewCtx = previewCanvas.getContext('2d');
  var currentColor = $(".colorbox.selected").css("background-color");
  previewCtx.fillStyle = currentColor;

  if (tx == fx) {
    for (var y = fy ; ; y += (ty > fy) ? 1 : -1) {
      previewCtx.fillRect(fx, y, 1, 1);
      if (y == ty) {
        break;
      }
    }    
  } else {
    var dy = 1.0 * (ty - fy) / (Math.abs(tx - fx) + 1);
    var nowy = fy;
    for (var x = fx ; ; x += (tx > fx) ? 1 : -1) {
      var tty = fy+dy*(Math.abs(x-fx)+1)-((ty > fy) ? 0.5 : -0.5);
      previewCtx.fillRect(x, nowy, 1, 1);
      while (true) {
        if (dy > 0) {
          if (nowy >= tty) {
            break;
          }
          previewCtx.fillRect(x, nowy, 1, 1);
          nowy++;
        } else {
          if (nowy <= tty) {
            break;
          }
          previewCtx.fillRect(x, nowy, 1, 1);
          nowy--;
        }
      }
      if (x == tx) {
        break;
      }
    }
  }
  clip(_offset_x, _offset_y, _scaling);
}

var drawRect = function(fx, fy, tx, ty) {
  var previewCanvas = $('#previewcanvas')[0];
  var previewCtx = previewCanvas.getContext('2d');
  var currentColor = $(".colorbox.selected").css("background-color");
  previewCtx.fillStyle = currentColor;
  previewCtx.fillRect(Math.min(fx,tx), Math.min(fy,ty), Math.abs(tx-fx)+1, Math.abs(ty-fy)+1);
  clip(_offset_x, _offset_y, _scaling);
}

var drawOval = function(fx, fy, tx, ty) {
  var previewCanvas = $("#previewcanvas")[0];
  var previewCtx = previewCanvas.getContext('2d');
  var currentColor = $(".colorbox.selected").css("background-color");
  previewCtx.fillStyle = currentColor;

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
      previewCtx.fillRect(fx, y, 1, 1);
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
      previewCtx.fillRect(x, prevy1, 1, 1);
      previewCtx.fillRect(tx-(x-fx), prevy1, 1, 1);
      previewCtx.fillRect(x, ty-(prevy1-fy), 1, 1);
      previewCtx.fillRect(tx-(x-fx), ty-(prevy1-fy), 1, 1);
      while (prevy1 < ty) {
        if (prevy1 > Math.floor(cy+dy)) {
          break;
        }
        previewCtx.fillRect(x, prevy1, 1, 1);
        previewCtx.fillRect(tx-(x-fx), prevy1, 1, 1);
        previewCtx.fillRect(x, ty-(prevy1-fy), 1, 1);
        previewCtx.fillRect(tx-(x-fx), ty-(prevy1-fy), 1, 1);
        prevy1++;
      }
    }
  }
  clip(_offset_x, _offset_y, _scaling);
}

var getRGBStringFromDataArray = function(array, x, y, w, h) {
  var rgbarr = getRGBAFromDataArray(array, x, y, w, h);
  return rgb(rgbarr[0],rgbarr[1],rgbarr[2]);
}

var getRGBAStringFromDataArray = function(array, x, y, w, h) {
  var rgbarr = getRGBAFromDataArray(array, x, y, w, h);
  return rgba(rgbarr[0],rgbarr[1],rgbarr[2], rgbarr[3]);
}

var getRGBAFromDataArray = function(array, x, y, w, h) {
  var r = array[(y*w*4)+x*4];
  var g = array[(y*w*4)+x*4+1];
  var b = array[(y*w*4)+x*4+2];
  var a = array[(y*w*4)+x*4+3];
  return [r,g,b,a];
}

var drawBucket = function(cx, cy) {
  var previewCanvas = $("#previewcanvas")[0];
  var previewCtx = previewCanvas.getContext('2d');
  var currentColor = $(".colorbox.selected").css("background-color");
  previewCtx.fillStyle = currentColor;
  
  var dataArray = previewCtx.getImageData(0, 0, PREVIEW_SIZE, PREVIEW_SIZE).data;
  var dx = [1, 0, -1, 0];
  var dy = [0, 1, 0, -1];
  var baseColor = getRGBAStringFromDataArray(dataArray, cx, cy, PREVIEW_SIZE, PREVIEW_SIZE);
  var flagArray = Array(PREVIEW_SIZE * PREVIEW_SIZE);
  var queueArray = Array(PREVIEW_SIZE * PREVIEW_SIZE * 2);
  var queueFront = 0;
  var queueEnd = 0;
  queueArray[queueEnd++] = cx;
  queueArray[queueEnd++] = cy;
  previewCtx.fillRect(cx, cy, 1, 1);
  flagArray[cy*PREVIEW_SIZE+cx] = true;
  while (queueFront < queueEnd) {
    var x = queueArray[queueFront++];
    var y = queueArray[queueFront++];
    for (var d = 0 ; d < 4 ; d++) {
      var tx = x + dx[d];
      var ty = y + dy[d];
      if (tx < 0 || ty < 0 || tx >= PREVIEW_SIZE || ty >= PREVIEW_SIZE) {
        continue;
      }
      if (!flagArray[ty*PREVIEW_SIZE+tx] && getRGBAStringFromDataArray(dataArray, tx, ty, PREVIEW_SIZE, PREVIEW_SIZE) == baseColor) {
        flagArray[ty*PREVIEW_SIZE+tx] = true;
        queueArray[queueEnd++] = tx;
        queueArray[queueEnd++] = ty;
        previewCtx.fillRect(tx, ty, 1, 1);
      }
    }
  }
  clip(_offset_x, _offset_y, _scaling);
}

var drawSpoit = function(cx, cy) {
  var previewCanvas = $("#previewcanvas")[0];
  var previewCtx = previewCanvas.getContext('2d');
  var currentColor = $(".colorbox.selected").css("background-color");
  var dataArray = previewCtx.getImageData(0, 0, PREVIEW_SIZE, PREVIEW_SIZE).data;
  var rgbarr = getRGBAFromDataArray(dataArray, cx, cy, PREVIEW_SIZE, PREVIEW_SIZE);
  
  addPalette(rgbarr[0], rgbarr[1], rgbarr[2]).click();
}

var undo = function() {
  var prevBackupCanvas = $("canvas.backupcanvas.current").prev()[0];
  if (prevBackupCanvas) {
    restoreWithCanvas(prevBackupCanvas);
    $("canvas.backupcanvas").removeClass("current");
    $(prevBackupCanvas).addClass("current");
    clip(_offset_x, _offset_y, _scaling);
  }
}

var redo = function() {
  var nextBackupCanvas = $("canvas.backupcanvas.current").next()[0];
  if (nextBackupCanvas) {
    restoreWithCanvas(nextBackupCanvas);
    $("canvas.backupcanvas").removeClass("current");
    $(nextBackupCanvas).addClass("current");
    clip(_offset_x, _offset_y, _scaling);
  }
}

var setupShortcuts = function() {
  $(document).bind('keydown', 'ctrl+z', undo);
  $(document).bind('keydown', 'ctrl+y', redo);
}