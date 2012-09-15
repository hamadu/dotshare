Painter.IO = function(){
  return {
    setup: function() {
      $("#files").change(function(e) {
        var files = e.target.files;
        if (files.length == 1) {
          var reader = new FileReader;
          reader.onload = function(event) {
              var img = new Image;
              img.onload = function() {
                
                var previewCanvas = Painter.Canvas.getPreviewCanvas();
                previewCanvas.clearRect();
                previewCanvas.loadImage(img);
                Painter.Canvas.setScale(8);
                Painter.Canvas.clip();
              };
              img.src = event.target.result;
          };
          reader.readAsDataURL(files[0]);
        }
      });
      
      
      $("#saveload_container div.save").click(function(e) {
        var previewCanvas = $('#previewcanvas')[0];
        var url = previewCanvas.toDataURL();
        window.open(url);
      });
    }
  };
}();