const p5 = require('node-p5');
const fs = require('fs');
const fetch = require('node-fetch');

const generateProfileCard = async ({ username, displayName, exp, totalExp, avatarUrl, level }) => {
  const preload = (p) => {
    p.backgroundImg = p.loadImage('./background.webp');
    p.avatarImg = p.loadImage(avatarUrl);
  };

  const setup = (p) => {
    const width = 800;
    const height = 400;
    const avatarDiameter = 120;

    p.createCanvas(width, height);

    // Draw background
    p.image(p.backgroundImg, 0, 0, width, height);

    // Draw overlay
    p.fill('rgba(0, 0, 0, 0.45)');
    p.noStroke();
    p.rect(30, 30, width - 60, height - 60, 12, 12);

    // Draw avatar
    p.ellipseMode(p.CENTER);
    p.imageMode(p.CENTER);
    p.ellipse(120, 110, avatarDiameter, avatarDiameter);
    p.image(p.avatarImg, 120, 110, avatarDiameter, avatarDiameter);

    // Draw texts
    p.fill(255);
    p.textSize(44);
    p.text(displayName, 190, 120);

    p.textSize(18);
    p.fill(70);
    p.text(`~${username}`, 190, 145);

    p.textSize(40);
    p.fill(255);
    p.text(`Level: ${level}`, width - 210, 120);

    p.textSize(22);
    p.text("Server: Otaku Realm", 100, 240);

    p.textSize(14);
    p.text(`Exp: ${exp}/${totalExp}`, 100, 280);
    p.text(`Total Exp: ${totalExp}`, 598, 280);

    p.textSize(10);
    p.text("/ guildprofile", 640, 340);

    // Experience bar
    p.fill('rgba(255, 255, 255, 0.16)');
    p.rect(100, 290, width - 200, 30, 4, 4);

    p.fill('#fff');
    p.rect(100, 290, (width - 200) * (exp / totalExp), 30, 4, 4);

    // Convert canvas to buffer
    const buffer = p.canvas.toBuffer();
    return buffer;
  };

  const sketch = (p) => {
    p.preload = () => preload(p);
    p.setup = () => {
      const buffer = setup(p);
      fs.writeFileSync('./profileCard.png', buffer);
      p.noLoop();
    };
  };

  // Initialize p5 instance
  const p5Instance = p5.createSketch(sketch);

  // Wait for the sketch to complete
  return new Promise((resolve) => {
    p5Instance.then(() => {
      const buffer = fs.readFileSync('./profileCard.png');
      resolve(buffer);
    });
  });
};

module.exports = { generateProfileCard };
