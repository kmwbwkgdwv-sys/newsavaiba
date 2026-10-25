/* =========================================================
 *  config.js  ― ゲーム全体の設定値
 *  数値バランスの調整はこのファイルだけで完結するようにしています。
 * ========================================================= */
window.DS = window.DS || {};

DS.config = {
  // ---- タイトル（好きな名前に変えてください） ----
  GAME_TITLE: 'SURVIVORS ARENA',
  GAME_SUBTITLE: 'サバイバーズ・アリーナ',

  // ---- セーブ ----
  SAVE_KEY: 'survivors-arena/save/v1',
  CLOUD_KEY: 'survivors-arena/cloud/v1',

  // ---- コイン ----
  START_COINS: 0,              // 初回起動時のコイン（配布なし）
  DEBUG_COIN_BUTTON: false,    // true にするとコイン横に「＋」ボタン（テスト用）が出る
  DEBUG_COIN_AMOUNT: 30000,

  // ---- はじめのチケットと解放 ----
  START_TICKETS: { item10: 1, char10: 0 },   // 最初に装備ガチャ10連無料チケットを1枚
  // ステージ1をクリアするまでは、ガチャからコモン・アンコモン・レアだけが出る（リセマラ防止）
  // その間はエピックの分がレアになる（コモン65% / アンコモン20% / レア15%）
  EARLY_RARITIES: ['common', 'uncommon', 'rare'],
  FULL_RARITY_UNLOCK: 0,       // このステージ（0=ステージ1）をクリアすると全レアリティ解放
  CHAR_TICKET_STAGE: 1,        // このステージ（1=ステージ2）をクリアするとキャラガチャ10連無料チケット

  // ---- プレイヤー基礎ステータス（装備なしの値） ----
  BASE_STATS: { atk: 100, hp: 1000, spd: 100 },

  // ---- マルチプレイ ----
  MAX_PLAYERS: 4,
  NET: {
    // 'auto'  : PeerJS（オンライン）を使い、読み込めない時はローカルに切替
    // 'online': PeerJS のみ
    // 'local' : 同じブラウザのタブ同士だけで通信（開発・テスト用）
    // URL に ?net=local を付けても切り替えられます
    MODE: 'auto',
    PEERJS_URLS: [
      'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
      'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js',
    ],
    PEER_OPTIONS: {},          // 自前の PeerServer を使う時は { host, port, path, secure } を指定
    ID_PREFIX: 'survivors-arena-v1-lobby-',
    HEARTBEAT_MS: 3000,
    TIMEOUT_MS: 30000,
  },

  // ---- ガチャ ----
  GACHA: {
    singleCost: 3000,
    multiCost: 30000,
    multiCount: 10,
  },
  // 出る確率（%）。装備ガチャからはレジェンドは出ない（合成でだけ作れる）
  GACHA_RATES: {
    item: { common: 65, uncommon: 20, rare: 10, epic: 5 },
    char: { common: 65, uncommon: 20, rare: 12, epic: 2.5, legend: 0.45, legendPlus: 0.05 },
  },

  // ---- レアリティ ----
  // 武器・ベルトは atk が、防具・靴は hp が上がります（合成・レベルアップでさらに上がる）。
  // HP はもともと高い（基礎1000）ので、HP の上昇値は ATK の5倍にしてあります。
  // 各レアリティの素の強さは「1つ下のレアリティの❸（2倍）」より強くなるようにしてあります。
  RARITIES: [
    { key: 'common',     name: 'コモン',      atk: 60,   hp: 300,   color: '#ffffff' },
    { key: 'uncommon',   name: 'アンコモン',  atk: 130,  hp: 650,  color: '#3ccf5a' },
    { key: 'rare',       name: 'レア',        atk: 280,  hp: 1400,  color: '#3c8dff' },
    { key: 'epic',       name: 'エピック',    atk: 600,  hp: 3000,  color: '#a74dff' },
    { key: 'legend',     name: 'レジェンド',  atk: 1300, hp: 6500, color: '#ffc21a' },
    { key: 'legendPlus', name: 'レジェンド+', atk: 4000, hp: 20000, color: '#ff3b3b' },
  ],
  // レアリティごとの追加効果。値はキャラの総合力（ATK・HP）に対する%。
  // 下のレアリティの効果もすべて持つ（例：レジェンドならアンコモン〜レジェンドの効果を全部得られる）
  RARITY_EFFECTS: {
    common:     null,
    uncommon:   { atk: 5,  text: '攻撃 +5%' },
    rare:       { hp: 5,   text: '体力 +5%' },
    epic:       { passive: true, text: 'パッシブ追加' },
    legend:     { atk: 10, hp: 10, text: '攻撃・体力 +10%' },
    legendPlus: { skill: true, text: 'スキル追加（近日実装）' },
  },

  // ---- 装備スロット ----
  SLOTS: [
    { key: 'weapon', name: '武器',   stat: 'atk' },
    { key: 'belt',   name: 'ベルト', stat: 'atk' },
    { key: 'armor',  name: '防具',   stat: 'hp'  },
    { key: 'boots',  name: '靴',     stat: 'hp'  },
  ],

  // ガチャ画面に並べる順番（上から 武器 → 防具 → ベルト → 靴）
  GACHA_ORDER: ['weapon', 'armor', 'belt', 'boots'],

  // ---- 装備アイテム ----
  // 見た目と名前はレアリティ共通。背景と ATK/HP だけがレアリティで変わります。
  // bonus  : 装備としての補正。atk・hp は「総合力に対する%」、spd は速度、dmgTaken は受けるダメージの%
  // aura   : 一定範囲内の敵へのデバフ
  // passive: エピック以上で使えるパッシブ（何もしなくても発動する効果）
  ITEMS: {
    kunai: {
      slot: 'weapon', name: 'クナイ',
      desc: '遠くの敵に単発の攻撃をすばやく連射する。',
      weapon: { pattern: 'single', range: 'long' },
      traits: ['遠距離', '単発連射'],
      passive: { name: '拡散クナイ', desc: '5秒に1度、クナイを5個拡散して投げる', cd: 5, count: 5, dmg: 1.0 },
    },
    shotgun: {
      slot: 'weapon', name: 'ショットガン',
      desc: '弾が扇状に拡散する。近距離ほど多くの弾が当たり、高いダメージを出せる。',
      weapon: { pattern: 'spread', range: 'short' },
      traits: ['近距離', '拡散'],
      passive: { name: '全方位射撃', desc: '10秒に1度、全方向に弾を撃つ（拡散が広い）', cd: 10, count: 28, dmg: 0.8 },
    },
    lightsaber: {
      slot: 'weapon', name: 'ライトセイバー',
      desc: '向いている方向（90度くらい）に剣を振る。★が上がるたびに攻撃範囲が広がる。',
      weapon: { pattern: 'swing', range: 'short' },
      traits: ['近距離', '前方斬り'],
      passive: { name: '大回転斬り', desc: '15秒に1度、全方向に大きく回転斬りをする', cd: 15, range: 2.2, dmg: 3.0 },
    },
    revolver: {
      slot: 'weapon', name: 'リボルバー',
      desc: '0.8秒ごとに近くの敵1体を撃ち抜く。',
      weapon: { pattern: 'single', range: 'middle' },
      traits: ['単発', '中距離'],
      passive: { name: 'デュアルリボルバー', desc: '10秒に1度、3秒間デュアルリボルバーになる（攻撃2倍）', cd: 10, dur: 3 },
    },
    plateArmor: {
      slot: 'armor', name: '鎧',
      desc: '耐久力は高いが、重くて移動速度が落ちる。',
      bonus: { hp: 30, spd: -10 },
      passive: { name: 'ガードシールド', desc: '60秒に1度、どんな攻撃でも1発は防ぐシールドを張る', cd: 60 },
    },
    leatherArmor: {
      slot: 'armor', name: 'レザーアーマー',
      desc: '鎧より耐久は落ちるが、身軽に動ける。',
      bonus: { hp: 15 },
      passive: { name: 'しなやかな革', desc: 'ダメージを受けるたびに、そのダメージを3%軽減する', cut: 3 },
    },
    eternalSuit: {
      slot: 'armor', name: 'エターナルバトルスーツ',
      desc: 'とても軽く動きやすいバトルスーツ。',
      bonus: { spd: 10, hp: 10 },
      passive: { name: '不死の加護', desc: '1度だけ、倒れても復活できる（復活時3秒無敵）', inv: 3, hp: 0.5 },
    },
    destroyerCoat: {
      slot: 'armor', name: '破壊者コート',
      desc: '守りを捨てて攻撃に振り切った黒いコート。',
      bonus: { hp: -30, atk: 30 },
      passive: { name: '背水の陣', desc: 'HPが少ないほど攻撃力が上がる（最大3倍）', max: 3 },
    },
    stellaBelt: {
      slot: 'belt', name: 'ステラベルト',
      desc: '星の力を宿すベルト。周囲の敵の攻撃速度を下げる。',
      aura: { radius: 160, enemyAtkSpd: -10 },
      passive: { name: 'メテオ', desc: '45秒に1度、隕石を落として敵に当てる', cd: 45, r: 170, dmg: 12 },
    },
    eternalBelt: {
      slot: 'belt', name: 'エターナルベルト',
      desc: '尽きない力を秘めたベルト。攻撃力が上がる。',
      bonus: { atk: 30 },
      passive: { name: '不屈', desc: '60秒に1度、攻撃を受けたときから3秒間無敵になる', cd: 60, dur: 3 },
    },
    destroyerBelt: {
      slot: 'belt', name: '破壊者ベルト',
      desc: '破壊の力を引き出すトゲ付きベルト。',
      bonus: { hp: -30, atk: 30 },
      passive: { name: '破壊衝動', desc: '受けるダメージが10%増える代わりに、攻撃力 +10%', dmgTaken: 10, atk: 10 },
    },
    fashionBelt: {
      slot: 'belt', name: 'ファッションベルト',
      desc: 'おしゃれ重視のベルト。動きにくく、守りも弱くなる。',
      bonus: { spd: -20, dmgTaken: 10 },
      passive: { name: 'みんなで元気', desc: 'どこにいても、味方と自分のHPを毎秒1%回復する', heal: 0.01 },
    },
    eternalBoots: {
      slot: 'boots', name: 'エターナルブーツ',
      desc: '羽のように軽いブーツ。移動速度が上がる。',
      bonus: { spd: 10 },
      passive: { name: '再生', desc: '毎秒HPを0.5%回復する', heal: 0.005 },
    },
    frostBoots: {
      slot: 'boots', name: 'フロストブーツ',
      desc: '冷気をまとうブーツ。自分は遅くなるが、周囲の敵も凍えて遅くなる。',
      bonus: { spd: -15 },
      aura: { radius: 160, enemySpd: -5 },
      passive: { name: '絶対零度', desc: '10秒に1度、一番近い敵を完全に凍らせて動けなくする（中ボス・ボス以外）', cd: 10, dur: 5 },
    },
    destroyerFoot: {
      slot: 'boots', name: '破壊者フットアーマー',
      desc: '重い鉄のすね当て。攻撃に力が乗る。',
      bonus: { atk: 30, hp: -30 },
      passive: { name: '弔い合戦', desc: 'ダウンしている味方が多いほどダメージが高くなる（最大4倍）', max: 4 },
    },
    militaryBoots: {
      slot: 'boots', name: '軍用ブーツ',
      desc: '頑丈な軍用ブーツ。体力は上がるが重い。',
      bonus: { hp: 50, spd: -20 },
      passive: { name: '鍛錬', desc: '経験値の獲得量 +10%', xp: 10 },
    },
  },

  // ---- 合成 ----
  // 同じ装備（種類・レアリティ・合成段階が同じ）を3つで1段階上に。❸が最大。
  // mult: 合成段階ごとの ATK/HP 倍率（合成していない状態から見て）
  // ❸を3つ集めると次のレアリティ（素）にグレードアップ。レジェンド❸を5つでレジェンド+。
  FUSION: { need: 3, max: 3, mult: [1, 1.3, 1.6, 2], marks: ['', '❶', '❷', '❸'], gradeNeed: 3, plusNeed: 5 },

  // ---- 装備のレベルアップ（設計図とコイン） ----
  // Lv n → n+1 に 設計図 bp(n) 枚（その装備の種類の設計図）と コイン coins(n) が必要
  // レベルが1上がるごとに、その装備の ATK・HP が「素の値 × perLevel」ずつ上がる
  // リセットするといつでも使った設計図とコインが全部返ってくる
  LEVELS: {
    max: { common: 10, uncommon: 20, rare: 30, epic: 40, legend: 50, legendPlus: 60 },
    perLevel: 0.04,
    bp: (lv) => lv,
    coins: (lv) => 150 * lv,
  },
  BLUEPRINTS: { weapon: '武器の設計図', armor: '防具の設計図', belt: 'ベルトの設計図', boots: '靴の設計図' },

  // ---- ステージクリア報酬（クリアするたびにもらえる） ----
  // コイン = 倒した敵の数 × killCoin、ランダム設計図（武器・防具・ベルト・靴のどれかになる）、ランダム装備
  // 先のステージほど、たくさん・いいレアリティの装備が出る（%）
  STAGE_DROPS: {
    killCoin: 1,
    table: [
      { upTo: 10, bp: 10, items: 1, rates: { common: 80, uncommon: 20 } },
      { upTo: 20, bp: 15, items: 1, rates: { common: 55, uncommon: 35, rare: 10 } },
      { upTo: 30, bp: 20, items: 2, rates: { common: 35, uncommon: 40, rare: 22, epic: 3 } },
      { upTo: 40, bp: 25, items: 2, rates: { uncommon: 45, rare: 45, epic: 10 } },
      { upTo: 50, bp: 30, items: 3, rates: { uncommon: 30, rare: 52, epic: 18 } },
    ],
  },

  // ---- キャラクター ----
  // キャラガチャで手に入り、装備画面で設定。レアリティが高いほど ATK と HP の倍率が高い。
  CHAR_MULT: { common: 1.2, uncommon: 1.5, rare: 1.8, epic: 2.2, legend: 3.0, legendPlus: 5.0 },
  // キャラガチャはステージ2クリアで解放（CHAR_TICKET_STAGE と同じステージ）
  // 見た目はキャラを持っていなくても、ステージをクリアしていなくても、いつでも変更できる
  CHARACTERS: {
    smoke:   { rarity: 'common',   name: 'スモーク',   desc: '髭がよく似合うイケおじ。' },
    jasper:  { rarity: 'common',   name: 'ジャスパー', desc: 'オレンジ髪のスパイ。' },
    aiko:    { rarity: 'common',   name: 'アイコ',     desc: '黒ひげのおじさん。' },
    patty:   { rarity: 'common',   name: 'パティー',   desc: 'ぱさぱさの赤髪。' },
    johnson: { rarity: 'uncommon', name: 'ジョンソン', desc: '白髪のイケおじ。' },
    jay:     { rarity: 'uncommon', name: 'ジェイ',     desc: '青い髪の怖いお姉さん。' },
    seed:    { rarity: 'uncommon', name: 'シード',     desc: '14歳くらいの金髪の男の子。' },
    charlotte: { rarity: 'uncommon', name: 'シャーロット', desc: '海外のお嬢様。' },
    widow:   { rarity: 'rare',     name: 'ウィドウ',   desc: '黒い服を着た怖い女性。',
               skill: { name: 'ブラックヴェール', cd: 30, dur: 10, enemySpd: -10, desc: '10秒間、すべての敵の移動速度 -10' } },
    kitties: { rarity: 'rare',     name: 'キティース', desc: '服を着た二足歩行の猫。',
               skill: { name: 'ヒールドローン', passive: true, radius: 400, rate: 1, heal: 0.01, desc: '回復ドローンがいつも飛んでいて、近くの味方か自分の中で一番HPが少ない人を毎秒1%回復（常に発動）' } },
    duck:    { rarity: 'rare',     name: 'ダック',     desc: '二足歩行の黄色いアヒル。',
               skill: { name: 'ダッシュ', cd: 30, dur: 5, spd: 30, desc: '5秒間、自分の移動速度 +30%' } },
    large:   { rarity: 'epic',     name: 'ラージ',     desc: '二足歩行のロボット。',
               skill: { name: 'アイアンボディ', cd: 30, dur: 3, desc: '3秒間、自分が無敵になる' } },
    freya:   { rarity: 'epic',     name: 'フレイヤ',   desc: '茶髪の弓使い。',
               skill: { name: 'アローレイン', cd: 60, radius: 400, dmg: 3, desc: '自分から一定範囲内の敵全員に矢を放つ' } },
    sword:   { rarity: 'legend',   name: 'ソード',     desc: '金髪の女性剣士。',
               skill: { name: '剣聖', passive: true, saberRange: 1.5, desc: 'ライトセイバー使用中、攻撃範囲が1.5倍（常に発動）' } },
    gunman:  { rarity: 'legend',   name: 'ガンマン',   desc: '西部のガンマン。',
               skill: { name: 'ファストドロー', cd: 30, dur: 8, rate: 2, desc: '8秒間、武器の攻撃速度が2倍' } },
    // レジェンド+（ATK・HP ×5）
    akagi:   { rarity: 'legendPlus', name: 'アカギ', desc: '白髪で黒と赤のスーツを着たイケおじ。',
               // w・h：落とす長方形の大きさ（横はプレイヤー10体分）/ delay：落ちてくるまでの秒数
               skill: { name: 'ギャンブルダイス', cd: 30, w: 440, h: 300, delay: 0.9,
                 dice: [35, 25, 20, 15, 4.5, 0.5],   // 1〜6の目が出る確率（%）
                 desc: 'サイコロを振り、出た目 × ATK のダメージを与える長方形を、自分を中心に上から落とす（範囲はプレイヤー10体分）' } },
  },

  // ---- 引き継ぎ（Firebase） ----
  // README の手順で Firebase を作り、apiKey と databaseURL を貼り付けると
  // 「プレイヤーID + 4桁パスワード」でデータを別の端末に引き継げるようになります。
  CLOUD: {
    // ↓ Firebase の apiKey を '' の間に貼り付ける（例: 'AIzaSyB...'）
    apiKey: 'AIzaSyDNDeSkWsKiPrQmf3m78kkZnd7s_vAqaCk',
    // ↓ Realtime Database の URL を '' の間に貼り付ける（例: 'https://xxxx-default-rtdb.asia-southeast1.firebasedatabase.app'）
    databaseURL: 'https://dadasabaiba-d19b3-default-rtdb.asia-southeast1.firebasedatabase.app',
    emailDomain: 'player.survivors-arena.game',   // 内部用（メールは送られません）
    autoSaveSec: 15,
  },

  // 最初から持っている装備（武器は外せないので必ず1つ）
  STARTER_ITEMS: [{ item: 'kunai', rarity: 'common', equip: true }],

  // ---- ステージ（5つのエリア × 10ステージ = 50ステージ） ----
  // 前のステージをクリアすると次のステージが遊べるようになります。
  BIOMES: [
    { key: 'meadow',  name: '草原', accent: '#5fd35a', desc: 'ゾンビと狼がうろつく、のどかな草原。',
      names: ['はじまりの草原', '風の丘', '花畑の小道', 'きのこの森', '小川のほとり', '古い風車', '蜂蜜の森', '霧の湿原', '竜の牧場', '森の聖域'] },
    { key: 'desert',  name: '砂漠', accent: '#ffb547', desc: '炎狼やサソリがひそむ灼熱の砂漠。',
      names: ['灼熱の砂漠', '砂嵐の谷', 'サソリの巣', 'ピラミッドの入口', 'サボテン街道', 'スフィンクスの門', '怪鳥の岩山', '幻のオアシス', '砂に埋もれた神殿', '冥府の門'] },
    { key: 'snow',    name: '氷',   accent: '#7cd3ff', desc: '氷狼の大群が吹雪の中から襲ってくる雪原。',
      names: ['凍てつく雪原', '吹雪の峠', '氷の湖', 'ふくろうの森', '氷結の海岸', '氷の洞窟', '白銀の城門', 'ペンギン王国', '吹雪の目', '氷竜の巣'] },
    { key: 'volcano', name: '火山', accent: '#ff6a3d', desc: '溶岩が流れる灼熱地帯。敵の攻撃が激しい。',
      names: ['怒れる火山', '溶岩の川', 'マグマの洞窟', '地獄の門', '火とかげの谷', '不死鳥の巣', '灼熱の海岸', '噴火口', '炎の城', '火竜の玉座'] },
    { key: 'ruins',   name: '廃墟', accent: '#b07cff', desc: '月明かりの下、亡霊たちがさまよう廃墟。',
      names: ['月夜の廃墟都市', '亡霊の路地', '騎士の墓所', '古代の遺跡', '蜘蛛の塔', '吸血鬼の館', '影の神殿', '骨竜の墓場', '機械仕掛けの城', '冥王の玉座'] },
  ],
  STAGES: [],   // ↑ から自動で作られます（このファイルの一番下）

  // ---- 運営からのプレゼント（ロビー左上のプレゼントボックス） ----
  // after: このステージ数をクリアすると受け取れる（1 = ステージ1をクリアしたら）
  // id はプレゼントごとに別の名前にしてください（受け取ったかどうかの記録に使います）
  PRESENTS: [
    { id: 'thanks-1', title: 'ゲームプレイありがとうございます', text: 'ステージ1クリアおめでとうございます！運営からのささやかなプレゼントです。これからも楽しんでください。', coins: 30000, after: 1 },
  ],

  // ---- 7日間限定ミッション（引き継ぎコードを発行した日からスタート） ----
  // 1日目・2日目…はその日にログインすると解放。7日23時間59分59秒で消える
  // type: login（ログイン日数）/ stage（ステージ n をクリア）/ kills（敵を倒した合計）/ pulls（ガチャを引いた合計）
  //       charPulls（キャラガチャを引いた合計）/ fuse（合成した回数）/ levelUp（装備をレベルアップした回数）/ clears（ステージクリアの合計）
  // reward: coins（コイン）/ bp（ランダム設計図）/ ticket（item10・char10）/ tool（どうぐ）
  LIMITED: {
    durationMs: (8 * 24 * 3600 - 1) * 1000,
    days: [
      [{ type: 'login', n: 1, reward: { coins: 300 } }, { type: 'stage', n: 1, reward: { bp: 10 } }, { type: 'kills', n: 3000, reward: { coins: 300 } }, { type: 'pulls', n: 20, reward: { bp: 10 } }],
      [{ type: 'login', n: 2, reward: { coins: 300 } }, { type: 'stage', n: 3, reward: { bp: 10 } }, { type: 'kills', n: 6000, reward: { coins: 300 } }, { type: 'pulls', n: 30, reward: { bp: 10 } }],
      [{ type: 'login', n: 3, reward: { coins: 300 } }, { type: 'stage', n: 5, reward: { bp: 10 } }, { type: 'kills', n: 9000, reward: { coins: 300 } }, { type: 'fuse', n: 3, reward: { bp: 10 } }],
      [{ type: 'login', n: 4, reward: { coins: 300 } }, { type: 'stage', n: 7, reward: { bp: 10 } }, { type: 'kills', n: 12000, reward: { coins: 300 } }, { type: 'levelUp', n: 5, reward: { bp: 10 } }],
      [{ type: 'login', n: 5, reward: { coins: 300 } }, { type: 'stage', n: 9, reward: { bp: 10 } }, { type: 'kills', n: 15000, reward: { coins: 300 } }, { type: 'charPulls', n: 10, reward: { bp: 10 } }],
      [{ type: 'login', n: 6, reward: { coins: 300 } }, { type: 'stage', n: 11, reward: { bp: 10 } }, { type: 'kills', n: 18000, reward: { coins: 300 } }, { type: 'pulls', n: 50, reward: { bp: 10 } }],
      [{ type: 'login', n: 7, reward: { coins: 300 } }, { type: 'stage', n: 13, reward: { bp: 10 } }, { type: 'kills', n: 21000, reward: { coins: 300 } }, { type: 'clears', n: 20, reward: { bp: 10 } }],
    ],
    // クリアしたミッションの数に応じたごほうび
    milestones: [
      { n: 3, reward: { coins: 3000 } },
      { n: 6, reward: { bp: 20 } },
      { n: 10, reward: { ticket: 'item10' } },
      { n: 15, reward: { bp: 40 } },
      { n: 20, reward: { tool: 'epicBox' } },
      { n: 25, reward: { ticket: 'char10' } },
      { n: 28, reward: { coins: 50000 } },
    ],
  },

  // ---- どうぐ（ロビー左上の「どうぐ」から使う） ----
  TOOLS: {
    epicBox: { name: 'エピック装備選択BOX', desc: 'エピック装備（武器・防具・ベルト・靴）の中から好きなものを1つ選んで手に入れる', pick: 'epic' },
  },

  // ---- アカウントレベル ----
  // ステージをクリアするたびに経験値がもらえ、レベルが上がります（最大99）。
  // 先のステージほど多くもらえ、レベルが上がるほど次のレベルまでの経験値が増えます。
  // ステージ1〜50を1回ずつクリアすると、だいたいレベル40くらいになります。
  ACCOUNT: {
    maxLevel: 99,
    clearXp: (no) => 50 + 25 * no,                          // ステージ no をクリアしたときの経験値
    need: (lv) => Math.round(40 + 6 * Math.pow(lv, 1.6)),    // レベル lv → lv+1 に必要な経験値
  },

  // ロビー内のプレイヤー枠の色（P1〜P4）
  PLAYER_COLORS: ['#ff5a5f', '#3fa9ff', '#39d17a', '#ffc93c'],
};

// ステージの一覧を作る（BIOMES の名前を順番に並べる）
DS.config.STAGES = DS.config.BIOMES.flatMap((b, bi) => b.names.map((name, i) => ({
  key: 's' + (bi * 10 + i + 1), no: bi * 10 + i + 1, biome: b.key, area: b.name, name,
  diff: Math.min(5, bi + 1), desc: b.desc, accent: b.accent,
})));
