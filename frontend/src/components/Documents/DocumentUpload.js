// src/components/Documents/DocumentUpload.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { API_URL } from '../../config';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const UploadPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  border: '2px dashed #ccc',
  backgroundColor: '#fafafa',
  cursor: 'pointer',
  transition: 'border .3s ease-in-out',
  '&:hover': {
    border: '2px dashed #2196f3',
  },
}));

const steps = ['Upload Document', 'Review Extracted Data', 'Submit'];

const DocumentUpload = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [extractedData, setExtractedData] = useState({
    clientName: '',
    amount: '',
    dueDate: null,
    videoCount: '',
    startDate: null,
    endDate: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadAttempts, setUploadAttempts] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF file only.');
        setFile(null);
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    
    const droppedFile = event.dataTransfer.files[0];
    
    if (droppedFile) {
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please upload a PDF file only.');
        setFile(null);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUploadClick = () => {
    document.getElementById('file-input').click();
  };

  const handleDocumentTypeChange = (event) => {
    setDocumentType(event.target.value);
  };

  const handleExtractData = async () => {
    if (!file || !documentType) {
      setError('Please select a file and document type.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      const response = await axios.post(`${API_URL}/api/documents/extract`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Initialize defaults for any missing data
      const dataWithDefaults = {
        clientName: '',
        amount: '',
        dueDate: null,
        videoCount: '',
        startDate: null,
        endDate: null,
        ...response.data
      };
      
      setExtractedData(dataWithDefaults);
      setLoading(false);
      setActiveStep(1);
    } catch (error) {
      setLoading(false);
      console.error('Error extracting data:', error);
      setError('Failed to extract data from the document. Please proceed to manual entry.');
      
      // Move to the next step anyway, with empty data that user can fill in
      setExtractedData({
        clientName: '',
        amount: '',
        dueDate: null,
        videoCount: '',
        startDate: null,
        endDate: null
      });
      setActiveStep(1);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setExtractedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setExtractedData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setUploadAttempts(prev => prev + 1);
      
      // Validate that client name is provided
      if (!extractedData.clientName) {
        setError('Client name is required.');
        setLoading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      // Ensure data is properly formatted before sending
      const dataToSend = {
        ...extractedData,
        // Convert possible null values to empty strings
        clientName: extractedData.clientName || '',
        amount: extractedData.amount || 0,
        videoCount: extractedData.videoCount || 0
      };
      
      formData.append('data', JSON.stringify(dataToSend));
      
      const response = await axios.post(`${API_URL}/api/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setLoading(false);
      setSuccess(true);
      setActiveStep(2);
    } catch (error) {
      setLoading(false);
      console.error('Error uploading document:', error);
      
      // Provide more specific error messages based on the error response
      if (error.response && error.response.data) {
        setError(`Failed to upload: ${error.response.data.message || 'Unknown server error'}`);
      } else {
        setError('Failed to upload the document. Please try again.');
      }
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      handleExtractData();
    } else if (activeStep === 1) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setDocumentType('');
    setExtractedData({
      clientName: '',
      amount: '',
      dueDate: null,
      videoCount: '',
      startDate: null,
      endDate: null
    });
    setSuccess(false);
    setError('');
  };
  
  const goToDocuments = () => {
    navigate('/documents');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Upload Invoice or Contract
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Document uploaded successfully!
        </Alert>
      )}
      
      <Card>
        <CardContent>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="document-type-label">Document Type</InputLabel>
                  <Select
                    labelId="document-type-label"
                    id="document-type"
                    value={documentType}
                    label="Document Type"
                    onChange={handleDocumentTypeChange}
                  >
                    <MenuItem value="Invoice">Invoice</MenuItem>
                    <MenuItem value="Contract">Contract</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <input
                  type="file"
                  id="file-input"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <UploadPaper
                  onClick={handleUploadClick}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {!file ? (
                    <Box sx={{ py: 5 }}>
                      <CloudUploadIcon sx={{ fontSize: 48, color: '#2196f3', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Drag & Drop or Click to Upload
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Supports PDF files only
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ py: 5 }}>
                      <PictureAsPdfIcon sx={{ fontSize: 48, color: '#f44336', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        {file.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {(file.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                  )}
                </UploadPaper>
              </Grid>
            </Grid>
          )}
          
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Review Extracted Data
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Please review and correct the extracted information if needed.
                  <EditIcon sx={{ fontSize: 16, ml: 1, verticalAlign: 'middle' }} />
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Client Name"
                  name="clientName"
                  value={extractedData.clientName || ''}
                  onChange={handleInputChange}
                  required
                  error={!extractedData.clientName}
                  helperText={!extractedData.clientName ? "Client name is required" : ""}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={extractedData.amount || ''}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: '$',
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Videos"
                  name="videoCount"
                  type="number"
                  value={extractedData.videoCount || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                {documentType === 'Invoice' && (
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Due Date"
                      value={extractedData.dueDate}
                      onChange={(date) => handleDateChange('dueDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                )}
                
                {documentType === 'Contract' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Start Date"
                        value={extractedData.startDate}
                        onChange={(date) => handleDateChange('startDate', date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="End Date"
                        value={extractedData.endDate}
                        onChange={(date) => handleDateChange('endDate', date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                  </>
                )}
              </LocalizationProvider>
            </Grid>
          )}
          
          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Document Successfully Uploaded!
              </Typography>
              <Typography variant="body1" paragraph>
                The document has been processed and the information has been added to the system.
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleReset}
                >
                  Upload Another Document
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={goToDocuments}
                >
                  View All Documents
                </Button>
              </Box>
            </Box>
          )}
          
          {activeStep < 2 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep > 0 && (
                <Button 
                  disabled={loading} 
                  onClick={handleBack} 
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={loading || !file || !documentType}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                ) : (
                  activeStep === 1 ? 'Submit' : 'Next'
                )}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DocumentUpload;