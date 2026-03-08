class ScoreSystem {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.totalScore = 0;
    }

    addScore(points) {
        this.score += points;
        this.totalScore += points;
        this.displayFeedback("正確！", points);
        return this.score;
    }

    resetScore() {
        this.score = 0;
    }

    getScore() {
        return this.score;
    }

    getTotalScore() {
        return this.totalScore;
    }

    displayFeedback(message, points) {
        if (this.scene) {
            const feedbackText = this.scene.add.text(
                this.scene.cameras.main.centerX, 
                100, 
                message + (points ? ` +${points} 分` : ''), 
                { 
                    fontSize: '28px', 
                    fill: '#00ff00',
                    stroke: '#000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);

            this.scene.tweens.add({
                targets: feedbackText,
                alpha: 0,
                y: 50,
                duration: 2000,
                onComplete: () => feedbackText.destroy()
            });
        } else {
            console.log(message + (points ? ` +${points} 分` : ''));
        }
    }

    handleIncorrectAnswer(correctAnswer) {
        const message = `錯誤！正確答案是 ${correctAnswer}`;
        if (this.scene) {
            this.scene.add.text(
                this.scene.cameras.main.centerX, 
                100, 
                message, 
                { 
                    fontSize: '24px', 
                    fill: '#ff0000',
                    stroke: '#000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);
        } else {
            console.log(message);
        }
    }

    createScoreDisplay(x, y) {
        if (this.scene) {
            this.scoreText = this.scene.add.text(x, y, `分數: ${this.score}`, {
                fontSize: '24px',
                fill: '#ffffff',
                stroke: '#000',
                strokeThickness: 3
            });
            return this.scoreText;
        }
        return null;
    }

    updateScoreDisplay() {
        if (this.scoreText) {
            this.scoreText.setText(`分數: ${this.score}`);
        }
    }
}

export default ScoreSystem;
