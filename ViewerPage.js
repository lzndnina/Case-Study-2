import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import "./stud1.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_URL = "http://localhost:5002/students";

const ViewerPage = ({ userRole }) => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [sortKey, setSortKey] = useState("id");
  const [viewLimit, setViewLimit] = useState(10);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false); // State for modal visibility

  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching Residents:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortKey(e.target.value);
  };

  const sortedStudents = [...students]
    .filter(student => {
      const searchValue = student[searchBy]?.toString().toLowerCase() || "";
      if (searchBy === "gender") {
        return searchValue === searchQuery.toLowerCase();
      } else {
        return searchValue.includes(searchQuery.toLowerCase());
      }
    })
    .sort((a, b) => {
      const valA = isNaN(a[sortKey]) ? a[sortKey].toLowerCase() : Number(a[sortKey]);
      const valB = isNaN(b[sortKey]) ? b[sortKey].toLowerCase() : Number(b[sortKey]);
      return valA < valB ? -1 : valA > valB ? 1 : 0;
    });


  const closePrintModal = () => {
    setIsPrintModalOpen(false); // Close the modal
  };

  const handlePrintModalContent = () => {
    window.print(); // Trigger browser print
  };

  return (
    <div>
      <div className="container" style={{ textAlign: 'center', marginTop: '0px', backgroundColor:'#fffef8', backgroundSize: 'cover', minWidth: '98%', minHeight: '100vh', marginLeft: '120px' }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" , marginTop:'-800px'}}>
          <select onChange={(e) => setViewLimit(e.target.value === "all" ? Infinity : Number(e.target.value))} value={viewLimit} style={{ padding: "8px", marginRight: "810px" , width:"250px"}}>
            <option value={5}>Show 5</option>
            <option value={10}>Show 10</option>
            <option value={20}>Show 20</option>
            <option value={50}>Show 50</option>
            <option value={100}>Show 100</option>
            <option value="all">Show All</option>
          </select>
          
          <input type="text" placeholder={`Search by ${searchBy}...`} value={searchQuery} onChange={handleSearchChange} style={{ padding: "8px", width: "250px", marginRight: "10px" }} />
          <button onClick={() => setSearchQuery("")} style={{ padding: "8px", marginRight: "40px" }}>
            Clear
          </button>
          <select onChange={handleSortChange} value={sortKey} style={{ padding: "8px", marginRight: "10px" }}>
            <option value="id">Sort by ID</option>
            <option value="name">Sort by Name</option>
            <option value="gender">Sort by Gender</option>
            <option value="contact">Sort by Contact</option>
            <option value="address">Sort by Address</option>
            <option value="employmentstatus">Sort by Employment Status</option>
            <option value="housenum">Sort by House Number</option>
            <option value="health">Sort by Health Status</option>
            <option value="householdcount">Sort by Household Count</option>
          </select>
        </div>
        <br/>
        <br/>
        <br />
        <h1 style={{ color: 'white', fontSize: '40px' }}>Resident List</h1> <br/>
        <table border="1" style={{ width: '70%' , backgroundColor:'white'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Sex</th>
              <th>Contact No.</th>
              <th>Address</th>
              <th>Employment Status</th>
              <th>House No.</th>
              <th>Health Status</th>
              <th>Birthday</th>
              <th>Household Count</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.slice(0, viewLimit).map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.gender}</td>
                <td>{student.contact}</td>
                <td>{student.address}</td>
                <td>{student.employmentstatus}</td>
                <td>{student.housenum}</td>
                <td>{student.health}</td>
                <td>{student.birthday}</td>
                <td>{student.householdcount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
      </div>

      
      <ToastContainer />
    </div>
  );
}

export default ViewerPage;