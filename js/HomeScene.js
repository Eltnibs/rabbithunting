class HomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HomeScene' });
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('startButton', 'assets/startButton.png');
        this.load.audio('startSound', 'assets/startSound.wav');
    }

    create() {
        this.add.tileSprite(400, 300, 800, 600, 'background');
        let startButton = this.add.sprite(400, 300, 'startButton').setInteractive();

        startButton.on('pointerdown', () => {
            this.sound.play('startSound');
            this.scene.start('GameScene');
        });

        this.add.text(150, 150, 'Rabbit Hunting', { fontSize: '64px', fill: '#fff', fontStyle: 'bold' });
    }
}
