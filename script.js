const button = document.querySelector('#hello-button');
const message = document.querySelector('#message');

if (button && message) {
  button.addEventListener('click', () => {
    message.textContent = 'Nice! Your basic web structure is running.';
  });
}
