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
      });
    },

    saveDot: function() {
      var previewCanvas = $('#previewcanvas')[0];
      var url = previewCanvas.toDataURL();
      window.open(url);
    }
  }
}();