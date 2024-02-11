const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Get access to the camera
async function getCameraAccess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        handleStream(stream);
    } catch (error) {
        console.error('Error getting camera access:', error);
    }
}

// Handle the stream from the camera
function handleStream(stream) {
    video.srcObject = stream;
    video.play();

    // Set up the capture button event listener
    captureButton.addEventListener('click', captureImage);
}

// Capture an image and display it
async function captureImage() {
    const photo = document.createElement('canvas');
    photo.width = video.videoWidth;
    photo.height = video.videoHeight;

    context.drawImage(video, 0, 0, photo.width, photo.height);

    // Display the captured image
    canvas.style.display = 'block';
    context.drawImage(photo, 0, 0, canvas.width, canvas.height);

    // You can now send the captured image to a server or process it further
}

getCameraAccess();