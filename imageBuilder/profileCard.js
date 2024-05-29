const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const path = require('path');
const Jimp = require('jimp');

const generateProfileCard = async ({ username, displayName, exp, totalExp, avatarUrl, level }) => {
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
      avatarJimp.getBuffer(Jimp.MIME_PNG, async (err, buffer) => {
        if (err) throw err;
        avatarImg = await loadImage(buffer);
      });

      backgroundImg = await loadImage(path.join(__dirname, './background.png'));
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }

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

    // Draw text and other elements
    ctx.fillStyle = 'white';
    ctx.font = '44px Arial';
    ctx.fillText(displayName, 190, 120);

    ctx.fillStyle = 'rgba(70, 70, 70, 1)';
    ctx.font = '18px Arial';
    ctx.fillText(`~${username}`, 190, 145);

    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.fillText(`Level: ${level}`, canvas.width - 210, 120);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 190, canvas.width - 120, 160);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.fillRect(100, 290, canvas.width - 200, 30);

    ctx.fillStyle = 'white';
    ctx.fillRect(100, 290, (canvas.width - 200) * (exp / totalExp), 30);

    ctx.fillStyle = 'white';
    ctx.font = '22px Arial';
    ctx.fillText("Server: Otaku Realm", 100, 240);

    ctx.font = '14px Arial';
    ctx.fillText(`Exp: ${exp}/${totalExp}`, 100, 280);
    ctx.fillText(`Total Exp: ${totalExp}`, 598, 280);

    ctx.font = '10px Arial';
    ctx.fillText("/ guildprofile", 640, 340);

    // Return the buffer
    return canvas.toBuffer('image/png');
  } catch (error) {
    throw new Error('Error generating profile card: ' + error.message);
  }
};

module.exports = { generateProfileCard };
