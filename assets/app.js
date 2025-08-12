// ХРОМ Логистика - JavaScript Application
class App {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.bindEvents();
        this.initPage();
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.data.user;
                this.updateAuthUI();
            }
        } catch (error) {
            console.log('Not authenticated');
        }
    }

    updateAuthUI() {
        const authLinks = document.querySelectorAll('.auth-required');
        const guestLinks = document.querySelectorAll('.guest-only');
        
        if (this.currentUser) {
            authLinks.forEach(el => el.style.display = 'block');
            guestLinks.forEach(el => el.style.display = 'none');
            
            const userInfo = document.querySelector('.user-info');
            if (userInfo) {
                userInfo.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            }
        } else {
            authLinks.forEach(el => el.style.display = 'none');
            guestLinks.forEach(el => el.style.display = 'block');
        }
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Register form  
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Request forms
        const requestForm = document.getElementById('requestForm');
        if (requestForm) {
            requestForm.addEventListener('submit', this.handleCreateRequest.bind(this));
        }

        const publicRequestForm = document.getElementById('publicRequestForm');
        if (publicRequestForm) {
            publicRequestForm.addEventListener('submit', this.handleCreatePublicRequest.bind(this));
        }

        // Track form
        const trackForm = document.getElementById('trackForm');
        if (trackForm) {
            trackForm.addEventListener('submit', this.handleTrackRequest.bind(this));
        }

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleUpdateProfile.bind(this));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.currentUser = result.data.user;
                this.showMessage('Вход выполнен успешно!', 'success');
                setTimeout(() => window.location.href = '/dashboard', 1000);
            } else {
                this.showMessage(result.error || 'Ошибка входа', 'error');
            }
        } catch (error) {
            this.showMessage('Ошибка сети', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.confirmPassword) {
            this.showMessage('Пароли не совпадают', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Регистрация успешна! Войдите в систему', 'success');
                setTimeout(() => window.location.href = '/login', 2000);
            } else {
                this.showMessage(result.error || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            this.showMessage('Ошибка сети', 'error');
        }
    }

    async handleLogout(e) {
        e.preventDefault();
        
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            this.currentUser = null;
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }

    async handleCreateRequest(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/shipment-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage(`Заявка создана! Номер: ${result.data.requestNumber}`, 'success');
                e.target.reset();
                this.loadRequests();
            } else {
                this.showMessage(result.error || 'Ошибка создания заявки', 'error');
            }
        } catch (error) {
            this.showMessage('Ошибка сети', 'error');
        }
    }

    async handleCreatePublicRequest(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/shipment-requests/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage(`Заявка создана! Номер для отслеживания: ${result.data.requestNumber}`, 'success');
                e.target.reset();
            } else {
                this.showMessage(result.error || 'Ошибка создания заявки', 'error');
            }
        } catch (error) {
            this.showMessage('Ошибка сети', 'error');
        }
    }

    async handleTrackRequest(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/shipment-requests/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.displayTrackingResults(result.data);
            } else {
                this.showMessage(result.error || 'Заявки не найдены', 'error');
            }
        } catch (error) {
            this.showMessage('Ошибка сети', 'error');
        }
    }

    async handleUpdateProfile(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Профиль обновлен!', 'success');
                await this.checkAuth(); // Обновляем данные пользователя
            } else {
                this.showMessage(result.error || 'Ошибка обновления профиля', 'error');
            }
        } catch (error) {
            this.showMessage('Ошибка сети', 'error');
        }
    }

    displayTrackingResults(requests) {
        const resultsContainer = document.getElementById('trackingResults');
        if (!resultsContainer) return;

        if (requests.length === 0) {
            resultsContainer.innerHTML = '<p>Заявки по указанному номеру телефона не найдены.</p>';
            return;
        }

        const html = requests.map(request => `
            <div class="card mb-4">
                <div class="card-header">
                    <h3>${request.requestNumber}</h3>
                    <span class="status-badge status-${request.status}">${request.statusName}</span>
                </div>
                <div class="grid grid-2">
                    <div>
                        <p><strong>Тип:</strong> ${request.type === 'local' ? 'Местная доставка' : 'Междугородняя'}</p>
                        <p><strong>Отправитель:</strong> ${request.senderName}</p>
                        <p><strong>Получатель:</strong> ${request.recipientName}</p>
                        <p><strong>Груз:</strong> ${request.cargoDescription}</p>
                    </div>
                    <div>
                        <p><strong>Создана:</strong> ${new Date(request.createdAt).toLocaleDateString('ru-RU')}</p>
                        <p><strong>Обновлена:</strong> ${new Date(request.updatedAt).toLocaleDateString('ru-RU')}</p>
                        ${request.priceKzt ? `<p><strong>Стоимость:</strong> ${request.priceKzt.toLocaleString()} тенге</p>` : ''}
                        ${request.priceNotes ? `<p><strong>Примечание:</strong> ${request.priceNotes}</p>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = html;
    }

    async loadRequests() {
        const requestsContainer = document.getElementById('requestsList');
        if (!requestsContainer) return;

        try {
            const response = await fetch('/api/shipment-requests');
            const result = await response.json();

            if (response.ok && result.data) {
                this.displayRequests(result.data);
            }
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    }

    displayRequests(requests) {
        const requestsContainer = document.getElementById('requestsList');
        if (!requestsContainer) return;

        if (requests.length === 0) {
            requestsContainer.innerHTML = '<p>У вас пока нет заявок.</p>';
            return;
        }

        const html = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Номер</th>
                        <th>Тип</th>
                        <th>Статус</th>
                        <th>Отправитель</th>
                        <th>Получатель</th>
                        <th>Создана</th>
                        <th>Стоимость</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(request => `
                        <tr>
                            <td>${request.requestNumber}</td>
                            <td>${request.type === 'local' ? 'Местная' : 'Междугородняя'}</td>
                            <td><span class="status-badge status-${request.status}">${this.getStatusName(request.status)}</span></td>
                            <td>${request.senderName}</td>
                            <td>${request.recipientName}</td>
                            <td>${new Date(request.createdAt).toLocaleDateString('ru-RU')}</td>
                            <td>${request.priceKzt ? request.priceKzt.toLocaleString() + ' ₸' : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        requestsContainer.innerHTML = html;
    }

    getStatusName(status) {
        const names = {
            'new': 'Новая',
            'processing': 'В обработке',
            'assigned': 'Назначена',
            'in_transit': 'В пути',
            'delivered': 'Доставлена',
            'cancelled': 'Отменена'
        };
        return names[status] || status;
    }

    showMessage(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Добавляем стили для уведомлений если их еще нет
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 0.5rem;
                    color: white;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    min-width: 300px;
                    animation: slideIn 0.3s ease;
                }
                .notification-success { background: #059669; }
                .notification-error { background: #dc2626; }
                .notification-info { background: #2563eb; }
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    margin-left: auto;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Автоматически удаляем уведомление через 5 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    initPage() {
        // Загружаем данные в зависимости от страницы
        const page = window.location.pathname;
        
        if (page === '/dashboard' || page === '/requests') {
            this.loadRequests();
        }
    }
}

// Инициализируем приложение при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});