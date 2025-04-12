import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { HeicConverterService } from '../services/HeicConverterService';

const OutputGallery: React.FC = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('pending');
  const [progress, setProgress] = useState<number>(0);
  const [files, setFiles] = useState<any[]>([]);

  const heicConverterService = new HeicConverterService();

  useEffect(() => {
    if (jobId) {
      heicConverterService.startStatusPolling(jobId, (job) => {
        setJobStatus(job.status);
        setProgress(job.progress || 0);
        
        if (job.files) {
          setFiles(prevFiles => {
            const updatedFiles = [...prevFiles];
            job.files.forEach((jobFile, index) => {
              if (index < updatedFiles.length) {
                updatedFiles[index] = {
                  ...updatedFiles[index],
                  status: jobFile.status,
                  convertedPath: jobFile.convertedPath,
                  thumbnailUrl: jobFile.thumbnailUrl,
                  convertedName: jobFile.convertedName
                };
              }
            });
            return updatedFiles;
          });
        }
        
        if (job.status === 'completed') {
          setJobStatus('completed');
          setProgress(100);
          toast.success('Conversion completed successfully!');
        }
        
        if (job.status === 'failed') {
          setJobStatus('failed');
          toast.error(job.error || 'Conversion failed');
        }
      });
      
      return () => {
        heicConverterService.stopStatusPolling();
      };
    }
  }, [jobId]);

  return (
    <div>
      {/* Render your gallery components here */}
    </div>
  );
};

export default OutputGallery; 