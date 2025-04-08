import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ProductionChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="no-data">No data available</div>;
    }

    // Process data for the chart
    const chartData = {
        labels: data.map(item => item.year),
        datasets: [
            {
                label: 'Production',
                data: data.map(item => item.production),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'rgba(255, 255, 255, 0.87)'
                }
            },
            title: {
                display: true,
                text: 'Agricultural Production Over Time',
                color: 'rgba(255, 255, 255, 0.87)'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.87)'
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.87)'
                }
            }
        }
    };

    return (
        <div className="production-chart">
            <h2>Production Trends</h2>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default ProductionChart; 