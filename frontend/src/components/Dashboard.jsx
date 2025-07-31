import React, { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

// For local testing. This will be replaced with your Render URL during deployment.
const API_URL = 'http://localhost:8000';

const fadeIn = keyframes`from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); }`;

const DashboardContainer = styled.div`
  padding: 2rem 3rem;
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--color-bg);
  border-radius: 20px;
  box-shadow: var(--shadow-raised);
  animation: ${fadeIn} 0.5s ease-out;
  text-align: center;
`;

const Header = styled.h1`
  color: var(--color-text-primary);
  font-weight: 700;
`;

const DropzoneContainer = styled.div`
  border: 3px dashed var(--color-text-secondary);
  padding: 3rem;
  cursor: pointer;
  border-radius: 20px;
  margin: 2rem 0;
  background-color: var(--color-bg);
  box-shadow: var(--shadow-pressed);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-accent);
  }
`;

const ActionButton = styled.button`
  background: var(--color-bg);
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-accent);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: var(--shadow-raised);

  &:hover {
    color: #0056b3;
  }

  &:active {
    box-shadow: var(--shadow-pressed);
  }

  &:disabled {
    color: var(--color-text-secondary);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ResultImage = styled.img`
  max-width: 100%;
  margin-top: 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-raised);
`;

const CountDisplay = styled.h2`
  font-size: 2.5rem;
  color: var(--color-text-primary);
  margin-top: 2rem;
`;

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const currentFile = acceptedFiles[0];
    setFile(currentFile);
    setPreview(URL.createObjectURL(currentFile));
    setResult(null);
    setCount(0);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const handleDetection = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/detect`, formData, { responseType: 'blob' });
      const objectCount = response.headers['x-object-count'];
      setCount(objectCount);
      setResult(URL.createObjectURL(response.data));
    } catch (err) {
      console.error("Detection error:", err);
      setError('Failed to analyze image. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContainer>
      <Header>Inventory Vision: Milk Carton Counter</Header>
      <p>Upload an image to get an AI-powered inventory count.</p>
      <DropzoneContainer {...getRootProps({ isDragActive })}>
        <input {...getInputProps()} />
        {preview ? <img src={preview} alt="Preview" style={{maxWidth: '200px', borderRadius: '10px'}}/> : <p>Drag & drop an image here</p>}
      </DropzoneContainer>
      <ActionButton onClick={handleDetection} disabled={!file || loading}>
        {loading ? 'Analyzing...' : 'Count Items'}
      </ActionButton>
      {error && <p style={{ color: '#d9534f', marginTop: '1rem' }}>{error}</p>}
      {result && (
        <div>
          <CountDisplay>Detected Count: {count}</CountDisplay>
          <ResultImage src={result} alt="Detection result" />
        </div>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
