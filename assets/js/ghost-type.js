// options = {
//   hideCursor: boolean, // default false
//   globalDelay: integer or [integer, integer] //default [100,200]
// }
class GhostType {
  constructor(nodes, base_id, options = {}) {
    this.nodes = nodes;
    this.index = 0;
    this.options = options;
    this.content = this.setUpContentSpan(base_id);
    this.cursor = this.setUpCursorSpan(base_id);
  }

  // creates the span where the text/html will be typed 
  setUpContentSpan = (base_id) => {
    const content = document.createElement('span');
    document.getElementById(base_id).appendChild(content);
    return content;
  }

  // creates the span responsible for rendering the cursor 
  setUpCursorSpan = (base_id) => {
    if (this.options.hideCursor)
      return null;

    const cursor = document.createElement('span');
    cursor.innerText = '.';
    cursor.id = 'cursor';
    document.getElementById(base_id).appendChild(cursor);
    return cursor;
  }

  // used to add a span for each new node so that individual nodes
  // can have custom styling
  appendNewSpanToContent = (style) => {
    const span = document.createElement('span');
    span.style = style || '';
    this.content.appendChild(span);
    return span;
  }

  // Calculates a random delay duration between the provided [min, max]
  calculateRandomDelay = ([ min, max ]) => Math.floor(Math.random() * (max - min)) + min;

  // Finds delay based on node and global delay settings
  determineDelayDuration = (delay) => {
    // node has a delay set
    if (delay)
      return Array.isArray(delay) ? this.calculateRandomDelay(delay) : delay;
    
    const { globalDelay } = this.options;
    return Array.isArray(globalDelay) ? this.calculateRandomDelay(globalDelay) : globalDelay;
  }

  typeTextNode = async (span, text, typingDelay) => {
    return new Promise((resolve, reject) => {
      let charPosition = 0;
      const delay = () => {
        setTimeout(() => {
          span.innerHTML += text.charAt(charPosition++);
          if (charPosition < text.length)
            delay();
          else
            resolve();
        }, this.determineDelayDuration(typingDelay));
      }
      delay();
    });
  }  

  pause = async (duration) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  backspaceTextNode = async (span, text, delay) => {
    return new Promise((resolve, reject) => {
      let charPosition = text.length;
      const delay = () => {
        setTimeout(() => {
          span.innerHTML = span.innerHTML.slice(0, -1);
          if (--charPosition)
            delay();
          else
            resolve();
        }, delay ? (Array.isArray(delay) ? this.calculateDelay([delay[0] / 2, delay[0] / 2]) : delay / 2) : 100);
      }
      delay();
    });
  }
  
  start = async () => {
    const { text, html, clear, pause: pauseDuration, backspace, typingDelay, jumpBack, style } = this.nodes[this.index];
    
    if (clear)
      this.content.innerHTML = '';

    const span = this.appendNewSpanToContent(style);

    if (text)
      await this.typeTextNode(span, text, typingDelay);

    if (html)
      span.innerHTML += html;

    if (pauseDuration)
      await this.pause(pauseDuration);
    
    if (backspace)
      await backspaceTextNode(span, text, delay);
      
    
    if (jumpBack) {
      this.index = this.index - jumpBack;
      this.start();
    } else if (this.nodes.length - 1 > this.index) {
      this.index = this.index + 1;
      this.start();
    } else {
      if (this.options.loop) {
        this.index = 0;
        this.content.innerHTML = '';
        this.start();
      } else if (this.options.onComplete) {
        this.options.onComplete();
      }
    }
  }
}