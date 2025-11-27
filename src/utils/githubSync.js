
class GithubSync {
    constructor() {
        this.baseUrl = 'https://api.github.com';
    }

    async validateToken(token) {
        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!response.ok) throw new Error('Invalid token');
            const user = await response.json();
            return user;
        } catch (error) {
            console.error('Token validation failed:', error);
            throw error;
        }
    }

    async getRepo(token, owner, repoName) {
        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repoName}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Failed to fetch repo');
        return await response.json();
    }

    async createRepo(token, name) {
        const response = await fetch(`${this.baseUrl}/user/repos`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                description: 'Created by Cheatsheet Maker',
                private: true,
                auto_init: true
            })
        });
        if (!response.ok) throw new Error('Failed to create repo');
        return await response.json();
    }

    async getFile(token, owner, repo, path) {
        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Failed to get file');
        return await response.json();
    }

    async getFileContent(token, owner, repo, path) {
        const fileData = await this.getFile(token, owner, repo, path);
        if (!fileData) return null;

        // Decode Base64 content (handling UTF-8)
        try {
            return decodeURIComponent(escape(atob(fileData.content.replace(/\n/g, ''))));
        } catch (e) {
            console.error('Failed to decode file content:', e);
            return atob(fileData.content); // Fallback for simple ASCII
        }
    }

    async uploadFile(token, owner, repo, path, content, message = 'Update file') {
        // First try to get the file to get its SHA (if it exists)
        const currentFile = await this.getFile(token, owner, repo, path);
        const sha = currentFile ? currentFile.sha : undefined;

        // Convert content to Base64 (handling UTF-8)
        const contentEncoded = btoa(unescape(encodeURIComponent(content)));

        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                content: contentEncoded,
                sha
            })
        });

        if (!response.ok) throw new Error('Failed to upload file');
        return await response.json();
    }

    async uploadImage(token, owner, repo, path, base64Content, message = 'Upload image') {
        // First try to get the file to get its SHA (if it exists)
        const currentFile = await this.getFile(token, owner, repo, path);
        const sha = currentFile ? currentFile.sha : undefined;

        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                content: base64Content,
                sha
            })
        });

        if (!response.ok) throw new Error('Failed to upload image');
        return await response.json();
    }
}

export default new GithubSync();
