import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const IPChecker = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloadLink, setDownloadLink] = useState(null);
    const [progress, setProgress] = useState(0);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [error, setError] = useState(null);

    // Toggle between light and dark mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Handle file drop/upload
    const onDrop = (acceptedFiles) => {
        setFile(acceptedFiles[0]);
        setDownloadLink(null);
        setFileUploaded(true); // Set to true once the file is dropped
        setProgress(0);
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: '.xlsx' });

    const handleFileUpload = async () => {
        if (!file) return;
        setLoading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(process.env.VITE_API_URL, formData, {
                responseType: 'blob',
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                },
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            setDownloadLink(url);
            setLoading(false);
        } catch (error) {
            setError("An error occurred while verifying IPs. Please try again.");
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setLoading(false);
        setDownloadLink(null);
        setProgress(0);
        setFileUploaded(false); // Reset the file upload indicator
        setError(null);
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} p-4`}>
            <h1 className="text-3xl font-bold mb-4">IP Checker with VirusTotal</h1>

            {/* Toggle Light/Dark Mode */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="absolute top-4 right-4 p-2 bg-gray-300 dark:bg-gray-800 rounded-full focus:outline-none"
            >
                {darkMode ? '🌙' : '☀️'}
            </button>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-md">
                {error && <div className="text-red-500 mb-4">{error}</div>}

                {/* Drag and Drop Zone */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-4 mb-4 cursor-pointer 
                               ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'} 
                               dark:border-gray-600 dark:bg-gray-700`}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="text-center text-blue-600 dark:text-blue-400">Drop the file here...</p>
                    ) : (
                        <p className="text-center text-gray-600 dark:text-gray-300">
                            Drag & drop an .xlsx file here, or click to select one
                        </p>
                    )}

                    {/* Green checkmark when file is uploaded */}
                    {fileUploaded && (
                        <div className="flex justify-center items-center mt-2 text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="ml-2 text-green-600 font-semibold">File uploaded successfully!</span>
                        </div>
                    )}
                </div>

                {/* Verify Button */}
                <button
                    onClick={handleFileUpload}
                    disabled={!file || loading}
                    className={`mt-4 w-full py-2 px-4 font-semibold rounded-lg shadow-md cursor-pointer
                                ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                                text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
                                transition-all duration-200 dark:bg-blue-500 dark:hover:bg-blue-600`}
                >
                    {loading ? 'Processing...' : 'Verify IPs'}
                </button>

                {/* Progress Bar */}
                {loading && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-4 transition-all duration-200">
                        <div
                            className="bg-blue-500 h-4 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Download Button */}
                {downloadLink && (
                    <a
                        href={downloadLink}
                        download="resultados_ordenados.xlsx"
                        className="mt-4 block text-center py-2 px-4 font-semibold rounded-lg shadow-md
                                   bg-green-600 hover:bg-green-700 text-white cursor-pointer
                                   transition-all duration-200 dark:bg-green-500 dark:hover:bg-green-600"
                    >
                        Download Results
                    </a>
                )}

                {/* Reset Button */}
                <button
                    onClick={resetForm}
                    className="mt-4 w-full py-2 px-4 font-semibold rounded-lg shadow-md
                               bg-red-600 hover:bg-red-700 text-white cursor-pointer
                               transition-all duration-200 dark:bg-red-500 dark:hover:bg-red-600"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default IPChecker;
