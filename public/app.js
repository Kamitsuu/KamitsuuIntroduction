const messagesList = document.querySelector('#messages');
const messageCount = document.querySelector('#message-count');
const statusMessage = document.querySelector('#status');
const messageForm = document.querySelector('#message-form');
const authorInput = document.querySelector('#author');
const messageInput = document.querySelector('#message');
const formStatus = document.querySelector('#form-status');

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

async function loadMessages() {
  try {
    const response = await fetch('/api/messages');
    if (!response.ok) {
      throw new Error('The server could not load messages.');
    }

    const messages = await response.json();
    messagesList.replaceChildren();

    for (const message of messages) {
      const item = document.createElement('li');
      item.className = 'message';

      const author = document.createElement('p');
      author.className = 'message-author';
      author.textContent = message.author;

      const timestamp = document.createElement('time');
      timestamp.className = 'message-time';
      timestamp.dateTime = message.timestamp || '';
      timestamp.textContent = formatTimestamp(message.timestamp);

      const header = document.createElement('div');
      header.className = 'message-header';
      header.append(author, timestamp);

      const text = document.createElement('p');
      text.className = 'message-text';
      text.textContent = message.text;

      item.append(header, text);
      messagesList.append(item);
    }

    messageCount.textContent = `${messages.length} messages`;
    statusMessage.textContent = messages.length === 0 ? 'There are no messages yet.' : '';
  } catch (error) {
    statusMessage.textContent = 'Could not load messages. Check that the server is running.';
    console.error(error);
  }
}

loadMessages();

messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const author = authorInput.value.trim();
  const text = messageInput.value.trim();
  if (!author || !text) {
    formStatus.textContent = 'Enter both a name and a message.';
    return;
  }

  const submitButton = messageForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  formStatus.textContent = 'Sending...';

  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'The server could not post your message.');
    }

    messageInput.value = '';
    formStatus.textContent = 'Message posted.';
    await loadMessages();
  } catch (error) {
    formStatus.textContent = error.message || 'Could not post your message.';
  } finally {
    submitButton.disabled = false;
  }
});

setInterval(loadMessages, 5000);