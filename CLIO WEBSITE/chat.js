function addMessage(text, isUser = false, imageUrl = null) {
  const messageWrapper = document.createElement('div');
  messageWrapper.className = `message-wrapper${isUser ? ' user' : ''}`;
  const time = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  let imageHtml = '';
  if (imageUrl) {
    imageHtml = `<div style="margin-bottom: 10px;"><img src="${imageUrl}" alt="Generated image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"/></div>`;
  }

  messageWrapper.innerHTML = `
    <div>
      <div class="bubble${isUser ? ' user' : ' bot'}">
        ${imageHtml}
        ${text}
      </div>
      <div class="message-time">${time}</div>
    </div>
  `;
  chatBubbles.appendChild(messageWrapper);
  chatBubbles.scrollTo({ top: chatBubbles.scrollHeight, behavior: 'smooth' });

  // Save to chat history as before...
}
