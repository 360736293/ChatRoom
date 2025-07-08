// src/main/resources/static/js/utils/messageFormatter.js

export class MessageFormatter {
    constructor() {
        // 表情正则表达式
        this.emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

        // URL正则表达式
        this.urlRegex = /(https?:\/\/[^\s]+)/g;

        // @提及正则表达式
        this.mentionRegex = /@(\w+)/g;

        // 代码块正则表达式
        this.codeBlockRegex = /```([\s\S]*?)```/g;
        this.inlineCodeRegex = /`([^`]+)`/g;
    }

    /**
     * 格式化消息文本
     * @param {string} text - 原始文本
     * @param {Object} options - 格式化选项
     * @returns {string} - 格式化后的HTML
     */
    formatMessage(text, options = {}) {
        let formatted = this.escapeHtml(text);

        // 处理代码块（优先处理，避免内部内容被其他格式化影响）
        if (options.enableCodeBlocks !== false) {
            formatted = this.formatCodeBlocks(formatted);
        }

        // 处理行内代码
        if (options.enableInlineCode !== false) {
            formatted = this.formatInlineCode(formatted);
        }

        // 处理URL
        if (options.enableLinks !== false) {
            formatted = this.formatLinks(formatted);
        }

        // 处理@提及
        if (options.enableMentions !== false) {
            formatted = this.formatMentions(formatted, options.currentUserId);
        }

        // 处理表情
        if (options.enableEmojis !== false) {
            formatted = this.formatEmojis(formatted);
        }

        // 处理换行
        if (options.enableLineBreaks !== false) {
            formatted = this.formatLineBreaks(formatted);
        }

        return formatted;
    }

    /**
     * 转义HTML特殊字符
     */
    escapeHtml(text) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return text.replace(/[&<>"']/g, char => escapeMap[char]);
    }

    /**
     * 格式化表情符号
     */
    formatEmojis(text) {
        return text.replace(this.emojiRegex, match => {
            return `<span class="emoji">${match}</span>`;
        });
    }

    /**
     * 格式化URL为可点击链接
     */
    formatLinks(text) {
        return text.replace(this.urlRegex, url => {
            const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="message-link">${displayUrl}</a>`;
        });
    }

    /**
     * 格式化@提及
     */
    formatMentions(text, currentUserId) {
        return text.replace(this.mentionRegex, (match, username) => {
            const isCurrentUser = username === currentUserId;
            const className = isCurrentUser ? 'mention mention-self' : 'mention';
            return `<span class="${className}">@${username}</span>`;
        });
    }

    /**
     * 格式化代码块
     */
    formatCodeBlocks(text) {
        return text.replace(this.codeBlockRegex, (match, code) => {
            return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
        });
    }

    /**
     * 格式化行内代码
     */
    formatInlineCode(text) {
        return text.replace(this.inlineCodeRegex, (match, code) => {
            return `<code class="inline-code">${code}</code>`;
        });
    }

    /**
     * 格式化换行
     */
    formatLineBreaks(text) {
        return text.replace(/\n/g, '<br>');
    }

    /**
     * 格式化时间戳
     */
    formatTimestamp(date) {
        const now = new Date(date);
        const today = new Date();

        // 判断是否是今天
        const isToday = now.toDateString() === today.toDateString();

        // 判断是否是昨天
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = now.toDateString() === yesterday.toDateString();

        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;

        if (isToday) {
            return `今天 ${time}`;
        } else if (isYesterday) {
            return `昨天 ${time}`;
        } else {
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            return `${month}/${day} ${time}`;
        }
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 提取消息中的纯文本（去除格式）
     */
    extractPlainText(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    /**
     * 高亮搜索关键词
     */
    highlightKeywords(text, keywords) {
        if (!keywords || keywords.length === 0) return text;

        let highlighted = text;
        keywords.forEach(keyword => {
            const regex = new RegExp(`(${this.escapeRegex(keyword)})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark class="highlight">$1</mark>');
        });

        return highlighted;
    }

    /**
     * 转义正则表达式特殊字符
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// 创建单例实例
export const messageFormatter = new MessageFormatter();