export var blessed = require("blessed");
export async function createScreenForBrowser(options: any = {}):Promise<any>{
  return new Promise(resolve => {
    window.onload = function() {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const termJs = require('term.js')
      var term = new termJs.Terminal({
        cols: options.cols || 120,
        rows: options.rows || 50,
        useStyle: true,
        screenKeys: true
      })
      term.open(container)
      term.write('\x1b[31mWelcome to term.js!\x1b[m\r\n')
      term.columns = term.cols
      term.isTTY = true
      term.resize(options.cols || 120, options.rows || 50)
      const screen = blessed.screen({ ...options, input: term, output: term, tput: undefined })
      resolve(screen)
    }
  })
}

(async (global) => { 
let s = await createScreenForBrowser({smartCSR:true});

var box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: 'Hello {bold}world{/bold}!',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'magenta',
    border: {
      fg: '#f0f0f0'
    },
    hover: {
      bg: 'green'
    }
  }
});

// Append our box to the screen.
s.append(box);
s.render();
})();
