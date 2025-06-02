// 表情数据
const emojiData = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏'],
    gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦵', '🦶'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗'],
    food: ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥗', '🍿', '🧈', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧊', '🍧'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿'],
    objects: ['💡', '🔦', '🏮', '🪔', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞️', '📸', '📷', '📹', '📼', '🔍', '🔎', '🕯️', '💰', '💴', '💵', '💶', '💷', '💸', '🪙'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈']
};

// DOM元素
const emojiButton = document.getElementById('emojiButton');
const emojiPicker = document.getElementById('emojiPicker');
const emojiGrid = document.getElementById('emojiGrid');
const categoryBtns = document.querySelectorAll('.category-btn');

let currentCategory = 'smileys';
let messageCount = 1;

// 初始化
function init() {
    renderEmojis(currentCategory);
    setupEventListeners();
}

// 渲染表情
function renderEmojis(category) {
    emojiGrid.innerHTML = '';
    emojiData[category].forEach(emoji => {
        const button = document.createElement('button');
        button.className = 'emoji-item';
        button.textContent = emoji;
        button.addEventListener('click', () => insertEmoji(emoji));
        emojiGrid.appendChild(button);
    });
}

// 插入表情到输入框
function insertEmoji(emoji) {
    const cursorPos = messageInput.selectionStart;
    const textBefore = messageInput.value.substring(0, cursorPos);
    const textAfter = messageInput.value.substring(cursorPos);

    messageInput.value = textBefore + emoji + textAfter;
    messageInput.selectionStart = messageInput.selectionEnd = cursorPos + emoji.length;
    messageInput.focus();
    emojiPicker.classList.remove('show');
}

// 格式化消息（处理表情）
function formatMessage(text) {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
        match => `<span class="emoji">${match}</span>`);
}

// 设置事件监听器
function setupEventListeners() {
    // 表情按钮点击
    emojiButton.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('show');
    });

    // 分类按钮点击
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderEmojis(currentCategory);
        });
    });

    // 点击外部关闭表情选择器
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiButton) {
            emojiPicker.classList.remove('show');
        }
    });
}

// 初始化应用
init();