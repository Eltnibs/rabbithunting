class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('restartButton', 'assets/restartButton.png');
        this.load.audio('restartSound', 'assets/restartSound.wav');
    }

    create() {
        this.add.tileSprite(400, 300, 800, 600, 'background');
        let restartButton = this.add.sprite(400, 300, 'restartButton').setInteractive();

        this.add.text(200, 100, 'Game Over', { fontSize: '64px', fill: '#fff', fontStyle: 'bold' });

        restartButton.on('pointerdown', () => {
            this.sound.play('restartSound');
            this.scene.start('GameScene');
        });

        

    }
}
