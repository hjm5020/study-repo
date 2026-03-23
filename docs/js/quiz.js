(() => {
  let questions = [];
  let current = 0;
  let score = 0;
  let wrongs = []; // { q, myAnswer }
  let answered = false;
  let categoryStats = {}; // { catId: { correct, total } }

  function init() {
    const raw = sessionStorage.getItem('quizQuestions');
    if (!raw) { window.location.href = 'index.html'; return; }
    questions = JSON.parse(raw);
    if (questions.length === 0) { window.location.href = 'index.html'; return; }
    renderQuestion();
  }

  function renderQuestion() {
    answered = false;
    const q = questions[current];
    const total = questions.length;

    // 진행 바
    const pct = Math.round((current / total) * 100);
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressText').textContent = `${current + 1} / ${total}`;

    // 문제 텍스트
    document.getElementById('questionType').textContent = q.type === 'ox' ? 'O / X' : '객관식';
    document.getElementById('questionCategory').textContent = getCatLabel(q.category, q.subtopic);
    document.getElementById('questionText').textContent = q.question;

    // 선택지 영역
    const choicesEl = document.getElementById('choices');
    choicesEl.innerHTML = '';

    if (q.type === 'ox') {
      choicesEl.className = 'choices ox';
      ['O', 'X'].forEach(val => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn ox-btn';
        btn.textContent = val;
        btn.dataset.value = val === 'O' ? 'true' : 'false';
        btn.addEventListener('click', () => handleAnswer(btn.dataset.value === 'true', btn));
        choicesEl.appendChild(btn);
      });
    } else {
      // 객관식 — 보기 셔플
      const shuffled = shuffleChoices(q.choices, q.correctAnswer);
      choicesEl.className = 'choices multiple';
      shuffled.choices.forEach((text, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn multiple-btn';
        btn.textContent = `${['①','②','③','④'][idx]} ${text}`;
        btn.dataset.value = idx;
        btn.dataset.correct = shuffled.correctIdx === idx ? 'true' : 'false';
        btn.addEventListener('click', () => handleMultiple(btn, shuffled.correctIdx));
        choicesEl.appendChild(btn);
      });
    }

    // 해설 숨기기
    document.getElementById('explanation').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
  }

  function handleAnswer(userAnswer, btn) {
    if (answered) return;
    answered = true;

    const q = questions[current];
    const isCorrect = (userAnswer === q.correctAnswer);

    // 버튼 색상
    const allBtns = document.querySelectorAll('.choice-btn');
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect) {
      btn.classList.add('correct');
      recordResult(q, true, userAnswer);
      setTimeout(nextQuestion, 700);
    } else {
      btn.classList.add('wrong');
      // 정답 버튼 표시
      allBtns.forEach(b => {
        if (b.dataset.value === String(q.correctAnswer)) b.classList.add('correct');
      });
      recordResult(q, false, userAnswer);
      showExplanation(q);
    }
  }

  function handleMultiple(btn, correctIdx) {
    if (answered) return;
    answered = true;

    const isCorrect = btn.dataset.correct === 'true';
    const q = questions[current];
    const allBtns = document.querySelectorAll('.choice-btn');
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect) {
      btn.classList.add('correct');
      recordResult(q, true, parseInt(btn.dataset.value));
      setTimeout(nextQuestion, 700);
    } else {
      btn.classList.add('wrong');
      allBtns.forEach(b => { if (b.dataset.correct === 'true') b.classList.add('correct'); });
      recordResult(q, false, parseInt(btn.dataset.value));
      showExplanation(q);
    }
  }

  function recordResult(q, isCorrect, myAnswer) {
    if (!categoryStats[q.category]) categoryStats[q.category] = { correct: 0, total: 0 };
    categoryStats[q.category].total++;
    if (isCorrect) {
      score++;
      categoryStats[q.category].correct++;
    } else {
      wrongs.push({ q, myAnswer });
    }
  }

  function showExplanation(q) {
    const el = document.getElementById('explanation');
    el.style.display = 'block';
    el.innerHTML = `<strong>해설:</strong> ${q.explanation}`;
    document.getElementById('nextBtn').style.display = 'block';
    document.getElementById('nextBtn').onclick = nextQuestion;
  }

  function nextQuestion() {
    current++;
    if (current >= questions.length) {
      finishQuiz();
    } else {
      renderQuestion();
      window.scrollTo(0, 0);
    }
  }

  function finishQuiz() {
    const topics = JSON.parse(sessionStorage.getItem('quizTopics') || '[]');
    const resultData = {
      date: new Date().toISOString(),
      topics,
      score,
      total: questions.length,
      wrongs,
      categoryStats
    };
    sessionStorage.setItem('quizResult', JSON.stringify(resultData));
    Storage.saveSession({
      date: resultData.date,
      topics,
      score,
      total: questions.length,
      categoryStats
    });
    window.location.href = 'result.html';
  }

  function shuffleChoices(choices, correctIdx) {
    const indexed = choices.map((text, i) => ({ text, isCorrect: i === correctIdx }));
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    return {
      choices: indexed.map(x => x.text),
      correctIdx: indexed.findIndex(x => x.isCorrect)
    };
  }

  function getCatLabel(category, subtopic) {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? `${cat.icon} ${cat.name} · ${subtopic}` : subtopic;
  }

  init();
})();
