class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        // 加載logo圖片
        this.load.image('logo', 'assets/images/logo .jpg');
    }

    create() {
        // 背景
        this.add.rectangle(400, 300, 800, 600, 0x4a90e2).setAlpha(0.8);
        
        // 顯示logo（可選）
        // this.add.image(400, 100, 'logo').setDisplaySize(200, 100);
        
        // 標題
        this.add.text(400, 150, '🎮 介詞冒險遊戲', { 
            fontSize: '56px', 
            fontFamily: 'Arial',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // 副標題
        this.add.text(400, 220, '學習英文介詞的有趣方式！', { 
            fontSize: '24px', 
            fill: '#ffeb3b'
        }).setOrigin(0.5);

        // 開始按鈕 - 鍵盤模式
        const startButton = this.createButton(400, 280, '🎮 鍵盤模式', 0x4caf50);
        startButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('ActionGameScene');
        });
        
        // 語音模式按鈕
        const voiceButton = this.createButton(400, 360, '🎤 語音模式', 0xff5722);
        voiceButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('VoiceActionGameScene');
        });
        
        // 經典模式按鈕
        const classicButton = this.createButton(400, 440, '📚 經典關卡', 0x9c27b0);
        classicButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('CityLevelScene');
        });

        // 說明按鈕
        const instructionsButton = this.createButton(400, 520, '遊戲說明', 0x2196f3);
        instructionsButton.on('pointerdown', () => {
            this.showInstructions();
        });

        // 添加粒子效果
        this.createStars();
    }

    createButton(x, y, text, color) {
        const button = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 240, 60, color)
            .setInteractive({ useHandCursor: true });
        
        const label = this.add.text(0, 0, text, { 
            fontSize: '28px', 
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        button.add([bg, label]);
        
        // 滑鼠效果
        bg.on('pointerover', () => {
            bg.setScale(1.05);
        });
        bg.on('pointerout', () => {
            bg.setScale(1);
        });
        
        return bg;
    }

    showInstructions() {
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8)
            .setInteractive();
        
        const box = this.add.rectangle(400, 300, 650, 500, 0xffffff);
        
        const instructions = [
            '遊戲說明 Game Instructions',
            '',
            '學習英文介詞 Learn English Prepositions:',
            '📍 across (穿過) | through (通過)',
            '📍 over (跨過) | under (在...下)',
            '📍 onto (到...上) | behind (在...後)',
            '',
            '🏙️ 關卡 1 - 城市 City: 穿過街道 Walk across',
            '🌲 關卡 2 - 森林 Forest: 跳過障礙 Jump over',
            '🌴 關卡 3 - 叢林 Jungle: 跳到平台 Jump onto',
            '',
            '⌨️  方向鍵移動 Arrow keys to move',
            '🎯 完成任務獲得分數 Complete tasks for points',
            '💡 錯誤時會有提示 Get feedback on mistakes'
        ];
        
        const text = this.add.text(400, 280, instructions.join('\n'), {
            fontSize: '17px',
            fill: '#000',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);
        
        const closeButton = this.add.text(400, 450, '關閉', {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#f44336',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeButton.on('pointerdown', () => {
            overlay.destroy();
            box.destroy();
            text.destroy();
            closeButton.destroy();
        });
    }

    createStars() {
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const star = this.add.circle(x, y, 2, 0xffffff, 0.8);
            
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(1000, 2000),
                yoyo: true,
                repeat: -1
            });
        }
    }
}

export default MainMenuScene;