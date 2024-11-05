// NavbarDashboard.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Swal from 'sweetalert2';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

// Import your components
import Home from './ResearchList';
import AddResearch from './AddResearch';
import Students from './Students';
import ResearchGraph from './ResearchGraph';

const NavbarDashboard = () => {
  const handleSignOut = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to sign out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, sign me out!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        signOut(auth)
          .then(() => {
            Swal.fire('Signed out!', 'You have been signed out successfully.', 'success');
          })
          .catch((error) => {
            Swal.fire('Error!', `Error signing out: ${error.message}`, 'error');
          });
      }
    });
  };

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="sticky"> {/* Changed position from 'static' to 'sticky' */}
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              MC Salik-Sik Library System
            </Typography>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/add-research">Add Research</Button>
            <Button color="inherit" component={Link} to="/add-students">Add Students</Button>
            <Button color="inherit" component={Link} to="/research-graph">Research Graph</Button>
            <Button color="inherit" onClick={handleSignOut}>Logout</Button>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-research" element={<AddResearch />} />
            <Route path="/add-students" element={<Students />} />
            <Route path="/research-graph" element={<ResearchGraph />} />
            {/* Optionally, add a fallback route */}
            <Route path="*" element={<Typography variant="h4">Page Not Found</Typography>} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default NavbarDashboard;
