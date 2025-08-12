<?php
require_once 'includes/layout.php';

ob_start();
?>

<div class="container" style="padding: 2rem 0;">
    <div class="card">
        <div class="card-header">
            <h2 class="card-title">Аналитика</h2>
            <p>Статистика и анализ работы системы</p>
        </div>
        
        <div id="analyticsContainer">
            <p>Загрузка аналитики...</p>
        </div>
    </div>
</div>

<script>
async function loadAnalytics() {
    try {
        const response = await fetch('/api/analytics');
        const result = await response.json();
        
        if (response.ok && result.data) {
            displayAnalytics(result.data);
        } else {
            document.getElementById('analyticsContainer').innerHTML = '<p>Ошибка загрузки аналитики</p>';
        }
    } catch (error) {
        document.getElementById('analyticsContainer').innerHTML = '<p>Ошибка сети</p>';
    }
}

function displayAnalytics(data) {
    const container = document.getElementById('analyticsContainer');
    
    const html = `
        <!-- Общая статистика -->
        <div class="dashboard-stats" style="margin-bottom: 2rem;">
            <div class="stat-card">
                <div class="stat-number">${data.overview.totalRequests}</div>
                <div class="stat-label">Всего заявок</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.overview.newRequests}</div>
                <div class="stat-label">Новые заявки</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.overview.completedRequests}</div>
                <div class="stat-label">Выполнено</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.overview.totalRevenue.toLocaleString()} ₸</div>
                <div class="stat-label">Общая выручка</div>
            </div>
        </div>

        <div class="grid grid-2" style="gap: 2rem;">
            <!-- Распределение по статусам -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Распределение по статусам</h3>
                </div>
                <div id="statusChart">
                    ${data.statusDistribution.map(item => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span class="status-badge status-${item.status}">${item.statusName}</span>
                            </div>
                            <strong>${item.count}</strong>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Распределение по типам -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Распределение по типам</h3>
                </div>
                <div id="typeChart">
                    ${data.typeDistribution.map(item => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border);">
                            <div>
                                <strong>${item.typeName}</strong>
                                <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                    ${((item.count / data.overview.totalRequests) * 100).toFixed(1)}% от общего числа
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <strong>${item.count}</strong>
                                <div style="width: 100px; height: 8px; background: var(--border); border-radius: 4px; margin-top: 0.25rem;">
                                    <div style="width: ${(item.count / data.overview.totalRequests) * 100}%; height: 100%; background: var(--primary); border-radius: 4px;"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Месячные тенденции -->
        <div class="card" style="margin-top: 2rem;">
            <div class="card-header">
                <h3 class="card-title">Месячные тенденции</h3>
            </div>
            ${data.monthlyTrends.length > 0 ? `
                <div style="overflow-x: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Месяц</th>
                                <th>Количество заявок</th>
                                <th>Выручка (₸)</th>
                                <th>Средняя стоимость заявки (₸)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.monthlyTrends.map(item => {
                                const avgPrice = item.requests > 0 ? (item.revenue / item.requests) : 0;
                                const monthName = new Date(item.month + '-01').toLocaleDateString('ru-RU', { 
                                    year: 'numeric', 
                                    month: 'long' 
                                });
                                return `
                                    <tr>
                                        <td>${monthName}</td>
                                        <td><strong>${item.requests}</strong></td>
                                        <td><strong>${item.revenue.toLocaleString()}</strong></td>
                                        <td>${avgPrice.toLocaleString()}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            ` : `
                <p style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    Недостаточно данных для отображения месячных тенденций
                </p>
            `}
        </div>

        <!-- Дополнительная статистика -->
        <div class="grid grid-3" style="margin-top: 2rem; gap: 1rem;">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">Местные доставки</h4>
                </div>
                <div class="stat-number" style="color: var(--primary);">${data.overview.localRequests}</div>
                <div style="color: var(--text-secondary); font-size: 0.875rem;">
                    ${((data.overview.localRequests / data.overview.totalRequests) * 100).toFixed(1)}% от общего числа
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">Междугородние</h4>
                </div>
                <div class="stat-number" style="color: var(--accent);">${data.overview.intercityRequests}</div>
                <div style="color: var(--text-secondary); font-size: 0.875rem;">
                    ${((data.overview.intercityRequests / data.overview.totalRequests) * 100).toFixed(1)}% от общего числа
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">Средняя стоимость</h4>
                </div>
                <div class="stat-number" style="color: var(--warning);">
                    ${data.overview.totalRequests > 0 ? (data.overview.totalRevenue / data.overview.totalRequests).toLocaleString() : '0'} ₸
                </div>
                <div style="color: var(--text-secondary); font-size: 0.875rem;">
                    за заявку
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
    loadAnalytics();
});
</script>

<?php
$content = ob_get_clean();
renderLayout('Аналитика', $content, true, 'manager');
?>