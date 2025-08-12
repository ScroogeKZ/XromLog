<?php
require_once 'includes/layout.php';

ob_start();
?>

<div class="container" style="max-width: 500px; margin: 4rem auto;">
    <div class="card">
        <div class="card-header text-center">
            <h2 class="card-title">Регистрация</h2>
            <p>Создайте аккаунт для доступа к системе управления заявками</p>
        </div>
        
        <form id="registerForm">
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">Имя *</label>
                    <input type="text" name="firstName" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Фамилия *</label>
                    <input type="text" name="lastName" class="form-input" required>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Имя пользователя *</label>
                <input type="text" name="username" class="form-input" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Email *</label>
                <input type="email" name="email" class="form-input" required>
            </div>
            
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">Пароль *</label>
                    <input type="password" name="password" class="form-input" required minlength="6">
                    <small style="color: var(--text-secondary); font-size: 0.75rem;">Минимум 6 символов</small>
                </div>
                <div class="form-group">
                    <label class="form-label">Подтверждение пароля *</label>
                    <input type="password" name="confirmPassword" class="form-input" required>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Должность</label>
                <input type="text" name="position" class="form-input" placeholder="Например: Логист">
            </div>
            
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">Возраст</label>
                    <input type="number" name="age" class="form-input" min="18" max="100">
                </div>
                <div class="form-group">
                    <label class="form-label">Телефон</label>
                    <input type="tel" name="phone" class="form-input" placeholder="+7 (xxx) xxx-xx-xx">
                </div>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">Зарегистрироваться</button>
        </form>
        
        <div class="text-center" style="margin-top: 1.5rem;">
            <p>Уже есть аккаунт? <a href="/login" style="color: var(--primary);">Войти</a></p>
        </div>
    </div>
</div>

<?php
$content = ob_get_clean();
renderLayout('Регистрация', $content);
?>