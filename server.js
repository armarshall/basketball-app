const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Create uploads folder
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// MongoDB Atlas connection - USE THIS EXACT STRING
mongoose.connect('mongodb+srv://testuser:testuser@cluster0.gpibipl.mongodb.net/basketball-app?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('MongoDB connection error:', err));

// Image model
const Image = mongoose.model('Image', {
  filename: String,
  url: String,
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

// Multer setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Upload route
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const image = new Image({
      filename: req.file.filename,
      url: `http://localhost:5000/uploads/${req.file.filename}`
    });
    
    await image.save();
    
    res.json({ 
      success: true,
      message: 'Image uploaded successfully!',
      image: image
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to save image to database' 
    });
  }
});

// Get all images
app.get('/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ uploadDate: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.listen(5000, () => {
  console.log('✅ Backend server running on http://localhost:5000');
});