/* =========================================================
   Songflush 공통 동작
   - 준비 중인 페이지 안내
   - 메인: 탭 전환, 곡으로 추천, 장르로 추천
   ========================================================= */

/* ---------- 페이지 준비 상태 ----------
 * 만든 페이지는 READY_PAGES 에 파일명을 추가하면
 * 그때부터 링크가 실제 페이지로 이동한다.
 */
var READY_PAGES = ['index.html'];

var PAGE_NAMES = {
  'recommend-song.html':  '곡으로 추천',
  'recommend-genre.html': '장르로 추천',
  'result.html':          '추천 결과',
  'genres.html':          '장르 사전',
  'genre-detail.html':    '장르 상세',
  'library.html':         '내 보관함'
};

function fileOf(url) {
  return url.split('?')[0].split('#')[0].split('/').pop() || 'index.html';
}

function isReady(url) {
  return READY_PAGES.indexOf(fileOf(url)) !== -1;
}

var toastTimer;
function showToast(message) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove('is-show'); }, 2400);
}

function notReadyMessage(url) {
  var name = PAGE_NAMES[fileOf(url)];
  return (name ? "'" + name + "' 페이지는 " : '이 페이지는 ') + '준비 중이에요';
}

/* 이동: 준비된 페이지면 이동, 아니면 안내 */
function goTo(url) {
  if (isReady(url)) {
    location.href = url;
  } else {
    console.log('[Songflush] 이동 예정 주소:', url);
    showToast(notReadyMessage(url));
  }
}

/* 모든 링크(상단 메뉴 포함)에 준비 중 안내 적용 */
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href]');
  if (!a) return;
  var href = a.getAttribute('href');
  if (/^(https?:|mailto:|#)/.test(href)) return;
  if (!isReady(href)) {
    e.preventDefault();
    showToast(notReadyMessage(href));
  }
});


/* =========================================================
   메인 페이지
   ========================================================= */
(function () {
  var panelSong = document.getElementById('panel-song');
  if (!panelSong) return; // 메인 페이지가 아니면 실행하지 않음

  /* ---------- 장르 데이터 (하위 장르 확정본) ---------- */
  var GENRES = [
    { id: 'indie-pop',   name: '인디 팝',
      subs: [ { id: 'bedroom-pop', name: '베드룸 팝' },
              { id: 'dream-pop',   name: '드림 팝' },
              { id: 'synth-pop',   name: '신스 팝' } ] },
    { id: 'shoegaze',    name: '슈게이즈',
      subs: [ { id: 'nugaze',      name: '누게이즈' },
              { id: 'blackgaze',   name: '블랙게이즈' },
              { id: 'noise-pop',   name: '노이즈 팝' } ] },
    { id: 'alternative', name: '얼터너티브',
      subs: [ { id: 'alternative-rock', name: '얼터너티브 록' },
              { id: 'grunge',           name: '그런지' },
              { id: 'britpop',          name: '브릿팝' } ] },
    { id: 'lofi',        name: '로파이',
      subs: [ { id: 'lofi-hiphop', name: '로파이 힙합' },
              { id: 'chillhop',    name: '칠합' },
              { id: 'lofi-jazz',   name: '로파이 재즈' } ] }
  ];

  function findGenre(id) {
    for (var i = 0; i < GENRES.length; i++) if (GENRES[i].id === id) return GENRES[i];
    return null;
  }

  /* ---------- 탭 전환 (입력값·선택 상태는 그대로 유지) ---------- */
  var tabs = [document.getElementById('tab-song'), document.getElementById('tab-genre')];
  var panels = [panelSong, document.getElementById('panel-genre')];

  function selectTab(index) {
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on);
      tab.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(i); });
    tab.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        var next = (i + 1) % tabs.length;
        selectTab(next);
        tabs[next].focus();
      }
    });
  });

  /* ---------- 곡으로 추천 ---------- */
  var songInput = document.getElementById('song-input');
  var songSubmit = document.getElementById('song-submit');

  // 공백만 입력하면 입력 없음으로 보고 버튼 비활성 유지
  songInput.addEventListener('input', function () {
    songSubmit.disabled = songInput.value.trim() === '';
  });

  // 버튼 클릭 또는 Enter → result.html?type=song&q=입력값
  panelSong.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = songInput.value.trim();
    if (!q) return;
    goTo('result.html?type=song&q=' + encodeURIComponent(q));
  });

  /* ---------- 장르로 추천 ---------- */
  var chipBox = document.getElementById('genre-chips');
  var subBox = document.getElementById('sub-genres');
  var genreSubmit = document.getElementById('genre-submit');
  var panelGenre = panels[1];

  var selected = [];    // 선택한 장르 id (선택한 순서)
  var selectedSubs = {}; // { 장르id: [하위장르id, ...] }

  function chip(label, attrs, isSub) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = isSub ? 'chip chip--sub' : 'chip';
    b.textContent = label;
    b.setAttribute('aria-pressed', 'false');
    for (var k in attrs) b.dataset[k] = attrs[k];
    return b;
  }

  // 큰 장르 태그
  GENRES.forEach(function (g) {
    chipBox.appendChild(chip(g.name, { genre: g.id }, false));
  });

  // 하위 장르 줄 그리기 (선택한 순서대로 쌓임)
  function renderSubs() {
    subBox.innerHTML = '';
    selected.forEach(function (gid) {
      var g = findGenre(gid);
      var row = document.createElement('div');
      row.className = 'sub-row';
      row.innerHTML = '<span class="sub-row__label">' + g.name + ' · 하위 장르 (선택)</span>';
      var box = document.createElement('div');
      box.className = 'chips';
      g.subs.forEach(function (s) {
        var c = chip(s.name, { parent: g.id, sub: s.id }, true);
        if (selectedSubs[gid].indexOf(s.id) !== -1) c.setAttribute('aria-pressed', 'true');
        box.appendChild(c);
      });
      row.appendChild(box);
      subBox.appendChild(row);
    });
    genreSubmit.disabled = selected.length === 0;
  }

  // 큰 장르 선택 / 해제
  chipBox.addEventListener('click', function (e) {
    var c = e.target.closest('.chip');
    if (!c) return;
    var gid = c.dataset.genre;
    var idx = selected.indexOf(gid);
    if (idx === -1) {
      selected.push(gid);
      selectedSubs[gid] = [];
      c.setAttribute('aria-pressed', 'true');
    } else {
      // 해제하면 그 장르의 하위 장르 선택도 함께 해제
      selected.splice(idx, 1);
      delete selectedSubs[gid];
      c.setAttribute('aria-pressed', 'false');
    }
    renderSubs();
  });

  // 하위 장르 선택 / 해제 (선택은 필수 아님)
  subBox.addEventListener('click', function (e) {
    var c = e.target.closest('.chip');
    if (!c) return;
    var list = selectedSubs[c.dataset.parent];
    var i = list.indexOf(c.dataset.sub);
    if (i === -1) list.push(c.dataset.sub); else list.splice(i, 1);
    c.setAttribute('aria-pressed', i === -1 ? 'true' : 'false');
  });

  // 추천받기 → result.html?type=genre&g=장르들&sub=하위장르들
  // 하위 장르를 고르지 않은 장르는 큰 장르 전체 기준으로 추천
  panelGenre.addEventListener('submit', function (e) {
    e.preventDefault();
    if (selected.length === 0) return;
    var subs = [];
    selected.forEach(function (gid) { subs = subs.concat(selectedSubs[gid]); });
    var url = 'result.html?type=genre&g=' + selected.join(',');
    if (subs.length) url += '&sub=' + subs.join(',');
    goTo(url);
  });
})();
