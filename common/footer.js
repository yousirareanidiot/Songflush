/* Songflush 공통 푸터
 * 모든 페이지의 <footer id="site-footer"> 안에 내용을 그린다.
 */
(function () {
  var footer = document.getElementById('site-footer');
  if (!footer) return;

  footer.innerHTML =
    '<div class="footer__inner">' +
      '<span class="footer__name">Songflush</span>' +
      '<span class="footer__copy">© 2026 Songflush. All rights reserved.</span>' +
    '</div>';
})();
