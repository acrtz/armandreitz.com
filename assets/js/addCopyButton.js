const addCopyButton = () => {
  const codeBlocks = document.getElementsByClassName('rouge-code');
  
  Array.from(codeBlocks).forEach((block, i) => {
    const copyButton = document.createElement('div');
    const id = `code-block-${i}`
    block.id = id;
    copyButton.innerText = 'COPY';
    copyButton.classList.add(`copy-button`);
    copyButton.addEventListener('click', () => copyCodeToClipboard(id));
    block.parentNode.appendChild(copyButton);
  });
}

addCopyButton();

const copyCodeToClipboard = (id) => {
  const textArea = document.createElement('textarea');
  textArea.value = document.getElementById(id).innerText
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
};