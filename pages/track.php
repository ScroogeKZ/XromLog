<?php
require_once 'includes/layout.php';

ob_start();
?>

<div class="container" style="padding: 2rem 0;">
    <div class="card">
        <div class="card-header text-center">
            <h2 class="card-title">Отследить заявку</h2>
            <p>Введите номер телефона для поиска ваших заявок</p>
        </div>
        
        <form id="trackForm" style="max-width: 400px; margin: 0 auto;">
            <div class="form-group">
                <label class="form-label">Номер телефона</label>
                <input type="tel" name="phone" class="form-input" placeholder="+7 (xxx) xxx-xx-xx" required>
                <small style="color: var(--text-secondary); font-size: 0.75rem;">
                    Введите номер телефона, который указывали при создании заявки
                </small>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">Найти заявки</button>
        </form>
    </div>
    
    <div id="trackingResults" style="margin-top: 2rem;"></div>
</div>

<script>
document.getElementById('trackForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const resultsContainer = document.getElementById('trackingResults');
    resultsContainer.innerHTML = '<div class="card"><p>Поиск заявок...</p></div>';
    
    try {
        const response = await fetch('/api/shipment-requests/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok && result.data) {
            displayTrackingResults(result.data);
        } else {
            resultsContainer.innerHTML = `
                <div class="card">
                    <p style="text-align: center; color: var(--text-secondary);">
                        ${result.error || 'Заявки по указанному номеру телефона не найдены'}
                    </p>
                </div>
            `;
        }
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="card">
                <p style="text-align: center; color: var(--danger);">Ошибка сети. Попробуйте позже.</p>
            </div>
        `;
    }
});

function displayTrackingResults(requests) {
    const resultsContainer = document.getElementById('trackingResults');
    
    if (requests.length === 0) {
        resultsContainer.innerHTML = `
            <div class="card">
                <p style="text-align: center; color: var(--text-secondary);">
                    Заявки по указанному номеру телефона не найдены.
                </p>
            </div>
        `;
        return;
    }
    
    const html = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Найдено заявок: ${requests.length}</h3>
            </div>
            <div class="grid">
                ${requests.map(request => `
                    <div class="card" style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h4 style="margin: 0;">${request.requestNumber}</h4>
                            <span class="status-badge status-${request.status}">${request.statusName}</span>
                        </div>
                        
                        <div class="grid grid-2" style="gap: 1.5rem;">
                            <div>
                                <h5 style="color: var(--primary); margin-bottom: 0.5rem;">Информация о доставке</h5>
                                <p><strong>Тип:</strong> ${request.type === 'local' ? 'Местная доставка' : 'Междугородняя доставка'}</p>
                                <p><strong>Отправитель:</strong> ${request.senderName}</p>
                                <p><strong>Получатель:</strong> ${request.recipientName}</p>
                                <p><strong>Груз:</strong> ${request.cargoDescription}</p>
                            </div>
                            <div>
                                <h5 style="color: var(--primary); margin-bottom: 0.5rem;">Сроки и стоимость</h5>
                                <p><strong>Создана:</strong> ${new Date(request.createdAt).toLocaleDateString('ru-RU', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                                <p><strong>Обновлена:</strong> ${new Date(request.updatedAt).toLocaleDateString('ru-RU', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                                ${request.priceKzt ? `<p><strong>Стоимость:</strong> ${request.priceKzt.toLocaleString()} тенге</p>` : '<p><strong>Стоимость:</strong> Уточняется</p>'}
                                ${request.priceNotes ? `<p><strong>Примечание:</strong> ${request.priceNotes}</p>` : ''}
                            </div>
                        </div>
                        
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <h5 style="color: var(--primary); margin-bottom: 0.5rem;">Статус заявки</h5>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <span class="status-badge status-${request.status}">${request.statusName}</span>
                                <span style="color: var(--text-secondary); font-size: 0.875rem;">
                                    ${getStatusDescription(request.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

function getStatusDescription(status) {
    const descriptions = {
        'new': 'Заявка принята и ожидает обработки',
        'processing': 'Заявка обрабатывается менеджером',
        'assigned': 'Назначен транспорт и водитель',
        'in_transit': 'Груз находится в пути',
        'delivered': 'Груз успешно доставлен получателю',
        'cancelled': 'Заявка отменена'
    };
    return descriptions[status] || 'Неизвестный статус';
}
</script>

<?php
$content = ob_get_clean();
renderLayout('Отследить заявку', $content);
?>