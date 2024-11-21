import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
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
  Grid,
  Card,
  CardContent,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import Swal from "sweetalert2";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4CAF50",
    },
    secondary: {
      main: "#e53935",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h4: {
      fontWeight: 600,
      color: "#333",
    },
    body1: {
      color: "#555",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "capitalize",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          color: "#444",
        },
        head: {
          fontWeight: 600,
          backgroundColor: "#f4f6f8",
        },
      },
    },
  },
});

const StudentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [newStudents, setNewStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        text: "Fetching students data, please wait.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.get("https://gs-backend-r39y.onrender.com/api/students");
      setStudents(response.data);
      Swal.close();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Could not fetch students data. Please try again later.",
      });
    } finally {
    }
  };

  const handleAction = async (email) => {
    const result = await Swal.fire({
      title: `Confirmation`,
      text:`Are you sure you want to delete ${email}?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });
  
    if (result.isConfirmed) {
      // Show loading spinner while waiting for the delete action
      Swal.fire({
        title: 'Deleting...',
        text: 'Please wait.',
        icon: 'info',
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      try {
        await axios.delete(`https://gs-backend-r39y.onrender.com/api/students/${email}`);

        Swal.fire("Success!", `Successfully deleted ${email}.`, "success").then(() => {
          fetchStudents();
      });
      } catch (error) {
        Swal.fire("Error!", `Failed to delete student. Please try again.`, "error");
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
      const filteredNewStudents = jsonData.filter(
        (student) => student.email && student.email.endsWith("@mabinicolleges.edu.ph")
      );

      if (filteredNewStudents.length > 0) {
        setNewStudents(filteredNewStudents);
        Swal.fire("Success", `${filteredNewStudents.length} valid students loaded.`, "success");
        
      } else {
        Swal.fire("Warning", "No valid students found in the file.", "warning");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleInsertNewStudents = async () => {
    if (newStudents.length === 0) return;

    Swal.fire({
      title: "Inserting new students...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await axios.post("https://gs-backend-r39y.onrender.com/api/insert_students", { students: newStudents });
 
      Swal.fire('Success', 'New students inserted successfully!', 'success').then(() => {
        fetchStudents();
    });
    } catch (error) {
      Swal.fire("Error", "Failed to insert new students. Please try again.", "error");
    }
  };

  const filteredStudents = students.filter((student) =>
    [student.email, student.first_name, student.last_name]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );


  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" align="center" gutterBottom>
          Student Dashboard
        </Typography>

        <Card style={{ marginBottom: "20px" }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={7}>
                <TextField
                  label="Search"
                  variant="outlined"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid item xs={10} sm="auto" style={{ textAlign: "right" }}>
                <input
                  fullWidth
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  style={{ marginRight: "10px" }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleInsertNewStudents}
                  disabled={newStudents.length === 0}
                >
                  Insert Students
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table>
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
