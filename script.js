const API_TOKEN = 'uskuYtAJttoQJGIHFnXRyNW';
const BASE_URL = 'https://api.vika.cn/fusion/v1/datasheets/dstQvcdxqTTbCiiDxt/records';
const ITEMS_PER_PAGE = 50;

class ResourceLibrary {
    constructor() {
        this.resources = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchInput = document.getElementById('searchInput');
        this.resourceList = document.getElementById('resourceList');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.pagination = document.getElementById('pagination');
        
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.fetchResources();
    }

    bindEvents() {
        this.searchInput.addEventListener('input', () => {
            this.currentPage = 1;
            this.filterResources(this.searchInput.value);
        });

        this.pagination.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn')) {
                this.currentPage = parseInt(e.target.dataset.page);
                this.renderCurrentPage();
            }
        });
    }

    async fetchResources() {
        try {
            const response = await fetch(`${BASE_URL}?viewId=viwLlvMFsUVWA&pageSize=1000`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('网络请求失败');
            }

            const data = await response.json();
            console.log('API响应数据:', data);

            if (data && data.success && data.data && Array.isArray(data.data.records)) {
                this.resources = data.data.records;
                this.totalPages = Math.ceil(this.resources.length / ITEMS_PER_PAGE);
                this.renderCurrentPage();
                this.loading.style.display = 'none';
                this.error.style.display = 'none';
            } else {
                throw new Error('数据格式不正确');
            }
        } catch (error) {
            console.error('获取资源失败:', error);
            this.loading.style.display = 'none';
            this.error.style.display = 'block';
            this.error.textContent = `加载失败: ${error.message}`;
        }
    }

    formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    renderResources(resources) {
        if (!resources.length) {
            this.resourceList.innerHTML = '<div class="error">没有找到资源</div>';
            this.pagination.style.display = 'none';
            return;
        }

        const startIndex = (this.currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const currentPageResources = resources.slice(startIndex, endIndex);

        this.resourceList.innerHTML = currentPageResources.map(resource => {
            const title = resource.fields['标题（点击放大镜搜索关键词）'];
            const url = resource.fields['链接']?.text || resource.fields['链接']?.title || '#';
            const category = resource.fields['分类'] || '';
            const createTime = this.formatDate(resource.fields['创建时间']);
            
            if (!title) return '';
            
            return `
                <div class="resource-card">
                    <div class="resource-header">
                        <h3 class="resource-title">${title}</h3>
                        ${category ? `<span class="resource-category">${category}</span>` : ''}
                    </div>
                    <div class="resource-footer">
                        <span class="resource-date">${createTime}</span>
                        ${url !== '#' ? `
                            <a href="${url}" 
                               class="download-btn" 
                               target="_blank">
                               下载资源
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        this.renderPagination(resources.length);
    }

    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        let paginationHTML = '';

        if (totalPages > 1) {
            paginationHTML += `
                <button class="page-btn" data-page="1" ${this.currentPage === 1 ? 'disabled' : ''}>首页</button>
                <button class="page-btn" data-page="${Math.max(1, this.currentPage - 1)}" ${this.currentPage === 1 ? 'disabled' : ''}>上一页</button>
                <span class="page-info">第 ${this.currentPage} / ${totalPages} 页</span>
                <button class="page-btn" data-page="${Math.min(totalPages, this.currentPage + 1)}" ${this.currentPage === totalPages ? 'disabled' : ''}>下一页</button>
                <button class="page-btn" data-page="${totalPages}" ${this.currentPage === totalPages ? 'disabled' : ''}>末页</button>
            `;
        }

        this.pagination.innerHTML = paginationHTML;
        this.pagination.style.display = totalPages > 1 ? 'flex' : 'none';
    }

    filterResources(searchTerm) {
        const filtered = this.resources.filter(resource => {
            const title = resource.fields['标题（点击放大镜搜索关键词）'] || '';
            const category = resource.fields['分类'] || '';
            return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   category.toLowerCase().includes(searchTerm.toLowerCase());
        });
        this.renderResources(filtered);
    }

    renderCurrentPage() {
        this.renderResources(this.resources);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ResourceLibrary();
}); 