const activateBurger = () => {
  const burger = document.getElementById('burger');
  const onBurgerClick = () => {
    console.log("burger clicked");
    const slide = document.getElementById('small-nav-slide-out');
    if (slide.classList.contains('open')) {
      slide.classList.remove('open');
      slide.classList.add('closed');
    } else {
      slide.classList.add('open');
      slide.classList.remove('closed');
    }
    window.addEventListener('click', onWindowCLicked )
  }

  const onWindowCLicked = ({ target: { id } }) => {
    console.log("window clicked");
    if (id === 'burger')
      return;
    const slide = document.getElementById('small-nav-slide-out');
    slide.classList.remove('open');
    slide.classList.add('closed');
    window.removeEventListener('click', onWindowCLicked);
  }

  burger.addEventListener('click',onBurgerClick);
}

activateBurger();

