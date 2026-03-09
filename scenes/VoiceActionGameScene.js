class VoiceActionGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VoiceActionGameScene' });
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
        this.spawnInterval = 2000;
        this.isGameOver = false;
        this.isListening = false;
        
        // 背景
        this.add.image(400, 300, 'gameBg').setDisplaySize(800, 600).setAlpha(0.6);
        
        // 玩家角色
        this.createPlayer();
        
        // 物件群組
        this.obstacles = this.physics.add.group();
        
        // UI介面
        this.createUI();
        
        // 設置語音識別
        this.setupVoiceRecognition();
        
        // 鍵盤控制（備用）
        this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // 顯示開始提示
        this.showStartMessage();
    }

    setupVoiceRecognition() {
        // 檢查瀏覽器是否支持語音識別
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('此瀏覽器不支援語音識別');
            this.voiceSupported = false;
            return;
        }
        
        this.voiceSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'zh-HK'; // 設置為廣東話/中文
        this.recognition.continuous = true; // 持續監聽
        this.recognition.interimResults = false;
        
        // 語音識別關鍵詞對應
        this.voiceCommands = {
            // 中文
            '走過': 'ACROSS',
            '行過': 'ACROSS',
            '穿過': 'ACROSS',
            '過': 'ACROSS',
            
            '跳過': 'OVER',
            '跳': 'OVER',
            '越過': 'OVER',
            
            '上': 'ONTO',
            '爬上': 'ONTO',
            '企上去': 'ONTO',
            '企上': 'ONTO',
            '爬': 'ONTO',
            
            // 英文
            'across': 'ACROSS',
            'walk': 'ACROSS',
            
            'over': 'OVER',
            'jump': 'OVER',
            
            'onto': 'ONTO',
            'climb': 'ONTO'
        };
        
        // 監聽語音結果
        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript.toLowerCase().trim();
            
            console.log('聽到:', text);
            
            // 檢查是否匹配命令
            for (let [keyword, action] of Object.entries(this.voiceCommands)) {
                if (text.includes(keyword.toLowerCase())) {
                    this.checkAnswer(action);
                    this.showVoiceInput(text);
                    break;
                }
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('語音識別錯誤:', event.error);
        };
        
        this.recognition.onend = () => {
            // 自動重新開始監聽
            if (!this.isGameOver && this.isListening) {
                this.recognition.start();
            }
        };
    }

    startVoiceRecognition() {
        if (this.voiceSupported && !this.isListening) {
            try {
                this.recognition.start();
                this.isListening = true;
                this.micIcon.setStyle({ fill: '#00ff00' });
                this.micStatus.setText('🎤 聆聽中...');
            } catch (e) {
                console.error('無法啟動語音識別:', e);
            }
        }
    }

    stopVoiceRecognition() {
        if (this.voiceSupported && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.micIcon.setStyle({ fill: '#ff0000' });
            this.micStatus.setText('🎤 已停止');
        }
    }

    createPlayer() {
        this.player = this.add.circle(100, 450, 25, 0xff6b6b);
        this.playerText = this.add.text(85, 440, '🏃', { fontSize: '40px' });
        this.playerAction = 'idle';
    }

    createUI() {
        // 背景板
        this.add.rectangle(400, 50, 780, 100, 0x000000, 0.7);
        
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
        
        // 麥克風狀態
        this.micIcon = this.add.text(700, 50, '🎤', { 
            fontSize: '24px'
        });
        this.micStatus = this.add.text(730, 55, '按空格鍵啟動', { 
            fontSize: '16px', 
            fill: '#ffffff'
        });
        
        // 控制提示
        const hints = [
            '🎤 語音：說「走過/跳過/爬上」',
            '⌨️ 鍵盤：1=ACROSS  2=OVER  3=ONTO',
            '空格鍵 = 開始/停止語音'
        ];
        
        this.add.text(250, 20, hints.join('\n'), {
            fontSize: '15px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
            lineSpacing: 3
        });
        
        // 語音輸入顯示區
        this.voiceDisplay = this.add.text(400, 550, '', {
            fontSize: '20px',
            fill: '#ffeb3b',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
    }

    showVoiceInput(text) {
        this.voiceDisplay.setText(`聽到: "${text}"`);
        this.time.delayedCall(2000, () => {
            this.voiceDisplay.setText('');
        });
    }

    showStartMessage() {
        const startBox = this.add.rectangle(400, 300, 700, 400, 0x000000, 0.95);
        const startText = this.add.text(400, 200, '🎤 語音控制遊戲！', {
            fontSize: '48px',
            fill: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const instructions = this.add.text(400, 320, 
            '物件會從右邊飛過來！\n\n🎤 語音控制（推薦）：\n說「走過」「跳過」「爬上」\n按空格鍵啟動/停止語音\n\n⌨️ 鍵盤控制（備用）：\n1 = 走過街道 (ACROSS)\n2 = 跳過障礙 (OVER)\n3 = 爬上平台 (ONTO)\n\n答對加分，答錯扣生命！',
            {
                fontSize: '20px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 5
            }
        ).setOrigin(0.5);
        
        const countdownText = this.add.text(400, 510, '3', {
            fontSize: '72px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        let count = 3;
        const countdown = this.time.addEvent({
            delay: 1000,
            repeat: 2,
            callback: () => {
                count--;
                if (count > 0) {
                    countdownText.setText(count);
                } else {
                    startBox.destroy();
                    startText.destroy();
                    instructions.destroy();
                    countdownText.destroy();
                    
                    // 提示啟動語音
                    if (this.voiceSupported) {
                        const voiceTip = this.add.text(400, 300, '按空格鍵啟動語音！', {
                            fontSize: '32px',
                            fill: '#00ff00',
                            backgroundColor: '#000000',
                            padding: { x: 20, y: 10 }
                        }).setOrigin(0.5);
                        
                        this.tweens.add({
                            targets: voiceTip,
                            alpha: 0,
                            duration: 3000,
                            onComplete: () => voiceTip.destroy()
                        });
                    }
                }
            }
        });
    }

    update(time, delta) {
        if (this.isGameOver) return;
        
        // 空格鍵控制語音
        if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            if (this.isListening) {
                this.stopVoiceRecognition();
            } else {
                this.startVoiceRecognition();
            }
        }
        
        // 生成物件
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnObstacle();
        }
        
        // 更新物件位置
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.x < -50) {
                if (!obstacle.answered) {
                    this.loseLife();
                }
                obstacle.destroy();
            }
        });
        
        // 檢查鍵盤輸入（備用）
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
                text: '街道\nStreet',
                correctAnswer: 'ACROSS'
            },
            { 
                name: 'OVER', 
                color: 0xe74c3c, 
                icon: '🧱',
                text: '障礙\nWall',
                correctAnswer: 'OVER'
            },
            { 
                name: 'ONTO', 
                color: 0x2ecc71, 
                icon: '📦',
                text: '平台\nPlatform',
                correctAnswer: 'ONTO'
            }
        ];
        
        const randomType = Phaser.Math.RND.pick(types);
        const y = Phaser.Math.Between(200, 500);
        
        const obstacle = this.add.container(850, y);
        
        const shape = this.add.rectangle(0, 0, 80, 80, randomType.color);
        const icon = this.add.text(0, -5, randomType.icon, { 
            fontSize: '48px' 
        }).setOrigin(0.5);
        const label = this.add.text(0, 50, randomType.text, {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 },
            align: 'center'
        }).setOrigin(0.5);
        
        obstacle.add([shape, icon, label]);
        
        this.physics.add.existing(obstacle);
        obstacle.body.setVelocityX(-this.gameSpeed);
        
        obstacle.obstacleType = randomType.correctAnswer;
        obstacle.answered = false;
        
        this.obstacles.add(obstacle);
    }

    checkAnswer(playerChoice) {
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
                this.correctAnswer(nearest, playerChoice);
            } else {
                this.wrongAnswer(nearest, playerChoice);
            }
        }
    }

    correctAnswer(obstacle, action) {
        this.score += 10;
        this.scoreText.setText('分數: ' + this.score);
        
        const feedback = this.add.text(obstacle.x, obstacle.y - 50, '✓ 正確！+10', {
            fontSize: '24px',
            fill: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.playPlayerAnimation(action);
        
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
        this.gameSpeed += 30;
        this.spawnInterval = Math.max(1000, this.spawnInterval - 200);
        
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
        this.stopVoiceRecognition();
        
        this.obstacles.children.entries.forEach(obstacle => {
            obstacle.body.setVelocity(0);
        });
        
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        const gameOverBox = this.add.rectangle(400, 300, 600, 400, 0x2c3e50);
        
        const title = this.add.text(400, 180, '遊戲結束！', {
            fontSize: '56px',
            fill: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const stats = this.add.text(400, 280, 
            `最終分數: ${this.score}\n達到等級: ${this.level}\n\n你學會了：\n• ACROSS 走過\n• OVER 跳過\n• ONTO 爬上`,
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

export default VoiceActionGameScene;
