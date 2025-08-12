<?php
require_once 'includes/layout.php';

ob_start();
?>

<div class="container" style="padding: 4rem 0; text-align: center;">
    <div class="card" style="max-width: 500px; margin: 0 auto;">
        <h1 style="font-size: 6rem; color: var(--primary); margin: 0;">404</h1>
        <h2 style="margin-bottom: 1rem;">Страница не найдена</h2>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
            Запрашиваемая страница не существует или была перемещена.
        </p>
        <a href="/" class="btn btn-primary">Вернуться на главную</a>
    </div>
</div>

<?php
$content = ob_get_clean();
renderLayout('Страница не найдена', $content);
?>