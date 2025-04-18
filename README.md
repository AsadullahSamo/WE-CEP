# 🌾 Pakistan Agricultural Data Reporting System

![License](https://img.shields.io/badge/license-MIT-blue.svg)

A comprehensive web-based platform for visualizing, analyzing, and reporting agricultural statistics in Pakistan. This system integrates data from multiple sources including World Bank and USDA to provide actionable insights on crop production, yield, and agricultural trends.

## ✨ Features

### 📊 Data Visualization & Analysis
- **Interactive Charts** - Dynamic visualization of agricultural trends over time
- **Statistical Summaries** - Comprehensive statistical analysis of production data
- **Trend Analysis** - Growth rate calculations and trend identification 
- **Production Overview** - Visual representation of crop production metrics

### 🔍 Data Management
- **Advanced Filtering** - Filter by year, crop, region, and free text search
- **Paginated Data Tables** - Browse through large datasets with ease
- **Real-time Updates** - Manual refresh capability to fetch latest data
- **Data Export** - Export data as CSV or PDF for reporting and further analysis

### 🔄 Integration
- **Multi-source Data** - Integration with World Bank and USDA agricultural datasets
- **Normalized Data** - Consistent data representation across different sources
- **External Data Sources** - View and compare data from international agencies

### 💻 User Experience
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Modern UI** - Clean, intuitive interface with dark mode support
- **Performance Optimized** - Fast loading and data processing

## 🚀 Technical Stack

### Frontend
- **React.js** - Component-based UI development
- **Chart.js** - Data visualization library
- **CSS3** - Custom styling with responsive design

### Backend
- **Node.js** - JavaScript runtime for server-side logic
- **Express** - Web application framework
- **MongoDB** - NoSQL database for flexible data storage

### APIs & Data Sources
- **RESTful API** - Clean API architecture for data access
- **World Bank API** - Integration for international agricultural data
- **USDA API** - United States Department of Agriculture data integration

## 🔧 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Getting Started

1. **Clone the repository**
   ```bash
   git clone
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the backend directory:
   ```
   MONGODB_URI=your_mongodb_uri
   PORT=5000
   ```

4. **Initialize the database with mock data**
   ```bash
   cd database
   node initMongoDB.js
   ```
   This will populate your MongoDB database with agricultural statistics from Open Data Pakistan.

5. **Run the application**
   
   Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
   
   Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```
   
   The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
├── backend/
│   ├── models/         # MongoDB data models
│   ├── controllers/    # API controllers
│   ├── api/            # API route definitions and data fetchers
│   └── scripts/        # Data processing scripts
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API service layer
│   │   └── utils/      # Frontend utilities
│   └── public/         # Static assets
└── database/           # Database scripts and schemas
```

## 📖 API Documentation

### Key Endpoints

#### Agricultural Data
- `GET /api/agricultural` - Fetch all agricultural data
- `GET /api/agricultural/year/:year` - Get data for specific year
- `GET /api/agricultural/crop/:crop` - Get data for specific crop
- `GET /api/agricultural/region/:region` - Get data for specific region
- `POST /api/agricultural` - Add new agricultural data
- `PUT /api/agricultural/:id` - Update existing data
- `DELETE /api/agricultural/:id` - Remove data entry

#### External Data Sources
- `GET /api/data-sources` - Get all external data sources
- `GET /api/data-sources/world-bank` - Get World Bank data
- `GET /api/data-sources/usda` - Get USDA data

## 📈 Data Features

### Statistical Analysis
- **Production Metrics** - Total and average production calculations
- **Area Analysis** - Total and average area under cultivation
- **Yield Calculations** - Average yield across crops and regions
- **Growth Rates** - Year-over-year growth analysis
- **Regional Comparison** - Compare agricultural stats across regions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Acknowledgements

- World Bank for providing agricultural data APIs
- United States Department of Agriculture (USDA) for comprehensive agricultural statistics
- The open-source community for the tools that made this project possible
