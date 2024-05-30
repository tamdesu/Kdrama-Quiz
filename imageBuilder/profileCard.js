const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const path = require('path');
const Jimp = require('jimp');

const generateProfileCard = async ({ username, displayName, exp, totalExp, targetExp, guildName, avatarUrl, level, userBadges }) => {
  try {
    // Fetch the image buffer using axios
    const fetchImageBuffer = async (url) => {
      try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(res.data, 'binary');
      } catch (error) {
        console.error('Error fetching image buffer:', error);
        throw error;
      }
    };

    let avatarBuffer, avatarImg, backgroundImg;
    // Load the avatar and background images
    try {
      avatarBuffer = await fetchImageBuffer(avatarUrl);

      // Use Jimp to read the image and convert it to PNG
      const avatarJimp = await Jimp.read(avatarBuffer);
      avatarImg = await new Promise((resolve, reject) => {
        avatarJimp.getBuffer(Jimp.MIME_PNG, async (err, buffer) => {
          if (err) return reject(err);
          resolve(await loadImage(buffer));
        });
      });

      backgroundImg = await loadImage(path.join(__dirname, './background.png'));
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }

    // Load badge images based on userBadges array
    const badgeImages = await Promise.all(userBadges.map(async badge => {
      const badgePath = path.join(__dirname, `./assets/${badge}.png`);
      return await loadImage(badgePath);
    }));

    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    // Draw the background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    // Draw the card background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Draw the circular avatar
    const diameter = 120;
    ctx.save();
    ctx.beginPath();
    ctx.arc(60 + diameter / 2, 50 + diameter / 2, diameter / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, 60, 50, diameter, diameter);
    ctx.restore();

    // Draw the circular badges
    const badgeDiameter = 40; // Diameter of the badge circles
    const badgeXStart = 580; // Starting X position for the first badge
    const badgeSpacing = 70; // Space between badges

    ctx.fillStyle = '#ffffff75';
    ctx.beginPath();
    ctx.arc(580, 115, badgeDiameter / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(650, 115, badgeDiameter / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(720, 115, badgeDiameter / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    badgeImages.forEach((badgeImg, index) => {
      const posX = badgeXStart + index * badgeSpacing;
      const posY = 115;
      

      const badgeWidth = 32;
      const aspectRatio = badgeImg.height / badgeImg.width;
      const badgeHeight = badgeWidth * aspectRatio;
      const badgeX = posX - badgeWidth / 2;
      const badgeY = posY - badgeHeight / 2;
      ctx.drawImage(badgeImg, badgeX, badgeY, badgeWidth, badgeHeight);
    });

    // Draw text and other elements
    ctx.fillStyle = 'white';
    ctx.font = '42px Arial';
    ctx.fillText(displayName, 190, 120);

    ctx.fillStyle = 'rgba(210, 210, 210, 1)';
    ctx.font = '20px Arial';
    ctx.fillText(`~${username}`, 190, 145);

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Level: ${level}`, canvas.width - 165, 237);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 190, canvas.width - 120, 160);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.fillRect(100, 290, canvas.width - 200, 30);

    ctx.fillStyle = 'white';
    ctx.fillRect(100, 290, (canvas.width - 200) * (exp / targetExp), 30);

    ctx.fillStyle = 'white';
    ctx.font = '22px Arial';
    ctx.fillText("Server: " + guildName , 100, 240);

    ctx.font = '14px Arial';
    ctx.fillText(`Exp: ${exp}/${targetExp}`, 100, 280);
    ctx.fillText(`Total Exp: ${totalExp}`, 620 - String(totalExp).length * 6, 280);

    ctx.font = '12px Arial';
    ctx.fillText("/ guildprofile", 620, 340);

    // Return the buffer
    return canvas.toBuffer('image/png');
  } catch (error) {
    throw new Error('Error generating profile card: ' + error.message);
  }
};

module.exports = { generateProfileCard };
