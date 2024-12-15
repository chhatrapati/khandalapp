const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mean_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('MongoDB connected'));

// Define Schemas and Models
const userSchema = new mongoose.Schema({
    fullName: String,
    aadhaarNumber: { type: String, unique: true },
    dob: Date,
    address: {
        area: String,
        city: String,
        state: String,
        country: String,
    },
    gotra: String,
    maritalStatus: String,
});

const relationSchema = new mongoose.Schema({
    personAadhaar: String,
    relativeAadhaar: String,
    relationType: String,
    isAlive: Boolean,
});

const User = mongoose.model('User', userSchema);
const Relation = mongoose.model('Relation', relationSchema);

// Routes

// Registration API
app.post('/api/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Search User by Aadhaar API
app.get('/api/search-user/:aadhaar', async (req, res) => {
    try {
        const user = await User.findOne({ aadhaarNumber: req.params.aadhaar });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.send(user);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Add Relation API
app.post('/api/add-relation', async (req, res) => {
    try {
        const relation = new Relation(req.body);
        await relation.save();
        res.status(201).send({ message: 'Relation added successfully' });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Generate Relation Tree API
app.get('/api/relation-tree/:aadhaar', async (req, res) => {
    try {
        const user = await User.findOne({ aadhaarNumber: req.params.aadhaar });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const relations = await Relation.find({ personAadhaar: req.params.aadhaar });

        res.send({ user, relations });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Custom Search API
app.post('/api/custom-search', async (req, res) => {
    const { excludeGotra, motherExcludeGotra, maritalStatus, ageLimit, ageComparison } = req.body;

    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'aadhaarNumber',
                    foreignField: '_id',
                    as: 'mother',
                },
            },
            {
                $match: {
                    gotra: { $ne: excludeGotra },
                    'mother.gotra': { $ne: motherExcludeGotra },
                    maritalStatus,
                    dob: {
                        [ageComparison === 'above' ? '$lte' : '$gte']: new Date(
                            new Date().setFullYear(new Date().getFullYear() - ageLimit)
                        ),
                    },
                },
            },
        ]);

        res.send(users);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Start Server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
