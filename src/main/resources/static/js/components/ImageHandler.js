// src/main/resources/static/js/components/ImageHandler.js

import { getElementById, addEventListener, showElement, hideElement } from '../utils/domUtils.js';
import { imageUtils } from '../utils/imageUtils.js';

export class ImageHandler {
    constructor(chatWebSocket) {
        this.chatWebSocket = chatWebSocket;
        this.currentImage = null;
        this.currentFile = null;

        // DOM 元素
        this.fileInput = getElementById('fileInput');
        this.imageButton = getElementById('imageButton');
        this.messageInput = getElementById('messageInput');
        this.previewContainer = getElementById('imagePreviewContainer');
        this.previewImage = getElementById('previewImage');
        this.previewInfo = getElementById('previewInfo');

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 图片按钮点击
        addEventListener(this.imageButton, 'click', () => {
            this.fileInput.click();
        });

        // 文件选择
        addEventListener(this.fileInput, 'change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageFile(file);
            }
        });

        // 粘贴事件
        addEventListener(this.messageInput, 'paste', (e) => {
            const file = imageUtils.getImageFromClipboard(e);
            if (file) {
                e.preventDefault();
                this.handleImageFile(file);
            }
        });

        // 图片预览点击（查看大图）
        addEventListener(this.previewImage, 'click', () => {
            if (this.currentImage) {
                this.showFullImage(this.currentImage);
            }
        });

        // 移除预览按钮
        const removeButton = getElementById('removePreviewButton');
        addEventListener(removeButton, 'click', () => {
            this.removePreview();
        });
    }

    async handleImageFile(file) {
        console.log('处理图片文件:', file);

        // 验证图片
        const validation = imageUtils.validateImage(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        try {
            // 转换为 Base64
            const base64 = await imageUtils.fileToBase64(file);

            // 如果图片过大，进行压缩
            let finalBase64 = base64;
            if (file.size > 2 * 1024 * 1024) { // 大于 2MB 时压缩
                console.log('压缩大图片...');
                finalBase64 = await imageUtils.compressImage(base64);
            }

            // 显示预览
            this.showPreview(finalBase64, file);

            // 保存当前图片
            this.currentImage = finalBase64;
            this.currentFile = file;

            console.log('图片处理完成');

        } catch (error) {
            console.error('处理图片失败:', error);
            alert('处理图片失败，请重试');
        }
    }

    showPreview(base64, file) {
        this.previewImage.src = base64;
        this.previewInfo.textContent = imageUtils.createPreviewInfo(file);
        this.previewContainer.classList.add('show');
    }

    removePreview() {
        this.previewContainer.classList.remove('show');
        this.currentImage = null;
        this.currentFile = null;
        this.fileInput.value = '';
    }

    async sendImage(additionalText = '') {
        if (!this.currentImage) return false;

        // 构建消息内容
        const messageContent = {
            type: 'image',
            data: this.currentImage,
            text: additionalText,
            fileName: this.currentFile?.name || 'image.png'
        };

        // 发送图片消息
        this.chatWebSocket.sendChatMessage(JSON.stringify(messageContent));

        // 清除预览
        this.removePreview();

        return true;
    }

    showFullImage(base64) {
        // 创建全屏预览
        const modal = document.createElement('div');
        modal.className = 'image-preview-modal';

        const img = document.createElement('img');
        img.src = base64;

        modal.appendChild(img);
        document.body.appendChild(modal);

        // 点击关闭
        addEventListener(modal, 'click', () => {
            document.body.removeChild(modal);
        });

        // ESC 键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape' && document.body.contains(modal)) {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    hasImage() {
        return this.currentImage !== null;
    }

    getCurrentImage() {
        return this.currentImage;
    }
}
