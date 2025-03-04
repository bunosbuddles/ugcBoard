// src/components/Documents/DocumentsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import { API_URL } from '../../config';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [page, rowsPerPage, typeFilter, searchTerm]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      
      if (typeFilter) {
        params.type = typeFilter;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await axios.get(`${API_URL}/api/documents`, { params });
      
      setDocuments(response.data.documents || []);
      setTotalDocuments(response.data.pagination?.total || response.data.documents?.length || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'Contract':
        return <DescriptionIcon color="primary" />;
      case 'Invoice':
        return <PictureAsPdfIcon color="secondary" />;
      default:
        return <PictureAsPdfIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Documents
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/documents/upload"
          startIcon={<UploadFileIcon />}
        >
          Upload Document
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search documents"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="type-filter-label">Document Type</InputLabel>
            <Select
              labelId="type-filter-label"
              id="type-filter"
              value={typeFilter}
              onChange={handleTypeFilterChange}
              label="Document Type"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="Contract">Contracts</MenuItem>
              <MenuItem value="Invoice">Invoices</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton
            color="primary"
            onClick={handleClearFilters}
            disabled={!searchTerm && !typeFilter}
            title="Clear Filters"
          >
            <FilterListIcon />
          </IconButton>
        </Box>
      </Paper>
      
      {/* Documents Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Filename</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell>Deal</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="textSecondary">
                      No documents found
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/documents/upload"
                      startIcon={<UploadFileIcon />}
                      sx={{ mt: 2 }}
                    >
                      Upload Your First Document
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getDocumentTypeIcon(doc.type)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {doc.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{doc.fileName}</TableCell>
                    <TableCell>{doc.extractedData?.clientName || '-'}</TableCell>
                    <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                    <TableCell>
                      {doc.dealId ? (
                        <Link to={`/deals/${doc.dealId}`}>
                          View Deal
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        href={doc.fileUrl}
                        target="_blank"
                        title="Download"
                      >
                        <FileDownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalDocuments}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default DocumentsPage;