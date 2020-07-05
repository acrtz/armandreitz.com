const activateBurger = () => {
  const burger = document.getElementById('burger');
  burger.addEventListener('click',() => {
    const slide = document.getElementById('small-nav-slide-out');
    if (slide.classList.contains('open')) {
      slide.classList.remove('open');
      slide.classList.add('closed');
    } else {
      slide.classList.add('open');
      slide.classList.remove('closed');
    }
  });
}

activateBurger();

const CURSOR = `<div id="typing-cursor">.</div>`;
class Typist {
  constructor(nodes, base, options){
    this.nodes = nodes;
    this.index = 0;
    this.base = document.getElementById(base);
    this.options = options;
    this.start = this.start;
    this.previous = '';

  }
  
  async start() {
    const { type, text, html, newline, clear, pause } = this.nodes[this.index];
    console.log({type})
    if (!clear)
      this.previous = this.base.innerHTML.replace(CURSOR, '');
    console.log({previous: this.previous})
    
    if (type==='text') {
      let count = 1;
      await new Promise((resolve, reject) =>{
        this.interval = setInterval(() => {
          this.base.innerHTML = `${this.previous}${text.slice(0, count)}${CURSOR}`;
          count++;   
          if (count > text.length) {
            clearInterval(this.interval);
            resolve();
          }
        }, 100);
      })
    }

    if (type==='html') {
      this.base.innerHTML = `${this.previous}${html}${CURSOR}`;
    }

    if (type === 'newline') {
      this.base.innerHTML = `${this.previous}<br/>${CURSOR}`;
    }

    if (pause)
      await new Promise((resolve,reject)=>{
        setTimeout(()=>{
          resolve();
        }, pause);
      });

    if (this.nodes.length - 1 > this.index) {
      this.index = this.index + 1;
      this.start();
    }
  }

  addNewLine(count) {
    let newLine = '';
    
  }
}

// const type = () => {
//   const autoType = document.getElementById('auto-type');
//   let text = autoType.innerHTML;
//   autoType.innerText = '';
//   let count = 1;
//   const typing = setInterval(() => {
//     autoType.innerHTML = `${text.slice(0, count)} <div id='typing-cursor'>.</div>`;
//     count++;
//     if (count > text.length)
//       clearInterval(typing)
//   }, 100);
// }

// type();

// `
// :after {
//   content: " ";
//   display: block;
//   background: #c00;
//   height: 29px;
//   width: 100%;

//   position: absolute;
//   bottom: -29px;
// }​
    // `