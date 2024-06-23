import { getVideoSummary, getVideoTranscript } from "../helpers/summary.js";

export const getSummary = async (req, res) => {
  try {
    const videoUrl = req.query.url;
    // console.log(videoUrl);

    if (!videoUrl) {
      return res.sendStatus(400);
    }

    const transcript = await getVideoTranscript(videoUrl);
    const summary = await getVideoSummary(transcript);

    return res.status(200).json(summary);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
