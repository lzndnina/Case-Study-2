import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js'; // Register Bar chart elements
import { QRCodeCanvas } from 'qrcode.react';
import "./stud1.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const API_URL = "http://localhost:5002/students";

const AdminPage = ({ userRole }) => {
  const [formData, setFormData] = useState({ id: '', name: '', gender: '', contact: '', address: '', employmentstatus: '', housenum: '', health: '', birthday: '', householdcount: '' });
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("name"); // New state for search criteria
  const [deletedStudent, setDeletedStudent] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [sortKey, setSortKey] = useState("id");
  const [viewLimit, setViewLimit] = useState(10);
  const [qrCodeData, setQrCodeData] = useState(null);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value); // Update search criteria
  };

  const handleSortChange = (e) => {
    setSortKey(e.target.value);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      toast.success('Resident added successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', gender: '', contact: '', address: '', employmentstatus: '', housenum: '', health: '', birthday: '', householdcount: '' });
    } catch (error) {
      toast.error('Error adding Resident!');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.id}`, formData);
      toast.success('Resident updated successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', gender: '', contact: '', address: '', employmentstatus: '', housenum: '', health: '', birthday: '', householdcount: '' });
      setIsEditing(false);
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      toast.error('Error updating Resident!');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    
    if (!confirmDelete) {
        return; // If the user doesn't confirm, do nothing
    }

    try {
        const studentToDelete = students.find((s) => s.id === id);
        setDeletedStudent(studentToDelete);

        setStudents(students.filter((s) => s.id !== id));

        const timeout = setTimeout(async () => {
          await axios.delete(`${API_URL}/${id}`, { data: { confirmation: true } });
          setDeletedStudent(null);
        }, 5002);

        setUndoTimeout(timeout);
        toast.success('Resident deleted!');
    } catch (error) {
        console.error('Error deleting Resident:', error);
        toast.error('Error deleting stuResidentdent!');
    }
  };

  const undoDelete = async () => {
    if (deletedStudent) {
      try {
        clearTimeout(undoTimeout);
        await axios.put(`${API_URL}/${deletedStudent.id}`, deletedStudent); // Use PUT instead of POST
        setStudents([...students, deletedStudent]);
        setDeletedStudent(null);
        toast.success('Undo successful! Resident restored.');
      } catch (error) {
        console.error('Error restoring Resident:', error);
        toast.error('Error restoring Resident!');
      }
    }
  };

  const handleEdit = (student) => {
    setFormData(student);
    setIsEditing(true);
    setIsModalOpen(true); // Open the modal
  };

  const handleGenerateQRCode = (id) => {
    const resident = students.find((s) => s.id === id);
    if (resident) {
      const qrData = `Resident Details
 ID: ${resident.id}
 Name: ${resident.name}
 Address: ${resident.address}`;
      setQrCodeData(qrData); // Set the data to be rendered by QRCodeCanvas
    } else {
      toast.error('Resident not found!');
    }
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('.qr-modal-content canvas'); // Select the QRCodeCanvas
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png'); // Convert canvas to image URL
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'qrcode.png'; // Set the file name
      link.click(); // Trigger the download
    }
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

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
  
    if (!file) {
      toast.error("Please select a CSV file.");
      return;
    }
  
    Papa.parse(file, {
      complete: async (result) => {
        const parsedData = result.data;
  
        if (parsedData.length === 0) {
          toast.error("CSV file is empty!");
          return;
        }
  
        // Process the CSV data (skip the header row)
        const formattedData = parsedData.slice(1).map((row) => ({
          id: row[0],
          name: row[1],
          gender: row[2],
          contact: row[3],
          address: row[4],
          employmentstatus: row[5],
          housenum: row[6],
          health: row[7],
          birthday: row[8],
          householdcount: row[9],
        }));
  
        // Make individual requests for each student if the API doesn't support bulk upload
        try {
          for (const student of formattedData) {
            await axios.post(API_URL, student);
          }
          toast.success("Residents uploaded successfully!");
          fetchStudents();
        } catch (error) {
          console.error("Error uploading residents:", error);
          toast.error("Error uploading residents!");
        }
      },
      header: false,
    });
  };

  const handleCSVExport = () => {
    if (students.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    // Define CSV headers
    const headers = [
      "ID",
      "Name",
      "Gender",
      "Contact",
      "Address",
      "Employment Status",
      "House Number",
      "Health",
      "Birthday",
      "Household Count",
    ];

    // Map student data to CSV rows
    const rows = students.map((student) => [
      student.id,
      student.name,
      student.gender,
      student.contact,
      student.address,
      student.employmentstatus,
      student.housenum,
      student.health,
      student.birthday,
      student.householdcount,
    ]);

    // Combine headers and rows into a CSV string
    const csvContent = [
      headers.join(","), // Add headers
      ...rows.map((row) => row.join(",")), // Add rows
    ].join("\n");

    // Create a Blob and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({ id: '', name: '', gender: '', contact: '', address: '', employmentstatus: '', housenum: '', health: '', birthday: '', householdcount: '' });
  };

  return (
    <div style={{ backgroundColor: '#a8e6f0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', padding: '20px', backgroundColor:'#fffef8', backgroundSize: 'cover', 
    backgroundPosition: 'center', marginLeft:'215px',
    backgroundRepeat: 'no-repeat', marginTop:'-5px', minWidth:'90%', minHeight:'950px' }}>
        {/* Form Container */}
        
        {/* List Container */}
        <div 
          className="list-container" 
          style={{ 
            marginLeft: '20px', 
            width: '80%', 
            padding: '20px', 
            borderRadius: '10px' ,
            backgroundImage: 'url("/images/table.webp")',
            backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          backgroundRepeat: 'no-repeat' , 
          marginTop: '5%',
          }}
        >

<div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap", marginBottom: "20px" }}>
  <div style={{ display: "flex", alignItems: "center" }}>
    <select onChange={(e) => setViewLimit(e.target.value === "all" ? Infinity : Number(e.target.value))} value={viewLimit} style={{ padding: "8px", marginRight: "400px", width: '250px' }}>
      <option value={5}>Show 5</option>
      <option value={10}>Show 10</option>
      <option value={20}>Show 20</option>
      <option value={50}>Show 50</option>
      <option value={100}>Show 100</option>
      <option value="all">Show All</option>
    </select>
    
          <input type="text" placeholder={`Search by ${searchBy}...`} value={searchQuery} onChange={handleSearchChange} style={{ padding: "8px", width: "250px" }} />
          <button onClick={() => setSearchQuery("")} style={{ padding: "8px", marginRight: "60px" }}>
            Clear
          </button>
          <select onChange={handleSortChange} value={sortKey} style={{ padding: "8px", marginRight: "520px"}}>
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

</div>

    <br/><br/><br/>

          <h1 style={{color:'white', fontSize:'40px'}}>Resident List</h1>
          
          <table border="1" style={{ width: '80%', borderColor:'black', marginLeft:'-200px' }}>
            <thead>
              <tr>   
                <th>ID</th>
                <th>Name</th>
                <th>Sex</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Employment Status</th>
                <th>House No.</th>
                <th>Health Status</th>
                <th>Birthday</th>
                <th>Household Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody style={{backgroundColor: 'white'}}>
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
                    <button onClick={() => handleEdit(student)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CB997E' }}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(student.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', marginLeft: '10px' }}>
                      <i className="fas fa-trash"></i>
                    </button>
                    <button onClick={() => handleGenerateQRCode(student.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007bff', marginLeft: '10px' }}>
                      <i className="fas fa-qrcode"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* QR Code Modal */}
          {qrCodeData && (
            <div className="qr-modal">
              <div className="qr-modal-content">
                <h3>Resident QR Code</h3>
                <QRCodeCanvas value={qrCodeData} size={256} /> <br/>

                <button onClick={downloadQRCode} style={{ marginTop: '10px' }}>Download QR Code</button>
                <button onClick={() => setQrCodeData(null)}>Close</button>
              </div>
            </div>
          )}
        </div>

        <div 
          className="form-container" 
          style={{ 
            width: '15%', 
            padding: '20px', 
            backgroundColor: '#B7B7A4', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundRepeat: 'no-repeat' , 
            borderRadius: '10px', 
            marginLeft: '-480px', 
            height: '950px',
            marginTop: '5%',
          }}
        >
          <h3 style={{ marginTop: '10px', color: 'white', fontSize: '30px' }}>Resident Information Form</h3>
          <form 
            onSubmit={isEditing ? handleEditSubmit : handleAddSubmit} 
            style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '70px' }}
          >
            <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required disabled={isEditing} />
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required />
            <input type="number" name="contact" placeholder="Contact No." value={formData.contact} onChange={handleChange} required />
            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            <input type="text" name="employmentstatus" placeholder="Employment Status" value={formData.employmentstatus} onChange={handleChange} required />
            <input type="number" name="housenum" placeholder="House No." value={formData.housenum} onChange={handleChange} required />
            <input type="text" name="health" placeholder="Health Status" value={formData.health} onChange={handleChange} required />
            <input type="number" name="householdcount" placeholder="Household Count" value={formData.householdcount} onChange={handleChange} required />
            <div className="form-group">
              <label htmlFor="birthday" className="date-label" style={{ color: 'black', fontSize: '15px' }}>Birthday</label>
              <input type="date" name="birthday" id="birthday" value={formData.birthday} onChange={handleChange} required />
            </div>
            <button type="submit">{isEditing ? 'Update Resident' : 'Add Resident'}</button>
          </form>
          <h1>_________________</h1>
    <div className="upload-section">
  <h3 style={{ fontSize: '25px', color:'white' }}>Upload CSV File</h3>
  <input 
    type="file" 
    accept=".csv" 
    onChange={handleCSVUpload} 
    id="fileInput" 
    className="hidden-input"
  />
  <label htmlFor="fileInput" className="custom-file-label">Import Data</label>
</div>
<div className="admin-actions">
  <button onClick={handleCSVExport} className="export-csv-button">
    Export CSV
  </button>
</div>
<br/>
        </div>
      </div>
      
      {/* Modal for editing */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Resident</h3>
            <form onSubmit={handleEditSubmit}>
              <input type="text" name="id" value={formData.id} onChange={handleChange} disabled />
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              <input type="text" name="gender" value={formData.gender} onChange={handleChange} required />
              <input type="number" name="contact" value={formData.contact} onChange={handleChange} required />
              <input type="text" name="address" value={formData.address} onChange={handleChange} required />
              <input type="text" name="employmentstatus" value={formData.employmentstatus} onChange={handleChange} required />
              <input type="number" name="housenum" value={formData.housenum} onChange={handleChange} required />
              <input type="text" name="health" value={formData.health} onChange={handleChange} required />
              <input style= {{width: '90%'}} type="date" name="birthday" value={formData.birthday} onChange={handleChange} required />
              <input type="number" name="householdcount" value={formData.householdcount} onChange={handleChange} required />
              
              <button type="submit">Save Changes</button>
              <button type="button" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
      
    </div>
  );
}

export default AdminPage;