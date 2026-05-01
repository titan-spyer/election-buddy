/* Global AI Assistant and Translation Logic */

// Mobile Menu Toggle
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    if (navLinks && hamburger) {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
}

// AI Help Popup Toggle
function toggleHelp() {
    const popup = document.getElementById('helpPopup');
    if (popup) popup.classList.toggle('active');
}

function handleKeyPress(e) {
    if(e.key === 'Enter') {
        sendMessage();
    }
}

// AI Chat Communication
async function sendMessage() {
    const inputField = document.getElementById('userInput');
    if (!inputField) return;
    
    const message = inputField.value.trim();
    if(!message) return;

    addMessage(message, 'msgUser');
    inputField.value = '';

    // Add loading message
    const loadingId = addMessage("Thinking...", 'msgAi');

    try {
        const response = await fetch(`/api/chat/?message=${encodeURIComponent(message)}`);
        const data = await response.json();
        
        // Remove loading message
        const chatBox = document.getElementById('aiChatBox');
        const loadMsg = document.getElementById(loadingId);
        if(chatBox && loadMsg) chatBox.removeChild(loadMsg);

        addMessage(data.reply || "I'm sorry, I couldn't process that.", 'msgAi');

    } catch (err) {
        console.error('Chat Error:', err);
        const chatBox = document.getElementById('aiChatBox');
        const loadMsg = document.getElementById(loadingId);
        if(chatBox && loadMsg) chatBox.removeChild(loadMsg);
        addMessage("Oops! My system is currently down. Please try again later.", 'msgAi');
    }
}

function addMessage(text, className) {
    const chatBox = document.getElementById('aiChatBox');
    if (!chatBox) return null;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chatMsg ${className}`;
    msgDiv.innerText = text;
    
    const msgId = 'msg-' + Date.now();
    msgDiv.id = msgId;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return msgId;
}

// Google Translation Logic
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,mr,ta,te,bn,gu,kn,ml,pa,or,as',
        autoDisplay: false
    }, 'google_translate_element');
}

async function triggerTranslate() {
    const btn = document.getElementById('translateBtn');
    const preferredLang = localStorage.getItem('preferredLanguage') || 'hi';
    
    if (btn) btn.textContent = "⌛ Loading...";
    
    // Function to find the dropdown
    const getDropdown = () => document.querySelector('.goog-te-combo');
    
    let select = getDropdown();
    
    // If not ready, wait up to 3 seconds
    if (!select) {
        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 300));
            select = getDropdown();
            if (select) break;
        }
    }

    if (select) {
        select.value = preferredLang;
        select.dispatchEvent(new Event('change'));
        if (btn) btn.textContent = "✅ Translated";
        setTimeout(() => {
            if (btn) btn.textContent = "🌐 Translate Page";
        }, 3000);
    } else {
        if (btn) btn.textContent = "❌ Error";
        alert("The translation engine is taking too long to load. Please check your internet connection and refresh the page.");
        setTimeout(() => { 
            if (btn) btn.textContent = "🌐 Translate Page"; 
        }, 2000);
    }
}
