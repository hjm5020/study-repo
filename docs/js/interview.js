(() => {
  const SS_STATE = 'interviewState';

  let questions = [];
  let current = 0;
  let selectedSubtopics = new Set();
  let questionCount = 10;
  let phase = 'setup'; // 'setup' | 'running' | 'done'

  function init() {
    renderSetup();
    restoreState();
  }

  // ── 상태 복원 (탭 재진입 시) ──────────────────────
  function restoreState() {
    const raw = sessionStorage.getItem(SS_STATE);
    if (!raw) return;
    try {
      const state = JSON.parse(raw);
      if (state.phase === 'running' && state.questions && state.questions.length > 0) {
        questions = state.questions;
        current = state.current || 0;
        phase = 'running';
        showRunning();
        renderQuestion();
      } else if (state.phase === 'done') {
        phase = 'done';
        showDone(state.total || 0);
      }
    } catch (e) {
      sessionStorage.removeItem(SS_STATE);
    }
  }

  function saveState() {
    sessionStorage.setItem(SS_STATE, JSON.stringify({ phase, questions, current }));
  }

  function clearState() {
    sessionStorage.removeItem(SS_STATE);
  }

  // ── 셋업 화면 ─────────────────────────────────────
  function renderSetup() {
    phase = 'setup';
    const panel = document.getElementById('tab-interview');
    panel.innerHTML = `
      <div class="iv-setup">
        <div class="iv-setup-categories" id="ivCategories"></div>
        <div class="controls">
          <label for="ivCountSelect">문제 수</label>
          <select id="ivCountSelect">
            <option value="5">5문제</option>
            <option value="10" selected>10문제</option>
            <option value="15">15문제</option>
            <option value="20">20문제</option>
            <option value="0">전체</option>
          </select>
          <div class="btn-group" style="margin-left:auto">
            <button class="btn btn-secondary" id="ivRandomBtn">전체 랜덤</button>
            <button class="btn btn-primary" id="ivStartBtn" disabled>면접 시작</button>
          </div>
        </div>
      </div>
    `;
    renderIvCategories();
    document.getElementById('ivCountSelect').addEventListener('change', e => {
      questionCount = parseInt(e.target.value);
    });
    document.getElementById('ivStartBtn').addEventListener('click', startInterview);
    document.getElementById('ivRandomBtn').addEventListener('click', startRandom);
  }

  function renderIvCategories() {
    const container = document.getElementById('ivCategories');
    container.innerHTML = CATEGORIES.map(cat => {
      const total = cat.subtopics.reduce((sum, sub) => sum + (CONCEPT_DATA[sub] ? CONCEPT_DATA[sub].length : 0), 0);
      return `
        <div class="category-card" data-id="iv-${cat.id}">
          <div class="category-header" onclick="toggleIvCategory('${cat.id}')">
            <span class="category-icon">${cat.icon}</span>
            <span class="category-name">${cat.name}</span>
            <span class="category-count">${total}문항</span>
          </div>
          <div class="subtopics" id="iv-sub-${cat.id}">
            ${cat.subtopics.map(sub => {
              const count = CONCEPT_DATA[sub] ? CONCEPT_DATA[sub].length : 0;
              return `
                <label class="subtopic-label">
                  <input type="checkbox" class="iv-subtopic-cb" data-sub="${sub}" onchange="onIvSubtopicChange()">
                  <span>${sub}</span>
                  <span class="subtopic-count">${count}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  window.toggleIvCategory = function(catId) {
    const card = document.querySelector(`.category-card[data-id="iv-${catId}"]`);
    const subtopics = document.getElementById(`iv-sub-${catId}`);
    const isOpen = card.classList.toggle('open');
    subtopics.style.display = isOpen ? 'flex' : 'none';
    if (!isOpen) {
      card.querySelectorAll('.iv-subtopic-cb').forEach(cb => {
        cb.checked = false;
        selectedSubtopics.delete(cb.dataset.sub);
      });
      onIvSubtopicChange();
    }
  };

  window.onIvSubtopicChange = function() {
    selectedSubtopics.clear();
    document.querySelectorAll('.iv-subtopic-cb:checked').forEach(cb => {
      selectedSubtopics.add(cb.dataset.sub);
    });
    const btn = document.getElementById('ivStartBtn');
    if (btn) btn.disabled = selectedSubtopics.size === 0;
  };

  function buildPool(subtopics) {
    const pool = [];
    subtopics.forEach(sub => {
      const concepts = CONCEPT_DATA[sub];
      if (!concepts) return;
      // subtopic 정보를 함께 저장
      concepts.forEach(c => pool.push({ ...c, subtopic: sub }));
    });
    return pool;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startInterview() {
    let pool = shuffle(buildPool([...selectedSubtopics]));
    const count = questionCount > 0 ? Math.min(questionCount, pool.length) : pool.length;
    questions = pool.slice(0, count);
    current = 0;
    phase = 'running';
    saveState();
    showRunning();
    renderQuestion();
  }

  function startRandom() {
    const allSubs = Object.keys(CONCEPT_DATA);
    let pool = shuffle(buildPool(allSubs));
    const count = questionCount > 0 ? Math.min(questionCount, pool.length) : pool.length;
    questions = pool.slice(0, count);
    current = 0;
    phase = 'running';
    saveState();
    showRunning();
    renderQuestion();
  }

  // ── 진행 화면 ─────────────────────────────────────
  function showRunning() {
    const panel = document.getElementById('tab-interview');
    panel.innerHTML = `
      <div class="iv-progress-container">
        <div class="iv-progress-bar" id="ivProgressBar" style="width:0%"></div>
      </div>
      <div class="iv-progress-text" id="ivProgressText"></div>
      <div class="iv-card" id="ivCard"></div>
    `;
  }

  function renderQuestion() {
    const q = questions[current];
    const total = questions.length;
    const pct = Math.round((current / total) * 100);

    document.getElementById('ivProgressBar').style.width = pct + '%';
    document.getElementById('ivProgressText').textContent = `${current + 1} / ${total}`;

    // 서브토픽에서 카테고리 아이콘 찾기
    const catInfo = getCatBySubtopic(q.subtopic);

    document.getElementById('ivCard').innerHTML = `
      <div class="iv-card-meta">
        <span class="badge badge-cat">${catInfo ? catInfo.icon + ' ' + catInfo.name : ''} · ${q.subtopic}</span>
      </div>
      <div class="iv-question">${q.title}에 대해 설명하세요.</div>

      <textarea
        class="iv-memo"
        id="ivMemo"
        rows="4"
        placeholder="생각을 정리해보세요... (작성하지 않아도 됩니다)"
      ></textarea>

      <div class="iv-actions">
        <button class="btn btn-secondary" id="ivHintBtn" onclick="toggleIvHint()">힌트 보기</button>
        <button class="btn btn-secondary" id="ivAnswerBtn" onclick="toggleIvAnswer()">답안 보기</button>
      </div>

      <div class="iv-hint" id="ivHint" style="display:none">
        <strong>힌트:</strong> ${makeHint(q)}
      </div>

      <div class="iv-answer" id="ivAnswer" style="display:none">
        <strong>답안:</strong> ${q.desc}
      </div>

      <button class="btn btn-primary iv-next-btn" id="ivNextBtn" onclick="ivNext()">
        ${current + 1 < total ? '다음 질문 →' : '면접 완료'}
      </button>
    `;

    // 메모 변경 시 state 저장
    document.getElementById('ivMemo').addEventListener('input', saveState);
  }

  function makeHint(q) {
    // title에서 괄호 안 영문 키워드 추출, 없으면 첫 문장 앞부분
    const match = q.title.match(/\(([A-Za-z0-9\-\/\s]+)\)/g);
    if (match && match.length > 0) {
      return match.map(m => m.replace(/[()]/g, '')).join(', ');
    }
    const firstSentence = q.desc.split('.')[0];
    return firstSentence.length > 40 ? firstSentence.slice(0, 40) + '...' : firstSentence;
  }

  function getCatBySubtopic(subtopic) {
    return CATEGORIES.find(cat => cat.subtopics.includes(subtopic));
  }

  window.toggleIvHint = function() {
    const el = document.getElementById('ivHint');
    const btn = document.getElementById('ivHintBtn');
    const isOpen = el.style.display !== 'none';
    el.style.display = isOpen ? 'none' : 'block';
    btn.textContent = isOpen ? '힌트 보기' : '힌트 숨기기';
  };

  window.toggleIvAnswer = function() {
    const el = document.getElementById('ivAnswer');
    const btn = document.getElementById('ivAnswerBtn');
    const isOpen = el.style.display !== 'none';
    el.style.display = isOpen ? 'none' : 'block';
    btn.textContent = isOpen ? '답안 보기' : '답안 숨기기';
  };

  window.ivNext = function() {
    current++;
    if (current >= questions.length) {
      finishInterview();
    } else {
      saveState();
      renderQuestion();
      document.getElementById('tab-interview').scrollTop = 0;
      window.scrollTo(0, 0);
    }
  };

  // ── 완료 화면 ─────────────────────────────────────
  function finishInterview() {
    phase = 'done';
    clearState();
    showDone(questions.length);
  }

  function showDone(total) {
    const panel = document.getElementById('tab-interview');
    panel.innerHTML = `
      <div class="iv-done">
        <div class="iv-done-icon">🎉</div>
        <div class="iv-done-title">면접 완료!</div>
        <div class="iv-done-sub">총 ${total}개 질문을 완료했습니다.</div>
        <button class="btn btn-primary" onclick="ivRestart()" style="margin-top:20px">다시 시작</button>
      </div>
    `;
  }

  window.ivRestart = function() {
    selectedSubtopics.clear();
    questionCount = 10;
    renderSetup();
  };

  // 탭 전환 시 init 재호출 방지 — app.js에서 탭 활성화 시 한 번만 호출
  window.initInterview = init;
})();
