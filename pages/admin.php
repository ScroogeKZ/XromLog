<?php
require_once 'includes/layout.php';

ob_start();
?>

<div class="container" style="padding: 2rem 0;">
    <div class="card">
        <div class="card-header">
            <h2 class="card-title">Администрирование</h2>
            <p>Управление системой и пользователями</p>
        </div>
        
        <div class="grid grid-2">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Управление пользователями</h3>
                </div>
                
                <div id="usersList">
                    <p>Загрузка пользователей...</p>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Все заявки</h3>
                </div>
                
                <div id="allRequestsList">
                    <p>Загрузка заявок...</p>
                </div>
                
                <div style="margin-top: 1rem;">
                    <button onclick="loadAllRequests()" class="btn btn-secondary">Обновить список</button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Модальное окно для редактирования заявки -->
<div id="editRequestModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2rem; border-radius: 0.5rem; max-width: 500px; width: 90%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 id="editRequestTitle">Редактировать заявку</h3>
            <button onclick="hideEditRequestModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        
        <form id="editRequestForm">
            <input type="hidden" name="id" id="editRequestId">
            
            <div class="form-group">
                <label class="form-label">Статус</label>
                <select name="status" class="form-select" id="editRequestStatus">
                    <option value="new">Новая</option>
                    <option value="processing">В обработке</option>
                    <option value="assigned">Назначена</option>
                    <option value="in_transit">В пути</option>
                    <option value="delivered">Доставлена</option>
                    <option value="cancelled">Отменена</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Стоимость (тенге)</label>
                <input type="number" name="priceKzt" step="0.01" class="form-input" id="editRequestPrice">
            </div>
            
            <div class="form-group">
                <label class="form-label">Примечание к стоимости</label>
                <textarea name="priceNotes" class="form-textarea" id="editRequestNotes" rows="3"></textarea>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" onclick="hideEditRequestModal()" class="btn btn-secondary">Отмена</button>
                <button type="submit" class="btn btn-primary">Сохранить</button>
            </div>
        </form>
    </div>
</div>

<script>
let currentEditingRequestId = null;

async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const result = await response.json();
        
        if (response.ok && result.data) {
            displayUsers(result.data);
        } else {
            document.getElementById('usersList').innerHTML = '<p>Ошибка загрузки пользователей</p>';
        }
    } catch (error) {
        document.getElementById('usersList').innerHTML = '<p>Ошибка сети</p>';
    }
}

function displayUsers(users) {
    const container = document.getElementById('usersList');
    
    if (users.length === 0) {
        container.innerHTML = '<p>Нет пользователей</p>';
        return;
    }
    
    const html = `
        <table class="table" style="font-size: 0.875rem;">
            <thead>
                <tr>
                    <th>Пользователь</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>
                            <strong>${user.firstName} ${user.lastName}</strong><br>
                            <small style="color: var(--text-secondary);">${user.username}</small>
                        </td>
                        <td>${user.email}</td>
                        <td>
                            <select onchange="updateUserRole(${user.id}, this.value)" class="form-select" style="padding: 0.25rem;">
                                <option value="employee" ${user.role === 'employee' ? 'selected' : ''}>Сотрудник</option>
                                <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Менеджер</option>
                            </select>
                        </td>
                        <td>
                            <small style="color: var(--text-secondary);">
                                ${new Date(user.createdAt).toLocaleDateString('ru-RU')}
                            </small>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function updateUserRole(userId, newRole) {
    try {
        const response = await fetch('/api/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, role: newRole })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Роль пользователя обновлена!');
        } else {
            alert(result.error || 'Ошибка обновления роли');
            loadUsers(); // Перезагружаем список для отката изменений
        }
    } catch (error) {
        alert('Ошибка сети');
        loadUsers();
    }
}

async function loadAllRequests() {
    try {
        const response = await fetch('/api/shipment-requests');
        const result = await response.json();
        
        if (response.ok && result.data) {
            displayAllRequests(result.data);
        } else {
            document.getElementById('allRequestsList').innerHTML = '<p>Ошибка загрузки заявок</p>';
        }
    } catch (error) {
        document.getElementById('allRequestsList').innerHTML = '<p>Ошибка сети</p>';
    }
}

function displayAllRequests(requests) {
    const container = document.getElementById('allRequestsList');
    
    if (requests.length === 0) {
        container.innerHTML = '<p>Нет заявок</p>';
        return;
    }
    
    const html = `
        <div style="max-height: 400px; overflow-y: auto;">
            ${requests.slice(0, 10).map(request => `
                <div style="padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.375rem; margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.5rem;">
                        <strong>${request.requestNumber}</strong>
                        <span class="status-badge status-${request.status}" style="margin-left: auto; margin-right: 1rem;">${getStatusName(request.status)}</span>
                        <button onclick="editRequest(${request.id}, '${request.requestNumber}', '${request.status}', ${request.priceKzt || 'null'}, '${(request.priceNotes || '').replace(/'/g, "\\'")}')" class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">Редактировать</button>
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                        <p><strong>Тип:</strong> ${request.type === 'local' ? 'Местная' : 'Междугородняя'}</p>
                        <p><strong>Маршрут:</strong> ${request.senderName} → ${request.recipientName}</p>
                        <p><strong>Груз:</strong> ${request.cargoDescription} (${request.cargoWeight} кг)</p>
                        ${request.priceKzt ? `<p><strong>Стоимость:</strong> ${request.priceKzt.toLocaleString()} ₸</p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        ${requests.length > 10 ? `<p style="text-align: center; color: var(--text-secondary); font-size: 0.875rem; margin-top: 1rem;">Показано первые 10 из ${requests.length} заявок</p>` : ''}
    `;
    
    container.innerHTML = html;
}

function editRequest(id, requestNumber, status, priceKzt, priceNotes) {
    document.getElementById('editRequestId').value = id;
    document.getElementById('editRequestTitle').textContent = `Редактировать заявку ${requestNumber}`;
    document.getElementById('editRequestStatus').value = status;
    document.getElementById('editRequestPrice').value = priceKzt || '';
    document.getElementById('editRequestNotes').value = priceNotes || '';
    
    document.getElementById('editRequestModal').style.display = 'block';
}

function hideEditRequestModal() {
    document.getElementById('editRequestModal').style.display = 'none';
    document.getElementById('editRequestForm').reset();
}

function getStatusName(status) {
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

document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    loadAllRequests();
    
    document.getElementById('editRequestForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Преобразуем пустые значения
        if (data.priceKzt === '') {
            data.priceKzt = null;
        } else {
            data.priceKzt = parseFloat(data.priceKzt);
        }
        
        try {
            const response = await fetch('/api/shipment-requests', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Заявка обновлена!');
                hideEditRequestModal();
                loadAllRequests();
            } else {
                alert(result.error || 'Ошибка обновления заявки');
            }
        } catch (error) {
            alert('Ошибка сети');
        }
    });
});
</script>

<?php
$content = ob_get_clean();
renderLayout('Администрирование', $content, true, 'manager');
?>