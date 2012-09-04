var CANVAS_SIZE = 512;
var DOT_SIZE = 32;

var _is_drawing = false;

window.onload = function() {
  setupGrid();
  
  setupPalette();

  setupPaintEvent();
  
  setupPicker();
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

var setupGrid = function() {
  var gridCanvas = $('#gridcanvas')[0];
  var ctx = gridCanvas.getContext('2d');
  ctx.strokeStyle = 'rgba(127, 127, 127, 0.5)';
  for (var y = 0 ; y < CANVAS_SIZE / DOT_SIZE ; y++) {
    for (var x = 0 ; x < CANVAS_SIZE / DOT_SIZE ; x++) {
      ctx.beginPath();
      
      // holizonal
      ctx.moveTo(x * DOT_SIZE, y * DOT_SIZE);
      ctx.lineTo(x * DOT_SIZE + (DOT_SIZE - 1), y * DOT_SIZE);
      
      // vertical
      ctx.moveTo(x * DOT_SIZE, y * DOT_SIZE);
      ctx.lineTo(x * DOT_SIZE, y * DOT_SIZE + (DOT_SIZE - 1));
      
      ctx.stroke();
    }
  }
} 

var setupPaintEvent = function() {
  $('#gridcanvas').mousedown(function(e) {
    var px = Math.floor(e.offsetX / DOT_SIZE);
    var py = Math.floor(e.offsetY / DOT_SIZE);
    dot(px, py);
    _is_drawing = true;
  });

  $('#gridcanvas').mousemove(function(e) {
    if (_is_drawing) {
      var px = Math.floor(e.offsetX / DOT_SIZE);
      var py = Math.floor(e.offsetY / DOT_SIZE);
      dot(px, py);
    }
  });

  $('#gridcanvas').mouseup(function(e) {
    _is_drawing = false;
  });

  $('#gridcanvas').mouseout(function(e) {
    _is_drawing = false;
  });
}

var dot = function(x, y) {
  var currentColor = $(".colorbox.selected").css("background-color");
  var dotCanvas = $('#dotcanvas')[0];
  var ctx = dotCanvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = currentColor;
  ctx.fillRect(x * DOT_SIZE, y * DOT_SIZE, DOT_SIZE, DOT_SIZE);
  
  var previewCanvas = $('#previewcanvas')[0];
  ctx = previewCanvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = currentColor;
  ctx.fillRect(x, y, 1, 1);
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