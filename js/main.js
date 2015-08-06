(function() {

// Still in progress...

var boot = {
	preload: function() {
		this.game.load.image('loading', 'assets/graphics/loading.png');
		this.game.load.image('loading2', 'assets/graphics/loading2.png');
	},
	create: function() {
		this.game.state.start('load');
	}
};

var load = {
	preload: function() {
		this.fac = this.game.world.width/650;

		preloading2 = this.game.add.sprite(this.game.world.width/2, this.game.world.height/2, 'loading2');
		preloading2.x -= (preloading2.width*this.fac)/2;
		preloading2.scale.setTo(this.fac, this.fac);

		preloading = this.game.add.sprite((this.game.world.width/2), (this.game.world.height/2)+4, 'loading');
		preloading.x -= (preloading.width*this.fac)/2;
		preloading.scale.setTo(this.fac, this.fac);

		this.game.load.setPreloadSprite(preloading);

		this.game.load.image('fog', 'assets/graphics/fog.png');
		this.game.load.image('exit', 'assets/graphics/exit.png');
		this.game.load.image('floor', 'assets/graphics/floor.png');
		this.game.load.image('rock1', 'assets/graphics/rock1.png');
		this.game.load.image('rock2', 'assets/graphics/rock2.png');
		this.game.load.image('wall-bottom', 'assets/graphics/wall-bottom.png');
		this.game.load.image('wall-bottom-corner-left', 'assets/graphics/wall-bottom-corner-left.png');
		this.game.load.image('wall-bottom-corner-right', 'assets/graphics/wall-bottom-corner-right.png');
		this.game.load.image('wall-left', 'assets/graphics/wall-left.png');
		this.game.load.image('wall-right', 'assets/graphics/wall-right.png');
		this.game.load.image('wall-top', 'assets/graphics/wall-top.png');
		this.game.load.image('wall-top-corner-left', 'assets/graphics/wall-top-corner-left.png');
		this.game.load.image('wall-top-corner-right', 'assets/graphics/wall-top-corner-right.png');

		this.game.load.audio('hit', 'assets/sound/hit.wav');
		this.game.load.audio('win', 'assets/sound/win.wav');
		this.game.load.audio('cave-theme', 'assets/sound/cave-theme.mp3');

		this.game.load.spritesheet('player', 'assets/graphics/player.png', 19, 25);
		this.game.load.spritesheet('zubat-down', 'assets/graphics/zubat-down.png', 24, 20);
	},
	create: function() {
		this.game.state.start('menu');
	}
};

var menu = {
	create: function() {
		this.fac = this.game.world.width/650;

		var size1 = 55*this.fac;
		var size2 = 40*this.fac;
		var size3 = 35*this.fac;

		var name_text = 'Damn You Zubats!';
		var instructions_text = 'Press the arrows to\nmove around the cave.\n Beware of the Zubats!';

		this.name_text_obj = this.game.add.text(this.game.world.centerX, 200*this.fac, name_text, {font: size1+"px 'Luckiest Guy'", fill: '#FFFFFF', align: 'center'});
		this.name_text_obj.anchor.setTo(0.5, 0.5);

		this.instructions_text_obj = this.game.add.text(this.game.world.centerX, 340*this.fac, instructions_text, {font: size3+"px 'Luckiest Guy'", fill: '#FFFFFF'});
		this.instructions_text_obj.anchor.setTo(0.5, 0.5);

		this.start_text = this.game.add.text(this.game.world.centerX, 465*this.fac, 'Press "up" to play!', {font: size3+"px 'Luckiest Guy'", fill: '#FFFFFF'});
		this.start_text.anchor.setTo(0.5, 0.5);

		this.game.add.tween(this.start_text).to({ angle:1 }, 200).to({ angle:-1 }, 200).loop().start();
		this.game.add.tween(this.name_text_obj.scale).to({ x: 1.15, y: 1.15 }, 300).to({ x: 1, y: 1 }, 300).loop().start();

		this.cursors = this.game.input.keyboard.createCursorKeys();		
	},
	update: function() {
		if (this.cursors.up.isDown) this.game.state.start('main');
	}
};

var main = {
	preload: function() {
		this.resize = this.game.world.width/650;
		this.w = 24*this.resize;
		this.startX = 61*this.resize;
		this.startY = 61*this.resize;
	},
	create: function() {
		this.win_se = this.game.add.sound('win', 0.4, false);
		this.hurt_se = this.game.add.sound('hit', 0.2, false);
		this.bgm = this.game.add.sound('cave-theme', 0.4, true);
		this.bgm.play();

		this.score = 0;
		this.caveNumber = 1;
		this.playerHp = 100;
		this.playerMaxHp = 100;
		this.playerLevel = 1;

		this.moveTime = this.game.time.now + 150;
		this.cursors = this.game.input.keyboard.createCursorKeys();

		this.setHpText();
		this.setLevelText();

		this.dungeonSprites = [];
		this.dungeonMap = [];

		this.setCave();

		this.playing = false;

		this.setNewLevel();
	},
	setFog: function() {
		if (this.fg1) this.fg1.destroy();

		var x = this.startX - 13*this.resize;
		var y = this.startY - 20*this.resize;
		
		this.fg1 = this.game.add.sprite(x, y, 'fog');
		this.fg1.scale.setTo(this.resize, this.resize);
	},
	setNewLevel: function() {
		this.playing = false;

		this.playerHp = this.playerMaxHp;
		this.updateHpText();
		this.updateLevelText();
		
		this.setDungeon();
		this.setPlayer(0, 21);
		this.setExit(21, 0)
		
		this.playing = true;
	},
	setExitText: function() {
		if (this.exit_text) this.exit_text.destroy();

		var c = this.getCoords(21, 0);
		var size = 1*this.resize;
		this.exit_text = this.game.add.text(c.x + 10*this.resize, c.y-10*this.resize, 'exit', {font: size+'em "Luckiest Guy"', fill: '#FFFFFF'});
		this.exit_text.anchor.setTo(0.5, 0.5);

		this.game.add.tween(this.exit_text.scale).to({ x: 1.5, y: 1.5 }, 300).to({ x: 1, y: 1 }, 300).loop().start()
	},
	updateLevelText: function() {
		this.level_text.text = 'Cave #'+this.caveNumber;
	},
	setLevelText: function() {
		var x = this.game.world.width/2;
		var y = 23*this.resize;
		var size = 2*this.resize;
		this.level_text = this.game.add.text(x, y, 'Cave #'+this.caveNumber, {font: size+'em "Luckiest Guy"', fill: '#FFFFFF'});
		this.level_text.anchor.setTo(0.5, 0.5);
	},
	updateHpText: function() {
		this.hp_text.text = 'HP: '+this.playerHp+" / "+this.playerMaxHp;
	},
	setHpText: function() {
		var x = 110*this.resize;
		var y = 623*this.resize;
		var size = 2*this.resize;
		this.hp_text = this.game.add.text(x, y, 'HP: 100 / 100', {font: size+'em "Luckiest Guy"', fill: '#FFFFFF'});
		this.hp_text.anchor.setTo(0.5, 0.5);
	},
	setCave: function() {
		var fac = this.resize;
		var w = this.w;
		var startX = this.startX;
		var startY = this.startY;

		// Floor
		this.cave = [];
		for (var i = 0; i < 22; i++) {
			this.dungeonSprites[i] = [];
			this.dungeonMap[i] = [];

			this.cave[i] = [];
			for (var j = 0; j < 22; j++) {
				this.game.add.sprite(startX + i*w, startY + j*w, 'floor').scale.setTo(fac, fac);
			}
		}

		// Walls
		var boardFirstX = startX;
		var boardFirstY = startY - w;
		var boardScndX = startX + 22*w;
		var boardScndY = startY + 22*w;

		this.game.add.sprite(startX-w, boardFirstY, 'wall-top-corner-left').scale.setTo(fac, fac);
		this.game.add.sprite(boardScndX, boardFirstY, 'wall-top-corner-right').scale.setTo(fac, fac);
		this.game.add.sprite(startX-w, boardScndY, 'wall-bottom-corner-left').scale.setTo(fac, fac);
		this.game.add.sprite(boardScndX, boardScndY, 'wall-bottom-corner-right').scale.setTo(fac, fac);
		
		for (var i = 0; i < 22; i++) {
			this.game.add.sprite(boardFirstX + i*w, boardFirstY, 'wall-top').scale.setTo(fac, fac);
			this.game.add.sprite(boardFirstX + i*w, boardScndY, 'wall-bottom').scale.setTo(fac, fac);
			this.game.add.sprite(boardFirstX - w, boardFirstY + (i+1)*w, 'wall-left').scale.setTo(fac, fac);
			this.game.add.sprite(boardScndX, boardFirstY + (i+1)*w, 'wall-right').scale.setTo(fac, fac);
		}
	},
	getCoords: function(i, j) {
		var x = this.startX + i*this.w;
		var y = this.startY + j*this.w;
		return {x:x, y:y};
	},
	addZubat: function(i, j) {
		var c = this.getCoords(i, j);
		this.dungeonSprites[i][j] = this.game.add.sprite(c.x, c.y, 'zubat-down');
		this.dungeonSprites[i][j].scale.setTo(this.resize, this.resize);
		this.dungeonSprites[i][j].animations.add('act', [0, 1, 2], 5, true);
		this.dungeonSprites[i][j].animations.play('act');
		this.dungeonMap[i][j] = 'Z';
	},
	/* Procedural level generation. Needs to be improved. */
	setDungeon: function() {
		var r, c, s;
		for (var i = 0; i < 22; i++) {
			for (var j = 0; j < 22; j++) {
				// Clears the previous sprites.
				if (this.dungeonSprites[i][j]) this.dungeonSprites[i][j].destroy();
	
				r = Math.random();	
				if (r > 0.72) { // TODO: Change by level, slowly increase the dificulty.
					this.addZubat(i, j);
				} else if (r > 0.53 && i > 0 && i < 21 && j > 0 && j < 21) {
					c = this.getCoords(i, j);
					s = Math.random() > 0.5 ? 'rock1' : 'rock2';
					this.dungeonSprites[i][j] = this.game.add.sprite(c.x, c.y, s);
					this.dungeonSprites[i][j].scale.setTo(this.resize, this.resize);
					this.dungeonMap[i][j] = 'R';
				} else {
					this.dungeonMap[i][j] = '-';
				}
			}
		}
	},
	createPlayer: function(x, y) {
		console.log('Created a player');
		this.player = this.game.add.sprite(x, y, 'player');
		this.player.animations.add('down', [0, 1, 2], 4, true);
		this.player.animations.add('up', [6, 7, 8], 4, true);
		this.player.animations.add('left', [3, 4, 5], 4, true);
		this.player.animations.add('right', [9, 10, 11], 4, true);
		this.player.scale.setTo(this.resize, this.resize);
	},
	setPlayer: function(i, j) {
		var c = this.getCoords(i, j);

		if (!this.player) {
			this.createPlayer(c.x, c.y);
			this.player.animations.play('up');
		} else {
			this.player.x = c.x;
			this.player.y = c.y;
		}

		if (this.dungeonSprites[i][j]) this.dungeonSprites[i][j].destroy();
			
		this.playerPos = {};
		this.playerPos.i = i;
		this.playerPos.j = j;
		this.dungeonMap[i][j] = 'P';
	},
	setExit: function(i, j) {
		var c = this.getCoords(i, j);
		if (this.dungeonSprites[i][j]) this.dungeonSprites[i][j].destroy();
		this.dungeonSprites[i][j] = this.game.add.sprite(c.x, c.y, 'exit');
		this.dungeonMap[i][j] = 'E';
		this.setExitText();
	},
	moveBats: function() {
		var newDungeonSprites = [], alreadyMoved = [];
		for (var i = 0; i < 22; i++) {
			newDungeonSprites[i] = [];
			alreadyMoved[i] = [];
			for (var j = 0; j < 22; j++) {
				newDungeonSprites[i][j] = null;
				alreadyMoved[i][j] = false;
			}
		}

		for (var i = 0; i < 22; i++) {
			for (var j = 0; j < 22; j++) {
				if (this.dungeonMap[i][j] === 'Z' && !alreadyMoved[i][j]) {
					
					var r = Math.random(), shouldMove = true, nI = i, nJ = j;
					if (r > 0.80) {
						shouldMove = false;
					} else if (r > 0.60) {
						nJ = j-1;
					} else if (r > 0.40) {
						nJ = j+1;
					} else if (r > 0.20) {
						nI = i-1;
					} else {
						nI = i+1;
					}

					var valid = shouldMove && nI >= 0 && nI < 22 && nJ >= 0 && nJ < 22;
					var validMove = valid ? (this.dungeonMap[nI][nJ] === '-') : false;
					if (validMove) {
						/* Faster because it only changes the coordinates of a existing sprite. */
						var c = this.getCoords(nI, nJ);
						newDungeonSprites[nI][nJ] = this.dungeonSprites[i][j];
						newDungeonSprites[nI][nJ].x = c.x;
						newDungeonSprites[nI][nJ].y = c.y;

						this.dungeonMap[i][j] = '-';
						this.dungeonMap[nI][nJ] = 'Z';
						alreadyMoved[nI][nJ] = true;
					} else {
						newDungeonSprites[i][j] = this.dungeonSprites[i][j];
					}
				} else if (!alreadyMoved[i][j]) {
					newDungeonSprites[i][j] = this.dungeonSprites[i][j];
				}
			}
		}	
		this.dungeonSprites = newDungeonSprites;
	},
	updatePlayer: function(i, j) {
		var changedCon = i !== this.playerPos.i || j !== this.playerPos.j;
		var valid = i >= 0 && i < 22 && j >= 0 && j < 22;
		var validMove = valid ? (this.dungeonMap[i][j] !== 'R') : false;

		if (changedCon && validMove) {
			if (this.dungeonMap[i][j] === 'E') {
				this.win_se.play();
				this.caveNumber++;
				this.setNewLevel();
				return;
			} else if (this.dungeonMap[i][j] === 'Z') {
				this.hurt_se.play();
				this.dungeonSprites[i][j].destroy();
				this.playerHp -= 10;
				this.updateHpText();
			}
			this.setPlayer(i, j);
			this.moveBats();
		}
	},
	movePlayer: function() {
		if (this.game.time.now > this.moveTime && this.playing) {
			var i = this.playerPos.i, j = this.playerPos.j;
			if (this.cursors.up.isDown) {
				this.player.animations.play('up');
				j--;
			} else if (this.cursors.left.isDown) {
				this.player.animations.play('left');
				i--;
			} else if (this.cursors.right.isDown) {
				this.player.animations.play('right');
				i++;
			} else if (this.cursors.down.isDown) {
				this.player.animations.play('down');
				j++;
			}
			this.updatePlayer(i, j);
			this.moveTime = this.game.time.now + 150;
		}
	},
	update: function() {
		if (this.playerHp <= 0) {
			this.bgm.stop();
			this.player.destroy();
			this.player = null;
			this.game.caveNumber = this.caveNumber;
			this.game.state.start('end');
		} else {
			this.movePlayer();
		}
	}
};

var end = {
	create: function() {
		this.fac = this.game.world.width/650;

		var size1 = 40*this.fac;
		var size2 = 40*this.fac;
		var size3 = 35*this.fac;

		var caves = (this.game.caveNumber-1);
		var cavesText = caves === 1 ? 'cave' : 'caves';

		var score_text = 'Your passed through \n'+caves+'\n '+cavesText+'!';

		this.name_text = this.game.add.text(this.game.world.centerX, 280*this.fac, score_text, {font: size1+"px 'Luckiest Guy'", fill: '#FFFFFF', align: 'center'});
		this.name_text.anchor.setTo(0.5, 0.5);

		this.start_text = this.game.add.text(this.game.world.centerX, 410*this.fac, 'Press "up" to play again!', {font: size3+"px 'Luckiest Guy'", fill: '#FFFFFF'});
		this.start_text.anchor.setTo(0.5, 0.5);

		this.game.add.tween(this.start_text).to({ angle:1 }, 200).to({ angle:-1 }, 200).loop().start();
		this.game.add.tween(this.name_text.scale).to({ x: 1.05, y: 1.05 }, 300).to({ x: 1, y: 1 }, 300).loop().start();

		this.cursors = this.game.input.keyboard.createCursorKeys();
	},
	update: function() {
		if (this.cursors.up.isDown) this.game.state.start('main');
	}
};

// 650 x 650
var width = Math.min(window.innerWidth, 650);

var game = new Phaser.Game(width, width, Phaser.AUTO, 'game_div', {
	preload: function() {
		this.game.stage.backgroundColor = 0x383830;
		this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

		console.log('( ͡° ͜ʖ ͡°)');
	}
});
game.state.add('boot', boot);
game.state.add('load', load);
game.state.add('menu', menu);
game.state.add('main', main);
game.state.add('end', end);

// if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) return;

WebFontConfig = {
	active: function() { game.time.events.add(Phaser.Timer.SECOND, function createGame() {game.state.start('boot');}, this); },
	google: {
		families: ['Luckiest+Guy::latin']
	}
};

})();