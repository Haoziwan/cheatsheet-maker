// IndexedDB管理器，用于存储图片
class ImageStorage {
    constructor() {
        this.dbName = 'CheatsheetImages';
        this.storeName = 'images';
        this.db = null;
    }

    // 初始化数据库
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    }

    // 生成唯一ID
    generateId() {
        return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // 保存图片
    async saveImage(file) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const id = this.generateId();
                const imageData = {
                    id: id,
                    data: e.target.result, // base64 data URL
                    type: file.type,
                    name: file.name || 'pasted-image.png',
                    timestamp: Date.now()
                };

                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.add(imageData);

                request.onsuccess = () => resolve(id);
                request.onerror = () => reject(request.error);
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    // 获取图片
    async getImage(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 获取所有图片
    async getAllImages() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 删除图片
    async deleteImage(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // 清理未使用的图片（可选功能）
    async cleanUnusedImages(usedIds) {
        const allImages = await this.getAllImages();
        const deletePromises = [];

        for (const image of allImages) {
            if (!usedIds.includes(image.id)) {
                deletePromises.push(this.deleteImage(image.id));
            }
        }

        return Promise.all(deletePromises);
    }
}

// 单例模式
const imageStorage = new ImageStorage();

export default imageStorage;
