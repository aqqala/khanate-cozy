const TILE = 16;
const SCALE = 3;
const MAP_W = 40;
const MAP_H = 30;
const GAME_W = MAP_W * TILE;
const GAME_H = MAP_H * TILE;

const PALETTE = {
  soil: 0x8f6b47,
  path: 0xb89466,
  grass: 0x7b9d52,
  grassDark: 0x628240,
  felt: 0xdcc8a2,
  feltShadow: 0xb79f7b,
  wood: 0x7a5135,
  woodDark: 0x4f3424,
  stone: 0x8e8e8e,
  turquoise: 0x3db5b5,
  ember: 0xff8a3c,
  ember2: 0xffd17d,
  uiBg: 0x2f2330,
  uiBorder: 0xb48a5f,
};

const TEXTS = {
  kz: {
    time: "Уақыт",
    hintHelp: "H — көмек",
    lang: "Тіл",
    interact: "E — Әрекет",
    close: "E — Жабу",
    help: "Қозғалу: WASD/←↑→↓\nӘрекет: E\nТіл: KZ/RU",
    npcName: "Саудагер",
    npcLines: [
      "Сәлем, жолаушы! Дала кеші қандай тыныш...",
      "Бүгін теріден жасалған әдемі белдік пен шай бар.",
      "Ертең жәрмеңке ашылады, тағы соғасың ба?",
    ],
    chest: "Сандықта көне оюлы әшекей жатыр.",
    well: "Құдықтан салқын су алдың.",
    fire: "Ошақтың жалыны жылу береді.",
    yurt: "Киіз үй іші жайлы әрі жылы.",
  },
  ru: {
    time: "Время",
    hintHelp: "H — помощь",
    lang: "Язык",
    interact: "E — Действие",
    close: "E — Закрыть",
    help: "Движение: WASD/←↑→↓\nДействие: E\nЯзык: KZ/RU",
    npcName: "Торговец",
    npcLines: [
      "Привет, путник! Степной вечер сегодня особенно тихий.",
      "У меня есть чай и ремни с орнаментом.",
      "Завтра откроется ярмарка, заглядывай снова.",
    ],
    chest: "В сундуке лежит старинное украшение.",
    well: "Ты набрал прохладной воды из колодца.",
    fire: "Огонь очага мягко согревает руки.",
    yurt: "Внутри юрты уютно и пахнет войлоком.",
  },
};

class CozyScene extends Phaser.Scene {
  constructor() {
    super("cozy");
    this.lang = "kz";
    this.timePhase = 0;
    this.activeInteraction = null;
    this.dialogOpen = false;
    this.dialogIndex = 0;
  }

  preload() {
    this.createTextures();
    this.createPlayerAnimations();
  }

  create() {
    this.cameras.main.setBackgroundColor("#8f6b47");
    this.physics.world.setBounds(0, 0, GAME_W, GAME_H);

    this.buildGround();
    this.decorateNature();
    this.createObjects();
    this.createPlayer();
    this.createUI();
    this.registerControls();

    this.dayOverlay = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x2a2e5a, 0).setScrollFactor(0).setDepth(500);
  }

  createTextures() {
    const makeTile = (key, painter) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      painter(g);
      g.generateTexture(key, TILE, TILE);
      g.destroy();
    };

    makeTile("tile-soil", (g) => {
      g.fillStyle(PALETTE.soil, 1).fillRect(0, 0, TILE, TILE);
      g.fillStyle(PALETTE.woodDark, 0.2);
      for (let i = 0; i < 8; i += 1) g.fillRect(Phaser.Math.Between(0, 14), Phaser.Math.Between(0, 14), 2, 2);
    });

    makeTile("tile-path", (g) => {
      g.fillStyle(PALETTE.path, 1).fillRect(0, 0, TILE, TILE);
      g.fillStyle(0xc9a97d, 1);
      for (let x = 0; x < TILE; x += 4) g.fillRect(x, Phaser.Math.Between(2, 12), 2, 2);
    });

    makeTile("tile-grass", (g) => {
      g.fillStyle(PALETTE.grass, 1).fillRect(0, 0, TILE, TILE);
      g.fillStyle(PALETTE.grassDark, 1);
      for (let i = 0; i < 18; i += 1) g.fillRect(Phaser.Math.Between(0, 15), Phaser.Math.Between(0, 15), 1, 1);
    });

    makeTile("grass-clump", (g) => {
      g.fillStyle(0x000000, 0);
      g.fillRect(0, 0, TILE, TILE);
      g.fillStyle(0x87b55d, 1);
      g.fillRect(4, 8, 2, 7);
      g.fillRect(7, 6, 2, 9);
      g.fillRect(10, 8, 2, 7);
      g.fillStyle(0x6f9a4e, 1);
      g.fillRect(5, 10, 1, 4);
      g.fillRect(8, 8, 1, 6);
      g.fillRect(11, 10, 1, 4);
    });

    const makeObject = (key, w, h, draw) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      draw(g);
      g.generateTexture(key, w, h);
      g.destroy();
    };

    makeObject("yurt", 64, 64, (g) => {
      g.fillStyle(PALETTE.feltShadow, 1).fillRect(8, 20, 48, 28);
      g.fillStyle(PALETTE.felt, 1).fillRect(10, 18, 44, 26);
      g.fillStyle(PALETTE.wood, 1).fillRect(28, 30, 8, 14);
      g.fillStyle(PALETTE.woodDark, 1).fillRect(30, 34, 4, 10);
      g.fillStyle(PALETTE.turquoise, 1).fillRect(18, 24, 28, 2);
      g.fillStyle(PALETTE.felt, 1).fillRect(16, 12, 32, 10);
      g.fillStyle(PALETTE.feltShadow, 1).fillRect(18, 14, 28, 8);
      g.fillStyle(PALETTE.turquoise, 1).fillRect(20, 10, 24, 2);
    });

    makeObject("chest", 20, 16, (g) => {
      g.fillStyle(PALETTE.woodDark, 1).fillRect(2, 6, 16, 8);
      g.fillStyle(PALETTE.wood, 1).fillRect(2, 4, 16, 4);
      g.fillStyle(PALETTE.turquoise, 1).fillRect(9, 7, 2, 4);
    });

    makeObject("well", 26, 24, (g) => {
      g.fillStyle(PALETTE.stone, 1).fillRect(2, 12, 22, 10);
      g.fillStyle(0x727272, 1).fillRect(4, 14, 18, 6);
      g.fillStyle(PALETTE.wood, 1).fillRect(4, 4, 3, 8);
      g.fillStyle(PALETTE.wood, 1).fillRect(19, 4, 3, 8);
      g.fillStyle(PALETTE.woodDark, 1).fillRect(6, 4, 14, 2);
      g.fillStyle(PALETTE.turquoise, 1).fillRect(8, 15, 10, 3);
    });

    makeObject("market", 34, 28, (g) => {
      g.fillStyle(PALETTE.wood, 1).fillRect(4, 10, 26, 14);
      g.fillStyle(PALETTE.woodDark, 1).fillRect(6, 12, 22, 10);
      g.fillStyle(PALETTE.felt, 1).fillRect(2, 4, 30, 8);
      g.fillStyle(PALETTE.turquoise, 1).fillRect(2, 4, 30, 2);
    });

    for (let i = 0; i < 3; i += 1) {
      makeObject(`fire-${i}`, 16, 18, (g) => {
        g.fillStyle(PALETTE.woodDark, 1).fillRect(2, 13, 12, 3);
        g.fillStyle(PALETTE.ember, 1).fillRect(6, 8 - i, 4, 6 + i);
        g.fillStyle(PALETTE.ember2, 1).fillRect(7, 10 - i, 2, 4 + i);
      });
    }

    makeObject("flag", 8, 20, (g) => {
      g.fillStyle(PALETTE.woodDark, 1).fillRect(1, 1, 2, 18);
      g.fillStyle(PALETTE.turquoise, 1).fillRect(3, 3, 4, 6);
      g.fillStyle(PALETTE.felt, 1).fillRect(4, 4, 2, 2);
    });

    const mkCharFrame = (key, body, accent, dir = "down", step = 0) => {
      makeObject(key, 16, 24, (g) => {
        g.fillStyle(0x2f1f19, 1).fillRect(6, 1, 4, 4);
        g.fillStyle(0xd8bb8f, 1).fillRect(6, 5, 4, 3);
        g.fillStyle(body, 1).fillRect(5, 8, 6, 7);
        g.fillStyle(accent, 1).fillRect(5, 11, 6, 2);
        const armX = dir === "left" ? 4 : dir === "right" ? 10 : 4;
        g.fillStyle(0xcaa67f, 1).fillRect(armX, 9, 2, 5);
        const shift = step === 1 ? 1 : step === 2 ? -1 : 0;
        const lY = 15 + (step === 1 ? 1 : 0);
        const rY = 15 + (step === 2 ? 1 : 0);
        g.fillStyle(0x4f3424, 1).fillRect(5 + shift, lY, 2, 6);
        g.fillRect(9 - shift, rY, 2, 6);
      });
    };

    ["down", "up", "left", "right"].forEach((dir) => {
      mkCharFrame(`player-${dir}-0`, 0x5f6fb8, 0x3db5b5, dir, 0);
      mkCharFrame(`player-${dir}-1`, 0x5f6fb8, 0x3db5b5, dir, 1);
      mkCharFrame(`player-${dir}-2`, 0x5f6fb8, 0x3db5b5, dir, 2);

      mkCharFrame(`npc-${dir}-0`, 0x8d5a3e, 0xd9b67d, dir, 0);
      mkCharFrame(`npc-${dir}-1`, 0x8d5a3e, 0xd9b67d, dir, 1);
      mkCharFrame(`npc-${dir}-2`, 0x8d5a3e, 0xd9b67d, dir, 2);
    });
  }

  createPlayerAnimations() {
    ["down", "up", "left", "right"].forEach((dir) => {
      this.anims.create({
        key: `walk-${dir}`,
        frames: [{ key: `player-${dir}-0` }, { key: `player-${dir}-1` }, { key: `player-${dir}-2` }],
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: `npc-idle-${dir}`,
        frames: [{ key: `npc-${dir}-0` }, { key: `npc-${dir}-1` }, { key: `npc-${dir}-0` }],
        frameRate: 3,
        repeat: -1,
      });
    });

    this.anims.create({
      key: "fire-flicker",
      frames: [{ key: "fire-0" }, { key: "fire-1" }, { key: "fire-2" }, { key: "fire-1" }],
      frameRate: 6,
      repeat: -1,
    });
  }

  buildGround() {
    this.pathGrid = new Set();
    for (let x = 7; x < 33; x += 1) this.pathGrid.add(`${x},18`);
    for (let y = 12; y < 24; y += 1) this.pathGrid.add(`18,${y}`);

    for (let y = 0; y < MAP_H; y += 1) {
      for (let x = 0; x < MAP_W; x += 1) {
        const key = this.pathGrid.has(`${x},${y}`) ? "tile-path" : Math.random() < 0.25 ? "tile-grass" : "tile-soil";
        this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, key).setOrigin(0.5).setDepth(0);
      }
    }
  }

  decorateNature() {
    this.grassSprites = [];
    for (let i = 0; i < 60; i += 1) {
      const gx = Phaser.Math.Between(1, MAP_W - 2) * TILE + TILE / 2;
      const gy = Phaser.Math.Between(1, MAP_H - 2) * TILE + TILE / 2;
      if (this.pathGrid.has(`${Math.floor(gx / TILE)},${Math.floor(gy / TILE)}`)) continue;
      const s = this.add.image(gx, gy, "grass-clump").setDepth(gy + 2).setOrigin(0.5, 1);
      this.tweens.add({ targets: s, x: gx + Phaser.Math.Between(-2, 2), yoyo: true, duration: Phaser.Math.Between(1400, 2200), repeat: -1 });
      this.grassSprites.push(s);
    }
  }

  createObjects() {
    this.interactables = [];
    this.obstacles = this.physics.add.staticGroup();

    const yurt = this.add.image(12 * TILE, 12 * TILE, "yurt").setOrigin(0.5, 0.9).setDepth(12 * TILE);
    this.obstacles.create(yurt.x, yurt.y - 10, "yurt").setOrigin(0.5, 0.9).refreshBody();
    this.interactables.push({ sprite: yurt, radius: 45, type: "yurt" });

    const chest = this.obstacles.create(14 * TILE, 20 * TILE, "chest").setOrigin(0.5, 0.9).refreshBody();
    chest.setDepth(chest.y);
    this.interactables.push({ sprite: chest, radius: 30, type: "chest" });

    const well = this.obstacles.create(24 * TILE, 15 * TILE, "well").setOrigin(0.5, 0.9).refreshBody();
    well.setDepth(well.y);
    this.interactables.push({ sprite: well, radius: 34, type: "well" });

    const market = this.obstacles.create(30 * TILE, 20 * TILE, "market").setOrigin(0.5, 0.9).refreshBody();
    market.setDepth(market.y);

    this.npc = this.physics.add.sprite(30 * TILE, 17 * TILE, "npc-down-0").setOrigin(0.5, 0.9);
    this.npc.body.setSize(8, 10).setOffset(4, 13);
    this.npc.play("npc-idle-down");
    this.tweens.add({ targets: this.npc, y: this.npc.y - 1, duration: 900, yoyo: true, repeat: -1 });
    this.interactables.push({ sprite: this.npc, radius: 36, type: "npc" });

    const fire = this.add.sprite(18 * TILE + 6, 17 * TILE + 5, "fire-0").setOrigin(0.5, 0.9).setDepth(17 * TILE + 5);
    fire.play("fire-flicker");
    this.interactables.push({ sprite: fire, radius: 30, type: "fire" });

    const flag = this.add.image(20 * TILE, 14 * TILE, "flag").setOrigin(0.5, 0.9).setDepth(14 * TILE);
    this.tweens.add({ targets: flag, angle: { from: -5, to: 5 }, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.physics.add.collider(this.npc, this.obstacles);
  }

  createPlayer() {
    this.player = this.physics.add.sprite(18 * TILE, 22 * TILE, "player-down-0").setOrigin(0.5, 0.9);
    this.player.body.setSize(8, 10).setOffset(4, 13);
    this.physics.add.collider(this.player, this.obstacles);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, GAME_W, GAME_H);
    this.lastDir = "down";
  }

  createUI() {
    this.hud = this.add.container(8, 8).setScrollFactor(0).setDepth(700);
    const panel = this.add.rectangle(0, 0, 220, 62, PALETTE.uiBg, 0.9).setOrigin(0).setStrokeStyle(2, PALETTE.uiBorder, 1);
    this.timeText = this.add.text(10, 8, "", { fontFamily: "monospace", fontSize: "12px", color: "#f7e7c7" });
    this.helpText = this.add.text(10, 24, "", { fontFamily: "monospace", fontSize: "12px", color: "#d8c6a6" });
    this.langBtn = this.add.text(130, 40, "KZ/RU", { fontFamily: "monospace", fontSize: "11px", color: "#7be0dd", backgroundColor: "#3e2f40", padding: { x: 6, y: 3 } })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.toggleLang());

    this.hud.add([panel, this.timeText, this.helpText, this.langBtn]);

    this.prompt = this.add.text(GAME_W / 2, GAME_H - 40, "", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#ffe5bf",
      backgroundColor: "#2d2330",
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(710).setVisible(false);

    this.message = this.add.text(GAME_W / 2, GAME_H - 74, "", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#f0dbc0",
      backgroundColor: "#37283a",
      padding: { x: 8, y: 6 },
      align: "center",
      wordWrap: { width: 480 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(710).setVisible(false);

    this.dialogPanel = this.add.rectangle(GAME_W / 2, GAME_H - 105, 560, 96, PALETTE.uiBg, 0.95)
      .setStrokeStyle(2, PALETTE.uiBorder)
      .setScrollFactor(0)
      .setDepth(705)
      .setVisible(false);
    this.dialogText = this.add.text(GAME_W / 2 - 260, GAME_H - 140, "", {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#f3e2c3",
      wordWrap: { width: 520 },
      lineSpacing: 4,
    }).setScrollFactor(0).setDepth(706).setVisible(false);

    this.helpPanel = this.add.rectangle(GAME_W - 130, 48, 230, 56, PALETTE.uiBg, 0.92)
      .setStrokeStyle(2, PALETTE.uiBorder)
      .setScrollFactor(0)
      .setDepth(700)
      .setVisible(false);
    this.helpPanelText = this.add.text(GAME_W - 236, 24, "", { fontFamily: "monospace", fontSize: "12px", color: "#f6e2bf" })
      .setScrollFactor(0)
      .setDepth(701)
      .setVisible(false);

    this.syncLanguage();
  }

  registerControls() {
    this.keys = this.input.keyboard.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D",
      up2: Phaser.Input.Keyboard.KeyCodes.UP,
      down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      interact: "E",
      help: "H",
      langK: "K",
      langR: "R",
    });

    this.input.keyboard.on("keydown-E", () => this.handleInteract());
    this.input.keyboard.on("keydown-H", () => this.toggleHelp());
    this.input.keyboard.on("keydown-K", () => { this.lang = "kz"; this.syncLanguage(); });
    this.input.keyboard.on("keydown-R", () => { this.lang = "ru"; this.syncLanguage(); });
  }

  toggleLang() {
    this.lang = this.lang === "kz" ? "ru" : "kz";
    this.syncLanguage();
  }

  syncLanguage() {
    const t = TEXTS[this.lang];
    this.helpText.setText(`${t.hintHelp} · ${t.lang}: KZ/RU`);
    this.helpPanelText.setText(t.help);
  }

  handleInteract() {
    if (this.dialogOpen) {
      this.dialogIndex += 1;
      const lines = TEXTS[this.lang].npcLines;
      if (this.dialogIndex >= lines.length) {
        this.dialogOpen = false;
        this.dialogPanel.setVisible(false);
        this.dialogText.setVisible(false);
      } else {
        this.dialogText.setText(`${TEXTS[this.lang].npcName}:\n${lines[this.dialogIndex]}\n\n${TEXTS[this.lang].close}`);
      }
      return;
    }

    if (!this.activeInteraction) return;
    const t = TEXTS[this.lang];
    let msg = "";

    if (this.activeInteraction.type === "npc") {
      this.dialogOpen = true;
      this.dialogIndex = 0;
      this.dialogPanel.setVisible(true);
      this.dialogText.setVisible(true);
      this.dialogText.setText(`${t.npcName}:\n${t.npcLines[0]}\n\n${t.close}`);
      return;
    }

    if (this.activeInteraction.type === "chest") msg = t.chest;
    if (this.activeInteraction.type === "well") msg = t.well;
    if (this.activeInteraction.type === "fire") msg = t.fire;
    if (this.activeInteraction.type === "yurt") msg = t.yurt;

    if (msg) {
      this.message.setText(msg).setVisible(true);
      this.time.delayedCall(1700, () => this.message.setVisible(false));
    }
  }

  toggleHelp() {
    const next = !this.helpPanel.visible;
    this.helpPanel.setVisible(next);
    this.helpPanelText.setVisible(next);
  }

  update(_, dt) {
    const speed = 70;
    const body = this.player.body;
    body.setVelocity(0);

    const left = this.keys.left.isDown || this.keys.left2.isDown;
    const right = this.keys.right.isDown || this.keys.right2.isDown;
    const up = this.keys.up.isDown || this.keys.up2.isDown;
    const down = this.keys.down.isDown || this.keys.down2.isDown;

    if (left) body.setVelocityX(-speed);
    else if (right) body.setVelocityX(speed);
    if (up) body.setVelocityY(-speed);
    else if (down) body.setVelocityY(speed);

    body.velocity.normalize().scale(speed);

    let moving = false;
    if (Math.abs(body.velocity.x) > 0 || Math.abs(body.velocity.y) > 0) moving = true;

    if (moving) {
      if (Math.abs(body.velocity.x) > Math.abs(body.velocity.y)) this.lastDir = body.velocity.x > 0 ? "right" : "left";
      else this.lastDir = body.velocity.y > 0 ? "down" : "up";
      this.player.play(`walk-${this.lastDir}`, true);
    } else {
      this.player.anims.stop();
      this.player.setTexture(`player-${this.lastDir}-0`);
      this.player.y += Math.sin(this.time.now / 420) * 0.02;
    }

    this.player.setDepth(this.player.y);
    this.npc.setDepth(this.npc.y);

    this.updateInteractionPrompt();
    this.updateDayCycle(dt);
  }

  updateInteractionPrompt() {
    this.activeInteraction = null;
    let nearestDist = Infinity;

    this.interactables.forEach((obj) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.sprite.x, obj.sprite.y);
      if (d < obj.radius && d < nearestDist) {
        nearestDist = d;
        this.activeInteraction = obj;
      }
    });

    if (this.dialogOpen) {
      this.prompt.setVisible(false);
      return;
    }

    if (this.activeInteraction) {
      this.prompt.setText(TEXTS[this.lang].interact).setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }
  }

  updateDayCycle(dt) {
    this.timePhase += dt * 0.00008;
    const wave = (Math.sin(this.timePhase) + 1) / 2;
    const alpha = Phaser.Math.Linear(0.1, 0.45, wave);
    this.dayOverlay.setFillStyle(0x25305a, alpha);
    const hours = Math.floor(14 + wave * 8);
    const mins = Math.floor(((wave * 8) % 1) * 60);
    this.timeText.setText(`${TEXTS[this.lang].time}: ${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  parent: "game-container",
  pixelArt: true,
  roundPixels: true,
  backgroundColor: "#8f6b47",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: SCALE,
  },
  scene: [CozyScene],
});
