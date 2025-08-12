<?php
require_once 'includes/layout.php';

ob_start();
?>

<section class="hero">
    <div class="container">
        <h1>ХРОМ Логистика</h1>
        <p>Профессиональные логистические решения для вашего бизнеса</p>
        <div style="margin-top: 2rem;">
            <a href="/login" class="btn btn-primary" style="margin-right: 1rem;">Войти в систему</a>
            <a href="/track" class="btn btn-secondary">Отследить заявку</a>
        </div>
    </div>
</section>

<section style="padding: 4rem 0;">
    <div class="container">
        <div class="grid grid-2" style="gap: 3rem;">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Местная доставка в Астане</h3>
                </div>
                <p>Быстрая и надежная доставка грузов по городу Астана. Оперативная обработка заявок и профессиональный сервис.</p>
                
                <h4 style="margin-top: 2rem; margin-bottom: 1rem;">Создать заявку на местную доставку:</h4>
                <form id="localRequestForm">
                    <input type="hidden" name="type" value="local">
                    
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
                    
                    <button type="submit" class="btn btn-primary">Создать заявку на местную доставку</button>
                </form>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Междугородняя доставка</h3>
                </div>
                <p>Доставка грузов между городами. Надежная транспортировка с контролем на всех этапах пути.</p>
                
                <h4 style="margin-top: 2rem; margin-bottom: 1rem;">Создать заявку на междугороднюю доставку:</h4>
                <form id="intercityRequestForm">
                    <input type="hidden" name="type" value="intercity">
                    
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
                    
                    <button type="submit" class="btn btn-primary">Создать заявку на междугороднюю доставку</button>
                </form>
            </div>
        </div>
    </div>
</section>

<script>
document.getElementById('localRequestForm').addEventListener('submit', async function(e) {
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
            alert(`Заявка создана успешно! Номер для отслеживания: ${result.data.requestNumber}`);
            e.target.reset();
        } else {
            alert(result.error || 'Ошибка создания заявки');
        }
    } catch (error) {
        alert('Ошибка сети');
    }
});

document.getElementById('intercityRequestForm').addEventListener('submit', async function(e) {
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
            alert(`Заявка создана успешно! Номер для отслеживания: ${result.data.requestNumber}`);
            e.target.reset();
        } else {
            alert(result.error || 'Ошибка создания заявки');
        }
    } catch (error) {
        alert('Ошибка сети');
    }
});
</script>

<?php
$content = ob_get_clean();
renderLayout('Главная', $content);
?>