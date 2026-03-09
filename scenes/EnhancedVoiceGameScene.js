class EnhancedVoiceGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EnhancedVoiceGameScene' });
    }

    preload() {
        this.load.image('gameBg', 'assets/images/city-background.jpg');
    }

    create() {
        // 遊戲狀態
        this.score = 0;
        this.lives = 5;
        this.level = 1;
        this.gameSpeed = 180;
        this.spawnTimer = 0;
        this.spawnInterval = 2500;
        this.isGameOver = false;
        this.isListening = false;
        this.gameStarted = false;
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        
        // 背景
        this.add.image(400, 300, 'gameBg').setDisplaySize(800, 600).setAlpha(0.5);
        
        // 玩家角色
        this.createPlayer();
        
        // 物件群組
        this.obstacles = this.physics.add.group();
        
        // UI介面
        this.createUI();
        
        // 設置語音識別
        this.setupVoiceRecognition();
        
        // 鍵盤控制
        this.setupKeyboard();
        
        // 顯示開始提示
        this.showStartMessage();
    }

    setupKeyboard() {
        // 主鍵盤數字鍵 1-9, 0
        for (let i = 0; i <= 9; i++) {
            this['key' + i] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes['DIGIT_' + i]);
        }
        // 小鍵盤數字鍵
        for (let i = 0; i <= 9; i++) {
            this['numpad' + i] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes['NUMPAD_' + i]);
        }
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    setupVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.voiceSupported = false;
            return;
        }
        
        this.voiceSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'zh-HK';
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        
        // 擴展的語音指令庫
        this.voiceCommands = {
            // ACROSS 穿過
            '穿過': 'ACROSS', '走過': 'ACROSS', '行過': 'ACROSS', '過': 'ACROSS',
            'across': 'ACROSS', 'walk across': 'ACROSS',
            
            // OVER 跨過/在上方
            '跨過': 'OVER', '跳過': 'OVER', '越過': 'OVER', '上方': 'OVER',
            'over': 'OVER', 'jump over': 'OVER',
            
            // UNDER 在下方
            '下面': 'UNDER', '底下': 'UNDER', '之下': 'UNDER', '下方': 'UNDER',
            'under': 'UNDER', 'go under': 'UNDER', 'underneath': 'UNDER',
            
            // THROUGH 穿過/通過
            '通過': 'THROUGH', '穿過': 'THROUGH', '透過': 'THROUGH',
            'through': 'THROUGH', 'go through': 'THROUGH',
            
            // ONTO 到...上
            '上去': 'ONTO', '爬上': 'ONTO', '企上': 'ONTO', '到上面': 'ONTO',
            'onto': 'ONTO', 'climb onto': 'ONTO',
            
            // BEHIND 在後面
            '後面': 'BEHIND', '背後': 'BEHIND', '之後': 'BEHIND',
            'behind': 'BEHIND', 'go behind': 'BEHIND',
            
            // IN FRONT OF 在前面
            '前面': 'IN_FRONT', '之前': 'IN_FRONT', '面前': 'IN_FRONT',
            'in front': 'IN_FRONT', 'front': 'IN_FRONT',
            
            // BETWEEN 在之間
            '之間': 'BETWEEN', '中間': 'BETWEEN', '夾住': 'BETWEEN',
            'between': 'BETWEEN',
            
            // AROUND 繞過/周圍
            '繞過': 'AROUND', '周圍': 'AROUND', '圍住': 'AROUND',
            'around': 'AROUND', 'go around': 'AROUND',
            
            // INTO 進入
            '入': 'INTO', '進入': 'INTO', '入去': 'INTO',
            'into': 'INTO', 'go into': 'INTO',
            
            // OUT OF 出去
            '出': 'OUT_OF', '出去': 'OUT_OF', '離開': 'OUT_OF',
            'out': 'OUT_OF', 'out of': 'OUT_OF',
            
            // BESIDE 在旁邊
            '旁邊': 'BESIDE', '隔籬': 'BESIDE', '側邊': 'BESIDE',
            'beside': 'BESIDE', 'next to': 'BESIDE',
            
            // INSIDE 在裡面
            '裡面': 'INSIDE', '入面': 'INSIDE', '內部': 'INSIDE',
            'inside': 'INSIDE',
            
            // OUTSIDE 在外面
            '外面': 'OUTSIDE', '出面': 'OUTSIDE', '外部': 'OUTSIDE',
            'outside': 'OUTSIDE',
            
            // ABOVE 在上面
            '上面': 'ABOVE', '上方': 'ABOVE',
            'above': 'ABOVE',
            
            // BELOW 在下面
            '下面': 'BELOW', '下方': 'BELOW',
            'below': 'BELOW'
        };
        
        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript.toLowerCase().trim();
            
            console.log('聽到:', text);
            
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
                this.micStatus.setText('🎤 聆聽中');
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
        this.player = this.add.circle(100, 400, 25, 0xff6b6b);
        this.playerText = this.add.text(85, 390, '🏃', { fontSize: '40px' });
        this.playerAction = 'idle';
    }

    createUI() {
        // 背景板
        this.add.rectangle(400, 60, 780, 110, 0x000000, 0.8);
        
        // 分數和統計
        this.scoreText = this.add.text(20, 20, '分數: 0', { 
            fontSize: '22px', 
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        
        this.livesText = this.add.text(20, 50, '❤️❤️❤️❤️❤️', { 
            fontSize: '22px'
        });
        
        this.accuracyText = this.add.text(20, 80, '準確率: 0%', {
            fontSize: '18px',
            fill: '#ffeb3b'
        });
        
        this.levelText = this.add.text(700, 20, 'Lv.1', { 
            fontSize: '24px', 
            fill: '#ffeb3b',
            fontStyle: 'bold'
        });
        
        // 麥克風狀態
        this.micIcon = this.add.text(650, 50, '🎤', { 
            fontSize: '24px'
        });
        this.micStatus = this.add.text(680, 55, '空格啟動', { 
            fontSize: '16px', 
            fill: '#ffffff'
        });
        
        // 按鍵提示面板
        this.add.rectangle(400, 560, 780, 70, 0x000000, 0.8);
        
        const hints = [
            '🎤 說出介詞 或 ⌨️ 按數字鍵',
            '1=穿過 2=跳過 3=底下 4=通過 5=爬上 6=後面 7=前面 8=之間 9=繞過 0=進入'
        ];
        
        this.add.text(400, 545, hints.join('\n'), {
            fontSize: '14px',
            fill: '#00ff00',
            align: 'center',
            lineSpacing: 2
        }).setOrigin(0.5);
        
        // 語音輸入顯示
        this.voiceDisplay = this.add.text(400, 150, '', {
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
        const startBox = this.add.rectangle(400, 300, 750, 520, 0x000000, 0.95);
        const startText = this.add.text(400, 130, '🎓 進階介詞挑戰！', {
            fontSize: '48px',
            fill: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const instructions = this.add.text(400, 310, 
            '16種介詞等你挑戰！\n\n🎤 語音模式：說出介詞名稱\n按空格鍵啟動/停止語音\n\n⌨️ 鍵盤模式：\n1=ACROSS穿過 2=OVER跳過 3=UNDER底下 4=THROUGH通過\n5=ONTO爬上 6=BEHIND後面 7=IN FRONT前面 8=BETWEEN之間\n9=AROUND繞過 0=INTO進入\n\n答對加分，答錯扣生命！\n難度會逐漸提升！',
            {
                fontSize: '18px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 4
            }
        ).setOrigin(0.5);
        
        const startButton = this.add.text(400, 510, '👆 點擊這裡或按空格鍵開始', {
            fontSize: '24px',
            fill: '#00ff00',
            fontStyle: 'bold',
            backgroundColor: '#333333',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
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
            
            if (this.voiceSupported) {
                const voiceTip = this.add.text(400, 250, '按空格鍵啟動語音！', {
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
        };
        
        startButton.on('pointerdown', startGame);
        this.input.keyboard.once('keydown', startGame);
    }

    update(time, delta) {
        if (this.isGameOver || !this.gameStarted) return;
        
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
        
        // 更新物件
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.x < -100) {
                if (!obstacle.answered) {
                    this.loseLife();
                    this.totalQuestions++;
                    this.updateAccuracy();
                }
                obstacle.destroy();
            }
        });
        
        // 檢查數字鍵（主鍵盤 + 小鍵盤）
        const keyMap = [
            { keys: [this.key1, this.numpad1], action: 'ACROSS' },
            { keys: [this.key2, this.numpad2], action: 'OVER' },
            { keys: [this.key3, this.numpad3], action: 'UNDER' },
            { keys: [this.key4, this.numpad4], action: 'THROUGH' },
            { keys: [this.key5, this.numpad5], action: 'ONTO' },
            { keys: [this.key6, this.numpad6], action: 'BEHIND' },
            { keys: [this.key7, this.numpad7], action: 'IN_FRONT' },
            { keys: [this.key8, this.numpad8], action: 'BETWEEN' },
            { keys: [this.key9, this.numpad9], action: 'AROUND' },
            { keys: [this.key0, this.numpad0], action: 'INTO' }
        ];
        
        for (let mapping of keyMap) {
            if (mapping.keys.some(key => key && Phaser.Input.Keyboard.JustDown(key))) {
                this.checkAnswer(mapping.action);
                break;
            }
        }
        
        // 升級
        if (this.score >= this.level * 150) {
            this.levelUp();
        }
    }

    spawnObstacle() {
        const types = [
            // 位置介詞
            { name: 'ACROSS', color: 0x4a90e2, icon: '🛣️', text: 'ACROSS\n穿過街道', key: '1' },
            { name: 'OVER', color: 0xe74c3c, icon: '🧱', text: 'OVER\n跳過障礙', key: '2' },
            { name: 'UNDER', color: 0x9b59b6, icon: '🌉', text: 'UNDER\n橋下穿過', key: '3' },
            { name: 'THROUGH', color: 0x1abc9c, icon: '🚇', text: 'THROUGH\n通過隧道', key: '4' },
            { name: 'ONTO', color: 0x2ecc71, icon: '📦', text: 'ONTO\n爬上平台', key: '5' },
            { name: 'BEHIND', color: 0x34495e, icon: '🏠', text: 'BEHIND\n躲在後面', key: '6' },
            { name: 'IN_FRONT', color: 0xf39c12, icon: '🚦', text: 'IN FRONT\n站在前面', key: '7' },
            { name: 'BETWEEN', color: 0xe67e22, icon: '🌳🌳', text: 'BETWEEN\n走在之間', key: '8' },
            { name: 'AROUND', color: 0x16a085, icon: '🔄', text: 'AROUND\n繞過障礙', key: '9' },
            { name: 'INTO', color: 0xc0392b, icon: '🚪', text: 'INTO\n進入房間', key: '0' }
        ];
        
        // 根據等級決定出現的介詞種類
        let availableTypes = types;
        if (this.level === 1) {
            availableTypes = types.slice(0, 5); // 只出現前5個
        } else if (this.level === 2) {
            availableTypes = types.slice(0, 7); // 出現前7個
        } else if (this.level === 3) {
            availableTypes = types.slice(0, 9); // 出現前9個
        }
        
        const randomType = Phaser.Math.RND.pick(availableTypes);
        const y = Phaser.Math.Between(220, 480);
        
        const obstacle = this.add.container(850, y);
        
        // 物件設計
        const shape = this.add.rectangle(0, 0, 100, 90, randomType.color);
        const icon = this.add.text(0, -15, randomType.icon, { 
            fontSize: '40px' 
        }).setOrigin(0.5);
        const label = this.add.text(0, 35, randomType.text, {
            fontSize: '13px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 },
            align: 'center'
        }).setOrigin(0.5);
        const keyLabel = this.add.text(40, -40, `[${randomType.key}]`, {
            fontSize: '16px',
            fill: '#ffff00',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 3, y: 2 }
        }).setOrigin(0.5);
        
        obstacle.add([shape, icon, label, keyLabel]);
        
        this.physics.add.existing(obstacle);
        obstacle.body.setVelocityX(-this.gameSpeed);
        
        obstacle.obstacleType = randomType.name;
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
        
        if (nearest && minDistance < 250) {
            nearest.answered = true;
            this.totalQuestions++;
            
            if (playerChoice === nearest.obstacleType) {
                this.correctAnswer(nearest, playerChoice);
            } else {
                this.wrongAnswer(nearest, playerChoice);
            }
        }
    }

    correctAnswer(obstacle, action) {
        this.score += 15;
        this.correctAnswers++;
        this.scoreText.setText('分數: ' + this.score);
        this.updateAccuracy();
        
        const feedback = this.add.text(obstacle.x, obstacle.y - 60, '✓ 正確！+15', {
            fontSize: '26px',
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
        
        const feedback = this.add.text(obstacle.x, obstacle.y - 60, 
            `✗ 錯誤！\n應該是 ${obstacle.obstacleType}`,
            {
                fontSize: '18px',
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

    updateAccuracy() {
        const accuracy = this.totalQuestions > 0 
            ? Math.round((this.correctAnswers / this.totalQuestions) * 100) 
            : 0;
        this.accuracyText.setText(`準確率: ${accuracy}%`);
    }

    playPlayerAnimation(action) {
        const actions = {
            'ACROSS': '🚶', 'OVER': '🤸', 'UNDER': '🧎', 'THROUGH': '🏃',
            'ONTO': '🧗', 'BEHIND': '🤫', 'IN_FRONT': '🙋', 'BETWEEN': '🚶',
            'AROUND': '🔄', 'INTO': '🚪'
        };
        
        this.playerText.setText(actions[action] || '🏃');
        
        this.tweens.add({
            targets: this.player,
            y: 350,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                this.playerText.setText('🏃');
            }
        });
    }

    loseLife() {
        this.lives--;
        const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(5 - this.lives);
        this.livesText.setText(hearts);
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    levelUp() {
        this.level++;
        this.levelText.setText('Lv.' + this.level);
        this.gameSpeed += 25;
        this.spawnInterval = Math.max(1500, this.spawnInterval - 250);
        
        const levelUpText = this.add.text(400, 300, 
            `🎉 Level ${this.level}! 🎉\n${this.level <= 3 ? '新介詞解鎖！' : '速度提升！'}`,
            {
                fontSize: '44px',
                fill: '#ffd700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        this.tweens.add({
            targets: levelUpText,
            scale: { from: 0, to: 1.2 },
            alpha: { from: 1, to: 0 },
            duration: 2500,
            onComplete: () => levelUpText.destroy()
        });
    }

    gameOver() {
        this.isGameOver = true;
        this.stopVoiceRecognition();
        
        this.obstacles.children.entries.forEach(obstacle => {
            obstacle.body.setVelocity(0);
        });
        
        const accuracy = this.totalQuestions > 0 
            ? Math.round((this.correctAnswers / this.totalQuestions) * 100) 
            : 0;
        
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);
        const gameOverBox = this.add.rectangle(400, 300, 650, 450, 0x2c3e50);
        
        const title = this.add.text(400, 160, '遊戲結束！', {
            fontSize: '52px',
            fill: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        let grade = '加油！';
        if (accuracy >= 90) grade = '🏆 大師級！';
        else if (accuracy >= 75) grade = '🥇 優秀！';
        else if (accuracy >= 60) grade = '🥈 良好！';
        else if (accuracy >= 50) grade = '🥉 及格！';
        
        const stats = this.add.text(400, 280, 
            `${grade}\n\n最終分數: ${this.score}\n達到等級: ${this.level}\n答對: ${this.correctAnswers}/${this.totalQuestions}\n準確率: ${accuracy}%\n\n你已掌握多個介詞用法！`,
            {
                fontSize: '22px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 6
            }
        ).setOrigin(0.5);
        
        const restartBtn = this.add.text(300, 460, '🔄 再玩一次', {
            fontSize: '26px',
            fill: '#ffffff',
            backgroundColor: '#27ae60',
            padding: { x: 18, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        const menuBtn = this.add.text(500, 460, '🏠 主選單', {
            fontSize: '26px',
            fill: '#ffffff',
            backgroundColor: '#3498db',
            padding: { x: 18, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        restartBtn.on('pointerdown', () => this.scene.restart());
        menuBtn.on('pointerdown', () => this.scene.start('MainMenuScene'));
        
        restartBtn.on('pointerover', () => restartBtn.setScale(1.1));
        restartBtn.on('pointerout', () => restartBtn.setScale(1));
        menuBtn.on('pointerover', () => menuBtn.setScale(1.1));
        menuBtn.on('pointerout', () => menuBtn.setScale(1));
    }
}

export default EnhancedVoiceGameScene;
