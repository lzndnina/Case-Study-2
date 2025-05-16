import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faHome, faMale, faFemale } from '@fortawesome/free-solid-svg-icons';
import './HomePage.css'; // Make sure to create and import this CSS file
import { Bar, Line } from 'react-chartjs-2'; // Import Bar and Line chart

const DashboardPage = ({ userRole }) => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalHouseNumber, setTotalHouseNumber] = useState(0);
  const [totalMaleResidents, setTotalMaleResidents] = useState(0); // New state variable
  const [totalFemaleResidents, setTotalFemaleResidents] = useState(0); // New state variable
  const [employmentData, setEmploymentData] = useState({ labels: [], datasets: [] });
  const [averageHouseholdData, setAverageHouseholdData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5002/students');
        const students = response.data;
        setTotalStudents(students.length);
        setTotalHouseNumber(new Set(students.map(student => student.housenum)).size);
        
        
        setTotalMaleResidents(students.filter(student => student.gender === 'male' || 'Male').length); // Calculate total male residents
        setTotalFemaleResidents(students.filter(student => student.gender === 'female' || 'Female').length); // Calculate total female residents

        // Calculate employment data
        const employmentData = calculateEmploymentData(students);
        setEmploymentData(employmentData);

        // Calculate average household data
        const averageHouseholdData = calculateAverageHouseholdData(students);
        setAverageHouseholdData(averageHouseholdData);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    const calculateEmploymentData = (students) => {
      const employmentstatus = {
        employed: 0,
        unemployed: 0,
        student: 0,
        retiree: 0,
      };

      students.forEach(student => {
        if (student.employmentstatus === 'employed') {
          employmentstatus.employed += 1;
        } else if (student.employmentstatus === 'unemployed') {
          employmentstatus.unemployed += 1;
        } else if (student.employmentstatus === 'student') {
          employmentstatus.student += 1;
        } else if (student.employmentstatus === 'retiree') {
          employmentstatus.retiree += 1;
        }
      });

      return {
        labels: ['Employed', 'Unemployed', 'Students', 'Retiree'],
        datasets: [
          {
            label: 'Employment Status',
            data: [employmentstatus.employed, employmentstatus.unemployed, employmentstatus.student, employmentstatus.retiree],
            backgroundColor: ['rgba(250, 8, 81, 0.6)', 'rgba(160, 29, 29, 0.6)', 'rgba(240, 0, 0, 0.6)', 'rgba(233, 92, 45, 0.6)'],
            borderColor: ['rgb(135, 11, 19)'],
            borderWidth: 1,
          },
        ],
      };
    };

    const calculateAverageHouseholdData = (students) => {
      const houseNumbers = [...new Set(students.map(student => student.housenum))];
      const averageHouseholdCounts = houseNumbers.map(houseNum => {
        const houseStudents = students.filter(student => student.housenum === houseNum);
        const totalHouseholdCount = houseStudents.reduce((acc, student) => acc + parseInt(student.householdcount, 10), 0);
        return totalHouseholdCount / houseStudents.length;
      });

      return {
        labels: houseNumbers,
        datasets: [
          {
            label: 'Average Household Count',
            data: averageHouseholdCounts,
            backgroundColor: 'rgba(186, 61, 61, 0.6)',
            borderColor: 'rgb(177, 56, 56)',
            borderWidth: 1,
            fill: false,
            tension: 0.5,
          },
        ],
      };
    };

    fetchStudents();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Employment Status',
          color: '#333',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
        title: {
          display: true,
          text: 'Count',
          color: '#333',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 16,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
        },
        footerFont: {
          size: 12,
          style: 'italic',
        },
        callbacks: {
          label: function (context) {
            return `Count: ${context.raw}`;
          },
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'House Numbers',
          color: '#333',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
        title: {
          display: true,
          text: 'Average Household Count',
          color: '#333',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 16,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
        },
        footerFont: {
          size: 12,
          style: 'italic',
        },
        callbacks: {
          label: function (context) {
            return `Average: ${context.raw}`;
          },
        },
      },
    },
  };

  

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', height: '1400px', backgroundColor: '#fffef8',  backgroundPosition: 'center', maxWidth: '100%', marginTop: '0px', marginLeft:'215px' }}>
        <div style={{ flex: 1, paddingRight: '20px' }}>
          <br /><br /><br /><br />
          <h1 style={{ textAlign: 'center', fontSize: '60px', color:'black', borderRadius: "30px", width:'95%' }}> {capitalizeFirstLetter(userRole)}'s Portal!</h1> <br/><br/><br/>
          
          {userRole === 'viewer' && (
            <div className="stats-container" style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <div className="stat-box">
                <FontAwesomeIcon icon={faUsers} size="3x" />
                <h2>Total Residents</h2>
                <p>{totalStudents}</p>
              </div> 
              <br/><br/><br/><br/><br/><br/> 
              <div className="stat-box">
                <FontAwesomeIcon icon={faHome} size="3x" />
                <h2>Total House Number</h2>
                <p>{totalHouseNumber}</p>
              </div>
            </div>
          )}

          {userRole === 'editor' && (
            <div className="stats-container" style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <div className="stat-box">
                <FontAwesomeIcon icon={faUsers} size="3x" />
                <h2>Total Residents</h2>
                <p>{totalStudents}</p>
              </div> 
              <br/><br/><br/><br/><br/><br/> 
              <div className="stat-box">
                <FontAwesomeIcon icon={faHome} size="3x" />
                <h2>Total House Number</h2>
                <p>{totalHouseNumber}</p>
              </div>
            </div>
          )}
        

        {userRole === 'admin' && (
  <div className="stats-container" style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '100px', color: 'black' }}>
    <div>
      <div className="stat-box" style={{height:'35%'}}>
        <FontAwesomeIcon icon={faUsers} size="3x" />
        <h2>Total Residents</h2>
        <p>{totalStudents}</p>
      </div> <br/><br/><br/><br/><br/>
      <div className="stat-box">
        <FontAwesomeIcon icon={faHome} size="3x" />
        <h2>Total House Number</h2>
        <p>{totalHouseNumber}</p>
      </div><br/><br/>
    </div>
    <div>
      <div className="stat-box">
        <FontAwesomeIcon icon={faMale} size="3x" />
        <h2>Total Male Residents</h2>
        <p>{totalMaleResidents}</p>
      </div><br/><br/><br/><br/><br/>
      <div className="stat-box">
        <FontAwesomeIcon icon={faFemale} size="3x" />
        <h2>Total Female Residents</h2>
        <p>{totalFemaleResidents}</p>
      </div>
    </div>
  </div>
)}
          
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;