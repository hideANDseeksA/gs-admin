import React, { useEffect, useState } from 'react';
import * as XLSX from "xlsx";
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Grid,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import Swal from 'sweetalert2';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: '4px',
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
  },
});

const StudentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [newStudents, setNewStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      Swal.fire({
        title: 'Loading...',
        text: 'Fetching students data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      const response = await axios.get('https://backend-j2o4.onrender.com/api/students');
      setStudents(response.data);
      Swal.close();
    } catch (error) {
      console.error('Error fetching students:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Could not fetch students data. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (email) => {
    const result = await Swal.fire({
      title: `Are you sure you want to delete ${email}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      icon: 'warning',
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: `Processing...`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        await axios.delete(`https://backend-j2o4.onrender.com/api/students/${email}`);
        fetchStudents();
        Swal.fire('Success!', `Successfully deleted ${email}.`, 'success');
      } catch (error) {
        console.error(`Error deleting student:`, error);
        Swal.fire('Error!', `Failed to delete student. Please try again.`, 'error');
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      Swal.fire({
        icon: "error",
        title: "No file selected",
        text: "Please select a valid Excel file.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      if (jsonData.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Empty File",
          text: "The file is empty or contains no valid data.",
        });
        return;
      }
      const filteredNewStudents = jsonData.filter(
        (student) => student.email && student.email.endsWith("@mabinicolleges.edu.ph")
      );

      if (filteredNewStudents.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Valid New Students",
          text: "No new students with valid email addresses were found.",
        });
      } else {
        setNewStudents(filteredNewStudents);
        Swal.fire({
          icon: "success",
          title: "File Loaded",
          text: `${filteredNewStudents.length} valid new students found.`,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleInsertNewStudents = async () => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to insert new students into the database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, insert them!",
      cancelButtonText: "No, cancel!",
    });
  
    if (confirmed.isConfirmed) {
      setLoading(true);
      Swal.fire({
        title: "Inserting new students...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      try {
        const response = await axios.post("https://backend-j2o4.onrender.com/api/insert_students", {
          students: newStudents,
        });
        Swal.fire({
          icon: "success",
          title: "New Students Inserted",
          text: response.data.message || "New students were successfully inserted.",
        });
        fetchStudents();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "There was an error inserting the new students.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredStudents = students.filter((student) =>
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" align="center" gutterBottom>
          Student Dashboard
        </Typography>


        <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: '20px' }}>
          <Grid item xs={12} sm="auto">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm="auto">
            <button onClick={handleInsertNewStudents} disabled={newStudents.length === 0 || loading}>
              {loading ? "Inserting..." : "Insert New Students"}
            </button>
          </Grid>
        </Grid>

        <TextField
          label="Search by email, first or last name"
          variant="outlined"
          fullWidth
          style={{ marginBottom: '20px' }}
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none',
              },
            },
          }}
        />

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.email}>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.first_name}</TableCell>
                  <TableCell>{student.last_name}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => handleAction(student.email)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ThemeProvider>
  );
};



export default StudentDashboard;
