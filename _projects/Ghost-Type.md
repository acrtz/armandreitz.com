---
name: ghost-type
slug: ghost-type
description: A small javascript utility used to animate typing.
npm: 
github: 
website: 
tags: [Javascript]
image: /assets/images/projects/ghost-type/ghost-type.png
order: 9999
---
Ghost type is a small Javascript utility used to display automated typing.

The best way to illustrate what it does is simply to show some examples.

{% include ghost_type_example.html %}

Usage: 
``` javascript
// initialize the class passing it a base id,
// an array of nodes, and an options object (optional)
const ghostType = new GhostType(
  'base-id', // id  of the element where type will show up 
  [
    { 
      text: 'This is example text being typed',
      typingDelay: 100
    }
  ]
);
// call the instances start method
ghostType.start();
```

### GhostType API
<div style='max-width: 100%; overflow-x: scroll; line-height: 1em; border: 1px solid #c1c1c1;'>
<table class="table-in-markdown" style="width: 100%;">
    <thead>
      <tr>
        <th>Key</th>
        <th>Description</th>
        <th>Type</th>
        <th>Required</th>
        <th>Default</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>anchorEl</td>
        <td>The id of the element within which the typing will be displayed</td>
        <td>String</td>
        <td>Yes</td>
        <td>none</td>
      </tr>
      <tr>
        <td>nodes</td>
        <td>An array of nodes (node structure is explained below)</td>
        <td>Array</td>
        <td>Yes</td>
        <td>none</td>
      </tr>
      <tr>
        <td>cursor</td>
        <td>An object controling features of the cursor</td>
        <td>Object</td>
        <td>No</td>
        <td>none</td>
      </tr>
      <tr>
        <td>cursor.hide</td>
        <td>Specifies if cursor should be shown or not</td>
        <td>Boolean</td>
        <td>No</td>
        <td>False</td>
      </tr>
      <tr>
        <td>cursor.color</td>
        <td>Sets cursors color (accepts all values that work in css)</td>
        <td>String</td>
        <td>No</td>
        <td>black</td>
      </tr>
      <tr>
        <td>options</td>
        <td>An object controling various options</td>
        <td>Object</td>
        <td>No</td>
        <td>none</td>
      </tr>
      <tr>
        <td>options.globalDelay</td>
        <td>Time delay after each charcter is typed. Passing a [min,max] array makes the delay dynamic.</td>
        <td>Int or [Int,Int]</td>
        <td>No</td>
        <td>100</td>
      </tr>
      <tr>
        <td>options.repeat</td>
        <td>Object specifying whether to and how to repeat.</td>
        <td>Object</td>
        <td>No</td>
        <td>none</td>
      </tr>
      <tr>
        <td>options.repeat.clear</td>
        <td>Determines whether previous text should be cleared before repeating</td>
        <td>Boolean</td>
        <td>No</td>
        <td>False</td>
      </tr>
      <tr>
        <td>options.repeat.count</td>
        <td>Specifies the number of times the nodes should be repeated. If left undefined the it will repeat infinitely</td>
        <td>Int</td>
        <td>No</td>
        <td>Infinity</td>
      </tr>
      <tr>
        <td>options.onComplete</td>
        <td>A function that will be run after all of the nodes have completed.</td>
        <td>Function</td>
        <td>No</td>
        <td>none</td>
      </tr>
    </tbody>
  </table>
</div>

### Node Structure 
<div style='max-width: 100%; overflow-x: scroll; line-height: 1em; border: 1px solid #c1c1c1;'>
  <table class="table-in-markdown" style="width: 100%;">
    <thead>
      <tr>
        <th>Key</th>
        <th>Description</th>
        <th>Type</th>
        <th>Required</th>
        <th>Default</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>text</td>
        <td>string of text to be typed</td>
        <td>String</td>
        <td>No</td>
        <td>None</td>
      </tr>
      <tr>
        <td>html</td>
        <td>string of html they will appear on screen all at once</td>
        <td>String</td>
        <td>No</td>
        <td>None</td>
      </tr>
      <tr>
        <td>typingDelay</td>
        <td>time delay after each charcter is typed. Passing a [min,max] array makes the delay dynamic.</td>
        <td>Int or [Int,Int]</td>
        <td>No</td>
        <td>None</td>
      </tr>
      <tr>
        <td>pause</td>
        <td>pause in microseconds before typing is started.</td>
        <td>Int</td>
        <td>No</td>
        <td>None</td>
      </tr>
      <tr>
        <td>style</td>
        <td>a string that uses css styled syntax</td>
        <td>String</td>
        <td>No</td>
        <td>None</td>
      </tr>
      <tr>
        <td>backspace.delay</td>
        <td colspan="4">same as typingDelay</td>
      </tr>
      <tr>
        <td>backspace.pause</td>
        <td colspan="4">same as pause</td>
      </tr>
      <tr>
        <td>backspace.count</td>
        <td>number of characters that get deleted after the nodes typing has completed.</td>
        <td>Int</td>
        <td>No</td>
        <td>Defaults to the length of text that was typed.</td>
      </tr>
      <tr>
        <td>jumpBack</td>
        <td>Number of nodes to move back to before continuing. Does not clear already typed content.</td>
        <td>Int</td>
        <td>No</td>
        <td>none</td>
      </tr>
    </tbody>
</table>
</div>


The whole utility is run by a single class, the code for which is below. 

``` javascript
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
```

