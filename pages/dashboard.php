<?php
require_once 'includes/layout.php';
require_once 'includes/functions.php';

ob_start();

$user = getCurrentUser();
$db = getDB();

// Получаем статистику для текущего пользователя
$whereClause = '';
$params = [];

if ($user['role'] === 'employee') {
    $whereClause = 'WHERE user_id = ?';
    $params[] = $user['id'];
}

$stats = $db->fetch(
    "SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_requests,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_requests,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_requests
    FROM shipment_requests $whereClause",
    $params
);
?>

<div class="container" style="padding: 2rem 0;">
    <div class="mb-4">
        <h1>Добро пожаловать, <?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?>!</h1>
        <p style="color: var(--text-secondary);">Роль: <?php echo $user['role'] === 'manager' ? 'Менеджер' : 'Сотрудник'; ?></p>
    </div>

    <div class="dashboard-stats">
        <div class="stat-card">
            <div class="stat-number"><?php echo $stats['total_requests']; ?></div>
            <div class="stat-label">Всего заявок</div>
        </div>
        <div class="stat-card">
            <div class="stat-number"><?php echo $stats['new_requests']; ?></div>
            <div class="stat-label">Новые заявки</div>
        </div>
        <div class="stat-card">
            <div class="stat-number"><?php echo $stats['processing_requests']; ?></div>
            <div class="stat-label">В обработке</div>
        </div>
        <div class="stat-card">
            <div class="stat-number"><?php echo $stats['completed_requests']; ?></div>
            <div class="stat-label">Завершенные</div>
        </div>
    </div>

    <div class="grid grid-2">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Быстрые действия</h3>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <a href="/requests" class="btn btn-primary">Просмотреть заявки</a>
                <button onclick="showCreateRequestModal()" class="btn btn-secondary">Создать новую заявку</button>
                <?php if ($user['role'] === 'manager'): ?>
                <a href="/admin" class="btn btn-secondary">Администрирование</a>
                <a href="/analytics" class="btn btn-secondary">Аналитика</a>
                <?php endif; ?>
                <a href="/profile" class="btn btn-secondary">Редактировать профиль</a>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Последние заявки</h3>
            </div>
            <div id="recentRequests">
                <p>Загрузка...</p>
            </div>
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

// Загружаем последние заявки
async function loadRecentRequests() {
    try {
        const response = await fetch('/api/shipment-requests');
        const result = await response.json();
        
        if (response.ok && result.data) {
            const recentRequests = result.data.slice(0, 5);
            const container = document.getElementById('recentRequests');
            
            if (recentRequests.length === 0) {
                container.innerHTML = '<p>Нет заявок</p>';
                return;
            }
            
            const html = recentRequests.map(request => `
                <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${request.requestNumber}</strong>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                ${request.senderName} → ${request.recipientName}
                            </div>
                        </div>
                        <span class="status-badge status-${request.status}">${getStatusName(request.status)}</span>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = html;
        }
    } catch (error) {
        document.getElementById('recentRequests').innerHTML = '<p>Ошибка загрузки</p>';
    }
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
    loadRecentRequests();
    
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
                loadRecentRequests();
                location.reload(); // Обновляем статистику
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
renderLayout('Панель управления', $content, true);
?>