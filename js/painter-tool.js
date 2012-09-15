
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
    return true;
  },
  function(fx, fy, tx, ty){
  },
  function(fx, fy){
  }
);

Painter.Tool.spoit = new Painter.Tool($("#toolbox a[name=spoit]")[0], 
  function(fx, fy){
    var paletteElement = Painter.Canvas.getPreviewCanvas().getColorPalette(fx, fy).element;
    paletteElement.click();
    return false;
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
