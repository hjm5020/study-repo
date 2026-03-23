const Storage = (() => {
  const KEY = 'studyQuizHistory';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  }

  function save(history) {
    localStorage.setItem(KEY, JSON.stringify(history));
  }

  // 세션 저장 (result.js에서 호출)
  function saveSession(session) {
    // session: { date, topics, score, total, wrongs: [{id, question, myAnswer, correctAnswer, explanation}] }
    const history = load();
    history.push(session);
    save(history);
  }

  function getAll() {
    return load();
  }

  function getTodayStats() {
    const today = new Date().toDateString();
    const history = load();
    const todaySessions = history.filter(s => new Date(s.date).toDateString() === today);
    const totalQ = todaySessions.reduce((a, s) => a + s.total, 0);
    const totalCorrect = todaySessions.reduce((a, s) => a + s.score, 0);
    return { sessions: todaySessions.length, totalQ, totalCorrect };
  }

  function getWeekStats() {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const history = load();
    const weekSessions = history.filter(s => new Date(s.date).getTime() >= weekAgo);
    const totalQ = weekSessions.reduce((a, s) => a + s.total, 0);
    const totalCorrect = weekSessions.reduce((a, s) => a + s.score, 0);
    return { sessions: weekSessions.length, totalQ, totalCorrect };
  }

  // 카테고리별 정답률
  function getCategoryStats() {
    const history = load();
    const stats = {}; // { category: { correct, total } }

    history.forEach(session => {
      if (!session.categoryStats) return;
      Object.entries(session.categoryStats).forEach(([cat, { correct, total }]) => {
        if (!stats[cat]) stats[cat] = { correct: 0, total: 0 };
        stats[cat].correct += correct;
        stats[cat].total += total;
      });
    });

    return stats;
  }

  // 최근 10개 세션
  function getRecentSessions(n = 10) {
    const history = load();
    return history.slice(-n).reverse();
  }

  return { saveSession, getAll, getTodayStats, getWeekStats, getCategoryStats, getRecentSessions };
})();
