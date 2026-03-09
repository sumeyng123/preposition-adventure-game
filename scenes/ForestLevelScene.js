class ForestLevelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ForestLevelScene' });
    }

    preload() {
        // 加載森林背景圖片
        this.load.image('forestBg', 'assets/images/forest .jpg');
    }

    create() {
        this.score = 0;
        this.isCompleted = false;
        this.jumps = 0;
        
        // 背景 - 使用上傳的森林圖片
        this.add.image(400, 300, 'forestBg').setDisplaySize(800, 600);
        
        // 地面
        const ground = this.add.rectangle(400, 550, 800, 100, 0x654321);
        this.physics.add.existing(ground, true);
        
        // 樹木裝飾
        this.createTrees();
        
        // 玩家
        this.player = this.physics.add.sprite(100, 450, null);
        this.player.setCircle(20);
        this.player.setDisplaySize(40, 40);
        this.player.body.setBounce(0.2);
        this.player.body.setCollideWorldBounds(true);
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0xff6b6b, 1);
        playerGraphics.fillCircle(100, 450, 20);
        this.add.text(85, 440, '🏃', { fontSize: '32px' });
        
        // 創建障礙物（需要跳過）
        this.obstacles = this.physics.add.staticGroup();
        this.createObstacles();
        
        // 目標終點
        this.target = this.add.circle(700, 500, 30, 0xffd700);
        this.add.text(680, 485, '🏆', { fontSize: '40px' });
        
        // UI
        this.add.text(20, 20, 'Level 2: 森林 Forest', { fontSize: '28px', fill: '#fff', stroke: '#000', strokeThickness: 4 });
        this.taskText = this.add.text(400, 50, '任務 Task: Jump OVER the obstacles 跳過障礙物', { 
            fontSize: '22px', 
            fill: '#ffeb3b',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.add.text(400, 85, '"Over" = 從上方越過 Pass above something', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.scoreText = this.add.text(20, 120, '分數 Score: 0 | 跳躍 Jumps: 0 | 難度 Difficulty: ★★☆', { fontSize: '20px', fill: '#fff' });
        this.add.text(400, 560, '← → 移動 Move  |  SPACE 跳躍 Jump', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        
        // 錯誤提示
        this.mistakeCount = 0;
        
        // 物理碰撞
        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);
        
        // 鍵盤控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    hitObstacle(player, obstacle) {
        if (!this.lastHitTime || this.time.now - this.lastHitTime > 2000) {
            this.lastHitTime = this.time.now;
            this.mistakeCount++;
            
            const feedback = this.add.text(400, 150, '❌ 記得要跳過去！\nRemember to jump OVER!', {
                fontSize: '24px',
                fill: '#ff0000',
                stroke: '#ffffff',
                strokeThickness: 3,
                align: 'center'
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: feedback,
                alpha: 0,
                y: 100,
                duration: 2000,
                onComplete: () => feedback.destroy()
            });
        }
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
            this.jumps++;
            this.scoreText.setText('分數: ' + this.score + ' | 跳躍: ' + this.jumps);
        }
        
        // 檢查是否到達終點
        if (this.player.x > 650 && Math.abs(this.player.y - 500) < 100) {
            this.completeLevel();
        }
    }

    createTrees() {
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(100, 300);
            // 樹幹
            this.add.rectangle(x, y, 20, 60, 0x654321);
            // 樹葉
            this.add.circle(x, y - 40, 35, 0x228b22);
        }
    }

    createObstacles() {
        const obstaclePositions = [250, 400, 550];
        obstaclePositions.forEach(x => {
            const obstacle = this.add.rectangle(x, 510, 50, 80, 0x8b4513);
            this.physics.add.existing(obstacle, true);
            this.obstacles.add(obstacle);
            // 添加視覺標記
            this.add.text(x - 15, 495, '🪵', { fontSize: '40px' });
        });
    }

    completeLevel() {
        this.isCompleted = true;
        this.score += 150;
        this.scoreText.setText('分數: ' + this.score + ' | 跳躍: ' + this.jumps);
        
        const bonus = this.mistakeCount === 0 ? 50 : 0;
        if (bonus > 0) {
            this.score += bonus;
            this.scoreText.setText('分數 Score: ' + this.score + ' | 跳躍 Jumps: ' + this.jumps + ' | 難度 Difficulty: ★★☆');
        }
        
        const successBox = this.add.rectangle(400, 300, 550, 260, 0x4caf50).setScrollFactor(0);
        const successText = this.add.text(400, 230, '✓ 完成！ Completed!', {
            fontSize: '44px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);
        
        const nextText = this.add.text(400, 310, `正確跳過 Correctly jumped OVER obstacles!\n\n跳躍次數 Jumps: ${this.jumps}\n錯誤次數 Mistakes: ${this.mistakeCount}\n${bonus > 0 ? '完美通關！Perfect! +' + bonus : ''}\n\n進入最後一關 Final level...`, {
            fontSize: '19px',
            fill: '#fff',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5).setScrollFactor(0);
        
        this.time.delayedCall(3000, () => {
            this.scene.start('JungleLevelScene');
        });
    }
}

export default ForestLevelScene;