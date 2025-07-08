// src/main/resources/static/js/utils/dateUtils.js

/**
 * 格式化日期为后端需要的格式 yyyy-MM-dd HH:mm:ss (东八区)
 * @param {Date} date - 日期对象
 * @returns {string} - 格式化后的字符串
 */
export function formatDateForBackend(date = new Date()) {
    // 获取东八区时间（UTC+8）
    const utcTime = date.getTime();
    const chinaOffset = 8 * 60 * 60 * 1000; // 8小时的毫秒数
    const chinaTime = new Date(utcTime + chinaOffset);

    // 格式化为 yyyy-MM-dd HH:mm:ss
    const year = chinaTime.getUTCFullYear();
    const month = String(chinaTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(chinaTime.getUTCDate()).padStart(2, '0');
    const hours = String(chinaTime.getUTCHours()).padStart(2, '0');
    const minutes = String(chinaTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(chinaTime.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 将UTC时间字符串转换为本地时间的Date对象
 * @param {string} dateString - 后端返回的时间字符串
 * @returns {Date} - Date对象
 */
export function parseBackendDate(dateString) {
    // 假设后端返回的时间是东八区时间
    // 格式: yyyy-MM-dd HH:mm:ss 或 yyyy/M/d HH:mm:ss

    // 标准化格式
    const normalizedString = dateString.replace(/\//g, '-');

    // 解析日期部分
    const [datePart, timePart] = normalizedString.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    // 创建东八区时间的Date对象
    const chinaDate = new Date(Date.UTC(year, month - 1, day, hour - 8, minute, second));

    return chinaDate;
}

/**
 * 获取当前东八区时间字符串
 * @returns {string} - 格式化后的当前时间
 */
export function getCurrentChinaTime() {
    return formatDateForBackend(new Date());
}