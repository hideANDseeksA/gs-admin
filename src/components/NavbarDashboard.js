import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton } from '@mui/material';
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Swal from 'sweetalert2';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import MenuIcon from '@mui/icons-material/Menu'; // Importing an icon for the menu button

// Import your components
import Home from './ResearchList';
import AddResearch from './AddResearch';
import Students from './Students';
import ResearchGraph from './ResearchGraph';

const NavbarDashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null); // For the dropdown menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // For the mobile menu toggle

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget); // Open the menu
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen); // Toggle mobile menu
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close the menu
  };

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
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              MC Salik-Sik Library Admin
            </Typography>

            {/* Mobile menu button */}
            <IconButton
              color="inherit"
              sx={{ display: { xs: 'block', md: 'none' } }}
              onClick={handleMobileMenuToggle}
            >
              <MenuIcon />
            </IconButton>

            {/* Dropdown for Research Section */}
            <Button color="inherit" sx={{ display: { xs: 'none', md: 'block' } }} onClick={handleMenuClick}>
              Research
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{
                display: { xs: 'none', md: 'block' }, // Show dropdown only on desktop
              }}
            >
              <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                Research List
              </MenuItem>
              <MenuItem component={Link} to="/add-research" onClick={handleMenuClose}>
                Add Research
              </MenuItem>
              <MenuItem component={Link} to="/research-graph" onClick={handleMenuClose}>
              Research Over years
              </MenuItem>
            </Menu>

            {/* Button for Students */}
            <Button color="inherit" component={Link} to="/add-students" sx={{ marginRight: 2 }}>
              Students
            </Button>

            {/* Logout Button */}
            <Button color="inherit" onClick={handleSignOut}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <Box sx={{ display: { xs: 'block', md: 'none' }, padding: 2, backgroundColor: '#fff' }}>
            <Button fullWidth component={Link} to="/" onClick={() => setMobileMenuOpen(false)}>
              Research List
            </Button>
            <Button fullWidth component={Link} to="/add-research" onClick={() => setMobileMenuOpen(false)}>
              Add Research
            </Button>
            <Button fullWidth component={Link} to="/research-graph" onClick={() => setMobileMenuOpen(false)}>
              Research Over years
            </Button>
            <Button fullWidth component={Link} to="/add-students" onClick={() => setMobileMenuOpen(false)}>
              Students
            </Button>
            <Button fullWidth onClick={handleSignOut}>
              Logout
            </Button>
          </Box>
        )}

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-research" element={<AddResearch />} />
            <Route path="/add-students" element={<Students />} />
            <Route path="/research-graph" element={<ResearchGraph />} />
            <Route path="*" element={<Typography variant="h4">Page Not Found</Typography>} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default NavbarDashboard;
