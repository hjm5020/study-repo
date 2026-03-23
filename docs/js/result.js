(() => {
  function init() {
    const raw = sessionStorage.getItem('quizResult');
    if (!raw) { window.location.href = 'index.html'; return; }
    const result = JSON.parse(raw);
    renderResult(result);
    renderWrongs(result);
    renderTIL(result);
    bindButtons(result);
  }

  function renderResult(result) {
    const pct = Math.round(result.score / result.total * 100);
    const emoji = pct >= 90 ? '🎉' : pct >= 70 ? '👍' : pct >= 50 ? '💪' : '📚';

    document.getElementById('resultSummary').innerHTML = `
      <div class="score-circle ${getScoreClass(pct)}">
        <div class="score-big">${pct}<span>%</span></div>
        <div class="score-detail">${result.score} / ${result.total} 정답</div>
      </div>
      <div class="score-msg">${emoji} ${getScoreMsg(pct)}</div>
      <div class="result-topics">범위: ${formatTopics(result.topics)}</div>
    `;
  }

  function renderWrongs(result) {
    const container = document.getElementById('wrongList');
    if (!result.wrongs || result.wrongs.length === 0) {
      container.innerHTML = '<p class="perfect-msg">🎊 모두 정답! 오답이 없습니다.</p>';
      return;
    }

    container.innerHTML = result.wrongs.map((w, i) => {
      const myAnswerText = formatAnswer(w.q, w.myAnswer);
      const correctAnswerText = formatCorrectAnswer(w.q);
      return `
        <div class="wrong-item">
          <div class="wrong-header" onclick="toggleWrong(${i})">
            <span class="wrong-num">오답 ${i + 1}</span>
            <span class="wrong-q">${w.q.question.length > 60 ? w.q.question.slice(0, 60) + '…' : w.q.question}</span>
            <span class="toggle-icon" id="icon-${i}">▼</span>
          </div>
          <div class="wrong-detail" id="detail-${i}" style="display:none">
            <p><strong>Q:</strong> ${w.q.question}</p>
            <p class="my-answer">❌ 내 답: ${myAnswerText}</p>
            <p class="correct-answer">✅ 정답: ${correctAnswerText}</p>
            <p class="explanation-text"><strong>해설:</strong> ${w.q.explanation}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  window.toggleWrong = function(i) {
    const detail = document.getElementById(`detail-${i}`);
    const icon = document.getElementById(`icon-${i}`);
    const isOpen = detail.style.display !== 'none';
    detail.style.display = isOpen ? 'none' : 'block';
    icon.textContent = isOpen ? '▼' : '▲';
  };

  function renderTIL(result) {
    const md = generateTIL(result);
    document.getElementById('tilContent').textContent = md;
  }

  function generateTIL(result) {
    const today = new Date(result.date).toISOString().slice(0, 10);
    const pct = Math.round(result.score / result.total * 100);
    const topicsStr = formatTopics(result.topics);
    let md = `# ${today} 학습 퀴즈\n\n`;
    md += `- 점수: ${result.score}/${result.total} (${pct}%)\n`;
    md += `- 범위: ${topicsStr}\n`;

    if (result.wrongs && result.wrongs.length > 0) {
      md += `\n## 오답 노트\n\n`;
      result.wrongs.forEach(w => {
        md += `**Q: ${w.q.question}**\n`;
        md += `- 내 답: ${formatAnswer(w.q, w.myAnswer)}\n`;
        md += `- 정답: ${formatCorrectAnswer(w.q)}\n`;
        md += `- 설명: ${w.q.explanation}\n\n`;
      });

      // 복습 필요 개념 (subtopic 목록)
      const subtopics = [...new Set(result.wrongs.map(w => w.q.subtopic))];
      md += `## 복습 필요 개념\n`;
      subtopics.forEach(s => { md += `- ${s}\n`; });
    } else {
      md += `\n🎊 모두 정답! 완벽합니다.\n`;
    }

    return md;
  }

  function bindButtons(result) {
    document.getElementById('copyTilBtn').addEventListener('click', () => {
      const text = document.getElementById('tilContent').textContent;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyTilBtn');
        btn.textContent = '✓ 복사됨!';
        setTimeout(() => { btn.textContent = '📋 TIL 복사'; }, 2000);
      }).catch(() => {
        // fallback
        const el = document.getElementById('tilContent');
        const range = document.createRange();
        range.selectNode(el);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
      });
    });

    document.getElementById('retryWrongsBtn').addEventListener('click', () => {
      if (!result.wrongs || result.wrongs.length === 0) return;
      const wrongQs = result.wrongs.map(w => w.q);
      sessionStorage.setItem('quizQuestions', JSON.stringify(wrongQs));
      sessionStorage.setItem('quizTopics', JSON.stringify(['오답 재시도']));
      window.location.href = 'quiz.html';
    });

    document.getElementById('homeBtn').addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    // 오답이 없으면 버튼 비활성화
    if (!result.wrongs || result.wrongs.length === 0) {
      document.getElementById('retryWrongsBtn').disabled = true;
    }
  }

  function formatAnswer(q, myAnswer) {
    if (q.type === 'ox') {
      return myAnswer === true || myAnswer === 'true' ? 'O' : 'X';
    }
    // multiple — myAnswer가 셔플된 인덱스일 수도 있으나 wrongs에는 원본 q 저장
    // myAnswer는 셔플 후 인덱스, 원본 choices에서 찾기 어려우므로 그냥 표시
    if (typeof myAnswer === 'number' && q.choices) {
      return q.choices[myAnswer] || String(myAnswer);
    }
    return String(myAnswer);
  }

  function formatCorrectAnswer(q) {
    if (q.type === 'ox') {
      return q.correctAnswer ? 'O' : 'X';
    }
    if (q.choices) {
      return q.choices[q.correctAnswer];
    }
    return String(q.correctAnswer);
  }

  function formatTopics(topics) {
    if (!topics) return '';
    if (Array.isArray(topics)) {
      return topics.map(t => t.replace('::', ' > ')).join(', ');
    }
    return String(topics);
  }

  function getScoreClass(pct) {
    if (pct >= 80) return 'score-high';
    if (pct >= 60) return 'score-mid';
    return 'score-low';
  }

  function getScoreMsg(pct) {
    if (pct === 100) return '완벽합니다!';
    if (pct >= 90) return '훌륭해요!';
    if (pct >= 70) return '잘 하고 있어요!';
    if (pct >= 50) return '조금 더 복습이 필요해요.';
    return '오답 노트를 꼭 확인하세요!';
  }

  init();
})();
