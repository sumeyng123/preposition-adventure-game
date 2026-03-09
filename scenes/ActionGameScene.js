class ActionGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ActionGameScene' });
    }

    preload() {
        // 載入背景圖片
        this.load.image('gameBg', 'assets/images/city-background.jpg');
    }

    create() {
        // 遊戲狀態
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 200;
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // 2秒生成一個物件
        this.isGameOver = false;
        this.gameStarted = false; // 遊戲是否已開始
        
        // 背景
        this.add.image(400, 300, 'gameBg').setDisplaySize(800, 600).setAlpha(0.6);
        
        // 玩家角色
        this.createPlayer();
        
        // 物件群組
        this.obstacles = this.physics.add.group();
        
        // UI介面
        this.createUI();
        
        // 鍵盤控制
        this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        
        // 顯示開始提示
        this.showStartMessage();
    }

    createPlayer() {
        // 玩家角色（可以換成圖片）
        this.player = this.add.circle(100, 450, 25, 0xff6b6b);
        this.playerText = this.add.text(85, 440, '🏃', { fontSize: '40px' });
        
        // 玩家狀態
        this.playerAction = 'idle'; // idle, walk, jump, climb
    }

    createUI() {
        // 背景板
        this.add.rectangle(400, 50, 780, 80, 0x000000, 0.7);
        
        // 分數
        this.scoreText = this.add.text(20, 20, '分數: 0', { 
            fontSize: '24px', 
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        
        // 生命
        this.livesText = this.add.text(20, 50, '❤️ ❤️ ❤️', { 
            fontSize: '24px'
        });
        
        // 等級
        this.levelText = this.add.text(700, 20, 'Level 1', { 
            fontSize: '24px', 
            fill: '#ffeb3b',
            fontStyle: 'bold'
        });
        
        // 按鍵提示
        const keyHints = [
            '按鍵提示:',
            '1️⃣ = ACROSS 走過',
            '2️⃣ = OVER 跳過', 
            '3️⃣ = ONTO 爬上'
        ];
        
        this.add.text(250, 15, keyHints.join('  |  '), {
            fontSize: '18px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
    }

    showStartMessage() {
        const startBox = this.add.rectangle(400, 300, 600, 350, 0x000000, 0.9);
        const startText = this.add.text(400, 220, '🎮 準備好了嗎？', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const instructions = this.add.text(400, 310, 
            '物件會從右邊飛過來！\n快速按對應的數字鍵：\n\n1 = 走過街道 (ACROSS)\n2 = 跳過障礙 (OVER)\n3 = 爬上平台 (ONTO)\n\n答對加分，答錯扣生命！',
            {
                fontSize: '20px',
                fill: '#ffeb3b',
                align: 'center',
                lineSpacing: 5
            }
        ).setOrigin(0.5);
        
        // 點擊或按任意數字鍵開始
        const startButton = this.add.text(400, 450, '👆 點擊這裡或按任意數字鍵開始', {
            fontSize: '24px',
            fill: '#00ff00',
            fontStyle: 'bold',
            backgroundColor: '#333333',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        // 閃爍效果
        this.tweens.add({
            targets: startButton,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        const startGame = () => {
            this.gameStarted = true;
            startBox.destroy();
            startText.destroy();
            instructions.destroy();
            startButton.destroy();
        };
        
        // 點擊開始
        startButton.on('pointerdown', startGame);
        
        // 或按任意數字鍵開始
        this.input.keyboard.once('keydown-ONE', startGame);
        this.input.keyboard.once('keydown-TWO', startGame);
        this.input.keyboard.once('keydown-THREE', startGame);
    }

    update(time, delta) {
        if (this.isGameOver || !this.gameStarted) return; // 遊戲未開始或已結束時不更新
        
        // 生成物件
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnObstacle();
        }
        
        // 更新物件位置
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.x < -50) {
                // 物件飛出屏幕，沒有回應就扣生命
                if (!obstacle.answered) {
                    this.loseLife();
                }
                obstacle.destroy();
            }
        });
        
        // 檢查按鍵
        if (Phaser.Input.Keyboard.JustDown(this.key1)) {
            this.checkAnswer('ACROSS');
        } else if (Phaser.Input.Keyboard.JustDown(this.key2)) {
            this.checkAnswer('OVER');
        } else if (Phaser.Input.Keyboard.JustDown(this.key3)) {
            this.checkAnswer('ONTO');
        }
        
        // 升級檢查
        if (this.score >= this.level * 100) {
            this.levelUp();
        }
    }

    spawnObstacle() {
        const types = [
            { 
                name: 'ACROSS', 
                color: 0x4a90e2, 
                icon: '🚶',
                text: '街道 Street',
                correctAnswer: 'ACROSS'
            },
            { 
                name: 'OVER', 
                color: 0xe74c3c, 
                icon: '🧱',
                text: '障礙 Wall',
                correctAnswer: 'OVER'
            },
            { 
                name: 'ONTO', 
                color: 0x2ecc71, 
                icon: '📦',
                text: '平台 Platform',
                correctAnswer: 'ONTO'
            }
        ];
        
        const randomType = Phaser.Math.RND.pick(types);
        const y = Phaser.Math.Between(200, 500);
        
        // 創建物件
        const obstacle = this.add.container(850, y);
        
        // 物件圖形
        const shape = this.add.rectangle(0, 0, 80, 80, randomType.color);
        const icon = this.add.text(0, -5, randomType.icon, { 
            fontSize: '48px' 
        }).setOrigin(0.5);
        const label = this.add.text(0, 50, randomType.text, {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5);
        
        obstacle.add([shape, icon, label]);
        
        // 添加到物理引擎
        this.physics.add.existing(obstacle);
        obstacle.body.setVelocityX(-this.gameSpeed);
        
        // 保存物件數據
        obstacle.obstacleType = randomType.correctAnswer;
        obstacle.answered = false;
        
        // 加入群組
        this.obstacles.add(obstacle);
    }

    checkAnswer(playerChoice) {
        // 找到最近的物件
        let nearest = null;
        let minDistance = Infinity;
        
        this.obstacles.children.entries.forEach(obstacle => {
            if (!obstacle.answered && obstacle.x > 0 && obstacle.x < 400) {
                const distance = Math.abs(obstacle.x - this.player.x);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = obstacle;
                }
            }
        });
        
        if (nearest && minDistance < 200) {
            nearest.answered = true;
            
            if (playerChoice === nearest.obstacleType) {
                // 答對！
                this.correctAnswer(nearest, playerChoice);
            } else {
                // 答錯！
                this.wrongAnswer(nearest, playerChoice);
            }
        }
    }

    correctAnswer(obstacle, action) {
        this.score += 10;
        this.scoreText.setText('分數: ' + this.score);
        
        // 視覺回饋
        const feedback = this.add.text(obstacle.x, obstacle.y - 50, '✓ 正確！+10', {
            fontSize: '24px',
            fill: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // 播放動作動畫
        this.playPlayerAnimation(action);
        
        // 物件消失動畫
        this.tweens.add({
            targets: obstacle,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => obstacle.destroy()
        });
        
        this.tweens.add({
            targets: feedback,
            y: feedback.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => feedback.destroy()
        });
    }

    wrongAnswer(obstacle, action) {
        this.loseLife();
        
        // 視覺回饋
        const feedback = this.add.text(obstacle.x, obstacle.y - 50, 
            `✗ 錯誤！\n應該是 ${obstacle.obstacleType}`,
            {
                fontSize: '20px',
                fill: '#ff0000',
                fontStyle: 'bold',
                stroke: '#ffffff',
                strokeThickness: 3,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // 晃動效果
        this.cameras.main.shake(200, 0.01);
        
        this.tweens.add({
            targets: feedback,
            y: feedback.y - 30,
            alpha: 0,
            duration: 2000,
            onComplete: () => feedback.destroy()
        });
        
        obstacle.destroy();
    }

    playPlayerAnimation(action) {
        // 簡單的動作動畫
        const actions = {
            'ACROSS': { emoji: '🚶', text: 'Walking!' },
            'OVER': { emoji: '🤸', text: 'Jumping!' },
            'ONTO': { emoji: '🧗', text: 'Climbing!' }
        };
        
        const chosen = actions[action];
        this.playerText.setText(chosen.emoji);
        
        this.tweens.add({
            targets: this.player,
            y: 400,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                this.playerText.setText('🏃');
            }
        });
    }

    loseLife() {
        this.lives--;
        const hearts = '❤️ '.repeat(this.lives) + '🖤 '.repeat(3 - this.lives);
        this.livesText.setText(hearts.trim());
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    levelUp() {
        this.level++;
        this.levelText.setText('Level ' + this.level);
        this.gameSpeed += 30; // 速度增加
        this.spawnInterval = Math.max(1000, this.spawnInterval - 200); // 生成更快
        
        // 升級提示
        const levelUpText = this.add.text(400, 300, `🎉 Level ${this.level}! 🎉\n速度提升！`, {
            fontSize: '48px',
            fill: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: levelUpText,
            scale: { from: 0, to: 1.2 },
            alpha: { from: 1, to: 0 },
            duration: 2000,
            onComplete: () => levelUpText.destroy()
        });
    }

    gameOver() {
        this.isGameOver = true;
        
        // 停止所有物件
        this.obstacles.children.entries.forEach(obstacle => {
            obstacle.body.setVelocity(0);
        });
        
        // 遊戲結束畫面
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        const gameOverBox = this.add.rectangle(400, 300, 600, 400, 0x2c3e50);
        
        const title = this.add.text(400, 180, '遊戲結束！', {
            fontSize: '56px',
            fill: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const stats = this.add.text(400, 280, 
            `最終分數: ${this.score}\n達到等級: ${this.level}\n\n你學會了：\n• ACROSS - 走過\n• OVER - 跳過\n• ONTO - 爬上`,
            {
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 8
            }
        ).setOrigin(0.5);
        
        const restartBtn = this.add.text(300, 450, '🔄 重新開始', {
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#27ae60',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        const menuBtn = this.add.text(500, 450, '🏠 主選單', {
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#3498db',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        restartBtn.on('pointerdown', () => {
            this.scene.restart();
        });
        
        menuBtn.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
        
        restartBtn.on('pointerover', () => restartBtn.setScale(1.1));
        restartBtn.on('pointerout', () => restartBtn.setScale(1));
        menuBtn.on('pointerover', () => menuBtn.setScale(1.1));
        menuBtn.on('pointerout', () => menuBtn.setScale(1));
    }
}

export default ActionGameScene;
