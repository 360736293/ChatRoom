// src/main/resources/static/js/utils/imageUtils.js

export class ImageUtils {
    constructor() {
        this.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        this.ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
    }

    /**
     * 验证图片文件
     * @param {File} file - 文件对象
     * @returns {Object} - {valid: boolean, error: string}
     */
    validateImage(file) {
        if (!file) {
            return { valid: false, error: '请选择图片文件' };
        }

        // 检查文件类型
        if (!this.ALLOWED_TYPES.includes(file.type)) {
            return { valid: false, error: '只支持 JPG 和 PNG 格式的图片' };
        }

        // 检查文件大小
        if (file.size > this.MAX_FILE_SIZE) {
            const sizeMB = (file.size / 1024 / 1024).toFixed(2);
            return { valid: false, error: `图片大小不能超过 5MB (当前: ${sizeMB}MB)` };
        }

        return { valid: true, error: null };
    }

    /**
     * 将文件转换为 Base64
     * @param {File} file - 文件对象
     * @returns {Promise<string>} - Base64 字符串
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                resolve(e.target.result);
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * 压缩图片
     * @param {string} base64 - Base64 图片字符串
     * @param {number} maxWidth - 最大宽度
     * @param {number} maxHeight - 最大高度
     * @param {number} quality - 质量 (0-1)
     * @returns {Promise<string>} - 压缩后的 Base64
     */
    compressImage(base64, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 计算缩放比例
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                // 绘制图片
                ctx.drawImage(img, 0, 0, width, height);

                // 转换为 Base64
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };

            img.onerror = reject;
            img.src = base64;
        });
    }

    /**
     * 从剪贴板获取图片
     * @param {ClipboardEvent} event - 剪贴板事件
     * @returns {File|null} - 图片文件或 null
     */
    getImageFromClipboard(event) {
        const items = event.clipboardData?.items;
        if (!items) return null;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                return items[i].getAsFile();
            }
        }

        return null;
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} - 格式化后的字符串
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 创建图片预览信息
     * @param {File} file - 文件对象
     * @returns {string} - 预览信息文本
     */
    createPreviewInfo(file) {
        const size = this.formatFileSize(file.size);
        const name = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
        return `${name} (${size})`;
    }

    /**
     * 检查 Base64 字符串是否为有效图片
     * @param {string} base64 - Base64 字符串
     * @returns {boolean} - 是否有效
     */
    isValidBase64Image(base64) {
        const regex = /^data:image\/(jpeg|jpg|png);base64,/;
        return regex.test(base64);
    }
}

// 创建单例实例
export const imageUtils = new ImageUtils();