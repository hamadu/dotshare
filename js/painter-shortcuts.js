Shortcuts = {
  setup: function() {
    // undo
    $(document).bind('keydown', 'ctrl+z', function(){
      if (Canvas.backupIndex >= 1) {
        Canvas.backupIndex--;
        Painter.restoreWithCanvas(Canvas.backupList[Canvas.backupIndex]);
        Painter.clipToMainCanvas(_offset_x, _offset_y, Canvas.scaling);
      }
    });

    // redo
    $(document).bind('keydown', 'ctrl+y', function() {
      var nextBackupCanvas = $("canvas.backupcanvas.current").next()[0];
      if (Canvas.backupIndex < Canvas.backupList.length - 1) {
        Canvas.backupIndex++;
        Painter.restoreWithCanvas(Canvas.backupList[Canvas.backupIndex]);
        Painter.clipToMainCanvas(_offset_x, _offset_y, Canvas.scaling);
      }
    });
  },
}