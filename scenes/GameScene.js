class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // 遊戲狀態
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.speed = 300;
        this.isGameOver = false;
        this.isBattleMode = false;
        
        // 計時器
        this.survivalTime = 0;
        this.nextBattleTime = 15000; // 15秒後第一次戰鬥
        this.obstacleTimer = 0;
        
        // 載入問題數據
        this.loadQuestions();
        
        // 創建背景
        this.createBackground();
        
        // 創建玩家
        this.createPlayer();
        
        // 創建障礙物數組
        this.obstacles = [];
        
        // 創建UI
        this.createUI();
        
        // 鍵盤控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            key1: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
            key2: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
            key3: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
            key4: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR)
        };
        
        // 碰撞檢測
        this.physics.add.collider(this.player, this.ground); // 玩家與地板碰撞
        // 障礙物碰撞在 update 中手動檢查
    }

    loadQuestions() {
        // 簡化版問題庫（實際應該從 JSON 載入）
        this.questions = [
            {
                sentence: "The cat is ___ the box.",
                correct: "in",
                options: ["in", "on", "under", "beside"],
                emojis: ["🐱📦", "🐱⬆️📦", "🐱⬇️📦", "🐱↔️📦"]
            },
            {
                sentence: "The bird is flying ___ the tree.",
                correct: "over",
                options: ["over", "under", "around", "through"],
                emojis: ["🦅⬆️🌳", "🦅⬇️🌳", "🦅🔄🌳", "🦅🚇🌳"]
            },
            {
                sentence: "The ball rolled ___ the tunnel.",
                correct: "through",
                options: ["through", "over", "around", "beside"],
                emojis: ["⚽🚇", "⚽⬆️", "⚽🔄", "⚽↔️"]
            },
            {
                sentence: "The dog is hiding ___ the table.",
                correct: "under",
                options: ["under", "on", "above", "beside"],
                emojis: ["🐕⬇️🪑", "🐕⬆️🪑", "🐕☁️", "🐕↔️🪑"]
            },
            {
                sentence: "The book is ___ the shelf.",
                correct: "on",
                options: ["on", "under", "in", "beside"],
                emojis: ["📚⬆️", "📚⬇️", "📚📦", "📚↔️"]
            }
        ];
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 漸變背景
        this.bg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a0033);
        
        // 移動的星星背景
        this.bgStars = this.add.group();
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const star = this.add.circle(x, y, 2, 0xffffff, 0.6);
            this.bgStars.add(star);
        }
        
        // 地板（物理平台）
        this.ground = this.physics.add.staticSprite(width / 2, height - 30, null);
        this.ground.body.setSize(width, 60);
        this.ground.setVisible(false); // 隱藏物理體
        
        // 地板視覺
        this.groundGraphics = this.add.rectangle(width / 2, height - 30, width, 60, 0x330066);
    }

    createPlayer() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 玩家（巫師）
        this.player = this.physics.add.sprite(150, height - 120, null);
        this.player.body.setSize(40, 60);
        this.player.body.setCollideWorldBounds(true);
        
        // 玩家視覺
        this.playerGraphics = this.add.container(150, height - 120);
        this.playerBody = this.add.circle(0, 0, 20, 0x6600cc);
        this.playerEmoji = this.add.text(0, -5, '🧙', { fontSize: '40px' }).setOrigin(0.5);
        this.playerGraphics.add([this.playerBody, this.playerEmoji]);
        
        // 玩家狀態
        this.playerState = 'running'; // running, jumping, ducking
    }

    createUI() {
        const width = this.cameras.main.width;
        
        // UI容器
        this.uiContainer = this.add.container(0, 0);
        
        // 背景板
        this.uiContainer.add(this.add.rectangle(width / 2, 40, width - 20, 70, 0x000000, 0.7));
        
        // 分數
        this.scoreText = this.add.text(20, 20, '分數: 0', {
            fontSize: '24px',
            fill: '#ffff00',
            fontStyle: 'bold'
        });
        this.uiContainer.add(this.scoreText);
        
        // 生命
        this.livesText = this.add.text(20, 50, '生命: ❤️❤️❤️', {
            fontSize: '20px',
            fill: '#ff6666'
        });
        this.uiContainer.add(this.livesText);
        
        // 等級
        this.levelText = this.add.text(width - 20, 20, 'Level 1', {
            fontSize: '24px',
            fill: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(1, 0);
        this.uiContainer.add(this.levelText);
        
        // 生存時間
        this.timeText = this.add.text(width - 20, 50, '時間: 0s', {
            fontSize: '20px',
            fill: '#00ffff'
        }).setOrigin(1, 0);
        this.uiContainer.add(this.timeText);
    }

    update(time, delta) {
        if (this.isGameOver) return;
        
        // 更新生存時間
        this.survivalTime += delta;
        this.timeText.setText('時間: ' + Math.floor(this.survivalTime / 1000) + 's');
        
        // 移動背景星星
        this.bgStars.children.entries.forEach(star => {
            star.x -= this.speed * delta / 1000;
            if (star.x < 0) {
                star.x = this.cameras.main.width;
                star.y = Phaser.Math.Between(0, this.cameras.main.height);
            }
        });
        
        // 檢查是否進入戰鬥模式
        if (!this.isBattleMode && this.survivalTime >= this.nextBattleTime) {
            this.startBattle();
            return;
        }
        
        // 正常模式 - 生成障礙物
        if (!this.isBattleMode) {
            this.obstacleTimer += delta;
            if (this.obstacleTimer >= 2000) {
                this.obstacleTimer = 0;
                this.spawnObstacle();
            }
            
            // 玩家控制
            this.handlePlayerMovement();
            
            // 更新玩家位置
            this.playerGraphics.x = this.player.x;
            this.playerGraphics.y = this.player.y;
            
            // 更新障礙物
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                const obstacle = this.obstacles[i];
                obstacle.x -= this.speed * delta / 1000;
                
                // 檢查碰撞
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    obstacle.x, obstacle.y
                );
                
                if (distance < 40 && !obstacle.hit) {
                    obstacle.hit = true;
                    this.hitObstacle(obstacle);
                }
                
                // 移除超出畫面的障礙物
                if (obstacle.x < -50) {
                    obstacle.destroy();
                    this.obstacles.splice(i, 1);
                }
            }
        }
    }

    handlePlayerMovement() {
        // 左右移動
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }
        
        // 跳躍
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.player.body.touching.down) {
            this.player.setVelocityY(-400);
            this.playerState = 'jumping';
            this.playerEmoji.setText('🧙‍♂️');
        }
        
        // 蹲下
        if (this.cursors.down.isDown) {
            this.player.body.setSize(40, 30);
            this.playerGraphics.scaleY = 0.5;
            this.playerState = 'ducking';
        } else {
            this.player.body.setSize(40, 60);
            this.playerGraphics.scaleY = 1;
            if (this.player.body.touching.down) {
                this.playerState = 'running';
                this.playerEmoji.setText('🧙');
            }
        }
    }

    spawnObstacle() {
        const height = this.cameras.main.height;
        const width = this.cameras.main.width;
        
        const types = [
            { emoji: '🪨', y: height - 90, size: 40, type: 'rock' }, // 石頭 - 需要跳或蹲
            { emoji: '🦅', y: height - 200, size: 40, type: 'bird' } // 鳥 - 需要蹲
        ];
        
        const obstacleType = Phaser.Math.RND.pick(types);
        
        // 創建容器來包含障礙物
        const obstacle = this.add.container(width + 50, obstacleType.y);
        
        // 添加 emoji
        const emoji = this.add.text(0, 0, obstacleType.emoji, {
            fontSize: '50px'
        }).setOrigin(0.5);
        
        obstacle.add(emoji);
        obstacle.obstacleType = obstacleType.type;
        obstacle.hit = false;
        
        // 添加到障礙物數組
        this.obstacles.push(obstacle);
    }

    hitObstacle(obstacle) {
        this.loseLife();
        
        // 閃紅效果
        this.cameras.main.shake(200, 0.01);
        this.cameras.main.flash(200, 255, 0, 0);
        
        // 銷毀障礙物
        obstacle.destroy();
        const index = this.obstacles.indexOf(obstacle);
        if (index > -1) {
            this.obstacles.splice(index, 1);
        }
    }

    loseLife() {
        this.lives--;
        const hearts = ['❤️❤️❤️', '❤️❤️', '❤️', ''];
        this.livesText.setText('生命: ' + hearts[this.lives]);
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    startBattle() {
        this.isBattleMode = true;
        this.physics.pause();
        
        // 清除所有障礙物
        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.obstacles = [];
        
        // 顯示 Fog Fiend 和問題
        this.showBattleScreen();
    }

    showBattleScreen() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 選擇隨機問題
        this.currentQuestion = Phaser.Math.RND.pick(this.questions);
        
        // 霧氣效果（半透明遮罩）
        this.battleOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x330066, 0.9);
        
        // Fog Fiend
        this.fogFiend = this.add.text(width / 2, 150, '👻 FOG FIEND 👻', {
            fontSize: '48px',
            fill: '#9966ff',
            stroke: '#330066',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // 添加霧氣動畫
        this.tweens.add({
            targets: this.fogFiend,
            alpha: 0.5,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // 問題文字
        this.questionText = this.add.text(width / 2, 240, this.currentQuestion.sentence, {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        // 選項按鈕
        this.optionButtons = [];
        for (let i = 0; i < 4; i++) {
            const x = width / 2 - 300 + (i * 200);
            const y = height / 2 + 50;
            
            const button = this.createOptionButton(x, y, 
                this.currentQuestion.options[i],
                this.currentQuestion.emojis[i],
                i + 1
            );
            this.optionButtons.push(button);
        }
        
        // 倒數計時
        this.battleTimer = 5;
        this.timerText = this.add.text(width / 2, height - 100, '⏰ ' + this.battleTimer, {
            fontSize: '48px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.battleTimerEvent = this.time.addEvent({
            delay: 1000,
            repeat: 4,
            callback: () => {
                this.battleTimer--;
                this.timerText.setText('⏰ ' + this.battleTimer);
                if (this.battleTimer <= 0) {
                    this.wrongAnswer();
                }
            }
        });
    }

    createOptionButton(x, y, text, emoji, number) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 180, 120, 0x6600cc)
            .setInteractive({ useHandCursor: true });
        
        const emojiText = this.add.text(0, -20, emoji, {
            fontSize: '40px'
        }).setOrigin(0.5);
        
        const prepText = this.add.text(0, 30, text, {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const numberText = this.add.text(-75, -50, number, {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
        
        container.add([bg, emojiText, prepText, numberText]);
        
        // 點擊事件
        bg.on('pointerdown', () => {
            this.checkAnswer(text);
        });
        
        // 懸停效果
        bg.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });
        
        bg.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });
        
        return container;
    }

    checkAnswer(answer) {
        if (answer === this.currentQuestion.correct) {
            this.correctAnswer();
        } else {
            this.wrongAnswer();
        }
    }

    correctAnswer() {
        // 清除戰鬥計時器
        if (this.battleTimerEvent) this.battleTimerEvent.remove();
        
        // 分數獎勵
        const bonus = this.battleTimer * 10;
        this.score += 50 + bonus;
        this.scoreText.setText('分數: ' + this.score);
        
        // 回復生命
        if (this.lives < 3) {
            this.lives++;
            const hearts = ['', '❤️', '❤️❤️', '❤️❤️❤️'];
            this.livesText.setText('生命: ' + hearts[this.lives]);
        }
        
        // 視覺效果
        this.cameras.main.flash(500, 0, 255, 0);
        
        const successText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
            '✨ 正確！✨\n+' + (50 + bonus) + ' 分', {
            fontSize: '48px',
            fill: '#00ff00',
            stroke: '#004400',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        
        // 動畫
        this.tweens.add({
            targets: successText,
            y: successText.y - 50,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                successText.destroy();
                this.endBattle();
            }
        });
    }

    wrongAnswer() {
        if (this.battleTimerEvent) this.battleTimerEvent.remove();
        
        this.loseLife();
        
        this.cameras.main.shake(300, 0.02);
        this.cameras.main.flash(300, 255, 0, 0);
        
        const failText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2,
            '❌ 錯誤！\n正確答案: ' + this.currentQuestion.correct, {
            fontSize: '36px',
            fill: '#ff0000',
            stroke: '#440000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            failText.destroy();
            if (this.lives > 0) {
                this.endBattle();
            }
        });
    }

    endBattle() {
        // 清除戰鬥UI
        if (this.battleOverlay) this.battleOverlay.destroy();
        if (this.fogFiend) this.fogFiend.destroy();
        if (this.questionText) this.questionText.destroy();
        if (this.timerText) this.timerText.destroy();
        this.optionButtons.forEach(btn => btn.destroy());
        
        // 恢復遊戲
        this.isBattleMode = false;
        this.physics.resume();
        
        // 設置下次戰鬥時間
        this.nextBattleTime = this.survivalTime + 15000;
        
        // 增加難度
        this.speed += 20;
        this.level++;
        this.levelText.setText('Level ' + this.level);
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 遊戲結束畫面
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        
        const gameOverText = this.add.text(width / 2, height / 2 - 80, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 8,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const finalScore = this.add.text(width / 2, height / 2, 
            '最終分數: ' + this.score + '\n生存時間: ' + Math.floor(this.survivalTime / 1000) + '秒', {
            fontSize: '32px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        const restartButton = this.add.text(width / 2, height / 2 + 100, '🔄 重新開始', {
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#6600cc',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });
        
        const menuButton = this.add.text(width / 2, height / 2 + 170, '🏠 主選單', {
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#0066cc',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}


export default GameScene;
