<?php
require_once 'includes/layout.php';

ob_start();
?>

<div class="container" style="padding: 2rem 0;">
    <div class="card">
        <div class="card-header">
            <h2 class="card-title">Управление заявками</h2>
            <p>Просмотр и управление заявками на доставку</p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <button onclick="showCreateRequestModal()" class="btn btn-primary">Создать заявку</button>
        </div>
        
        <div id="requestsList">
            <p>Загрузка заявок...</p>
        </div>
    </div>
</div>

<!-- Модальное окно для создания заявки -->
<div id="createRequestModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2rem; border-radius: 0.5rem; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3>Создать заявку</h3>
            <button onclick="hideCreateRequestModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        
        <form id="requestForm">
            <div class="form-group">
                <label class="form-label">Тип заявки *</label>
                <select name="type" class="form-select" required>
                    <option value="">Выберите тип</option>
                    <option value="local">Местная доставка (Астана)</option>
                    <option value="intercity">Междугородняя доставка</option>
                </select>
            </div>
            
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">Имя отправителя *</label>
                    <input type="text" name="senderName" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Телефон отправителя *</label>
                    <input type="tel" name="senderPhone" class="form-input" required>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Адрес загрузки *</label>
                <input type="text" name="senderAddress" class="form-input" required>
            </div>
            
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">Имя получателя *</label>
                    <input type="text" name="recipientName" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Телефон получателя *</label>
                    <input type="tel" name="recipientPhone" class="form-input" required>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Адрес разгрузки *</label>
                <input type="text" name="recipientAddress" class="form-input" required>
            </div>
            
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">Описание груза *</label>
                    <input type="text" name="cargoDescription" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Вес (кг) *</label>
                    <input type="number" name="cargoWeight" step="0.1" class="form-input" required>
                </div>
            </div>
            
            <div class="grid grid-3">
                <div class="form-group">
                    <label class="form-label">Объем (м³)</label>
                    <input type="number" name="cargoVolume" step="0.01" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Длина (м)</label>
                    <input type="number" name="cargoLength" step="0.01" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Ширина (м)</label>
                    <input type="number" name="cargoWidth" step="0.01" class="form-input">
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" onclick="hideCreateRequestModal()" class="btn btn-secondary">Отмена</button>
                <button type="submit" class="btn btn-primary">Создать заявку</button>
            </div>
        </form>
    </div>
</div>

<script>
function showCreateRequestModal() {
    document.getElementById('createRequestModal').style.display = 'block';
}

function hideCreateRequestModal() {
    document.getElementById('createRequestModal').style.display = 'none';
    document.getElementById('requestForm').reset();
}

async function loadRequests() {
    try {
        const response = await fetch('/api/shipment-requests');
        const result = await response.json();
        
        if (response.ok && result.data) {
            displayRequests(result.data);
        } else {
            document.getElementById('requestsList').innerHTML = '<p>Ошибка загрузки заявок</p>';
        }
    } catch (error) {
        document.getElementById('requestsList').innerHTML = '<p>Ошибка сети</p>';
    }
}

function displayRequests(requests) {
    const container = document.getElementById('requestsList');
    
    if (requests.length === 0) {
        container.innerHTML = '<p>У вас пока нет заявок.</p>';
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
                    <th>Груз</th>
                    <th>Вес</th>
                    <th>Создана</th>
                    <th>Стоимость</th>
                </tr>
            </thead>
            <tbody>
                ${requests.map(request => `
                    <tr>
                        <td><strong>${request.requestNumber}</strong></td>
                        <td>${request.type === 'local' ? 'Местная' : 'Междугородняя'}</td>
                        <td><span class="status-badge status-${request.status}">${getStatusName(request.status)}</span></td>
                        <td>
                            ${request.senderName}<br>
                            <small style="color: var(--text-secondary);">${request.senderPhone}</small>
                        </td>
                        <td>
                            ${request.recipientName}<br>
                            <small style="color: var(--text-secondary);">${request.recipientPhone}</small>
                        </td>
                        <td>${request.cargoDescription}</td>
                        <td>${request.cargoWeight} кг</td>
                        <td>${new Date(request.createdAt).toLocaleDateString('ru-RU')}</td>
                        <td>${request.priceKzt ? request.priceKzt.toLocaleString() + ' ₸' : '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
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
    loadRequests();
    
    document.getElementById('requestForm').addEventListener('submit', async function(e) {
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
                alert(`Заявка создана! Номер: ${result.data.requestNumber}`);
                hideCreateRequestModal();
                loadRequests();
            } else {
                alert(result.error || 'Ошибка создания заявки');
            }
        } catch (error) {
            alert('Ошибка сети');
        }
    });
});
</script>

<?php
$content = ob_get_clean();
renderLayout('Заявки', $content, true);
?>