document.addEventListener('DOMContentLoaded', () => {
  // Scroll to bottom on load
  const chatContainer = document.getElementById('chatContainer')
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight
  }

  // Submit with Ctrl+Enter
  const msgInput = document.getElementById('msgInput')
  if (msgInput) {
    msgInput.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = this.closest('form')
        if (form) form.submit()
      }
    })
  }
})
