const Apply = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const mongoose = require("mongoose");

/* ==================================================
   JOBSEEKER - APPLY FOR JOB
================================================== */

exports.applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid Job ID",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    /* ================= RESUME ================= */

    let resumePath = req.file
      ? req.file.filename
      : null;

    if (!resumePath) {
      const user = await User.findById(req.userId);

      if (user?.resume) {
        resumePath = user.resume;
      }
    }

    /*
      Resume is temporarily allowed to be empty.
    */
    if (!resumePath) {
      resumePath = "";
    }

    /* ================= DUPLICATE CHECK ================= */

    const alreadyApplied = await Apply.findOne({
      job: job._id,
      applicant: req.userId,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        message: "Already applied",
      });
    }

    /* ================= CREATE APPLICATION ================= */

    const application = await Apply.create({
      job: job._id,
      applicant: req.userId,
      resume: resumePath,
      status: "Applied",
      timeline: [
        {
          status: "Applied",
          date: new Date(),
        },
      ],
    });

    res.status(201).json({
      message: "Applied successfully",
      application,
    });
  } catch (err) {
    console.log("applyJob Error:", err);

    res.status(500).json({
      message: "Server error while applying",
    });
  }
};

/* ==================================================
   JOBSEEKER - MY APPLICATIONS
================================================== */

exports.myApplications = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      applicant: req.userId,
    };

    if (status) {
      filter.status = status;
    }

    const applications = await Apply.find(filter)
      .populate(
        "job",
        "title company location salary employmentType"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      total: applications.length,
      applications,
    });
  } catch (err) {
    console.log("myApplications Error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ==================================================
   JOBSEEKER - WITHDRAW APPLICATION
================================================== */

exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Application ID",
      });
    }

    const application = await Apply.findOne({
      _id: id,
      applicant: req.userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    /* Cannot withdraw after interview/hired */
    if (
      ["Interview", "Hired"].includes(
        application.status
      )
    ) {
      return res.status(400).json({
        message:
          "Cannot withdraw at this stage",
      });
    }

    await application.deleteOne();

    res.json({
      message:
        "Application withdrawn successfully",
    });
  } catch (err) {
    console.log(
      "withdrawApplication Error:",
      err
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ==================================================
   RECRUITER - GET APPLICATIONS FOR JOB
================================================== */

exports.getApplicationsForJob = async (
  req,
  res
) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid Job ID",
      });
    }

    /* ================= CHECK JOB ================= */

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    /* ================= OWNER CHECK ================= */

    if (
      job.recruiterId.toString() !==
      req.userId
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    /* ================= APPLICATIONS ================= */

    const applications = await Apply.find({
      job: jobId,
    })
      .populate(
        "applicant",
        "name email phone resume"
      )
      .populate(
        "job",
        "title company location"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      total: applications.length,
      applications,
    });
  } catch (err) {
    console.log(
      "getApplicationsForJob Error:",
      err
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ==================================================
   RECRUITER - UPDATE APPLICATION STATUS
================================================== */

exports.updateApplicationStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    /* ================= VALIDATE ID ================= */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Application ID",
      });
    }

    /* ================= VALIDATE STATUS ================= */

    const allowedStatuses = [
      "Applied",
      "Shortlisted",
      "Interview",
      "Rejected",
      "Hired",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
      });
    }

    /* ================= FIND APPLICATION ================= */

    const application = await Apply.findById(id)
      .populate("job");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    /* ================= OWNER CHECK ================= */

    if (
      application.job.recruiterId.toString() !==
      req.userId
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    /* ================= UPDATE ================= */

    application.status = status;

    application.timeline.push({
      status,
      date: new Date(),
    });

    await application.save();

    res.json({
      message: "Status updated",
      status,
      application,
    });
  } catch (err) {
    console.log(
      "updateApplicationStatus Error:",
      err
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ==================================================
   RECRUITER - SCHEDULE / RESCHEDULE INTERVIEW
================================================== */

exports.scheduleInterview = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    /* ================= VALIDATE ID ================= */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Application ID",
      });
    }

    /* ================= VALIDATE INPUT ================= */

    if (!date || !time) {
      return res.status(400).json({
        message:
          "Interview date and time are required",
      });
    }

    /* ================= DATE VALIDATION ================= */

    const interviewDate = new Date(date);

    if (Number.isNaN(interviewDate.getTime())) {
      return res.status(400).json({
        message: "Invalid interview date",
      });
    }

    /* ================= FIND APPLICATION ================= */

    const application = await Apply.findById(id)
      .populate("job");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    /* ================= OWNER CHECK ================= */

    if (
      application.job.recruiterId.toString() !==
      req.userId
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    /* ================= STATUS CHECK ================= */

    if (
      !["Shortlisted", "Interview"].includes(
        application.status
      )
    ) {
      return res.status(400).json({
        message:
          "Candidate must be shortlisted before scheduling an interview",
      });
    }

    /* ================= SAVE INTERVIEW ================= */

    application.interview = {
      date: interviewDate,
      time: time,
    };

    /* ================= UPDATE STATUS ================= */

    const wasAlreadyInterview =
      application.status === "Interview";

    application.status = "Interview";

    /* Only add timeline when first scheduled */
    if (!wasAlreadyInterview) {
      application.timeline.push({
        status: "Interview",
        date: new Date(),
      });
    }

    await application.save();

    res.json({
      message: wasAlreadyInterview
        ? "Interview rescheduled successfully"
        : "Interview scheduled successfully",

      application,
    });
  } catch (err) {
    console.log(
      "scheduleInterview Error:",
      err
    );

    res.status(500).json({
      message:
        "Server error while scheduling interview",
    });
  }
};

/* ==================================================
   RECRUITER - DASHBOARD SUMMARY
================================================== */

exports.getRecruiterDashboardSummary = async (
  req,
  res
) => {
  try {
    /* ================= RECRUITER JOBS ================= */

    const jobs = await Job.find({
      recruiterId: req.userId,
    }).select("_id");

    const jobIds = jobs.map(
      (job) => job._id
    );

    /* ================= APPLICATIONS ================= */

    const apps = await Apply.find({
      job: {
        $in: jobIds,
      },
    });

    /* ================= SUMMARY ================= */

    res.json({
      totalJobs: jobs.length,

      totalApplications: apps.length,

      shortlisted: apps.filter(
        (app) =>
          app.status === "Shortlisted"
      ).length,

      hired: apps.filter(
        (app) =>
          app.status === "Hired"
      ).length,
    });
  } catch (err) {
    console.log(
      "getRecruiterDashboardSummary Error:",
      err
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};