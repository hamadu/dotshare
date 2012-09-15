Painter.Palette = function(){
  var _paletteList = [];
  var _currentPalette = null;
  
  var _toRGBAString = function(r, g, b, a) {
    return "rgba(_r, _g, _b, _a)".replace("_r", r).replace("_g", g).replace("_b", b).replace("_a", a);
  };
  
  var _isLikeBlack = function(r, g, b) {
    return ((r + g + b) / 3 <= 127);
  }
  
  var _add = function(r, g, b) {
    var palette = new ColorPalette({r: r, g: g, b: b, a: 255}, {});
    var paletteDiv = $("<div/>").addClass("colorbox").css("background-color", palette.color.toRGBAString(r, g, b, 255)).data("palette", palette);
    if (palette.color.isLikeBlack(r, g, b)) {
      paletteDiv.addClass("likeblack");
    }
  
    $("#palette_container").append(paletteDiv);
    paletteDiv.click(function(){
      $(".colorbox").removeClass("selected");
      $(this).addClass("selected");
      palette.select();
      Painter.Palette.Picker.update(palette.color.toRGBString());
    });
    return paletteDiv;
  };
  
  // Painter.Palette.Color
  var Color = function(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  };
  Color.prototype = {
    constructor: Color,
  
    toRGBString: function() {
      return Painter.Palette.ColorUtil.toRGBString(this.r, this.g, this.b);
    },

    toRGBAString: function() {
      return Painter.Palette.ColorUtil.toRGBAString(this.r, this.g, this.b, this.a);
    },
   
    isLikeBlack: function() {
      return (this.r + this.g + this.b) / 3 <= 127;
    }
  };
  
  // Painter.Palette.ColorPalette
  var ColorPalette = function(color, options) {
    this.idx = _paletteList.length;
    this.color = new Color(color.r, color.g, color.b, color.a);
    this.options = options;
    _paletteList.push(this);
  };
  ColorPalette.prototype = {
    constructor: ColorPalette,
  
    select: function() {
      _currentPalette = this;
    },

    changeColor: function(r, g, b) {
      this.color = new Color(color.r, color.g, color.b, 255);
      for (var idx in Canvas.list) {
        Canvas.list[idx].remapColor(this);
      }
    }
  };
  
  return {
    setup: function(){
      for (var r = 0 ; r <= 255 ; r += 51) {
        for (var g = 0 ; g <= 255 ; g += 51) {
          for (var b = 0 ; b <= 255 ; b += 51) {
            if (r + g + b == 0) {
              _add(255, 255, 255).addClass("selected");
            } else {
              _add(r, g, b);
            }
          }    
        }
      }
      for (var row = 0 ; row < 3 ; row++) {
        for (var col = 0 ; col < 18 ; col++) {
          _add(255, 255, 255);
        }
      }
    },
    
    getCurrentPalette: function() {
      return _currentPalette;
    },
    
    getPaletteList: function(idx) {
      return _paletteList[idx];
    }
  }
}();


Painter.Palette.ColorUtil = function() {
  return {
    toRGBStringFromColor: function(color) {
        return this.toRGBString(color.r, color.g, color.b);
    },

    toRGBAStringFromColor: function(color) {
        return this.toRGBAString(color.r, color.g, color.b, color.a);
    },
    
    toRGBString: function(r, g, b) {
        return "rgb(_r, _g, _b)".replace("_r", r).replace("_g", g).replace("_b", b);
    },
    
    toRGBAString: function(r, g, b, a) {
        return "rgba(_r, _g, _b, _a)".replace("_r", r).replace("_g", g).replace("_b", b).replace("_a", a);
    }
  };
}();

Painter.Palette.Picker = function() {
  return {
    setup: function() {
      $('#current_color').colorpicker().on('changeColor', function(ev){
        var rgb = ev.color.toRGB();
        Painter.Palette.Picker.updateColor(rgb.r, rgb.g, rgb.b);
      });
    },

    update: function(rgb) {
      $("#current_color i").css("background-color", rgb);
      $("#current_color input").val(rgb);
      $("#current_color").data("color", rgb);
    
      var colorPicker = $("#current_color").data("colorpicker");
      colorPicker.update();
    },

    updateColor: function(r, g, b) {
      $(".colorbox.selected").css("background-color", Painter.Palette.ColorUtil.toRGBString(r, g, b));
    }
  }
}();
