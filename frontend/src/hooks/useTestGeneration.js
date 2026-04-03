import { useState } from 'react';
import api from '../api';

const MAX_USER_TESTS = 5;

export const useTestGeneration = (materialId, onTestGenerated) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExistingDialog, setShowExistingDialog] = useState(false);
  const [existingTestCount, setExistingTestCount] = useState(0);
  const [limitErrorMsg, setLimitErrorMsg] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);

  const generateNewTest = async () => {
    setIsGenerating(true);
    setShowExistingDialog(false);
    try {
      const response = await api.post(`/materials/${materialId}/generate-test`);
      if (response.data?.test) {
        const generatedTest = response.data.test;
        onTestGenerated(generatedTest);

        try {
          await api.post('/tests', { materialId, testContent: generatedTest });
        } catch (saveErr) {
          if (saveErr.response?.data?.limitReached) {
            setLimitErrorMsg(saveErr.response.data.message);
            setShowLimitModal(true);
          } else {
            console.error('Error saving generated test:', saveErr);
          }
        }
      }
    } catch (err) {
      if (err.response?.data?.limitReached) {
        setLimitErrorMsg(err.response.data.message);
        setShowLimitModal(true);
      } else {
        console.error('Error generating test:', err);
        alert('Failed to generate test. Please ensure the backend is running and the PDF is accessible.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const checkAndGenerateTest = async () => {
    setIsGenerating(true);
    setLimitErrorMsg('');

    try {
      const countRes = await api.get('/tests/user/count');
      const { limitReached } = countRes.data;

      if (limitReached) {
        setLimitErrorMsg(
          `You've reached the limit of ${MAX_USER_TESTS} created tests. You can still view and take any existing tests.`
        );
        setShowLimitModal(true);
        setIsGenerating(false);
        return;
      }

      try {
        const existingRes = await api.get(`/tests/${materialId}`);
        if (existingRes.data?.tests?.length > 0) {
          setExistingTestCount(existingRes.data.count);
          setShowExistingDialog(true);
          setIsGenerating(false);
          return;
        }
      } catch (checkErr) {
        if (checkErr.response?.status !== 404) {
          console.error('Error checking existing test:', checkErr);
        }
      }

      await generateNewTest();
    } catch (err) {
      console.error('Error in checkAndGenerateTest:', err);
      setIsGenerating(false);
    }
  };

  const closeDialogs = () => {
    setShowExistingDialog(false);
    setShowLimitModal(false);
  };

  return {
    isGenerating,
    showExistingDialog,
    existingTestCount,
    limitErrorMsg,
    showLimitModal,
    checkAndGenerateTest,
    generateNewTest,
    closeDialogs,
  };
};
