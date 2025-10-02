import { del } from "@vercel/blob";
import { processSpotifyStreamingHistory } from "@workspace/core/import";
import { SpotifyStreamingHistoryItem } from "@workspace/core/types";
import { NextRequest, NextResponse } from "next/server";
interface ProcessBlobsRequest {
  blobUrls: string[];
}

interface ProcessBlobsResponse {
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

interface ProgressUpdate {
  type: "progress" | "complete" | "error";
  message: string;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  data?: ProcessBlobsResponse;
}

interface BlobProcessingResult {
  streamingHistory: SpotifyStreamingHistoryItem[];
  fileResults: ProcessBlobsResponse["results"]["fileResults"];
  totalErrors: number;
}

interface StreamingProcessingResult {
  processed: number;
  skipped: number;
  errors: string[];
}

/**
 * Validates the request body and returns blob URLs
 */
async function validateRequest(
  request: NextRequest
): Promise<{ blobUrls: string[] } | { error: ProcessBlobsResponse }> {
  try {
    const { blobUrls }: ProcessBlobsRequest = await request.json();

    if (!blobUrls || blobUrls.length === 0) {
      return {
        error: {
          success: false,
          message: "No blob URLs provided",
          errors: ["Please provide at least one blob URL to process"]
        } as ProcessBlobsResponse
      };
    }

    return { blobUrls };
  } catch {
    return {
      error: {
        success: false,
        message: "Invalid request body",
        errors: ["Request body must be valid JSON"]
      } as ProcessBlobsResponse
    };
  }
}

/**
 * Downloads and processes all blob URLs, returning streaming history and file results
 */
async function processBlobs(
  blobUrls: string[],
  sendUpdate: (update: ProgressUpdate) => void
): Promise<BlobProcessingResult> {
  const fileResults: ProcessBlobsResponse["results"]["fileResults"] = [];
  let totalErrors = 0;
  const allStreamingHistory: SpotifyStreamingHistoryItem[] = [];

  // Download and parse all blobs first
  for (let i = 0; i < blobUrls.length; i++) {
    const blobUrl = blobUrls[i];
    const fileStartTime = performance.now();

    sendUpdate({
      type: "progress",
      message: `Downloading and parsing blob ${i + 1} of ${blobUrls.length}`,
      progress: {
        current: i + 1,
        total: blobUrls.length,
        percentage: Math.round(((i + 1) / blobUrls.length) * 50)
      }
    });

    try {
      console.log(`Processing blob: ${blobUrl}`);

      // Download blob content
      const response = await fetch(blobUrl);
      if (!response.ok) {
        throw new Error(`Failed to download blob: ${response.status} ${response.statusText}`);
      }
      const fileContent = await response.text();
      let streamingHistory: SpotifyStreamingHistoryItem[];

      try {
        streamingHistory = JSON.parse(fileContent);
      } catch (parseError) {
        const fileEndTime = performance.now();
        const processingTimeMs = fileEndTime - fileStartTime;

        fileResults.push({
          filename: `blob-${i + 1}.json`,
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
          filename: `blob-${i + 1}.json`,
          processed: 0,
          skipped: 0,
          errors: ["File content must be an array of streaming history items"],
          processingTimeMs
        });
        totalErrors++;
        continue;
      }

      // Add to combined streaming history
      allStreamingHistory.push(...streamingHistory);

      const fileEndTime = performance.now();
      const processingTimeMs = fileEndTime - fileStartTime;

      fileResults.push({
        filename: `blob-${i + 1}.json`,
        processed: streamingHistory.length,
        skipped: 0,
        errors: [],
        processingTimeMs
      });

      console.log(`Parsed blob ${i + 1}: ${streamingHistory.length} items in ${processingTimeMs.toFixed(2)}ms`);
    } catch (error) {
      const fileEndTime = performance.now();
      const processingTimeMs = fileEndTime - fileStartTime;

      fileResults.push({
        filename: `blob-${i + 1}.json`,
        processed: 0,
        skipped: 0,
        errors: [`Blob processing failed: ${error instanceof Error ? error.message : "Unknown error"}`],
        processingTimeMs
      });
      totalErrors++;
      console.error(`Error processing blob ${i + 1}:`, error);
    }
  }

  return {
    streamingHistory: allStreamingHistory,
    fileResults,
    totalErrors
  };
}

/**
 * Processes streaming history data using the core import function
 */
async function processStreamingHistory(
  streamingHistory: SpotifyStreamingHistoryItem[],
  blobUrls: string[],
  sendUpdate: (update: ProgressUpdate) => void
): Promise<StreamingProcessingResult> {
  if (streamingHistory.length === 0) {
    return { processed: 0, skipped: 0, errors: [] };
  }

  sendUpdate({
    type: "progress",
    message: `Processing ${streamingHistory.length} streaming history items...`,
    progress: { current: blobUrls.length, total: blobUrls.length, percentage: 75 }
  });

  console.log(`Processing ${streamingHistory.length} total streaming history items from ${blobUrls.length} blobs`);
  const processStartTime = performance.now();

  try {
    // Create a progress callback for database operations
    const progressCallback = (message: string, percentage: number) => {
      sendUpdate({
        type: "progress",
        message: `Database: ${message}`,
        progress: { current: blobUrls.length, total: blobUrls.length, percentage: 75 + percentage * 0.25 }
      });
    };

    const results = await processSpotifyStreamingHistory(streamingHistory, progressCallback);

    const processEndTime = performance.now();
    const processingTimeMs = processEndTime - processStartTime;

    for (const error of results.errors) {
      console.error(error);
    }

    console.log(
      `Processing completed: ${results.processed} processed, ${results.skipped} skipped, ${results.errors.length} errors in ${processingTimeMs.toFixed(2)}ms`
    );

    return results;
  } catch (error) {
    console.error("Error processing streaming history:", error);
    return {
      processed: 0,
      skipped: 0,
      errors: [`Processing error: ${error instanceof Error ? error.message : "Unknown error"}`]
    };
  }
}

/**
 * Deletes all blob URLs after processing
 */
async function deleteBlobs(blobUrls: string[]): Promise<void> {
  console.log(`Deleting ${blobUrls.length} blob(s) after processing...`);
  del(blobUrls);
  console.log("Blob deletion completed");
}

/**
 * Creates the final response object
 */
function createResponse(
  blobUrls: string[],
  streamingHistory: SpotifyStreamingHistoryItem[],
  blobResults: BlobProcessingResult,
  streamingResults: StreamingProcessingResult,
  totalProcessingTimeMs: number
): ProcessBlobsResponse {
  return {
    success: true,
    message: `Successfully processed ${blobUrls.length} blob(s) and processed ${streamingHistory.length} streaming history items`,
    results: {
      totalFiles: blobUrls.length,
      totalProcessed: streamingResults.processed,
      totalSkipped: streamingResults.skipped,
      totalErrors: blobResults.totalErrors + streamingResults.errors.length,
      fileResults: blobResults.fileResults,
      totalProcessingTimeMs
    }
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();

  try {
    // Validate request
    const validation = await validateRequest(request);
    if ("error" in validation) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    const { blobUrls } = validation;

    return new NextResponse(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          function sendUpdate(update: ProgressUpdate) {
            const data = `data: ${JSON.stringify(update)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          try {
            sendUpdate({
              type: "progress",
              message: "Starting blob processing...",
              progress: { current: 0, total: blobUrls.length, percentage: 0 }
            });

            // Process all blobs
            const blobResults = await processBlobs(blobUrls, sendUpdate);

            // Process streaming history
            const streamingResults = await processStreamingHistory(blobResults.streamingHistory, blobUrls, sendUpdate);

            // Delete blobs after processing
            await deleteBlobs(blobUrls);

            const endTime = performance.now();
            const totalProcessingTimeMs = endTime - startTime;

            // Create final response
            const response = createResponse(
              blobUrls,
              blobResults.streamingHistory,
              blobResults,
              streamingResults,
              totalProcessingTimeMs
            );

            sendUpdate({
              type: "complete",
              message: "Blob processing completed successfully",
              data: response
            });

            console.log(`Blob processing completed in ${totalProcessingTimeMs.toFixed(2)}ms`);
            console.log(
              `Blobs processed: ${blobUrls.length}, Total items: ${blobResults.streamingHistory.length}, Processed: ${streamingResults.processed}, Skipped: ${streamingResults.skipped}, Errors: ${blobResults.totalErrors + streamingResults.errors.length}`
            );
          } catch (error) {
            const endTime = performance.now();
            const totalProcessingTimeMs = endTime - startTime;

            console.error("Process blobs endpoint error:", error);

            sendUpdate({
              type: "error",
              message: "Blob processing failed",
              data: {
                success: false,
                message: "Internal server error during blob processing",
                results: {
                  totalFiles: 0,
                  totalProcessed: 0,
                  totalSkipped: 0,
                  totalErrors: 1,
                  fileResults: [],
                  totalProcessingTimeMs
                },
                errors: [`Server error: ${error instanceof Error ? error.message : "Unknown error"}`]
              }
            });
          } finally {
            controller.close();
          }
        }
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        }
      }
    );
  } catch (error) {
    const endTime = performance.now();
    const totalProcessingTimeMs = endTime - startTime;

    console.error("Process blobs endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during blob processing",
        results: {
          totalFiles: 0,
          totalProcessed: 0,
          totalSkipped: 0,
          totalErrors: 1,
          fileResults: [],
          totalProcessingTimeMs
        },
        errors: [`Server error: ${error instanceof Error ? error.message : "Unknown error"}`]
      } as ProcessBlobsResponse,
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
