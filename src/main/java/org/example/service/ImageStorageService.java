package org.example.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.xml.bind.DatatypeConverter;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * 图片存储服务，负责将图片存储到文件系统
 */
@Slf4j
@Service
public class ImageStorageService {

    // 图片访问路径前缀
    public static final String IMAGE_ACCESS_PREFIX = "/api/images/";
    // 图片存储目录
    private static final String IMAGE_STORAGE_DIR = "images";

    public ImageStorageService() {
        // 初始化图片存储目录
        File storageDir = new File(IMAGE_STORAGE_DIR);
        if (!storageDir.exists()) {
            storageDir.mkdirs();
            log.info("创建图片存储目录: {}", storageDir.getAbsolutePath());
        }
    }

    /**
     * 存储图片到文件系统
     *
     * @param base64Image Base64编码的图片
     * @param fileName    文件名
     * @return 图片访问路径
     */
    public String storeImage(String base64Image, String fileName) {
        try {
            // 从Base64字符串中提取图片数据
            String[] parts = base64Image.split(",");
            if (parts.length != 2) {
                throw new IllegalArgumentException("无效的Base64图片格式");
            }

            String imageData = parts[1];
            byte[] imageBytes = DatatypeConverter.parseBase64Binary(imageData);

            // 生成唯一文件名
            String extension = getFileExtension(fileName);
            String uniqueFileName = UUID.randomUUID() + (extension != null ? "." + extension : ".png");

            // 存储图片
            Path imagePath = Paths.get(IMAGE_STORAGE_DIR, uniqueFileName);
            Files.write(imagePath, imageBytes);

            // 返回图片访问路径
            return IMAGE_ACCESS_PREFIX + uniqueFileName;

        } catch (Exception e) {
            log.error("存储图片失败", e);
            throw new RuntimeException("存储图片失败", e);
        }
    }

    /**
     * 根据文件名获取图片文件
     *
     * @param fileName 文件名
     * @return 图片文件
     */
    public File getImageFile(String fileName) {
        return new File(IMAGE_STORAGE_DIR, fileName);
    }

    /**
     * 获取文件扩展名
     *
     * @param fileName 文件名
     * @return 文件扩展名
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf('.') == -1) {
            return null;
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }

    /**
     * 清理过期图片
     */
    public void cleanupExpiredImages() {
        // 这里可以实现定期清理过期图片的逻辑
        // 例如删除30天前的图片
    }
}
