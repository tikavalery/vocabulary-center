const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const PDF = require('./models/PDF');

dotenv.config();

// Sample PDF data
const samplePDFs = [
  {
    title: 'Spanish Vocabulary Essentials',
    language: 'Spanish',
    price: 9.99,
    description: 'Comprehensive Spanish vocabulary guide with 1000+ essential words and phrases. Perfect for beginners and intermediate learners.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    pdfFileUrl: 'https://example.com/spanish-vocab.pdf'
  },
  {
    title: 'French Language Mastery',
    language: 'French',
    price: 12.99,
    description: 'Master French vocabulary with this detailed guide covering everyday conversations, business terms, and cultural expressions.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    pdfFileUrl: 'https://example.com/french-vocab.pdf'
  },
  {
    title: 'German Vocabulary Builder',
    language: 'German',
    price: 10.99,
    description: 'Build your German vocabulary systematically with categorized word lists, example sentences, and pronunciation guides.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    pdfFileUrl: 'https://example.com/german-vocab.pdf'
  },
  {
    title: 'Italian Conversational Guide',
    language: 'Italian',
    price: 8.99,
    description: 'Learn Italian through practical vocabulary organized by topics like travel, food, shopping, and more.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    pdfFileUrl: 'https://example.com/italian-vocab.pdf'
  },
  {
    title: 'Japanese Hiragana & Katakana',
    language: 'Japanese',
    price: 14.99,
    description: 'Complete guide to Japanese writing systems with vocabulary lists, stroke order, and practice exercises.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    pdfFileUrl: 'https://example.com/japanese-vocab.pdf'
  },
  {
    title: 'Mandarin Chinese Basics',
    language: 'Chinese',
    price: 13.99,
    description: 'Essential Mandarin vocabulary with Pinyin pronunciation, tones, and common phrases for daily communication.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    pdfFileUrl: 'https://example.com/chinese-vocab.pdf'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vocabulary-center', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await PDF.deleteMany({});
    // await User.deleteMany({});

    // Create admin user
    const adminUser = await User.findOne({ email: 'admin@vocabulary.com' });
    if (!adminUser) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@vocabulary.com',
        password: 'admin123', // Will be hashed automatically
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created:', admin.email);
    } else {
      console.log('Admin user already exists');
    }

    // Create sample PDFs
    const existingPDFs = await PDF.countDocuments();
    if (existingPDFs === 0) {
      await PDF.insertMany(samplePDFs);
      console.log(`Created ${samplePDFs.length} sample PDFs`);
    } else {
      console.log('PDFs already exist in database');
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();

