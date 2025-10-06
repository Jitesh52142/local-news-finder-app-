document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('login.html')) {
        handleLoginPage();
    } else if (path.includes('register.html')) {
        handleRegisterPage();
    } else if (path === '/' || path.includes('index.html')) {
        if (!localStorage.getItem('token')) {
            window.location.href = '/login.html';
            return;
        }
        handleDashboardPage();
    }
});

// --- AUTHENTICATION LOGIC ---
function handleLoginPage() {
    const form = document.getElementById('loginForm');
    const authBtn = form.querySelector('.auth-btn');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.email.value;
        const password = form.password.value;
        authBtn.disabled = true;
        authBtn.style.opacity = '0.7';
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = '/';
            } else {
                alert(data.msg || 'Login failed');
            }
        } catch (err) {
            alert('An error occurred during login.');
        } finally {
            authBtn.disabled = false;
            authBtn.style.opacity = '1';
        }
    });
}

function handleRegisterPage() {
    const form = document.getElementById('registerForm');
    const authBtn = form.querySelector('.auth-btn');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.email.value;
        const password = form.password.value;
        authBtn.disabled = true;
        authBtn.style.opacity = '0.7';
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = '/';
            } else {
                alert(data.msg || 'Registration failed');
            }
        } catch (err) {
            alert('An error occurred during registration.');
        } finally {
            authBtn.disabled = false;
            authBtn.style.opacity = '1';
        }
    });
}

// --- DASHBOARD LOGIC ---
function handleDashboardPage() {
    let currentSessionId = null;
    let isProcessing = false;
    let declineInfo = { messageId: null, lastMessage: null };
    let messageStartTime = null;
    let linkedinPostContent = null; // Store the LinkedIn post content for copying
    let keywords = []; // Array to store keywords
    let currentKeywordIndex = 0; // Track current keyword index
    const userId = "60c72b2f9b1d8c001f8e4c1a"; // TODO: Get from auth token

    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const logoutBtn = document.getElementById('logoutBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatList = document.getElementById('chatList');
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackText = document.getElementById('feedbackText');
    const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
    const cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');
    const finalPostActions = document.getElementById('finalPostActions');
    const editButton = document.getElementById('editBtn'); // Reference existing edit button in input-container

    // Load chat history on page load
    loadChatHistory();

    // Add hover/focus animations
    sendButton.addEventListener('mouseenter', () => {
        if (!sendButton.disabled) {
            sendButton.style.transform = 'translateY(-2px)';
            sendButton.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
        }
    });
    sendButton.addEventListener('mouseleave', () => {
        sendButton.style.transform = 'translateY(0)';
        sendButton.style.boxShadow = 'none';
    });
    messageInput.addEventListener('focus', () => {
        messageInput.style.boxShadow = '0 0 8px rgba(34, 197, 94, 0.3)';
    });
    messageInput.addEventListener('blur', () => {
        messageInput.style.boxShadow = 'none';
    });

    // Edit button functionality
    editButton.addEventListener('click', () => {
        isProcessing = false; // Stop processing
        messageInput.disabled = false; // Enable input
        sendButton.disabled = false; // Enable send button
        messageInput.placeholder = 'Edit keywords or start a new chat...';
        messageInput.value = keywords.join(', '); // Populate with current keywords
        messageInput.focus();
        editButton.style.display = 'none'; // Hide edit button
        showTypingIndicator(false); // Remove typing indicator if present
    });

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });
    newChatBtn.addEventListener('click', () => {
        currentSessionId = null;
        isProcessing = false;
        linkedinPostContent = null;
        keywords = [];
        currentKeywordIndex = 0;
        chatMessages.innerHTML = `
            <div class="welcome-screen" style="opacity: 0; transform: translateY(12px); animation: fadeIn 0.4s ease-in-out forwards;">
                <h1>New Chat</h1>
                <p>Enter keywords to start your research.</p>
            </div>`;
        messageInput.disabled = false;
        messageInput.placeholder = "Enter keywords for business insights...";
        editButton.style.display = 'none';
        
        // Remove active state from chat items
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Refresh chat history to update the list
        loadChatHistory();
    });
    submitFeedbackBtn.addEventListener('click', submitFeedback);
    cancelFeedbackBtn.addEventListener('click', closeFeedbackModal);

    // --- Chat History Functions ---
    async function loadChatHistory() {
        try {
            const res = await fetch(`/api/chat/history/${userId}`);
            if (res.ok) {
                const chatHistory = await res.json();
                displayChatHistory(chatHistory);
            }
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    }

    function displayChatHistory(chatHistory) {
        chatList.innerHTML = '';
        
        if (chatHistory.length === 0) {
            chatList.innerHTML = '<div class="no-chats">No previous chats</div>';
            return;
        }

        chatHistory.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            if (chat._id === currentSessionId) {
                chatItem.classList.add('active');
            }
            
            const date = new Date(chat.createdAt).toLocaleDateString();
            const time = new Date(chat.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            chatItem.innerHTML = `
                <div class="chat-title">${chat.title}</div>
                <div class="chat-meta">${date} ${time}</div>
                <div class="chat-status ${chat.isProcessing ? 'processing' : 'complete'}">
                    ${chat.isProcessing ? 'In Progress' : 'Complete'}
                </div>
                <div class="chat-item-actions">
                    <button class="chat-action-btn edit-btn" title="Edit Keywords" data-chat-id="${chat._id}">🔄</button>
                    <button class="chat-action-btn rename-btn" title="Rename" data-chat-id="${chat._id}" data-chat-title="${chat.title}">✏️</button>
                    <button class="chat-action-btn delete-btn" title="Delete" data-chat-id="${chat._id}">🗑️</button>
                </div>
            `;
            
            chatItem.addEventListener('click', () => loadChatSession(chat._id));
            chatList.appendChild(chatItem);
        });
        
        // Add event listeners for action buttons
        chatList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chatId = btn.getAttribute('data-chat-id');
                editChat(chatId);
            });
        });
        
        chatList.querySelectorAll('.rename-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chatId = btn.getAttribute('data-chat-id');
                const chatTitle = btn.getAttribute('data-chat-title');
                currentChatId = chatId; // Set the current chat ID
                openRenameModal(chatId, chatTitle);
            });
        });
        
        chatList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chatId = btn.getAttribute('data-chat-id');
                currentChatId = chatId; // Set the current chat ID
                openDeleteModal(chatId);
            });
        });
    }

    async function loadChatSession(sessionId) {
        try {
            const res = await fetch(`/api/chat/session/${sessionId}`);
            if (res.ok) {
                const chatSession = await res.json();
                currentSessionId = sessionId;
                renderChat(chatSession);
                
                // Update active chat in sidebar
                document.querySelectorAll('.chat-item').forEach(item => {
                    item.classList.remove('active');
                });
                event.target.closest('.chat-item').classList.add('active');
                
                // Update input state
                setProcessingState(chatSession.isProcessing);
            }
        } catch (err) {
            console.error('Failed to load chat session:', err);
        }
    }

    // --- Enhanced Message Formatting ---
    function formatMessageContent(content) {
        if (!content) return '';
        
        // Handle different content types
        let formatted = content;
        
        // Try to parse JSON first
        if (typeof content === 'string' && (content.trim().startsWith('{') || content.trim().startsWith('['))) {
            try {
                const parsed = JSON.parse(content);
                formatted = formatObjectToReadableText(parsed);
            } catch (e) {
                // Not JSON, continue with regular formatting
            }
        }
        
        // Apply text formatting
        formatted = formatted
            // Remove "Output:" prefix
            .replace(/^Output:\s*/gm, '')
            // Remove horizontal lines (---)
            .replace(/^---+$/gm, '')
            // Convert **bold** to <strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Convert *italic* to <em>
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Convert ### headings
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            // Convert ## headings
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            // Convert # headings
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            // Convert bullet points to list items
            .replace(/^[\s]*[-*•]\s+(.+)$/gm, '<li>$1</li>')
            // Convert numbered lists
            .replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>')
            // Convert line breaks to <br> but preserve paragraph structure
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            // Wrap content in paragraphs
            .replace(/^(.)/g, '<p>$1')
            .replace(/(.)$/g, '$1</p>')
            // Wrap consecutive list items in <ul>
            .replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>')
            // Fix nested ul tags
            .replace(/<\/ul>\s*<ul>/g, '')
            // Clean up empty paragraphs
            .replace(/<p><\/p>/g, '')
            // Fix paragraph formatting around lists and headings
            .replace(/<p>(<[uh][123l]>)/g, '$1')
            .replace(/(<\/[uh][123l]>)<\/p>/g, '$1');
            
        return formatted;
    }

    // Helper function to convert objects to readable text
    function formatObjectToReadableText(obj) {
        if (Array.isArray(obj)) {
            return obj.map((item, index) => {
                if (typeof item === 'object') {
                    return `**${index + 1}.** ${formatObjectToReadableText(item)}`;
                }
                return `• ${item}`;
            }).join('\n\n');
        }
        
        if (typeof obj === 'object' && obj !== null) {
            return Object.entries(obj).map(([key, value]) => {
                const formattedKey = key.replace(/([A-Z])/g, ' $1')
                                      .replace(/^./, str => str.toUpperCase())
                                      .replace(/_/g, ' ');
                
                if (typeof value === 'object') {
                    return `**${formattedKey}:**\n${formatObjectToReadableText(value)}`;
                }
                return `**${formattedKey}:** ${value}`;
            }).join('\n\n');
        }
        
        return String(obj);
    }

    // --- Typing Indicator ---
    function showTypingIndicator(show = true) {
        let typingDiv = document.getElementById('typingIndicator');
        if (show) {
            if (!typingDiv) {
                typingDiv = document.createElement('div');
                typingDiv.id = 'typingIndicator';
                typingDiv.className = 'message bot typing';
                typingDiv.innerHTML = `
                    <div class="circular-loader"></div>
                    <span>Generating insights...</span>`;
                chatMessages.appendChild(typingDiv);
                typingDiv.style.opacity = '0';
                typingDiv.style.transform = 'translateY(12px)';
                setTimeout(() => {
                    typingDiv.style.opacity = '1';
                    typingDiv.style.transform = 'translateY(0)';
                    typingDiv.style.transition = 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out';
                }, 50);
                scrollToBottom();
            }
        } else if (typingDiv) {
            typingDiv.style.opacity = '0';
            typingDiv.style.transform = 'translateY(12px)';
            setTimeout(() => typingDiv.remove(), 400);
        }
    }

    async function sendMessage() {
        const messageText = messageInput.value.trim();
        if (!messageText || isProcessing) return;

        if (!currentSessionId) {
            chatMessages.innerHTML = '';
            addMessage('user', messageText);
            messageInput.value = '';
            setProcessingState(true, 'Finding initial insights...');
            messageStartTime = new Date();
            showTypingIndicator(true);

            // Process keywords
            keywords = messageText.split(',').map(k => k.trim()).filter(k => k);
            currentKeywordIndex = 0;

            try {
                const res = await fetch('/api/chat/initiate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ keywords: keywords[currentKeywordIndex], userId: userId })
                });
                const data = await res.json();
                if (res.ok) {
                    currentSessionId = data._id;
                    showTypingIndicator(false);
                    renderChat(data);
                    
                    // Refresh chat history to show new chat
                    loadChatHistory();
                    
                    // Show edit button for 2 minutes
                    editButton.style.display = 'block';
                    editButton.style.opacity = '0';
                    editButton.style.transform = 'translateY(12px)';
                    setTimeout(() => {
                        editButton.style.opacity = '1';
                        editButton.style.transform = 'translateY(0)';
                        editButton.style.transition = 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out';
                    }, 50);
                    setTimeout(() => {
                        editButton.style.opacity = '0';
                        editButton.style.transform = 'translateY(12px)';
                        setTimeout(() => editButton.style.display = 'none', 400);
                    }, 120000); // 2 minutes
                } else {
                    showTypingIndicator(false);
                    addMessage('system', `Unable to fetch insights: ${data.msg || 'Please try again later.'}`);
                }
            } catch (err) {
                showTypingIndicator(false);
                addMessage('system', 'Connection error. Please check your internet connection and try again.');
                console.error('Send message error:', err);
            } finally {
                setProcessingState(false);
            }
        }
    }

    function renderChat(sessionData) {
        chatMessages.innerHTML = '';
        sessionData.messages.forEach(msg => {
            addMessage(msg.role, msg.content, msg.contentType, msg._id);
        });
        isProcessing = sessionData.isProcessing;
        setProcessingState(isProcessing);
        addResponseTime();
    }

    function addMessage(role, content, contentType = null, messageId = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(12px)';
        
        // Apply enhanced formatting
        let formattedContent = formatMessageContent(content);

        if (contentType === 'news') {
            messageDiv.innerHTML = `
                <div class="news-content">
                    <div class="content-label">RESEARCH INSIGHTS</div>
                    <div class="formatted-content">${formattedContent}</div>
                </div>`;
        } else if (contentType === 'linkedin') {
            messageDiv.innerHTML = `
                <div class="linkedin-content">
                    <div class="content-label">PROFESSIONAL POST</div>
                    <div class="formatted-content">${formattedContent}</div>
                </div>`;
            linkedinPostContent = content; // Store the content for copying
        } else {
            messageDiv.innerHTML = `<div class="formatted-content">${formattedContent}</div>`;
        }

        // Action buttons - Show Accept/Decline for both news and linkedin content
        if (role === 'bot' && contentType && isProcessing) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'action-buttons';
            actionsDiv.innerHTML = `
                <button class="action-btn accept-btn">Accept</button>
                <button class="action-btn decline-btn">Decline</button>
            `;
            actionsDiv.querySelector('.accept-btn').onclick = () => handleAccept(content, contentType, actionsDiv);
            actionsDiv.querySelector('.decline-btn').onclick = () => handleDecline(messageId, { content, contentType });
            messageDiv.appendChild(actionsDiv);
        }

        // Add placeholder for timestamp if bot
        if (role === 'bot') {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.innerText = 'Response: Calculating...';
            messageDiv.appendChild(timeDiv);
        }

        chatMessages.appendChild(messageDiv);
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
            messageDiv.style.transition = 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out';
        }, 50);
        scrollToBottom();
    }

    function getResponseTime() {
        if (!messageStartTime) return '0';
        const diff = Math.floor((new Date() - messageStartTime) / 1000);
        return diff;
    }

    function addResponseTime() {
        const botMessages = chatMessages.querySelectorAll('.message.bot');
        if (botMessages.length) {
            const lastBot = botMessages[botMessages.length - 1];
            const timeDiv = lastBot.querySelector('.message-time');
            if (timeDiv) {
                timeDiv.innerText = `Response: ${getResponseTime()} sec`;
            }
        }
    }

    // --- Handle Accept/Decline and Feedback ---
    async function handleAccept(content, contentType, actionsDiv) {
        if (contentType !== 'news' && contentType !== 'linkedin') return;
        if (actionsDiv) {
            actionsDiv.style.opacity = '0';
            setTimeout(() => actionsDiv.remove(), 400); // Remove buttons after Accept
        }

        const systemMessage = contentType === 'news'
            ? 'Insights accepted. Generating post...'
            : 'LinkedIn post accepted.';

        setProcessingState(true, systemMessage);
        addMessage('system', systemMessage);
        messageStartTime = new Date();

        try {
            const res = await fetch('/api/chat/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: currentSessionId,
                    lastMessageContent: content,
                    type: contentType
                })
            });
            const data = await res.json();
            if (res.ok) {
                renderChat(data);
                
                // If LinkedIn post is accepted, show Copy button
                if (contentType === 'linkedin') {
                    setTimeout(() => {
                        showCopyButtonForAcceptedPost(content);
                    }, 500);
                }
            }
        } catch (err) {
            addMessage('system', 'A server error occurred.');
        } finally {
            setProcessingState(false);
            addResponseTime();
        }
    }

    function showCopyButtonForAcceptedPost(content) {
        // Find the last LinkedIn post message and add a Copy button
        const messages = chatMessages.querySelectorAll('.message.bot');
        const lastMessage = messages[messages.length - 1];
        
        if (lastMessage && lastMessage.querySelector('.linkedin-content')) {
            // Remove any existing copy button
            const existingCopyBtn = lastMessage.querySelector('.accepted-copy-btn');
            if (existingCopyBtn) {
                existingCopyBtn.remove();
            }
            
            // Create new copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'action-btn copy-btn accepted-copy-btn';
            copyBtn.textContent = 'Copy';
            copyBtn.style.marginTop = '16px';
            copyBtn.style.opacity = '0';
            copyBtn.style.transform = 'translateY(10px)';
            
            copyBtn.onclick = (e) => handleCopy(content, null, e.target);
            
            lastMessage.appendChild(copyBtn);
            
            // Animate the button in
            setTimeout(() => {
                copyBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                copyBtn.style.opacity = '1';
                copyBtn.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    function handleCopy(content, actionsDiv, copyBtn) {
        // Modern clipboard API with fallback
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(content).then(() => {
                showCopySuccess(copyBtn, actionsDiv);
            }).catch(err => {
                console.error('Clipboard API failed:', err);
                fallbackCopy(content, copyBtn, actionsDiv);
            });
        } else {
            fallbackCopy(content, copyBtn, actionsDiv);
        }
    }

    function fallbackCopy(content, copyBtn, actionsDiv) {
        // Fallback method using textarea
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess(copyBtn, actionsDiv);
            } else {
                throw new Error('execCommand failed');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            // Manual copy prompt
            prompt('Copy this text manually:', content);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    function showCopySuccess(copyBtn, actionsDiv) {
        copyBtn.innerText = 'Copied!';
        copyBtn.style.background = '#16a34a';
        copyBtn.style.transform = 'translateY(-2px)';
        setTimeout(() => {
            copyBtn.innerText = 'Copy';
            copyBtn.style.background = 'var(--glass-bg)';
            copyBtn.style.transform = 'translateY(0)';
        }, 2000);
        
        // Remove action buttons
        if (actionsDiv) {
            actionsDiv.style.opacity = '0';
            setTimeout(() => actionsDiv.remove(), 400);
        }
        
        // Move to next keyword or enable input
        if (currentKeywordIndex < keywords.length - 1) {
            currentKeywordIndex++;
            setProcessingState(true, 'Processing next keyword...');
            setTimeout(() => sendMessage(), 1000); // Start next keyword
        } else {
            setProcessingState(false, 'Enter new keywords to continue...');
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.placeholder = 'Enter new keywords to continue...';
            editButton.style.display = 'none';
        }
    }

    function handleDecline(messageId, lastMessage) {
        declineInfo = { messageId, lastMessage };
        feedbackModal.style.display = 'flex';
        feedbackModal.style.opacity = '0';
        feedbackModal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            feedbackModal.style.opacity = '1';
            feedbackModal.style.transform = 'scale(1)';
            feedbackModal.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
        }, 50);
        feedbackText.focus();
    }

    async function submitFeedback() {
        const feedback = feedbackText.value.trim();
        if (!feedback) return alert('Feedback cannot be empty.');
        closeFeedbackModal();
        setProcessingState(true, 'Refining content based on feedback...');
        addMessage('system', 'Feedback submitted. Refining content...');
        messageStartTime = new Date();

        try {
            const res = await fetch('/api/chat/decline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: currentSessionId,
                    feedback: feedback,
                    lastMessage: declineInfo.lastMessage,
                    messageId: declineInfo.messageId
                })
            });
            const data = await res.json();
            if (res.ok) renderChat(data);
            else addMessage('system', `Error: ${data.msg}`);
        } catch (err) {
            addMessage('system', 'A server error occurred.');
        } finally {
            setProcessingState(false);
            addResponseTime();
        }
    }

    function closeFeedbackModal() {
        feedbackModal.style.opacity = '0';
        feedbackModal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            feedbackModal.style.display = 'none';
            feedbackText.value = '';
        }, 300);
    }

    function setProcessingState(processing, placeholderText = '') {
        isProcessing = processing;
        messageInput.disabled = isProcessing;
        sendButton.disabled = isProcessing;
        messageInput.placeholder = placeholderText || (currentSessionId ? 'This chat is complete. Start a new chat.' : 'Enter keywords for business insights...');
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- Rename and Delete Functions ---
    let currentChatId = null;

    function openRenameModal(chatId, currentTitle) {
        currentChatId = chatId;
        const renameModal = document.getElementById('renameModal');
        const renameText = document.getElementById('renameText');
        renameText.value = currentTitle;
        renameModal.style.display = 'flex';
        renameModal.style.opacity = '0';
        renameModal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            renameModal.style.opacity = '1';
            renameModal.style.transform = 'scale(1)';
            renameModal.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
            renameText.focus();
            renameText.select();
        }, 50);
    }

    function openDeleteModal(chatId) {
        currentChatId = chatId;
        const deleteModal = document.getElementById('deleteModal');
        deleteModal.style.display = 'flex';
        deleteModal.style.opacity = '0';
        deleteModal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            deleteModal.style.opacity = '1';
            deleteModal.style.transform = 'scale(1)';
            deleteModal.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
        }, 50);
    }

    async function editChat(chatId) {
        try {
            // Load the chat session
            const res = await fetch(`/api/chat/session/${chatId}`);
            if (res.ok) {
                const chatSession = await res.json();
                currentSessionId = chatId;
                
                // Render the chat in the main area
                renderChat(chatSession);
                
                // Enable editing mode
                isProcessing = false;
                messageInput.disabled = false;
                sendButton.disabled = false;
                messageInput.placeholder = 'Edit keywords or continue the conversation...';
                
                // Extract keywords from the first user message
                const firstUserMessage = chatSession.messages.find(msg => msg.role === 'user');
                if (firstUserMessage) {
                    keywords = firstUserMessage.content.split(',').map(k => k.trim()).filter(k => k);
                    messageInput.value = keywords.join(', ');
                }
                
                // Show edit button
                editButton.style.display = 'block';
                editButton.style.opacity = '1';
                editButton.style.transform = 'translateY(0)';
                
                // Update active chat in sidebar
                document.querySelectorAll('.chat-item').forEach(item => {
                    item.classList.remove('active');
                });
                // Find the chat item with this ID and make it active
                const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`).closest('.chat-item');
                if (chatItem) {
                    chatItem.classList.add('active');
                }
                
                // Focus on input
                messageInput.focus();
                
            } else {
                alert('Failed to load chat session');
            }
        } catch (err) {
            console.error('Edit chat error:', err);
            alert('An error occurred while loading the chat');
        }
    }

    async function renameChat() {
        const newTitle = document.getElementById('renameText').value.trim();
        if (!newTitle) return alert('Please enter a new title.');
        
        try {
            const res = await fetch(`/api/chat/rename/${currentChatId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });
            
            if (res.ok) {
                closeRenameModal();
                loadChatHistory(); // Refresh the chat list
            } else {
                const data = await res.json();
                console.error('Rename error:', data);
                // Silently handle error - no alert shown
            }
        } catch (err) {
            console.error('Rename chat error:', err);
            alert('Network error: Unable to connect to server. Please check your connection.');
        }
    }

    async function deleteChat() {
        try {
            const res = await fetch(`/api/chat/delete/${currentChatId}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                closeDeleteModal();
                // If we're currently viewing the deleted chat, clear the chat area
                if (currentSessionId === currentChatId) {
                    currentSessionId = null;
                    chatMessages.innerHTML = `
                        <div class="welcome-screen">
                            <h1>🔎Research Assistant</h1>
                            <p>Enter keywords below to discover actionable business insights.</p>
                        </div>`;
                    setProcessingState(false);
                }
                loadChatHistory(); // Refresh the chat list
            } else {
                const data = await res.json();
                console.error('Delete error:', data);
                // Silently handle error - no alert shown
            }
        } catch (err) {
            console.error('Delete chat error:', err);
            alert('Network error: Unable to connect to server. Please check your connection.');
        }
    }

    function closeRenameModal() {
        const renameModal = document.getElementById('renameModal');
        renameModal.style.opacity = '0';
        renameModal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            renameModal.style.display = 'none';
            document.getElementById('renameText').value = '';
        }, 300);
    }

    function closeDeleteModal() {
        const deleteModal = document.getElementById('deleteModal');
        deleteModal.style.opacity = '0';
        deleteModal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            deleteModal.style.display = 'none';
        }, 300);
    }

    // Event listeners for modals
    document.getElementById('submitRenameBtn').addEventListener('click', renameChat);
    document.getElementById('cancelRenameBtn').addEventListener('click', closeRenameModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteChat);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);

    // Allow Enter key to submit rename
    document.getElementById('renameText').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            renameChat();
        }
    });
}