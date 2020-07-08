class Typist {
  constructor(nodes, base, options = {}) {
    this.nodes = nodes;
    this.index = 0;
    this.options = options;
    this.previous = '';
    this.content = document.createElement('span');
    this.content.id = 'content';
    document.getElementById(base).appendChild(this.content);
    const existingCursor = document.getElementById('cursor');
    if (existingCursor)
      existingCursor.remove();
    this.cursor = document.createElement('span');
    this.cursor.innerText = '.'
    this.cursor.id = 'cursor';
    document.getElementById(base).appendChild(this.cursor);
  }

  calculateDelay = ([ min, max ]) => Math.floor(Math.random() * (max - min)) + min;
  
  start = async () => {
    const { type, text, html, clear, pause, backspace, speed, jumpBack, style } = this.nodes[this.index];
    
    if (clear)
      this.content.innerHTML = '';

    const span = document.createElement('span');
    this.content.appendChild(span);

    if (style)
      span.style = style;

    if (type === 'text') {
      let charPosition = 0;
      await new Promise((resolve, reject) => {
        const delay = () => {
          setTimeout(() => {
            span.innerHTML += text.charAt(charPosition++);
            if (charPosition < text.length) 
              delay();
            else
              resolve();
          }, speed ? (Array.isArray(speed) ? this.calculateDelay(speed) : speed) : 100);
        }
        delay();
      });
    }

    if (type === 'html')
      span.innerHTML += html;

    if (pause)
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, pause);
      });
    
    if (backspace)
      await new Promise((resolve, reject) => {
        let charPosition = text.length;
        const delay = () => {
          setTimeout(() => {
            span.innerHTML = span.innerHTML.slice(0,-1);
            if (--charPosition) 
              delay();
            else
              resolve();
          }, speed ? (Array.isArray(speed) ? this.calculateDelay([speed[0] / 2, speed[0] / 2 ]) : speed/2) : 100);
        }
        delay();
      });
    
    if (jumpBack) {
      this.index = this.index - jumpBack;
      this.start();
    } else if (this.nodes.length - 1 > this.index) {
      this.index = this.index + 1;
      this.start();
    } else {
      if (this.options.loop) {
        this.index = 0;
        span.innerHTML = '';
        this.start();
      } else if (this.options.onComplete) {
        this.options.onComplete();
      }
    }
  }
}