const contentOptions = ['YouTube', 'Instagram', 'TikTok', 'LINE', 'X（ツイッター）', 'スマホゲーム', '家庭用ゲーム', 'テレビ', 'Netflix', 'その他'];
const prioritySymbols = ['◎', '○', '○', '×'];
const priorityLabels = ['とても大切', '大切', '普通', 'なんとなく'];
let usageChart, proportionChart;

const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
];

function createContentInput() {
    const div = document.createElement('div');
    div.className = 'content-input';
    div.innerHTML = `
        <label>📱 アプリやゲームを選んでね：</label>
        <select class="content-select">
            ${contentOptions.map(option => `<option value="${option}">${option}</option>`).join('')}
        </select>
        <label>⏱️ 1日の使用時間（分）：</label>
        <input type="number" class="usage" value="0" min="0">
        <label>🌟 大切さ：</label>
        <select class="priority">
            ${prioritySymbols.map((symbol, index) => `<option value="${index}">${symbol}（${priorityLabels[index]}）</option>`).join('')}
        </select>
        <label>🎯 目標時間（分）：</label>
        <input type="number" class="target" value="0" min="0">
    `;
    document.getElementById('contentInputs').appendChild(div);
    div.querySelectorAll('select, input').forEach(el => el.addEventListener('change', updateCharts));
}

function initCharts() {
    // usageChartの初期化コードは変更なし

    const proportionCtx = document.getElementById('proportionChart').getContext('2d');
    proportionChart = new Chart(proportionCtx, {
        type: 'bar',
        data: {
            labels: ['使用時間の割合'],
            datasets: []
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                    display: false
                },
                y: {
                    stacked: true,
                    display: false
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'アプリやゲームの使用時間の割合',
                    font: { size: 18 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                label += new Intl.NumberFormat('ja-JP', { style: 'percent', maximumFractionDigits: 1 }).format(context.parsed.x / 100);
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: { 
                        font: { size: 12 },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.datasets.length) {
                                return data.datasets.map((dataset, i) => ({
                                    text: `${dataset.label} ${prioritySymbols[priorities[i]]}`,
                                    fillStyle: dataset.backgroundColor,
                                    hidden: !chart.isDatasetVisible(i),
                                    lineCap: dataset.borderCapStyle,
                                    lineDash: dataset.borderDash,
                                    lineDashOffset: dataset.borderDashOffset,
                                    lineJoin: dataset.borderJoinStyle,
                                    lineWidth: dataset.borderWidth,
                                    strokeStyle: dataset.borderColor,
                                    pointStyle: dataset.pointStyle,
                                    rotation: dataset.rotation,
                                    datasetIndex: i
                                }));
                            }
                            return [];
                        }
                    }
                }
            }
        }
    });
}

function updateCharts() {
    const inputs = document.querySelectorAll('.content-input');
    const labels = Array.from(inputs).map(input => input.querySelector('.content-select').value);
    const usage = Array.from(inputs).map(input => parseInt(input.querySelector('.usage').value) || 0);
    const targets = Array.from(inputs).map(input => parseInt(input.querySelector('.target').value) || 0);
    const priorities = Array.from(inputs).map(input => parseInt(input.querySelector('.priority').value));

    usageChart.data.labels = labels;
    usageChart.data.datasets[0].data = usage;
    usageChart.data.datasets[1].data = targets;
    usageChart.update();

    // 使用時間の合計を計算
    const totalUsage = usage.reduce((sum, current) => sum + current, 0);

    // 帯グラフのデータセットを更新
    proportionChart.data.datasets = labels.map((label, index) => ({
        label: label,
        data: [(usage[index] / totalUsage) * 100],
        backgroundColor: colors[index % colors.length]
    }));

    proportionChart.update();
}

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    createContentInput();
    document.getElementById('addContent').addEventListener('click', createContentInput);
});