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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();

  try {
    const { blobUrls }: ProcessBlobsRequest = await request.json();

    if (!blobUrls || blobUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No blob URLs provided",
          errors: ["Please provide at least one blob URL to process"]
        } as ProcessBlobsResponse,
        { status: 400 }
      );
    }

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

            const fileResults: ProcessBlobsResponse["results"]["fileResults"] = [];
            let totalProcessed = 0;
            let totalSkipped = 0;
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
                    errors: [
                      `Failed to parse JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`
                    ],
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

                console.log(
                  `Parsed blob ${i + 1}: ${streamingHistory.length} items in ${processingTimeMs.toFixed(2)}ms`
                );
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

            // Process all streaming history together
            if (allStreamingHistory.length > 0) {
              sendUpdate({
                type: "progress",
                message: `Processing ${allStreamingHistory.length} streaming history items...`,
                progress: { current: blobUrls.length, total: blobUrls.length, percentage: 75 }
              });

              console.log(
                `Processing ${allStreamingHistory.length} total streaming history items from ${blobUrls.length} blobs`
              );
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

                const results = await processSpotifyStreamingHistory(allStreamingHistory, progressCallback);

                const processEndTime = performance.now();
                const processingTimeMs = processEndTime - processStartTime;

                totalProcessed = results.processed;
                totalSkipped = results.skipped;
                totalErrors += results.errors.length;

                for (const error of results.errors) {
                  console.error(error);
                }

                console.log(
                  `Processing completed: ${results.processed} processed, ${results.skipped} skipped, ${results.errors.length} errors in ${processingTimeMs.toFixed(2)}ms`
                );
              } catch (error) {
                console.error("Error processing streaming history:", error);
                totalErrors++;
              }
            }

            const endTime = performance.now();
            const totalProcessingTimeMs = endTime - startTime;

            const response: ProcessBlobsResponse = {
              success: true,
              message: `Successfully processed ${blobUrls.length} blob(s) and processed ${allStreamingHistory.length} streaming history items`,
              results: {
                totalFiles: blobUrls.length,
                totalProcessed,
                totalSkipped,
                totalErrors,
                fileResults,
                totalProcessingTimeMs
              }
            };

            sendUpdate({
              type: "complete",
              message: "Blob processing completed successfully",
              data: response
            });

            console.log(`Blob processing completed in ${totalProcessingTimeMs.toFixed(2)}ms`);
            console.log(
              `Blobs processed: ${blobUrls.length}, Total items: ${allStreamingHistory.length}, Processed: ${totalProcessed}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`
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
