/* =========================================================
 *  main.js  ― 起動処理・上部バー・下部ナビゲーション
 * ========================================================= */
(function () {
  const C = DS.config, S = DS.state, A = DS.art, U = DS.ui;
  const { $, $$, esc, fmt, fmtBig, toast, modal } = U;

  /**
   * ゲーム本編との接続口。
   * 出撃カウントダウンの後に呼ばれます。true を返すと「準備中」表示を出しません。
   *   DS.hooks.onGameStart = ({ stage, members, selfId, isHost, session, loadout }) => { ...; return true; };
   */
  DS.hooks = DS.hooks || { onGameStart: null };

  let current = 1; // 0:ガチャ 1:ロビー 2:装備
  let lastChar;

  function go(i) {
    current = i;
    $('#screens-track').style.transform = `translateX(${-i * 100 / 3}%)`;
    $$('.nav-btn').forEach((b) => b.classList.toggle('active', +b.dataset.screen === i));
    $$('.screen').forEach((s, idx) => s.setAttribute('aria-hidden', idx !== i));
    if (i === 0) DS.gacha.update();
    if (i === 2) DS.equip.update();
  }

  function updateTop() {
    const st = S.getStats();
    $('#profile-name').textContent = S.data.name;
    const face = S.data.icon || S.data.look;
    if (lastChar !== face) { lastChar = face; $('#profile-face').innerHTML = A.charFace(face); }
    $('#profile-btn').classList.toggle('no-code', !DS.cloud.status().hasAccount);
    // チケットがあればガチャのボタンに印
    const tk = (S.data.tickets.item10 || 0) + (S.charGachaUnlocked() ? S.data.tickets.char10 || 0 : 0);
    let nb = $('.nav-btn[data-screen="0"] .badge');
    if (!nb) { nb = document.createElement('b'); nb.className = 'badge nav-badge'; $('.nav-btn[data-screen="0"]').appendChild(nb); }
    nb.textContent = tk; nb.classList.toggle('hidden', !tk);
    $('#top-atk').textContent = fmtBig(st.atk);
    $('#top-hp').textContent = fmtBig(st.hp);
    // アカウントレベル（アイコンの下）
    const acc = S.accountInfo();
    $('#profile-lv').textContent = 'Lv ' + acc.lv;
    const cv = $('#coin-value');
    const old = Number(cv.dataset.v || S.data.coins);
    cv.textContent = fmt(S.data.coins);
    cv.dataset.v = S.data.coins;
    if (old !== S.data.coins) { cv.classList.remove('bump'); void cv.offsetWidth; cv.classList.add('bump'); }
  }

  /** はじめの案内：装備ガチャ10連無料チケット / キャラガチャチケット */
  function onboarding() {
    const t = S.data.tickets || {};
    if (t.item10 > 0 && !S.data.flags.ticketShown) {
      S.data.flags.ticketShown = true; S.persist();
      modal({
        title: 'プレゼント',
        closable: false,
        body: `<div class="gift"><span class="gift-ic">${A.chest()}</span>
          <b>装備ガチャ10連無料チケット</b>を手に入れた！
          <p class="note dark center">まずはガチャを引いて装備をそろえよう。<br>（ステージ1をクリアするまでは、コモン・アンコモン・レアが出ます）</p></div>`,
        buttons: [{ label: 'ガチャを引きに行く', cls: 'btn-pink', onClick: () => { go(0); DS.gacha.setMode('item'); } }],
      });
    }
  }

  function init() {
    $('#coin-icon').innerHTML = A.coin();
    $$('.nav-icon').forEach((n) => { n.innerHTML = A.navIcon(n.dataset.icon); });
    $$('.nav-btn').forEach((b) => b.addEventListener('click', () => go(+b.dataset.screen)));
    $('#profile-btn').addEventListener('click', () => DS.cloud.openProfile());

    const plus = $('#coin-plus');
    if (C.DEBUG_COIN_BUTTON) {
      plus.addEventListener('click', () => { S.addCoins(C.DEBUG_COIN_AMOUNT); toast(`テスト用に ${fmt(C.DEBUG_COIN_AMOUNT)} コイン追加しました`, 'good'); });
    } else plus.remove();

    DS.lobby.render();
    DS.gacha.render();
    DS.equip.render();
    updateTop();
    go(current);

    S.onChange(() => { updateTop(); DS.gacha.update(); DS.equip.update(); DS.lobby.updateMissionBadge(); DS.lobby.refreshStage(); });
    $('#profile-face').innerHTML = A.charFace(S.data.icon || S.data.look);
    DS.cloud.onChange(() => updateTop());
    document.documentElement.classList.add('ready');
    DS.cloud.init(onboarding);
    // 7日間限定ミッション：ログインした日を記録（開いたまま日付が変わったときも）
    S.touchLogin();
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') S.touchLogin(); });
    setInterval(() => { S.touchLogin(); DS.lobby.updateMissionBadge(); }, 60000);
    if (DS.sound) DS.sound.bgm('lobby');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
