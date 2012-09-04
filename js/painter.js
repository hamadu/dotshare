var CANVAS_SIZE = 512;
var PREVIEW_SIZE = 128;
var _scaling = 32;
var _is_drawing = false;
var _offset_x = 0;
var _offset_y = 0;

window.onload = function() {
  setupScale(8);
  
  setupPalette();

  setupPaintEvent();
  
  setupPicker();
  
  setupFileLoader();
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
    var position = getClickPosition(e);
    dotCurrentColor(position[0], position[1]);
    _is_drawing = true;
  });

  $('#gridcanvas').mousemove(function(e) {
    if (_is_drawing) {
      var position = getClickPosition(e);
      dotCurrentColor(position[0], position[1]);
    }
  });

  $('#gridcanvas').mouseup(function(e) {
    _is_drawing = false;
  });

  $('#gridcanvas').mouseout(function(e) {
    _is_drawing = false;
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