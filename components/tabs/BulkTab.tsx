'use client'
import { useState } from 'react'

export function BulkTab() {
  const [file, setFile] = useState<File | null>(null)
  const [showControls, setShowControls] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      setShowControls(true)
    }
  }

  return (
    <section className="card">
      <div className="privacy-notice">
        <span className="privacy-icon">🔒</span>
        <span>100% local calculation • No data shared • Browser-only processing • Your data stays private</span>
      </div>

      <div className="card-header">
        <h2 className="card-title">Team Incentive Analysis</h2>
        <div className="card-description">
          Upload your sales tracking Excel file to automatically calculate team incentives with rankings and downloadable reports.
        </div>
      </div>

      <div className="form-group">
        <label>Upload Sales Tracker Excel (.xlsx)</label>
        <input 
          id="bulk-file" 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleFileUpload} 
        />
      </div>

      {showControls && file && (
        <div style={{marginTop: '24px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center'}}>
          <div style={{fontSize: '48px', marginBottom: '12px'}}>📊</div>
          <div style={{color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>
            File Uploaded: {file.name}
          </div>
          <div style={{color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px'}}>
            Excel processing functionality will be available in the next update.
          </div>
          <div style={{color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.6'}}>
            This feature will automatically:
            <br/>• Extract staff sales data from your Excel file
            <br/>• Calculate individual and team incentives
            <br/>• Generate rankings and leaderboards
            <br/>• Export reports as CSV and PDF
          </div>
        </div>
      )}

      {!showControls && (
        <div style={{marginTop: '24px', padding: '40px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center'}}>
          <div style={{fontSize: '64px', marginBottom: '16px'}}>📂</div>
          <div style={{color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>
            No file uploaded
          </div>
          <div style={{color: 'var(--text-secondary)', fontSize: '14px'}}>
            Upload an Excel file (.xlsx) to begin bulk processing
          </div>
        </div>
      )}
    </section>
  )
}
