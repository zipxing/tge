var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen({fullUnicode:true});

// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
  top: 2,
  left: 2,
  width: 10,
  height: 10,
  content: '😍 🍋 🏭 🚗 ',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 5,
    bg: 8,
    border: {
      fg: '#ffffff'
    },
    hover: {
      bg: 'green'
    }
  }
});
var box1 = blessed.box({
  top: 2,
  left: 12,
  width: 10,
  height: 10,
  content: '😍 🍋 🚜 🚗 ',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 5,
    bg: 8,
    border: {
      fg: '#ffffff'
    },
    hover: {
      bg: 'green'
    }
  }
});

// Append our box to the screen.
screen.append(box);
screen.append(box1);

// If our box is clicked, change the content.
box.on('click', function(data) {
  console.log(data);
  box.setContent('{center}Some different {8-bg}{123-fg}content{/}.{/center}');
  screen.render();
});

// If box is focused, handle `enter` and give us some more content.
box.key('enter', function() {
  box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
  box.setLine(1, 'bar');
  box.insertLine(1, 'foo');
  screen.render();
});

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Focus our element.
box.focus();

// Render the screen.
screen.render();
