class CityLevelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CityLevelScene' });
    }

    preload() {
        // 加載城市背景圖片
        this.load.image('cityBg', 'assets/images/city-background.jpg');
    }

    create() {
        this.score = 0;
        this.isCompleted = false;
        
        // 背景 - 使用上傳的城市圖片
        this.add.image(400, 300, 'cityBg').setDisplaySize(800, 600);
        
        // 地面
        this.add.rectangle(400, 550, 800, 100, 0x808080);
        
        // 建築物
        this.createBuildings();
        
        // 街道
        this.add.rectangle(400, 400, 800, 150, 0x404040);
        for (let i = 0; i < 800; i += 50) {
            this.add.rectangle(i, 400, 30, 5, 0xffff00);
        }
        
        // 玩家
        this.player = this.add.circle(100, 350, 20, 0xff0000);
        this.add.text(85, 340, '🚶', { fontSize: '32px' });
        
        // 目標
        this.target = this.add.circle(700, 350, 30, 0x00ff00);
        this.add.text(680, 335, '🏠', { fontSize: '40px' });
        
        // UI
        this.add.text(20, 20, 'Level 1: 城市 City', { fontSize: '28px', fill: '#fff', stroke: '#000', strokeThickness: 4 });
        this.taskText = this.add.text(400, 50, '任務 Task: Walk ACROSS the street 穿過街道', { 
            fontSize: '22px', 
            fill: '#ffeb3b',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.add.text(400, 85, '"Across" = 從一邊到另一邊 From one side to the other', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.scoreText = this.add.text(20, 120, '分數 Score: 0 | 難度 Difficulty: ★☆☆', { fontSize: '20px', fill: '#fff' });
        
        // 控制提示
        this.add.text(400, 560, '使用 Use ← → 方向鍵 Arrow keys 移動 to move', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        
        // 鍵盤控制
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.isCompleted) return;
        
        // 移動玩家
        if (this.cursors.left.isDown) {
            this.player.x -= 3;
        } else if (this.cursors.right.isDown) {
            this.player.x += 3;
        }
        
        // 限制移動範圍
        this.player.x = Phaser.Math.Clamp(this.player.x, 50, 750);
        
        // 檢查是否到達目標
        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.target.x, this.target.y
        );
        
        if (distance < 50) {
            this.completeLevel();
        }
    }

    createBuildings() {
        const buildings = [
            { x: 100, w: 80, h: 150, color: 0x8b4513 },
            { x: 220, w: 100, h: 200, color: 0xa0522d },
            { x: 360, w: 90, h: 180, color: 0xcd853f },
            { x: 490, w: 110, h: 220, color: 0xdeb887 },
            { x: 640, w: 85, h: 160, color: 0xd2691e },
            { x: 750, w: 95, h: 190, color: 0xbc8f8f }
        ];
        
        buildings.forEach(b => {
            this.add.rectangle(b.x, 325 - b.h/2, b.w, b.h, b.color);
            // 窗戶
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 4; j++) {
                    this.add.rectangle(
                        b.x - 20 + i * 20, 
                        280 - b.h/2 + j * 30,
                        12, 15, 0xffff00
                    );
                }
            }
        });
    }

    completeLevel() {
        this.isCompleted = true;
        this.score += 100;
        this.scoreText.setText('分數: ' + this.score);
        
        // 成功訊息
        const successBox = this.add.rectangle(400, 300, 550, 240, 0x4caf50);
        const successText = this.add.text(400, 250, '✓ 完成！ Completed!', {
            fontSize: '44px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const nextText = this.add.text(400, 320, '正確使用 Correct use of "ACROSS"\n穿過街道 Walking across the street!\n\n+100 分 points! 🎉\n\n進入下一關 Next level...', {
            fontSize: '20px',
            fill: '#fff',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5);
        
        // 3秒後進入下一關
        this.time.delayedCall(3000, () => {
            this.scene.start('ForestLevelScene');
        });
    }
}

export default CityLevelScene;