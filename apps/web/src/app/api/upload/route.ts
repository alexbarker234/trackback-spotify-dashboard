import { processSpotifyStreamingHistory } from "@workspace/core/import";
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

interface ProgressUpdate {
  type: "progress" | "complete" | "error";
  message: string;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  data?: UploadResponse;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const stream = formData.get("stream") === "true";

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

    // If streaming is requested, return a streaming response
    if (stream) {
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
                message: "Starting file processing...",
                progress: { current: 0, total: files.length, percentage: 0 }
              });

              const fileResults: UploadResponse["results"]["fileResults"] = [];
              let totalProcessed = 0;
              let totalSkipped = 0;
              let totalErrors = 0;
              const allStreamingHistory: SpotifyStreamingHistoryItem[] = [];

              // Parse all files first
              for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileStartTime = performance.now();

                sendUpdate({
                  type: "progress",
                  message: `Parsing file ${i + 1} of ${files.length}: ${file.name}`,
                  progress: {
                    current: i + 1,
                    total: files.length,
                    percentage: Math.round(((i + 1) / files.length) * 50)
                  }
                });

                try {
                  console.log(`Parsing file: ${file.name}`);

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
                      filename: file.name,
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
                    filename: file.name,
                    processed: streamingHistory.length,
                    skipped: 0,
                    errors: [],
                    processingTimeMs
                  });

                  console.log(
                    `Parsed ${file.name}: ${streamingHistory.length} items in ${processingTimeMs.toFixed(2)}ms`
                  );
                } catch (error) {
                  const fileEndTime = performance.now();
                  const processingTimeMs = fileEndTime - fileStartTime;

                  fileResults.push({
                    filename: file.name,
                    processed: 0,
                    skipped: 0,
                    errors: [`File parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`],
                    processingTimeMs
                  });
                  totalErrors++;
                  console.error(`Error parsing file ${file.name}:`, error);
                }
              }

              // Process all streaming history together
              if (allStreamingHistory.length > 0) {
                sendUpdate({
                  type: "progress",
                  message: `Processing ${allStreamingHistory.length} streaming history items...`,
                  progress: { current: files.length, total: files.length, percentage: 75 }
                });

                console.log(
                  `Processing ${allStreamingHistory.length} total streaming history items from ${files.length} files`
                );
                const processStartTime = performance.now();

                try {
                  // Create a progress callback for database operations
                  const progressCallback = (message: string, percentage: number) => {
                    sendUpdate({
                      type: "progress",
                      message: `Database: ${message}`,
                      progress: { current: files.length, total: files.length, percentage: 75 + percentage * 0.25 }
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

              const response: UploadResponse = {
                success: true,
                message: `Successfully parsed ${files.length} file(s) and processed ${allStreamingHistory.length} streaming history items`,
                results: {
                  totalFiles: files.length,
                  totalProcessed,
                  totalSkipped,
                  totalErrors,
                  fileResults,
                  totalProcessingTimeMs
                }
              };

              sendUpdate({
                type: "complete",
                message: "Upload processing completed successfully",
                data: response
              });

              console.log(`Upload processing completed in ${totalProcessingTimeMs.toFixed(2)}ms`);
              console.log(
                `Files parsed: ${files.length}, Total items: ${allStreamingHistory.length}, Processed: ${totalProcessed}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`
              );
            } catch (error) {
              const endTime = performance.now();
              const totalProcessingTimeMs = endTime - startTime;

              console.error("Upload endpoint error:", error);

              sendUpdate({
                type: "error",
                message: "Upload processing failed",
                data: {
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
    }

    // Non-streaming response (original behavior)
    const fileResults: UploadResponse["results"]["fileResults"] = [];
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const allStreamingHistory: SpotifyStreamingHistoryItem[] = [];

    // Parse all files first
    for (const file of files) {
      const fileStartTime = performance.now();

      try {
        console.log(`Parsing file: ${file.name}`);

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

        // Add to combined streaming history
        allStreamingHistory.push(...streamingHistory);

        const fileEndTime = performance.now();
        const processingTimeMs = fileEndTime - fileStartTime;

        fileResults.push({
          filename: file.name,
          processed: streamingHistory.length,
          skipped: 0,
          errors: [],
          processingTimeMs
        });

        console.log(`Parsed ${file.name}: ${streamingHistory.length} items in ${processingTimeMs.toFixed(2)}ms`);
      } catch (error) {
        const fileEndTime = performance.now();
        const processingTimeMs = fileEndTime - fileStartTime;

        fileResults.push({
          filename: file.name,
          processed: 0,
          skipped: 0,
          errors: [`File parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`],
          processingTimeMs
        });
        totalErrors++;
        console.error(`Error parsing file ${file.name}:`, error);
      }
    }

    // Process all streaming history together
    if (allStreamingHistory.length > 0) {
      console.log(`Processing ${allStreamingHistory.length} total streaming history items from ${files.length} files`);
      const processStartTime = performance.now();

      try {
        const results = await processSpotifyStreamingHistory(allStreamingHistory);

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

    const response: UploadResponse = {
      success: true,
      message: `Successfully parsed ${files.length} file(s) and processed ${allStreamingHistory.length} streaming history items`,
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
    console.log(
      `Files parsed: ${files.length}, Total items: ${allStreamingHistory.length}, Processed: ${totalProcessed}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`
    );

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
