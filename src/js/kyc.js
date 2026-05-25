// kyc.js - eKYC Module with OCR & Webcam Biometric matching

export class eKYCModule {
  constructor(appState, localization) {
    this.appState = appState;
    this.localization = localization;
    this.stream = null;
    this.isScanning = false;
  }

  // Handle Citizenship Document OCR simulation
  simulateOCR(file, callback) {
    // Generate mock extracted data based on a real Nepalese Nagarikta structure
    const firstNames = ["Hari", "Shiva", "Ram", "Sita", "Gita", "Krishna", "Arjun", "Puja"];
    const lastNames = ["Thapa", "Adhikari", "Shrestha", "Karki", "Dahal", "Poudel", "Bhattarai"];
    const districts = ["Kathmandu", "Lalitpur", "Bhaktapur", "Kaski", "Morang", "Chitwan", "Rupandehi"];
    
    const randomName = firstNames[Math.floor(Math.random() * firstNames.length)] + " " + lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
    const randomCardNo = `${Math.floor(Math.random() * 80) + 1}-${Math.floor(Math.random() * 99) + 1}-${Math.floor(Math.random() * 99) + 1}-${Math.floor(Math.random() * 99999) + 10000}`;
    const randomDOB = `${Math.floor(Math.random() * 20) + 2030}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`; // Bikram Sambat
    const randomIssueDate = `${Math.floor(Math.random() * 10) + 2060}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`;

    setTimeout(() => {
      const ocrResult = {
        fullName: randomName,
        citizenshipNo: randomCardNo,
        dobBS: randomDOB,
        district: randomDistrict,
        issueDateBS: randomIssueDate,
        rawText: `श्री ५ को सरकार \n नागरिकता प्रमाण-पत्र \n प्रमाण-पत्र नं: ${randomCardNo} \n नाम थर: ${randomName} \n जन्मस्थान: ${randomDistrict} \n जारी मिति: ${randomIssueDate}`
      };
      callback(ocrResult);
    }, 2500); // 2.5s OCR simulation delay
  }

  // Camera permissions and stream setup
  async startCamera(videoElementId) {
    const video = document.getElementById(videoElementId);
    if (!video) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, facingMode: "user" } 
      });
      video.srcObject = this.stream;
      video.play();
      return true;
    } catch (err) {
      console.warn("Webcam access denied. Proceeding with video emulation.", err);
      // Create visual mock inside video element if camera fails
      this.setupCameraFallback(video);
      return false;
    }
  }

  // Fallback for environments where camera is unavailable
  setupCameraFallback(videoElement) {
    const parent = videoElement.parentElement;
    videoElement.style.display = "none";
    
    // Create custom virtual face scan animator
    const fallbackBox = document.createElement("div");
    fallbackBox.id = "webcam-fallback";
    fallbackBox.className = "webcam-fallback-container";
    fallbackBox.innerHTML = `
      <div class="virtual-face">
        <div class="eye left"></div>
        <div class="eye right"></div>
        <div class="mouth"></div>
        <div class="scanning-mesh"></div>
      </div>
      <div class="fallback-status">Biometric Stream Emulated</div>
    `;
    parent.appendChild(fallbackBox);
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    const fallback = document.getElementById("webcam-fallback");
    if (fallback) fallback.remove();
  }

  // Facial Biometric check animation with mesh overlays
  verifyBiometrics(canvasElementId, onComplete) {
    if (this.isScanning) return;
    this.isScanning = true;

    const canvas = document.getElementById(canvasElementId);
    if (!canvas) {
      this.isScanning = false;
      return;
    }

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    
    let scanLineY = 0;
    let scanDirection = 1;
    let frame = 0;
    const maxFrames = 150; // Scan for 5 seconds

    const animateScan = () => {
      if (!this.isScanning) return;

      // Clear previous frames
      ctx.clearRect(0, 0, width, height);

      // Render a biometric scanning box
      ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
      ctx.lineWidth = 1;
      
      // Draw grid
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      // Draw feature mapping nodes (facial mesh simulation)
      ctx.fillStyle = "#00F2FE";
      ctx.strokeStyle = "#00F2FE";
      
      const nodes = [
        { x: width/2, y: height/3 - 10 },    // Forehead
        { x: width/2 - 30, y: height/2 - 20 }, // Left Eye
        { x: width/2 + 30, y: height/2 - 20 }, // Right Eye
        { x: width/2, y: height/2 + 10 },    // Nose tip
        { x: width/2, y: height/2 + 40 },    // Mouth center
        { x: width/2 - 50, y: height/2 + 20 }, // Left Cheek
        { x: width/2 + 50, y: height/2 + 20 }, // Right Cheek
        { x: width/2 - 40, y: height/2 + 70 }, // Jawline Left
        { x: width/2 + 40, y: height/2 + 70 }, // Jawline Right
        { x: width/2, y: height/2 + 90 }     // Chin
      ];

      // Draw mesh connection lines
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(0, 242, 254, 0.5)";
      
      // Eyes to nose
      ctx.moveTo(nodes[1].x, nodes[1].y); ctx.lineTo(nodes[3].x, nodes[3].y);
      ctx.moveTo(nodes[2].x, nodes[2].y); ctx.lineTo(nodes[3].x, nodes[3].y);
      // Cheeks to nose & chin
      ctx.moveTo(nodes[5].x, nodes[5].y); ctx.lineTo(nodes[3].x, nodes[3].y);
      ctx.moveTo(nodes[6].x, nodes[6].y); ctx.lineTo(nodes[3].x, nodes[3].y);
      ctx.moveTo(nodes[5].x, nodes[5].y); ctx.lineTo(nodes[7].x, nodes[7].y);
      ctx.moveTo(nodes[6].x, nodes[6].y); ctx.lineTo(nodes[8].x, nodes[8].y);
      // Mouth to chin
      ctx.moveTo(nodes[4].x, nodes[4].y); ctx.lineTo(nodes[9].x, nodes[9].y);
      ctx.stroke();

      // Draw nodes
      nodes.forEach((n, idx) => {
        ctx.beginPath();
        // Add dynamic pulse sizes based on frame index
        const pulse = 3 + Math.sin(frame / 5 + idx) * 1.5;
        ctx.arc(n.x, n.y, pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw scanning laser bar
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#10B981";
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.moveTo(10, scanLineY);
      ctx.lineTo(width - 10, scanLineY);
      ctx.stroke();
      
      // Reset shadows
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Update scan line position
      scanLineY += 3 * scanDirection;
      if (scanLineY >= height - 10 || scanLineY <= 10) {
        scanDirection *= -1;
      }

      frame++;
      if (frame < maxFrames) {
        requestAnimationFrame(animateScan);
      } else {
        this.isScanning = false;
        ctx.clearRect(0, 0, width, height);
        this.stopCamera();
        
        // Return verification status
        const similarityScore = (92 + Math.random() * 7).toFixed(1); // 92% to 99%
        onComplete({
          success: true,
          matchConfidence: similarityScore,
          verifiedAt: new Date().toISOString()
        });
      }
    };

    animateScan();
  }
}
