# soundCloud-UI

# Setup serve file âm thanh cho mobile client (dev environment)
1. viết file server.js đặt trong thư mục music-download (thư mục chứa file nhạc) để serve file nhạc,như sau:
<details>
<summary>server.js</summary>

```javascript
const express = require('express');
const path = require('path');
const app = express();

const musicFolder = __dirname;

// Serve file tĩnh tại http://<ip>:3000/music/<tên-file.mp3>
app.use('/music', express.static(musicFolder));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🎵 Local music server running at http://localhost:${PORT}/music`);
});
```
</details>
<details>
<summary>package.json</summary>

```json
{
  "name": "music-downloads",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "express": "^5.1.0"
  }
}
```
</details>

`npm install && npm start` để chạy

2. Thiết lập để mobile client gọi được server này
- server chạy trên localhost:3000 của máy tính, mobile client không thể gọi được, cần reverse port bằng adb:
```cmd
adb reverse tcp:3000 tcp:3000
```

3. Convert path
- Xong bước 2, mobile client đã có thể truy cập file âm thanh qua `localhost:3000/music/{filename}`, nhưng path trả về của BE hơi khác (dạng D:\~\soundCloud-BE\music-downloads\1.mp3) nên cần convert lại thành dạng http://localhost:3000/music/1.mp3 để mobile client có thể gọi được.
- Sử dụng hàm convertPath trong file `src/utils/convertPath.js`
<details>
<summary>Ví dụ:</summary>

```javascript
    let newTrack: Track = {
    id: trackId,
    url: String(convertPathToUrl(streamUrl)),
    title: trackInfo.name,
    artist: trackInfo.artists?.join(' & ') || 'Unknown Artist',
    artwork: track.albumImages[0].url,
    }
```
</details>

---
Note for Quân:
- Với mã hiện tại cần đổi cách đặt tên file âm thanh khi tải về (ví dụ {id}.mp3) để tránh trùng tên và tránh lỗi định dạng ký tự với những tên bài hát không phải latinh.
- Xem xét thử `yt-dlp --get-url`, cái này trả về public url luôn thay vì tải xuống, không cần tải và serve file, convert path nữa, tuy nhiên vẫn có những hạn chế:
    - Lần đầu get url vẫn mất thời gian khá lâu gần tương đương tải về
    - url có expire sau 4 tiếng (có thể check trong url trả về)