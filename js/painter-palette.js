var Palette = function(color, options) {
  this.idx = Palette.paletteList.length;
  this.color = new Color(color.r, color.g, color.b, color.a);
  this.options = options;
  
  Palette.paletteList.push(this);
}

Palette.paletteList = [];

Palette.currentPalette = null;

Palette.setup = function() {
  for (var r = 0 ; r <= 255 ; r += 51) {
    for (var g = 0 ; g <= 255 ; g += 51) {
      for (var b = 0 ; b <= 255 ; b += 51) {
        if (r + g + b == 0) {
          Palette.add(255, 255, 255).addClass("selected");
        } else {
          Palette.add(r, g, b);
        }
      }    
    }
  }
  for (var row = 0 ; row < 3 ; row++) {
    for (var col = 0 ; col < 18 ; col++) {
      Palette.add(255, 255, 255);
    }
  }
};

Palette.add = function(r, g, b) {
  var palette = new Palette({r: r, g: g, b: b, a: 255}, {});
  var paletteDiv = $("<div/>").addClass("colorbox").css("background-color", palette.color.toRGBString()).data("palette", palette);
  if (palette.color.isLikeBlack()) {
    paletteDiv.addClass("likeblack");
  }
  
  $("#palette_container").append(paletteDiv);
  paletteDiv.click(function(){
    $(".colorbox").removeClass("selected");
    $(this).addClass("selected");
    palette.select();
    Picker.update(palette.color.toRGBString());
  });
  return paletteDiv;
}


Palette.prototype = {
  constructor: Palette,
  
  select: function() {
    Palette.currentPalette = this;
  },

  changeColor: function(r, g, b) {
    this.color = new Color(color.r, color.g, color.b, 255);
    for (var idx in Canvas.list) {
      Canvas.list[idx].remapColor(this);
    }
  }
}

var Color = function(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

Color.toRGBString = function(r, g, b) {
    return "rgb(_r, _g, _b)".replace("_r", r).replace("_g", g).replace("_b", b);
};

Color.toRGBAString = function(r, g, b, a) {
    return "rgba(_r, _g, _b, _a)".replace("_r", r).replace("_g", g).replace("_b", b).replace("_a", a);
};

Color.prototype = {
  constructor: Palette,

  toRGBString: function() {
    return Color.toRGBString(this.r, this.g, this.b);
  },
  
  toRGBAString: function() {
    return Color.toRGBAString(this.r, this.g, this.b, this.a);
  },
  
  isLikeBlack: function() {
    return (this.r + this.g + this.b) / 3 <= 127;
  }
}

Picker = {
  setup: function() {
    $('#current_color').colorpicker().on('changeColor', function(ev){
      var rgb = ev.color.toRGB();
      updateColor(rgb.r, rgb.g, rgb.b);
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
    $(".colorbox.selected").css("background-color", Color.toRGBString(r, g, b));
  }
}

