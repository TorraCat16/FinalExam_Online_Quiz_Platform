import { getQuizLeaderboard, getQuizAnalytics, getUserReport } from "../models/reports.mjs";

import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

export const quizLeaderboard = async (req, res) => {
  const { quizId } = req.params;
  try {
    const leaderboard = await getQuizLeaderboard(quizId);
    res.json(leaderboard);
  } catch {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

export const quizAnalytics = async (req, res) => {
  const { quizId } = req.params;
  try {
    const analytics = await getQuizAnalytics(quizId);
    res.json(analytics);
  } catch {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

export const userReport = async (req, res) => {
  const userId = req.session.user.id;
  try {
    const report = await getUserReport(userId);
    res.json(report);
  } catch {
    res.status(500).json({ error: "Failed to fetch user report" });
  }
};

// Export user report as CSV
export const userReportCSV = async (req, res) => {
  const userId = req.session.user.id;

  try {
    const report = await getUserReport(userId);

    const fields = [
      { label: "Quiz", value: "quiz" },
      { label: "Score", value: "score" },
      { label: "Total Questions", value: "total_questions" },
      { label: "Submitted At", value: "submitted_at" }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(report);

    res.header("Content-Type", "text/csv");
    res.attachment("my-quiz-results.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export CSV" });
  }
};

// Export user report as PDF
export const userReportPDF = async (req, res) => {
  const userId = req.session.user.id;

  try {
    const report = await getUserReport(userId);

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=my-quiz-results.pdf"
    );

    doc.pipe(res);

    doc.fontSize(18).text("My Quiz Results", { align: "center" });
    doc.moveDown();

    report.forEach((r) => {
      doc
        .fontSize(12)
        .text(
          `${r.quiz} — ${r.score}/${r.total_questions} — ${new Date(
            r.submitted_at
          ).toLocaleString()}`
        );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export PDF" });
  }
};
