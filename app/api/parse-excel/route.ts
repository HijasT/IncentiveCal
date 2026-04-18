import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

/**
 * POST /api/parse-excel
 * Parses uploaded Excel file and returns sheet data
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload .xlsx or .xls file.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Return success with file info
    return NextResponse.json(
      {
        success: true,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        // Client-side parsing will happen with XLSX library
        message: 'File uploaded successfully. Processing in browser...',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Excel parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
