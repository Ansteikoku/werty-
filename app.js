
const boardListElem = document.getElementById('board-list');
const threadListElem = document.getElementById('thread-list');
const postFormSection = document.getElementById('post-form-section');

async function loadBoards() {
  const { data, error } = await supabase.from('boards').select('*').order('name');
  if (error) {
    boardListElem.textContent = '板の読み込みエラー';
    return;
  }
  boardListElem.innerHTML = '';
  data.forEach(board => {
    const btn = document.createElement('button');
    btn.textContent = board.name;
    btn.onclick = () => loadThreads(board.slug);
    boardListElem.appendChild(btn);
  });
}

async function loadThreads(slug) {
  const { data, error } = await supabase.from('threads')
    .select('*')
    .eq('board_slug', slug)
    .order('updated_at', { ascending: false });
  if (error) {
    threadListElem.textContent = 'スレッド読み込みエラー';
    return;
  }
  threadListElem.innerHTML = '<h2>' + slug + '</h2>';
  data.forEach(thread => {
    const div = document.createElement('div');
    div.className = 'thread-box';
    div.textContent = '[' + (thread.name || '名無し') + '] ' + thread.content;
    threadListElem.appendChild(div);
  });
  renderPostForm(slug);
}

function renderPostForm(slug) {
  postFormSection.innerHTML = '';
  const form = document.createElement('form');
  form.innerHTML = `
    <input type="text" name="name" placeholder="名前(任意)">
    <textarea name="content" required placeholder="本文"></textarea>
    <label><input type="checkbox" name="sage"> sage</label>
    <button type="submit">スレッド作成</button>`;
  form.onsubmit = async e => {
    e.preventDefault();
    const name = form.name.value || '名無し';
    const content = form.content.value.trim();
    const sage = form.sage.checked;
    if (!content) return;
    await supabase.from('threads').insert([{
      board_slug: slug,
      name,
      content,
      sage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);
    form.reset();
    loadThreads(slug);
  };
  postFormSection.appendChild(form);
}

loadBoards();
