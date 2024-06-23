import { HfInference } from "@huggingface/inference";
import { YoutubeTranscript } from "youtube-transcript";
import NodeCache from "node-cache";
import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";

const hfToken = process.env.HF_TOKEN;

const hf = new HfInference(hfToken);

const videoTranscriptCache = new NodeCache({ stdTTL: 3600 });

// export const getVideoTranscript = async (videoUrl) => {
//   try {
//     const cachedTranscript = videoTranscriptCache.get(videoUrl);

//     if (cachedTranscript) {
//       return cachedTranscript;
//     }

//     const videoTranscriptList =
//       await YoutubeTranscript.fetchTranscript(videoUrl);

//     const transcript = videoTranscriptList.map((data) => data.text).join(" ");

//     videoTranscriptCache.set(videoUrl, transcript);

//     // console.log(videoTranscriptCache.data);

//     return transcript;
//   } catch (error) {
//     console.log(error);
//   }
// };

// Function to generate unique file name based on videoId
const generateFileName = (videoId) => {
  const timestamp = Date.now(); // or use any other unique identifier
  return `${timestamp}-${videoId}.wav`;
};

export const getVideoTranscript = async (videoUrl) => {
  try {
    let transcript = null;

    // Attempt to fetch transcript from cache
    if (videoTranscriptCache.has(videoUrl)) {
      transcript = videoTranscriptCache.get(videoUrl);
    } else {
      // Try to fetch transcript using youtube-transcript
      try {
        const videoTranscriptList =
          await YoutubeTranscript.fetchTranscript(videoUrl);
        transcript = videoTranscriptList.map((data) => data.text).join(" ");
        videoTranscriptCache.set(videoUrl, transcript);
      } catch (err) {
        // If youtube-transcript fails, fallback to ASR
        console.log(`youtube-transcript failed: ${err.message}`);
      }
    }

    // If transcript still null, perform ASR
    if (!transcript) {
      // Download audio from YouTube
      const audioStream = ytdl(videoUrl, {
        filter: "audioonly",
        quality: "highestaudio",
      });

      // Generate unique file name based on videoId
      const videoId = ytdl.getVideoID(videoUrl);
      const fileName = generateFileName(videoId);

      // Define path to save audio files
      const audioDirectory = path.join(__dirname, "../audio");
      const filePath = path.join(audioDirectory, fileName);

      // Convert audio stream to WAV
      const wavFileStream = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        pipeline(audioStream, wavFileStream, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(filePath);
          }
        });
      });

      // Perform ASR on the WAV file
      transcript = await hf.automaticSpeechRecognition({
        model: "openai/whisper-large-v3",
        // model: 'facebook/wav2vec2-large-960h-lv60-self',
        data: fs.readFileSync(filePath),
      });

      transcript = transcript.text;

      // Cache the transcript
      videoTranscriptCache.set(videoUrl, transcript);
    }

    return transcript;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getVideoSummary = async (transcript) => {
  try {
    if (!transcript || typeof transcript !== "string") {
      throw new Error("Invalid transcript: must be a non-empty string.");
    }

    const chunkSize = 1000;
    const numChunks = Math.ceil(transcript.length / chunkSize);
    const chunks = [];

    // Split transcript into chunks
    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, transcript.length);
      chunks.push(transcript.slice(start, end));
    }

    const retryFetch = async (chunk, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const result = await hf.summarization({
            model: "philschmid/bart-large-cnn-samsum",
            inputs: chunk,
            parameters: {
              max_length: 500,
            },
          });
          return result.summary_text;
        } catch (error) {
          console.error(
            `Error summarizing chunk (attempt ${i + 1}):`,
            error.message
          );
          if (i === retries - 1) {
            return ""; // Return empty string after all retries failed
          }
        }
      }
    };

    // Process chunks in parallel
    const promises = chunks.map((chunk) => retryFetch(chunk));

    const summaries = await Promise.all(promises);

    // Concatenate summaries and sanitize text
    let summaryText = summaries.join(" ").trim();
    summaryText = summaryText.replace(/&amp;#?\w+;/g, ""); // Remove HTML-encoded entities
    summaryText = summaryText.replace(/[^\w\s.,!?$',]/g, ""); // Remove unwanted characters except specific punctuation and dollar sign

    return summaryText;
  } catch (error) {
    console.error("Failed to get video summary:", error);
    throw error;
  }
};
