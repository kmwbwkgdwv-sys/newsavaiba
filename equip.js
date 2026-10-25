/* =========================================================
 *  equip.js  ― 装備画面
 *   スロット: 武器 / ベルト / 防具 / 靴（所持している装備だけ装着できる）
 *   キャラ  : キャラガチャで手に入れたキャラを設定（ATK・HP に倍率）
 *   合成    : 同じ装備3つで ❶ → ❷ → ❸（ATK/HP が 1.3倍 / 1.6倍 / 2倍）
 *             ❸を3つで次のレアリティにグレードアップ、レジェンド❸を5つでレジェンド+
 *   レベル  : 設計図とコインで装備のレベルを上げる（いつでもリセットでき、使った分は全部戻る）
 * ========================================================= */
(function () {
  const C = DS.config, S = DS.state, A = DS.art, U = DS.ui;
  const F = C.FUSION;
  const { $, $$, esc, fmt, fmtBig, toast, modal } = U;
  const PLACEHOLDER = { weapon: 'kunai', belt: 'eternalBelt', armor: 'plateArmor', boots: 'eternalBoots' };
  let filter = 'all';

  const card = (p, extra = {}) => U.itemCard(p.item, p.rarity, Object.assign({ lv: p.lv, level: S.itemLevel(p.key) }, extra));
  const slotName = (k) => C.SLOTS.find((s) => s.key === k).name;
  const fullName = (p) => p.def.name + (p.lv ? ' ' + F.marks[p.lv] : '');
  const rName = (k) => S.RARITY[k].name;
  /** レアリティの追加効果の一覧（そのレアリティまでの分は解放済み） */
  function rarityFxHtml(rarity) {
    const rank = S.RARITY[rarity].rank;
    return `<div class="rfx">${C.RARITIES.map((r, i) => {
      const e = C.RARITY_EFFECTS[r.key];
      if (!e) return '';
      return `<span class="rfx-row ${i <= rank ? 'on' : ''}">${U.rarityLabel(r.key)}<em>${esc(e.text)}</em>${i <= rank ? '<b>✓</b>' : ''}</span>`;
    }).join('')}</div>`;
  }
  /** パッシブの説明（エピック以上で発動） */
  function passiveHtml(p) {
    const ps = p.def.passive;
    if (!ps) return '';
    const on = p.rar.rank >= S.RARITY.epic.rank;
    return `<div class="passive ${on ? 'on' : ''}"><small>${on ? 'パッシブ発動中' : 'パッシブ（エピック以上で解放）'}</small><b>${esc(ps.name)}</b><span>${esc(ps.desc)}</span></div>`;
  }

  function render() {
    const el = $('#screen-equip');
    const slotBox = (key) => {
      const s = C.SLOTS.find((x) => x.key === key);
      return `<button class="eslot" data-slot="${key}"><span class="eslot-card" id="eslot-${key}"></span><span class="eslot-label">${s.name}</span></button>`;
    };
    el.innerHTML = `
      <div class="screen-bg equip-bg"></div>
      <div class="screen-scroll">
        <div class="stat-bar">
          <div class="stat"><b class="c-atk">ATK</b><span id="st-atk"></span></div>
          <div class="stat"><b class="c-hp">HP</b><span id="st-hp"></span></div>
          <div class="stat"><b class="c-spd">速度</b><span id="st-spd"></span></div>
        </div>
        <div class="equip-stage">
          <div class="slot-col">${slotBox('weapon')}${slotBox('belt')}</div>
          <button class="equip-hero" id="equip-hero" aria-label="キャラを変更">
            <div class="pedestal"></div><div class="equip-hero-art" id="equip-hero-art"></div>
            <span class="char-chip" id="char-chip"></span>
          </button>
          <div class="slot-col">${slotBox('armor')}${slotBox('boots')}</div>
        </div>
        <div class="effects" id="effects"></div>
        <div class="bp-bar" id="bp-bar"></div>
        <div class="inv">
          <div class="inv-head">
            <span class="inv-title">所持装備</span><small id="inv-count"></small>
            <button class="btn btn-small btn-green best-btn" id="btn-best">おすすめ装備</button>
            <button class="btn btn-small btn-yellow fuse-btn" id="btn-fuse">合成<b class="badge hidden" id="fuse-badge"></b></button>
          </div>
          <div class="chips" id="inv-filter">
            <button class="chip" data-f="all">全て</button>
            ${C.SLOTS.map((s) => `<button class="chip" data-f="${s.key}">${s.name}</button>`).join('')}
          </div>
          <div class="inv-grid" id="inv-grid"></div>
        </div>
      </div>`;
    $$('.eslot', el).forEach((b) => b.addEventListener('click', () => {
      const key = S.data.equipped[b.dataset.slot];
      if (key) openDetail(key);
      else {
        setFilter(b.dataset.slot);
        $('#inv-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        toast(`装備する${C.SLOTS.find((s) => s.key === b.dataset.slot).name}を選んでください`);
      }
    }));
    $$('#inv-filter .chip', el).forEach((c) => c.addEventListener('click', () => setFilter(c.dataset.f)));
    $('#btn-fuse', el).addEventListener('click', openFusion);
    $('#btn-best', el).addEventListener('click', () => {
      const n = S.equipBest();
      toast(n ? '一番強くなる装備に付け替えました' : 'いまの装備が一番強い組み合わせです', n ? 'good' : 'info');
      if (n && DS.sound) DS.sound.play('equip');
    });
    $('#equip-hero', el).addEventListener('click', () => openChars('look'));
    update();
  }

  function setFilter(f) { filter = f; update(); }

  function update() {
    if (!$('#st-atk')) return;
    const st = S.getStats();
    $('#st-atk').textContent = fmtBig(st.atk);
    $('#st-hp').textContent = fmtBig(st.hp);
    $('#st-spd').textContent = fmt(st.spd);

    // キャラ
    const ch = S.charInfo(S.data.char);
    $('#equip-hero-art').innerHTML = A.charSvg(S.data.look);
    $('#char-chip').innerHTML = ch
      ? `${U.rarityLabel(ch.rarity)}<b>${esc(ch.name)}</b><em>×${ch.mult}</em>`
      : '<b>見た目・キャラ変更</b>';

    // スロット
    C.SLOTS.forEach(({ key }) => {
      const eq = S.parseKey(S.data.equipped[key]);
      $('#eslot-' + key).innerHTML = eq
        ? card(eq)
        : `<div class="icard empty">${A.item(PLACEHOLDER[key])}<span class="plus">＋</span></div>`;
    });

    // 発動中の効果
    const lines = [];
    if (ch) {
      lines.push(`<span class="eff good"><i>${esc(ch.name)}</i>ATK・HP ×${ch.mult}</span>`);
      if (ch.skill) lines.push(`<span class="eff skill"><i>${esc(ch.skill.name)}</i>${esc(ch.skill.desc)}</span>`);
    }
    C.SLOTS.forEach(({ key }) => {
      const eq = S.parseKey(S.data.equipped[key]);
      if (!eq) return;
      U.effectLines(eq.item).forEach((e) => lines.push(`<span class="eff ${e.good ? 'good' : 'bad'}"><i>${esc(eq.def.name)}</i>${esc(e.text)}</span>`));
      const re = S.rarityEffects(eq.rarity);
      const parts = [];
      if (re.atk) parts.push(`攻撃 +${re.atk}%`);
      if (re.hp) parts.push(`体力 +${re.hp}%`);
      if (parts.length) lines.push(`<span class="eff rar"><i>${esc(rName(eq.rarity))}</i>${parts.join('・')}</span>`);
      if (re.passive && eq.def.passive) lines.push(`<span class="eff skill"><i>${esc(eq.def.passive.name)}</i>${esc(eq.def.passive.desc)}</span>`);
    });
    $('#effects').innerHTML = lines.length
      ? `<div class="effects-title">装備効果</div><div class="effs">${lines.join('')}</div>`
      : '';

    // 設計図
    $('#bp-bar').innerHTML = `<span class="bp-title">設計図</span>${C.SLOTS.map((s) => `<span class="bp-chip">${A.blueprint(s.key)}<small>${s.name}</small><b>${fmt(S.data.blueprints[s.key] || 0)}</b></span>`).join('')}`;

    // もっと強い装備を持っていたら「おすすめ装備」を光らせる
    $('#btn-best').classList.toggle('pulse', S.equipBest(true) > 0);
    // 合成できる数
    const fusible = S.fusibleList().length;
    $('#fuse-badge').textContent = fusible;
    $('#fuse-badge').classList.toggle('hidden', !fusible);

    // 所持装備リスト
    const list = S.inventoryList();
    const shown = list.filter((x) => filter === 'all' || x.slot === filter);
    const total = list.reduce((a, x) => a + x.count, 0);
    $('#inv-count').textContent = `${total}個`;
    $$('#inv-filter .chip').forEach((c) => c.classList.toggle('active', c.dataset.f === filter));
    const equippedKeys = Object.values(S.data.equipped);
    $('#inv-grid').innerHTML = shown.length
      ? shown.map((x) => card(x, {
        count: x.count, equipped: equippedKeys.includes(x.key),
        tag: S.canFuse(x.key) ? (S.fuseInfo(x.key).kind === 'level' ? '合成可' : 'UP可') : '',
        attrs: `data-key="${x.key}" role="button" tabindex="0"`,
      })).join('')
      : `<p class="inv-empty">この種類の装備はまだ持っていません。<br>ガチャで手に入れよう！</p>`;
    $$('#inv-grid .icard').forEach((c) => c.addEventListener('click', () => openDetail(c.dataset.key)));
  }

  /* ---------- 装備の詳細 ---------- */
  /** レベルアップの欄 */
  function levelHtml(p) {
    const li = S.levelInfo(p.key);
    const slotDef = C.SLOTS.find((s) => s.key === p.slot);
    const statName = U.STAT_NAME[slotDef.stat];
    const now = S.itemValue(p).value;
    const nxt = li.next ? S.itemValue(p, li.lv + 1).value : 0;
    const short = li.next && li.have < li.next.bp ? 'bp' : li.next && S.data.coins < li.next.coins ? 'coin' : '';
    return `<div class="lvbox">
      <div class="lv-top"><b class="lv-now">Lv ${li.lv}<small> / ${li.max}</small></b>
        <span class="lv-bar"><i style="width:${(li.lv - 1) / Math.max(1, li.max - 1) * 100}%"></i></span>
        <span class="lv-have">${A.blueprint(p.slot)}<b>${fmt(li.have)}</b></span></div>
      ${li.next ? `<div class="lv-next">
          <span class="lv-gain">${statName} ${fmtBig(now)} → <b>${fmtBig(nxt)}</b></span>
          <span class="lv-cost ${short === 'bp' ? 'short' : ''}">${A.blueprint(p.slot)}${slotDef.name}の設計図 ×${li.next.bp}</span>
          <span class="lv-cost ${short === 'coin' ? 'short' : ''}">${A.coin()}${fmt(li.next.coins)}</span>
        </div>` : '<div class="lv-next max">最大レベルです</div>'}
      <div class="lv-btns">
        <button class="btn btn-small btn-gray" id="lv-reset" ${li.lv > 1 ? '' : 'disabled'}>リセット</button>
        <button class="btn btn-small btn-blue" id="lv-max" ${li.can ? '' : 'disabled'}>まとめて</button>
        <button class="btn btn-small btn-green" id="lv-up" ${li.can ? '' : 'disabled'}>レベルアップ</button>
      </div>
      ${li.lv > 1 ? `<small class="lv-note">リセットすると 設計図 ×${li.spent.bp} と ${fmt(li.spent.coins)} コインが戻ります</small>`
        : `<small class="lv-note">設計図はステージクリアや7日間限定ミッションで手に入ります。レベルは同じ装備（同じ色・合成段階）みんなで共通です</small>`}
    </div>`;
  }

  function openDetail(key) {
    const p = S.parseKey(key);
    if (!p) return;
    const slotDef = C.SLOTS.find((s) => s.key === p.slot);
    const isEquipped = S.data.equipped[p.slot] === p.key;
    const count = S.data.inventory[p.key] || 0;
    const statName = U.STAT_NAME[slotDef.stat];
    const value = S.itemValue(p).value;

    let compare = '';
    if (!isEquipped) {
      const now = S.getStats();
      const next = S.getStats(Object.assign({}, S.data.equipped, { [p.slot]: p.key }));
      const diffs = ['atk', 'hp', 'spd'].map((k) => [k, next[k] - now[k]]).filter(([, v]) => v !== 0);
      compare = `<div class="compare"><small>装備すると</small>${diffs.length
        ? diffs.map(([k, v]) => `<span class="${v > 0 ? 'up' : 'down'}">${U.STAT_NAME[k]} ${v > 0 ? '+' : '-'}${k === 'spd' ? Math.abs(v) : fmtBig(Math.abs(v))}</span>`).join('')
        : '<span>ステータス変化なし</span>'}</div>`;
    }
    const fi = S.fuseInfo(p.key);
    let fuseInfo = '<div class="fuse-hint max">レジェンド+ が最高ランクです</div>';
    if (fi) {
      const to = S.parseKey(fi.to);
      const label = fi.kind === 'level' ? `合成 ${Math.min(count, fi.need)} / ${fi.need}　→　${F.marks[to.lv]}`
        : `グレードアップ ${Math.min(count, fi.need)} / ${fi.need}　→　${rName(to.rarity)}`;
      fuseInfo = `<div class="fuse-hint ${count >= fi.need ? 'ok' : ''} ${fi.kind !== 'level' ? 'grade' : ''}">${label}（${statName} ${fmtBig(S.itemValue(to).value)}）</div>`;
    }

    const effects = U.effectLines(p.item);
    const buttons = [{ label: 'とじる', cls: 'btn-gray' }];
    if (S.canFuse(p.key)) {
      const to = S.parseKey(fi.to);
      buttons.push({ label: fi.kind === 'level' ? `合成 ${F.marks[to.lv]}` : `${rName(to.rarity)}に`, cls: 'btn-yellow', onClick: () => { const nk = S.fuse(p.key); if (nk) showFused([nk]); } });
    }
    if (isEquipped) {
      if (p.slot !== 'weapon') buttons.push({ label: '外す', cls: 'btn-red', onClick: () => { S.unequip(p.slot); toast(`${p.def.name}を外しました`); } });
    } else {
      buttons.push({ label: '装備する', cls: 'btn-green', onClick: () => { S.equip(p.key); toast(`${fullName(p)}（${p.rar.name}）を装備しました`, 'good'); } });
    }

    const m = modal({
      title: fullName(p),
      body: `
        <div class="detail">
          <div class="detail-card">${card(p)}</div>
          <div class="detail-info">
            <div class="detail-tags">${U.rarityLabel(p.rarity)}<span class="slot-tag">${slotDef.name}</span>${p.lv ? `<span class="slot-tag fz-tag">合成${F.marks[p.lv]} ×${F.mult[p.lv]}</span>` : ''}</div>
            <div class="detail-stat"><b class="c-${slotDef.stat}">${statName}</b><span id="dt-val">+${fmtBig(value)}</span></div>
            ${effects.length ? `<div class="effs">${effects.map((e) => `<span class="eff ${e.good ? 'good' : 'bad'}">${esc(e.text)}</span>`).join('')}</div>` : ''}
            <div class="detail-own">所持数 ×${count}${isEquipped ? '　<b class="eq-mark">装備中</b>' : ''}</div>
          </div>
        </div>
        <p class="detail-desc">${esc(p.def.desc)}</p>
        <div id="lv-wrap">${levelHtml(p)}</div>
        ${passiveHtml(p)}
        <details class="rfx-box"><summary>レアリティの追加効果</summary>${rarityFxHtml(p.rarity)}<p class="note dark">効果の%は、キャラの総合力（ATK・HP）に対する値です。下のレアリティの効果もすべて得られます。</p></details>
        ${fuseInfo}
        ${compare}
        ${isEquipped && p.slot === 'weapon' ? '<p class="note dark center">武器は外せません。別の武器を装備すると入れ替わります。</p>' : ''}`,
      buttons,
    });
    // レベルアップ・リセット（モーダルは開いたまま）
    const bindLv = () => {
      const redraw = () => {
        $('#lv-wrap', m.el).innerHTML = levelHtml(p);
        $('#dt-val', m.el).textContent = '+' + fmtBig(S.itemValue(p).value);
        $('.detail-card', m.el).innerHTML = card(p);
        bindLv();
      };
      $('#lv-up', m.el).addEventListener('click', () => { if (S.levelUp(p.key, 1)) { if (DS.sound) DS.sound.play('levelup'); redraw(); } });
      $('#lv-max', m.el).addEventListener('click', () => { const n = S.levelUp(p.key, 999); if (n) { if (DS.sound) DS.sound.play('levelup'); toast(`レベルが ${n} 上がりました`, 'good'); redraw(); } });
      $('#lv-reset', m.el).addEventListener('click', () => {
        const li = S.levelInfo(p.key);
        if (li.lv <= 1) return;
        modal({
          title: 'レベルリセット',
          body: `<p class="center">${esc(fullName(p))}（${p.rar.name}）を <b>Lv1</b> に戻します。</p>
            <p class="center refund">${A.blueprint(p.slot)} ${slotName(p.slot)}の設計図 ×${li.spent.bp}　${A.coin()} ${fmt(li.spent.coins)}<br><small>が戻ってきます</small></p>`,
          buttons: [{ label: 'やめる', cls: 'btn-gray' },
            { label: 'リセットする', cls: 'btn-red', onClick: () => { const r = S.resetLevel(p.key); if (r) toast(`設計図 ×${r.bp} と ${fmt(r.coins)} コインが戻りました`, 'good'); redraw(); } }],
        });
      });
    };
    bindLv();
  }

  /* ---------- 合成 ---------- */
  const RULES = `同じ装備（種類・色・合成段階がすべて同じもの）どうしでだけ合成できます。<br>
    ${F.need}つで ${F.marks.slice(1).map((m, i) => `${m}（${F.mult[i + 1]}倍）`).join(' → ')}<br>
    ${F.marks[F.max]}を${F.gradeNeed}つで次のレアリティにグレードアップ、レジェンド${F.marks[F.max]}を${F.plusNeed}つでレジェンド+<br>
    <small>レベルを上げた装備が合成でなくなると、レベルは自動でリセットされ、設計図とコインが戻ります</small>`;
  function fusionBody() {
    const list = S.fusibleList();
    if (!list.length) {
      return `<p class="center">合成できる装備はありません。</p><p class="note dark center">${RULES}</p>`;
    }
    return `<p class="note dark center">${RULES}</p>
      <div class="fuse-list">${list.map((x) => {
        const fi = S.fuseInfo(x.key);
        const next = S.parseKey(fi.to);
        const times = Math.floor(x.count / fi.need);
        return `<div class="fuse-row ${fi.kind !== 'level' ? 'grade' : ''}">
          <div class="fuse-from">${card(x, { cls: 'mini' })}<span>×${fi.need}</span></div>
          <span class="fuse-arrow">➜</span>
          <div class="fuse-to">${card(next, { cls: 'mini' })}</div>
          <div class="fuse-name"><b>${esc(fullName(next))}</b><small>${fi.kind === 'level' ? x.rar.name : `${x.rar.name} → ${next.rar.name}`}・${times}回できます</small></div>
          <button class="btn btn-yellow btn-small" data-key="${x.key}">${fi.kind === 'level' ? '合成' : 'UP'}</button>
        </div>`;
      }).join('')}</div>`;
  }
  function openFusion() {
    const m = modal({
      title: '合成', cls: 'modal-wide', body: fusionBody(),
      buttons: [
        { label: 'とじる', cls: 'btn-gray' },
        { label: 'まとめて合成', cls: 'btn-yellow', disabled: !S.fusibleList().length, onClick: () => { const made = S.fuseAll(); if (made.length) showFused(made); } },
      ],
    });
    const bind = () => $$('.fuse-row .btn', m.el).forEach((b) => b.addEventListener('click', () => {
      const nk = S.fuse(b.dataset.key);
      if (!nk) return;
      m.close();
      showFused([nk]);
    }));
    bind();
  }
  function showFused(keys) {
    const counts = {};
    keys.forEach((k) => { counts[k] = (counts[k] || 0) + 1; });
    const best = keys.map(S.parseKey).sort((a, b) => b.rar.rank - a.rar.rank || b.lv - a.lv)[0];
    const graded = keys.some((k) => S.parseKey(k).lv === 0);
    if (DS.sound) DS.sound.play(graded ? 'gachaBig' : 'levelup');
    modal({
      title: graded ? 'グレードアップ！' : '合成成功！',
      cls: best.lv >= 3 || graded ? 'modal-fz3' : '',
      body: `<div class="fused">${Object.keys(counts).map((k) => {
        const p = S.parseKey(k);
        return `<div class="fused-item">${card(p)}<b>${esc(fullName(p))}</b>${U.rarityLabel(p.rarity)}${counts[k] > 1 ? `<small>×${counts[k]}</small>` : ''}</div>`;
      }).join('')}</div>`,
      buttons: [{ label: 'OK', cls: 'btn-yellow' }],
    });
  }

  /* ---------- キャラ（見た目とスキルは別々に選べる） ---------- */
  function openChars(startTab) {
    let tab = startTab === 'skill' ? 'skill' : 'look';
    let sel = (tab === 'look' ? S.data.look : S.data.char) || '';
    const m = modal({ title: 'キャラ', cls: 'modal-wide', body: '<div id="char-body"></div>', buttons: [{ label: 'とじる', cls: 'btn-gray' }] });
    const nameOf = (k) => (k ? C.CHARACTERS[k].name : '初期キャラ');
    const draw = () => {
      const list = S.charList();
      const info = sel ? S.charInfo(sel) : null;
      const owned = !sel || (S.data.chars[sel] || 0) > 0;
      const cur = (tab === 'look' ? S.data.look : S.data.char) || '';
      const isCur = cur === sel;
      let action;
      if (tab === 'look') {
        action = isCur ? '<button class="btn btn-gray btn-small" disabled>この見た目にしています</button>'
          : '<button class="btn btn-green btn-small" id="char-set">この見た目にする</button>';
      } else {
        action = isCur ? '<button class="btn btn-gray btn-small" disabled>このキャラを使っています</button>'
          : owned ? '<button class="btn btn-green btn-small" id="char-set">このキャラのスキルを使う</button>'
            : '<button class="btn btn-gray btn-small" disabled>未所持（キャラガチャで入手）</button>';
      }
      const skillCh = S.charInfo(S.data.char);
      $('#char-body', m.el).innerHTML = `
        <div class="char-now">
          <span><small>見た目</small><b>${esc(nameOf(S.data.look))}</b></span>
          <span><small>スキル・強さ</small><b>${skillCh ? `${esc(skillCh.name)}（ATK・HP×${skillCh.mult}）` : 'なし（×1）'}</b></span>
        </div>
        <div class="seg char-tabs">
          <button class="seg-btn ${tab === 'look' ? 'active' : ''}" data-t="look">見た目</button>
          <button class="seg-btn ${tab === 'skill' ? 'active' : ''}" data-t="skill">スキル・強さ</button>
        </div>
        <p class="note dark center char-hint">${tab === 'look'
          ? '見た目はどのキャラにも、いつでも変えられます（持っていなくてもOK）'
          : '持っているキャラのスキルと ATK・HP の倍率を使えます。見た目とは別に選べます'}</p>
        <div class="char-pick">
          <div class="char-big">${U.charCard(sel, { dim: tab === 'skill' && !owned })}</div>
          <div class="char-info">
            ${info ? `<div class="detail-tags">${U.rarityLabel(info.rarity)}${tab === 'skill' && !owned ? '<span class="slot-tag">未所持</span>' : ''}</div><b class="char-name">${esc(info.name)}</b>
              ${tab === 'skill' ? `<span class="char-mult">ATK・HP <b>×${info.mult}</b></span>
              ${info.skill ? `<span class="char-skill"><em>${info.skill.passive ? '常時発動' : `特殊スキル（${info.skill.cd}秒ごと）`}</em><b>${esc(info.skill.name)}</b>${esc(info.skill.desc)}</span>` : '<small class="char-noskill">特殊スキルはレア以上のキャラから</small>'}` : ''}
              <small>${esc(info.desc)}</small>`
            : `<b class="char-name">初期キャラ</b>${tab === 'skill' ? '<span class="char-mult">倍率なし・スキルなし</span>' : ''}`}
            ${action}
          </div>
        </div>
        <div class="char-grid">
          <button class="char-cell ${!sel ? 'sel' : ''}" data-k="">${U.charCard('', { cls: 'mini', equipped: !cur })}<small>初期</small></button>
          ${list.map((c) => `<button class="char-cell ${sel === c.key ? 'sel' : ''}" data-k="${c.key}">
            ${U.charCard(c.key, { cls: 'mini', count: tab === 'skill' ? c.count : 0, equipped: cur === c.key, dim: tab === 'skill' && !c.count })}<small>${esc(c.name)}</small></button>`).join('')}
        </div>`;
      $$('.char-tabs .seg-btn', m.el).forEach((b) => b.addEventListener('click', () => {
        tab = b.dataset.t; sel = (tab === 'look' ? S.data.look : S.data.char) || ''; draw();
      }));
      $$('.char-cell', m.el).forEach((b) => b.addEventListener('click', () => { sel = b.dataset.k; draw(); }));
      const setBtn = $('#char-set', m.el);
      if (setBtn) setBtn.addEventListener('click', () => {
        if (tab === 'look') { S.setLook(sel || null); toast(`見た目を ${nameOf(sel)} にしました`, 'good'); }
        else { S.setChar(sel || null); toast(sel ? `${nameOf(sel)} のスキルを使います` : 'キャラのスキルを外しました', 'good'); }
        if (DS.sound) DS.sound.play('equip');
        draw();
      });
    };
    draw();
  }

  DS.equip = { render, update, openChars };
})();
