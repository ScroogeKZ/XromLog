<?php
require_once 'includes/layout.php';

ob_start();
?>

<div class="container" style="max-width: 400px; margin: 4rem auto;">
    <div class="card">
        <div class="card-header text-center">
            <h2 class="card-title">Вход в систему</h2>
            <p>Войдите в свой аккаунт для доступа к системе управления заявками</p>
        </div>
        
        <form id="loginForm">
            <div class="form-group">
                <label class="form-label">Имя пользователя</label>
                <input type="text" name="username" class="form-input" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Пароль</label>
                <input type="password" name="password" class="form-input" required>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">Войти</button>
        </form>
        
        <div class="text-center" style="margin-top: 1.5rem;">
            <p>Нет аккаунта? <a href="/register" style="color: var(--primary);">Зарегистрироваться</a></p>
        </div>
    </div>
</div>

<?php
$content = ob_get_clean();
renderLayout('Вход в систему', $content);
?>