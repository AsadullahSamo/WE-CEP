const mongoose = require('mongoose');

const agriculturalDataSchema = new mongoose.Schema({
    year: {
        type: String,
        required: true
    },
    month: {
        type: Number,
        required: false
    },
    season: {
        type: String,
        enum: ['Rabi', 'Kharif', 'Annual'],
        required: false
    },
    crop: {
        type: String,
        required: true
    },
    production: {
        type: Number,
        required: true
    },
    area: {
        type: Number,
        required: true
    },
    cropsYield: {
        type: Number,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Virtual property to maintain backward compatibility with 'yield'
agriculturalDataSchema.virtual('yield').get(function() {
    return this.cropsYield;
});

agriculturalDataSchema.virtual('yield').set(function(value) {
    this.cropsYield = value;
});

// Ensure virtuals are included when converting to JSON
agriculturalDataSchema.set('toJSON', { virtuals: true });
agriculturalDataSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('AgriculturalData', agriculturalDataSchema);