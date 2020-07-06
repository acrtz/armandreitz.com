class Typist {
  constructor(nodes, base, options) {
    this.nodes = nodes;
    this.index = 0;
    this.options = options;
    this.previous = '';
    this.content = document.createElement('span');
    this.content.id = 'content';
    document.getElementById(base).appendChild(this.content);
    this.cursor = document.createElement('span');
    this.cursor.innerText = '.'
    this.cursor.id = 'cursor';
    document.getElementById(base).appendChild(this.cursor);
  }

  calculateDelay = ([ min, max ]) => Math.floor(Math.random() * (max - min)) + min;


  start = async () => {
    const { type, text, html, clear, pause, speed } = this.nodes[this.index];

    if (clear)
      this.content.innerHTML = '';

    if (type === 'text') {
      let charPosition = 0;
      await new Promise((resolve, reject) => {
        const delay = () => {
          setTimeout(() => {
            this.content.innerHTML += text.charAt(charPosition++);
            if (charPosition < text.length) 
              delay();
            else
              resolve();
          }, speed ? (Array.isArray(speed) ? this.calculateDelay(speed) : speed) : 100);
        }
        delay();
      })
    }

    if (type === 'html')
      this.content.innerHTML += html;

    if (pause)
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, pause);
      });

    if (this.nodes.length - 1 > this.index) {
      this.index = this.index + 1;
      this.start();
    }
  }
}