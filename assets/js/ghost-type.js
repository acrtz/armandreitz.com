class GhostType {
  constructor({ anchorEl, nodes, options = {}, cursor: cursorSettings }) {
    this.nodes = nodes;
    this.index = 0;
    this.options = options;
    this.content = this.setUpContentSpan(anchorEl);
    this.cursor = this.setUpCursorSpan(anchorEl, cursorSettings);
  }

  // creates the span where the text/html will be typed 
  setUpContentSpan = (anchorEl) => {
    const content = document.createElement('span');
    document.getElementById(anchorEl).appendChild(content);
    return content;
  }

  // creates the span responsible for rendering the cursor 
  setUpCursorSpan = (anchorEl, cursorSettings = {}) => {
    if (cursorSettings.hide)
      return null;

    // Add keyframes to document for cursor flicker animation
    const cursorAnimation = document.createElement("style");
    const FLICKER = `flicker {
      0% { opacity: 1; }
      50% { opacity: 1; }
      75% { opacity: 0; }
      100% { opacity: 1; }
    }`;
    cursorAnimation.textContent = `
      @-webkit-keyframes ${FLICKER}
      @-moz-keyframes ${FLICKER}
      @-o-keyframes ${FLICKER}
      @keyframes ${FLICKER}
    `;
    document.body.appendChild(cursorAnimation);

    const cursor = document.createElement('span');
    cursor.innerText = '.';
    cursor.id = 'cursor';
    cursor.style = `
      display: inline-block;
      background-color: ${cursorSettings.color || 'black'};
      width: 2px;
      line-height: 1em;
      color: #ffffff00;
      animation: 1s linear flicker infinite;
    `;
    document.getElementById(anchorEl).appendChild(cursor);
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

  // types out the prompt for a given node with delays between 
  // each character based on specified values
  typeTextNode = async (span, text, typingDelay) => {
    if (typingDelay === 0)
      return span.innerHTML += text;
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

  // called before a nodes typing is started
  pauseTyping = async (duration) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  // called after a nodes text has been typed out. Deletes specified number of characters
  // with a specified delay between each deletion
  backspaceTextNode = async (span, { count, delay }) => {
    return new Promise((resolve, reject) => {
      let charPosition = count || span.innerText.length;
      const delayTyping = () => {
        setTimeout(() => {
          span.innerHTML = span.innerHTML.slice(0, -1);
          if (--charPosition)
            delayTyping();
          else
            resolve();
        }, delay ? (Array.isArray(delay) ? this.determineDelayDuration([delay[0], delay[0]]) : delay) : 100);
      }
      delayTyping();
    });
  }
  
  start = () => this.nextNode()
  
  // runs the operation of the next specified node
  nextNode = async () => {
    const { text, html, clear, pause, backspace, typingDelay, jumpBack, style } = this.nodes[this.index];
    
    if (pause)
      await this.pauseTyping(pause);

    if (clear)
      this.content.innerHTML = '';

    const span = this.appendNewSpanToContent(style);
    
    if (style)
      span.style = style

    if (text)
      await this.typeTextNode(span, text, typingDelay);

    if (html)
      span.innerHTML += html;
    
    if (backspace) {
      if (backspace.pause)
        await this.pauseTyping(backspace.pause);
      await this.backspaceTextNode(span, backspace);
    }
    
    if (jumpBack) {
      this.index = this.index - jumpBack;
      return this.nextNode();
    }

    if (this.nodes.length - 1 > this.index) {
      this.index = this.index + 1;
      return this.nextNode();
    }

    if (this.options.repeat && this.options.repeat.count !== 0) {
      this.options.repeat.count--;
      this.index = 0;
      if (this.options.repeat.clear)
        this.content.innerHTML = '';
      this.nextNode();
    }

    if (this.options.onComplete) {
      this.options.onComplete();
    }
  }
}