import { processSpotifyStreamingHistory } from "@workspace/core";
import { SpotifyStreamingHistoryItem } from "@workspace/core/types";
import { NextRequest, NextResponse } from "next/server";

interface UploadResponse {
  success: boolean;
  message: string;
  results: {
    totalFiles: number;
    totalProcessed: number;
    totalSkipped: number;
    totalErrors: number;
    fileResults: Array<{
      filename: string;
      processed: number;
      skipped: number;
      errors: string[];
      processingTimeMs: number;
    }>;
    totalProcessingTimeMs: number;
  };
  errors?: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No files provided",
          errors: ["Please select at least one file to upload"]
        } as UploadResponse,
        { status: 400 }
      );
    }

    // Validate file types
    console.log("files", JSON.stringify(files));
    const invalidFiles = files.filter((file) => !file.name.endsWith(".json"));
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file types",
          errors: [`Only JSON files are allowed. Invalid files: ${invalidFiles.map((f) => f.name).join(", ")}`]
        } as UploadResponse,
        { status: 400 }
      );
    }

    const fileResults: UploadResponse["results"]["fileResults"] = [];
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Process each file
    for (const file of files) {
      const fileStartTime = performance.now();

      try {
        console.log(`Processing file: ${file.name}`);

        // Read file content
        const fileContent = await file.text();
        let streamingHistory: SpotifyStreamingHistoryItem[];

        try {
          streamingHistory = JSON.parse(fileContent);
        } catch (parseError) {
          const fileEndTime = performance.now();
          const processingTimeMs = fileEndTime - fileStartTime;

          fileResults.push({
            filename: file.name,
            processed: 0,
            skipped: 0,
            errors: [`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`],
            processingTimeMs
          });
          totalErrors++;
          continue;
        }

        // Validate that it's an array
        if (!Array.isArray(streamingHistory)) {
          const fileEndTime = performance.now();
          const processingTimeMs = fileEndTime - fileStartTime;

          fileResults.push({
            filename: file.name,
            processed: 0,
            skipped: 0,
            errors: ["File content must be an array of streaming history items"],
            processingTimeMs
          });
          totalErrors++;
          continue;
        }

        // Process the streaming history
        const results = await processSpotifyStreamingHistory(streamingHistory);

        const fileEndTime = performance.now();
        const processingTimeMs = fileEndTime - fileStartTime;

        fileResults.push({
          filename: file.name,
          processed: results.processed,
          skipped: results.skipped,
          errors: results.errors,
          processingTimeMs
        });

        totalProcessed += results.processed;
        totalSkipped += results.skipped;
        totalErrors += results.errors.length;

        console.log(
          `Completed ${file.name}: ${results.processed} processed, ${results.skipped} skipped, ${results.errors.length} errors in ${processingTimeMs.toFixed(2)}ms`
        );
      } catch (error) {
        const fileEndTime = performance.now();
        const processingTimeMs = fileEndTime - fileStartTime;

        fileResults.push({
          filename: file.name,
          processed: 0,
          skipped: 0,
          errors: [`File processing failed: ${error instanceof Error ? error.message : "Unknown error"}`],
          processingTimeMs
        });
        totalErrors++;
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    const endTime = performance.now();
    const totalProcessingTimeMs = endTime - startTime;

    const response: UploadResponse = {
      success: true,
      message: `Successfully processed ${files.length} file(s)`,
      results: {
        totalFiles: files.length,
        totalProcessed,
        totalSkipped,
        totalErrors,
        fileResults,
        totalProcessingTimeMs
      }
    };

    console.log(`Upload processing completed in ${totalProcessingTimeMs.toFixed(2)}ms`);
    console.log(`Total: ${totalProcessed} processed, ${totalSkipped} skipped, ${totalErrors} errors`);

    return NextResponse.json(response);
  } catch (error) {
    const endTime = performance.now();
    const totalProcessingTimeMs = endTime - startTime;

    console.error("Upload endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during file processing",
        results: {
          totalFiles: 0,
          totalProcessed: 0,
          totalSkipped: 0,
          totalErrors: 1,
          fileResults: [],
          totalProcessingTimeMs
        },
        errors: [`Server error: ${error instanceof Error ? error.message : "Unknown error"}`]
      } as UploadResponse,
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
