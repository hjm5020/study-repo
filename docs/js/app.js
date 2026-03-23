(() => {
  // 선택 상태
  let selectedCategory = null;
  let selectedSubtopics = new Set();
  let questionCount = 10;

  function init() {
    renderCategories();
    renderDashboard();
    document.getElementById('countSelect').addEventListener('change', e => {
      questionCount = parseInt(e.target.value);
    });
    document.getElementById('startBtn').addEventListener('click', startQuiz);
    document.getElementById('randomBtn').addEventListener('click', startRandom);
  }

  function renderCategories() {
    const container = document.getElementById('categories');
    container.innerHTML = CATEGORIES.map(cat => `
      <div class="category-card" data-id="${cat.id}">
        <div class="category-header" onclick="toggleCategory('${cat.id}')">
          <span class="category-icon">${cat.icon}</span>
          <span class="category-name">${cat.name}</span>
          <span class="category-count">${QUIZ_DATA.filter(q => q.category === cat.id).length}문항</span>
        </div>
        <div class="subtopics" id="sub-${cat.id}">
          ${cat.subtopics.map(sub => `
            <label class="subtopic-label">
              <input type="checkbox" class="subtopic-cb" data-cat="${cat.id}" data-sub="${sub}" onchange="onSubtopicChange()">
              <span>${sub}</span>
              <span class="subtopic-count">${QUIZ_DATA.filter(q => q.category === cat.id && q.subtopic === sub).length}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  window.toggleCategory = function(catId) {
    const card = document.querySelector(`.category-card[data-id="${catId}"]`);
    const subtopics = document.getElementById(`sub-${catId}`);
    const isOpen = card.classList.toggle('open');
    subtopics.style.display = isOpen ? 'flex' : 'none';

    if (!isOpen) {
      // 닫을 때 해당 카테고리 체크박스 모두 해제
      card.querySelectorAll('.subtopic-cb').forEach(cb => {
        cb.checked = false;
        selectedSubtopics.delete(cb.dataset.cat + '::' + cb.dataset.sub);
      });
      onSubtopicChange();
    }
  };

  window.onSubtopicChange = function() {
    selectedSubtopics.clear();
    document.querySelectorAll('.subtopic-cb:checked').forEach(cb => {
      selectedSubtopics.add(cb.dataset.cat + '::' + cb.dataset.sub);
    });
    updateStartBtn();
  };

  function updateStartBtn() {
    const btn = document.getElementById('startBtn');
    btn.disabled = selectedSubtopics.size === 0;
  }

  function getSelectedQuestions() {
    let pool = QUIZ_DATA.filter(q => {
      return selectedSubtopics.has(q.category + '::' + q.subtopic);
    });
    pool = shuffle(pool);
    if (questionCount > 0 && pool.length > questionCount) {
      pool = pool.slice(0, questionCount);
    }
    return pool;
  }

  function startQuiz() {
    const questions = getSelectedQuestions();
    if (questions.length === 0) return;
    sessionStorage.setItem('quizQuestions', JSON.stringify(questions));
    sessionStorage.setItem('quizTopics', JSON.stringify([...selectedSubtopics]));
    window.location.href = 'quiz.html';
  }

  function startRandom() {
    let pool = shuffle([...QUIZ_DATA]);
    const count = questionCount > 0 ? Math.min(questionCount, pool.length) : pool.length;
    const questions = pool.slice(0, count);
    sessionStorage.setItem('quizQuestions', JSON.stringify(questions));
    sessionStorage.setItem('quizTopics', JSON.stringify(['전체 랜덤']));
    window.location.href = 'quiz.html';
  }

  function renderDashboard() {
    const todayStats = Storage.getTodayStats();
    const weekStats = Storage.getWeekStats();
    const catStats = Storage.getCategoryStats();
    const recent = Storage.getRecentSessions(5);

    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${todayStats.sessions}</div>
        <div class="stat-label">오늘 세션</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${todayStats.totalQ > 0 ? Math.round(todayStats.totalCorrect / todayStats.totalQ * 100) : 0}%</div>
        <div class="stat-label">오늘 정답률</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${weekStats.sessions}</div>
        <div class="stat-label">이번 주 세션</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${weekStats.totalQ}</div>
        <div class="stat-label">이번 주 문제 수</div>
      </div>
    `;

    // 취약 분야
    const weakAreas = document.getElementById('weakAreas');
    const catEntries = Object.entries(catStats)
      .filter(([, v]) => v.total >= 3)
      .map(([cat, v]) => ({ cat, rate: Math.round(v.correct / v.total * 100) }))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 3);

    if (catEntries.length > 0) {
      weakAreas.innerHTML = `
        <h3>취약 분야</h3>
        ${catEntries.map(e => {
          const catInfo = CATEGORIES.find(c => c.id === e.cat);
          return `
          <div class="weak-item">
            <span>${catInfo ? catInfo.icon + ' ' + catInfo.name : e.cat}</span>
            <div class="weak-bar-wrap"><div class="weak-bar" style="width:${e.rate}%"></div></div>
            <span class="weak-rate">${e.rate}%</span>
          </div>`;
        }).join('')}
      `;
    } else {
      weakAreas.innerHTML = '';
    }

    // 최근 기록
    const historyList = document.getElementById('historyList');
    if (recent.length > 0) {
      historyList.innerHTML = `
        <h3>최근 기록</h3>
        <ul class="history-ul">
          ${recent.map(s => `
            <li class="history-item">
              <span class="history-date">${formatDate(s.date)}</span>
              <span class="history-topics">${Array.isArray(s.topics) ? s.topics.join(', ') : s.topics}</span>
              <span class="history-score">${s.score}/${s.total} (${Math.round(s.score/s.total*100)}%)</span>
            </li>
          `).join('')}
        </ul>
      `;
    } else {
      historyList.innerHTML = '<p class="empty-msg">아직 학습 기록이 없습니다.</p>';
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  init();
})();
