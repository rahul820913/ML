import React, { useState } from "react";
import axios from "axios";
import "./Exeltojson.css";

const GoogleSheetImport = () => {
    const [sheetLink, setSheetLink] = useState("");
    const [extractedData, setExtractedData] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const token = localStorage.getItem("token");
    // Extract Google Sheet ID from URL
    const extractSheetId = (url) => {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : null;
    };

    const handleImportGoogleSheet = async () => {
        if (!sheetLink.trim()) {
            alert("Please enter a Google Sheets link!");
            return;
        }

        const sheetId = extractSheetId(sheetLink.trim());
        if (!sheetId) {
            alert("Invalid Google Sheets link format!");
            return;
        }

        setIsExtracting(true);

        try {
            if (!token) {
                alert("Please login to import sheet");
                console.error("No authentication token found");
                return;
            }
            const response = await axios.post(`http://localhost:3001/api/users/import-sheet/${sheetId}`);
            console.log(response.data);
            if (response.data.success) {
                setExtractedData(response.data.data);
                alert("Google Sheet data imported successfully!");
            } else {
                console.log(response.data.message);
                alert(response.data.message || "Failed to import sheet data");
            }
        } catch (error) {
            console.error("Error importing sheet:", error);
            alert("Failed to import Google Sheet data!");
        } finally {
            setIsExtracting(false);
        }
    };

    const downloadExtractedData = () => {
        if (!extractedData) return;

        try {
            const dataStr = JSON.stringify(extractedData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'google_sheet_data.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading data:", error);
            alert("Failed to download data!");
        }
    };

    return (
        <div className="upload-container">
            <h2 className="section-title">Import Data from Google Sheet</h2>
            <div className="form-group">
                <label className="form-label">Google Sheet Link:</label>
                <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetLink}
                    onChange={(e) => setSheetLink(e.target.value)}
                    className="input-field"
                />
            </div>
            <button
                onClick={handleImportGoogleSheet}
                className="btn btn-primary"
                disabled={isExtracting}
            >
                {isExtracting ? "Importing..." : "Import Sheet"}
            </button>

            {extractedData && (
                <div className="extracted-data-section">
                    <h3 className="section-subtitle">Extracted Data Preview</h3>
                    <button onClick={downloadExtractedData} className="btn btn-success">
                        📥 Download as JSON
                    </button>
                </div>
            )}
        </div>
    );
};

export default GoogleSheetImport;
