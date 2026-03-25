(() => {
  let currentNote = null;

  window.initNotes = function () {
    const panel = document.getElementById('tab-notes');
    if (!panel) return;

    panel.innerHTML = `
      <div class="notes-layout">
        <aside class="notes-sidebar" id="notesSidebar">
          <div class="notes-sidebar-header">목록</div>
          <nav id="notesList"></nav>
        </aside>
        <main class="notes-content" id="notesContent">
          <div class="notes-placeholder">
            <div class="notes-placeholder-icon">📖</div>
            <p>왼쪽 목록에서 공부자료를 선택하세요</p>
          </div>
        </main>
      </div>
    `;

    renderNotesList();
  };

  function renderNotesList() {
    const list = document.getElementById('notesList');
    if (!list) return;

    list.innerHTML = NOTES_DATA.map(cat => `
      <div class="notes-cat">
        <div class="notes-cat-header" onclick="toggleNotesCat('${cat.category}')">
          <span>${cat.icon} ${cat.name}</span>
          <span class="notes-cat-toggle" id="notes-cat-icon-${cat.category}">▼</span>
        </div>
        <div class="notes-cat-items" id="notes-cat-${cat.category}">
          ${cat.notes.map(note => `
            <button class="notes-item" data-file="${note.file}" onclick="loadNote(this, '${note.file}')">
              ${note.title}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  window.toggleNotesCat = function (catId) {
    const items = document.getElementById('notes-cat-' + catId);
    const icon = document.getElementById('notes-cat-icon-' + catId);
    const isOpen = items.style.display !== 'none';
    items.style.display = isOpen ? 'none' : 'block';
    icon.textContent = isOpen ? '▶' : '▼';
  };

  window.loadNote = function (btnEl, file) {
    if (currentNote === file) return;
    currentNote = file;

    // 활성 표시
    document.querySelectorAll('.notes-item').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');

    const content = document.getElementById('notesContent');
    content.innerHTML = `<iframe class="notes-iframe" src="${file}"></iframe>`;

    // 모바일: 사이드바 닫기
    if (window.innerWidth <= 768) {
      document.getElementById('notesSidebar').classList.remove('open');
    }
  };

  window.toggleNotesSidebar = function () {
    document.getElementById('notesSidebar').classList.toggle('open');
  };
})();
