const button = document.querySelector('#start-order-button');
const message = document.querySelector('#message');

if (button && message) {
  button.addEventListener('click', () => {
    message.textContent = 'Skicka ett mejl till hello@web.tiom.nu så startar vi beställningen.';
  });
}
