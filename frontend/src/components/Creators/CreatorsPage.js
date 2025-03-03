// src/components/Creators/CreatorsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { API_URL } from '../../config';

const CreatorsPage = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    socialHandles: {
      instagram: '',
      tiktok: '',
      youtube: ''
    },
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/creators`);
      setCreators(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching creators:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch creators',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCreators = creators.filter(creator =>
    creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (creator.email && creator.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenDialog = (creator = null) => {
    if (creator) {
      setSelectedCreator(creator);
      setFormData({
        name: creator.name,
        email: creator.email || '',
        phone: creator.phone || '',
        socialHandles: {
          instagram: creator.socialHandles?.instagram || '',
          tiktok: creator.socialHandles?.tiktok || '',
          youtube: creator.socialHandles?.youtube || ''
        },
        notes: creator.notes || ''
      });
    } else {
      setSelectedCreator(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        socialHandles: {
          instagram: '',
          tiktok: '',
          youtube: ''
        },
        notes: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (creator) => {
    setSelectedCreator(creator);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // Handle nested socialHandles fields
    if (name.startsWith('socialHandles.')) {
      const socialHandle = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialHandles: {
          ...prev.socialHandles,
          [socialHandle]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (selectedCreator) {
        // Update existing creator
        await axios.put(`${API_URL}/api/creators/${selectedCreator._id}`, formData);
        setSnackbar({
          open: true,
          message: 'Creator updated successfully',
          severity: 'success'
        });
      } else {
        // Create new creator
        await axios.post(`${API_URL}/api/creators`, formData);
        setSnackbar({
          open: true,
          message: 'Creator added successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchCreators();
    } catch (error) {
      console.error('Error saving creator:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save creator',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/creators/${selectedCreator._id}`);
      setSnackbar({
        open: true,
        message: 'Creator deleted successfully',
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchCreators();
    } catch (error) {
      console.error('Error deleting creator:', error);
      let errorMessage = 'Failed to delete creator';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      handleCloseDeleteDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Creators
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Creator
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search creators by name or email"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
      </Box>
      
      {filteredCreators.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No creators found
          </Typography>
          {searchTerm && (
            <Typography variant="body2" color="textSecondary">
              Try adjusting your search
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCreators.map(creator => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={creator._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="div" noWrap>
                      {creator.name}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        color="primary"
                        component={Link}
                        to={`/creators/${creator._id}`}
                        title="View Dashboard"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => handleOpenDialog(creator)}
                        title="Edit Creator"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleOpenDeleteDialog(creator)}
                        title="Delete Creator"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {creator.email && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {creator.email}
                    </Typography>
                  )}
                  
                  {creator.phone && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {creator.phone}
                    </Typography>
                  )}
                  
                  {creator.socialHandles && Object.values(creator.socialHandles).some(handle => handle) && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Social Handles:
                      </Typography>
                      {creator.socialHandles.instagram && (
                        <Typography variant="body2" noWrap>
                          Instagram: {creator.socialHandles.instagram}
                        </Typography>
                      )}
                      {creator.socialHandles.tiktok && (
                        <Typography variant="body2" noWrap>
                          TikTok: {creator.socialHandles.tiktok}
                        </Typography>
                      )}
                      {creator.socialHandles.youtube && (
                        <Typography variant="body2" noWrap>
                          YouTube: {creator.socialHandles.youtube}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link}
                    to={`/creators/${creator._id}`}
                  >
                    View Dashboard
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Creator Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCreator ? 'Edit Creator' : 'Add New Creator'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Social Media Handles
            </Typography>
            
            <TextField
              fullWidth
              margin="normal"
              label="Instagram"
              name="socialHandles.instagram"
              value={formData.socialHandles.instagram}
              onChange={handleInputChange}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="TikTok"
              name="socialHandles.tiktok"
              value={formData.socialHandles.tiktok}
              onChange={handleInputChange}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="YouTube"
              name="socialHandles.youtube"
              value={formData.socialHandles.youtube}
              onChange={handleInputChange}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
          >
            {selectedCreator ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the creator "{selectedCreator?.name}"? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Note: Creators with existing deals cannot be deleted. You must first reassign or delete their deals.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreatorsPage;
