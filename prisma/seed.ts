import { PrismaClient, UserRole, UserStatus, Difficulty, QuestionType, AssignmentType, AssignmentStatus, AIAssistanceLevel, IntegrityRiskLevel, NotificationType, SubscriptionPlan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Password123!", 12);

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@didaktika.eu" },
    update: {},
    create: {
      email: "admin@didaktika.eu",
      firstName: "Platform",
      lastName: "Admin",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // School
  const school = await prisma.school.upsert({
    where: { slug: "vilnius-gymnasium" },
    update: {},
    create: {
      name: "Vilnius International Gymnasium",
      slug: "vilnius-gymnasium",
      city: "Vilnius",
      country: "LT",
      settings: {
        create: {
          defaultLanguage: "en",
          aiAssistanceDefault: AIAssistanceLevel.GUIDANCE,
          integrityMonitoring: true,
        },
      },
    },
  });

  await prisma.subscription.upsert({
    where: { id: "seed-subscription" },
    update: { plan: SubscriptionPlan.SCHOOL, seatsLimit: 500 },
    create: {
      id: "seed-subscription",
      schoolId: school.id,
      plan: SubscriptionPlan.SCHOOL,
      seatsLimit: 500,
      events: {
        create: { eventType: "SUBSCRIPTION_CREATED", metadata: { plan: "SCHOOL" } },
      },
    },
  });

  // Plan catalog (source of truth mirrored from config/plans.ts)
  const { PLAN_DEFINITIONS } = await import("../config/plans");
  for (const def of PLAN_DEFINITIONS) {
    const plan = await prisma.plan.upsert({
      where: { code: def.code },
      update: {
        name: def.name,
        audience: def.audience,
        priceCents: def.priceCents,
        seatsLimit: def.seatsLimit,
        description: def.description,
        sortOrder: def.sortOrder,
      },
      create: {
        code: def.code,
        name: def.name,
        audience: def.audience,
        priceCents: def.priceCents,
        seatsLimit: def.seatsLimit,
        description: def.description,
        sortOrder: def.sortOrder,
      },
    });
    for (const featureKey of def.features) {
      await prisma.planFeature.upsert({
        where: { planId_featureKey: { planId: plan.id, featureKey } },
        update: { enabled: true },
        create: { planId: plan.id, featureKey, enabled: true },
      });
    }
    for (const [metric, limitValue] of Object.entries(def.limits)) {
      await prisma.planLimit.upsert({
        where: {
          planId_metric: {
            planId: plan.id,
            metric: metric as import("@prisma/client").UsageMetric,
          },
        },
        update: { limitValue: limitValue as number },
        create: {
          planId: plan.id,
          metric: metric as import("@prisma/client").UsageMetric,
          limitValue: limitValue as number,
        },
      });
    }
  }

  // School Admin
  const schoolAdmin = await prisma.user.upsert({
    where: { email: "admin@vilnius-gymnasium.lt" },
    update: {},
    create: {
      email: "admin@vilnius-gymnasium.lt",
      firstName: "Ona",
      lastName: "Kazlauskienė",
      passwordHash,
      role: UserRole.SCHOOL_ADMIN,
      status: UserStatus.ACTIVE,
      schoolId: school.id,
    },
  });

  // Teachers
  const teachers = [];
  const teacherData = [
    { email: "jonas.kazlauskas@vilnius-gymnasium.lt", firstName: "Jonas", lastName: "Kazlauskas" },
    { email: "ruta.petrauskiene@vilnius-gymnasium.lt", firstName: "Rūta", lastName: "Petrauskienė" },
    { email: "mindaugas.jonaitis@vilnius-gymnasium.lt", firstName: "Mindaugas", lastName: "Jonaitis" },
  ];

  for (const t of teacherData) {
    const teacher = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        ...t,
        passwordHash,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        schoolId: school.id,
        teacherProfile: { create: { department: "Mathematics" } },
      },
    });
    teachers.push(teacher);
  }

  // Subjects
  const mathSubject = await prisma.subject.upsert({
    where: { schoolId_code: { schoolId: school.id, code: "MATH" } },
    update: {},
    create: {
      name: "Mathematics",
      code: "MATH",
      description: "Core mathematics curriculum",
      schoolId: school.id,
      color: "#2563eb",
    },
  });

  const physicsSubject = await prisma.subject.upsert({
    where: { schoolId_code: { schoolId: school.id, code: "PHYS" } },
    update: {},
    create: {
      name: "Physics",
      code: "PHYS",
      description: "Physics and natural sciences",
      schoolId: school.id,
      color: "#0891b2",
    },
  });

  // Topics & Skills
  const linearTopic = await prisma.topic.create({
    data: {
      name: "Linear Equations",
      subjectId: mathSubject.id,
      orderIndex: 1,
      skills: {
        create: [
          { name: "Solving one-step equations", orderIndex: 1 },
          { name: "Solving two-step equations", orderIndex: 2 },
          { name: "Equations with variables on both sides", orderIndex: 3 },
        ],
      },
    },
    include: { skills: true },
  });

  const quadraticTopic = await prisma.topic.create({
    data: {
      name: "Quadratic Equations",
      subjectId: mathSubject.id,
      orderIndex: 2,
      skills: {
        create: [
          { name: "Factoring quadratics", orderIndex: 1 },
          { name: "Quadratic formula", orderIndex: 2 },
          { name: "Discriminant calculation", orderIndex: 3 },
        ],
      },
    },
    include: { skills: true },
  });

  // Students
  const students = [];
  const firstNames = ["Matas", "Greta", "Lukas", "Emilija", "Nojus", "Ieva", "Dominykas", "Gabija", "Tomas", "Austėja"];
  const lastNames = ["Jonaitis", "Petrauskaitė", "Kazlauskas", "Stankevičius", "Balčiūnaitė", "Mickevičius", "Jankauskaitė", "Paulauskas", "Navickaitė", "Grigas"];

  for (let i = 0; i < 30; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const student = await prisma.user.upsert({
      where: { email: `student${i + 1}@vilnius-gymnasium.lt` },
      update: {},
      create: {
        email: `student${i + 1}@vilnius-gymnasium.lt`,
        firstName,
        lastName: `${lastName}${i > 9 ? i : ""}`,
        passwordHash,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        schoolId: school.id,
        studentProfile: {
          create: {
            gradeLevel: 9 + (i % 4),
            studentCode: `STU${String(i + 1).padStart(3, "0")}`,
            currentStreak: Math.floor(Math.random() * 14),
            totalStudyMinutes: Math.floor(Math.random() * 500) + 50,
          },
        },
      },
    });
    students.push(student);
  }

  // Classes
  const classes = [];
  const classNames = ["9A Mathematics", "10B Mathematics", "11A Advanced Math"];
  for (let i = 0; i < 3; i++) {
    const cls = await prisma.class.create({
      data: {
        name: classNames[i],
        description: `${classNames[i]} - 2025/2026`,
        schoolId: school.id,
        teacherId: teachers[i % teachers.length].id,
        subjectId: mathSubject.id,
      },
    });
    classes.push(cls);

    const classStudents = students.slice(i * 10, (i + 1) * 10);
    for (const s of classStudents) {
      await prisma.classMember.create({
        data: { classId: cls.id, userId: s.id },
      });
    }
  }

  // Questions
  const questions = [];
  const questionData = [
    { content: "Solve for x: 2x + 4 = 10", type: QuestionType.NUMERIC, difficulty: Difficulty.EASY, answer: 3, skillId: linearTopic.skills[1].id, topicId: linearTopic.id },
    { content: "Solve for x: 3x - 7 = 14", type: QuestionType.NUMERIC, difficulty: Difficulty.MEDIUM, answer: 7, skillId: linearTopic.skills[1].id, topicId: linearTopic.id },
    { content: "Solve for x: 5x + 2 = 3x + 12", type: QuestionType.NUMERIC, difficulty: Difficulty.MEDIUM, answer: 5, skillId: linearTopic.skills[2].id, topicId: linearTopic.id },
    { content: "What is the discriminant of x² + 4x + 4 = 0?", type: QuestionType.NUMERIC, difficulty: Difficulty.MEDIUM, answer: 0, skillId: quadraticTopic.skills[2].id, topicId: quadraticTopic.id },
    { content: "Solve x² - 5x + 6 = 0 using factoring", type: QuestionType.SHORT_ANSWER, difficulty: Difficulty.MEDIUM, answer: "x=2 or x=3", skillId: quadraticTopic.skills[0].id, topicId: quadraticTopic.id },
    { content: "The equation 2x + 8 = 16 has solution x = 4", type: QuestionType.TRUE_FALSE, difficulty: Difficulty.EASY, answer: true, skillId: linearTopic.skills[0].id, topicId: linearTopic.id },
    { content: "Solve for x: x/3 + 2 = 7", type: QuestionType.NUMERIC, difficulty: Difficulty.EASY, answer: 15, skillId: linearTopic.skills[0].id, topicId: linearTopic.id },
    { content: "Using the quadratic formula, solve x² + 2x - 3 = 0", type: QuestionType.SHORT_ANSWER, difficulty: Difficulty.HARD, answer: "x=1 or x=-3", skillId: quadraticTopic.skills[1].id, topicId: quadraticTopic.id },
  ];

  for (const q of questionData) {
    const question = await prisma.question.create({
      data: {
        type: q.type,
        difficulty: q.difficulty,
        content: q.content,
        correctAnswer: q.type === QuestionType.TRUE_FALSE ? { value: q.answer } : { value: q.answer },
        gradingConfig: q.type === QuestionType.NUMERIC ? { tolerance: 0.01 } : undefined,
        subjectId: mathSubject.id,
        topicId: q.topicId,
        skillId: q.skillId,
        createdById: teachers[0].id,
        schoolId: school.id,
        explanation: `The correct answer is ${q.answer}.`,
      },
    });
    questions.push(question);
  }

  // Assignments
  const homework = await prisma.assignment.create({
    data: {
      title: "Linear Equations Homework",
      description: "Practice solving linear equations",
      type: AssignmentType.HOMEWORK,
      status: AssignmentStatus.PUBLISHED,
      aiAssistance: AIAssistanceLevel.GUIDANCE,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      classId: classes[0].id,
      subjectId: mathSubject.id,
      topicId: linearTopic.id,
      createdById: teachers[0].id,
      schoolId: school.id,
      publishedAt: new Date(),
      questions: {
        create: questions.slice(0, 4).map((q, i) => ({
          questionId: q.id,
          orderIndex: i,
          points: 1,
        })),
      },
    },
  });

  const test = await prisma.assignment.create({
    data: {
      title: "Quadratic Equations Test",
      description: "Assessment on quadratic equations",
      type: AssignmentType.TEST,
      status: AssignmentStatus.PUBLISHED,
      aiAssistance: AIAssistanceLevel.HINTS_ONLY,
      timeLimitMinutes: 45,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      classId: classes[1].id,
      subjectId: mathSubject.id,
      topicId: quadraticTopic.id,
      createdById: teachers[1].id,
      schoolId: school.id,
      publishedAt: new Date(),
      questions: {
        create: questions.slice(3, 7).map((q, i) => ({
          questionId: q.id,
          orderIndex: i,
          points: 2,
        })),
      },
    },
  });

  // Submissions & Attempts
  for (let i = 0; i < 15; i++) {
    const student = students[i];
    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId: homework.id,
        studentId: student.id,
        status: i < 10 ? "GRADED" : "IN_PROGRESS",
        score: i < 10 ? Math.floor(Math.random() * 3) + 1 : null,
        maxScore: 4,
        submittedAt: i < 10 ? new Date() : null,
        timeSpentSeconds: Math.floor(Math.random() * 1800) + 300,
      },
    });

    for (let j = 0; j < Math.min(4, i < 10 ? 4 : 2); j++) {
      const isCorrect = Math.random() > 0.3;
      await prisma.questionAttempt.create({
        data: {
          questionId: questions[j].id,
          studentId: student.id,
          submissionId: submission.id,
          answer: { value: isCorrect ? [3, 7, 5, 0][j] : Math.floor(Math.random() * 10) },
          isCorrect,
          score: isCorrect ? 1 : 0,
          timeSpentSeconds: Math.floor(Math.random() * 120) + 30,
          helpRequests: Math.floor(Math.random() * 3),
        },
      });
    }
  }

  // Learning Profiles
  for (const student of students.slice(0, 20)) {
    for (const skill of [...linearTopic.skills, ...quadraticTopic.skills]) {
      const accuracy = Math.floor(Math.random() * 60) + 30;
      await prisma.learningProfile.create({
        data: {
          studentId: student.id,
          skillId: skill.id,
          masteryScore: accuracy,
          accuracy,
          attemptCount: Math.floor(Math.random() * 20) + 1,
          mistakeCount: Math.floor(Math.random() * 8),
          helpRequests: Math.floor(Math.random() * 5),
          averageTimeSeconds: Math.floor(Math.random() * 90) + 30,
          lastPracticed: new Date(),
          confidence: accuracy / 100,
          masteryLevel: accuracy >= 80 ? "STRONG" : accuracy >= 60 ? "GOOD" : accuracy >= 40 ? "NEEDS_PRACTICE" : "WEAK",
        },
      });
    }
  }

  // Mistakes
  for (let i = 0; i < 10; i++) {
    await prisma.mistake.create({
      data: {
        studentId: students[i].id,
        skillId: quadraticTopic.skills[2].id,
        mistakeType: "CALCULATION_ERROR",
        description: "Incorrect calculation of the discriminant",
        studentAnswer: { value: 4 },
        correctAnswer: { value: 0 },
        frequency: Math.floor(Math.random() * 3) + 1,
      },
    });
  }

  // AI Conversations
  for (let i = 0; i < 5; i++) {
    const conv = await prisma.aIConversation.create({
      data: {
        studentId: students[i].id,
        contextType: "LEARNING",
        subjectId: mathSubject.id,
        topicId: linearTopic.id,
        messages: {
          create: [
            { role: "user", content: "I don't understand how to solve this equation", helpLevel: "HINT" },
            { role: "assistant", content: "Look at the +4. What operation would undo adding 4?", helpLevel: "HINT" },
            { role: "user", content: "Subtract 4 from both sides?" },
            { role: "assistant", content: "Exactly! Now try it on both sides and see what you get." },
          ],
        },
      },
    });
  }

  // AI Interactions
  for (let i = 0; i < 20; i++) {
    await prisma.aIInteraction.create({
      data: {
        userId: students[i % students.length].id,
        type: i % 3 === 0 ? "AI_HELP" : i % 3 === 1 ? "AI_CHAT" : "AI_GENERATION",
        tokensUsed: Math.floor(Math.random() * 500) + 50,
        model: "mock",
      },
    });
  }

  // AI Insights
  await prisma.aIInsight.create({
    data: {
      targetType: "Class",
      targetId: classes[0].id,
      insightType: "WEAK_TOPIC",
      content: "18 of 26 students struggled with calculating the discriminant.",
      metadata: { strugglingCount: 18, totalStudents: 26 },
    },
  });

  // Integrity Flags
  await prisma.aIIntegrityFlag.create({
    data: {
      studentId: students[5].id,
      riskLevel: IntegrityRiskLevel.MEDIUM,
      riskScore: 0.35,
      indicators: [
        { type: "UNUSUAL_SPEED", description: "Completed test in unusually short time", weight: 0.2 },
        { type: "PERFECT_NO_HELP", description: "Perfect score without requesting help", weight: 0.15 },
      ],
    },
  });

  // Notifications
  for (let i = 0; i < 10; i++) {
    await prisma.notification.create({
      data: {
        userId: students[i].id,
        type: NotificationType.NEW_ASSIGNMENT,
        title: "New assignment published",
        message: `"${homework.title}" has been assigned to your class.`,
        link: `/student/assignments/${homework.id}`,
      },
    });
  }

  // Audit Logs
  const auditActions = ["LOGIN", "ASSIGNMENT_CREATED", "ASSIGNMENT_PUBLISHED", "USER_REGISTERED", "AI_GENERATION"];
  for (let i = 0; i < 15; i++) {
    await prisma.auditLog.create({
      data: {
        actorId: i % 2 === 0 ? teachers[0].id : students[i % students.length].id,
        action: auditActions[i % auditActions.length],
        targetType: "Assignment",
        schoolId: school.id,
        metadata: { seed: true },
      },
    });
  }

  // Learning Events
  for (const student of students.slice(0, 15)) {
    for (let d = 0; d < 7; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      await prisma.learningEvent.create({
        data: {
          studentId: student.id,
          eventType: "QUESTION_ATTEMPTED",
          skillId: linearTopic.skills[0].id,
          subjectId: mathSubject.id,
          durationSeconds: Math.floor(Math.random() * 600) + 60,
          createdAt: date,
        },
      });
    }
  }

  console.log("Seed completed successfully!");
  console.log("\nDemo accounts (password: Password123!):");
  console.log("  Super Admin: admin@didaktika.eu");
  console.log("  School Admin: admin@vilnius-gymnasium.lt");
  console.log("  Teacher: jonas.kazlauskas@vilnius-gymnasium.lt");
  console.log("  Student: student1@vilnius-gymnasium.lt");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
