class JungleLevelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'JungleLevelScene' });
    }

    preload() {
        // 加載叢林背景圖片
        this.load.image('jungleBg', 'assets/images/jungle .jpg');
    }

    create() {
        this.score = 0;
        this.gemsCollected = 0;
        this.totalGems = 5;
        this.isCompleted = false;
        
        // 背景 - 使用上傳的叢林圖片
        this.add.image(400, 300, 'jungleBg').setDisplaySize(800, 600);
        
        // 地面
        const ground = this.add.rectangle(400, 550, 800, 100, 0x4a3c28);
        this.physics.add.existing(ground, true);
        
        // 叢林植物
        this.createJunglePlants();
        
        // 玩家
        this.player = this.physics.add.sprite(100, 450, null);
        this.player.setCircle(20);
        this.player.setDisplaySize(40, 40);
        this.player.body.setBounce(0.2);
        this.player.body.setCollideWorldBounds(true);
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0xff1744, 1);
        playerGraphics.fillCircle(100, 450, 20);
        this.add.text(85, 440, '🧗', { fontSize: '32px' });
        
        // 創建寶石（在平台之間 - 需要跳過去拿）
        this.gems = this.physics.add.group();
        this.createGems();
        
        // 平台
        this.platforms = this.physics.add.staticGroup();
        this.createPlatforms();
        
        // UI
        this.add.text(20, 20, 'Level 3: 叢林 Jungle', { fontSize: '28px', fill: '#fff', stroke: '#000', strokeThickness: 4 });
        this.taskText = this.add.text(400, 50, '任務 Task: Jump ONTO platforms 跳到平台收集寶石', { 
            fontSize: '22px', 
            fill: '#ffeb3b',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.add.text(400, 85, '"Onto" = 移動到表面上 Move to the top surface', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.scoreText = this.add.text(20, 120, `寶石 Gems: 0/${this.totalGems} | 分數 Score: 0 | 難度 Difficulty: ★★★`, { fontSize: '20px', fill: '#fff' });
        this.add.text(400, 560, '← → 移動 Move  |  SPACE 跳躍 Jump', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        
        this.startTime = this.time.now;
        
        // 物理碰撞
        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.gems, this.collectGem, null, this);
        
        // 鍵盤控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (this.isCompleted) return;
        
        // 移動玩家
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }
        
        // 跳躍
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
            this.player.setVelocityY(-400);
        }
    }

    createJunglePlants() {
        // 藤蔓和樹葉裝飾
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(50, 250);
            this.add.circle(x, y, Phaser.Math.Between(20, 40), 0x006400, 0.6);
        }
    }

    createPlatforms() {
        const platformData = [
            { x: 100, y: 500, w: 120 },
            { x: 280, y: 430, w: 100 },
            { x: 450, y: 370, w: 110 },
            { x: 620, y: 310, w: 100 },
            { x: 700, y: 450, w: 140 }
        ];
        
        platformData.forEach(p => {
            const platform = this.add.rectangle(p.x, p.y, p.w, 20, 0x8b4513);
            this.physics.add.existing(platform, true);
            this.platforms.add(platform);
        });
    }

    createGems() {
        const gemPositions = [
            { x: 280, y: 380 },
            { x: 450, y: 320 },
            { x: 620, y: 260 },
            { x: 700, y: 400 },
            { x: 550, y: 500 }
        ];
        
        gemPositions.forEach(pos => {
            const gem = this.add.circle(pos.x, pos.y, 15, 0x00ffff);
            this.physics.add.existing(gem);
            gem.body.setAllowGravity(false);
            this.gems.add(gem);
            
            // 添加閃爍效果
            this.tweens.add({
                targets: gem,
                scale: { from: 1, to: 1.3 },
                alpha: { from: 1, to: 0.6 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });
            
            this.add.text(pos.x - 10, pos.y - 15, '💎', { fontSize: '24px' });
        });
    }

    collectGem(player, gem) {
        gem.destroy();
        this.gemsCollected++;
        this.score += 50;
        this.scoreText.setText(`寶石 Gems: ${this.gemsCollected}/${this.totalGems} | 分數 Score: ${this.score} | 難度 Difficulty: ★★★`);
        
        // 收集效果
        const text = this.add.text(gem.x, gem.y, '+50 💎', { 
            fontSize: '28px', 
            fill: '#00ffff',
            stroke: '#000',
            strokeThickness: 3
        });
        this.tweens.add({
            targets: text,
            y: gem.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
        
        // 進度鼓勵
        if (this.gemsCollected === Math.floor(this.totalGems / 2)) {
            const encourage = this.add.text(400, 200, '繼續加油！\nKeep going!', {
                fontSize: '24px',
                fill: '#ffeb3b',
                stroke: '#000',
                strokeThickness: 3,
                align: 'center'
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: encourage,
                alpha: 0,
                duration: 2000,
                onComplete: () => encourage.destroy()
            });
        }
        
        // 檢查是否收集完所有寶石
        if (this.gemsCollected === this.totalGems) {
            this.completeGame();
        }
    }

    completeGame() {
        this.isCompleted = true;
        const timeTaken = Math.floor((this.time.now - this.startTime) / 1000);
        const timeBonus = timeTaken < 30 ? 100 : timeTaken < 60 ? 50 : 0;
        this.score += 200 + timeBonus;
        this.scoreText.setText(`寶石 Gems: ${this.gemsCollected}/${this.totalGems} | 分數 Score: ${this.score} | 難度 Difficulty: ★★★`);
        
        // 勝利畫面
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setScrollFactor(0);
        const successBox = this.add.rectangle(400, 300, 700, 500, 0xffd700).setScrollFactor(0);
        
        const title = this.add.text(400, 140, '🎉 恭喜完成！Congratulations! 🎉', {
            fontSize: '42px',
            fill: '#000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);
        
        const stats = this.add.text(400, 260, 
            `總分數 Total Score: ${this.score}\n完成時間 Time: ${timeTaken} 秒 seconds${timeBonus > 0 ? '\n⚡ 速度獎勵 Speed Bonus: +' + timeBonus : ''}\n\n你成功學習了 You learned:\n\n📍 ACROSS (穿過) - 從一邊到另一邊\n   From one side to the other\n\n📍 OVER (跨過) - 從上方越過\n   Pass above something\n\n📍 ONTO (到...上) - 移動到表面上\n   Move to the top surface`,
            {
                fontSize: '18px',
                fill: '#000',
                align: 'center',
                lineSpacing: 6
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        const restartButton = this.add.text(400, 430, '重新開始', {
            fontSize: '28px',
            fill: '#fff',
            backgroundColor: '#4caf50',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);
        
        restartButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
        
        restartButton.on('pointerover', () => {
            restartButton.setScale(1.1);
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setScale(1);
        });
    }
}

export default JungleLevelScene;