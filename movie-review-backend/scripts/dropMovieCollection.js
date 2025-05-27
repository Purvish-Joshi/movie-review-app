require('dotenv').config();
const mongoose = require('mongoose');

async function dropMovieCollection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await mongoose.connection.db.dropCollection('movies');
        console.log('Successfully dropped movies collection');
    } catch (error) {
        if (error.code === 26) {
            console.log('Movies collection does not exist - already cleaned up');
        } else {
            console.error('Error dropping movies collection:', error);
        }
    } finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

dropMovieCollection(); 