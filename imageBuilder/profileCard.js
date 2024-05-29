const p5 = require('node-p5');

const generateProfileCard = async ({ username, displayName, exp, totalExp, avatarUrl, level }) => {
  const resourcesToPreload = {
    avatar: p5.loadImage(avatarUrl)
  };

  function sketch(p, preloaded) {
    let avatar = preloaded.avatar;

    p.setup = () => {
      let canvas = p.createCanvas(800, 400);
      p.background(220);
      p.fill("#00000075");
      p.noStroke();
      p.rect(30, 30, p.width - 60, p.height - 60, 12, 12);

      let diameter = 120;

      // Create a circular mask
      let mask = p.createGraphics(diameter, diameter);
      mask.ellipse(diameter / 2, diameter / 2, diameter, diameter);

      // Apply the mask to the avatar
      avatar.mask(mask);

      // Draw the masked avatar
      p.image(avatar, 60, 50, diameter, diameter);

      p.textSize(44);
      p.fill(255);
      p.text(displayName, 190, 120);
      p.textSize(18);
      p.fill(70);
      p.text(`~${username}`, 190, 145);
      p.textSize(40);
      p.fill(255);
      p.textStyle(p.BOLD);
      p.text(`Level: ${level}`, p.width - 210, 120);

      p.strokeWeight(3);
      p.stroke(255);
      p.fill("#00000000");
      p.rect(60, 190, p.width - 120, 160, 12, 12);
      p.strokeWeight(1);
      p.fill('#ffffff28');
      p.rect(100, 290, p.width - 200, 30, 4, 4);
      p.fill('#fff');
      p.rect(100, 290, (p.width - 200) * (exp / totalExp), 30, 4, 4);
      p.textSize(22);
      p.textStyle(p.BOLD);
      p.noStroke();
      p.text("Server: Otaku Realm", 100, 240);
      p.textSize(14);
      p.textStyle(p.BOLD);
      p.noStroke();
      p.text(`Exp: ${exp}/${totalExp}`, 100, 280);
      p.text(`Total Exp: ${totalExp}`, 598, 280);
      p.textSize(10);
      p.text("/ guildprofile", 640, 340);

      p.noLoop();
    };
  }

  return new Promise((resolve, reject) => {
    const p5Instance = p5.createSketch(sketch, resourcesToPreload);
    setTimeout(() => {
      const canvas = p5Instance.canvas;
      if (canvas) {
        resolve(canvas.toBuffer());
      } else {
        reject(new Error('Failed to generate profile card.'));
      }
    }, 5000); // Adjust timeout as necessary
  });
};

module.exports = { generateProfileCard };
