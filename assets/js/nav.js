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

