// scripts.js

let state = {
  assistant_id: 'asst_mKubPnoRJxz3sL90FRE9NEZH', // Predefined assistant ID
  assistant_name: "BankTest",
  threadId: null, // Initialize threadId as null
  messages: [],
  history: [],
};

// Function to clear messages on the screen
function clearMessages() {
  const messageContainer = document.getElementById('message-container');
  messageContainer.innerHTML = ''; // Clear previous messages
}

// Function to create a new thread
async function getThread() {
  try {
    // Save current messages to history if any
    if (state.messages.length > 0) {
      state.history.push([...state.messages]);
    }
    state.messages = [];

    // Send request to create a new thread
    const response = await fetch('/api/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    state.threadId = data.threadId; // Save the thread ID in the state
    clearMessages();
    writeToMessages(`New thread created with ID: ${state.threadId}`);
    console.log(`Thread created with ID: ${state.threadId}`);
  } catch (error) {
    console.error('Error creating thread:', error);
  }
}

async function getResponse() {
  const message = document.getElementById('messageInput').value.trim();
  // Display user message
  addMessage('User', message);

  // Validate input
  if (!message) {
    alert('Please enter a message.');
    return;
  }

  if (!state.threadId) {
    alert('Please create a thread before sending a message.');
    return;
  }

  try {
    // Send message to server
    const response = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, thread_id: state.threadId }),
    });

    const data = await response.json();
    console.log('Response data:', data); // Debugging


    // Get the assistant's latest response
    const assistantMessage = data.messages[0];
    if (assistantMessage) {
      const assistantContent = assistantMessage.content;
      console.log('Assistant content:', assistantContent); // Debugging

      // Extract the text value from the assistant's response
      let displayText = '';

      if (Array.isArray(assistantContent)) {
        // If content is an array, iterate through it
        assistantContent.forEach((contentItem) => {
          if (
            contentItem.type === 'text' &&
            contentItem.text &&
            contentItem.text.value
          ) {
            displayText += contentItem.text.value;
          }
        });
      } else if (
        typeof assistantContent === 'object' &&
        assistantContent.type === 'text' &&
        assistantContent.text &&
        assistantContent.text.value
      ) {
        // If content is an object with text value
        displayText = assistantContent.text.value;
      } else if (typeof assistantContent === 'string') {
        // If content is a string
        displayText = assistantContent;
      } else {
        // Fallback to stringifying the content
        displayText = JSON.stringify(assistantContent);
      }

      addMessage('Assistant', displayText);
      state.messages.push({ role: 'assistant', content: displayText }); // Save to state messages
    } else {
      addMessage('System', 'No assistant response found.');
    }

    // Save user's message to state
    state.messages.push({ role: 'user', content: message });

    // Clear the message input
    document.getElementById('messageInput').value = '';
  } catch (error) {
    console.error('Error sending message:', error);
  }
}




// Function to write messages to the chat
function addMessage(role, content) {
  const messageContainer = document.getElementById('message-container');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', role.toLowerCase());
  messageDiv.textContent = `${role}: ${content}`;
  messageContainer.appendChild(messageDiv);
}

// Function to write system messages to the message container
function writeToMessages(message) {
  const messageContainer = document.getElementById('message-container');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'system');
  messageDiv.textContent = message;
  messageContainer.appendChild(messageDiv);
}

// Function to display chat history
function showHistory() {
  clearMessages(); // Clear current messages on the screen
  state.history.forEach((thread, index) => {
    writeToMessages(`Thread ${index + 1}:`);
    thread.forEach((msg) => {
      addMessage(msg.role, msg.content);
    });
  });
}
