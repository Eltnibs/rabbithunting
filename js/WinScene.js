class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    init(data) {
        this.score = data.score;
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('restartButton', 'assets/restartButton2.png');
        this.load.audio('restartSound', 'assets/restartSound.wav');
    }

    create() {

        this.add.tileSprite(400, 300, 800, 600, 'background');
        let restartButton = this.add.sprite(400, 400, 'restartButton').setInteractive();

        restartButton.on('pointerdown', () => {
            this.sound.play('restartSound');
            this.scene.start('GameScene');
        });
        
        this.add.text(200, 200, 'You Win!!', { fontSize: '80px', fill: '#964', fontStyle: 'bold' });
        this.add.text(300, 300, `Score: ${this.score}`, { fontSize: '32px', fill: '#fff', fontStyle: 'bold' });

    }
}
