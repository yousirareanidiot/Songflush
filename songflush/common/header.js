/* Songflush 공통 상단 메뉴 (GNB)
 * 모든 페이지의 <header id="site-header"> 안에 메뉴를 그린다.
 * 메뉴를 바꿀 때는 이 파일만 고치면 된다.
 */
(function () {
  var MENU = [
    { label: '추천받기',  href: 'recommend-song.html' },
    { label: '장르 사전', href: 'genres.html' },
    { label: '내 보관함', href: 'library.html' }
  ];

  var header = document.getElementById('site-header');
  if (!header) return;

  var current = location.pathname.split('/').pop() || 'index.html';

  var links = MENU.map(function (item) {
    var active = item.href === current ? ' aria-current="page" class="is-current"' : '';
    return '<li><a href="' + item.href + '"' + active + '>' + item.label + '</a></li>';
  }).join('');

  header.innerHTML =
    '<div class="gnb__inner">' +
      '<a href="index.html" class="gnb__logo" aria-label="Songflush 메인으로">Songflush</a>' +
      '<nav aria-label="주 메뉴"><ul class="gnb__menu">' + links + '</ul></nav>' +
    '</div>';
})();
