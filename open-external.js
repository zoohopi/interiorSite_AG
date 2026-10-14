// 카카오톡 앱 안 브라우저에서 열리면 바깥 브라우저로 다시 엽니다.
// (앱 안 브라우저는 영상 자동재생 등이 막혀 사이트가 제대로 보이지 않습니다)
// 갤럭시: 크롬으로 열기 → 안 되면 기본 브라우저 / 아이폰: 기본 브라우저(사파리)로 열기
(function () {
  var ua = navigator.userAgent;
  if (!/KAKAOTALK/i.test(ua)) return;
  var url = location.href;
  var external = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url);
  if (/android/i.test(ua)) {
    location.href = 'intent://' + url.replace(/^https?:\/\//, '') + '#Intent;scheme=' + location.protocol.replace(':', '') + ';package=com.android.chrome;end';
    setTimeout(function () { if (!document.hidden) location.href = external; }, 1500);
  } else {
    location.href = external;
  }
  // 그래도 카카오톡 안에 남아 있으면 바깥 브라우저로 여는 버튼을 보여 줍니다.
  addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (document.hidden) return;
      var bar = document.createElement('a');
      bar.href = external;
      bar.textContent = '영상이 보이지 않으면 여기를 눌러 브라우저로 열어 주세요 ↗';
      bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:200;padding:14px 16px;border-radius:14px;background:#1d3a28;color:#fff;font:600 13px/1.5 "Noto Sans KR",sans-serif;text-align:center;text-decoration:none;box-shadow:0 10px 30px #0008';
      document.body.append(bar);
    }, 2500);
  });
})();
