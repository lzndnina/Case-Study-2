import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'; // Register Bar chart elements
import "./stud1.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_URL = "http://localhost:5002/students";

const EditorPage = ({ userRole }) => {
  const [formData, setFormData] = useState({ id: '', name: '', gender: '', contact: '', address: '', employmentstatus: '', housenum: '', health: '', birthday: '', householdcount: '' });
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [sortKey, setSortKey] = useState("id");
  const [viewLimit, setViewLimit] = useState(10);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value); // Update search criteria
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      toast.success('Residents added successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', gender: '', contact: '', address: '', employmentstatus: '', housenum: '', health: '', birthday: '', householdcount: '' });
    } catch (error) {
      toast.error('Error adding Residents!');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.id}`, formData);
      toast.success('Student updated successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', gender: '', contact: '', address: '', employmentstatus: '', housenum: '', health: '', birthday: '', householdcount: '' });
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating Residents!');
    }
  };


  const handleEdit = (student) => {
    setFormData(student);
    setIsEditing(true);
  };

  const handleSortChange = (e) => {
    setSortKey(e.target.value);
  };

  const sortedStudents = [...students]
    .filter(student => {
      const searchValue = student[searchBy]?.toString().toLowerCase() || "";
      if (searchBy === "gender") {
        // For gender, match exact strings 'male' or 'female' (case-insensitive)
        return searchValue === searchQuery.toLowerCase();
      } else {
        // For other fields, use partial matching
        return searchValue.includes(searchQuery.toLowerCase());
      }
    })
    .sort((a, b) => {
      const valA = isNaN(a[sortKey]) ? a[sortKey].toLowerCase() : Number(a[sortKey]);
      const valB = isNaN(b[sortKey]) ? b[sortKey].toLowerCase() : Number(b[sortKey]);
      return valA < valB ? -1 : valA > valB ? 1 : 0;
    });


   


  return (
    <div style={{ background: '#fffef8', marginLeft:'300px' }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '20px', backgroundColor:'#fffef8', backgroundSize: 'cover', 
    backgroundPosition: 'center', marginLeft:'-80px',
    backgroundRepeat: 'no-repeat', minWidth: '98%', minHeight: '100vh', marginTop: '-5px' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        
  <div 
    className="list-container" 
    style={{ 
      width: '95%', 
      padding: '20px', 
      borderRadius: '10px' ,
      backgroundColor:'#fffef8',
      backgroundSize: 'cover', 
    backgroundPosition: 'center', 
    backgroundRepeat: 'no-repeat' , 
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "20px" }}>
    <select onChange={(e) => setViewLimit(e.target.value === "all" ? Infinity : Number(e.target.value))} value={viewLimit} style={{ padding: "8px", marginRight: "500px" , width:"250px"}}>
      <option value={5}>Show 5</option>
      <option value={10}>Show 10</option>
      <option value={20}>Show 20</option>
      <option value={50}>Show 50</option>
      <option value={100}>Show 100</option>a
      <option value="all">Show All</option> {/* Add this option */}
    </select>
  
          <input type="text" placeholder={`Search by ${searchBy}...`} value={searchQuery} onChange={handleSearchChange} style={{ padding: "8px", width: "250px", marginRight: "10px" }} />
          <button onClick={() => setSearchQuery("")} style={{ padding: "8px", marginRight: "60px" }}>
            Clear
          </button>
      <select onChange={handleSortChange} value={sortKey} style={{ padding: "8px", marginRight: "60px" }}>
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
    <h1  style={{color:'white', fontSize:'40px'}}>Resident List</h1>
    
  <table border="1" style={{ width: '95%' ,backgroundColor:'black'}}>
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
          <th>Actions</th>
        </tr>
      </thead>
      <tbody style={{backgroundColor:'white' }}>
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
            <td>
              <button 
                onClick={() => handleEdit(student)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: '#CB997E', 
                  fontSize: '1.2em' 
                }}
              >
                <i className="fas fa-edit"></i> 
              </button>
              
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    
    <br/>
  </div>
  <div 
    className="form-container" 
    style={{ 
      width: '20%', 
      padding: '20px', 
      backgroundColor:'#B7B7A4', 
    backgroundSize: 'cover', 
    backgroundPosition: 'center', 
    backgroundRepeat: 'no-repeat' , 
      borderRadius: '10px', 
      height: '800px' ,
      marginTop: '10px',
      marginLeft:'-90px'
    }}
  >
    <h3 style={{ marginTop: '10px', color:'white', fontSize:'30px'}}>Resident Information Form</h3>
    <form 
      onSubmit={isEditing ? handleEditSubmit : handleAddSubmit} 
      style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '70px'}}
    >
      <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required disabled={isEditing} />
      <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required />
      <input type="number" name="contact" placeholder="Contact No." value={formData.contact} onChange={handleChange} required />
      <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
      <input type="text" name="employmentstatus" placeholder="Employment Status" value={formData.employmentstatus} onChange={handleChange} required />
      <input type="text" name="housenum" placeholder="House No." value={formData.housenum} onChange={handleChange} required />
      <input type="text" name="health" placeholder="Health Status" value={formData.health} onChange={handleChange} required />
      <div className="form-group">
        <label htmlFor="dateenrolled" className="date-label" style={{ marginLeft: '0px', color: 'black', fontSize:'15px'}}>Birthday</label>
        <input type="date" name="birthday" id="birthday" value={formData.birthday} onChange={handleChange} required />
      </div>
      <input type="text" name="householdcount" placeholder="Household Count" value={formData.householdcount} onChange={handleChange} required />
      <button type="submit">{'Update Resident'}</button>
    </form>

  </div>
  </div>
<br/>
</div>
      <ToastContainer />

    </div> 
);
}

export default EditorPage;