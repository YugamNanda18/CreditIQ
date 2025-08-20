// Global variables
let currentIssuer = 'AAPL';
let scoreTrendChart = null;
let updateInterval = null;

// Mock data structures
const issuerData = {
    'AAPL': {
        name: 'Apple Inc.',
        currentScore: 950,
        rating: 'AAA',
        change: '+5',
        features: {
            'Debt-to-Equity': { value: 0.23, weight: 0.25, impact: 'positive' },
            'Current Ratio': { value: 1.8, weight: 0.20, impact: 'positive' },
            'Revenue Growth': { value: 0.08, weight: 0.18, impact: 'positive' },
            'Interest Coverage': { value: 28.5, weight: 0.15, impact: 'positive' },
            'Market Sentiment': { value: 0.75, weight: 0.12, impact: 'positive' },
            'Sector Performance': { value: 0.65, weight: 0.10, impact: 'positive' }
        },
        riskFactors: [
            { name: 'Market Volatility', level: 'low' },
            { name: 'Regulatory Risk', level: 'low' },
            { name: 'Technology Disruption', level: 'medium' },
            { name: 'Supply Chain', level: 'low' }
        ]
    },
    'TSLA': {
        name: 'Tesla Inc.',
        currentScore: 720,
        rating: 'A',
        change: '-15',
        features: {
            'Debt-to-Equity': { value: 0.45, weight: 0.25, impact: 'negative' },
            'Current Ratio': { value: 1.1, weight: 0.20, impact: 'negative' },
            'Revenue Growth': { value: 0.35, weight: 0.18, impact: 'positive' },
            'Interest Coverage': { value: 8.2, weight: 0.15, impact: 'neutral' },
            'Market Sentiment': { value: 0.65, weight: 0.12, impact: 'positive' },
            'Sector Performance': { value: 0.55, weight: 0.10, impact: 'neutral' }
        },
        riskFactors: [
            { name: 'Market Volatility', level: 'high' },
            { name: 'Regulatory Risk', level: 'medium' },
            { name: 'Production Scaling', level: 'medium' },
            { name: 'Competition', level: 'high' }
        ]
    },
    'JPM': {
        name: 'JPMorgan Chase',
        currentScore: 890,
        rating: 'AA',
        change: '+2',
        features: {
            'Tier 1 Capital': { value: 0.155, weight: 0.30, impact: 'positive' },
            'ROE': { value: 0.14, weight: 0.20, impact: 'positive' },
            'Loan Loss Provision': { value: 0.008, weight: 0.18, impact: 'positive' },
            'Net Interest Margin': { value: 0.025, weight: 0.15, impact: 'positive' },
            'Market Sentiment': { value: 0.70, weight: 0.10, impact: 'positive' },
            'Regulatory Compliance': { value: 0.95, weight: 0.07, impact: 'positive' }
        },
        riskFactors: [
            { name: 'Interest Rate Risk', level: 'medium' },
            { name: 'Credit Risk', level: 'low' },
            { name: 'Regulatory Changes', level: 'medium' },
            { name: 'Market Risk', level: 'low' }
        ]
    }
};

// Mock events data
const eventsData = [
    {
        time: '2 hours ago',
        title: 'Q3 Earnings Beat Expectations',
        impact: 'positive',
        description: 'Revenue up 12% YoY, EPS exceeded forecast by $0.15'
    },
    {
        time: '5 hours ago',
        title: 'Fed Interest Rate Decision',
        impact: 'neutral',
        description: 'Federal Reserve maintains current rates, signals potential cuts'
    },
    {
        time: '1 day ago',
        title: 'Supply Chain Disruption Alert',
        impact: 'negative',
        description: 'Key supplier facing production delays due to labor strikes'
    },
    {
        time: '2 days ago',
        title: 'New Product Launch Announcement',
        impact: 'positive',
        description: 'Major product unveiling drives positive analyst sentiment'
    },
    {
        time: '3 days ago',
        title: 'Regulatory Compliance Update',
        impact: 'neutral',
        description: 'Company files required regulatory documentation on time'
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    startRealTimeUpdates();
});

function initializeApp() {
    updateLastUpdatedTime();
    updateDashboard();
    createScoreTrendChart();
    populateEventsFeed();
}

function setupEventListeners() {
    // Issuer selection
    document.getElementById('issuerSelect').addEventListener('change', function(e) {
        currentIssuer = e.target.value;
        updateDashboard();
        updateScoreTrendChart();
    });

    // Time filter buttons
    document.querySelectorAll('.time-filter').forEach(button => {
        button.addEventListener('click', function(e) {
            document.querySelectorAll('.time-filter').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            updateScoreTrendChart(e.target.dataset.period);
        });
    });

    // Modal controls
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('alertForm').addEventListener('submit', handleAlertSubmit);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('alertModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

function updateDashboard() {
    const data = issuerData[currentIssuer] || issuerData['AAPL'];
    
    // Update score display
    updateScoreDisplay(data);
    
    // Update feature importance
    updateFeatureImportance(data.features);
    
    // Update risk factors
    updateRiskFactors(data.riskFactors);
    
    // Add update animation
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('data-update');
        setTimeout(() => card.classList.remove('data-update'), 1000);
    });
}

function updateScoreDisplay(data) {
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreValue = document.getElementById('scoreValue');
    const scoreNumeric = document.getElementById('scoreNumeric');
    const scoreChange = document.getElementById('scoreChange');
    
    // Update score circle class based on rating
    scoreCircle.className = 'score-circle score-' + data.rating.toLowerCase();
    scoreValue.textContent = data.rating;
    scoreNumeric.textContent = data.currentScore;
    
    // Update score change
    const changeValue = parseInt(data.change);
    scoreChange.textContent = `${changeValue > 0 ? '↑' : '↓'} ${Math.abs(changeValue)} points (24h)`;
    scoreChange.className = `score-change ${changeValue > 0 ? 'positive' : 'negative'}`;
}

function updateFeatureImportance(features) {
    const container = document.getElementById('featureImportance');
    container.innerHTML = '';
    
    // Sort features by weight (importance)
    const sortedFeatures = Object.entries(features).sort((a, b) => b[1].weight - a[1].weight);
    
    sortedFeatures.forEach(([name, data]) => {
        const featureBar = document.createElement('div');
        featureBar.className = 'feature-bar';
        
        const barWidth = data.weight * 100;
        const impactClass = data.impact === 'positive' ? 'bar-positive' : 
                           data.impact === 'negative' ? 'bar-negative' : 'bar-neutral';
        
        featureBar.innerHTML = `
            <div class="feature-name feature-explanation" data-explanation="Weight: ${(data.weight * 100).toFixed(1)}% | Impact: ${data.impact}">
                ${name}
            </div>
            <div class="bar-container">
                <div class="bar-fill ${impactClass}" style="width: ${barWidth}%"></div>
            </div>
            <div class="feature-value">${data.value}</div>
        `;
        
        container.appendChild(featureBar);
    });
}

function updateRiskFactors(riskFactors) {
    const container = document.getElementById('riskFactors');
    container.innerHTML = '';
    
    riskFactors.forEach(risk => {
        const riskItem = document.createElement('div');
        riskItem.className = 'risk-factor';
        riskItem.innerHTML = `
            <div class="risk-name">${risk.name}</div>
            <div class="risk-level risk-${risk.level}">${risk.level.toUpperCase()}</div>
        `;
        container.appendChild(riskItem);
    });
}

function createScoreTrendChart() {
    const ctx = document.getElementById('scoreTrendChart').getContext('2d');
    
    // Generate mock historical data
    const historicalData = generateHistoricalData();
    
    scoreTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historicalData.labels,
            datasets: [{
                label: 'Credit Score',
                data: historicalData.scores,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `Score: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                y: {
                    display: true,
                    min: 600,
                    max: 1000,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function generateHistoricalData(period = '24h') {
    const data = { labels: [], scores: [] };
    const currentScore = issuerData[currentIssuer]?.currentScore || 950;
    
    let points, dateFormat;
    
    switch(period) {
        case '24h':
            points = 24;
            dateFormat = (i) => `${23-i}:00`;
            break;
        case '7d':
            points = 7;
            dateFormat = (i) => `${7-i}d ago`;
            break;
        case '30d':
            points = 30;
            dateFormat = (i) => `${30-i}d ago`;
            break;
        case '1y':
            points = 12;
            dateFormat = (i) => `${12-i}m ago`;
            break;
        default:
            points = 24;
            dateFormat = (i) => `${23-i}:00`;
    }
    
    for (let i = 0; i < points; i++) {
        data.labels.push(dateFormat(i));
        
        // Generate realistic score variations
        const baseVariation = (Math.random() - 0.5) * 20;
        const trendVariation = (i / points) * 10; // Slight upward trend
        const score = Math.max(600, Math.min(1000, 
            currentScore + baseVariation - trendVariation + (Math.random() * 10 - 5)
        ));
        
        data.scores.push(Math.round(score));
    }
    
    return data;
}

function updateScoreTrendChart(period = '24h') {
    if (!scoreTrendChart) return;
    
    const newData = generateHistoricalData(period);
    scoreTrendChart.data.labels = newData.labels;
    scoreTrendChart.data.datasets[0].data = newData.scores;
    scoreTrendChart.update('active');
}

function populateEventsFeed() {
    const container = document.getElementById('eventsFeed');
    container.innerHTML = '';
    
    eventsData.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.innerHTML = `
            <div class="event-time">${event.time}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-description">${event.description}</div>
            <div class="event-impact impact-${event.impact}">${event.impact.toUpperCase()}</div>
        `;
        container.appendChild(eventItem);
    });
}

function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdated').textContent = timeString;
}

function refreshData() {
    showLoading();
    
    // Simulate API call delay
    setTimeout(() => {
        // Simulate score changes
        simulateDataUpdate();
        updateDashboard();
        updateScoreTrendChart();
        updateLastUpdatedTime();
        hideLoading();
        
        // Show notification
        showNotification('Data refreshed successfully!', 'success');
    }, 2000);
}

function simulateDataUpdate() {
    // Randomly update scores and features to simulate real-time changes
    Object.keys(issuerData).forEach(issuer => {
        const data = issuerData[issuer];
        
        // Small random changes to score
        const scoreChange = (Math.random() - 0.5) * 10;
        data.currentScore = Math.max(600, Math.min(1000, data.currentScore + scoreChange));
        
        // Update rating based on score
        if (data.currentScore >= 950) data.rating = 'AAA';
        else if (data.currentScore >= 900) data.rating = 'AA';
        else if (data.currentScore >= 850) data.rating = 'A';
        else if (data.currentScore >= 750) data.rating = 'BBB';
        else if (data.currentScore >= 650) data.rating = 'BB';
        else data.rating = 'B';
        
        // Update change indicator
        data.change = scoreChange > 0 ? `+${Math.round(scoreChange)}` : `${Math.round(scoreChange)}`;
        
        // Randomly update some feature values
        Object.keys(data.features).forEach(feature => {
            if (Math.random() < 0.3) { // 30% chance of change
                const currentValue = data.features[feature].value;
                const change = (Math.random() - 0.5) * currentValue * 0.1;
                data.features[feature].value = Math.max(0, currentValue + change);
            }
        });
    });
    
    // Add new event occasionally
    if (Math.random() < 0.3) {
        addNewEvent();
    }
}

function addNewEvent() {
    const newEvents = [
        {
            time: 'Just now',
            title: 'Market Volatility Spike Detected',
            impact: 'negative',
            description: 'VIX index increased by 8% in the last hour'
        },
        {
            time: 'Just now',
            title: 'Positive Analyst Upgrade',
            impact: 'positive',
            description: 'Goldman Sachs upgrades target price by 15%'
        },
        {
            time: 'Just now',
            title: 'Economic Indicator Update',
            impact: 'neutral',
            description: 'GDP growth data released, in line with expectations'
        }
    ];
    
    const randomEvent = newEvents[Math.floor(Math.random() * newEvents.length)];
    eventsData.unshift(randomEvent);
    
    // Keep only last 10 events
    if (eventsData.length > 10) {
        eventsData.pop();
    }
    
    populateEventsFeed();
}

function exportReport() {
    const data = issuerData[currentIssuer];
    const reportData = {
        issuer: data.name,
        score: data.currentScore,
        rating: data.rating,
        timestamp: new Date().toISOString(),
        features: data.features,
        riskFactors: data.riskFactors
    };
    
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit_report_${currentIssuer}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Report exported successfully!', 'success');
}

function setAlert() {
    document.getElementById('alertModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('alertModal').style.display = 'none';
}

function handleAlertSubmit(e) {
    e.preventDefault();
    
    const threshold = document.getElementById('alertThreshold').value;
    const alertType = document.getElementById('alertType').value;
    
    // Simulate setting alert
    showNotification(`Alert set: Score ${alertType} ${threshold}`, 'success');
    closeModal();
}

function startRealTimeUpdates() {
    // Update every 30 seconds
    updateInterval = setInterval(() => {
        updateLastUpdatedTime();
        
        // Occasionally trigger data updates
        if (Math.random() < 0.3) {
            simulateDataUpdate();
            updateDashboard();
        }
    }, 30000);
}

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Data simulation functions
function simulateNewsAnalysis() {
    const newsItems = [
        "Company announces major acquisition deal worth $2.5B",
        "CEO resignation rumors cause market uncertainty",
        "Q3 earnings call transcript shows optimistic outlook",
        "Regulatory investigation launched into business practices",
        "New product line expected to drive 20% revenue growth"
    ];
    
    return newsItems[Math.floor(Math.random() * newsItems.length)];
}

function simulateMarketData() {
    return {
        stockPrice: (Math.random() * 100 + 50).toFixed(2),
        marketCap: (Math.random() * 1000 + 500).toFixed(1) + 'B',
        volume: (Math.random() * 10 + 5).toFixed(1) + 'M',
        beta: (Math.random() * 2 + 0.5).toFixed(2)
    };
}

// Performance monitoring
function trackPerformance() {
    const metrics = {
        accuracy: (94 + Math.random() * 4).toFixed(1) + '%',
        precision: (91 + Math.random() * 6).toFixed(1) + '%',
        recall: (95 + Math.random() * 4).toFixed(1) + '%',
        latency: (200 + Math.random() * 100).toFixed(0) + 'ms'
    };
    
    document.getElementById('accuracy').textContent = metrics.accuracy;
    document.getElementById('precision').textContent = metrics.precision;
    document.getElementById('recall').textContent = metrics.recall;
    document.getElementById('latency').textContent = metrics.latency;
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('An error occurred. Please refresh the page.', 'error');
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

// Initialize performance tracking
setInterval(trackPerformance, 10000); // Update every 10 seconds

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'r':
                e.preventDefault();
                refreshData();
                break;
            case 'e':
                e.preventDefault();
                exportReport();
                break;
        }
    }
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);