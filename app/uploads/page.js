import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField } from '@mui/material';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);

      await axios.post('http://localhost:3001/upload', formData);
      setSuccess(true);
      setFile(null);
      setDescription('');
    } catch (error) {
      console.error('Error uploading file:', error);
      setSuccess(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginBottom: '1rem' }}
      />
      <TextField
        label="Description"
        variant="outlined"
        fullWidth
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ marginBottom: '1rem' }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!file || !description}
      >
        Upload
      </Button>
      {success && <p>File uploaded successfully!</p>}
    </Box>
  );
};

export default Upload;
