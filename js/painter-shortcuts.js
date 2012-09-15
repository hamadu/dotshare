Painter.Shortcuts = function(){
  return {
    setup: function() {
      // undo
      $(document).bind('keydown', 'ctrl+z', function(){
        Painter.Canvas.undo();
      });

      // redo
      $(document).bind('keydown', 'ctrl+y', function(){
        Painter.Canvas.redo();
      });
    
      // zoom-in
      $(document).bind('keydown', 'z', function(){
        Painter.Canvas.scaleUp();
      });

      // zoom-out
      $(document).bind('keydown', 'x', function(){
        Painter.Canvas.scaleDown();
      });
    },    
  }
}();
