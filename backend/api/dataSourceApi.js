const express = require('express');
const router = express.Router();
const dataFetcher = require('./dataFetcher');
const { exec } = require('child_process');
const path = require('path');

// Function to run the generate script
const runGenerateScript = () => {
    return new Promise((resolve, reject) => {
        console.log('Running data generation script for external sources...');
        const scriptPath = path.join(__dirname, '..', 'scripts', 'generateAgriculturalData.js');
        
        exec(`node ${scriptPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing script: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.error(`Script stderr: ${stderr}`);
            }
            console.log(`Script output: ${stdout}`);
            resolve();
        });
    });
};

// Get data from World Bank
router.get('/worldbank', async (req, res) => {
    try {
        // Check if refresh is requested
        const shouldRefresh = req.query.refresh === 'true';
        
        if (shouldRefresh) {
            try {
                await runGenerateScript();
                console.log('Data generation completed for World Bank request');
            } catch (error) {
                console.error('Failed to run generate script:', error.message);
                // Continue with regular data fetching as fallback
            }
        }
        
        const data = await dataFetcher.fetchWorldBankData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get data from USDA
router.get('/usda', async (req, res) => {
    try {
        // Check if refresh is requested
        const shouldRefresh = req.query.refresh === 'true';
        
        if (shouldRefresh) {
            try {
                await runGenerateScript();
                console.log('Data generation completed for USDA request');
            } catch (error) {
                console.error('Failed to run generate script:', error.message);
                // Continue with regular data fetching as fallback
            }
        }
        
        const data = await dataFetcher.fetchUSDAData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get data from Open Data Pakistan
router.get('/pakistan', async (req, res) => {
    try {
        // Check if refresh is requested
        const shouldRefresh = req.query.refresh === 'true';
        
        if (shouldRefresh) {
            try {
                await runGenerateScript();
                console.log('Data generation completed for Open Data Pakistan request');
            } catch (error) {
                console.error('Failed to run generate script:', error.message);
                // Continue with regular data fetching as fallback
            }
        }
        
        const data = await dataFetcher.fetchOpenDataPakistan();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get data from all sources
router.get('/all', async (req, res) => {
    try {
        // Check if refresh is requested
        const shouldRefresh = req.query.refresh === 'true';
        
        if (shouldRefresh) {
            try {
                await runGenerateScript();
                console.log('Data generation completed for all sources request');
            } catch (error) {
                console.error('Failed to run generate script:', error.message);
                // Continue with regular data fetching as fallback
            }
        }
        
        const { worldBank, usda, openDataPakistan } = await dataFetcher.fetchAllData();
        res.json({
            worldBank: worldBank || [],
            usda: usda || [],
            openDataPakistan: openDataPakistan || []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 