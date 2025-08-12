<?php
require_once 'includes/layout.php';

ob_start();
$user = getCurrentUser();
?>

<div class="container" style="padding: 2rem 0;">
    <div class="card">
        <div class="card-header">
            <h2 class="card-title">Профиль пользователя</h2>
            <p>Управление личными данными и настройками аккаунта</p>
        </div>
        
        <div class="grid grid-2">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Личные данные</h3>
                </div>
                
                <form id="profileForm">
                    <div class="grid grid-2">
                        <div class="form-group">
                            <label class="form-label">Имя</label>
                            <input type="text" name="firstName" class="form-input" value="<?php echo htmlspecialchars($user['first_name']); ?>">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Фамилия</label>
                            <input type="text" name="lastName" class="form-input" value="<?php echo htmlspecialchars($user['last_name']); ?>">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Должность</label>
                        <input type="text" name="position" class="form-input" value="<?php echo htmlspecialchars($user['position'] ?? ''); ?>">
                    </div>
                    
                    <div class="grid grid-2">
                        <div class="form-group">
                            <label class="form-label">Возраст</label>
                            <input type="number" name="age" class="form-input" min="18" max="100" value="<?php echo $user['age'] ?? ''; ?>">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Телефон</label>
                            <input type="tel" name="phone" class="form-input" value="<?php echo htmlspecialchars($user['phone'] ?? ''); ?>">
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Обновить профиль</button>
                </form>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Безопасность</h3>
                </div>
                
                <div style="margin-bottom: 2rem; padding: 1rem; background: var(--surface); border-radius: 0.375rem;">
                    <p><strong>Имя пользователя:</strong> <?php echo htmlspecialchars($user['username']); ?></p>
                    <p><strong>Email:</strong> <?php echo htmlspecialchars($user['email']); ?></p>
                    <p><strong>Роль:</strong> <?php echo $user['role'] === 'manager' ? 'Менеджер' : 'Сотрудник'; ?></p>
                </div>
                
                <form id="passwordForm">
                    <div class="form-group">
                        <label class="form-label">Текущий пароль</label>
                        <input type="password" name="currentPassword" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Новый пароль</label>
                        <input type="password" name="newPassword" class="form-input" required minlength="6">
                        <small style="color: var(--text-secondary); font-size: 0.75rem;">Минимум 6 символов</small>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Подтвердите новый пароль</label>
                        <input type="password" name="confirmPassword" class="form-input" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Сменить пароль</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('profileForm').addEventListener('submit', async function(e) {
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
            alert('Профиль успешно обновлен!');
        } else {
            alert(result.error || 'Ошибка обновления профиля');
        }
    } catch (error) {
        alert('Ошибка сети');
    }
});

document.getElementById('passwordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (data.newPassword !== data.confirmPassword) {
        alert('Новые пароли не совпадают');
        return;
    }
    
    try {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Пароль успешно изменен!');
            e.target.reset();
        } else {
            alert(result.error || 'Ошибка изменения пароля');
        }
    } catch (error) {
        alert('Ошибка сети');
    }
});
</script>

<?php
$content = ob_get_clean();
renderLayout('Профиль', $content, true);
?>