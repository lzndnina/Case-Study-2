import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import "./stud1.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const API_URL = "http://localhost:5002/students";

const calculateHouseholdSizeCategories = (students) => {
  const householdSizeCategories = students.reduce((acc, student) => {
    const category =
      student.householdcount <= 2 ? "1-2" :
      student.householdcount <= 4 ? "3-4" :
      student.householdcount <= 6 ? "5-6" : "7+";
    
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return {
    labels: Object.keys(householdSizeCategories),
    datasets: [
      {
        data: Object.values(householdSizeCategories),
        backgroundColor: [
          "#b0ba85",  
          "#7f8b59 ",   
          "#6b7448", 
          "#a8b178", 
        ],
        borderColor: [
          "black",  
          "black",   
          "black", 
          "black", 
        ],
        borderWidth: 1,
      }      
    ],
  };
};

const chartOptions1 = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // Make it a horizontal bar graph
  plugins: {
    legend: {
      display: false, // Remove legend
    },
  },
  scales: {
    x: {
      grid: {
        display: false, // Remove grid lines on x-axis
      },
      ticks: {
        display: true, // Keep x-axis labels
      },
    },
    y: {
      grid: {
        display: false, // Remove grid lines on y-axis
      },
      ticks: {
        display: true, // Keep y-axis labels
      },
    },
  },
};


const calculateHouseholdPerAddress = (students) => {
  return students.reduce((acc, student) => {
    const key = `${student.address}-${student.housenum}`;
    if (!acc[key]) {
      acc[key] = Number(student.householdcount);
    }
    return acc;
  }, {});
};

const PictographTable = ({ data }) => {
  return (
    <table style={{ width: '90%', marginLeft: '0 auto', borderCollapse: 'collapse', color: 'maroon', fontSize: '20px', marginTop: '0px' }}>
      <thead>
        <tr style={{ backgroundColor: '#f5e6d0c4', borderBottom: '2px solid maroon' }}>
          <th style={{ padding: '10px', border: '1px solid maroon' }}>Address</th>
          <th style={{ padding: '10px', border: '1px solid maroon' }}>Total Count</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([key, count]) => {
          const address = key.split('-')[0];
          return (
            <tr key={key} style={{ borderBottom: '1px solid maroon' }}>
              <td style={{ padding: '10px', border: '1px solid maroon' }}>{address}</td>
              <td style={{ padding: '10px', border: '1px solid maroon' }}>{Array(count).fill("🙍🏼‍♀️").join(" ")} = {count}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};


const calculateAgeTrend = (students) => {
  const sortedStudents = [...students].sort(
    (a, b) => new Date(a.birthday) - new Date(b.dateenrolled)
  );

  const labels = sortedStudents.map((student) =>
    new Date(student.birthday).toLocaleDateString()
  );

  const data = sortedStudents.map(
    (student) =>
      new Date().getFullYear() - new Date(student.birthday).getFullYear()
  );

  return {
    labels,
    datasets: [
      {
        data,
        fill: false,
        backgroundColor: "#1c3244",
        borderColor: "#1c3244",
        borderWidth: 2,
        tension: 0.5,
      },
    ],
  };
};

const chartOptions3 = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Remove legend
    },
  },
  scales: {
    x: {
      grid: {
        display: false, // Remove x-axis grid lines
      },
      ticks: {
        display: true, // Keep x-axis labels
      },
    },
    y: {
      grid: {
        display: false, // Remove y-axis grid lines
      },
      ticks: {
        display: true, // Keep y-axis labels
      },
    },
  },
};

const AnalyticsPage = () => {
  const [students, setStudents] = useState([]);
  const householdSizeCategoriesData = calculateHouseholdSizeCategories(students);
  const householdPerAddressData = calculateHouseholdPerAddress(students);
  const ageTrendData = calculateAgeTrend(students);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching Resident:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Prepare data for the pie chart
  const healthStatusDistribution = students.reduce((acc, student) => {
    acc[student.health] = (acc[student.health] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(healthStatusDistribution),
    datasets: [
      {
        label: 'Number of Residents',
        data: Object.values(healthStatusDistribution),
        backgroundColor: [
          "#b0ba85",  
          "#7f8b59 ",   
          "#6b7448", 
          "#a8b178"
        ],
        borderColor: [
          'black'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for the gender distribution bar chart
const genderDistribution = students.reduce((acc, student) => {
  acc[student.gender] = (acc[student.gender] || 0) + 1;
  return acc;
}, {});

const genderBarChartData = {
  labels: Object.keys(genderDistribution),
  datasets: [
    {
      data: Object.values(genderDistribution),
      backgroundColor: '#b0ba85',
      borderColor: 'black',
      borderWidth: 1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Remove legend
    },
  },
  scales: {
    x: {
      grid: {
        display: false, // Remove grid lines on x-axis
      },
      ticks: {
        display: true, // Keep x-axis labels
      },
    },
    y: {
      grid: {
        display: false, // Remove grid lines on y-axis
      },
      ticks: {
        display: true, // Hide y-axis labels (optional)
      },
    },
  },
};

  return (
    <div style={{backgroundColor:'#b0ba85', marginLeft:'215px'}}>
      <h1 style={{ fontSize: '50px', color:'black' }}>Data Visualization</h1>
    <div className="container" style={{ textAlign: 'center', marginTop: '0px', color: 'red' }}>
      <table style={{ border: '2px solid white' }}>
        <thead>
          <tr>
            <th style={{ backgroundColor: 'white' }}>
              <h2 style={{ fontSize: '35px' , color:'black' }}>Health Status Distribution</h2>
              <div style={{ width: '70%', height: '400px', marginLeft: '25%' }}>
                <Pie data={pieChartData} />
              </div>
            </th>
            <th style={{ backgroundColor: 'white' }}>
              <h2 style={{ fontSize: '35px', color:'black' }}>Gender Distribution</h2>
              <div style={{ width: '70%', height: '400px', margin: '0 auto' }}>
                <Bar data={genderBarChartData} options={chartOptions} />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ backgroundColor: 'white' }}>
            <td style={{ backgroundColor: 'white' }}>
              <h2 style={{ fontSize: '35px' , color:'black' }}>Household Size Categories</h2>
              <div style={{ width: '70%', height: '400px', margin: '0 auto' }}>
                <Bar data={householdSizeCategoriesData} options={chartOptions1 } />
              </div>
            </td>
            <td style={{ backgroundColor: 'white' }}>
              <h2 style={{ fontSize: '35px' , color:'black' }}>Age Trend</h2>
              <div style={{ width: '70%', height: '400px', margin: '0 auto' }}>
                <Line data={ageTrendData} options={chartOptions3} />
              </div>
            </td>
          </tr>
          
        </tbody>
      </table>
      <br/><br/><br/>
      
      
      </div>
  </div>
  );
};

export default AnalyticsPage;