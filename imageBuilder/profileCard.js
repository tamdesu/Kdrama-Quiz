const p5 = require('node-p5');
const fs = require('fs');
const fetch = require('node-fetch');

const generateProfileCard = async ({ username, displayName, exp, totalExp, avatarUrl, level }) => {
  // Fetch the avatar image as a buffer
  const fetchImageBuffer = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    return res.buffer();
  };

  // Initialize images to be used in preload
  let avatarBuffer, avatarImg, backgroundImg;

  try {
    avatarBuffer = await fetchImageBuffer(avatarUrl);
  } catch (error) {
    console.error('Error fetching avatar image:', error);
    throw error;
  }

  const sketch = (p) => {
    p.preload = () => {
      // Convert avatar buffer to image
      avatarImg = p.loadImage(avatarBuffer);
      backgroundImg = p.loadImage('./background.webp');
    };

    p.setup = () => {
      const width = 800;
      const height = 400;

      p.createCanvas(800, 400);

      // Draw background
      p.image(backgroundImg, 0, 0, 800, 400);

      // Draw overlay
      p.fill('rgba(0, 0, 0, 0.45)');
      p.noStroke();
      p.rect(30, 30, 800 - 60, 400 - 60, 12, 12);

      // Draw avatar
      p.ellipseMode(p.CENTER);
      p.imageMode(p.CENTER);
      p.ellipse(120, 110, 120, 120);
      p.image(avatarImg, 120, 110, 120, 120);

      // Draw texts
      p.fill(255);
      p.textSize(44);
      p.text(displayName, 190, 120);

      p.textSize(18);
      p.fill(70);
      p.text(`~${username}`, 190, 145);

      p.textSize(40);
      p.fill(255);
      p.text(`Level: ${level}`, 800 - 210, 120);

      p.textSize(22);
      p.text("Server: Otaku Realm", 100, 240);

      p.textSize(14);
      p.text(`Exp: ${exp}/${totalExp}`, 100, 280);
      p.text(`Total Exp: ${totalExp}`, 598, 280);

      p.textSize(10);
      p.text("/ guildprofile", 640, 340);

      // Experience bar
      p.fill('rgba(255, 255, 255, 0.16)');
      p.rect(100, 290, 800 - 200, 30, 4, 4);

      p.fill('#fff');
      p.rect(100, 290, (800 - 200) * (exp / totalExp), 30, 4, 4);

      // Convert canvas to buffer
      p.loadPixels();
      const buffer = p.canvas.toBuffer();
      return buffer;
    };

    p.draw = () => {
      // No need to loop
      p.noLoop();
    };
  };

  // Initialize p5 instance and return the buffer after setup completes
  const p5Instance = p5.createSketch(sketch);
  return new Promise((resolve) => {
    p5Instance.then((p) => {
      const buffer = p.canvas.toBuffer();
      resolve(buffer);
    });
  });
};

module.exports = { generateProfileCard };
