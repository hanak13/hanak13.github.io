const https = require('https');
const fs = require('fs');

const files = [
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
    dest: 'html2pdf.bundle.min.js'
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    dest: 'qrcode.min.js'
  }
];

files.forEach(file => {
  https.get(file.url, (res) => {
    const fileStream = fs.createWriteStream(file.dest);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`✅ Downloaded: ${file.dest}`);
    });
  });
});