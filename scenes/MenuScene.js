class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 深色神秘背景
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a0033);
        
        // 添加星空效果
        this.createStars();
        
        // 標題 - 魔法風格
        const title = this.add.text(width / 2, 120, '🔮 Preposition Portal 🔮', {
            fontSize: '56px',
            fill: '#b366ff',
            fontFamily: 'Arial Black',
            stroke: '#4d0099',
            strokeThickness: 8,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5);
        
        // 添加標題發光效果
        this.tweens.add({
            targets: title,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // 故事文字
        const story = this.add.text(width / 2, 220, 
            '你是 Alex 巫師學徒\n\n' +
            'Fog Fiends 用神秘霧氣遮蓋了 Preposition Portal！\n' +
            '閃避障礙物，選擇正確咒語，大叫正確介詞來驅逐它們\n\n' +
            '生存得越久，解鎖新世界！',
            {
                fontSize: '20px',
                fill: '#00ffff',
                align: 'center',
                lineSpacing: 8,
                wordWrap: { width: 650 }
            }
        ).setOrigin(0.5);
        
        // 開始按鈕
        const startButton = this.createButton(width / 2, 420, '✨ 開始冒險 ✨', 0x6600cc);
        startButton.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene');
            });
        });
        
        // 教學按鈕
        const tutorialButton = this.createButton(width / 2, 500, '📖 遊戲教學', 0x0066cc);
        tutorialButton.on('pointerdown', () => {
            this.showTutorial();
        });
        
        // 底部提示
        this.add.text(width / 2, 560, '使用 ← → 鍵移動，↑ 跳躍，↓ 蹲下', {
            fontSize: '16px',
            fill: '#888888',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    createButton(x, y, text, color) {
        const button = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 300, 60, color)
            .setInteractive({ useHandCursor: true });
        
        const label = this.add.text(0, 0, text, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        button.add([bg, label]);
        
        // 懸停效果
        bg.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });
        
        bg.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });
        
        return bg;
    }
    
    createStars() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 創建200顆星星
        for (let i = 0; i < 200; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(1, 3);
            
            const star = this.add.circle(x, y, size, 0xffffff, 0.8);
            
            // 閃爍動畫
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }
    
    showTutorial() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 半透明遮罩
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
            .setInteractive();
        
        // 教學文字
        const tutorial = this.add.text(width / 2, height / 2 - 50,
            '🎮 遊戲教學 🎮\n\n' +
            '目標：生存越久越好！\n\n' +
            '控制：\n' +
            '← → 左右移動\n' +
            '↑ 跳躍（閃避鳥類）\n' +
            '↓ 蹲下（閃避石頭）\n\n' +
            'Fog Fiend 出現時：\n' +
            '1️⃣ 看句子（例如：The cat is ___ the box）\n' +
            '2️⃣ 選擇正確圖像（點擊或按數字鍵 1-4）\n' +
            '3️⃣ 或大叫介詞（開啟麥克風）\n\n' +
            '答對：驅逐霧怪 +分數 +生命\n' +
            '答錯或超時：失去生命\n\n' +
            '💡 提示：越快答對，分數越高！',
            {
                fontSize: '18px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 6,
                backgroundColor: '#220055',
                padding: { x: 30, y: 20 }
            }
        ).setOrigin(0.5);
        
        // 關閉按鈕
        const closeButton = this.add.text(width / 2, height / 2 + 240, '✖ 關閉', {
            fontSize: '24px',
            fill: '#ff6666',
            backgroundColor: '#660000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeButton.on('pointerdown', () => {
            overlay.destroy();
            tutorial.destroy();
            closeButton.destroy();
        });
    }
}

export default MenuScene;
