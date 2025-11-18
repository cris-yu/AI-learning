// 进度数据存储
let progressData = {
    completedLessons: new Set(),
    startDate: null,
    lastUpdate: null
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    updateAllProgress();
    updateLastUpdateTime();
    
    // 默认展开第一阶段
    togglePhase(1);
});

// 切换阶段展开/收起
function togglePhase(phaseNumber) {
    const phase = document.querySelector(`.phase[data-phase="${phaseNumber}"]`);
    if (phase) {
        phase.classList.toggle('active');
    }
}

// 展开/收起所有阶段
function toggleAllPhases() {
    const phases = document.querySelectorAll('.phase');
    const firstPhase = phases[0];
    const shouldExpand = !firstPhase.classList.contains('active');
    
    phases.forEach(phase => {
        if (shouldExpand) {
            phase.classList.add('active');
        } else {
            phase.classList.remove('active');
        }
    });
}

// 更新进度
function updateProgress() {
    // 获取所有复选框
    const checkboxes = document.querySelectorAll('.lesson-checkbox');
    
    // 更新已完成课程集合
    progressData.completedLessons.clear();
    checkboxes.forEach(checkbox => {
        const lessonCard = checkbox.closest('.lesson-card');
        const lessonId = lessonCard.getAttribute('data-lesson');
        
        if (checkbox.checked) {
            progressData.completedLessons.add(lessonId);
            lessonCard.classList.add('completed');
        } else {
            lessonCard.classList.remove('completed');
        }
    });
    
    // 设置开始日期
    if (!progressData.startDate && progressData.completedLessons.size > 0) {
        progressData.startDate = new Date().toISOString();
    }
    
    // 更新最后修改时间
    progressData.lastUpdate = new Date().toISOString();
    
    // 更新所有进度显示
    updateAllProgress();
    
    // 保存进度
    saveProgress();
}

// 更新所有进度显示
function updateAllProgress() {
    const totalLessons = document.querySelectorAll('.lesson-card').length;
    const completedCount = progressData.completedLessons.size;
    const totalProgress = Math.round((completedCount / totalLessons) * 100);
    
    // 更新总体进度
    document.getElementById('totalProgress').textContent = totalProgress + '%';
    document.getElementById('completedLessons').textContent = `${completedCount}/${totalLessons}`;
    
    // 更新学习天数
    if (progressData.startDate) {
        const startDate = new Date(progressData.startDate);
        const today = new Date();
        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        document.getElementById('studyDays').textContent = daysDiff;
    }
    
    // 更新各阶段进度
    updatePhaseProgress();
}

// 更新各阶段进度
function updatePhaseProgress() {
    const phases = document.querySelectorAll('.phase');
    
    phases.forEach(phase => {
        const phaseNumber = phase.getAttribute('data-phase');
        const phaseLessons = phase.querySelectorAll('.lesson-card');
        const phaseCompleted = Array.from(phaseLessons).filter(lesson => {
            const lessonId = lesson.getAttribute('data-lesson');
            return progressData.completedLessons.has(lessonId);
        }).length;
        
        const phaseProgress = Math.round((phaseCompleted / phaseLessons.length) * 100);
        
        // 更新进度圆环
        const progressCircle = phase.querySelector('.progress-circle');
        const progressText = phase.querySelector('.progress-text');
        
        if (progressCircle && progressText) {
            const degrees = (phaseProgress / 100) * 360;
            progressCircle.style.background = `conic-gradient(var(--primary-color) ${degrees}deg, var(--light-gray) ${degrees}deg)`;
            progressText.textContent = phaseProgress + '%';
            progressCircle.setAttribute('data-progress', phaseProgress);
        }
    });
}

// 保存进度到本地存储
function saveProgress() {
    const dataToSave = {
        completedLessons: Array.from(progressData.completedLessons),
        startDate: progressData.startDate,
        lastUpdate: progressData.lastUpdate
    };
    localStorage.setItem('aiLearningProgress', JSON.stringify(dataToSave));
}

// 从本地存储加载进度
function loadProgress() {
    const saved = localStorage.getItem('aiLearningProgress');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            progressData.completedLessons = new Set(data.completedLessons || []);
            progressData.startDate = data.startDate;
            progressData.lastUpdate = data.lastUpdate;
            
            // 恢复复选框状态
            progressData.completedLessons.forEach(lessonId => {
                const lessonCard = document.querySelector(`[data-lesson="${lessonId}"]`);
                if (lessonCard) {
                    const checkbox = lessonCard.querySelector('.lesson-checkbox');
                    if (checkbox) {
                        checkbox.checked = true;
                        lessonCard.classList.add('completed');
                    }
                }
            });
        } catch (e) {
            console.error('加载进度失败:', e);
        }
    }
}

// 重置进度
function resetProgress() {
    if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
        // 清空数据
        progressData = {
            completedLessons: new Set(),
            startDate: null,
            lastUpdate: null
        };
        
        // 取消所有复选框
        document.querySelectorAll('.lesson-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // 移除完成标记
        document.querySelectorAll('.lesson-card').forEach(card => {
            card.classList.remove('completed');
        });
        
        // 清除本地存储
        localStorage.removeItem('aiLearningProgress');
        
        // 更新显示
        updateAllProgress();
        
        alert('进度已重置！');
    }
}

// 导出进度
function exportProgress() {
    const totalLessons = document.querySelectorAll('.lesson-card').length;
    const completedCount = progressData.completedLessons.size;
    const totalProgress = Math.round((completedCount / totalLessons) * 100);
    
    let report = '# AI学习计划进度报告\n\n';
    report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    report += `## 总体进度\n`;
    report += `- 完成课程: ${completedCount}/${totalLessons}\n`;
    report += `- 完成率: ${totalProgress}%\n`;
    
    if (progressData.startDate) {
        const startDate = new Date(progressData.startDate);
        const today = new Date();
        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        report += `- 学习天数: ${daysDiff}天\n`;
        report += `- 开始日期: ${startDate.toLocaleDateString('zh-CN')}\n`;
    }
    
    report += '\n## 各阶段进度\n\n';
    
    const phases = document.querySelectorAll('.phase');
    phases.forEach((phase, index) => {
        const phaseTitle = phase.querySelector('.phase-info h2').textContent;
        const phaseLessons = phase.querySelectorAll('.lesson-card');
        const phaseCompleted = Array.from(phaseLessons).filter(lesson => {
            const lessonId = lesson.getAttribute('data-lesson');
            return progressData.completedLessons.has(lessonId);
        }).length;
        const phaseProgress = Math.round((phaseCompleted / phaseLessons.length) * 100);
        
        report += `### ${phaseTitle}\n`;
        report += `- 完成: ${phaseCompleted}/${phaseLessons.length} (${phaseProgress}%)\n\n`;
    });
    
    report += '## 已完成课程列表\n\n';
    
    progressData.completedLessons.forEach(lessonId => {
        const lessonCard = document.querySelector(`[data-lesson="${lessonId}"]`);
        if (lessonCard) {
            const lessonTitle = lessonCard.querySelector('h4').textContent;
            report += `- [x] ${lessonTitle}\n`;
        }
    });
    
    // 创建下载
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI学习进度报告_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('进度报告已导出！');
}

// 更新最后更新时间显示
function updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        if (progressData.lastUpdate) {
            const lastUpdate = new Date(progressData.lastUpdate);
            lastUpdateElement.textContent = lastUpdate.toLocaleString('zh-CN');
        } else {
            lastUpdateElement.textContent = '暂无记录';
        }
    }
}

// 搜索功能（可选扩展）
function searchLessons(keyword) {
    const lessons = document.querySelectorAll('.lesson-card');
    keyword = keyword.toLowerCase();
    
    lessons.forEach(lesson => {
        const title = lesson.querySelector('h4').textContent.toLowerCase();
        const content = lesson.querySelector('.lesson-content').textContent.toLowerCase();
        
        if (title.includes(keyword) || content.includes(keyword)) {
            lesson.style.display = 'block';
        } else {
            lesson.style.display = 'none';
        }
    });
}

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S: 保存进度
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProgress();
        alert('进度已保存！');
    }
    
    // Ctrl/Cmd + E: 导出进度
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportProgress();
    }
});

// 自动保存（每30秒）
setInterval(() => {
    if (progressData.completedLessons.size > 0) {
        saveProgress();
    }
}, 30000);

// 离开页面前保存
window.addEventListener('beforeunload', function() {
    saveProgress();
});

// 添加平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 进度统计分析
function getProgressStats() {
    const totalLessons = document.querySelectorAll('.lesson-card').length;
    const completedCount = progressData.completedLessons.size;
    
    // 计算预计完成时间
    let estimatedDays = 0;
    if (progressData.startDate && completedCount > 0) {
        const startDate = new Date(progressData.startDate);
        const today = new Date();
        const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const dailyRate = completedCount / (daysPassed || 1);
        const remainingLessons = totalLessons - completedCount;
        estimatedDays = Math.ceil(remainingLessons / dailyRate);
    }
    
    return {
        total: totalLessons,
        completed: completedCount,
        percentage: Math.round((completedCount / totalLessons) * 100),
        estimatedDays: estimatedDays
    };
}

// 打印友好视图
function printProgress() {
    window.print();
}

// 导出为PDF（需要浏览器支持）
function exportToPDF() {
    window.print();
}
